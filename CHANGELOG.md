{
  "version": "3",
  "logVersion": 1,
  "date": "2024-01-28",
  "changes": [
    {
      "type": "feat",
      "scope": "platform",
      "description": "Initial MLOps Studio release",
      "details": [
        "Pipeline-first architecture with 8 canonical stages",
        "AWS-managed compute (ECS Fargate, no Kubernetes)",
        "GitHub-native CI/CD with approval workflows",
        "Model registry with MLflow integration",
        "Comprehensive drift detection and monitoring",
        "Full RBAC with audit logging",
        "Blue-green deployments with auto-rollback"
      ]
    },
    {
      "type": "feat",
      "scope": "frontend",
      "description": "React UI with all core pages",
      "details": [
        "Dashboard with KPIs and alerts",
        "Projects management",
        "Visual pipeline DAG builder",
        "Monitoring & drift detection views",
        "CI/CD pipeline history",
        "GitHub integrations",
        "Admin panel for RBAC"
      ]
    },
    {
      "type": "feat",
      "scope": "backend",
      "description": "Express API with complete feature set",
      "details": [
        "Projects, pipelines, models, deployments APIs",
        "Immutable audit logging",
        "GitHub integration endpoints",
        "Monitoring and drift detection APIs",
        "Approval workflow management"
      ]
    },
    {
      "type": "feat",
      "scope": "infrastructure",
      "description": "Terraform IaC for AWS deployment",
      "details": [
        "VPC with public/private subnets",
        "RDS PostgreSQL for metadata",
        "ECR repositories for containers",
        "ECS Fargate for serverless compute",
        "ALB for load balancing",
        "S3 for data/models/artifacts",
        "CloudWatch for monitoring",
        "IAM roles with least privilege"
      ]
    },
    {
      "type": "feat",
      "scope": "ci-cd",
      "description": "GitHub Actions workflows",
      "details": [
        "Pipeline validation on PRs",
        "Auto-deploy to dev on main merge",
        "Staging promotion with canary",
        "Production promotion with blue-green",
        "Approval gates and audit logging"
      ]
    },
    {
      "type": "feat",
      "scope": "model-registry",
      "description": "MLflow-based model management",
      "details": [
        "Model registration API",
        "Version management",
        "Promotion workflows",
        "Artifact storage in S3"
      ]
    },
    {
      "type": "feat",
      "scope": "monitoring",
      "description": "Drift detection and observability",
      "details": [
        "Data drift detection (KS test)",
        "Concept drift detection",
        "Prediction drift detection",
        "CloudWatch metrics",
        "Alert rules with SNS"
      ]
    },
    {
      "type": "docs",
      "scope": "documentation",
      "description": "Comprehensive documentation",
      "details": [
        "Architecture overview",
        "Setup and deployment guides",
        "API reference",
        "Contributing guide",
        "Best practices"
      ]
    }
  ]
}
