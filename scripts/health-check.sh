#!/bin/bash

# MLOps Studio - Health Check Script

set -e

FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"
MLFLOW_URL="http://localhost:5001"
DB_HOST="localhost"
DB_PORT="5432"

echo "🏥 Checking MLOps Studio health..."
echo ""

# Frontend health
echo "📱 Frontend:"
if curl -s $FRONTEND_URL > /dev/null 2>&1; then
    echo "  ✓ Running"
else
    echo "  ✗ Not responding"
fi

# Backend health
echo ""
echo "🔧 Backend:"
if curl -s $BACKEND_URL/health > /dev/null 2>&1; then
    echo "  ✓ Running"
    STATUS=$(curl -s $BACKEND_URL/health | jq -r '.status' 2>/dev/null || echo "unknown")
    echo "  Status: $STATUS"
else
    echo "  ✗ Not responding"
fi

# MLflow health
echo ""
echo "📊 MLflow:"
if curl -s $MLFLOW_URL/health > /dev/null 2>&1; then
    echo "  ✓ Running"
else
    echo "  ✗ Not responding"
fi

# Database health
echo ""
echo "🗄️  Database:"
if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
    echo "  ✓ Accessible"
else
    echo "  ✗ Not accessible"
fi

# Docker services
echo ""
echo "🐳 Docker Services:"
docker-compose ps --format "table {{.Service}}\t{{.Status}}" | tail -n +2 | while read service status; do
    if [[ "$status" == *"Up"* ]]; then
        echo "  ✓ $service"
    else
        echo "  ✗ $service"
    fi
done

echo ""
echo "💡 Troubleshooting:"
echo "  - View logs: docker-compose logs -f <service>"
echo "  - Restart services: docker-compose restart"
echo "  - Check configuration: cat .env"
echo ""
