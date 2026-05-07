# MLOps Studio - Deployment Guide

## Local Development with Docker Compose

### Start All Services

```bash
docker-compose up -d
```

This starts:
- Frontend (Vite dev server) on port 3000
- Backend (Express) on port 5000
- PostgreSQL on port 5432
- MLflow on port 5001
- LocalStack (mock AWS) on port 4566

### Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MLflow**: http://localhost:5001
- **Database**: localhost:5432 (postgres/password)

## Production Deployment (AWS)

### Phase 1: Infrastructure

```bash
cd infra

# Initialize with S3 backend
terraform init

# Create dev environment first
terraform apply -var-file="environments/dev.tfvars"

# Then staging
terraform apply -var-file="environments/staging.tfvars"

# Finally production
terraform apply -var-file="environments/prod.tfvars"
```

### Phase 2: Backend Deployment

```bash
cd backend

# Build image
docker build -t mlops-backend:$(git rev-parse --short HEAD) .

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin ${ECR_REPO}
docker push ${ECR_REPO}/mlops-backend:$(git rev-parse --short HEAD)

# Deploy via GitHub Actions (automatic on main push)
# Or manual deployment:
aws ecs update-service \
  --cluster mlops-prod \
  --service mlops-backend-service \
  --force-new-deployment
```

### Phase 3: Frontend Deployment

#### Option 1: S3 + CloudFront

```bash
cd frontend

npm install
npm run build

# Upload to S3
aws s3 sync dist/ s3://mlops-frontend-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"
```

#### Option 2: Deploy as Container to ECS

```bash
# Build
docker build -f Dockerfile.prod -t mlops-frontend:latest .

# Push
docker push ${ECR_REPO}/mlops-frontend:latest

# Deploy
aws ecs update-service \
  --cluster mlops-prod \
  --service mlops-frontend-service \
  --force-new-deployment
```

### Phase 4: Model Registry (MLflow)

```bash
cd model-registry

# Build and push
docker build -t mlops-mlflow:latest .
docker push ${ECR_REPO}/mlops-mlflow:latest

# Deploy ECS task definition
aws ecs register-task-definition \
  --cli-input-json file://mlflow-task-def.json

# Create service or update
aws ecs create-service \
  --cluster mlops-prod \
  --service-name mlops-mlflow \
  --task-definition mlops-mlflow:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --load-balancers targetGroupArn=${TARGET_GROUP_ARN},containerName=mlflow,containerPort=5000 \
  --network-configuration awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}
```

## CI/CD Pipeline

### GitHub Actions Workflows

All workflows are in `.github/workflows/`

#### 1. Pipeline Validation (on PR)

```yaml
- Validates pipeline YAML/JSON
- Runs tests
- Checks locked node enforcement
- Comments on PR with results
```

#### 2. Deploy to Dev (on main merge)

```yaml
- Builds Docker images
- Pushes to ECR
- Updates ECS service
- Runs smoke tests
- Notifies Slack
```

#### 3. Promote to Staging (manual trigger)

```yaml
- Requires 1 approval
- Canary deployment (10% traffic)
- Monitors error rates
- Auto-rollback on failures
```

#### 4. Promote to Production (manual trigger)

```yaml
- Requires 2+ approvals
- Blue-green deployment
- Monitors metrics for 5 minutes
- Automatic rollback on errors
- Updates GitHub deployment status
```

## Monitoring & Alerting

### CloudWatch Dashboards

```bash
# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name mlops-prod \
  --dashboard-body file://dashboards/mlops-prod.json
```

### Key Metrics to Monitor

1. **Inference Metrics**
   - Latency (p50, p99)
   - Error rate
   - Throughput

2. **Model Metrics**
   - Accuracy
   - Data drift
   - Concept drift
   - Prediction drift

3. **Infrastructure Metrics**
   - ECS CPU/Memory
   - RDS connections
   - Network I/O
   - ALB target health

### Alerting

```bash
# Create SNS topic
aws sns create-topic --name mlops-alerts

# Subscribe to topic
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789012:mlops-alerts \
  --protocol email \
  --notification-endpoint your-email@org.com

# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name mlops-high-latency \
  --alarm-description "Alert when inference latency is high" \
  --metric-name InferenceLatency \
  --namespace MLOps \
  --statistic Average \
  --period 300 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:mlops-alerts
```

