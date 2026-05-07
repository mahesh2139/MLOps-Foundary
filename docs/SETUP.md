# MLOps Studio - Setup Guide

## Prerequisites

- AWS Account with admin access
- GitHub Organization and repository
- Node.js 16+ and Python 3.9+
- Terraform 1.0+
- AWS CLI v2
- Docker (for local development)

## Step 1: Clone & Configure Repository

```bash
git clone https://github.com/your-org/mlops-studio.git
cd mlops-studio

# Create .env files
cp .env.example .env
```

## Step 2: Set Up AWS Credentials

### Using AWS CLI

```bash
aws configure
# Enter:
# AWS Access Key ID: ***
# AWS Secret Access Key: ***
# Default region: us-east-1
# Default output format: json
```

### Using GitHub OIDC (Recommended)

```bash
# Create OIDC Provider in AWS
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com

# Get the provider ARN from output
# Use it in Terraform variables
```

## Step 3: Deploy AWS Infrastructure

### Initialize Terraform

```bash
cd infra

# Create S3 bucket for terraform state
aws s3 mb s3://mlops-studio-terraform-state-$(aws sts get-caller-identity --query Account --output text)

# Initialize Terraform
terraform init
```

### Plan & Apply

```bash
# Copy terraform.tfvars.example
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
cat > terraform.tfvars << EOF
aws_region                 = "us-east-1"
environment                = "dev"
vpc_cidr                   = "10.0.0.0/16"
ecs_task_cpu               = 256
ecs_task_memory            = 512
rds_instance_class         = "db.t3.micro"
rds_allocated_storage      = 20
github_org                 = "your-org"
github_oidc_provider_arn   = "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
EOF

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan
```

### Capture Outputs

```bash
# Save outputs for later use
terraform output -json > outputs.json

# Key outputs to note:
# - alb_dns_name: Load balancer endpoint
# - rds_endpoint: Database endpoint
# - ecr_backend_url: Backend image repository
# - s3_data_bucket: Data storage bucket
# - s3_models_bucket: Model storage bucket
```

## Step 4: Deploy Backend

### Build and Push Container

```bash
cd ../backend

# Build Docker image
docker build -t mlops-backend:latest .

# Tag for ECR
ECR_URL=$(terraform output -raw ecr_backend_url)
docker tag mlops-backend:latest ${ECR_URL}:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ECR_URL}
docker push ${ECR_URL}:latest
```

### Deploy to ECS

```bash
# Update ECS task definition and service
aws ecs update-service \
  --cluster mlops-dev \
  --service mlops-backend-service \
  --force-new-deployment \
  --region us-east-1

# Wait for deployment
aws ecs wait services-stable \
  --cluster mlops-dev \
  --services mlops-backend-service \
  --region us-east-1
```

## Step 5: Deploy Frontend

### Build Static Assets

```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Output in dist/
```

### Deploy to S3 + CloudFront (Optional)

```bash
# Create S3 bucket for frontend
aws s3 mb s3://mlops-studio-frontend-${ACCOUNT_ID}

# Upload build artifacts
aws s3 sync dist/ s3://mlops-studio-frontend-${ACCOUNT_ID}/

# Create CloudFront distribution (or use ALB)
```

## Step 6: Configure GitHub Integrations

### Set Up GitHub Actions Secrets

```bash
# Get outputs from Terraform
cd infra
ALB_DNS=$(terraform output -raw alb_dns_name)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Add to GitHub Secrets (Settings → Secrets)
# Go to https://github.com/your-org/mlops-studio/settings/secrets/actions
```

### Add secrets:

```
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1
MLOPS_BACKEND_URL=http://alb-dns-name.elb.amazonaws.com
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK
```

### Enable OIDC for GitHub Actions

```bash
# GitHub automatically handles OIDC with AWS
# Just ensure the trust relationship is set up in IAM
aws iam get-role --role-name mlops-studio-github-actions-role
```

## Step 7: Deploy Model Registry (MLflow)

### Build MLflow Container

```bash
cd model-registry

# Build and push
docker build -t mlops-mlflow:latest .
docker tag mlops-mlflow:latest ${ECR_URL}/mlops-mlflow:latest
docker push ${ECR_URL}/mlops-mlflow:latest
```

### Deploy as ECS Service

```bash
# Create task definition and service (using Terraform or AWS CLI)
aws ecs create-service \
  --cluster mlops-dev \
  --service-name mlops-mlflow \
  --task-definition mlops-mlflow \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}" \
  --region us-east-1
```

## Step 8: Create RDS Database

### Initialize Database Schema

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
DB_NAME=$(terraform output -raw rds_database_name)

# Connect to RDS
PGPASSWORD=your_password psql -h ${RDS_ENDPOINT} -U mlopsadmin -d ${DB_NAME}

# Run migrations
\c mlopsdb;
\i infra/migrations/001_init.sql
```

## Step 9: Verify Deployment

### Check Backend Health

```bash
ALB_DNS=$(terraform output -raw alb_dns_name)
curl http://${ALB_DNS}/health
# Expected: {"status":"healthy"}
```

### Test API Endpoints

```bash
# List projects
curl http://${ALB_DNS}/api/projects

# Create project
curl -X POST http://${ALB_DNS}/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"test","owner":"admin"}'
```

### Check CloudWatch Logs

```bash
aws logs tail /ecs/mlops-studio-dev --follow
```

## Step 10: Local Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:5173
```

### Backend Development

```bash
cd backend
npm install
npm run dev
# Starts on http://localhost:5000
```

## Step 11: Deploy First Pipeline

### Create Pipeline YAML

```bash
cat > pipelines/first-pipeline.json << 'EOF'
{
  "name": "Data to Deployment",
  "nodes": [
    {"id": "1", "name": "Data Ingestion", "type": "input"},
    {"id": "2", "name": "Data Preparation", "type": "process"},
    {"id": "3", "name": "Feature Store", "type": "process"},
    {"id": "4", "name": "Model Registry", "type": "process", "locked": true},
    {"id": "5", "name": "Model Deployment", "type": "output"}
  ],
  "lockedNodes": ["4"]
}
EOF

git add pipelines/
git commit -m "Add first pipeline"
git push origin main
```

### Trigger via API

```bash
curl -X POST http://${ALB_DNS}/api/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-1",
    "name": "first-pipeline",
    "nodes": [...]
  }'
```

## Troubleshooting

### ECS Tasks Not Starting

```bash
# Check task definition
aws ecs describe-task-definition --task-definition mlops-backend

# Check service events
aws ecs describe-services \
  --cluster mlops-dev \
  --services mlops-backend-service \
  --query 'services[0].events'
```

### RDS Connection Issues

```bash
# Test connectivity
psql -h ${RDS_ENDPOINT} -U mlopsadmin -d mlopsdb

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxx
```

### GitHub Actions Failures

```bash
# Check workflow logs
# Go to https://github.com/your-org/mlops-studio/actions
# Click on failed workflow run
```

## Cleanup

### Destroy Infrastructure

```bash
cd infra
terraform destroy
```

### Remove GitHub Secrets

Go to Settings → Secrets → Delete each secret

### Delete S3 Buckets (if not needed)

```bash
aws s3 rm s3://mlops-studio-data-dev-${ACCOUNT_ID} --recursive
aws s3 rm s3://mlops-studio-models-dev-${ACCOUNT_ID} --recursive
aws s3 rm s3://mlops-studio-artifacts-dev-${ACCOUNT_ID} --recursive
```

---

**Next**: See [PIPELINES.md](PIPELINES.md) for pipeline configuration and [API.md](API.md) for API documentation.
