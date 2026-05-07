# MLOps Studio - Manual Launch Instructions

Here are **manual step-by-step instructions** to launch MLOps Studio (without relying on Docker authentication issues).

---

## **Option 1: Simple Local Servers (Easiest - No Docker)**

### Prerequisites (if not installed):
- Node.js: https://nodejs.org/ (v18+)
- PostgreSQL: https://www.postgresql.org/download/ OR use Docker Desktop

---

### Step 1: Navigate to Project
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
```

### Step 2: Install Dependencies
```powershell
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Start PostgreSQL Database (Choose One)

**Option A - Using Docker (single service):**
```powershell
docker run -d `
  --name mlops-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=mlopsdb `
  -p 5432:5432 `
  -v "D:/ML_Data/postgres_data:/var/lib/postgresql/data" `
  postgres:15-alpine
```

**Option B - Using local PostgreSQL installation:**
```powershell
# Make sure PostgreSQL service is running
# Create database:
psql -U postgres -c "CREATE DATABASE mlopsdb;"
```

### Step 4: Start Backend API (Terminal 1)
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1\backend"
npm run dev
```

Expected output:
```
🔌 Backend API running on http://localhost:5000
```

### Step 5: Start Frontend (Terminal 2)
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1\frontend"
npm run dev
```

Expected output:
```
VITE ready in 100 ms
➜  Local:   http://localhost:5173
```

### Step 6: Open Application
- **Frontend**: http://localhost:5173 (or http://localhost:3000)
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:5432 (postgres / password)

---

## **Option 2: Docker Compose (After Docker Auth Fixed)**

If you want to use Docker Compose and the auth issue is resolved:

```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"

# Stop any existing services
docker-compose down

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Access at: http://localhost:3000

---

## **Option 3: Node.js Only (Fastest)**

If you only need backend + frontend without PostgreSQL:

### Terminal 1 - Backend:
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1\backend"
npm install
npm run dev
```

### Terminal 2 - Frontend:
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1\frontend"
npm install
npm run dev
```

Then open: http://localhost:5173

---

## **QUICK REFERENCE - PORTS & SERVICES**

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Frontend | 3000 or 5173 | http://localhost:3000 | Open in browser |
| Backend API | 5000 | http://localhost:5000/api | API endpoint |
| Database | 5432 | localhost:5432 | postgres/password |
| MLflow | 5001 | http://localhost:5001 | Model registry |

---

## **STORAGE CONFIGURATION**

All data is configured to use **D:\ML_Data**:
- PostgreSQL data: `D:\ML_Data\postgres_data`
- MLflow artifacts: `D:\ML_Data\mlflow_artifacts`
- Nothing gets stored on C: drive ✓

---

## **TROUBLESHOOTING**

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in .env or docker-compose.yml |
| PostgreSQL won't connect | Check service is running: `docker ps` |
| Frontend blank | Check browser console for API errors |
| Backend won't start | Run `npm install` again in backend folder |
| Docker image pull fails | Use Option 1 (local servers without Docker) |

---

## **RECOMMENDED: Start with Option 1 (Local Servers)**

This avoids Docker authentication issues and gets you running fastest:

```powershell
# In Project Root
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"

# Terminal 1: Start PostgreSQL
docker run -d --name mlops-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mlopsdb -p 5432:5432 -v "D:/ML_Data/postgres_data:/var/lib/postgresql/data" postgres:15-alpine

# Terminal 2: Start Backend
cd backend && npm install && npm run dev

# Terminal 3: Start Frontend
cd frontend && npm install && npm run dev

# Browser: Open http://localhost:5173
```

**Done! 🚀** Your MLOps Studio is running on http://localhost:5173

---

## **Stop Services**

```powershell
# Stop PostgreSQL container
docker stop mlops-postgres

# Stop Node servers
# In each terminal: Ctrl+C
```

---

## **Clean Up**

```powershell
# Remove PostgreSQL container
docker rm mlops-postgres

# Remove stopped containers
docker container prune

# Clear all data (WARNING: deletes database)
Remove-Item -Recurse -Force "D:\ML_Data\*"
```
