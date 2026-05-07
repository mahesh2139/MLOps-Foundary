# Hosting guide (local + GitHub)

## Local (Windows + Docker Desktop)

### Prereqs
- Docker Desktop with Compose
- Node.js 18+ (for running frontend/backend outside Docker)

### Start the full local stack (recommended)

From repo root:

```powershell
docker compose up -d --build
```

URLs:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MLflow: `http://localhost:5001`
- Model serving: `http://localhost:8000`

Notes:
- Backend auth is **disabled by default in Compose** (`AUTH_DISABLED=true`) so the UI works out of the box.
- To serve a promoted model directly from MLflow registry, set:
  - `MODEL_URI=models:/<model_name>/Production` (or a specific version) for the `model-serving` service.

### Stop

```powershell
docker compose down
```

## GitHub hosting

### 1) Push to GitHub

```powershell
git init
git add .
git commit -m "Initial MLOps Studio prototype"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2) Enable GitHub Pages (frontend)
- Settings → Pages → Source: **GitHub Actions**
- Set repository secret `VITE_API_URL` to your backend URL (e.g., your Kubernetes ingress or cloud load balancer).

### 3) Turn on required checks and approvals
- Settings → Branches → add protection for `main`
  - require status checks:
    - `Pipeline validation`
    - `CodeQL`
    - `Security baseline`
- Settings → Environments → create:
  - `dev` (no approvals)
  - `prod` (required reviewers enabled)

### 4) Optional AWS deploy (if you configure secrets)
Workflows `deploy-to-dev.yml` and `promote-to-prod.yml` are **guarded** by `AWS_ACCOUNT_ID` being set.

Add secrets:
- `AWS_ACCOUNT_ID`
- (optional) `SLACK_WEBHOOK`

Then merges to `main` can deploy to dev, and production promotion is manual and **environment-gated**.

## Kubernetes hosting (recommended for “enterprise”)

See `deploy/helm/README.md` for a local kind/minikube install and port-forwarding instructions.

