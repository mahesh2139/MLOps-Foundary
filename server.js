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
