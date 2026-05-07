#!/bin/bash

# MLOps Studio - Example: Train and Register a Model

set -e

MODEL_NAME="iris-classifier"
MODEL_VERSION="1.0.0"
MLFLOW_TRACKING_URI="http://localhost:5001"

echo "📚 Training example model: $MODEL_NAME"

# Create training script
cat > /tmp/train_model.py << 'EOF'
import json
import pickle
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score
import mlflow
import os

# Set MLflow tracking
mlflow.set_tracking_uri(os.environ.get('MLFLOW_TRACKING_URI', 'http://localhost:5001'))
mlflow.set_experiment('iris-classifier')

# Load data
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)

# Train model
with mlflow.start_run():
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    
    # Log metrics
    mlflow.log_metric('accuracy', accuracy)
    mlflow.log_metric('precision', precision)
    mlflow.log_metric('recall', recall)
    mlflow.log_param('n_estimators', 100)
    mlflow.log_param('random_state', 42)
    
    # Save model
    mlflow.sklearn.log_model(model, 'model')
    
    print(f"✓ Model trained with accuracy: {accuracy:.4f}")

# Save model artifacts
with open('/tmp/iris_model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open('/tmp/iris_metadata.json', 'w') as f:
    json.dump({
        'name': 'iris-classifier',
        'version': '1.0.0',
        'framework': 'sklearn',
        'metrics': {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall)
        }
    }, f)

print("✓ Model artifacts saved")
EOF

# Run training
echo "🔧 Training model..."
python /tmp/train_model.py

# Register with MLflow
echo "📝 Registering with MLflow..."
curl -X POST "http://localhost:5001/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"model_name\": \"$MODEL_NAME\",
        \"version\": \"$MODEL_VERSION\",
        \"framework\": \"sklearn\",
        \"metrics\": {
            \"accuracy\": 0.95,
            \"precision\": 0.94,
            \"recall\": 0.95
        }
    }"

# Register with backend
echo "🚀 Registering with MLOps Studio..."
curl -X POST "http://localhost:5000/models" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$MODEL_NAME\",
        \"description\": \"Example iris classifier\",
        \"framework\": \"sklearn\",
        \"version\": \"$MODEL_VERSION\",
        \"metrics\": {
            \"accuracy\": 0.95,
            \"f1\": 0.94
        },
        \"registry_uri\": \"$MLFLOW_TRACKING_URI\",
        \"artifact_path\": \"s3://mlops-models-dev/$MODEL_NAME/$MODEL_VERSION\"
    }"

echo ""
echo "✅ Model registered successfully!"
echo ""
echo "Next steps:"
echo "1. View in MLflow: $MLFLOW_TRACKING_URI"
echo "2. Deploy model: ./scripts/deploy-model.sh $MODEL_NAME $MODEL_VERSION staging"
echo ""
