# MLOps Studio - System Architecture

## Overview

MLOps Studio is an enterprise-grade, AWS-backed, GitHub-native MLOps platform. It is designed to manage the complete lifecycle of pre-trained machine learning models in production, with zero dependency on Kubernetes or in-house container orchestration.

```
┌──────────────────────────────────────────────────────────────────┐
│                          GitHub                                   │
│  (System of Record: Code, Pipelines, Deployment Configs)        │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     GitHub Actions (CI/CD)                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │ Validation       │  │ Deploy to Dev    │  │ Approval     │   │
│  │ - Lint           │  │ - Build image    │  │ Gates        │   │
│  │ - Test           │  │ - Push to ECR    │  │ - Multi-auth │   │
│  │ - Lock nodes     │  │ - Deploy ECS     │  │ - Audit      │   │
│  └──────────────────┘  └──────────────────┘  └──────────────┘   │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│                       AWS Services                                │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    VPC & Networking                     │    │
│  │  (Dev, Staging, Prod environments with separate AZs)   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │     ECR      │  │  Step        │  │   ECS        │           │
│  │  (Container  │  │  Functions   │  │  (Fargate)   │           │
│  │  Registry)   │  │  (Pipeline   │  │  (Compute)   │           │
│  │              │  │  Orchestr.)  │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │      S3      │  │  RDS         │  │ Secrets      │           │
│  │  (Artifacts, │  │ (Metadata,   │  │ Manager      │           │
│  │   Models,    │  │  Registry,   │  │ (Secrets)    │           │
│  │   Data)      │  │  Audit)      │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐        │
│  │  CloudWatch (Logs, Metrics, Alarms)                 │        │
│  │  - Application logs                                  │        │
│  │  - Drift metrics                                     │        │
│  │  - Infrastructure metrics                            │        │
│  └──────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (React + TypeScript)
- **Location**: `frontend/`
- **Purpose**: Web UI for all users
- **Key Pages**:
  - Dashboard: System KPIs and alerts
  - Projects: Model project management
  - Pipelines: Visual DAG builder with node locking
  - Monitoring: Drift detection and metrics
  - CI/CD: Pipeline run history and approvals
  - Integrations: GitHub and AWS connectivity
  - Admin: User management and RBAC

### 2. Backend API (Express.js + TypeScript)
- **Location**: `backend/`
- **Purpose**: REST API for all operations
- **Key Features**:
  - Project management
  - Pipeline orchestration
  - Model registry integration
  - Deployment management
  - Monitoring and alerts
  - GitHub integrations
  - Immutable audit logging

### 3. Infrastructure as Code (Terraform)
- **Location**: `infra/`
- **AWS Resources**:
  - VPC with public/private subnets across 2 AZs
  - RDS PostgreSQL for metadata and audit logs
  - ECR repositories for container images
  - ECS Fargate clusters for serverless compute
  - S3 buckets for data, models, and artifacts
  - ALB for load balancing
  - IAM roles and policies
  - CloudWatch for monitoring

### 4. Model Registry (MLflow)
- **Location**: `model-registry/`
- **Purpose**: Register and manage pre-trained models
- **Deployment**: ECS Fargate service
- **Backend**: S3 (artifacts) + RDS (metadata)

### 5. Model Serving (Inference)
- **Location**: `model-serving/`
- **Purpose**: Real-time and batch inference
- **Deployment**: ECS Fargate tasks
- **API Endpoints**:
  - `/predict` - Single prediction
  - `/batch-predict` - Batch predictions
  - `/metrics` - Prometheus metrics

### 6. Monitoring & Drift Detection
- **Location**: `monitoring/`
- **Purpose**: Continuous model monitoring
- **Capabilities**:
  - Data drift detection (KS test)
  - Concept drift detection (accuracy degradation)
  - Prediction drift detection (distribution shift)
  - CloudWatch metrics publishing
  - Alert triggering

### 7. CI/CD Pipelines
- **Location**: `cicd/`
- **Workflows**:
  - `pipeline-validation.yml` - Validates on PR
  - `deploy-to-dev.yml` - Auto-deploys on merge
  - `promote-to-prod.yml` - Manual promotion with approvals

## Canonical Pipeline (8 Stages)

All pipelines follow this standard structure, executed via AWS Step Functions:

```
Data Ingestion
    ↓
Data Preparation
    ↓
Feature Store Creation
    ↓
Model Registry
    ↓
Model Deployment
    ├─→ Real-time Inference (parallel)
    └─→ Batch Inference (parallel)
    ↓
