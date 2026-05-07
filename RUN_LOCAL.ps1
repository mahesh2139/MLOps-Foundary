param(
  [switch]$Build
)

$ErrorActionPreference = "Stop"

Write-Host "Starting MLOps Studio local stack..." -ForegroundColor Cyan

if ($Build) {
  docker compose up -d --build
} else {
  docker compose up -d
}

Write-Host ""
Write-Host "Services:" -ForegroundColor Green
Write-Host "  Frontend:      http://localhost:3000"
Write-Host "  Backend API:   http://localhost:5000"
Write-Host "  MLflow:        http://localhost:5001"
Write-Host "  Model Serving: http://localhost:8000"
Write-Host ""
Write-Host "Tip: set MODEL_URI in your environment to serve from MLflow registry (e.g. models:/my-model/Production)." -ForegroundColor Yellow

