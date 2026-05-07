# MLOps Studio - API Request Examples

Complete guide to all API endpoints with curl examples and expected responses.

## Authentication

All API requests require a JWT token in the `Authorization` header.

### Get Token (Local Development)

```bash
# In dev mode, use any token (normally would authenticate via GitHub OAuth)
export JWT_TOKEN="dev-token-12345"

# Or extract from existing deployment
curl http://localhost:5000/api/auth/github/callback?code=GITHUB_CODE
```

### Every Request Includes

```bash
-H "Authorization: Bearer $JWT_TOKEN"
-H "Content-Type: application/json"
```

---

## Projects API

### List All Projects

**Request:**
```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "proj-001",
      "name": "Customer Churn",
      "description": "Churn prediction model",
      "owner": "ml1@company.com",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Project

**Request:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Model serving project",
    "githubRepo": "company/new-model",
    "environment": "dev"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "proj-002",
    "name": "New Project",
    "createdAt": "2024-01-20T14:45:00Z"
  }
}
```

### Get Project Details

**Request:**
```bash
curl http://localhost:5000/api/projects/proj-001 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "proj-001",
    "name": "Customer Churn",
    "pipelines": 3,
    "models": 5,
    "deployments": 2,
    "lastActivity": "2024-01-20T14:45:00Z"
  }
}
```

### Update Project

**Request:**
```bash
curl -X PUT http://localhost:5000/api/projects/proj-001 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "status": "archived"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "proj-001",
    "status": "archived",
    "updatedAt": "2024-01-20T15:00:00Z"
  }
}
```

### Delete Project

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/projects/proj-001 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "message": "Project deleted successfully"
}
```

---

## Pipelines API

### List Pipelines

**Request:**
```bash
curl "http://localhost:5000/api/pipelines?projectId=proj-001" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "pipe-001",
      "name": "ChurnPipeline",
      "projectId": "proj-001",
      "status": "active",
      "stages": 8,
      "lastRun": "2024-01-20T14:00:00Z"
    }
  ]
}
```

### Create Pipeline

**Request:**
```bash
curl -X POST http://localhost:5000/api/pipelines \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj-001",
    "name": "DataPipeline",
    "description": "Data ingestion pipeline",
    "nodes": [
      {"id": "node-1", "name": "Data Ingestion", "locked": false},
      {"id": "node-2", "name": "Data Preparation", "locked": false},
      {"id": "node-3", "name": "Feature Store", "locked": false},
      {"id": "node-4", "name": "Model Registry", "locked": true}
    ]
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "pipe-002",
    "name": "DataPipeline",
    "nodeCount": 4,
    "lockedNodeCount": 1
  }
}
```

### Toggle Pipeline Lock

**Request:**
```bash
curl -X POST http://localhost:5000/api/pipelines/pipe-001/lock \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "node-3",
    "locked": true,
    "reason": "Requires approval for feature changes"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "nodeId": "node-3",
    "locked": true,
    "updatedAt": "2024-01-20T15:00:00Z"
  }
}
```

### Run Pipeline

**Request:**
```bash
curl -X POST http://localhost:5000/api/pipelines/pipe-001/run \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "dev",
    "parameters": {
      "dataDate": "2024-01-20",
      "featureVersion": "v2"
    }
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "executionId": "exec-12345",
    "pipelineId": "pipe-001",
    "status": "running",
    "startTime": "2024-01-20T15:05:00Z",
    "stepFunctionArn": "arn:aws:states:us-east-1:123456789:execution:mlops-studio:exec-12345"
  }
}
```

---

## Models API

### List Models

**Request:**
```bash
curl "http://localhost:5000/api/models?projectId=proj-001" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "model-001",
      "name": "churn-predictor",
      "version": "1.2.0",
      "stage": "dev",
      "accuracy": 0.89,
      "registeredAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Register Model

**Request:**
```bash
curl -X POST http://localhost:5000/api/models/register \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj-001",
    "name": "churn-predictor",
    "version": "1.3.0",
    "framework": "xgboost",
    "modelPath": "s3://bucket/models/churn/v1.3.0",
    "metrics": {
      "accuracy": 0.90,
      "precision": 0.88,
      "recall": 0.92,
      "auc": 0.93
    },
    "description": "Improved XGBoost with new features"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "model-002",
    "name": "churn-predictor",
    "version": "1.3.0",
    "stage": "dev",
    "registeredAt": "2024-01-20T15:10:00Z"
  }
}
```

### Promote Model

**Request:**
```bash
curl -X POST http://localhost:5000/api/models/model-001/promote \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromStage": "dev",
    "toStage": "staging",
    "approverEmail": "ml-lead@company.com",
    "notes": "All unit tests passed, ready for staging"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "model-001",
    "stage": "staging",
    "promotedAt": "2024-01-20T15:15:00Z",
    "promotedBy": "ml1@company.com",
    "approvalStatus": "pending"
  }
}
```

### Get Model Details