Model Monitoring
    ↓
CI/CD Enforcement
```

Each stage:
- Runs in its own ECS Fargate task
- Has automatic retry logic
- Publishes metrics to CloudWatch
- Logs to CloudWatch Logs
- Can be locked for CI/CD enforcement

## Environment Separation

Three isolated environments with promotion gates:

### Development
- **Purpose**: Testing and development
- **Resources**: Single AZ, t3.micro RDS
- **ECS Tasks**: 1 desired count
- **Approvals**: None
- **Auto-destruction**: Enabled for cost optimization

### Staging
- **Purpose**: Integration testing before production
- **Resources**: Multi-AZ, t3.small RDS
- **ECS Tasks**: 2 desired count
- **Approvals**: 1 required
- **Canary Deployment**: 10% traffic initially

### Production
- **Purpose**: Live serving
- **Resources**: Multi-AZ, db.t3.medium RDS
- **ECS Tasks**: 3 desired count (auto-scales to 10)
- **Approvals**: 2 required (multi-person)
- **Blue-Green Deployment**: Full traffic shift after validation

## Data Flow

```
GitHub Repo
  ↓
Code/Config Change
  ↓
GitHub Actions
  ├─→ Validate (Lint, Test, Check Locks)
  ├─→ Build (Docker image → ECR)
  └─→ Deploy (ECS update → CloudWatch logs)
  ↓
AWS Step Functions
  ├─→ ECS Task 1 (Data Ingestion) → S3
  ├─→ ECS Task 2 (Preparation) → S3
  ├─→ ECS Task 3 (Features) → S3 + MLflow
  ├─→ ECS Task 4 (Registry) → MLflow + RDS
  ├─→ ECS Task 5 (Deployment) → ECR → ECS Service
  ├─→ ECS Task 6 (Inference) → CloudWatch metrics
  ├─→ ECS Task 7 (Monitoring) → CloudWatch
  └─→ ECS Task 8 (CI/CD Enforcement) → GitHub
  ↓
RDS (Metadata, Audit Logs)
S3 (Data, Models, Artifacts)
CloudWatch (Logs, Metrics, Alarms)
```

## Role-Based Access Control (RBAC)

| Role | Create | Deploy Dev | Deploy Staging | Deploy Prod | Approve | Admin |
|------|--------|-----------|---------------|------------|---------|-------|
| ML Engineer | ✓ | ✓ | - | - | - | - |
| Data Engineer | ✓ | ✓ | - | - | - | - |
| Production Team | - | - | ✓ | - | ✓ | - |
| Monitoring Team | - | - | - | - | - | ✓ (alerts) |
| Model Sponsor | - | - | - | - | ✓ | - |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Security

- **Network**: VPC with private subnets, NAT gateways
- **Encryption**: TLS in transit, AES-256 at rest
- **Secrets**: AWS Secrets Manager with RDS credentials
- **IAM**: Least-privilege roles per service
- **Audit**: Immutable logs in RDS + CloudTrail
- **GitHub**: OIDC federation (no long-lived credentials)

## Deployment Strategies

### Dev
- **Strategy**: Direct deployment
- **Validation**: Smoke tests
- **Rollback**: Manual

### Staging
- **Strategy**: Rolling update
- **Validation**: Integration tests + Canary (10%)
- **Rollback**: Automatic on 5% error rate

### Production
- **Strategy**: Blue-Green (zero-downtime)
- **Validation**: Health checks + Metrics analysis
- **Rollback**: Automatic shift back to Blue on failure
- **Approval**: 2+ reviewers required

## Cost Optimization

- Fargate auto-scaling: 1-3 tasks (dev), 3-10 (prod)
- RDS: Multi-AZ only in production
- S3: Lifecycle policies for old data
- Development: Auto-shutdown after hours
- Spot instances: Available for batch jobs

## Monitoring & Observability

### CloudWatch Dashboards
- Model inference latency (p50, p99)
- Inference error rates
- Data drift scores
- Pipeline execution duration
- API endpoint health

### Alarms
- Drift detected > 10%
- Inference latency p99 > 100ms
- Error rate > 1%
- RDS CPU > 80%
- ECS task failure

### Logs
- All ECS task logs to CloudWatch Logs
- Lambda function logs
- GitHub Actions logs (via webhook)
- Audit logs in RDS

---

**Next**: See [SETUP.md](SETUP.md) for AWS infrastructure setup and [API.md](API.md) for backend API documentation.
