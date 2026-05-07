import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Folder, AlertCircle, Code, Lock, RefreshCw, Play, Save, ChevronRight, ChevronDown, FileText, FolderOpen, Trash, Download, Copy, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb, SearchBar, EmptyState, FilterChip, Pagination } from '../components/UIPatterns';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: 'python' | 'yaml' | 'json' | 'dockerfile' | 'text';
  children?: ProjectFile[];
  expanded?: boolean;
}

export default function Projects() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [viewMode, setViewMode] = useState<'list' | 'workspace'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', environment: 'dev' as 'dev' | 'staging' | 'prod' });
  
  // Workspace state
  const [fileTree, setFileTree] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [fileType, setFileType] = useState<'python' | 'dockerfile' | 'yaml' | 'json' | 'text'>('python');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedProject = selectedProjectId ? global.getProject(selectedProjectId) : null;

  // Load file tree from GlobalContext when project changes
  useEffect(() => {
    if (selectedProject && selectedProject.code && selectedProject.code.length > 0) {
      // Reconstruct file tree from ProjectCode array
      const reconstructedTree: ProjectFile[] = selectedProject.code.map(code => ({
        id: code.id,
        name: code.name,
        type: 'file',
        language: code.language,
        content: code.content,
      }));
      setFileTree(reconstructedTree);
    } else if (selectedProject) {
      // Initialize with sample tree for new project with code for each pipeline step
      const sampleFiles = [
        {
          id: 'src-folder',
          name: 'src',
          type: 'folder' as const,
          expanded: true,
          children: [
            {
              id: 'ingest-py-sample',
              name: '01_ingest.py',
              type: 'file' as const,
              language: 'python' as const,
              content: `# Data Ingestion Script for ${selectedProject.name}
import pandas as pd
import requests
from datetime import datetime

class DataIngestion:
    def __init__(self, source_url=None):
        self.source_url = source_url
        self.data = None
        
    def fetch_data(self):
        """Fetch data from source"""
        if self.source_url:
            response = requests.get(self.source_url)
            self.data = pd.read_json(response.json())
        else:
            # Load sample data
            self.data = pd.read_csv('sample_data.csv')
        
        print(f"✓ Ingested {len(self.data)} records")
        return self.data
    
    def save_raw_data(self, path='data/raw/'):
        """Save ingested data"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = f'{path}raw_data_{timestamp}.csv'
        self.data.to_csv(filepath, index=False)
        print(f"✓ Saved raw data to {filepath}")
        return filepath

if __name__ == '__main__':
    ingestor = DataIngestion()
    ingestor.fetch_data()
    ingestor.save_raw_data()
`,
            },
            {
              id: 'prep-py-sample',
              name: '02_prepare.py',
              type: 'file' as const,
              language: 'python' as const,
              content: `# Data Preparation Script for ${selectedProject.name}
import pandas as pd
from sklearn.preprocessing import StandardScaler

class DataPreparation:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        self.scaler = StandardScaler()
        
    def clean_data(self):
        """Remove nulls and duplicates"""
        initial_rows = len(self.df)
        self.df = self.df.dropna()
        self.df = self.df.drop_duplicates()
        print(f"✓ Cleaned data: {initial_rows} -> {len(self.df)} rows")
        return self.df
    
    def feature_engineering(self):
        """Create new features"""
        # Add your feature engineering logic
        if 'timestamp' in self.df.columns:
            self.df['date'] = pd.to_datetime(self.df['timestamp'])
            self.df['hour'] = self.df['date'].dt.hour
        print("✓ Features engineered")
        return self.df
    
    def normalize_features(self):
        """Normalize numerical features"""
        numeric_cols = self.df.select_dtypes(include=['float64', 'int64']).columns
        self.df[numeric_cols] = self.scaler.fit_transform(self.df[numeric_cols])
        print("✓ Features normalized")
        return self.df
    
    def prepare(self):
        """Run full preparation pipeline"""
        self.clean_data()
        self.feature_engineering()
        self.normalize_features()
        return self.df
    
    def save_prepared_data(self, path='data/prepared/'):
        """Save prepared data"""
        self.df.to_csv(f'{path}prepared_data.csv', index=False)
        print(f"✓ Saved prepared data to {path}")

if __name__ == '__main__':
    prep = DataPreparation('data/raw/raw_data.csv')
    prep.prepare()
    prep.save_prepared_data()
`,
            },
            {
              id: 'train-py-sample',
              name: '03_train.py',
              type: 'file' as const,
              language: 'python' as const,
              content: `# Model Training Script for ${selectedProject.name}
import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score

class ModelTrainer:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        self.model = RandomForestClassifier(n_estimators=100)
        self.metrics = {}
        
    def prepare_data(self):
        """Split data into train/test"""
        X = self.df.drop('target', axis=1) if 'target' in self.df.columns else self.df.iloc[:, :-1]
        y = self.df['target'] if 'target' in self.df.columns else self.df.iloc[:, -1]
        
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        print(f"✓ Data split: {len(self.X_train)} train, {len(self.X_test)} test")
        
    def train(self):
        """Train the model"""
        self.model.fit(self.X_train, self.y_train)
        print("✓ Model training completed")
        
    def evaluate(self):
        """Evaluate model performance"""
        y_pred = self.model.predict(self.X_test)
        self.metrics = {
            'accuracy': accuracy_score(self.y_test, y_pred),
            'precision': precision_score(self.y_test, y_pred, average='weighted'),
            'recall': recall_score(self.y_test, y_pred, average='weighted'),
        }
        print(f"✓ Accuracy: {self.metrics['accuracy']:.4f}")
        return self.metrics
    
    def save_model(self, path='models/'):
        """Save trained model"""
        with open(f'{path}model.pkl', 'wb') as f:
            pickle.dump(self.model, f)
        print(f"✓ Model saved to {path}")
        return self.metrics

if __name__ == '__main__':
    trainer = ModelTrainer('data/prepared/prepared_data.csv')
    trainer.prepare_data()
    trainer.train()
    trainer.evaluate()
    trainer.save_model()
`,
            },
            {
              id: 'eval-py-sample',
              name: '04_evaluate.py',
              type: 'file' as const,
              language: 'python' as const,
              content: `# Model Evaluation Script for ${selectedProject.name}
import pandas as pd
import pickle
import json
from sklearn.metrics import (
    confusion_matrix, classification_report, 
    roc_auc_score, f1_score
)

class ModelEvaluation:
    def __init__(self, model_path, test_data_path):
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)
        self.test_df = pd.read_csv(test_data_path)
        self.evaluation_results = {}
        
    def comprehensive_evaluation(self):
        """Run comprehensive evaluation"""
        X = self.test_df.drop('target', axis=1) if 'target' in self.test_df.columns else self.test_df.iloc[:, :-1]
        y = self.test_df['target'] if 'target' in self.test_df.columns else self.test_df.iloc[:, -1]
        
        y_pred = self.model.predict(X)
        y_proba = self.model.predict_proba(X)[:, 1] if hasattr(self.model, 'predict_proba') else None
        
        self.evaluation_results = {
            'f1_score': float(f1_score(y, y_pred, average='weighted')),
            'confusion_matrix': confusion_matrix(y, y_pred).tolist(),
            'classification_report': classification_report(y, y_pred, output_dict=True),
        }
        
        if y_proba is not None:
            try:
                self.evaluation_results['roc_auc'] = float(roc_auc_score(y, y_proba))
            except:
                pass
        
        return self.evaluation_results
    
    def check_performance_threshold(self, min_f1=0.8):
        """Check if model meets performance threshold"""
        f1 = self.evaluation_results.get('f1_score', 0)
        meets_threshold = f1 >= min_f1
        print(f"✓ Performance Check: F1={f1:.4f} | Threshold={min_f1} | {'PASS' if meets_threshold else 'FAIL'}")
        return meets_threshold
    
    def save_evaluation_report(self, path='reports/'):
        """Save evaluation report"""
        with open(f'{path}evaluation_report.json', 'w') as f:
            json.dump(self.evaluation_results, f, indent=2)
        print(f"✓ Evaluation report saved to {path}")
        return self.evaluation_results

if __name__ == '__main__':
    evaluator = ModelEvaluation('models/model.pkl', 'data/prepared/prepared_data.csv')
    evaluator.comprehensive_evaluation()
    evaluator.check_performance_threshold()
    evaluator.save_evaluation_report()
`,
            },
            {
              id: 'deploy-py-sample',
              name: '05_deploy.py',
              type: 'file' as const,
              language: 'python' as const,
              content: `# Model Deployment Script for ${selectedProject.name}
import pickle
import json
from datetime import datetime

class ModelDeployment:
    def __init__(self, model_path):
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)
        self.deployment_info = {}
        
    def create_deployment_config(self):
        """Create deployment configuration"""
        self.deployment_info = {
            'model_name': '${selectedProject.name}',
            'model_version': '1.0.0',
            'deployment_timestamp': datetime.now().isoformat(),
            'environment': 'production',
            'endpoint': '/api/predict',
            'health_check_endpoint': '/health',
        }
        print("✓ Deployment configuration created")
        return self.deployment_info
    
    def register_model(self):
        """Register model in model registry"""
        registry_entry = {
            'model_id': f'model-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'name': self.deployment_info['model_name'],
            'version': self.deployment_info['model_version'],
            'status': 'registered',
            'registered_at': self.deployment_info['deployment_timestamp'],
        }
        print(f"✓ Model registered: {registry_entry['model_id']}")
        return registry_entry
    
    def create_api_wrapper(self):
        """Create API wrapper for model"""
        api_code = '''
from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load model
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = data.get('features', [])
    prediction = model.predict([features])
    return jsonify({'prediction': prediction[0]})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=False, port=5000)
'''
        return api_code
    
    def save_deployment_config(self, path='deployment/'):
        """Save deployment configuration"""
        with open(f'{path}deployment_config.json', 'w') as f:
            json.dump(self.deployment_info, f, indent=2)
        print(f"✓ Deployment config saved to {path}")

if __name__ == '__main__':
    deployer = ModelDeployment('models/model.pkl')
    deployer.create_deployment_config()
    deployer.register_model()
    deployer.save_deployment_config()
`,
            },
            {
              id: 'monitor-py-sample',
              name: '06_monitor.py',
              type: 'file' as const,
              language: 'python' as const,
              content: `# Model Monitoring Script for ${selectedProject.name}
import json
import pandas as pd
from datetime import datetime

class ModelMonitoring:
    def __init__(self, model_name='${selectedProject.name}'):
        self.model_name = model_name
        self.metrics_history = []
        
    def check_data_drift(self, current_data_path, baseline_data_path):
        """Detect data drift in input features"""
        current_df = pd.read_csv(current_data_path)
        baseline_df = pd.read_csv(baseline_data_path)
        
        drift_report = {
            'timestamp': datetime.now().isoformat(),
            'model': self.model_name,
            'features_checked': len(current_df.columns),
            'drift_detected': False,
            'feature_drifts': []
        }
        
        for col in current_df.select_dtypes(include=['float64', 'int64']).columns:
            current_mean = current_df[col].mean()
            baseline_mean = baseline_df[col].mean()
            drift_pct = abs(current_mean - baseline_mean) / baseline_mean * 100 if baseline_mean != 0 else 0
            
            if drift_pct > 5:  # 5% threshold
                drift_report['drift_detected'] = True
                drift_report['feature_drifts'].append({
                    'feature': col,
                    'drift_percentage': drift_pct
                })
        
        print(f"✓ Data Drift Check: {'DRIFT DETECTED' if drift_report['drift_detected'] else 'No drift'}")
        return drift_report
    
    def check_model_performance(self, predictions_file):
        """Monitor model prediction metrics"""
        with open(predictions_file, 'r') as f:
            predictions = json.load(f)
        
        perf_metrics = {
            'timestamp': datetime.now().isoformat(),
            'model': self.model_name,
            'total_predictions': len(predictions),
            'average_confidence': sum(p.get('confidence', 0) for p in predictions) / len(predictions) if predictions else 0,
        }
        
        print(f"✓ Model Performance: {perf_metrics['total_predictions']} predictions")
        return perf_metrics
    
    def check_system_health(self):
        """Check system health metrics"""
        health_report = {
            'timestamp': datetime.now().isoformat(),
            'model': self.model_name,
            'status': 'healthy',
            'latency_ms': 150,
            'uptime_hours': 24,
            'error_rate': 0.01,
        }
        
        if health_report['latency_ms'] > 1000 or health_report['error_rate'] > 0.05:
            health_report['status'] = 'warning'
        
        print(f"✓ System Health: {health_report['status']}")
        return health_report
    
    def generate_monitoring_report(self, output_path='monitoring/'):
        """Generate comprehensive monitoring report"""
        report = {
            'generated_at': datetime.now().isoformat(),
            'model_name': self.model_name,
            'summary': 'Model monitoring report with drift detection, performance metrics, and system health'
        }
        
        with open(f'{output_path}monitoring_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"✓ Monitoring report saved to {output_path}")
        return report

if __name__ == '__main__':
    monitor = ModelMonitoring()
    monitor.check_data_drift('data/current.csv', 'data/baseline.csv')
    monitor.check_model_performance('predictions.json')
    monitor.check_system_health()
    monitor.generate_monitoring_report()
`,
            },
          ],
        },
        {
          id: 'dockerfile-sample',
          name: 'Dockerfile',
          type: 'file' as const,
          language: 'dockerfile' as const,
          content: `FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY data/ ./data/ 2>/dev/null || true
COPY models/ ./models/ 2>/dev/null || true

ENV PYTHONUNBUFFERED=1

CMD ["python", "src/03_train.py"]
`,
        },
        {
          id: 'requirements-sample',
          name: 'requirements.txt',
          type: 'file' as const,
          language: 'text' as const,
          content: `pandas>=1.3.0
scikit-learn>=0.24.0
numpy>=1.21.0
flask>=2.0.0
requests>=2.26.0
python-dotenv>=0.19.0
`,
        },
      ];
      setFileTree(sampleFiles);
      // Also save sample files to GlobalContext so they are immediately available to jobs
      if (!selectedProject.code || selectedProject.code.length === 0) {
        const files = [
          { name: '01_ingest.py', language: 'python' as const, content: sampleFiles[0].children?.[0].content || '' },
          { name: '02_prepare.py', language: 'python' as const, content: sampleFiles[0].children?.[1].content || '' },
          { name: '03_train.py', language: 'python' as const, content: sampleFiles[0].children?.[2].content || '' },
          { name: '04_evaluate.py', language: 'python' as const, content: sampleFiles[0].children?.[3].content || '' },
          { name: '05_deploy.py', language: 'python' as const, content: sampleFiles[0].children?.[4].content || '' },
          { name: '06_monitor.py', language: 'python' as const, content: sampleFiles[0].children?.[5].content || '' },
          { name: 'Dockerfile', language: 'dockerfile' as const, content: sampleFiles[1].content || '' },
          { name: 'requirements.txt', language: 'text' as const, content: sampleFiles[2].content || '' },
        ];
        files.forEach(file => global.addProjectCode(selectedProject.id, file));
      }
    }
  }, [selectedProject?.id]);

  // Filter projects
  const filtered = global.projects.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filtered.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const handleCreate = () => {
    if (!formData.name.trim()) {
      showNotification('Project name is required', 'warning');
      return;
    }
    const newProject = global.createProject({
      name: formData.name,
      description: formData.description,
      environment: formData.environment,
      status: 'active',
      code: [],
    });
    showNotification('Project created successfully', 'success');
    setShowModal(false);
    setFormData({ name: '', description: '', environment: 'dev' });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name.trim()) {
      showNotification('Project name is required', 'warning');
      return;
    }
    global.updateProject(editingId, {
      name: formData.name,
      description: formData.description,
      environment: formData.environment,
    });
    showNotification('Project updated successfully', 'success');
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '', environment: 'dev' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    global.deleteProject(id);
    showNotification('Project deleted successfully', 'success');
  };

  const openEditModal = (projectId: string) => {
    const project = global.getProject(projectId);
    if (project) {
      setEditingId(projectId);
      setFormData({
        name: project.name,
        description: project.description,
        environment: project.environment,
      });
      setShowModal(true);
    }
  };

  const initializeWorkspace = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode('workspace');
    setSelectedFile(null);
  };

  const toggleFileExpand = (fileId: string) => {
    const toggle = (files: ProjectFile[]): ProjectFile[] => {
      return files.map(f =>
        f.id === fileId
          ? { ...f, expanded: !f.expanded }
          : f.children ? { ...f, children: toggle(f.children) } : f
      );
    };
    setFileTree(toggle(fileTree));
  };

  const handleFileSelect = (file: ProjectFile) => {
    if (file.type === 'file') setSelectedFile(file);
  };

  const handleSaveFileContent = (content: string) => {
    if (!selectedFile || !selectedProject) return;

    // Update local file tree
    const update = (files: ProjectFile[]): ProjectFile[] => {
      return files.map(f =>
        f.id === selectedFile.id
          ? { ...f, content }
          : f.children ? { ...f, children: update(f.children) } : f
      );
    };
    setFileTree(update(fileTree));
    setSelectedFile({ ...selectedFile, content });

    // Save to GlobalContext
    const existingCode = selectedProject.code.find(c => c.id === selectedFile.id);
    if (existingCode) {
      // Update existing code
      global.updateProjectCode(selectedProject.id, selectedFile.id, { content });
    } else {
      // Add as new code
      const newCode = {
        name: selectedFile.name,
        language: selectedFile.language || 'python' as const,
        content,
      };
      global.addProjectCode(selectedProject.id, newCode);
    }

    showNotification('File saved to project', 'success');
  };

  const handleDeleteFile = (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    
    const deleteFromTree = (files: ProjectFile[]): ProjectFile[] => {
      return files
        .filter(f => f.id !== fileId)
        .map(f => f.children ? { ...f, children: deleteFromTree(f.children) } : f);
    };
    
    setFileTree(deleteFromTree(fileTree));
    if (selectedFile?.id === fileId) setSelectedFile(null);

    // Also delete from GlobalContext if it's a saved code
    if (selectedProject) {
      const codeToDelete = selectedProject.code.find(c => c.id === fileId);
      if (codeToDelete) {
        global.deleteProjectCode(selectedProject.id, fileId);
      }
    }

    showNotification('File deleted', 'success');
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      showNotification('File name is required', 'error');
      return;
    }

    let filename = newFileName;
    if (fileType === 'python' && !filename.endsWith('.py')) filename += '.py';
    if (fileType === 'dockerfile' && !filename.endsWith('Dockerfile')) filename = 'Dockerfile';
    if (fileType === 'yaml' && !filename.endsWith('.yaml')) filename += '.yaml';
    if (fileType === 'json' && !filename.endsWith('.json')) filename += '.json';
    if (fileType === 'text' && !filename.endsWith('.txt')) filename += '.txt';

    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name: filename,
      type: 'file',
      language: fileType,
      content: '',
    };

    if (selectedFolderId) {
      const addToFolder = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(f =>
          f.id === selectedFolderId && f.type === 'folder'
            ? { ...f, children: [...(f.children || []), newFile] }
            : f.children ? { ...f, children: addToFolder(f.children) } : f
        );
      };
      setFileTree(addToFolder(fileTree));
    } else {
      setFileTree([...fileTree, newFile]);
    }

    // Save to GlobalContext immediately so code is available to jobs
    if (selectedProject) {
      global.addProjectCode(selectedProject.id, {
        name: filename,
        language: fileType,
        content: '',
      });
    }

    setNewFileName('');
    setFileType('python');
    setShowNewFileModal(false);
    setSelectedFolderId(null);
    showNotification('File created', 'success');
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      showNotification('Folder name is required', 'error');
      return;
    }

    const newFolder: ProjectFile = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      type: 'folder',
      children: [],
      expanded: false,
    };

    if (selectedFolderId) {
      const addToFolder = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(f =>
          f.id === selectedFolderId && f.type === 'folder'
            ? { ...f, children: [...(f.children || []), newFolder] }
            : f.children ? { ...f, children: addToFolder(f.children) } : f
        );
      };
      setFileTree(addToFolder(fileTree));
    } else {
      setFileTree([...fileTree, newFolder]);
    }

    // Save folder structure to GlobalContext as a placeholder
    if (selectedProject) {
      global.addProjectCode(selectedProject.id, {
        name: `${newFolderName}/.gitkeep`,
        language: 'text',
        content: '# Folder placeholder',
      });
    }

    setNewFolderName('');
    setShowNewFolderModal(false);
    setSelectedFolderId(null);
    showNotification('Folder created', 'success');
  };

  // Download functions
  const downloadFile = (file: ProjectFile) => {
    if (!file.content) return;
    
    const element = document.createElement('a');
    const fileBlob = new Blob([file.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification(`Downloaded ${file.name}`, 'success');
  };

  const downloadProjectAsZip = async () => {
    if (!selectedProject) return;
    
    try {
      // Simple zip creation using a basic format
      // Note: For production, consider using JSZip library
      const files = selectedProject.code || [];
      
      if (files.length === 0) {
        showNotification('No files to download', 'warning');
        return;
      }

      // Create a simple text file containing all project files
      let zipContent = `# ${selectedProject.name} Project Export\n\n`;
      zipContent += `Generated: ${new Date().toLocaleString()}\n`;
      zipContent += `Total Files: ${files.length}\n\n`;

      files.forEach((file, index) => {
        zipContent += `\n${'='.repeat(80)}\n`;
        zipContent += `FILE ${index + 1}: ${file.name}\n`;
        zipContent += `Language: ${file.language}\n`;
        zipContent += `${'='.repeat(80)}\n`;
        zipContent += file.content || '';
        zipContent += '\n';
      });

      const element = document.createElement('a');
      const fileBlob = new Blob([zipContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `${selectedProject.name.replace(/\s+/g, '_')}_export.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showNotification(`Downloaded project as text archive`, 'success');
    } catch (err) {
      console.error('Error downloading project:', err);
      showNotification('Failed to download project', 'error');
    }
  };

  const downloadAllCode = async () => {
    if (!selectedProject || selectedProject.code.length === 0) {
      showNotification('No code files to download', 'warning');
      return;
    }

    try {
      // Download all files as a concatenated text file
      let allCode = `# ${selectedProject.name} - All Code Files\n\n`;
      allCode += `Generated: ${new Date().toLocaleString()}\n`;
      allCode += `Total Files: ${selectedProject.code.length}\n`;
      allCode += `Environment: ${selectedProject.environment}\n\n`;

      selectedProject.code.forEach((file, index) => {
        allCode += `\n${'#'.repeat(80)}\n`;
        allCode += `# FILE ${index + 1}: ${file.name} (${file.language})\n`;
        allCode += `${'#'.repeat(80)}\n\n`;
        allCode += file.content || '';
        allCode += '\n';
      });

      const element = document.createElement('a');
      const fileBlob = new Blob([allCode], { type: 'text/plain' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `${selectedProject.name.replace(/\s+/g, '_')}_all_code.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showNotification('Downloaded all code files', 'success');
    } catch (err) {
      console.error('Error downloading code:', err);
      showNotification('Failed to download code', 'error');
    }
  };

  const renderFileTree = (files: ProjectFile[], depth = 0): React.ReactNode => {
    return files.map(file => (
      <div key={file.id}>
        <div className="group">
          <div
            onClick={() => {
              if (file.type === 'folder') {
                toggleFileExpand(file.id);
              } else {
                handleFileSelect(file);
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/10 transition-colors ${
              selectedFile?.id === file.id ? `bg-blue-500/30 border-l-2 border-blue-400` : ''
            }`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            {file.type === 'folder' && (
              file.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            )}
            {file.type === 'folder' ? <FolderOpen size={14} /> : <FileText size={14} />}
            <span className="text-sm flex-1 truncate">{file.name}</span>
            {file.type === 'file' && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                  className="p-1 hover:bg-blue-600/20 rounded transition-all"
                  title="Download file"
                >
                  <Download size={12} className="text-blue-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  className="p-1 hover:bg-red-600/20 rounded transition-all"
                  title="Delete file"
                >
                  <Trash size={12} className="text-red-400" />
                </button>
              </div>
            )}
          </div>
        </div>
        {file.type === 'folder' && file.expanded && file.children && renderFileTree(file.children, depth + 1)}
      </div>
    ));
  };

  const getEnvColor = (env: string) => {
    return env === 'prod' ? 'from-red-600/20 to-red-400/10 border-red-400/30' :
           env === 'staging' ? 'from-yellow-600/20 to-yellow-400/10 border-yellow-400/30' :
           'from-blue-600/20 to-blue-400/10 border-blue-400/30';
  };

  if (viewMode === 'workspace' && selectedProject) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>{selectedProject.name} - Workspace</h1>
            <p className={`${themeClasses.textSecondary(theme)} mt-1`}>
              Environment: {selectedProject.environment} | Saved Files: {selectedProject.code.length}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedProject.code.length > 0 && (
              <>
                <button
                  onClick={downloadAllCode}
                  className={`px-4 py-2 flex items-center gap-2 rounded-lg transition ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  title="Download all code files"
                >
                  <Download size={18} />
                  All Code
                </button>
                <button
                  onClick={downloadProjectAsZip}
                  className={`px-4 py-2 flex items-center gap-2 rounded-lg transition ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  title="Download entire project"
                >
                  <Download size={18} />
                  Project
                </button>
              </>
            )}
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedProjectId(null);
              }}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg transition`}
            >
              Back to Projects
            </button>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-4 gap-4 h-[600px]">
          {/* File Tree */}
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-lg overflow-hidden flex flex-col`}>
            <div className={`p-3 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'} flex items-center justify-between`}>
              <h3 className={`font-semibold text-sm ${themeClasses.textPrimary(theme)}`}>Files</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setSelectedFolderId(null);
                    setShowNewFileModal(true);
                  }}
                  className={`p-1 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} rounded transition-colors`}
                  title="New file"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => {
                    setSelectedFolderId(null);
                    setShowNewFolderModal(true);
                  }}
                  className={`p-1 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} rounded transition-colors`}
                  title="New folder"
                >
                  <FolderOpen size={14} />
                </button>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto text-sm ${themeClasses.textPrimary(theme)}`}>
              {renderFileTree(fileTree)}
            </div>
          </div>

          {/* Code Editor */}
          <div className={`col-span-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-lg overflow-hidden flex flex-col`}>
            {selectedFile ? (
              <>
                <div className={`p-3 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'} flex items-center justify-between`}>
                  <span className={`font-semibold text-sm ${themeClasses.textPrimary(theme)}`}>{selectedFile.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => downloadFile(selectedFile)}
                      className="p-1 hover:bg-green-600/20 rounded flex items-center gap-1 text-xs transition-colors text-green-400"
                      title="Download file"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleSaveFileContent(selectedFile.content || '')}
                      className="p-1 hover:bg-blue-600/20 rounded flex items-center gap-1 text-xs transition-colors text-blue-400"
                      title="Save file to project"
                    >
                      <Save size={14} />
                      Save
                    </button>
                  </div>
                </div>
                <textarea
                  value={selectedFile.content || ''}
                  onChange={(e) => setSelectedFile({ ...selectedFile, content: e.target.value })}
                  className={`flex-1 ${theme === 'dark' ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-800'} p-3 focus:outline-none font-mono text-sm`}
                  spellCheck="false"
                />
              </>
            ) : (
              <div className={`flex-1 flex items-center justify-center ${themeClasses.textSecondary(theme)}`}>
                Select a file to edit
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-lg overflow-hidden flex flex-col`}>
            <div className={`p-3 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'} font-semibold text-sm`}>
              Project Info
            </div>
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 text-sm ${themeClasses.textSecondary(theme)}`}>
              <div>
                <p className="text-xs">Created</p>
                <p className={`${themeClasses.textPrimary(theme)} mt-1`}>{selectedProject.createdAt?.split('T')[0]}</p>
              </div>
              <div>
                <p className="text-xs">Environment</p>
                <p className={`${themeClasses.textPrimary(theme)} mt-1 capitalize`}>{selectedProject.environment}</p>
              </div>
              <div>
                <p className="text-xs">Saved Code Files</p>
                <p className={`${themeClasses.textPrimary(theme)} mt-1 text-lg font-semibold`}>{selectedProject.code.length}</p>
              </div>
              {selectedProject.code.length > 0 && (
                <div>
                  <p className="text-xs mb-2">Available Code</p>
                  <div className="space-y-1">
                    {selectedProject.code.map(code => (
                      <div key={code.id} className={`text-xs px-2 py-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} rounded`}>
                        {code.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedFile && (
                <>
                  <div>
                    <p className="text-xs">File Type</p>
                    <p className={`${themeClasses.textPrimary(theme)} mt-1`}>{selectedFile.language}</p>
                  </div>
                  <div>
                    <p className="text-xs">Size</p>
                    <p className={`${themeClasses.textPrimary(theme)} mt-1`}>{(selectedFile.content?.length || 0).toLocaleString()} bytes</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Terminal */}
        {selectedFile && (
          <div>
            <CodeTerminal
              code={selectedFile.content}
              language={selectedFile.language}
              title={`Running ${selectedFile.name}`}
              height="h-48"
            />
          </div>
        )}

        {/* Modals */}
        {showNewFileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full space-y-4`}>
              <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>Create New File</h2>
              <input
                type="text"
                placeholder="File name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
              />
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
              >
                <option value="python">Python</option>
                <option value="dockerfile">Dockerfile</option>
                <option value="yaml">YAML</option>
                <option value="json">JSON</option>
                <option value="text">Text</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewFileModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} transition`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {showNewFolderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full space-y-4`}>
              <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>Create New Folder</h2>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} transition`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Projects</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Manage your ML projects</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', environment: 'dev' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 items-center flex-wrap">
        <SearchBar
          placeholder="Search projects..."
          onSearch={(query) => setSearchQuery(query)}
        />
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(status => (
            <FilterChip
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              isActive={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            />
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {paginatedProjects.length === 0 ? (
        <EmptyState
          icon={<Code size={48} />}
          title="No projects found"
          description="Create your first project to get started"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedProjects.map(project => (
            <div
              key={project.id}
              className={`rounded-lg border backdrop-blur-sm transition-all hover:shadow-lg overflow-hidden bg-gradient-to-br ${getEnvColor(project.environment)}`}
            >
              <div className={`p-4 border-b ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white/50 border-slate-300/50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${themeClasses.textPrimary(theme)}`}>{project.name}</h3>
                    <p className={`${themeClasses.textSecondary(theme)} text-sm mt-1`}>{project.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className={`p-4 space-y-3`}>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className={`${themeClasses.textSecondary(theme)} text-xs`}>Environment</p>
                    <p className={`${themeClasses.textPrimary(theme)} font-semibold capitalize`}>{project.environment}</p>
                  </div>
                  <div>
                    <p className={`${themeClasses.textSecondary(theme)} text-xs`}>Code Files</p>
                    <p className={`${themeClasses.textPrimary(theme)} font-semibold`}>{project.code.length}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => initializeWorkspace(project.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                  >
                    <Code size={14} />
                    Workspace
                  </button>
                  <button
                    onClick={() => openEditModal(project.id)}
                    className={`p-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg transition`}
                    title="Edit project"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full space-y-4`}>
            <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>
              {editingId ? 'Edit Project' : 'Create New Project'}
            </h2>
            <input
              type="text"
              placeholder="Project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500 min-h-20 resize-none`}
            />
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
              className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
            >
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="prod">Production</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} transition`}
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
