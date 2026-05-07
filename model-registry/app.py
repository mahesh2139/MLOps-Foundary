import os
import logging
from flask import Flask, jsonify, request
from mlflow import log_metric, log_param, log_artifact
import mlflow

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure MLflow
mlflow_uri = os.getenv('MLFLOW_TRACKING_URI', 'http://localhost:5000')
mlflow.set_tracking_uri(mlflow_uri)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'mlflow-tracking'
    })

@app.route('/api/models/register', methods=['POST'])
def register_model():
    """Register a pre-trained model"""
    try:
        data = request.json
        model_name = data.get('name')
        model_version = data.get('version')
        model_uri = data.get('uri')
        
        if not all([model_name, model_version, model_uri]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        with mlflow.start_run():
            mlflow.log_param('model_name', model_name)
            mlflow.log_param('version', model_version)
            
            # Log model metadata
            metrics = data.get('metrics', {})
            for metric_name, metric_value in metrics.items():
                mlflow.log_metric(metric_name, float(metric_value))
            
            # Register model
            mlflow.register_model(model_uri, model_name)
        
        logger.info(f"Model registered: {model_name}:{model_version}")
        return jsonify({
            'status': 'registered',
            'name': model_name,
            'version': model_version
        }), 201
    
    except Exception as e:
        logger.error(f"Error registering model: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_name>/versions', methods=['GET'])
def list_model_versions(model_name):
    """List all versions of a model"""
    try:
        client = mlflow.tracking.MlflowClient(mlflow_uri)
        versions = client.search_model_versions(f"name='{model_name}'")
        
        return jsonify({
            'model': model_name,
            'versions': [
                {
                    'version': v.version,
                    'stage': v.current_stage,
                    'created_timestamp': v.creation_timestamp
                }
                for v in versions
            ]
        })
    except Exception as e:
        logger.error(f"Error listing versions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_name>/promote', methods=['POST'])
def promote_model(model_name):
    """Promote model to next stage"""
    try:
        data = request.json
        version = data.get('version')
        to_stage = data.get('to_stage')  # Staging, Production
        
        client = mlflow.tracking.MlflowClient(mlflow_uri)
        client.transition_model_version_stage(
            name=model_name,
            version=version,
            stage=to_stage
        )
        
        logger.info(f"Model {model_name}:{version} promoted to {to_stage}")
        return jsonify({
            'status': 'promoted',
            'model': model_name,
            'version': version,
            'stage': to_stage
        }), 200
    
    except Exception as e:
        logger.error(f"Error promoting model: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
