# MLOps Studio - Quick Start Commands (PowerShell)

## 🎯 Setup Instructions for PowerShell

### Step 1: Run Setup (Any Terminal)
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
.\setup-without-docker.ps1
```

This will create two files:
- `server.js` - Backend API
- `index.html` - Frontend UI

---

## 📺 Terminal Configuration

You need **2 separate PowerShell terminals** open.

### ✅ Terminal 1: Backend Server

**Start this FIRST**

```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
node server.js
```

Expected output:
```
🔌 Backend API running on http://localhost:5000
📡 Health check: http://localhost:5000/api/health
```

**Leave this running ✓**

---

### ✅ Terminal 2: Frontend Server

**Start this SECOND (after Terminal 1 is ready)**

```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
python -m http.server 3000
```

Expected output:
```
Serving HTTP on 0.0.0.0 port 3000 (http://0.0.0.0:3000/) ...
```

**Leave this running ✓**

---

## 🌐 Access the App

Once both terminals are running, open your browser:

```
http://localhost:3000
```

You should see the MLOps Studio dashboard with:
- Dashboard showing 0 projects, models, pipelines
- API status indicator
- Projects, Models, Pipelines tabs
- Create project form

---

## 📋 Complete Command Reference

### One-time Setup
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
.\setup-without-docker.ps1
```

### Terminal 1 (Backend)
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
node server.js
```

### Terminal 2 (Frontend)
```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
python -m http.server 3000
```

### Browser
```
http://localhost:3000
```

---

## ✨ Full Quick-Start Sequence

1. **Open PowerShell Terminal 1:**
   ```powershell
   cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
   .\setup-without-docker.ps1
   ```
   Wait for it to complete.

2. **In the SAME Terminal 1, run Backend:**
   ```powershell
   node server.js
   ```
   Wait until you see `🔌 Backend API running on http://localhost:5000`

3. **Open PowerShell Terminal 2 (new window/tab):**
   ```powershell
   cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
   python -m http.server 3000
   ```
   Wait until you see `Serving HTTP on 0.0.0.0 port 3000`

4. **Open Browser:**
   - Visit: `http://localhost:3000`
   - You should see the dashboard!

---

## 🎮 Test the App

Once loaded, try these:

**Create a Project:**
1. Click "Projects" tab
2. Enter "Test Project" in project name
3. Click "Create"
4. See it appear in the list

**Check Dashboard:**
- Active Projects should update to 1
- Visit "Dashboard" tab to see stats

**Check API Health:**
- Open: `http://localhost:5000/api/health`
- Should see: `{"status":"ok","timestamp":"..."}`

---

## ❌ Troubleshooting

**"Port 3000 already in use"**
```powershell
# Use different port
python -m http.server 3001
# Then visit http://localhost:3001
```

**"Port 5000 already in use"**
- Edit `server.js` line: `server.listen(5000, ...)`
- Change `5000` to `5001`
- Update frontend API URL in `index.html` line: `const API = 'http://localhost:5000/api'`
- Change `5000` to `5001`

**"Python not found"**
```powershell
# Alternative for frontend
npm install -g http-server
http-server -p 3000
```

**Backend won't start**
```powershell
# Check if Node.js is installed
node --version
npm --version
```

---

## 📍 Services Running

| Service | URL | Port | Terminal |
|---------|-----|------|----------|
| Backend API | http://localhost:5000 | 5000 | Terminal 1 |
| Frontend | http://localhost:3000 | 3000 | Terminal 2 |
| API Health | http://localhost:5000/api/health | 5000 | Browser |

---

**Ready? Start with Terminal 1! 🚀**
