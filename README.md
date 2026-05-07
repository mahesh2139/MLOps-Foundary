# MLOps Studio

**Enterprise-Grade, AWS-Backed, GitHub-Native Model Operations Platform**

## Overview

MLOps Studio is a pipeline-first MLOps platform designed for production ML operations. It focuses on deployment, CI/CD, monitoring, and governance of pre-trained models without requiring in-house Kubernetes or Docker infrastructure.

### Key Capabilities

- ✅ **Pipeline-First Architecture** - Visual DAG builder with 8 canonical stages
- ✅ **GitHub as System of Record** - All code, configs, and definitions in GitHub
- ✅ **AWS-Managed Compute** - ECS Fargate, Step Functions, no K8s required
- ✅ **Role-Based Access Control** - Multiple personas with approval workflows
- ✅ **Model Registry** - MLflow-based with promotion stages (dev → staging → prod)
- ✅ **Container-Based Deployment** - ECR + ECS for real-time and batch inference
- ✅ **Comprehensive Monitoring** - Data drift, concept drift, system health
- ✅ **CI/CD Enforcement** - GitHub Actions with locked pipeline nodes
- ✅ **Immutable Audit Logs** - Full traceability for compliance

---

## Primary Users & Roles

| Role | Responsibilities |
|------|------------------|
| **ML Engineers** | Define pipelines, register models, create features |
| **Data Team** | Data ingestion, preparation, feature definitions |
| **Model Production Team** | Deployment, rollback, version management |
| **Monitoring Team** | Drift detection, alerts, performance tracking |
| **Model Sponsors** | Dashboard access (read-only) |
| **Admins** | Access control, integrations, approvals |

---

## Canonical Pipeline Stages

Each pipeline consists of 8 stages (nodes), each with versioned outputs and GitHub backing:

1. **Data Ingestion** - Ingest data from sources
2. **Data Preparation** - Clean, validate, transform
3. **Feature Store Creation** - Compute and store features
4. **Model Registry** - Register pre-trained models (MLflow)
5. **Model Deployment** - Deploy containers to ECS
6. **Model Inferencing** - Real-time + batch inference services
7. **Model Monitoring** - Drift detection, alerts
8. **CI/CD Enforcement** - GitHub Actions enforcement, approvals

---

## Architecture

### High-Level Components

```
┌─────────────────┐
│   GitHub        │  Source of Truth
│   - Code        │  Deployment configs
│   - Pipelines   │  Infra definitions
└────────┬────────┘
         │
         └─→ GitHub Actions (CI/CD)
             │
             ├─→ AWS CodePipeline
             └─→ Approval Gates
                 │
         ┌───────┴───────┐
         │               │
    ┌────▼────┐     ┌────▼────┐
    │ Dev Env │     │ Staging  │
    │         │     │ → Prod   │
    └────┬────┘     └────┬─────┘
         │               │
         └───────┬───────┘
                 │
         ┌───────▼──────────┐
         │  AWS Services    │
         ├──────────────────┤
         │ Step Functions   │ - Orchestration
         │ ECS Fargate      │ - Execution
         │ ECR              │ - Container Registry
         │ S3               │ - Artifacts/Data
         │ RDS (Postgres)   │ - Metadata
         │ CloudWatch       │ - Monitoring
         │ MLflow           │ - Model Registry
         └──────────────────┘
```

### AWS Services Used

| Service | Purpose |
|---------|---------|
| **ECR** | Container registry for models & services |
| **S3** | Data, features, model artifacts |
| **RDS (Postgres)** | Metadata, registry, audit logs |
| **ECS Fargate** | Serverless container execution |
| **Step Functions** | Pipeline orchestration |
| **CloudWatch** | Logs, metrics, alerts |
| **IAM** | Identity & access control |
| **SNS** | Notifications, alerts |

---

## Project Structure

