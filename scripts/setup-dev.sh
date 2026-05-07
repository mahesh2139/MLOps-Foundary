#!/bin/bash

# MLOps Studio - Local Development Setup Script

set -e

echo "🚀 Starting MLOps Studio development environment..."

# Check prerequisites
check_requirements() {
    echo "✓ Checking prerequisites..."
    
    command -v docker &> /dev/null || { echo "❌ Docker not installed"; exit 1; }
    command -v docker-compose &> /dev/null || { echo "❌ Docker Compose not installed"; exit 1; }
    command -v node &> /dev/null || { echo "❌ Node.js not installed"; exit 1; }
    
    echo "✓ All prerequisites met"
}

# Create .env file
create_env() {
    echo "✓ Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "  Created .env from template"
    else
        echo "  .env already exists"
    fi
}

# Install dependencies
install_deps() {
    echo "✓ Installing dependencies..."
    
    npm install
    npm install --workspace=frontend
    npm install --workspace=backend
    
    echo "  Dependencies installed"
}

# Start Docker services
start_services() {
    echo "✓ Starting Docker services..."
    
    docker-compose up -d
    
    # Wait for services to be ready
    echo "  Waiting for services to be ready..."
    sleep 10
    
    # Check database
    echo "  Checking database..."
    for i in {1..30}; do
        if docker-compose exec -T db pg_isready -U postgres &> /dev/null; then
            echo "  ✓ Database ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "  ❌ Database failed to start"
            exit 1
        fi
        sleep 1
    done
}

# Initialize database
init_database() {
    echo "✓ Initializing database..."
    
    # Create tables (simplified schema)
    docker-compose exec -T db psql -U postgres -d mlopsdb << EOF
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pipelines (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    dag JSONB,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    status VARCHAR(50),
    metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(255),
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner);
CREATE INDEX IF NOT EXISTS idx_pipelines_project ON pipelines(project_id);
CREATE INDEX IF NOT EXISTS idx_models_project ON models(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
EOF
    
    echo "  Database initialized"
}

# Display summary
show_summary() {
    echo ""
    echo "✅ MLOps Studio development environment is ready!"
    echo ""
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:5000"
    echo "📊 MLflow: http://localhost:5001"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "🚀 Start development:"
    echo "   npm run dev"
    echo ""
    echo "📚 Documentation: ./docs/"
    echo "🐳 Docker: docker-compose ps"
    echo "🛑 Stop services: docker-compose down"
    echo ""
}

# Main execution
main() {
    check_requirements
    create_env
    install_deps
    start_services
    init_database
    show_summary
}

main
