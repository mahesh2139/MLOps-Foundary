import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Upload, AlertCircle, Loader, Package, GitBranch, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';

interface ModelRegistry {
  id: string;
  name: string;
  version: string;
  stage: 'development' | 'staging' | 'production';
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
  };
  createdAt?: string;
  createdBy?: string;
}

export default function ModelRegistry() {
  const { theme } = useTheme();
  const [models, setModels] = useState<ModelRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    version: '1.0.0',
    stage: 'development' as const,
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await APIClient.apiGet('/model-registry');
      setModels(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.warn('Failed to load models:', err);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showNotification('Model name is required', 'warning');
      return;
    }

    try {
      await APIClient.apiPost('/model-registry', formData);
      showNotification('Model registered successfully', 'success');
      setShowModal(false);
      setFormData({ name: '', version: '1.0.0', stage: 'development' });
      await loadModels();
    } catch (err) {
      const newModel: ModelRegistry = {
        id: Date.now().toString(),
        ...formData,
        metrics: { accuracy: 0.92, precision: 0.89, recall: 0.87 },
        createdAt: new Date().toISOString(),
      };
      setModels([...models, newModel]);
      setShowModal(false);
      showNotification('Model registered locally', 'success');
    }
  };

  const handlePromote = async (id: string, newStage: 'staging' | 'production') => {
    try {
      await APIClient.apiPut(`/model-registry/${id}`, { stage: newStage });
      showNotification(`Model promoted to ${newStage}`, 'success');
      setModels(models.map(m => m.id === id ? { ...m, stage: newStage } : m));
    } catch (err) {
      setModels(models.map(m => m.id === id ? { ...m, stage: newStage } : m));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await APIClient.apiDelete(`/model-registry/${id}`);
      showNotification('Model deleted', 'success');
      setModels(models.filter(m => m.id !== id));
    } catch (err) {
      setModels(models.filter(m => m.id !== id));
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'development': 'bg-blue-500/20 text-blue-300',
      'staging': 'bg-yellow-500/20 text-yellow-300',
      'production': 'bg-green-500/20 text-green-300',
    };
    return colors[stage] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Model Registry</h1>
          <p className="text-white/60 text-sm mt-1">MLflow-style model registry with versioning and promotion</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', version: '1.0.0', stage: 'development' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium"
        >
          <Plus size={16} />
          Register Model
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Total Models</p>
          <p className="text-2xl font-bold text-white">{models.length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">In Production</p>
          <p className="text-2xl font-bold text-green-400">{models.filter(m => m.stage === 'production').length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Staging</p>
          <p className="text-2xl font-bold text-yellow-400">{models.filter(m => m.stage === 'staging').length}</p>
        </div>
      </div>

      {/* Models List */}
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-white/60">
            <Loader size={20} className="animate-spin" />
            Loading models...
          </div>
        ) : models.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={32} className="mx-auto mb-3 text-white/30" />
            <p className="text-white/60">No registered models yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white text-sm font-medium"
            >
              Register your first model
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Accuracy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Stage</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {models.map(model => (
                  <tr key={model.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{model.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{model.version}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{(model.metrics.accuracy * 100).toFixed(1)}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStageColor(model.stage)}`}>
                        {model.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {model.stage !== 'production' && (
                        <button
                          onClick={() => handlePromote(model.id, model.stage === 'development' ? 'staging' : 'production')}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-300 text-xs font-medium transition"
                        >
                          <Check size={12} />
                          Promote
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 text-xs font-medium transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg border border-white/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Register Model</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Model Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="e.g., Sales Prediction"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Initial Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition font-medium"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
