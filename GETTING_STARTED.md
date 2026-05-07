# 🚀 MLOps Studio - Getting Started

**Quick Access to Your MLOps Platform**

## 📍 Location
```
c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1
```

## ⚡ Quick Start (2 Options)

### Option 1: Local Development (30 seconds)
```powershell
# Open PowerShell and navigate to the project
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"

# Run automated setup
bash scripts/setup-dev.sh
```

**Then access:**
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API**: http://localhost:5000/api
- 📊 **MLflow**: http://localhost:5001
- 🗄️ **Database**: localhost:5432 (postgres/password)

### Option 2: AWS Deployment
```powershell
# Configure AWS credentials first
aws configure

# Deploy infrastructure
cd infra
terraform init
terraform plan
terraform apply

# Deploy application
bash ../scripts/deploy-aws.sh
```

---

## 📚 Documentation Map

| Document | Purpose | Link |
|----------|---------|------|
| **README.md** | Full platform overview | [Read](README.md) |
| **QUICKSTART.md** | 5-minute setup guide | [Read](QUICKSTART.md) |
| **PROJECT_STATUS.md** | Completion & feature status | [Read](PROJECT_STATUS.md) |
| **ARCHITECTURE.md** | System design & data flows | [Read](docs/ARCHITECTURE.md) |
| **SETUP.md** | Terraform deployment guide | [Read](docs/SETUP.md) |
| **API.md** | 25+ endpoint reference | [Read](docs/API.md) |

---

## 🎯 What's Inside

### 🖥️ Frontend (React)
- **Dashboard**: 4 KPIs, 3 charts, recent alerts
- **Projects**: Project management with GitHub integration
- **Pipelines**: Visual DAG editor with 8 canonical stages
- **Monitoring**: Data/concept drift detection, health metrics
- **CI/CD**: Pipeline runs with approval gates
- **Integrations**: Connected services (GitHub, MLflow, AWS)
- **Admin**: User management, role definitions, audit controls

### 🔌 Backend API (Express.js)
- **25+ endpoints** across 7 route groups
- JWT authentication with RBAC
- Audit logging for compliance
- PostgreSQL integration ready
- AWS SDK integration

### 🏗️ Infrastructure (Terraform)
- **VPC**: Multi-AZ with public/private subnets
- **RDS**: PostgreSQL 15.3 with backups & monitoring
- **ECS**: Fargate auto-scaling (2-4 tasks)
- **ECR**: 3 private registries (backend, MLflow, inference-server)
- **Step Functions**: 8-stage pipeline orchestration
- **S3**: 4 buckets (data, models, artifacts, logs)
- **CloudWatch**: Logs, metrics, alarms
- **IAM**: Least-privilege roles & policies

### 🔄 CI/CD (GitHub Actions)
- **pipeline-validation.yml**: PR checks & locked node enforcement
- **deploy-to-dev.yml**: Automatic dev deployment
- **promote-to-prod.yml**: Blue-green deployment with approvals

### 📦 Model Components
- **MLflow Registry**: Version control & promotion
- **Inference Server**: Flask-based serving API
- **Drift Detection**: Kolmogorov-Smirnov statistical testing
- **Canonical Pipeline**: 8-stage Step Functions definition

---

## 🧪 Test the Platform

### Health Check
```bash
bash scripts/health-check.sh
```
Verifies: Backend, Frontend, Database, AWS services, Docker

### API Testing
```bash
bash scripts/test-api.sh
```
Tests all endpoints with curl and validates responses

### Backend Unit Tests
```bash
cd backend && npm test
```

### Frontend Unit Tests
```bash
cd frontend && npm test
```

---

## 🔐 Security Features

✅ JWT authentication & RBAC  
✅ GitHub OAuth2 integration  
✅ Immutable audit logs  
✅ VPC isolation with security groups  
✅ RDS encryption (AES-256)  
✅ S3 encryption enabled  
✅ IAM least-privilege policies  
✅ Approval workflows for production  
✅ Blue-green deployment  

---

## 📊 Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Pipeline-First Architecture | ✅ | 8 canonical stages with DAG visualization |
| GitHub Integration | ✅ | OAuth2, repo sync, PR validation |
| AWS Services | ✅ | ECS, RDS, S3, ECR, Step Functions, CloudWatch |
| RBAC | ✅ | 6 roles: Engineer, Data, Prod, Monitoring, Sponsor, Admin |
| Model Registry | ✅ | MLflow with dev/staging/prod promotion |
| Monitoring | ✅ | Data drift, concept drift, system health |
| Compliance | ✅ | Audit logs, approval gates, encryption |
| CI/CD | ✅ | GitHub Actions with locked node enforcement |
| Inference | ✅ | Real-time & batch serving, model versioning |

