# MLOps Studio - Quick Start Guide

Get MLOps Studio up and running in 5 minutes!

## 🚀 Local Development Setup

### Option 1: Automated Setup (Recommended)

```bash
# Clone and enter the directory
cd mlops-studio

# Run setup script
bash scripts/setup-dev.sh
```

The script will:
- ✓ Check prerequisites (Docker, Node.js, etc.)
- ✓ Install npm dependencies
- ✓ Start Docker services (PostgreSQL, MLflow, LocalStack)
- ✓ Initialize database schema
- ✓ Display service URLs

### Option 2: Manual Setup

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start services
docker-compose up -d

# 4. Initialize database (in another terminal)
bash scripts/init-db.sh

# 5. Start development servers
npm run dev
```

## 📱 Accessing the Application

Once setup is complete:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web UI |
| Backend API | http://localhost:5000 | REST API |
| MLflow | http://localhost:5001 | Model Registry |
| Database | localhost:5432 | PostgreSQL |

**Test Setup:**
```bash
bash scripts/health-check.sh
```

## 📚 First Steps

### 1. Create a Project
```bash
curl -X POST http://localhost:5000/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "description": "ML project for testing",
    "github_repo": "https://github.com/your-org/your-repo"
  }'
```

### 2. Define a Pipeline
```bash
curl -X POST http://localhost:5000/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "PROJECT_ID",
    "name": "Default Pipeline",
    "dag": {
      "nodes": [
        {"id": "ingestion", "type": "ingestion"},
        {"id": "preparation", "type": "preparation"},
        {"id": "features", "type": "features"},
        {"id": "registry", "type": "registry"},
        {"id": "deployment", "type": "deployment"},
        {"id": "inference", "type": "inference"},
        {"id": "monitoring", "type": "monitoring"},
        {"id": "feedback", "type": "feedback"}
      ]
    }
  }'
```

### 3. Train and Register a Model
```bash
bash scripts/example-train-model.sh
```

### 4. View in UI
Open http://localhost:3000 and navigate through:
- **Dashboard**: See overview and metrics
- **Projects**: Manage your ML projects
- **Pipeline DAG**: Visual pipeline editor
- **Models**: Track and promote models
- **Monitoring**: View drift and alerts

## 🛑 Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔧 Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f mlflow
```

### Database Access
```bash
# Connect to database
docker-compose exec db psql -U postgres -d mlopsdb

# Useful queries:
# List projects: SELECT * FROM projects;
# List pipelines: SELECT * FROM pipelines;
# View audit logs: SELECT * FROM audit_logs LIMIT 10;
```

### Backend Development
```bash
# Watch and rebuild TypeScript
cd backend
npm run dev

# Run tests
npm test

# Check linting
npm run lint
```

### Frontend Development
```bash
# Watch and hot reload
cd frontend
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## 📖 Full Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and components
- **[SETUP.md](docs/SETUP.md)** - Detailed setup instructions
- **[API.md](docs/API.md)** - Complete API reference
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines

## 🐛 Troubleshooting

### Services not starting?
```bash
# Check Docker status
docker-compose ps

# Restart all services
docker-compose restart

# View error logs
docker-compose logs backend
```

### Database connection failed?
```bash
# Verify database is ready
docker-compose exec db pg_isready -U postgres

# Re-initialize schema
bash scripts/init-db.sh
```

### Port conflicts?
Edit `.env` to use different ports:
```
FRONTEND_PORT=3001
BACKEND_PORT=5001
MLFLOW_PORT=5002
```

### Need fresh start?
```bash
# Stop and remove everything
docker-compose down -v

# Reinstall dependencies
rm -rf node_modules
npm install

# Start fresh
npm run dev
```

## 🚀 Deploying to AWS

Once ready for production:

```bash
# Set up AWS credentials
aws configure

# Deploy to dev environment
bash scripts/deploy-aws.sh dev us-east-1

# Deploy to production
bash scripts/deploy-aws.sh prod us-east-1
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed AWS setup.

## 📞 Support

- **Slack**: #mlops-studio
- **Email**: mlops-team@org.com
- **Issues**: GitHub Issues
- **Docs**: Full documentation in `/docs`

## ✅ Next Steps

1. Explore the UI at http://localhost:3000
2. Create a project and pipeline
3. Train a model using the example script
4. Deploy a model to staging
5. Monitor model performance
6. Check drift detection metrics

Happy MLOps! 🎉
