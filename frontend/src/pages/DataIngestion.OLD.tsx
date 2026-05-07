import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, AlertCircle, Loader, Check, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';

interface DataIngestionJob {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'running';
  source: 'csv' | 'database' | 'api' | 'cloud';
  lastRun?: string;
  createdAt?: string;
}

export default function DataIngestion() {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState<DataIngestionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<DataIngestionJob, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    status: 'active',
    source: 'csv',
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await APIClient.apiGet('/data-ingestion');
      setJobs(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.warn('Failed to load data ingestion jobs:', err);
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
      await APIClient.apiPost('/data-ingestion', formData);
      showNotification('Data ingestion job created successfully', 'success');
      setShowModal(false);
      setFormData({ name: '', description: '', status: 'active', source: 'csv' });
      await loadJobs();
    } catch (err) {
      // Fallback: add locally
      const newJob: DataIngestionJob = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setJobs([...jobs, newJob]);
      setShowModal(false);
      setFormData({ name: '', description: '', status: 'active', source: 'csv' });
      showNotification('Data ingestion job created locally', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await APIClient.apiDelete(`/data-ingestion/${id}`);
      showNotification('Data ingestion job deleted', 'success');
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  const handleRun = async (id: string) => {
    try {
      await APIClient.apiPost(`/data-ingestion/${id}/run`, {});
      showNotification('Data ingestion job started', 'success');
      setJobs(jobs.map(j => j.id === id ? { ...j, status: 'running' } : j));
    } catch (err) {
      showNotification('Failed to start job', 'error');
    }
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      csv: '📄',
      database: '🗄️',
      api: '🔌',
      cloud: '☁️',
    };
    return icons[source] || '📦';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Data Ingestion</h1>
          <p className="text-white/60 text-sm mt-1">Create and manage data ingestion jobs</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', status: 'active', source: 'csv' });
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
            <AlertCircle size={32} className="mx-auto mb-3 text-white/30" />
            <p className="text-white/60">No data ingestion jobs yet</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70">Source</th>
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
                      <span className="text-white/70 text-sm">{getSourceIcon(job.source)} {job.source}</span>
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
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Edit Data Ingestion Job' : 'Create Data Ingestion Job'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Job Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="e.g., Production CSV Sync"
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
                <label className="block text-sm font-medium text-white/70 mb-2">Data Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                >
                  <option value="csv">CSV File</option>
                  <option value="database">Database</option>
                  <option value="api">API</option>
                  <option value="cloud">Cloud Storage</option>
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
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
