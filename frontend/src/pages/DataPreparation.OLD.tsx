import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, AlertCircle, Loader, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';

interface DataPreparationJob {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'running';
  transformationType: 'cleaning' | 'normalization' | 'encoding' | 'sampling';
  lastRun?: string;
  createdAt?: string;
}

export default function DataPreparation() {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState<DataPreparationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<DataPreparationJob, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    status: 'active',
    transformationType: 'cleaning',
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await APIClient.apiGet('/data-preparation');
      setJobs(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.warn('Failed to load data preparation jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showNotification('Job name is required', 'warning');
      return;
    }

    try {
      await APIClient.apiPost('/data-preparation', formData);
      showNotification('Data preparation job created successfully', 'success');
      setShowModal(false);
      setFormData({ name: '', description: '', status: 'active', transformationType: 'cleaning' });
      await loadJobs();
    } catch (err) {
      const newJob: DataPreparationJob = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setJobs([...jobs, newJob]);
      setShowModal(false);
      setFormData({ name: '', description: '', status: 'active', transformationType: 'cleaning' });
      showNotification('Data preparation job created locally', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await APIClient.apiDelete(`/data-preparation/${id}`);
      showNotification('Data preparation job deleted', 'success');
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  const handleRun = async (id: string) => {
    try {
      await APIClient.apiPost(`/data-preparation/${id}/run`, {});
      showNotification('Data preparation job started', 'success');
      setJobs(jobs.map(j => j.id === id ? { ...j, status: 'running' } : j));
    } catch (err) {
      showNotification('Failed to start job', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Data Preparation</h1>
          <p className="text-white/60 text-sm mt-1">Manage data transformation and preparation tasks</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', status: 'active', transformationType: 'cleaning' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white font-medium"
        >
          <Plus size={16} />
          New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Total Jobs</p>
          <p className="text-2xl font-bold text-white">{jobs.length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Active</p>
          <p className="text-2xl font-bold text-green-400">{jobs.filter(j => j.status === 'active').length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Running</p>
          <p className="text-2xl font-bold text-yellow-400">{jobs.filter(j => j.status === 'running').length}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-xs font-medium mb-1">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">{jobs.filter(j => j.status === 'inactive').length}</p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-white/60">
            <Loader size={20} className="animate-spin" />
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center">
            <Zap size={32} className="mx-auto mb-3 text-white/30" />
            <p className="text-white/60">No data preparation jobs yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white text-sm font-medium"
            >
              Create your first job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Last Run</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{job.name}</p>
                        <p className="text-white/50 text-xs">{job.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70 text-sm capitalize">{job.transformationType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        job.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        job.status === 'running' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/50 text-sm">{job.lastRun ? new Date(job.lastRun).toLocaleDateString() : 'Never'}</p>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleRun(job.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-300 text-xs font-medium transition"
                        title="Run job"
                      >
                        <Play size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 text-xs font-medium transition"
                        title="Delete job"
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg border border-white/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Create Data Preparation Job</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Job Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="e.g., Feature Engineering"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 resize-none h-20"
                  placeholder="Job description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Transformation Type</label>
                <select
                  value={formData.transformationType}
                  onChange={(e) => setFormData({ ...formData, transformationType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="cleaning">Data Cleaning</option>
                  <option value="normalization">Normalization</option>
                  <option value="encoding">Encoding</option>
                  <option value="sampling">Sampling</option>
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
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
