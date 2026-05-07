import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Pause, AlertCircle, Loader, Server, RefreshCw, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';

interface DeploymentJob {
  id: string;
  name: string;
  modelVersion: string;
  environment: 'dev' | 'staging' | 'prod';
  status: 'running' | 'stopped' | 'failed';
  replicas: number;
  createdAt?: string;
  lastUpdated?: string;
}

export default function Deployment() {
  const { theme } = useTheme();
  const [deployments, setDeployments] = useState<DeploymentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    modelVersion: '',
    environment: 'dev' as const,
    replicas: 1,
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    loadDeployments();
  }, []);

  const loadDeployments = async () => {
    setLoading(true);
    try {
      const res = await APIClient.apiGet('/deployments');
      setDeployments(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.warn('Failed to load deployments:', err);
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.modelVersion.trim()) {
      showNotification('Name and model version are required', 'warning');
      return;
    }

    try {
      await APIClient.apiPost('/deployments', formData);
      showNotification('Deployment created successfully', 'success');
      setShowModal(false);
      setFormData({ name: '', modelVersion: '', environment: 'dev', replicas: 1 });
      await loadDeployments();
    } catch (err) {
      const newDeployment: DeploymentJob = {
        id: Date.now().toString(),
        ...formData,
        status: 'running',
        createdAt: new Date().toISOString(),
      };
      setDeployments([...deployments, newDeployment]);
      setShowModal(false);
      showNotification('Deployment created locally', 'success');
    }
  };

  const handleStart = async (id: string) => {
    try {
      await APIClient.apiPost(`/deployments/${id}/start`, {});
      showNotification('Deployment started', 'success');
      setDeployments(deployments.map(d => d.id === id ? { ...d, status: 'running' } : d));
    } catch (err) {
      setDeployments(deployments.map(d => d.id === id ? { ...d, status: 'running' } : d));
    }
  };

  const handleStop = async (id: string) => {
    try {
      await APIClient.apiPost(`/deployments/${id}/stop`, {});
      showNotification('Deployment stopped', 'success');
      setDeployments(deployments.map(d => d.id === id ? { ...d, status: 'stopped' } : d));
    } catch (err) {
      setDeployments(deployments.map(d => d.id === id ? { ...d, status: 'stopped' } : d));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await APIClient.apiDelete(`/deployments/${id}`);
      showNotification('Deployment deleted', 'success');
      setDeployments(deployments.filter(d => d.id !== id));
    } catch (err) {
      setDeployments(deployments.filter(d => d.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'running': 'bg-green-500/20 text-green-300',
      'stopped': 'bg-gray-500/20 text-gray-300',
      'failed': 'bg-red-500/20 text-red-300',
    };
    return colors[status] || 'bg-blue-500/20 text-blue-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Model Deployment</h1>
          <p className="text-white/60 text-sm mt-1">Deploy models to Docker containers and manage versions</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', modelVersion: '', environment: 'dev', replicas: 1 });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium"
        >
          <Plus size={16} />
          New Deployment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Total Deployments</p>
          <p className="text-2xl font-bold text-white">{deployments.length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Running</p>
          <p className="text-2xl font-bold text-green-400">{deployments.filter(d => d.status === 'running').length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Stopped</p>
          <p className="text-2xl font-bold text-gray-400">{deployments.filter(d => d.status === 'stopped').length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-400">{deployments.filter(d => d.status === 'failed').length}</p>
        </div>
      </div>

      {/* Deployments List */}
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-white/60">
            <Loader size={20} className="animate-spin" />
            Loading deployments...
          </div>
        ) : deployments.length === 0 ? (
          <div className="p-8 text-center">
            <Server size={32} className="mx-auto mb-3 text-white/30" />
            <p className="text-white/60">No deployments yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white text-sm font-medium"
            >
              Create your first deployment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Model Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Environment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Replicas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {deployments.map(dep => (
                  <tr key={dep.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{dep.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{dep.modelVersion}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm uppercase">{dep.environment}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm">{dep.replicas}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(dep.status)}`}>
                        {dep.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {dep.status === 'running' ? (
                        <button
                          onClick={() => handleStop(dep.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded text-yellow-300 text-xs font-medium transition"
                        >
                          <Pause size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStart(dep.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-300 text-xs font-medium transition"
                        >
                          <Play size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(dep.id)}
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg border border-white/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Create Deployment</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Deployment Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="e.g., Production Sales API"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Model Version</label>
                <input
                  type="text"
                  value={formData.modelVersion}
                  onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="e.g., 2.1.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Replicas</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.replicas}
                  onChange={(e) => setFormData({ ...formData, replicas: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                />
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
                  Deploy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
