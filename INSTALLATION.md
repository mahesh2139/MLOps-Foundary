# MLOps Studio - Installation & Setup Guide

Complete step-by-step guide to set up MLOps Studio locally or on AWS.

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [AWS Cloud Deployment](#aws-cloud-deployment)
3. [Configuration](#configuration)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

- **Operating System**: macOS, Linux, or Windows (with WSL2)
- **Docker**: v20.10+ with Docker Compose v2.0+
- **Node.js**: v18+ with npm v9+
- **PostgreSQL Client**: For database management
- **Git**: For version control
- **4GB RAM** minimum, 8GB recommended
- **10GB disk space** for containers and data

### Step 1: Install Dependencies

#### On Windows (PowerShell as Admin)
```powershell
# Check Docker
docker --version
docker-compose --version

# Check Node.js
node --version
npm --version

# Install if missing:
# - Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
# - Node.js: https://nodejs.org/ (v18+)
```

#### On macOS
```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install docker docker-compose node postgresql

# Start Docker daemon
open /Applications/Docker.app
```

#### On Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose nodejs postgresql-client git

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Clone/Copy the Repository

```bash
# Navigate to the project
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
```

### Step 3: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional for local dev)
# Local defaults:
# - DATABASE_URL=postgresql://postgres:password@db:5432/mlopsdb
# - JWT_SECRET=dev-secret-key
# - NODE_ENV=development
```

### Step 4: Install Dependencies

```bash
# Install root-level dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 5: Start Services

```bash
# Option A: Using Docker Compose (recommended)
docker-compose up -d

# Wait for services to start (30-60 seconds)
sleep 30

# Check service status
docker-compose ps

# Option B: Manual startup
# Terminal 1: Database
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine

# Terminal 2: MLflow
docker run -d \
  --name mlflow \
  -p 5001:5000 \
  ghcr.io/mlflow/mlflow

# Terminal 3: Backend
cd backend && npm run dev

# Terminal 4: Frontend
cd frontend && npm run dev
```

### Step 6: Initialize Database

```bash
# Run schema initialization
bash scripts/init-db.sh

# Verify database
psql -h localhost -U postgres -d mlopsdb -c "\dt"
```

### Step 7: Verify Installation

```bash
# Run health checks
bash scripts/health-check.sh

# Expected output:
# ✓ Backend (http://localhost:5000)
# ✓ Frontend (http://localhost:3000)
# ✓ Database (postgresql://localhost:5432)
# ✓ MLflow (http://localhost:5001)
```

### Step 8: Access the Platform

Open in your browser:

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Any user (dev mode) |
| Backend API | http://localhost:5000/api | JWT token required |
| MLflow | http://localhost:5001 | No auth required |
| Database | localhost:5432 | postgres/password |

---

## AWS Cloud Deployment

### Prerequisites

- **AWS Account** with appropriate service quotas:
  - ECS: 4+ tasks
  - RDS: 1 instance
  - ECR: 3 repositories
  - S3: 4 buckets
  - CloudWatch: logs & metrics
- **AWS CLI**: v2.13+ configured with credentials
- **Terraform**: v1.0+ installed
- **IAM Permissions**: For ECS, RDS, ECR, S3, IAM, VPC

### Step 1: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Enter when prompted:
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### Step 2: Prepare Terraform Backend

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://mlops-studio-terraform-state-$(date +%s) --region us-east-1

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Note the bucket name and table name for next step
```

### Step 3: Configure Terraform

```bash
cd infra

# Copy variables template
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
# Replace placeholders:
# - aws_region: us-east-1 (or your region)
# - environment: dev
# - vpc_cidr: 10.0.0.0/16
# - db_instance_type: db.t3.micro
# - terraform_backend_bucket: [your-bucket-name]
# - terraform_backend_table: terraform-locks
```

### Step 4: Initialize Terraform

```bash
cd infra

# Initialize Terraform
terraform init

# Review planned changes
terraform plan -out=tfplan

# Apply configuration (takes 10-15 minutes)
terraform apply tfplan

# Note the outputs:
# - alb_dns_name: Your application endpoint
# - rds_endpoint: Database endpoint
# - ecr_repository_urls: Container registry URLs
```

### Step 5: Build and Push Docker Images

```bash
# Configure AWS credentials for Docker
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# Get ECR repository URLs from Terraform outputs
BACKEND_ECR=$(terraform output -raw backend_ecr_url)
MLFLOW_ECR=$(terraform output -raw mlflow_ecr_url)

# Build backend image
cd ../backend
docker build -t $BACKEND_ECR:latest .
docker push $BACKEND_ECR:latest

# Build MLflow image
cd ../model-registry
docker build -t $MLFLOW_ECR:latest -f Dockerfile .
docker push $MLFLOW_ECR:latest

cd ../..
```

### Step 6: Deploy Application

```bash
# Get ALB DNS name
ALB_DNS=$(terraform -chdir=infra output -raw alb_dns_name)

# Deploy backend service (updates ECS)
aws ecs update-service \
  --cluster mlops-studio-cluster \
  --service backend \
  --force-new-deployment

# Wait for deployment
aws ecs wait services-stable \
  --cluster mlops-studio-cluster \
  --services backend

# Access application
echo "Application available at: http://$ALB_DNS"
```

### Step 7: Configure GitHub Integration

```bash
# Create GitHub OAuth Application
# 1. Go to https://github.com/settings/developers
# 2. New OAuth App
# 3. Set Authorization callback URL: http://$ALB_DNS/api/auth/github/callback
# 4. Copy Client ID and Client Secret

# Update RDS secrets
aws secretsmanager create-secret \
  --name mlops/github-oauth \
  --secret-string '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'

# Update backend environment
aws ecs update-service \
  --cluster mlops-studio-cluster \
  --service backend \
  --force-new-deployment
```

### Step 8: Configure CloudWatch Monitoring

```bash
# Create SNS topic for alerts
aws sns create-topic --name mlops-studio-alerts

# Subscribe to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789:mlops-studio-alerts \
  --protocol email \
  --notification-endpoint your-email@company.com

# Create CloudWatch alarms
# (Already configured in terraform/step-functions.tf)

# View logs
aws logs tail /ecs/mlops-studio --follow
```

---

## Configuration

### Environment Variables

#### Backend (.env or ECS task definition)

```bash
# Application
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:pass@rds.amazonaws.com:5432/mlopsdb
DATABASE_POOL_SIZE=20
DATABASE_SSL=true

# Authentication
JWT_SECRET=your-secure-secret-key
JWT_EXPIRY=24h
GITHUB_OAUTH_CLIENT_ID=your-client-id
GITHUB_OAUTH_CLIENT_SECRET=your-client-secret

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=mlops-studio-data
AWS_ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com

# MLflow
MLFLOW_TRACKING_URI=http://mlflow:5001
MLFLOW_BACKEND_STORE_URI=postgresql://...
MLFLOW_ARTIFACT_ROOT=s3://mlops-studio-models

# Monitoring
CLOUDWATCH_LOG_GROUP=/ecs/mlops-studio
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

#### Frontend (.env.local)

```bash
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=30000
VITE_LOG_LEVEL=debug
VITE_THEME=dark
```

### Terraform Variables

```hcl
# infra/terraform.tfvars

aws_region = "us-east-1"
environment = "dev"
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# ECS Configuration
ecs_cpu = 512
ecs_memory = 1024
ecs_desired_count = 2
ecs_min_tasks = 2
ecs_max_tasks = 4

# RDS Configuration
db_instance_type = "db.t3.micro"
db_storage_gb = 20
db_backup_retention_days = 7
db_multi_az = false

# Tags
tags = {
  Project = "MLOps Studio"
  Team = "Data Science"
  CostCenter = "DS-001"
}
```

---

## Verification

### Health Checks

```bash
# Backend API
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000

# Database
psql -h localhost -U postgres -d mlopsdb -c "SELECT VERSION();"

# MLflow
curl http://localhost:5001/api/2.0/health/status

# Run comprehensive check
bash scripts/health-check.sh
```

### API Testing

```bash
# Run test suite
bash scripts/test-api.sh

# Manual test: Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Verification test"
  }'

# Expected response: 201 Created with project ID
```

### Database Verification

```bash
# Connect to database
psql -h localhost -U postgres -d mlopsdb

# List tables
\dt

# Check projects table
SELECT id, name, status FROM projects LIMIT 5;

# Exit
\q
```

---

## Troubleshooting

### Common Issues

#### 1. "Port already in use"
```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :3000  # Frontend

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

#### 2. "Connection refused" to database
```bash
# Check if postgres container is running
docker ps | grep postgres

# View logs
docker logs postgres

# Restart service
docker-compose restart db
```

#### 3. "Insufficient AWS quota"
```bash
# Check current usage
aws service-quotas list-service-quotas --service-code ecs

# Request quota increase via AWS Console
# Settings → Service Quotas → Search service → Request quota increase
```

#### 4. "Terraform state lock timeout"
```bash
# Check lock
aws dynamodb get-item \
  --table-name terraform-locks \
  --key '{"LockID":{"S":"mlops-studio"}}'

# Force unlock (use with caution)
aws dynamodb delete-item \
  --table-name terraform-locks \
  --key '{"LockID":{"S":"mlops-studio"}}'
```

#### 5. "Authentication failed"
```bash
# Regenerate JWT secret
openssl rand -base64 32

# Update environment
export JWT_SECRET=<new-secret>

# Restart backend
docker-compose restart backend
```

### Logs and Debugging

```bash
# View Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker logs postgres

# View AWS logs
aws logs tail /ecs/mlops-studio --follow

# View Terraform logs
export TF_LOG=DEBUG
terraform apply
```

### Reset Everything

```bash
# Local development
docker-compose down -v  # Remove volumes
docker system prune
rm -rf backend/node_modules frontend/node_modules

# AWS deployment
cd infra
terraform destroy
# Manually delete: S3 buckets, RDS snapshots, CloudWatch logs
```

---

## Performance Tuning

### Database
```sql
-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;

-- Create indexes for common queries
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_pipelines_project_id ON pipelines(project_id);
```

### Application
- Set `CONNECTION_POOL_SIZE=20` for database
- Configure `NODE_ENV=production`
- Enable gzip compression in nginx
- Use CloudFront CDN for frontend

### Infrastructure
- Enable RDS read replicas for read-heavy workloads
- Configure auto-scaling based on CPU/memory metrics
- Use S3 Transfer Acceleration for faster uploads
- Enable VPC caching for NAT gateway traffic

---

## Security Hardening

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret --name mlops/jwt-secret
aws secretsmanager create-secret --name mlops/db-password

# Enable RDS encryption
aws rds modify-db-instance \
  --db-instance-identifier mlops-studio \
  --storage-encrypted \
  --apply-immediately

# Enable S3 block public access
aws s3api put-bucket-public-access-block \
  --bucket mlops-studio-data \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Update IAM policies to least privilege
# Review and restrict: ec2:*, s3:*, iam:* permissions
```

---

## Cost Optimization

### Estimated Monthly Costs (us-east-1)

| Service | Tier | Cost |
|---------|------|------|
| ECS Fargate | 2-4 tasks @ 512 CPU/1GB | $30-60 |
| RDS | db.t3.micro | $15-25 |
| S3 | <100GB storage | $2-5 |
| CloudWatch | Logs + metrics | $10-20 |
| Data Transfer | <1TB/month | $0-5 |
| **Total** | **Dev environment** | **~$60-100** |

### Cost Reduction Tips

- Use spot instances for non-prod environments
- Reduce RDS instance size (db.t3.micro minimum)
- Set data lifecycle policies (30-day S3 archival)
- Use CloudWatch log retention (7-14 days)

---

## Next Steps

1. ✅ Complete local setup or AWS deployment
2. ✅ Run health checks and verify services
3. ✅ Create first project in dashboard
4. ✅ Register first model and test promotion workflow
5. ✅ Configure GitHub Actions for CI/CD
6. ✅ Set up monitoring and alerts

**Refer to [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design**

**Get started with [QUICKSTART.md](QUICKSTART.md) for immediate testing**
