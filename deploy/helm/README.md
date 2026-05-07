## Helm chart (Kubernetes packaging)

Chart: `deploy/helm/mlops-studio`

### Build images (local)

From repo root:

```bash
docker build -t mlops-studio-backend:latest backend/
docker build -t mlops-studio-model-serving:latest model-serving/
docker build -t mlops-studio-mlflow:latest model-registry/
```

Frontend image is optional (you can keep GitHub Pages). If you want it in-cluster, add a prod `frontend/Dockerfile` and build `mlops-studio-frontend:latest`.

### Install into a local cluster (kind/minikube)

```bash
kubectl create namespace mlops-studio
helm upgrade --install mlops-studio deploy/helm/mlops-studio -n mlops-studio
```

### Expose locally

```bash
kubectl -n mlops-studio port-forward svc/mlops-studio-backend 5000:5000
kubectl -n mlops-studio port-forward svc/mlops-studio-model-serving 8000:8000
kubectl -n mlops-studio port-forward svc/mlops-studio-mlflow 5001:5000
```

