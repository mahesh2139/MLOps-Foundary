#!/bin/bash

# MLOps Studio - Quick Start Without Dependencies
# No npm install needed - just launches the web app!

echo "🚀 MLOps Studio - Quick Start (No Setup Required)"
echo "================================================="
echo ""

# Create minimal backend server (uses only Node built-ins)
echo "📝 Creating minimal backend server..."
cat > server.js << 'EOJS'
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const urlParts = url.parse(req.url, true);
  const pathname = urlParts.pathname;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Mock data store
  const projects = new Map();
  const models = new Map();
  const pipelines = new Map();
  
  // API Routes
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  }
  else if (pathname === '/api/projects' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', data: Array.from(projects.values()) }));
  }
  else if (pathname === '/api/projects' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const project = { ...JSON.parse(body), id: 'proj-' + Date.now(), createdAt: new Date().toISOString() };
      projects.set(project.id, project);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', data: project }));
    });
  }
  else if (pathname === '/api/models' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', data: Array.from(models.values()) }));
  }
  else if (pathname === '/api/pipelines' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', data: Array.from(pipelines.values()) }));
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(5000, () => {
  console.log('🔌 Backend API running on http://localhost:5000');
  console.log('📡 Health check: http://localhost:5000/api/health');
});
EOJS

# Create minimal frontend HTML
echo "📝 Creating frontend app..."
cat > index.html << 'EOHTML'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MLOps Studio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #111; color: #fff; }
    .container { display: flex; height: 100vh; }
    .sidebar { width: 250px; background: #1a1a1a; border-right: 1px solid #333; padding: 20px; overflow-y: auto; }
    .logo { font-size: 24px; font-weight: bold; margin-bottom: 30px; color: #0ea5e9; }
    .nav { display: flex; flex-direction: column; gap: 10px; }
    .nav-item { padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .nav-item:hover { background: #2a2a2a; }
    .nav-item.active { background: #0ea5e9; color: #000; }
    .main { flex: 1; display: flex; flex-direction: column; }
    .header { background: #1a1a1a; border-bottom: 1px solid #333; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
    .content { flex: 1; padding: 30px; overflow-y: auto; }
    .card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .card h2 { color: #0ea5e9; margin-bottom: 15px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .kpi { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px; text-align: center; }
    .kpi-value { font-size: 32px; font-weight: bold; color: #0ea5e9; margin: 10px 0; }
    .kpi-label { color: #999; font-size: 14px; }
    .button { background: #0ea5e9; color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .button:hover { background: #06b6d4; }
    .input { background: #2a2a2a; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 6px; margin: 10px 0; width: 100%; }
    .list { margin-top: 20px; }
    .list-item { background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; background: #10b981; color: #000; }
    .error { color: #ef4444; }
    .success { color: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="logo">📊 MLOps</div>
      <div class="nav">
        <div class="nav-item active" onclick="showPage('dashboard')">Dashboard</div>
        <div class="nav-item" onclick="showPage('projects')">Projects</div>
        <div class="nav-item" onclick="showPage('models')">Models</div>
        <div class="nav-item" onclick="showPage('pipelines')">Pipelines</div>
      </div>
    </div>
    <div class="main">
      <div class="header">
        <h1>MLOps Studio</h1>
        <div style="color: #0ea5e9;">Live Demo</div>
      </div>
      <div class="content">
        <div id="dashboard" class="page">
          <h1>Dashboard</h1>
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-label">Active Projects</div>
              <div class="kpi-value" id="kpi-projects">0</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Models Registered</div>
              <div class="kpi-value" id="kpi-models">0</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">Pipelines Running</div>
              <div class="kpi-value" id="kpi-pipelines">0</div>
            </div>
            <div class="kpi">
              <div class="kpi-label">API Status</div>
              <div class="kpi-value" id="api-status" style="color: #ef4444;">Loading...</div>
            </div>
          </div>
          <div class="card">
            <h2>System Status</h2>
            <p id="status-msg" style="color: #999;">Checking backend...</p>
          </div>
        </div>

        <div id="projects" class="page" style="display:none;">
          <h1>Projects</h1>
          <div class="card">
            <h2>Create Project</h2>
            <input type="text" id="project-name" class="input" placeholder="Project name">
            <input type="text" id="project-desc" class="input" placeholder="Description">
            <button class="button" onclick="createProject()">Create</button>
          </div>
          <div class="card">
            <h2>Projects List</h2>
            <div id="projects-list" class="list"></div>
          </div>
        </div>

        <div id="models" class="page" style="display:none;">
          <h1>Models</h1>
          <div class="card">
            <h2>Registered Models</h2>
            <p style="color: #999;">Models will appear here</p>
            <div id="models-list" class="list"></div>
          </div>
        </div>

        <div id="pipelines" class="page" style="display:none;">
          <h1>Pipelines</h1>
          <div class="card">
            <h2>Pipeline Status</h2>
            <p style="color: #999;">Pipelines will appear here</p>
            <div id="pipelines-list" class="list"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const API = 'http://localhost:5000/api';
    
    function showPage(page) {
      document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
      document.getElementById(page).style.display = 'block';
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      event.target.classList.add('active');
      
      if (page === 'projects') loadProjects();
      if (page === 'models') loadModels();
      if (page === 'pipelines') loadPipelines();
    }

    async function checkHealth() {
      try {
        const res = await fetch(API + '/health');
        const data = await res.json();
        document.getElementById('api-status').innerHTML = '✓ OK';
        document.getElementById('api-status').style.color = '#10b981';
        document.getElementById('status-msg').innerHTML = `<span class="success">✓ Backend is running!</span> API: ${API}`;
        loadProjects();
      } catch (e) {
        document.getElementById('api-status').innerHTML = '✗ Error';
        document.getElementById('status-msg').innerHTML = `<span class="error">✗ Cannot reach backend at ${API}</span><br>Make sure backend is running`;
      }
    }

    async function createProject() {
      const name = document.getElementById('project-name').value;
      const desc = document.getElementById('project-desc').value;
      if (!name) return alert('Project name required');
      
      try {
        const res = await fetch(API + '/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description: desc })
        });
        const data = await res.json();
        document.getElementById('project-name').value = '';
        document.getElementById('project-desc').value = '';
        loadProjects();
        alert('Project created: ' + data.data.id);
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }

    async function loadProjects() {
      try {
        const res = await fetch(API + '/projects');
        const data = await res.json();
        const list = document.getElementById('projects-list');
        document.getElementById('kpi-projects').textContent = data.data.length;
        list.innerHTML = data.data.map(p => `
          <div class="list-item">
            <div><strong>${p.name}</strong><br><small style="color:#666">${p.description || 'No description'}</small></div>
            <div class="status-badge">${p.id}</div>
          </div>
        `).join('') || '<p style="color:#666">No projects yet</p>';
      } catch (e) {
        console.error(e);
      }
    }

    async function loadModels() {
      try {
        const res = await fetch(API + '/models');
        const data = await res.json();
        document.getElementById('kpi-models').textContent = data.data.length;
        document.getElementById('models-list').innerHTML = data.data.length ? data.data.map(m => `
          <div class="list-item"><strong>${m.name}</strong></div>
        `).join('') : '<p style="color:#666">No models yet</p>';
      } catch (e) {
        console.error(e);
      }
    }

    async function loadPipelines() {
      try {
        const res = await fetch(API + '/pipelines');
        const data = await res.json();
        document.getElementById('kpi-pipelines').textContent = data.data.length;
        document.getElementById('pipelines-list').innerHTML = data.data.length ? data.data.map(p => `
          <div class="list-item"><strong>${p.name}</strong></div>
        `).join('') : '<p style="color:#666">No pipelines yet</p>';
      } catch (e) {
        console.error(e);
      }
    }

    // Check health on load
    checkHealth();
    // Refresh every 5 seconds
    setInterval(checkHealth, 5000);
  </script>
</body>
</html>
EOHTML

echo ""
echo "✅ Done! No installation needed!"
echo ""
echo "🎯 Starting the application in TWO terminals:"
echo ""
echo "  Terminal 1 - Backend Server:"
echo "    node server.js"
echo ""
echo "  Terminal 2 - Frontend Server:"
echo "    python -m http.server 3000"
echo ""
echo "📍 Then open your browser:"
echo "    http://localhost:3000"
echo ""
echo "✨ Complete webapp running with zero dependencies!"
