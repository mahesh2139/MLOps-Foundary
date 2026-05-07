#!/bin/bash

# MLOps Studio - API Testing Guide
# Quick reference for testing all major endpoints

BASE_URL="http://localhost:5000"
PROJECT_ID=""
PIPELINE_ID=""
MODEL_ID=""
DEPLOYMENT_ID=""

echo "🧪 MLOps Studio API Testing Guide"
echo "Base URL: $BASE_URL"
echo ""

# Test health endpoint
test_health() {
    echo "📡 Testing health check..."
    curl -s "$BASE_URL/health" | jq .
    echo ""
}

# Create project
create_project() {
    echo "🆕 Creating project..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Project '$(date +%s)'",
            "description": "Test project for API validation",
            "owner_id": "test-user",
            "github_repo": "https://github.com/test/repo"
        }')
    
    PROJECT_ID=$(echo $RESPONSE | jq -r '.id // empty')
    echo $RESPONSE | jq .
    echo ""
    
    if [ -z "$PROJECT_ID" ]; then
        echo "❌ Failed to create project"
        return 1
    fi
    echo "✓ Project created: $PROJECT_ID"
}

# Get projects
get_projects() {
    echo "📋 Getting all projects..."
    curl -s "$BASE_URL/projects" | jq .
    echo ""
}

# Create pipeline
create_pipeline() {
    if [ -z "$PROJECT_ID" ]; then
        echo "❌ Project ID not set. Create a project first."
        return 1
    fi
    
    echo "🔀 Creating pipeline..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/pipelines" \
        -H "Content-Type: application/json" \
        -d '{
            "project_id": "'$PROJECT_ID'",
            "name": "Test Pipeline",
            "description": "Test pipeline DAG",
            "dag": {
                "nodes": [
                    {"id": "ingestion", "type": "ingestion", "params": {}},
                    {"id": "preparation", "type": "preparation", "params": {}},
                    {"id": "features", "type": "features", "params": {}},
                    {"id": "registry", "type": "registry", "params": {}},
                    {"id": "deployment", "type": "deployment", "params": {}},
                    {"id": "inference", "type": "inference", "params": {}},
                    {"id": "monitoring", "type": "monitoring", "params": {}},
                    {"id": "feedback", "type": "feedback", "params": {}}
                ],
                "edges": [
                    {"from": "ingestion", "to": "preparation"},
                    {"from": "preparation", "to": "features"},
                    {"from": "features", "to": "registry"},
                    {"from": "registry", "to": "deployment"},
                    {"from": "deployment", "to": "inference"},
                    {"from": "inference", "to": "monitoring"},
                    {"from": "monitoring", "to": "feedback"}
                ]
            }
        }')
    
    PIPELINE_ID=$(echo $RESPONSE | jq -r '.id // empty')
    echo $RESPONSE | jq .
    echo ""
    
    if [ -z "$PIPELINE_ID" ]; then
        echo "❌ Failed to create pipeline"
        return 1
    fi
    echo "✓ Pipeline created: $PIPELINE_ID"
}

# Register model
register_model() {
    if [ -z "$PROJECT_ID" ]; then
        echo "❌ Project ID not set. Create a project first."
        return 1
    fi
    
    echo "📦 Registering model..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/models" \
        -H "Content-Type: application/json" \
        -d '{
            "project_id": "'$PROJECT_ID'",
            "name": "test-model",
            "description": "Test model for API validation",
            "framework": "sklearn",
            "version": "1.0.0",
            "metrics": {
                "accuracy": 0.95,
                "precision": 0.94,
                "recall": 0.95,
                "f1": 0.945
            },
            "artifact_path": "s3://mlops-models-dev/test-model/1.0.0",
            "mlflow_run_id": "test-run-123",
            "registry_uri": "http://localhost:5001"
        }')
    
    MODEL_ID=$(echo $RESPONSE | jq -r '.id // empty')
    echo $RESPONSE | jq .
    echo ""
    
    if [ -z "$MODEL_ID" ]; then
        echo "❌ Failed to register model"
        return 1
    fi
    echo "✓ Model registered: $MODEL_ID"
}

# Get models
get_models() {
    if [ -z "$PROJECT_ID" ]; then
        echo "❌ Project ID not set."
        return 1
    fi
    
    echo "📚 Getting project models..."
    curl -s "$BASE_URL/models?project_id=$PROJECT_ID" | jq .
    echo ""
}

