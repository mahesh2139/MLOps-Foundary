"""
MLflow Configuration for MLOps Studio
Provides model registry and artifact tracking
"""

import os
from pathlib import Path

# MLflow Configuration
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
MLFLOW_BACKEND_STORE_URI = os.getenv("MLFLOW_BACKEND_STORE_URI", "postgresql://mlflow:password@localhost:5432/mlflow")
MLFLOW_ARTIFACT_ROOT = os.getenv("MLFLOW_ARTIFACT_ROOT", "s3://mlops-studio-artifacts/mlflow")

# Experiment Configuration
DEFAULT_EXPERIMENT_NAME = "MLOps Studio"
ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")

class MLFlowConfig:
    def __init__(self):
        self.tracking_uri = MLFLOW_TRACKING_URI
        self.backend_store = MLFLOW_BACKEND_STORE_URI
        self.artifact_root = MLFLOW_ARTIFACT_ROOT
        self.experiment_name = f"{DEFAULT_EXPERIMENT_NAME}-{ENVIRONMENT}"
    
    def get_tracking_uri(self):
        return self.tracking_uri
    
    def get_artifact_root(self):
        return self.artifact_root
    
    def set_experiment(self):
        import mlflow
        mlflow.set_tracking_uri(self.tracking_uri)
        mlflow.set_experiment(self.experiment_name)
    
    def register_model(self, model_name: str, model_uri: str, description: str = ""):
        import mlflow
        self.set_experiment()
        
        try:
            registered_model = mlflow.register_model(
                model_uri=model_uri,
                name=model_name
            )
            
            if description:
                client = mlflow.MlflowClient()
                client.update_model_description(model_name, description)
            
            return registered_model
        except Exception as e:
            print(f"Error registering model: {e}")
            raise

if __name__ == "__main__":
    config = MLFlowConfig()
    print(f"MLFlow Tracking URI: {config.get_tracking_uri()}")
    print(f"Artifact Root: {config.get_artifact_root()}")
    print(f"Experiment: {config.experiment_name}")
