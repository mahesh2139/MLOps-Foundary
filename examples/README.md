# MLOps Studio - Examples Directory

Complete, working examples for using the MLOps Studio platform.

## 📚 What's Included

### 1. **example-project.json**
Complete project configuration for a customer churn prediction model.

**Contents:**
- Project metadata and ownership
- Multi-environment configuration (dev/staging/prod)
- 8-stage pipeline definition with locked nodes
- 6-role RBAC assignments
- Monitoring and drift detection setup
- Compliance settings

**Usage:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d @examples/example-project.json
```

### 2. **example-model.json**
Full model lifecycle from registration to production deployment.

**Contents:**
- Model metadata (framework, version, owner)
- Training details and hyperparameters
- Performance metrics (accuracy, precision, recall, AUC)
- Feature importance rankings
- Test coverage and deployment readiness
- Drift detection configuration
- Containerization and scaling policies

**Usage:**
```bash
curl -X POST http://localhost:5000/api/models/register \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d @examples/example-model.json
```

### 3. **api-request-examples.md**
Comprehensive guide with curl examples for all API endpoints.

**Includes:**
- Authentication and token management
- Projects CRUD operations
- Pipeline creation and execution
- Model registration and promotion
- Deployment and rollback
- Monitoring and drift detection
- GitHub integration
- Audit logging
- Error handling
- Rate limiting and pagination
- Webhook subscriptions

**Quick Example:**
```bash
# List projects
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer $JWT_TOKEN"

# Create new project
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"name": "My Project"}'

# Promote model to staging
curl -X POST http://localhost:5000/api/models/model-id/promote \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"toStage": "staging"}'
```

### 4. **example-pipeline.json** (reference)
8-stage Step Functions pipeline definition used in production.

**Stages:**
1. Data Ingestion
2. Data Preparation
3. Feature Store
4. Model Registry
5. Deployment
6. Inference
7. Monitoring
8. CI/CD Enforcement

---

## 🚀 Quick Start with Examples

### Step 1: Start MLOps Studio

```bash
cd mlops-studio

# Option A: Using Docker Compose
docker-compose up -d

# Option B: Manual setup
bash scripts/setup-dev.sh
```

### Step 2: Get Authentication Token

```bash
# In development, use any token
export JWT_TOKEN="dev-token-12345"