# Promote model
promote_model() {
    if [ -z "$MODEL_ID" ]; then
        echo "❌ Model ID not set. Register a model first."
        return 1
    fi
    
    echo "🚀 Promoting model to staging..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/models/$MODEL_ID/promote" \
        -H "Content-Type: application/json" \
        -d '{
            "to_environment": "staging",
            "requested_by": "test-user",
            "approvals_required": 1
        }')
    
    echo $RESPONSE | jq .
    echo ""
}

# Create deployment
create_deployment() {
    if [ -z "$MODEL_ID" ]; then
        echo "❌ Model ID not set. Register a model first."
        return 1
    fi
    
    echo "🌐 Creating deployment..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/deployments" \
        -H "Content-Type: application/json" \
        -d '{
            "model_id": "'$MODEL_ID'",
            "environment": "dev",
            "deployment_type": "blue-green",
            "replicas": 2,
            "auto_rollback": true
        }')
    
    DEPLOYMENT_ID=$(echo $RESPONSE | jq -r '.id // empty')
    echo $RESPONSE | jq .
    echo ""
    
    if [ -z "$DEPLOYMENT_ID" ]; then
        echo "❌ Failed to create deployment"
        return 1
    fi
    echo "✓ Deployment created: $DEPLOYMENT_ID"
}

# Get monitoring metrics
get_drift_metrics() {
    if [ -z "$MODEL_ID" ]; then
        echo "❌ Model ID not set. Register a model first."
        return 1
    fi
    
    echo "📊 Getting drift metrics..."
    curl -s "$BASE_URL/monitoring/drift/$MODEL_ID" | jq .
    echo ""
}

# Get audit logs
get_audit_logs() {
    echo "📋 Getting audit logs..."
    curl -s "$BASE_URL/audit-logs?limit=10" | jq .
    echo ""
}

# Get pipeline runs
get_pipeline_runs() {
    if [ -z "$PIPELINE_ID" ]; then
        echo "❌ Pipeline ID not set. Create a pipeline first."
        return 1
    fi
    
    echo "⚙️  Getting pipeline runs..."
    curl -s "$BASE_URL/pipelines/$PIPELINE_ID/runs" | jq .
    echo ""
}

# Main menu
show_menu() {
    echo "🧪 API Test Menu"
    echo "=================="
    echo "1. Test health endpoint"
    echo "2. Create project"
    echo "3. List projects"
    echo "4. Create pipeline"
    echo "5. Register model"
    echo "6. List models"
    echo "7. Promote model"
    echo "8. Create deployment"
    echo "9. Get drift metrics"
    echo "10. Get audit logs"
    echo "11. Get pipeline runs"
    echo "12. Run all tests"
    echo "0. Exit"
    echo ""
}

# Run all tests
run_all_tests() {
    echo "🚀 Running all API tests..."
    echo "================================"
    
    test_health || exit 1
    get_projects
    create_project || exit 1
    create_pipeline || exit 1
    register_model || exit 1
    get_models
    promote_model
    create_deployment || exit 1
    get_drift_metrics
    get_audit_logs
    get_pipeline_runs
    
    echo "✅ All tests completed!"
    echo ""
    echo "📊 Created Resources:"
    echo "  Project ID: $PROJECT_ID"
    echo "  Pipeline ID: $PIPELINE_ID"
    echo "  Model ID: $MODEL_ID"
    echo "  Deployment ID: $DEPLOYMENT_ID"
    echo ""
}

# Interactive mode
if [ $# -eq 0 ]; then
    while true; do
        show_menu
        read -p "Select option: " choice
        
        case $choice in
            1) test_health ;;
            2) create_project ;;
            3) get_projects ;;
            4) create_pipeline ;;
            5) register_model ;;
            6) get_models ;;
            7) promote_model ;;
            8) create_deployment ;;
            9) get_drift_metrics ;;
            10) get_audit_logs ;;
            11) get_pipeline_runs ;;
            12) run_all_tests ;;
            0) echo "Bye!"; exit 0 ;;
            *) echo "Invalid option" ;;
        esac
    done
else
    # Command line mode
    case $1 in
        health) test_health ;;
        projects) get_projects ;;
        create-project) create_project ;;
        create-pipeline) create_project && create_pipeline ;;
        create-model) create_project && register_model ;;
        all) run_all_tests ;;
        *) 
            echo "Usage: $0 [health|projects|create-project|create-pipeline|create-model|all]"
            echo "Run without arguments for interactive mode"
            exit 1
            ;;
    esac
fi