```
mlops-studio/
├── frontend/                    # React UI application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── PipelineDAG.tsx
│   │   │   ├── Monitoring.tsx
│   │   │   ├── CICD.tsx
│   │   │   ├── Integrations.tsx
│   │   │   └── Admin.tsx
│   │   ├── services/           # API clients
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript types
│   │   └── App.tsx
│   └── package.json
│
├── backend/                     # Express.js API server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── projects.ts
│   │   │   ├── pipelines.ts
│   │   │   ├── models.ts
│   │   │   ├── deployments.ts
│   │   │   ├── monitoring.ts
│   │   │   ├── integrations.ts
│   │   │   └── audit.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── database/
│   │   ├── middleware/
│   │   └── app.ts
│   └── package.json
│
├── model-registry/              # MLflow configuration & SDK
│   ├── docker/
│   │   └── Dockerfile
│   ├── config/
│   │   └── mlflow.yaml
│   └── scripts/
│       └── deploy.sh
│
├── model-serving/               # Model serving containers
│   ├── inference-server/
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── batch-inference/
│       ├── job.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── monitoring/                  # Monitoring & observability
│   ├── drift-detection/
│   │   └── detector.py
│   ├── dashboards/
│   │   └── cloudwatch.json
│   └── alerts/
│       └── config.yaml
│
├── pipelines/                   # Step Functions definitions
│   ├── canonical-pipeline.json
│   ├── data-ingestion.json
│   ├── model-deployment.json
│   └── monitoring-pipeline.json
│
├── cicd/                        # GitHub Actions workflows
│   ├── pipeline-validation.yml
│   ├── deploy-to-dev.yml
│   ├── promote-to-staging.yml
│   ├── promote-to-prod.yml
│   └── approval-gate.yml
│
├── infra/                       # Terraform IaC
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── s3.tf
│   ├── rds.tf
│   ├── ecr.tf
│   ├── ecs.tf
│   ├── iam.tf
│   └── step-functions.tf
│
├── integrations/                # Third-party integrations
│   ├── github/
│   │   └── connector.ts
│   ├── mlflow/
│   │   └── client.ts
│   └── cloudwatch/
│       └── client.ts
│
└── docs/                        # Documentation
    ├── ARCHITECTURE.md
    ├── API.md
    ├── SETUP.md
    ├── PIPELINES.md
    └── DEPLOYMENT.md
```

---

## Quick Start

### Prerequisites

- AWS Account with proper IAM permissions
- GitHub organization & repository
- Node.js 16+ and Python 3.9+
- Terraform 1.0+
- Docker (for local testing)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd mlops-studio

# Install dependencies
npm run install-all

# Configure AWS credentials
aws configure

# Set environment variables
cp .env.example .env
# Edit .env with your values
```

### Development

```bash
# Start frontend + backend
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Deployment

```bash
# Deploy infrastructure
cd infra
terraform init
terraform plan
terraform apply

# Deploy backend
cd ../backend
npm run build
npm run deploy

# Deploy frontend
cd ../frontend
npm run build
npm run deploy
```

---

## Core Features

### 1. Pipeline Visual DAG Builder
- Drag-and-drop node composition
- Node locking for CI/CD enforcement
- Version management per pipeline
- Automatic GitHub synchronization

### 2. Model Registry (MLflow)
- Pre-trained model registration
- Promotion workflows (dev → staging → prod)
- Approval gates between environments
- Artifact tracking & versioning

### 3. Deployment Management
- Container-based (ECR → ECS)
- Blue-green deployments
- Automatic rollback on failures
- Version pinning per environment

### 4. GitHub Integration
- OAuth-based authentication
- Repository & branch mapping
- PR/commit status tracking
- Deployment status in GitHub

### 5. Monitoring & Observability
- Data drift detection
- Concept drift detection
- Prediction distribution shifts
- CloudWatch integration
- Custom alert rules

### 6. RBAC & Approval Workflows
- 6 user roles with granular permissions
- Multi-level approvals
- Immutable audit logs
- Compliance reporting

### 7. Environment Management
- Dev, Staging, Production isolation
- Promotion rules & gates
- Environment-specific configs
- Secret management via AWS Secrets Manager

---

## API Reference

Base URL: `http://localhost:5000/api`

### Projects
```
GET    /projects                 - List all projects
POST   /projects                 - Create new project
GET    /projects/:id             - Get project details
PUT    /projects/:id             - Update project
DELETE /projects/:id             - Delete project
```

### Pipelines
```
GET    /pipelines/:projectId           - List pipelines
POST   /pipelines                      - Create pipeline
GET    /pipelines/:id                  - Get pipeline DAG
PUT    /pipelines/:id                  - Update pipeline
POST   /pipelines/:id/lock             - Lock nodes
POST   /pipelines/:id/run              - Trigger execution
```

