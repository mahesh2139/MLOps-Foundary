# MLOps Studio - API Reference

Base URL: `http://localhost:5000/api` (or your ALB DNS name)

## Authentication

All requests should include:
```
Authorization: Bearer {token}
Content-Type: application/json
```

## Projects API

### List Projects
```
GET /projects

Response:
{
  "success": true,
  "data": [
    {
      "id": "project-1",
      "name": "ML Model Deployment",
      "description": "Pipeline for deploying ML models",
      "owner": "alice@org.com",
      "environment": "prod",
      "status": "active",
      "githubRepo": "ml-models",
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### Create Project
```
POST /projects
Content-Type: application/json

Body:
{
  "name": "New Model Project",
  "description": "Deployment pipeline",
  "owner": "alice@org.com",
  "environment": "dev",
  "githubRepo": "new-models"
}

Response:
{
  "success": true,
  "data": {
    "id": "project-2",
    "name": "New Model Project",
    ...
  }
}
```

### Get Project
```
GET /projects/{projectId}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Update Project
```
PUT /projects/{projectId}

Body:
{
  "name": "Updated Name",
  "environment": "staging"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Delete Project
```
DELETE /projects/{projectId}

Response:
{
  "success": true,
  "message": "Project deleted"
}
```

## Pipelines API

### List Pipelines for Project
```
GET /pipelines/{projectId}

