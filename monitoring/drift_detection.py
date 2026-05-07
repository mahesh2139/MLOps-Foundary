import os
import json
import logging
from datetime import datetime, timedelta
import boto3
import numpy as np
from typing import Dict, List, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

cloudwatch = boto3.client('cloudwatch')
s3 = boto3.client('s3')

class DriftDetector:
    """Detects data drift, concept drift, and prediction drift"""
    
    def __init__(self, threshold: float = 0.1):
        self.threshold = threshold
        self.baseline_stats = {}
    
    def detect_data_drift(self, 
                         current_data: np.ndarray,
                         baseline_data: np.ndarray,
                         features: List[str]) -> Dict:
        """Detect data drift using Kolmogorov-Smirnov test"""
        from scipy.stats import ks_2samp
        
        drift_detected = False
        affected_features = []
        max_drift_score = 0
        
        for i, feature in enumerate(features):
            statistic, p_value = ks_2samp(baseline_data[:, i], current_data[:, i])
            
            if p_value < self.threshold:
                drift_detected = True
                affected_features.append(feature)
                max_drift_score = max(max_drift_score, statistic)
        
        return {
            'detected': drift_detected,
            'score': float(max_drift_score * 100),
            'affected_features': affected_features,
            'p_value': p_value
        }
    
    def detect_concept_drift(self,
                            predictions: np.ndarray,
                            actuals: np.ndarray) -> Dict:
        """Detect concept drift using accuracy degradation"""
        accuracy = np.mean(predictions == actuals)
        baseline_accuracy = 0.95  # Would load from history
        
        drift_score = abs(baseline_accuracy - accuracy)
        detected = drift_score > self.threshold
        
        return {
            'detected': detected,
            'score': float(drift_score * 100),
            'current_accuracy': float(accuracy),
            'baseline_accuracy': baseline_accuracy
        }
    
    def detect_prediction_drift(self,
                               current_predictions: np.ndarray,
                               baseline_predictions: np.ndarray) -> Dict:
        """Detect prediction distribution drift"""
        current_mean = np.mean(current_predictions)
        baseline_mean = np.mean(baseline_predictions)
        
        drift_score = abs((current_mean - baseline_mean) / baseline_mean)
        detected = drift_score > self.threshold
        
        return {
            'detected': detected,
            'score': float(drift_score * 100),
            'current_mean': float(current_mean),
            'baseline_mean': float(baseline_mean)
        }
    
    def publish_metrics(self, metrics: Dict, model_id: str):
        """Publish drift metrics to CloudWatch"""
        for metric_name, value in metrics.items():
            if isinstance(value, (int, float)):
                cloudwatch.put_metric_data(
                    Namespace='MLOps/Monitoring',
                    MetricData=[
                        {
                            'MetricName': f'{model_id}/{metric_name}',
                            'Value': float(value),
                            'Unit': 'Percent',
                            'Timestamp': datetime.utcnow()
                        }
                    ]
                )
        logger.info(f"Metrics published for model {model_id}")

def run_monitoring(model_id: str, environment: str):
    """Main monitoring function"""
    logger.info(f"Starting monitoring for model {model_id} in {environment}")
    
    detector = DriftDetector(threshold=0.10)
    
    # Load current data
    bucket = f'mlops-data-{environment}'
    key = f'monitoring/{model_id}/current_data.parquet'
    
    # In production, load actual data
    # For demo, use sample data
    np.random.seed(42)
    current_data = np.random.randn(100, 5)
    baseline_data = np.random.randn(100, 5)
    features = ['feature_1', 'feature_2', 'feature_3', 'feature_4', 'feature_5']
    
    # Run drift detection
    data_drift = detector.detect_data_drift(current_data, baseline_data, features)
    concept_drift = detector.detect_concept_drift(
        np.random.randint(0, 2, 100),
        np.random.randint(0, 2, 100)
    )
    pred_drift = detector.detect_prediction_drift(
        np.random.randn(100),
        np.random.randn(100)
    )
    
    # Publish metrics
    all_metrics = {
        **{f'data_drift_{k}': v for k, v in data_drift.items() if isinstance(v, (int, float))},
        **{f'concept_drift_{k}': v for k, v in concept_drift.items() if isinstance(v, (int, float))},
        **{f'prediction_drift_{k}': v for k, v in pred_drift.items() if isinstance(v, (int, float))},
    }
    
    detector.publish_metrics(all_metrics, model_id)
    
    logger.info(f"Monitoring completed. Data drift: {data_drift['detected']}, "
                f"Concept drift: {concept_drift['detected']}, "
                f"Prediction drift: {pred_drift['detected']}")
    
    return {
        'data_drift': data_drift,
        'concept_drift': concept_drift,
        'prediction_drift': pred_drift
    }

if __name__ == '__main__':
    model_id = os.getenv('MODEL_ID', 'demo-model')
    environment = os.getenv('ENVIRONMENT', 'dev')
    
    result = run_monitoring(model_id, environment)
    print(json.dumps(result, indent=2))