### Models
```
GET    /models                   - List models
POST   /models/register          - Register model
GET    /models/:id               - Get model details
POST   /models/:id/promote       - Promote to environment
```

### Deployments
```
GET    /deployments              - List deployments
POST   /deployments              - Deploy model
GET    /deployments/:id          - Get deployment status
POST   /deployments/:id/rollback - Rollback deployment
```

### Monitoring
```
GET    /monitoring/drift/:modelId      - Get drift metrics
GET    /monitoring/alerts              - Get active alerts
POST   /monitoring/alerts              - Create alert rule
```

### Integrations
```
POST   /integrations/github/connect    - OAuth connect GitHub
GET    /integrations/github/repos      - List connected repos
POST   /integrations/github/sync       - Sync with repo
```

---

## CI/CD Workflows

### Pipeline Validation
Triggered on PR to `main`:
- Validates pipeline YAML/JSON syntax
- Checks locked node enforcement
- Runs tests for affected stages

### Deploy to Dev
Triggered on merge to `main`:
- Builds container images
- Updates pipeline definition
- Deploys to dev ECS cluster

### Promote to Staging
Triggered manually / scheduled:
- Approval gate required
- Runs integration tests
- Deploys to staging ECS cluster

### Promote to Production
Triggered manually with strict approval:
- Multi-level approval required
- Canary deployment option
- Blue-green deployment
- Auto-rollback on failure

---

## AWS Infrastructure

All infrastructure is defined in Terraform (see `infra/` directory):

- **VPC & Networking** - Isolated environments
- **ECR Repositories** - One per service
- **ECS Clusters** - Dev, Staging, Prod
- **RDS Postgres** - Shared metadata database
- **S3 Buckets** - Data, artifacts, models, logs
- **IAM Roles** - Fine-grained permissions per service
- **Step Functions** - Canonical pipeline execution
- **CloudWatch** - Logs, metrics, dashboards
- **Secrets Manager** - Sensitive configuration

---

## Monitoring & Alerts

### Built-in Metrics
- Model inference latency (p50, p99)
- Model prediction distribution
- Data feature availability
- Pipeline execution duration
- API endpoint health

### Drift Detection
- **Data Drift** - Input feature distribution changes
- **Concept Drift** - Target variable distribution changes
- **Prediction Drift** - Model output distribution changes

### Alerts
- Configured via CloudWatch
- Routed via SNS → Slack, PagerDuty, Email
- Tied to promotion gates (alert blocks promotion)

---

## Compliance & Governance

- **Immutable Audit Logs** - All actions logged with timestamps & user
- **Version Control** - All artifacts tracked in Git
- **Approval Workflows** - Mandatory gates per environment
- **Data Lineage** - Track data from ingestion to inference
- **Access Logs** - AWS CloudTrail integration

---

## Example: Complete Pipeline Lifecycle

```
1. ML Engineer defines pipeline in GitHub
   └─ Creates pipeline.yaml with 8 nodes
   
2. GitHub Actions validates
   └─ Syntax check, locked node enforcement
   
3. Deploy to Dev
   └─ ECS Fargate spins up Step Functions execution
   └─ Data flows through ingestion → preparation → features
   
4. Register Model
   └─ MLflow tracks pre-trained model artifact
   └─ Metadata stored in RDS
   
5. Deploy Model Container
   └─ Builds inference server container
   └─ Pushes to ECR
   
6. Prod Approval Gate
   └─ Requires 2+ approvals from production team
   └─ Monitors drift metrics
   
7. Blue-Green Deployment to Prod
   └─ New ECS task group spins up
   └─ Traffic shifted gradually
   └─ Auto-rollback if errors detected
   
8. Continuous Monitoring
   └─ CloudWatch tracks inference latency
   └─ Data drift detection runs hourly
   └─ Alerts fire on anomalies
```

---

## Next Steps

1. **Review Architecture** - See [ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. **Setup AWS Infrastructure** - See [SETUP.md](docs/SETUP.md)
3. **Deploy Locally** - See Quick Start section
4. **Explore API** - See [API.md](docs/API.md)
5. **Create Your First Pipeline** - See [PIPELINES.md](docs/PIPELINES.md)

---

## Support & Contributing

For issues, questions, or contributions, please:
1. Check existing documentation in `docs/`
2. Review GitHub issues
3. Submit pull request with changes

---

## License

MIT - See LICENSE file for details

---

**Built with ❤️ for production ML operations**
