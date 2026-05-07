# MLOps Studio Frontend - Quick Start Guide

## Prerequisites

- Node.js 16+ installed
- npm 8+ installed

## Setup & Run

### Option 1: Using PowerShell (Windows)
```powershell
cd frontend
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\start-dev.ps1
```

### Option 2: Using npm directly
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:3000**

## Login Credentials

**Demo Credentials (Works without backend):**
- Email: `admin@mlops.com`
- Password: `password`

## Features Accessible

Once logged in, you can access:

1. **Dashboard** - System metrics, project counts, and quick actions
2. **Projects** - Create, read, update, delete ML projects
3. **Pipelines** - View and manage ML pipeline DAGs
4. **Monitoring** - Data drift detection and alerts
5. **CI/CD** - Pipeline runs and deployment tracking
6. **Integrations** - GitHub, AWS, and other service connections
7. **Admin** - User management and audit logs (Admin only)
8. **Workflow** - Full 10-step ML operations workflow

## Architecture

### Key Components
- **AppRouter.tsx** - Main routing hub with navigation and layout
- **pages/** - 8 page components (Dashboard, Projects, etc.)
- **contexts/** - AuthContext, NotificationContext
- **services/** - APIClient, api.ts for backend communication
- **hooks/** - useNotification custom hook
- **components/** - ErrorBoundary, NotificationContainer

### State Management
- React Context API for auth and notifications
- useState hooks for component state
- LocalStorage for token persistence

### API Integration
- Backend URL: http://localhost:5000/api
- Automatic JWT token injection in all requests
- Error handling with user-friendly messages
- Demo mode works without backend

## Troubleshooting

### "npm is not recognized"
If npm is not in your PATH:
1. Install Node.js from https://nodejs.org/
2. Restart your terminal
3. Verify: `node --version` and `npm --version`

### "Cannot find module" errors
Run: `npm install`

### API calls failing
- Backend must be running on port 5000
- Or use demo credentials (admin@mlops.com / password) which don't require backend
- Check `.env` file for correct API_URL

### Page not navigating
- Clear browser cache
- Make sure you're using http://localhost:3000 (not 5000)
- Check browser console for errors (F12)

## Build for Production

```bash
npm run build
npm run preview
```

This creates an optimized build in the `dist/` folder.