## Scaling & Performance

### Auto-Scaling Configuration

```bash
# Target tracking for CPU
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/mlops-prod/mlops-inference \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

### Caching Strategy

1. **CloudFront** for static assets
2. **ElastiCache** for model feature caching (optional)
3. **S3 versioning** for model artifacts

## Backup & Recovery

### RDS Backups

```bash
# Automatic backups enabled (7 days retention in dev, 30 in prod)
# Enable backup replication to another region
aws rds modify-db-instance \
  --db-instance-identifier mlops-db-prod \
  --backup-retention-period 30 \
  --copy-tags-to-snapshot
```

### S3 Versioning & Lifecycle

```bash
# Enable versioning (already done by Terraform)
aws s3api put-bucket-versioning \
  --bucket mlops-models-prod \
  --versioning-configuration Status=Enabled

# Set lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket mlops-models-prod \
  --lifecycle-configuration file://lifecycle.json
```

### Disaster Recovery

```bash
# Cross-region replication
aws s3api put-bucket-replication \
  --bucket mlops-models-prod \
  --replication-configuration file://replication.json

# RDS snapshots to another region
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier mlops-db-prod-snapshot \
  --target-db-snapshot-identifier mlops-db-prod-snapshot-backup \
  --source-region us-east-1 \
  --destination-region us-west-2
```

## Cost Optimization

### Development Cost Reduction

```bash
# Schedule shutdown after hours
aws autoscaling update-auto-scaling-group \
  --auto-scaling-group-name mlops-dev-asg \
  --min-size 0 \
  --desired-capacity 0 \
  # Run via AWS Lambda scheduled event at 6 PM

# Use t3.micro RDS in dev
# 1 desired ECS task in dev
# Lifecycle policies on S3
```

### Production Cost Control

```bash
# Set ALB idle timeout
aws elbv2 modify-load-balancer-attributes \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --attributes Key=idle_timeout.connection_termination.enabled,Value=true

# Enable VPC Flow Logs for network optimization
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-xxx \
  --traffic-type ALL \
  --log-destination-type cloud-watch-logs
```

## Security Hardening

### Network Security

```bash
# Restrict RDS access
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 5432 \
  --source-security-group-id sg-yyy

# Enable VPC Flow Logs
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-xxx \
  --traffic-type REJECT \
  --log-destination-type cloud-watch-logs
```

### Data Encryption

```bash
# Enable RDS encryption (already done)
# Enable S3 encryption (already done)

# Enable ECS Fargate launch type default encryption
# Enable CloudWatch Logs encryption
aws logs associate-kms-key \
  --log-group-name /ecs/mlops-prod \
  --kms-key-id arn:aws:kms:us-east-1:123456789012:key/xxxxx
```

### IAM Hardening

```bash
# Remove default credentials
aws iam delete-access-key --access-key-id AKIAIOSFODNN7EXAMPLE

# Enable MFA
aws iam enable-mfa-device --user-name alice --serial-number arn:aws:iam::123456789012:mfa/alice

# Create service-specific roles with minimal permissions
# (Already done in Terraform)
```

## Rollback Procedures

### Backend Rollback

```bash
# Via ECS
aws ecs update-service \
  --cluster mlops-prod \
  --service mlops-backend-service \
  --task-definition mlops-backend:5 \
  --force-new-deployment

# Or via GitHub Actions (revert commit and push)
```

### Model Rollback

```bash
# Via MLflow (transition to previous version)
curl -X POST http://mlflow-uri/api/2.0/mlflow/model-registry/model-versions/transition-stage \
  -H "Content-Type: application/json" \
  -d '{
    "name": "sales-forecaster",
    "version": "1.0.0",
    "stage": "Production"
  }'

# Or via ECS task definition rollback
aws ecs update-service \
  --cluster mlops-prod \
  --service mlops-inference \
  --task-definition mlops-inference:4
```

---

**Related**: See [SETUP.md](SETUP.md) for initial setup and [ARCHITECTURE.md](ARCHITECTURE.md) for system overview.