Response:
{
  "success": true,
  "data": [
    {
      "id": "pipeline-1",
      "projectId": "project-1",
      "name": "Canonical Pipeline",
      "version": "1.0.0",
      "status": "active",
      "nodes": [ ... ],
      "lockedNodes": ["4", "8"],
      "githubPath": "pipelines/project-1/canonical-pipeline.json",
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### Create Pipeline
```
POST /pipelines

Body:
{
  "projectId": "project-1",
  "name": "Data to Deployment",
  "nodes": [
    {
      "id": "1",
      "name": "Data Ingestion",
      "type": "input",
      "config": { "source": "s3://bucket" }
    },
    {
      "id": "2",
      "name": "Data Preparation",
      "type": "process",
      "inputs": ["1"]
    },
    {
      "id": "3",
      "name": "Feature Store",
      "type": "process",
      "inputs": ["2"]
    },
    {
      "id": "4",
      "name": "Model Registry",
      "type": "process",
      "inputs": ["3"],
      "locked": true
    },
    {
      "id": "5",
      "name": "Model Deployment",
      "type": "output",
      "inputs": ["4"]
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "id": "pipeline-2",
    ...
  }
}
```

### Get Pipeline
```
GET /pipelines/{projectId}/{pipelineId}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Lock Pipeline Nodes
```
POST /pipelines/{pipelineId}/lock

Body:
{
  "nodeIds": ["4", "8"],
  "user": "alice@org.com"
}

Response:
{
  "success": true,
  "data": {
    "pipeline": { ... },
    "message": "Nodes locked"
  }
}
```

### Run Pipeline
```
POST /pipelines/{pipelineId}/run

Body:
{
  "trigger": "manual",
  "user": "alice@org.com"
}

Response:
{
  "success": true,
  "data": {
    "executionId": "exec-123456",
    "pipelineId": "pipeline-1",
    "status": "queued",
    "message": "Pipeline execution started"
  }
}
```

## Models API

### List Models
```
GET /models

Response:
{
  "success": true,
  "data": [
    {
      "id": "model-1",
      "name": "sales-forecaster",
      "version": "2.1.0",
      "mlflowUri": "models:/sales-forecaster/2",
      "registryPath": "s3://models/sales-forecaster/2.1.0",
      "environment": "prod",
      "status": "deployed",
      "metrics": {
        "accuracy": 0.94,
        "precision": 0.92,
        "recall": 0.95
      },
      "createdAt": "2024-01-15T08:00:00Z"
    }
  ]
}
```

### Register Model
```
POST /models/register

Body:
{
  "name": "new-model",
  "version": "1.0.0",
  "mlflowUri": "s3://models/new-model/1.0.0",
  "metrics": {
    "accuracy": 0.96,
    "f1_score": 0.94
  },
  "user": "alice@org.com"
}

Response:
{
  "success": true,
  "data": {
    "id": "model-2",
    "name": "new-model",
    "version": "1.0.0",
    "environment": "dev",
    "status": "registered"
  }
}
```

### Promote Model
```
POST /models/{modelId}/promote

Body:
{
  "toEnvironment": "staging",
  "approvals": ["reviewer1@org.com", "reviewer2@org.com"],
  "user": "alice@org.com"
}

Response:
{
  "success": true,
  "data": {
    "model": { ... },
    "message": "Model promoted to staging"
  }
}
```

## Deployments API

### List Deployments
```
GET /deployments

Response:
{
  "success": true,
  "data": [
    {
      "id": "deploy-1",
      "modelId": "model-1",
      "environment": "prod",
      "containerImage": "123456789012.dkr.ecr.us-east-1.amazonaws.com/inference:v2.1.0",
      "ecsTaskArn": "arn:aws:ecs:us-east-1:123456789012:task/mlops-prod/abc123",
      "ecsServiceName": "mlops-inference-sales-forecaster-prod",
      "status": "active",
      "approvals": ["reviewer1@org.com", "reviewer2@org.com"],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Create Deployment
```
POST /deployments

Body:
{
  "modelId": "model-2",
  "environment": "dev",
  "containerImage": "123456789012.dkr.ecr.us-east-1.amazonaws.com/inference:v1.0.0",
  "user": "alice@org.com"
}

Response:
{
  "success": true,
  "data": {
    "id": "deploy-2",
    "modelId": "model-2",
    "status": "deploying"
  }
}
```

### Rollback Deployment
```
POST /deployments/{deploymentId}/rollback

Body:
{
  "reason": "High error rate detected",
  "user": "alice@org.com"
}

Response:
{
  "success": true,
  "data": {
    "deployment": { ... },
    "message": "Rollback initiated"
  }
}
```

## Monitoring API

### Get Drift Metrics
```
GET /monitoring/drift/{modelId}

Response:
{
  "success": true,
  "data": {
    "modelId": "model-1",
    "dataDrift": {
      "detected": true,
      "score": 15.3,
      "features": ["age", "income"],
      "lastCheck": "2024-01-22T10:00:00Z"
    },
    "conceptDrift": {
      "detected": false,
      "score": 4.2,
      "lastCheck": "2024-01-22T10:00:00Z"
    },
    "predictionDrift": {
      "detected": true,
      "score": 12.1,
      "lastCheck": "2024-01-22T10:00:00Z"
    }
  }
}
```

### Get Alerts
```
GET /monitoring/alerts

Response:
{
  "success": true,
  "data": [
    {
      "id": "alert-1",
      "severity": "warning",
      "message": "Data drift detected in model-1",
      "modelId": "model-1",
      "timestamp": "2024-01-22T10:05:00Z"
    },
    {
      "id": "alert-2",
      "severity": "info",
      "message": "Pipeline execution completed",
      "timestamp": "2024-01-22T10:00:00Z"
    }
  ]
}
```

### Create Alert Rule
```
POST /monitoring/alerts

Body:
{
  "name": "High Latency Alert",
  "modelId": "model-1",
  "metric": "inference_latency_p99",
  "threshold": 100,
  "operator": ">",
  "evaluationPeriods": 2,
  "period": 300,
  "actions": ["SNS:send_slack", "SNS:send_email"],
  "user": "alice@org.com"
}

Response:
{
  "success": true,
  "data": {
    "id": "alert-rule-1",
    "name": "High Latency Alert",
    "status": "enabled"
  }
}
```

## GitHub Integrations API

### Connect GitHub
```
POST /integrations/github/connect

Body:
{
  "code": "gho_authorization_code",
  "state": "state_value",
  "user": "alice@org.com"
}

Response:
{
  "success": true,
  "data": {
    "provider": "github",
    "status": "connected",
    "message": "GitHub connected successfully"
  }
}
```

### List Connected Repositories
```
GET /integrations/github/repos

Response:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "ml-models",
      "owner": "your-org",
      "branch": "main",
      "lastSync": "2024-01-22T09:30:00Z"
    },
    {
      "id": "2",
      "name": "data-pipelines",
      "owner": "your-org",
      "branch": "develop",
      "lastSync": "2024-01-22T09:45:00Z"
    }
  ]
}
```

### Sync Repository
```
POST /integrations/github/sync

Body:
{
  "repoId": "1",
  "user": "alice@org.com"
}

Response:
{
  "success": true,
  "data": {
    "status": "synced",
    "changes": 3,
    "message": "Repository synced successfully"
  }
}
```

## Audit Logs API

### Get Audit Logs
```
GET /audit-logs?limit=100&offset=0

Response:
{
  "success": true,
  "data": [
    {
      "id": "log-1",
      "action": "CREATE",
      "user": "alice@org.com",
      "resource": "pipeline",
      "resourceId": "pipeline-1",
      "timestamp": "2024-01-22T10:00:00Z",
      "details": {
        "name": "Canonical Pipeline",
        "environment": "dev"
      }
    }
  ]
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Common Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

**Next**: See [PIPELINES.md](PIPELINES.md) for pipeline configuration details.
