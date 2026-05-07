#!/bin/bash

# MLOps Studio - AWS Deployment Script

set -e

ENVIRONMENT=${1:-dev}
AWS_REGION=${2:-us-east-1}

echo "🚀 Deploying MLOps Studio to AWS"
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"

# Validate environment
validate_env() {
    if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
        echo "❌ Invalid environment. Use: dev, staging, or prod"
        exit 1
    fi
}

# Check AWS credentials
check_aws() {
    echo "✓ Checking AWS credentials..."
    
    aws sts get-caller-identity --region $AWS_REGION > /dev/null || {
        echo "❌ AWS credentials not configured"
        exit 1
    }
    
    echo "✓ AWS credentials valid"
}

# Build Docker images
build_images() {
    echo "✓ Building Docker images..."
    
    docker build -f frontend/Dockerfile.prod -t mlops-frontend:latest frontend/
    docker build -f backend/Dockerfile -t mlops-backend:latest backend/
    docker build -f model-registry/Dockerfile -t mlops-mlflow:latest model-registry/
    docker build -f model-serving/Dockerfile -t mlops-inference:latest model-serving/
    
    echo "✓ Docker images built"
}

# Push to ECR
push_to_ecr() {
    echo "✓ Pushing images to ECR..."
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $ECR_REGISTRY
    
    # Tag and push images
    docker tag mlops-frontend:latest $ECR_REGISTRY/mlops-frontend:latest
    docker tag mlops-backend:latest $ECR_REGISTRY/mlops-backend:latest
    docker tag mlops-mlflow:latest $ECR_REGISTRY/mlops-mlflow:latest
    docker tag mlops-inference:latest $ECR_REGISTRY/mlops-inference:latest
    
    docker push $ECR_REGISTRY/mlops-frontend:latest
    docker push $ECR_REGISTRY/mlops-backend:latest
    docker push $ECR_REGISTRY/mlops-mlflow:latest
    docker push $ECR_REGISTRY/mlops-inference:latest
    
    echo "✓ Images pushed to ECR"
}

# Deploy Terraform
deploy_terraform() {
    echo "✓ Deploying infrastructure with Terraform..."
    
    cd infra
    
    terraform init -backend=true \
        -backend-config="key=mlops-$ENVIRONMENT.tfstate" \
        -backend-config="region=$AWS_REGION"
    
    terraform plan -var-file="environments/${ENVIRONMENT}.tfvars" \
        -var="aws_region=$AWS_REGION" \
        -out=tfplan
    
    terraform apply tfplan
    
    cd ..
    
    echo "✓ Infrastructure deployed"
}

# Run tests
run_tests() {
    echo "✓ Running tests..."
    
    npm test --workspace=backend -- --passWithNoTests
    
    echo "✓ Tests passed"
}

# Verify deployment
verify_deployment() {
    echo "✓ Verifying deployment..."
    
    # Get outputs
    ALB_URL=$(cd infra && terraform output -raw alb_dns_name 2>/dev/null || echo "")
    
    if [ ! -z "$ALB_URL" ]; then
        echo "✓ Application URL: http://${ALB_URL}"
        
        # Wait for health check
        for i in {1..30}; do
            if curl -f http://${ALB_URL}/health &> /dev/null; then
                echo "✓ Application is healthy"
                break
            fi
            if [ $i -eq 30 ]; then
                echo "⚠️  Application health check timed out"
            fi
            sleep 2
        done
    fi
}

# Show summary
show_summary() {
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 Environment: $ENVIRONMENT"
    echo "🌍 Region: $AWS_REGION"
    echo ""
    echo "📚 Next steps:"
    echo "   - Check CloudWatch logs: aws logs tail /mlops/backend"
    echo "   - Scale services: aws application-autoscaling"
    echo "   - Monitor metrics: aws cloudwatch get-metric-statistics"
    echo ""
}

# Main execution
main() {
    validate_env
    check_aws
    build_images
    push_to_ecr
    run_tests
    deploy_terraform
    verify_deployment
    show_summary
}

main
