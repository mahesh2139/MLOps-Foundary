# MLOps Studio Frontend Starter
# Run from the frontend directory

Write-Host "Starting MLOps Studio Frontend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install it from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install it from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start the dev server
Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
Write-Host "Open http://localhost:3000 in your browser" -ForegroundColor Green
Write-Host ""

npm run dev