# Or generate a valid JWT token (requires JWT_SECRET)
export JWT_TOKEN=$(node -e "
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({userId: 'dev-user', role: 'admin'}, 'dev-secret', {expiresIn: '24h'});
  console.log(token);
")
```

### Step 3: Load Example Project

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d @examples/example-project.json
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "id": "proj-churn-001",
    "name": "Customer Churn Prediction",
    "createdAt": "2024-01-20T15:30:00Z"
  }
}
```

### Step 4: Register Example Model

```bash
curl -X POST http://localhost:5000/api/models/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d @examples/example-model.json
```

### Step 5: Promote Model Through Environments

```bash
# Get model ID from previous response
export MODEL_ID="model-churn-v1"

# Promote to staging
curl -X POST http://localhost:5000/api/models/$MODEL_ID/promote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "toStage": "staging",
    "approverEmail": "ml-lead@company.com"
  }'

# Promote to production (after staging validation)
curl -X POST http://localhost:5000/api/models/$MODEL_ID/promote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "toStage": "prod",
    "approverEmail": "director@company.com"
  }'
```

### Step 6: Test Full Workflow

```bash
# Run health checks
bash scripts/health-check.sh

# Run API tests (includes project/model/pipeline endpoints)
bash scripts/test-api.sh

# View generated data
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

curl http://localhost:5000/api/models \
  -H "Authorization: Bearer $JWT_TOKEN" | jq
```

---

## 📋 Example Workflow Breakdown

### Scenario: Deploy Customer Churn Model

**1. Project Creation (1-2 minutes)**
- Load `example-project.json`
- Sets up 8-stage pipeline
- Assigns roles: ML Engineers, Data Team, Prod Team, etc.

**2. Model Development (simulated)**
- Model trained externally (TensorFlow, XGBoost, etc.)
- Metrics calculated: 89% accuracy, 0.92 AUC
- Features identified: tenure, charges, service type

**3. Model Registration (30 seconds)**
- Load `example-model.json`
- Registers v1.2.0 in dev stage
- Uploads artifacts to S3
- Starts tracking in MLflow

**4. Dev Testing**
- Run unit tests (85% coverage)
- Integration tests pass
- Performance tests pass
- Deployment readiness: **Green** ✅

**5. Staging Promotion (1-2 minutes)**
- Promote to staging environment
- Requires ML lead approval
- Deploy to staging ECS cluster
- Run smoke tests

**6. Production Promotion (5 minutes)**
- Promote to production
- Requires director approval
- Blue-green deployment strategy:
  - Deploy to **green** environment
  - Wait for health checks
  - Switch traffic from blue → green
  - Monitor error rates
  - Cleanup blue environment

**7. Monitoring & Alerting (ongoing)**
- Real-time inference serving
- Data drift detection (daily)
- Performance metrics tracking
- Slack/email alerts on anomalies

---

## 🔍 Customizing Examples

### Modify Project Configuration

Edit `example-project.json`:
```json
{
  "name": "Your Project Name",
  "description": "Your description",
  "githubRepo": "your-org/your-repo",
  "environments": {
    "dev": {...},
    "staging": {...},
    "prod": {...}
  },
  "roles": {
    "mlEngineers": ["your-email@company.com"],
    ...
  }
}
```

### Customize Model Metrics

Edit `example-model.json`:
```json
{
  "name": "your-model-name",
  "framework": "tensorflow",  // or pytorch, xgboost, sklearn
  "performance": {
    "dev": {
      "accuracy": 0.95,
      "precision": 0.93,
      "recall": 0.97
    }
  }
}
```

### Create New Examples

```bash
# Export existing project
curl http://localhost:5000/api/projects/proj-001 \
  -H "Authorization: Bearer $JWT_TOKEN" > examples/my-project.json

# Export existing model
curl http://localhost:5000/api/models/model-001 \
  -H "Authorization: Bearer $JWT_TOKEN" > examples/my-model.json
```

---

## 📊 Expected Outcomes

After following the examples, you'll have:

✅ **Created Project**
- Name: Customer Churn Prediction
- Pipelines: 1 (8 stages)
- Models: 1
- Status: Active

✅ **Registered Model**
- Version: 1.2.0
- Accuracy: 89%
- Deployment Ready: Yes

✅ **Promoted Model**
- Dev → Staging (approval required)
- Staging → Production (approval required)

✅ **Generated Audit Trail**
- Project creation
- Model registration
- Promotion requests & approvals
- Deployment events

✅ **Verified APIs**
- All 25+ endpoints tested
- Authentication working
- Response validation passed

---

## 🧪 Testing Variations

### Test 1: Model Registration with Different Framework

```bash
# Try with TensorFlow instead of XGBoost
cp examples/example-model.json test-tf-model.json

# Edit: change framework to "tensorflow"
sed -i 's/"xgboost"/"tensorflow"/g' test-tf-model.json

# Register
curl -X POST http://localhost:5000/api/models/register \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d @test-tf-model.json
```

### Test 2: Multi-Environment Deployment

```bash
# Deploy same model to dev, staging, prod simultaneously
for ENV in dev staging prod; do
  curl -X POST http://localhost:5000/api/deployments \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d "{\"modelId\": \"model-001\", \"environment\": \"$ENV\"}"
done
```

### Test 3: Rollback Scenario

```bash
# Create deployment
DEPLOY_ID=$(curl -X POST http://localhost:5000/api/deployments \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '...' | jq -r '.data.id')

# Simulate issue and rollback
curl -X POST http://localhost:5000/api/deployments/$DEPLOY_ID/rollback \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"reason": "High error rate", "targetVersion": "1.1.0"}'
```

---

## 📚 Related Documentation

- **[API.md](../docs/API.md)** - Complete API reference (400+ lines)
- **[INSTALLATION.md](../INSTALLATION.md)** - Setup guide with detailed steps
- **[QUICKSTART.md](../QUICKSTART.md)** - 5-minute quick start
- **[ARCHITECTURE.md](../docs/ARCHITECTURE.md)** - System design and data flows

---

## 💡 Tips & Best Practices

### 1. Use Environment Variables for Sensitive Data
```bash
export JWT_TOKEN="your-token"
export API_URL="http://localhost:5000"
export PROJECT_ID="proj-001"

curl $API_URL/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 2. Validate JSON Before Posting
```bash
# Validate JSON syntax
jq . examples/example-project.json

# Pretty-print response
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
```

### 3. Save Response IDs for Chaining
```bash
# Create project and save ID
PROJECT_ID=$(curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d @examples/example-project.json | jq -r '.data.id')

# Use ID for downstream operations
echo "Project created: $PROJECT_ID"
```

### 4. Implement Approval Workflow
```bash
# 1. Request approval
curl -X POST http://localhost:5000/api/models/model-001/promote \
  -d '{..., "approvalStatus": "pending"}'

# 2. Wait for approval
sleep 60

# 3. Check approval status
curl http://localhost:5000/api/models/model-001 | jq '.data.approvalStatus'

# 4. Resume promotion
curl -X POST http://localhost:5000/api/models/model-001/promote \
  -d '{..., "approvalStatus": "approved"}'
```

---

## 🎯 Next Steps

1. ✅ **Run examples locally** - Follow Quick Start above
2. ✅ **Modify for your data** - Customize project/model JSONs
3. ✅ **Test API endpoints** - Use api-request-examples.md
4. ✅ **Deploy to AWS** - Follow INSTALLATION.md
5. ✅ **Set up GitHub Actions** - Enable CI/CD pipelines
6. ✅ **Configure monitoring** - Set up drift detection alerts

---

**Ready to get started?** → [Run Quick Start](../QUICKSTART.md)

**Questions about APIs?** → [Read API Reference](../docs/API.md)

**Need setup help?** → [See Installation Guide](../INSTALLATION.md)
