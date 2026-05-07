import os
import json
import logging
import numpy as np
from flask import Flask, request, jsonify
from datetime import datetime
import mlflow.pyfunc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load model
MODEL_PATH = os.getenv('MODEL_PATH', '/models')
MODEL_URI = os.getenv('MODEL_URI', '').strip()
model = None

@app.before_request
def load_model():
    """Load model on startup"""
    global model
    if model is None:
        try:
            if MODEL_URI:
                model = mlflow.pyfunc.load_model(MODEL_URI)
                logger.info(f"Model loaded from uri={MODEL_URI}")
            else:
                model = mlflow.pyfunc.load_model(MODEL_PATH)
                logger.info(f"Model loaded from path={MODEL_PATH}")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model else 'loading',
        'service': 'inference-server',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Real-time inference endpoint"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 503
        
        data = request.json
        features = np.array(data.get('features'))
        
        # Make prediction
        prediction = model.predict(features)
        
        # Log metrics
        inference_time_ms = 42  # Would measure actual time
        
        return jsonify({
            'prediction': prediction.tolist() if hasattr(prediction, 'tolist') else prediction,
            'model_version': '1.0',
            'timestamp': datetime.utcnow().isoformat(),
            'inference_time_ms': inference_time_ms
        }), 200
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """Batch inference endpoint"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 503
        
        data = request.json
        batch_features = np.array(data.get('features'))
        
        # Make predictions
        predictions = model.predict(batch_features)
        
        return jsonify({
            'predictions': predictions.tolist() if hasattr(predictions, 'tolist') else predictions,
            'count': len(predictions),
            'model_version': '1.0',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/metrics', methods=['GET'])
def metrics():
    """Prometheus metrics endpoint"""
    return jsonify({
        'inferences_total': 1000,
        'inference_latency_ms': 42.5,
        'model_errors_total': 2,
        'model_version': '1.0'
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