**Request:**
```bash
curl http://localhost:5000/api/models/model-001 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "model-001",
    "name": "churn-predictor",
    "version": "1.2.0",
    "stage": "staging",
    "framework": "xgboost",
    "metrics": {
      "accuracy": 0.89,
      "auc": 0.92
    },
    "featureCount": 25,
    "lastInference": "2024-01-20T14:50:00Z",
    "deployments": 2
  }
}
```

---

## Deployments API

### List Deployments

**Request:**
```bash
curl "http://localhost:5000/api/deployments?projectId=proj-001" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "deploy-001",
      "modelId": "model-001",
      "modelVersion": "1.2.0",
      "environment": "staging",
      "status": "healthy",
      "deployedAt": "2024-01-15T10:00:00Z",
      "requestsPerMinute": 250
    }
  ]
}
```

### Create Deployment

**Request:**
```bash
curl -X POST http://localhost:5000/api/deployments \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "model-001",
    "environment": "prod",
    "strategy": "blue-green",
    "replicas": 3,
    "resources": {
      "cpu": "512m",
      "memory": "1Gi"
    }
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "deploy-002",
    "modelId": "model-001",
    "status": "deploying",
    "deploymentId": "blue-env",
    "estimatedTime": 300
  }
}
```

### Rollback Deployment

**Request:**
```bash
curl -X POST http://localhost:5000/api/deployments/deploy-001/rollback \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "High error rate detected",
    "targetVersion": "1.1.0"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "deploy-001",
    "status": "rollback-in-progress",
    "targetVersion": "1.1.0"
  }
}
```

---

## Monitoring API

### Get Drift Detection

**Request:**
```bash
curl "http://localhost:5000/api/monitoring/drift?modelId=model-001&window=7d" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "modelId": "model-001",
    "dataDrift": {
      "detected": true,
      "score": 0.08,
      "threshold": 0.05,
      "method": "kolmogorov_smirnov",
      "affectedFeatures": ["tenure", "monthly_charges"]
    },
    "conceptDrift": {
      "detected": false,
      "score": 0.02
    },
    "timestamp": "2024-01-20T15:00:00Z"
  }
}
```

### Get Alerts

**Request:**
```bash
curl "http://localhost:5000/api/monitoring/alerts?projectId=proj-001&severity=high" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "alert-001",
      "type": "data_drift",
      "severity": "high",
      "message": "Data drift detected in 2 features",
      "timestamp": "2024-01-20T14:50:00Z",
      "resolved": false
    }
  ]
}
```

---

## Integrations API

### GitHub OAuth Login

**Request:**
```bash
curl "http://localhost:5000/api/integrations/github/auth?code=GITHUB_AUTH_CODE" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-001",
      "username": "ml-engineer",
      "email": "ml1@company.com"
    },
    "expiresIn": 86400
  }
}
```

### List Connected Repositories

**Request:**
```bash
curl http://localhost:5000/api/integrations/github/repos \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "repo-001",
      "name": "churn-prediction-model",
      "owner": "company",
      "url": "https://github.com/company/churn-prediction-model",
      "isConnected": true,
      "lastSync": "2024-01-20T14:00:00Z"
    }
  ]
}
```

### Sync Repository

**Request:**
```bash
curl -X POST http://localhost:5000/api/integrations/github/sync \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-001",
    "branch": "main"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "repositoryId": "repo-001",
    "syncStatus": "in-progress",
    "filesUpdated": 3,
    "lastSync": "2024-01-20T15:20:00Z"
  }
}
```

---

## Audit Logs API

### List Audit Logs

**Request:**
```bash
curl "http://localhost:5000/api/audit-logs?projectId=proj-001&action=model_promotion&limit=50" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "audit-001",
      "action": "model_promotion",
      "actor": "ml1@company.com",
      "resourceId": "model-001",
      "resourceType": "model",
      "details": {
        "fromStage": "dev",
        "toStage": "staging"
      },
      "timestamp": "2024-01-20T15:15:00Z",
      "status": "success"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "pageSize": 50
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project ID format",
    "details": {
      "field": "projectId",
      "expected": "UUID format",
      "received": "invalid-id"
    }
  }
}
```

### 401 Unauthorized

```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authentication token"
  }
}
```

### 403 Forbidden

```json
{
  "status": "error",
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions for this action",
    "requiredRole": "admin"
  }
}
```

### 404 Not Found

```json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "resourceId": "proj-999"
  }
}
```

### 429 Too Many Requests

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

---

## Rate Limiting

- **Default Limit**: 100 requests per minute per user
- **Headers**:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 87
  - `X-RateLimit-Reset`: 1705780800 (Unix timestamp)

---

## Pagination

Endpoints returning lists support pagination:

```bash
curl "http://localhost:5000/api/projects?page=2&pageSize=20&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response**:
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "total": 145,
    "totalPages": 8
  }
}
```

---

## Webhooks

Subscribe to events:

```bash
curl -X POST http://localhost:5000/api/webhooks \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.com/webhooks/mlops",
    "events": ["model.promoted", "deployment.failed", "drift.detected"],
    "active": true
  }'
```

---

**See [API.md](docs/API.md) for full API documentation**
