# MLOps Studio - Final Setup Guide with Docker

## ✅ Project Status: COMPLETE

Your MLOps Studio project is fully built with:
- ✅ Full backend API (Express.js with TypeScript)
- ✅ React frontend (Vite + TailwindCSS)
- ✅ Docker setup for all services
- ✅ PostgreSQL database
- ✅ Model registry, serving, and monitoring
- ✅ AWS infrastructure (Terraform)
- ✅ CI/CD pipelines

---

## 📋 Prerequisites

Install these on your Windows machine:

### 1. Node.js (Required)
- **Download**: https://nodejs.org/ (LTS version 18+)
- **Verify installation**:
  ```powershell
  node --version
  npm --version
  ```

### 2. Docker Desktop (Required)
- **Download**: https://www.docker.com/products/docker-desktop
- **Verify installation**:
  ```powershell
  docker --version
  docker run hello-world
  ```

### 3. Git (Optional but recommended)
- **Download**: https://git-scm.com/

---

## 🚀 Quick Start (Docker Method)

This is the **recommended** way to run the entire MLOps Studio stack.

### Step 1: Navigate to project
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
```

### Step 2: Start all services with Docker Compose
```powershell
docker-compose up -d
```

This starts:
- **Frontend**: http://localhost:3000 (React with Vite)
- **Backend**: http://localhost:5000 (Express API)
- **Database**: PostgreSQL on port 5432
- **MLflow**: http://localhost:5000 (model registry)

### Step 3: Check services are running
```powershell
docker-compose ps
```

You should see:
```
NAME               STATUS
mlops-studio-frontend    Up
mlops-studio-backend     Up
mlops-studio-db         Up
mlops-studio-mlflow     Up
```

### Step 4: Access the app
Open browser: **http://localhost:3000**

---

## 🛑 Stop all services
```powershell
docker-compose down
```

---

## 💻 Alternative: Local Development (Without Docker)

If you prefer running locally without Docker:

### Terminal 1: Backend API
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1\backend"
npm install
npm run dev
```

Expected output:
```
🔌 Backend API running on http://localhost:5000
```

### Terminal 2: Frontend
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1\frontend"
npm install
npm run dev
```

Expected output:
```
VITE v4.1.1  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Then visit: **http://localhost:5173**

---

## 📁 Project Structure

```
mlops-studio/
├── frontend/              # React + Vite + TailwindCSS UI
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/         # Dashboard, Projects, Models, Pipelines
│   │   └── main.tsx
│   ├── package.json
│   ├── Dockerfile.dev     # Dev build
│   └── Dockerfile.prod    # Production build
│
├── backend/               # Express.js API
│   ├── src/
│   │   └── app.ts         # Main API server
│   ├── package.json
│   └── Dockerfile         # Backend container
│
├── model-registry/        # Python MLflow integration
├── model-serving/         # Model inference server
├── monitoring/            # Performance monitoring
│
├── infra/                 # AWS Terraform configs
│   ├── main.tf
│   ├── vpc.tf
│   ├── ecs.tf
│   ├── rds.tf
│   └── ...
│
├── cicd/                  # CI/CD pipeline definitions
│   ├── deploy-to-dev.yml
│   ├── promote-to-prod.yml
│   └── pipeline-validation.yml
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml     # Local Docker orchestration
├── package.json           # Root workspace config
└── README.md              # Overview
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000`

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T10:00:00Z"
}
```

### Projects (CRUD)
```
GET    /api/projects          # List all projects
POST   /api/projects          # Create new project
GET    /api/projects/:id      # Get project details
PUT    /api/projects/:id      # Update project
DELETE /api/projects/:id      # Delete project
```

### Models
```
GET /api/models              # List all models
POST /api/models             # Register new model
```

### Pipelines
```
GET /api/pipelines           # List all pipelines
POST /api/pipelines          # Create new pipeline
GET /api/pipelines/:id       # Get pipeline details
```

---

## 🧪 Testing

### Test API Health
```powershell
curl http://localhost:5000/api/health
```

### Test Project Creation
```powershell
$body = @{
    name = "Test Project"
    description = "My test project"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/projects" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Test Frontend
1. Open http://localhost:3000
2. Navigate to "Projects" tab
3. Create a new project
4. Verify it appears in the list
5. Check Dashboard for updated stats

---

## 📊 Frontend Features

- **Dashboard**: Real-time KPIs and system status
- **Projects**: Create, manage ML projects
- **Models**: Model registry and metadata
- **Pipelines**: Pipeline orchestration with DAG visualization
- **Integrations**: GitHub, AWS, MLflow connections
- **Monitoring**: Real-time metrics and alerts
- **CI/CD**: Pipeline status and deployment logs

---

## 🔧 Environment Variables

### Backend (.env or docker-compose.yml)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@db:5432/mlopsdb
MLFLOW_TRACKING_URI=http://mlflow:5000
AWS_ENDPOINT_URL=http://localstack:4566
AWS_DEFAULT_REGION=us-east-1
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

---

## 🐛 Troubleshooting

### Docker won't start
```powershell
# Check Docker daemon
docker ps

# Restart Docker
Restart-Service Docker
```

### Port already in use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Database connection error
```powershell
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs db
```

### Frontend not connecting to API
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend environment
- Check browser console for CORS errors

---

## 📚 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Getting Started](GETTING_STARTED.md)

---

## ✨ Next Steps

After setup:

1. **Create a project**: Navigate to Projects tab, create test project
2. **Explore pipelines**: Check pipeline DAG builder
3. **Test integrations**: Connect to GitHub/AWS
4. **Configure monitoring**: Set up alerts and dashboards
5. **Deploy to AWS**: Use Terraform configs in `infra/` folder

---

## 🎯 Summary

| Task | Command | Status |
|------|---------|--------|
| Prerequisites | Install Node.js + Docker | ✅ Required |
| Start services | `docker-compose up -d` | ✅ Simple |
| Access app | http://localhost:3000 | ✅ Ready |
| Stop services | `docker-compose down` | ✅ Clean |
| Local dev | `npm run dev` in each dir | ✅ Alternative |

---

**Your MLOps Studio is ready to use! Start with `docker-compose up -d` 🚀**
