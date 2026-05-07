#!/bin/bash

# MLOps Studio - Database Schema Initialization

set -e

DB_HOST=${1:-localhost}
DB_PORT=${2:-5432}
DB_NAME=${3:-mlopsdb}
DB_USER=${4:-postgres}
DB_PASSWORD=${5:-password}

echo "🗄️  Initializing MLOps Studio database schema..."

# Function to run SQL
run_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -c "$1"
}

# Create extensions
echo "✓ Creating extensions..."
run_sql "CREATE EXTENSION IF NOT EXISTS uuid-ossp;"
run_sql "CREATE EXTENSION IF NOT EXISTS json;"

# Create tables
echo "✓ Creating tables..."

# Projects table
run_sql "
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    owner_id VARCHAR(255) NOT NULL,
    github_repo VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);"

# Pipelines table
run_sql "
CREATE TABLE IF NOT EXISTS pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dag JSONB NOT NULL,
    locked_nodes JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, name)
);"

# Pipeline runs table
run_sql "
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    triggered_by VARCHAR(255),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    parameters JSONB,
    outputs JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Models table
run_sql "
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    framework VARCHAR(50),
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'registered',
    metrics JSONB,
    artifact_path VARCHAR(1024),
    mlflow_run_id VARCHAR(255),
    registry_uri VARCHAR(1024),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, name, version)
);"

# Model promotions table
run_sql "
CREATE TABLE IF NOT EXISTS model_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    from_env VARCHAR(50) NOT NULL,
    to_env VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    requested_by VARCHAR(255),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approvals JSONB DEFAULT '[]',
    completed_at TIMESTAMP
);"

# Deployments table
run_sql "
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    environment VARCHAR(50) NOT NULL,
    deployment_type VARCHAR(50) DEFAULT 'blue-green',
    status VARCHAR(50) DEFAULT 'pending',
    current_version VARCHAR(50),
    previous_version VARCHAR(50),
    ecs_service_name VARCHAR(255),
    alb_target_group_arn VARCHAR(255),
    auto_rollback BOOLEAN DEFAULT true,
    replicas INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_id, environment)
);"

# Deployment runs table
run_sql "
CREATE TABLE IF NOT EXISTS deployment_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'in-progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    rolled_back BOOLEAN DEFAULT false,
    error_message TEXT
);"

# Monitoring - Drift scores table
run_sql "
CREATE TABLE IF NOT EXISTS drift_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    drift_type VARCHAR(50) NOT NULL,
    score FLOAT NOT NULL,
    threshold FLOAT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);"

# Audit logs table
run_sql "
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Users table
run_sql "
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    github_id VARCHAR(255),
    last_login TIMESTAMP,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Create indexes
echo "✓ Creating indexes..."

run_sql "CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);"
run_sql "CREATE INDEX IF NOT EXISTS idx_pipelines_project ON pipelines(project_id);"
run_sql "CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline ON pipeline_runs(pipeline_id);"
run_sql "CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);"
run_sql "CREATE INDEX IF NOT EXISTS idx_models_project ON models(project_id);"
run_sql "CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);"
run_sql "CREATE INDEX IF NOT EXISTS idx_model_promotions_model ON model_promotions(model_id);"
run_sql "CREATE INDEX IF NOT EXISTS idx_model_promotions_status ON model_promotions(status);"
run_sql "CREATE INDEX IF NOT EXISTS idx_deployments_model ON deployments(model_id);"
run_sql "CREATE INDEX IF NOT EXISTS idx_deployments_environment ON deployments(environment);"
run_sql "CREATE INDEX IF NOT EXISTS idx_drift_scores_model ON drift_scores(model_id);"
run_sql "CREATE INDEX IF NOT EXISTS idx_drift_scores_detected_at ON drift_scores(detected_at);"
run_sql "CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);"
run_sql "CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);"
run_sql "CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);"
run_sql "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"

echo ""
echo "✅ Database schema initialized successfully!"
echo ""
echo "Created tables:"
echo "  ✓ projects"
echo "  ✓ pipelines, pipeline_runs"
echo "  ✓ models, model_promotions"
echo "  ✓ deployments, deployment_runs"
echo "  ✓ drift_scores"
echo "  ✓ audit_logs"
echo "  ✓ users"
echo ""
