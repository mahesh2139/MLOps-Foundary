import React, { useState } from 'react';
import { Plus, Trash2, Upload, AlertCircle, Loader, Package, TrendingUp, Star, Check, Zap, Download, Code as CodeIcon, ArrowRight, Play } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb } from '../components/UIPatterns';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

export default function ModelRegistry() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    version: '1.0.0',
    projectId: '',
    modelType: 'classification' as const,
    stage: 'dev' as const,
  });
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; path: string; size: number; type: string } | null>(null);

  const selectedModel = selectedModelId ? global.getRegistryModel(selectedModelId) : null;

  const handleCreateModel = () => {
    if (!formData.name.trim() || !formData.projectId) {
      showNotification('Model name and project are required', 'warning');
      return;
    }

    const newModel = global.createRegistryModel({
      name: formData.name,
      version: formData.version,
      projectId: formData.projectId,
      codeId: selectedCodeId || undefined,
      modelType: formData.modelType,
      stage: formData.stage,
      status: 'active',
      metrics: {
        accuracy: Math.random() * 0.4 + 0.8,
        precision: Math.random() * 0.4 + 0.8,
        recall: Math.random() * 0.4 + 0.8,
      },
      uploadedFile: uploadedFile || undefined,
    });

    showNotification('Model registered successfully', 'success');
    setShowModal(false);
    setFormData({ name: '', version: '1.0.0', projectId: '', modelType: 'classification', stage: 'dev' });
    setSelectedCodeId(null);
    setUploadedFile(null);
  };

  const handlePromoteModel = (modelId: string, newStage: 'dev' | 'staging' | 'production') => {
    global.updateRegistryModel(modelId, { stage: newStage });
    showNotification(`Model promoted to ${newStage}`, 'success');
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('Delete this model?')) {
      global.deleteRegistryModel(modelId);
      if (selectedModelId === modelId) setSelectedModelId(null);
      showNotification('Model deleted', 'success');
    }
  };

  const [testingModelId, setTestingModelId] = useState<string | null>(null);

  const handleRunTest = (modelId: string) => {
    setTestingModelId(modelId);
    
    setTimeout(() => {
      global.updateRegistryModel(modelId, {
        metrics: {
          accuracy: Math.random() * 0.4 + 0.8,
          precision: Math.random() * 0.4 + 0.8,
          recall: Math.random() * 0.4 + 0.8,
        },
      });
      setTestingModelId(null);
      showNotification('Model test completed successfully', 'success');
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        path: `/models/${file.name}`,
        size: file.size,
        type: file.type,
      });
      showNotification(`Model uploaded: ${file.name}`, 'success');
    }
  };

  const getProjectCodes = (projectId: string) => {
    const project = global.getProject(projectId);
    return project?.code || [];
  };

  const getStageColor = (stage: string) => {
    return stage === 'production' ? 'from-red-600/20 to-red-400/10 border-red-400/30' :
           stage === 'staging' ? 'from-yellow-600/20 to-yellow-400/10 border-yellow-400/30' :
           'from-blue-600/20 to-blue-400/10 border-blue-400/30';
  };

  const getStageIndicator = (stage: string) => {
    return stage === 'production' ? { color: 'text-red-400', bg: 'bg-red-500/20' } :
           stage === 'staging' ? { color: 'text-yellow-400', bg: 'bg-yellow-500/20' } :
           { color: 'text-blue-400', bg: 'bg-blue-500/20' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Model Registry</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Manage and promote ML models through pipeline stages</p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setFormData({ name: '', version: '1.0.0', projectId: '', modelType: 'classification', stage: 'dev' });
            setSelectedCodeId(null);
            setUploadedFile(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          Register Model
        </button>
      </div>

      {/* Pipeline Stages View */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['dev', 'staging', 'production'].map((stage, idx) => {
          const stageModels = global.registryModels.filter(m => m.stage === stage);
          const indicator = getStageIndicator(stage);
          return (
            <div
              key={stage}
              className={`rounded-lg border backdrop-blur-sm bg-gradient-to-br ${getStageColor(stage)} p-4`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${indicator.bg}`}></div>
                <h3 className={`font-semibold capitalize ${themeClasses.textPrimary(theme)}`}>{stage}</h3>
              </div>
              <p className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>{stageModels.length}</p>
              <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>Models</p>
            </div>
          );
        })}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {global.registryModels.length === 0 ? (
          <div className={`col-span-full text-center py-12 ${themeClasses.textSecondary(theme)}`}>
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No models registered yet</p>
          </div>
        ) : (
          global.registryModels.map(model => {
            const stageColor = getStageIndicator(model.stage);
            return (
              <div
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`rounded-lg border backdrop-blur-sm transition-all cursor-pointer ${
                  selectedModelId === model.id
                    ? `${theme === 'dark' ? 'bg-blue-900/50 border-blue-500' : 'bg-blue-100 border-blue-500'} border-2`
                    : `${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'}`
                }`}
              >
                <div className={`p-4 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>{model.name}</h3>
                      <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>{model.version}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stageColor.bg} ${stageColor.color} capitalize`}>
                      {model.stage}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="text-sm">
                    <p className={`${themeClasses.textSecondary(theme)} text-xs mb-1`}>Type</p>
                    <p className={`${themeClasses.textPrimary(theme)} capitalize`}>{model.modelType}</p>
                  </div>

                  {model.metrics && (
                    <div className="space-y-2">
                      {Object.entries(model.metrics).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className={`${themeClasses.textSecondary(theme)} capitalize`}>{key}</span>
                          <span className={`font-semibold ${(value as number) > 0.85 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {((value as number) * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedModelId(model.id)}
                    className={`w-full px-3 py-2 text-sm rounded-lg transition ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedModel && (
        <div className={`rounded-lg border backdrop-blur-sm bg-gradient-to-br ${getStageColor(selectedModel.stage)} p-6 mt-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>{selectedModel.name}</h2>
              <p className={`${themeClasses.textSecondary(theme)} text-sm`}>Version {selectedModel.version} • Project: {global.getProject(selectedModel.projectId)?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunTest(selectedModel.id)}
                disabled={testingModelId === selectedModel.id}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg text-sm transition flex items-center gap-1"
                title="Run model test"
              >
                {testingModelId === selectedModel.id ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Test
                  </>
                )}
              </button>
              <button
                onClick={() => handleDeleteModel(selectedModel.id)}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {selectedModel.metrics && Object.entries(selectedModel.metrics).map(([key, value]) => (
              <div key={key} className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3`}>
                <p className={`text-xs ${themeClasses.textSecondary(theme)} capitalize`}>{key}</p>
                <p className={`text-2xl font-bold ${(value as number) > 0.85 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {((value as number) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>

          {/* Promotion Pipeline */}
          <div className="flex items-center gap-3 mb-6">
            {['dev', 'staging', 'production'].map((stage, idx) => {
              const isActive = selectedModel.stage === stage;
              const isCompleted = ['dev', 'staging', 'production'].indexOf(selectedModel.stage) >= idx;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <button
                    onClick={() => handlePromoteModel(selectedModel.id, stage as any)}
                    disabled={['dev', 'staging', 'production'].indexOf(selectedModel.stage) > idx}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600/20 text-green-400'
                        : `${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} disabled:opacity-50`
                    }`}
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </button>
                  {idx < 2 && <ArrowRight size={18} className={themeClasses.textSecondary(theme)} />}
                </div>
              );
            })}
          </div>

          {/* Code Information */}
          {selectedModel.codeId && (
            <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-4 mb-4`}>
              <h4 className={`font-semibold text-sm mb-2 ${themeClasses.textPrimary(theme)}`}>Registration Code</h4>
              {(() => {
                const project = global.getProject(selectedModel.projectId);
                const code = project?.code.find(c => c.id === selectedModel.codeId);
                return code ? (
                  <div>
                    <p className={`${themeClasses.textPrimary(theme)} font-mono text-sm`}>{code.name}</p>
                    <p className={`${themeClasses.textSecondary(theme)} text-xs`}>{code.language}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* File Info */}
          {selectedModel.uploadedFile && (
            <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-4`}>
              <h4 className={`font-semibold text-sm mb-2 ${themeClasses.textPrimary(theme)}`}>Model File</h4>
              <p className={`${themeClasses.textPrimary(theme)} text-sm`}>{selectedModel.uploadedFile.name}</p>
              <p className={`${themeClasses.textSecondary(theme)} text-xs`}>{(selectedModel.uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      )}

      {/* Create Model Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'} sticky top-0`}>
              <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>Register New Model</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Model Name */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Model Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Customer Churn Predictor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                />
              </div>

              {/* Version */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => {
                    setFormData({ ...formData, projectId: e.target.value });
                    setSelectedCodeId(null);
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                >
                  <option value="">Select a project...</option>
                  {global.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Model Type */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Model Type</label>
                <select
                  value={formData.modelType}
                  onChange={(e) => setFormData({ ...formData, modelType: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                >
                  <option value="classification">Classification</option>
                  <option value="regression">Regression</option>
                  <option value="clustering">Clustering</option>
                  <option value="nlp">NLP</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Upload Model */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Upload Model File</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  theme === 'dark' ? 'border-slate-600 hover:border-blue-500' : 'border-slate-300 hover:border-blue-500'
                }`}>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="model-file-upload"
                  />
                  <label htmlFor="model-file-upload" className="cursor-pointer block">
                    <Upload size={32} className="mx-auto mb-2 opacity-50" />
                    <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>Click to upload model file</p>
                    {uploadedFile && <p className="text-sm text-green-400 mt-2">✓ {uploadedFile.name}</p>}
                  </label>
                </div>
              </div>

              {/* Code Selection */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Registration Code (Optional)</label>
                  <select
                    value={selectedCodeId || ''}
                    onChange={(e) => setSelectedCodeId(e.target.value || null)}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">No code selected</option>
                    {getProjectCodes(formData.projectId).map(code => (
                      <option key={code.id} value={code.id}>
                        {code.name} ({code.language})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} transition`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateModel}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Register Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