---

## 🎮 Example Workflow

### 1. Create a Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"CustomerChurn","description":"Churn prediction","githubRepo":"company/churn-model"}'
```

### 2. Create a Pipeline
```bash
curl -X POST http://localhost:5000/api/pipelines \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"DataFlow","projectId":"proj-1","nodes":[...]}'
```

### 3. Register a Model
```bash
curl -X POST http://localhost:5000/api/models/register \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"ChurnModel","version":"1.0.0","stage":"dev"}'
```

### 4. Promote to Production
```bash
curl -X POST http://localhost:5000/api/models/model-1/promote \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"toStage":"prod"}'
```

---

## 📋 Requirements Met

✅ **15/15 Original Requirements Implemented:**

1. ✅ Pipeline-first architecture with 8 canonical stages
2. ✅ GitHub as system of record (OAuth, repo sync)
3. ✅ AWS-managed services (no K8s)
4. ✅ ECS Fargate for compute
5. ✅ 6-role RBAC system
6. ✅ Model registry with versioning
7. ✅ Multi-environment deployment (dev/staging/prod)
8. ✅ Monitoring & drift detection
9. ✅ Immutable audit logs
10. ✅ CI/CD approval gates
11. ✅ Blue-green deployment
12. ✅ S3 artifact management
13. ✅ CloudWatch integration
14. ✅ Step Functions orchestration
15. ✅ Complete IaC with Terraform

---

## 📂 File Manifest

### Application
- ✅ `backend/src/app.ts` (600+ lines)
- ✅ `frontend/src/App.tsx` + 7 pages (200+ lines each)
- ✅ `docker-compose.yml` (96 lines)

### Infrastructure
- ✅ `infra/main.tf`, `variables.tf`, `outputs.tf`
- ✅ `infra/vpc.tf`, `rds.tf`, `ecs.tf`, `ecr.tf`, `iam.tf`, `s3.tf`, `step-functions.tf`
- ✅ Total: 11 Terraform files, 2000+ lines

### CI/CD
- ✅ `cicd/pipeline-validation.yml`
- ✅ `cicd/deploy-to-dev.yml`
- ✅ `cicd/promote-to-prod.yml`

### Documentation
- ✅ `README.md` (512 lines)
- ✅ `QUICKSTART.md` (253 lines)
- ✅ `docs/ARCHITECTURE.md` (400+ lines)
- ✅ `docs/SETUP.md` (200+ lines)
- ✅ `docs/API.md` (400+ lines)

### Scripts
- ✅ `scripts/setup-dev.sh`
- ✅ `scripts/health-check.sh`
- ✅ `scripts/deploy-aws.sh`
- ✅ `scripts/test-api.sh`

### Models
- ✅ `pipelines/canonical-pipeline.json`
- ✅ `model-registry/config.py`
- ✅ `model-serving/inference_server.py`
- ✅ `monitoring/drift_detection.py`

---

## 🚀 Next Actions

### For Local Testing
1. Open PowerShell
2. Navigate to the project folder
3. Run `bash scripts/setup-dev.sh`
4. Visit http://localhost:3000

### For AWS Deployment
1. Configure AWS credentials: `aws configure`
2. Review docs/SETUP.md
3. Update infra/terraform.tfvars
4. Run `bash scripts/deploy-aws.sh`

### For GitHub Integration
1. Create GitHub OAuth app
2. Add credentials to .env
3. Configure GitHub Actions secrets
4. Push code to GitHub repo

---

## 💡 Tips

- **Logs**: `docker logs <container>` or CloudWatch console
- **Database**: Connect with `psql -h localhost -U postgres -d mlopsdb`
- **API Testing**: Use Postman or `bash scripts/test-api.sh`
- **Terraform State**: Stored in S3 (after AWS deployment)
- **Cost Estimation**: See docs/SETUP.md for details

---

## 🆘 Troubleshooting

### "Connection refused" on localhost
→ Check if `docker-compose up` has completed

### "Port already in use"
→ Find & kill process: `lsof -i :3000` → `kill <PID>`

### "Database not ready"
→ Wait 30 seconds and retry, or check: `docker logs postgres`

### "AWS credentials not found"
→ Run `aws configure` and add valid credentials

### Full help
→ See `README.md`, `QUICKSTART.md`, or `docs/SETUP.md`

---

**Status**: ✅ **COMPLETE**  
**Ready**: 🎉 **FOR DEPLOYMENT**  
**Location**: `mlops-studio/` on your Desktop

**Let's get started!** 🚀
