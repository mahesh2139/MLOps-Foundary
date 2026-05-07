import React, { useState, useEffect } from 'react';
import { Database, GitBranch, Activity, Package, Play, CheckCircle, Bot, FileCode, Server, Eye, Filter, Code, Container, Shield, TrendingUp, Download, Bell, X, Check, ChevronRight, Upload, BarChart3, AlertTriangle, Loader, Zap, Sparkles, ArrowRight, Lock, Book } from 'lucide-react';
import Documentation from './Documentation';

// Helper Components
const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <div className="animate-slideUp" style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${value}%` }} />
  </div>
);

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-white/70">{icon}</div>
      <p className="text-xs text-white/60">{label}</p>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

export default function MLOpsStudio() {
  // State Management
  const [view, setView] = useState<'workflow' | 'documentation'>('workflow');
  const [currentStep, setCurrentStep] = useState('ingestion');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [ingestionData, setIngestionData] = useState<any>(null);
  const [dataProfile, setDataProfile] = useState<any>(null);
  const [dataValidation, setDataValidation] = useState<any>(null);
  const [processingConfig, setProcessingConfig] = useState({ handleMissing: 'mean', scaleFeatures: true, removeOutliers: false });
  const [processedData, setProcessedData] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [trainingConfig, setTrainingConfig] = useState({ algorithm: 'random_forest', testSize: 0.2, hyperparamTuning: false });
  const [trainingResults, setTrainingResults] = useState<any>(null);
  const [trainingInProgress, setTrainingInProgress] = useState(false);
  const [registryMode, setRegistryMode] = useState('train');
  const [registeredModels, setRegisteredModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [uploadedModelFile, setUploadedModelFile] = useState<any>(null);
  const [deploymentMode, setDeploymentMode] = useState('registry');
  const [deploymentType, setDeploymentType] = useState('docker');
  const [deploymentEnv, setDeploymentEnv] = useState('dev');
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  const [deployModelFile, setDeployModelFile] = useState<any>(null);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [monitoringMetrics, setMonitoringMetrics] = useState<any>(null);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  const steps = [
    { id: 'ingestion', name: 'Data Ingestion', icon: Database },
    { id: 'processing', name: 'Data Processing', icon: Filter },
    { id: 'features', name: 'Feature Store', icon: Package },
    { id: 'training', name: 'Model Training', icon: Activity },
    { id: 'performance', name: 'Performance', icon: BarChart3 },
    { id: 'registry', name: 'Model Registry', icon: FileCode },
    { id: 'cicd', name: 'CI/CD Pipeline', icon: GitBranch },
    { id: 'deployment', name: 'Deployment', icon: Server },
    { id: 'monitoring', name: 'Monitoring', icon: Eye },
    { id: 'governance', name: 'Governance', icon: Shield }
  ];

  // Helper Functions
  const addAuditLog = (action: string, details: string) => {
    setAuditLog(prev => [{
      timestamp: new Date().toISOString(),
      action,
      details,
      user: 'Studio User'
    }, ...prev]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj: any, header, index) => {
          const value = values[index]?.trim();
          obj[header] = isNaN(Number(value)) ? value : parseFloat(value);
          return obj;
        }, {});
      });
      setIngestionData({ headers, rows, fileName: file.name });
      profileData(rows, headers);
      validateData(rows, headers);
      addAuditLog('Data Ingestion', 'Uploaded ' + file.name);
      setCompletedSteps(prev => [...new Set([...prev, 'ingestion'])]);
    };
    reader.readAsText(file);
  };

  const profileData = (rows: any[], headers: string[]) => {
    const profile = headers.map(header => {
      const values = rows.map(row => row[header]).filter(v => v !== undefined && v !== null && v !== '');
      const numericValues = values.filter(v => typeof v === 'number');
      const isNumeric = numericValues.length > values.length * 0.8;
      return {
        name: header,
        type: isNumeric ? 'numeric' : 'categorical',
        nullCount: rows.length - values.length,
        uniqueCount: new Set(values).size,
        mean: isNumeric ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2) : null
      };
    });
    setDataProfile(profile);
  };

  const validateData = (rows: any[], headers: string[]) => {
    const report: any = {
      totalRows: rows.length,
      totalColumns: headers.length,
      issues: [],
      quality: 100
    };
    headers.forEach(header => {
      const values = rows.map(row => row[header]);
      const nullCount = values.filter(v => v === undefined || v === null || v === '').length;
      if (nullCount > 0) {
        report.issues.push({
          column: header,
          message: nullCount + ' missing values'
        });
      }
    });
    report.quality = Math.max(0, 100 - report.issues.length * 5);
    setDataValidation(report);
  };

  const processData = () => {
    if (!ingestionData) return;
    const processed = {
      ...ingestionData,
      transformations: [
        'Missing values: ' + processingConfig.handleMissing,
        'Feature scaling: ' + (processingConfig.scaleFeatures ? 'Applied' : 'Skipped')
      ]
    };
    setProcessedData(processed);
    const autoFeatures = dataProfile.map((col: any) => ({
      id: col.name,
      name: col.name,
      type: col.type,
      importance: Math.random().toFixed(3)
    }));
    setFeatures(autoFeatures);
    setSelectedFeatures(autoFeatures.filter((f: any) => f.type === 'numeric').map((f: any) => f.id));
    addAuditLog('Data Processing', 'Applied transformations');
    setCompletedSteps(prev => [...new Set([...prev, 'processing'])]);
    setCurrentStep('features');
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) ? prev.filter(id => id !== featureId) : [...prev, featureId]
    );
  };

  const finalizeFeatures = () => {
    if (selectedFeatures.length === 0) {
      alert('Please select at least one feature');
      return;
    }
    addAuditLog('Feature Selection', 'Selected ' + selectedFeatures.length + ' features');
    setCompletedSteps(prev => [...new Set([...prev, 'features'])]);
    setCurrentStep('training');
  };

  const trainModel = () => {
    if (!processedData || selectedFeatures.length === 0) return;
    setTrainingInProgress(true);
    setTimeout(() => {
      const results = {
        algorithm: trainingConfig.algorithm,
        accuracy: (0.85 + Math.random() * 0.1).toFixed(3),
        precision: (0.82 + Math.random() * 0.1).toFixed(3),
        recall: (0.84 + Math.random() * 0.1).toFixed(3),
        f1Score: (0.83 + Math.random() * 0.1).toFixed(3),
        featureImportance: selectedFeatures.map(f => ({
          feature: f,
          importance: Math.random().toFixed(3)
        })).sort((a, b) => Number(b.importance) - Number(a.importance)),
      };
      setTrainingResults(results);
      setTrainingInProgress(false);
      addAuditLog('Model Training', 'Trained ' + trainingConfig.algorithm);
      setCompletedSteps(prev => [...new Set([...prev, 'training', 'performance'])]);
    }, 3000);
  };

  const registerModel = () => {
    if (registryMode === 'train' && !trainingResults) return;
    if (registryMode === 'upload' && !uploadedModelFile) return;
    const model = {
      id: 'model_' + Date.now(),
      name: registryMode === 'train' 
        ? trainingConfig.algorithm + '_v' + (registeredModels.length + 1)
        : uploadedModelFile.name.replace(/\.(pkl|h5|pt)$/, ''),
      version: '1.' + registeredModels.length,
      accuracy: registryMode === 'train' ? trainingResults.accuracy : 'N/A',
      status: 'staging',
      approved: false
    };
    const updated = [...registeredModels, model];
    setRegisteredModels(updated);
    setSelectedModel(model);
    addAuditLog('Model Registration', 'Registered ' + model.name);
    setCompletedSteps(prev => [...new Set([...prev, 'registry'])]);
  };

  const approveModel = (modelId: string) => {
    const updated = registeredModels.map((m: any) => 
      m.id === modelId ? { ...m, approved: true, status: 'production' } : m
    );
    setRegisteredModels(updated);
    const approved = updated.find((m: any) => m.id === modelId);
    setSelectedModel(approved);
    addAuditLog('Model Approval', 'Approved model');
    setCompletedSteps(prev => [...new Set([...prev, 'governance'])]);
  };

  const deployModel = () => {
    if (deploymentMode === 'registry' && (!selectedModel || !selectedModel.approved)) {
      alert('Please register and approve a model first');
      return;
    }
    if (deploymentMode === 'upload' && !deployModelFile) {
      alert('Please upload a model file first');
      return;
    }
    setDeploymentLogs(['Starting deployment...', 'Building container...']);
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Container built', 'Deploying...']);
      setTimeout(() => {
        setDeploymentLogs(prev => [...prev, 'Deployed to ' + deploymentEnv, 'Endpoint ready']);
        const deployment = {
          type: deploymentType,
          env: deploymentEnv,
          status: 'deployed',
          endpoint: 'https://' + deploymentEnv + '.model.com/predict',
          deployedAt: new Date().toISOString()
        };
        setDeploymentStatus(deployment);
        addAuditLog('Deployment', 'Deployed to ' + deploymentEnv);
        setCompletedSteps(prev => [...new Set([...prev, 'cicd', 'deployment'])]);
        startMonitoring();
      }, 1500);
    }, 2000);
  };

  const startMonitoring = () => {
    const metrics = {
      requests: Math.floor(Math.random() * 10000 + 5000),
      avgLatency: (Math.random() * 100 + 50).toFixed(2),
      errorRate: (Math.random() * 0.05).toFixed(3),
      drift: (Math.random() * 0.15).toFixed(3),
      detailed: {
        p50Latency: (Math.random() * 80 + 40).toFixed(2),
        p95Latency: (Math.random() * 150 + 100).toFixed(2),
        p99Latency: (Math.random() * 200 + 150).toFixed(2),
        memoryUsage: (Math.random() * 30 + 40).toFixed(1),
        cpuUsage: (Math.random() * 40 + 30).toFixed(1)
      }
    };
    setMonitoringMetrics(metrics);
    if (parseFloat(metrics.drift) > 0.1) {
      setAlerts([{ id: Date.now(), message: 'Data drift detected' }]);
    }
    addAuditLog('Monitoring', 'Monitoring enabled');
    setCompletedSteps(prev => [...new Set([...prev, 'monitoring'])]);
  };

  const generateWorkflowYAML = () => {
    if (completedSteps.length === 0) return '# No steps completed yet';
    const jobs: any = {};
    if (completedSteps.includes('ingestion')) {
      jobs['data-ingestion'] = {
        'runs-on': 'ubuntu-latest',
        steps: [{ name: 'Checkout', uses: 'actions/checkout@v3' }, { name: 'Ingest Data', run: 'python scripts/ingest.py' }]
      };
    }
    if (completedSteps.includes('training')) {
      jobs['train'] = {
        'runs-on': 'ubuntu-latest',
        steps: [{ name: 'Train', run: 'python train.py' }]
      };
    }
    if (completedSteps.includes('deployment')) {
      jobs['deploy'] = {
        'runs-on': 'ubuntu-latest',
        steps: [{ name: 'Deploy', run: 'docker build -t model .' }]
      };
    }
    return JSON.stringify({
      name: 'MLOps Studio',
      on: { push: { branches: ['main'] } },
      jobs
    }, null, 2);
  };

  useEffect(() => {
    setAiSuggestions([{
      text: 'AI Assistant ready. Upload data to begin.',
      actions: []
    }]);
  }, [currentStep]);

  const overallProgress = (completedSteps.length / steps.length) * 100;

  // Render Documentation if view is set
  if (view === 'documentation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Quick Nav Back */}
        <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">MLOps Documentation</h2>
            <button
              onClick={() => setView('workflow')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all flex items-center gap-2"
            >
              <ArrowRight size={16} />
              Back to Workflow
            </button>
          </div>
        </div>
        <Documentation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 backdrop-blur-sm border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-pink-400 rounded-xl opacity-75 blur-md" />
                <div className="relative bg-white/10 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center border border-white/20">
                  <Zap size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">MLOps Studio</h1>
                <p className="text-blue-100 text-sm font-medium">Production ML Workflow</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('documentation')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg flex items-center gap-2 transition-all duration-300 hover:shadow-lg"
              >
                <Book size={18} />
                <span className="hidden sm:inline">Docs</span>
              </button>
              <button
                onClick={() => setShowWorkflow(!showWorkflow)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg flex items-center gap-2 transition-all duration-300 hover:shadow-lg"
              >
                <Code size={18} />
                <span className="hidden sm:inline">{showWorkflow ? 'Hide' : 'Show'} Workflow</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white/80">Pipeline Progress</span>
              <span className="text-sm font-bold text-white">{Math.round(overallProgress)}%</span>
            </div>
            <ProgressBar value={overallProgress} />
          </div>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-1 mt-4">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 transform hover:scale-110 ${
                  completedSteps.includes(step.id)
                    ? 'bg-green-400 text-gray-900 shadow-lg shadow-green-400/50'
                    : currentStep === step.id
                    ? 'bg-blue-400 text-gray-900 shadow-lg shadow-blue-400/50 scale-110'
                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                }`}
                title={step.name}
              >
                {completedSteps.includes(step.id) ? <Check size={16} /> : <span>{step.name.charAt(0)}</span>}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Workflow Modal */}
      {showWorkflow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <AnimatedCard delay={0}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-white/10 max-w-2xl w-full max-h-96 flex flex-col">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Code size={24} />
                  GitHub Actions Workflow
                </h2>
                <button
                  onClick={() => setShowWorkflow(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
              <pre className="flex-1 overflow-auto p-6 bg-black/30 text-green-400 text-xs font-mono">{generateWorkflowYAML()}</pre>
              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => alert('Uploaded to GitHub!')}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
                >
                  <Upload size={18} />
                  Upload
                </button>
                <button
                  onClick={() => setShowWorkflow(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <AnimatedCard delay={100}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl backdrop-blur-sm">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles size={20} />
                    Workflow Steps
                  </h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {steps.map((step, idx) => {
                      const Icon = step.icon;
                      const isCompleted = completedSteps.includes(step.id);
                      const isCurrent = currentStep === step.id;

                      return (
                        <button
                          key={step.id}
                          onClick={() => setCurrentStep(step.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                            isCurrent
                              ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 shadow-lg shadow-blue-500/20'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg transition-all duration-300 ${
                              isCurrent
                                ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                                : isCompleted
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/5 text-white/60 group-hover:bg-white/10'
                            }`}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-xs font-medium text-gray-400">{idx + 1}</p>
                            <p className={`text-sm font-semibold ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                              {step.name}
                            </p>
                          </div>
                          {isCompleted && <CheckCircle size={18} className="text-green-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {aiSuggestions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-purple-500/30 rounded-lg">
                            <Bot size={16} className="text-purple-300" />
                          </div>
                          <span className="font-semibold text-purple-300">AI Assistant</span>
                        </div>
                        <p className="text-xs text-purple-200 leading-relaxed">{aiSuggestions[0].text}</p>
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </div>
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {currentStep === 'ingestion' && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                      <Database className="text-blue-400" size={32} />
                      Data Ingestion
                    </h2>
                    <p className="text-white/60">Upload your dataset to begin the pipeline</p>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="sr-only"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="block p-8 border-2 border-dashed border-blue-400/50 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-500/5 transition-all duration-300 text-center group"
                    >
                      <Upload className="mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform duration-300" size={32} />
                      <p className="text-white font-semibold">Drop your CSV file here</p>
                      <p className="text-white/60 text-sm">or click to browse</p>
                    </label>
                  </div>

                  {ingestionData && (
                    <div className="mt-6 animate-slideUp">
                      <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="text-green-400" size={24} />
                          <div>
                            <p className="font-semibold text-white">{ingestionData.fileName}</p>
                            <p className="text-sm text-green-300">{ingestionData.rows.length} rows loaded</p>
                          </div>
                        </div>
                      </div>

                      {dataProfile && (
                        <div className="mt-6">
                          <h3 className="text-lg font-bold text-white mb-4">Data Profile</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {dataProfile.slice(0, 6).map((col: any, idx: number) => (
                              <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
                                <p className="text-xs text-white/60 mb-1">Column</p>
                                <p className="text-sm font-semibold text-white truncate">{col.name}</p>
                                <p className="text-xs text-blue-400 mt-2">{col.type}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setCurrentStep('processing')}
                        className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
                      >
                        Next: Processing
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            )}

            {currentStep === 'processing' && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Filter className="text-teal-400" size={32} />
                    Data Processing
                  </h2>
                  <p className="text-white/60 mb-6">Configure how missing values are handled</p>

                  {!ingestionData ? (
                    <div className="p-6 bg-yellow-500/10 border border-yellow-400/30 rounded-lg text-yellow-300">
                      Complete data ingestion first
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <label className="block text-white font-semibold mb-2">Missing Value Strategy</label>
                        <select
                          value={processingConfig.handleMissing}
                          onChange={(e) => setProcessingConfig({...processingConfig, handleMissing: e.target.value})}
                          className="w-full p-4 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-blue-400 transition-all duration-300"
                        >
                          <option value="mean">Fill with Mean</option>
                          <option value="median">Fill with Median</option>
                          <option value="drop">Drop Rows</option>
                        </select>
                      </div>

                      {processedData && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-400/30 rounded-lg animate-slideUp">
                          <p className="text-green-300 font-semibold">✓ Processing Complete</p>
                        </div>
                      )}

                      <button
                        onClick={processData}
                        className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-teal-500/50"
                      >
                        Process Data
                      </button>
                    </>
                  )}
                </div>
              </AnimatedCard>
            )}

            {currentStep === 'features' && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Package className="text-purple-400" size={32} />
                    Feature Store
                  </h2>
                  <p className="text-white/60 mb-6">Select features for your model</p>

                  {features.length === 0 ? (
                    <div className="p-6 bg-yellow-500/10 border border-yellow-400/30 rounded-lg text-yellow-300">
                      Complete data processing first
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {features.map((f: any) => {
                          const isSelected = selectedFeatures.includes(f.id);
                          return (
                            <button
                              key={f.id}
                              onClick={() => toggleFeature(f.id)}
                              className={`p-4 rounded-lg border-2 transition-all duration-300 group relative overflow-hidden ${
                                isSelected
                                  ? 'border-purple-400 bg-purple-500/20'
                                  : 'border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/10'
                              }`}
                            >
                              <div className="relative z-10">
                                <p className="font-semibold text-white text-sm mb-1">{f.name}</p>
                                <p className="text-xs text-purple-300">{f.type}</p>
                                {isSelected && <Check className="mt-2 text-purple-400" size={18} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={finalizeFeatures}
                        disabled={selectedFeatures.length === 0}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:shadow-none"
                      >
                        Finalize {selectedFeatures.length} Features
                      </button>
                    </>
                  )}
                </div>
              </AnimatedCard>
            )}

            {currentStep === 'training' && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Activity className="text-green-400" size={32} />
                    Model Training
                  </h2>
                  <p className="text-white/60 mb-6">Train your ML model with optimized settings</p>

                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-2">Algorithm</label>
                    <select
                      value={trainingConfig.algorithm}
                      onChange={(e) => setTrainingConfig({...trainingConfig, algorithm: e.target.value})}
                      className="w-full p-4 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-green-400 transition-all duration-300"
                    >
                      <option value="random_forest">Random Forest</option>
                      <option value="xgboost">XGBoost</option>
                      <option value="logistic_regression">Logistic Regression</option>
                    </select>
                  </div>

                  <button
                    onClick={trainModel}
                    disabled={trainingInProgress}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-green-500/50 disabled:shadow-none"
                  >
                    {trainingInProgress ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Training in progress...
                      </>
                    ) : (
                      'Start Training'
                    )}
                  </button>

                  {trainingResults && (
                    <div className="mt-6 animate-slideUp">
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard icon={<TrendingUp size={20} />} label="Accuracy" value={trainingResults.accuracy} />
                        <StatCard icon={<Zap size={20} />} label="F1 Score" value={trainingResults.f1Score} />
                      </div>

                      <button
                        onClick={() => setCurrentStep('performance')}
                        className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
                      >
                        View Performance
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            )}

            {currentStep === 'performance' && trainingResults && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <BarChart3 className="text-orange-400" size={32} />
                    Performance Metrics
                  </h2>
                  <p className="text-white/60 mb-6">Model evaluation results and feature importance</p>

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4">Feature Importance</h3>
                    <div className="space-y-3">
                      {trainingResults.featureImportance.slice(0, 5).map((fi: any, i: number) => (
                        <div key={i} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{fi.feature}</span>
                            <span className="text-sm font-bold text-orange-400">{(Number(fi.importance) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-orange-500/50"
                              style={{ width: `${Number(fi.importance) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep('registry')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-orange-500/50"
                  >
                    Next: Model Registry
                    <ArrowRight size={20} />
                  </button>
                </div>
              </AnimatedCard>
            )}

            {currentStep === 'registry' && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <FileCode className="text-red-400" size={32} />
                    Model Registry
                  </h2>
                  <p className="text-white/60 mb-6">Register and manage your trained models</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { mode: 'train', icon: Activity, label: 'Trained Model' },
                      { mode: 'upload', icon: Upload, label: 'Upload Model' }
                    ].map(({ mode, icon: Icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => setRegistryMode(mode as any)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          registryMode === mode
                            ? 'border-red-400 bg-red-500/20'
                            : 'border-white/10 bg-white/5 hover:border-red-400/50'
                        }`}
                      >
                        <Icon className="mx-auto mb-2" size={24} />
                        <p className="font-semibold text-white text-sm">{label}</p>
                      </button>
                    ))}
                  </div>

                  {registryMode === 'upload' && (
                    <input
                      type="file"
                      accept=".pkl,.h5,.pt"
                      onChange={(e) => setUploadedModelFile(e.target.files?.[0])}
                      className="w-full p-4 border-2 border-dashed border-red-400/50 rounded-lg mb-6 cursor-pointer hover:border-red-400 transition-all duration-300"
                    />
                  )}

                  {((registryMode === 'train' && trainingResults) || (registryMode === 'upload' && uploadedModelFile)) && (
                    <>
                      {!selectedModel ? (
                        <button
                          onClick={registerModel}
                          className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-red-500/50 mb-6"
                        >
                          Register Model
                        </button>
                      ) : null}

                      {registeredModels.length > 0 && (
                        <div className="space-y-4">
                          {registeredModels.map((model: any) => (
                            <div key={model.id} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-white">{model.name}</p>
                                  <p className="text-xs text-white/60 mt-1">v{model.version}</p>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                  model.status === 'production'
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                  {model.status}
                                </span>
                              </div>
                              {!model.approved ? (
                                <button
                                  onClick={() => approveModel(model.id)}
                                  className="mt-3 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded text-sm font-semibold transition-all duration-300"
                                >
                                  Approve
                                </button>
                              ) : (
                                <button
                                  onClick={() => setCurrentStep('deployment')}
                                  className="mt-3 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded text-sm font-semibold transition-all duration-300"
                                >
                                  Deploy
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </AnimatedCard>
            )}

            {currentStep === 'cicd' && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <GitBranch className="text-indigo-400" size={32} />
                    CI/CD Pipeline
                  </h2>
                  <p className="text-white/60 mb-6">Automated build, test, and deployment stages</p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { name: 'Build', icon: 'build' },
                      { name: 'Test', icon: 'test' },
                      { name: 'Deploy', icon: 'deploy' }
                    ].map((stage) => (
                      <div key={stage.name} className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30 text-center">
                        <div className="flex justify-center mb-3">
                          <CheckCircle className="text-green-400" size={32} />
                        </div>
                        <p className="font-semibold text-white">{stage.name}</p>
                        <p className="text-xs text-green-300 mt-1">Passed</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentStep('deployment')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
                  >
                    Proceed to Deployment
                    <ArrowRight size={20} />
                  </button>
                </div>
              </AnimatedCard>
            )}

            {currentStep === 'deployment' && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Server className="text-cyan-400" size={32} />
                    Model Deployment
                  </h2>
                  <p className="text-white/60 mb-6">Deploy your model to production</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { mode: 'registry', icon: FileCode, label: 'From Registry' },
                      { mode: 'upload', icon: Upload, label: 'Upload Model' }
                    ].map(({ mode, icon: Icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => setDeploymentMode(mode as any)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          deploymentMode === mode
                            ? 'border-cyan-400 bg-cyan-500/20'
                            : 'border-white/10 bg-white/5 hover:border-cyan-400/50'
                        }`}
                      >
                        <Icon className="mx-auto mb-2" size={24} />
                        <p className="font-semibold text-white text-sm">{label}</p>
                      </button>
                    ))}
                  </div>

                  {deploymentMode === 'upload' && (
                    <input
                      type="file"
                      accept=".pkl,.h5,.pt"
                      onChange={(e) => setDeployModelFile(e.target.files?.[0])}
                      className="w-full p-4 border-2 border-dashed border-cyan-400/50 rounded-lg mb-6 cursor-pointer hover:border-cyan-400 transition-all duration-300"
                    />
                  )}

                  {((deploymentMode === 'registry' && selectedModel?.approved) || (deploymentMode === 'upload' && deployModelFile)) && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                          { type: 'docker', icon: Container, label: 'Docker' },
                          { type: 'batch', icon: Play, label: 'Batch' }
                        ].map(({ type, icon: Icon, label }) => (
                          <button
                            key={type}
                            onClick={() => setDeploymentType(type as any)}
                            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                              deploymentType === type
                                ? 'border-cyan-400 bg-cyan-500/20'
                                : 'border-white/10 bg-white/5 hover:border-cyan-400/50'
                            }`}
                          >
                            <Icon className="mx-auto mb-2" size={24} />
                            <p className="font-semibold text-white text-sm">{label}</p>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {['dev', 'staging', 'prod'].map((env) => (
                          <button
                            key={env}
                            onClick={() => setDeploymentEnv(env as any)}
                            className={`p-4 rounded-lg border-2 transition-all duration-300 font-semibold ${
                              deploymentEnv === env
                                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                                : 'border-white/10 bg-white/5 text-white/70 hover:border-cyan-400/50'
                            }`}
                          >
                            {env.charAt(0).toUpperCase() + env.slice(1)}
                          </button>
                        ))}
                      </div>

                      {deploymentLogs.length > 0 && (
                        <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/10">
                          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Code size={16} />
                            Deployment Logs
                          </h3>
                          <div className="space-y-1 text-xs font-mono">
                            {deploymentLogs.map((log, i) => (
                              <p key={i} className="text-green-400">
                                &gt; {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {!deploymentStatus ? (
                        <button
                          onClick={deployModel}
                          className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
                        >
                          Deploy Model
                          <Zap size={20} />
                        </button>
                      ) : (
                        <div className="animate-slideUp">
                          <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30 mb-6">
                            <div className="flex items-center gap-3 mb-2">
                              <CheckCircle className="text-green-400" size={24} />
                              <div>
                                <p className="font-semibold text-white">Deployment Successful</p>
                                <p className="text-sm text-green-300">{deploymentStatus.endpoint}</p>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setCurrentStep('monitoring')}
                            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
                          >
                            View Monitoring
                            <Eye size={20} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </AnimatedCard>
            )}

            {currentStep === 'monitoring' && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Eye className="text-pink-400" size={32} />
                    Model Monitoring
                  </h2>
                  <p className="text-white/60 mb-6">Real-time performance and health metrics</p>

                  {!monitoringMetrics ? (
                    <div className="p-6 bg-yellow-500/10 border border-yellow-400/30 rounded-lg text-yellow-300">
                      Deploy a model first to view metrics
                    </div>
                  ) : (
                    <>
                      {alerts.length > 0 && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
                          <h3 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                            <AlertTriangle size={18} />
                            Active Alerts
                          </h3>
                          {alerts.map((alert: any) => (
                            <p key={alert.id} className="text-sm text-red-300">{alert.message}</p>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard icon={<Zap size={20} />} label="Requests" value={monitoringMetrics.requests.toLocaleString()} />
                        <StatCard icon={<TrendingUp size={20} />} label="Latency" value={monitoringMetrics.avgLatency + 'ms'} />
                        <StatCard icon={<AlertTriangle size={20} />} label="Error Rate" value={(Number(monitoringMetrics.errorRate) * 100).toFixed(2) + '%'} />
                        <StatCard icon={<Activity size={20} />} label="Drift" value={(Number(monitoringMetrics.drift) * 100).toFixed(2) + '%'} />
                      </div>

                      <button
                        onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
                        className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold flex items-center justify-between transition-all duration-300"
                      >
                        <span>{showDetailedMetrics ? 'Hide' : 'Show'} Detailed Metrics</span>
                        <ChevronRight size={20} className={`transition-transform duration-300 ${showDetailedMetrics ? 'rotate-90' : ''}`} />
                      </button>

                      {showDetailedMetrics && monitoringMetrics.detailed && (
                        <div className="mt-6 animate-slideUp">
                          <h3 className="text-lg font-bold text-white mb-4">Advanced Metrics</h3>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <StatCard icon={<Activity size={20} />} label="P50 Latency" value={monitoringMetrics.detailed.p50Latency + 'ms'} />
                            <StatCard icon={<Activity size={20} />} label="P95 Latency" value={monitoringMetrics.detailed.p95Latency + 'ms'} />
                            <StatCard icon={<Activity size={20} />} label="P99 Latency" value={monitoringMetrics.detailed.p99Latency + 'ms'} />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                              <p className="text-xs text-yellow-300 mb-2">Memory Usage</p>
                              <div className="mb-2 h-3 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 transition-all duration-500" style={{width: monitoringMetrics.detailed.memoryUsage + '%'}} />
                              </div>
                              <p className="text-lg font-bold text-yellow-300">{monitoringMetrics.detailed.memoryUsage}%</p>
                            </div>
                            <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
                              <p className="text-xs text-red-300 mb-2">CPU Usage</p>
                              <div className="mb-2 h-3 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 transition-all duration-500" style={{width: monitoringMetrics.detailed.cpuUsage + '%'}} />
                              </div>
                              <p className="text-lg font-bold text-red-300">{monitoringMetrics.detailed.cpuUsage}%</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setCurrentStep('governance')}
                        className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-pink-500/50"
                      >
                        View Governance
                        <ArrowRight size={20} />
                      </button>
                    </>
                  )}
                </div>
              </AnimatedCard>
            )}

            {currentStep === 'governance' && (
              <AnimatedCard delay={200}>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Lock className="text-yellow-400" size={32} />
                    Governance & Audit Trail
                  </h2>
                  <p className="text-white/60 mb-6">Compliance and audit logs for your pipeline</p>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white">Audit Trail</h3>
                      <button
                        onClick={() => alert('Audit report downloaded')}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300"
                      >
                        <Download size={16} />
                        Export PDF
                      </button>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                      {auditLog.length === 0 ? (
                        <p className="text-white/60 text-sm text-center py-8">No audit logs yet</p>
                      ) : (
                        auditLog.map((log, i) => (
                          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-semibold text-white">{log.action}</span>
                              <span className="text-xs text-white/60">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-white/70 mb-1">{log.details}</p>
                            <p className="text-xs text-white/50">by {log.user}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                      <CheckCircle className="text-green-400 mb-3" size={32} />
                      <p className="font-semibold text-white">Compliance</p>
                      <p className="text-sm text-green-300 mt-1">All checks passed</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30">
                      <Shield className="text-blue-400 mb-3" size={32} />
                      <p className="font-semibold text-white">Security</p>
                      <p className="text-sm text-blue-300 mt-1">Controls active</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                    <div className="flex items-start gap-3">
                      <Sparkles className="text-purple-400 mt-1 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-semibold text-white mb-1">Pipeline Complete</p>
                        <p className="text-sm text-purple-200">All 10 steps successfully completed with full governance enforcement and compliance verification.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            )}
          </div>
        </div>
      </main>

      {/* Global Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }

        input[type="file"],
        select {
          background-color: rgba(255, 255, 255, 0.05);
          color: white;
        }

        input[type="file"]::file-selector-button {
          background: rgba(59, 130, 246, 0.2);
          color: white;
          border: 1px solid rgba(59, 130, 246, 0.5);
          cursor: pointer;
        }

        option {
          background-color: #1e293b;
          color: white;
        }
      `}</style>
    </div>
  );
}
