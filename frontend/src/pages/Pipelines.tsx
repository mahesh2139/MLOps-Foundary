import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Save, X, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb, SearchBar, SkeletonLoader, EmptyState, FilterChip, Pagination } from '../components/UIPatterns';

interface PipelineJob {
  id: string;
  jobId: string;
  jobName: string;
  jobType: string;
  order: number;
}

interface PipelineStep {
  id: string;
  type: 'job' | 'approval';
  jobId?: string;
  jobName?: string;
  order: number;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'running' | 'completed' | 'failed';
  steps: PipelineStep[];
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
}

interface AvailableJob {
  id: string;
  name: string;
  type: 'data-ingestion' | 'data-preparation' | 'monitoring' | 'deployment' | 'inference' | 'model-registry';
}

export default function Pipelines() {
  const { theme } = useTheme();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  // Pipeline builder modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<AvailableJob[]>([]);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('pipeline-builder-formData');
    return saved ? JSON.parse(saved) : { name: '', description: '' };
  });

  const { showNotification } = useNotification();

  // Restore pipeline builder modal state on mount
  useEffect(() => {
    loadPipelines();
    loadAvailableJobs();
    const builderState = localStorage.getItem('pipeline-builder-state');
    if (builderState) {
      try {
        const state = JSON.parse(builderState);
        if (state.showBuilder) setShowBuilder(state.showBuilder);
        if (state.editingId) setEditingId(state.editingId);
        if (state.selectedPipeline) setSelectedPipeline(state.selectedPipeline);
        if (state.pipelineSteps) setPipelineSteps(state.pipelineSteps);
        if (state.formData) setFormData(state.formData);
      } catch (e) {}
    }
  }, []);

  // Persist pipeline builder modal state
  useEffect(() => {
    const state = {
      showBuilder,
      editingId,
      selectedPipeline,
      pipelineSteps,
      formData,
    };
    localStorage.setItem('pipeline-builder-state', JSON.stringify(state));
  }, [showBuilder, editingId, selectedPipeline, pipelineSteps, formData]);

  // Persist formData separately for initialization
  useEffect(() => {
    localStorage.setItem('pipeline-builder-formData', JSON.stringify(formData));
  }, [formData]);

  const loadPipelines = async () => {
    setLoading(true);
    try {
      const res = await APIClient.apiGet('/pipelines');
      const data = Array.isArray(res) ? res : res.data || [];
      setPipelines(data);
    } catch (err) {
      console.warn('Failed to load pipelines:', err);
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableJobs = () => {
    // Scan localStorage for all created jobs
    const jobs: AvailableJob[] = [];
    const jobTypes = [
      { key: 'data-ingestion-jobs', type: 'data-ingestion' },
      { key: 'data-preparation-jobs', type: 'data-preparation' },
      { key: 'monitoring-jobs', type: 'monitoring' },
      { key: 'deployment-jobs', type: 'deployment' },
      { key: 'inference-jobs', type: 'inference' },
      { key: 'model-registry-models', type: 'model-registry' },
    ];

    jobTypes.forEach(({ key, type }) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const jobsData = JSON.parse(stored);
          if (Array.isArray(jobsData)) {
            jobsData.forEach((job: any) => {
              jobs.push({
                id: job.id,
                name: job.name || job.modelName || 'Unknown',
                type: type as AvailableJob['type'],
              });
            });
          }
        }
      } catch (e) {
        // ignore
      }
    });

    setAvailableJobs(jobs);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showNotification('Pipeline name is required', 'warning');
      return;
    }

    try {
      const newPipeline: Pipeline = {
        id: Date.now().toString(),
        ...formData,
        status: 'draft',
        steps: [],
        createdAt: new Date().toISOString(),
      };

      await APIClient.apiPost('/pipelines', newPipeline);
      setPipelines([...pipelines, newPipeline]);
      setShowModal(false);
      setFormData({ name: '', description: '' });
      showNotification('Pipeline created', 'success');
    } catch (err) {
      // Fallback to local state
      const newPipeline: Pipeline = {
        id: Date.now().toString(),
        ...formData,
        status: 'draft',
        steps: [],
        createdAt: new Date().toISOString(),
      };
      setPipelines([...pipelines, newPipeline]);
      setShowModal(false);
      setFormData({ name: '', description: '' });
      showNotification('Pipeline created locally', 'info');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pipeline?')) return;

    try {
      await APIClient.apiDelete(`/pipelines/${id}`);
      setPipelines(pipelines.filter(p => p.id !== id));
      showNotification('Pipeline deleted', 'success');
    } catch (err) {
      setPipelines(pipelines.filter(p => p.id !== id));
      showNotification('Pipeline deleted locally', 'info');
    }
  };

  const startPipelineBuilder = (pipeline?: Pipeline) => {
    if (pipeline) {
      setSelectedPipeline(pipeline);
      setPipelineSteps(pipeline.steps);
      setEditingId(pipeline.id);
      setFormData({ name: pipeline.name, description: pipeline.description });
    } else {
      setSelectedPipeline(null);
      setPipelineSteps([]);
      setEditingId(null);
      setFormData({ name: '', description: '' });
    }
    setShowBuilder(true);
  };

  const addJobToStep = (job: AvailableJob) => {
    const newStep: PipelineStep = {
      id: Date.now().toString(),
      type: 'job',
      jobId: job.id,
      jobName: job.name,
      order: pipelineSteps.length,
    };
    setPipelineSteps([...pipelineSteps, newStep]);
    setShowJobPicker(false);
    showNotification(`Added ${job.name}`, 'success');
  };

  const addApprovalStep = () => {
    const newStep: PipelineStep = {
      id: `approval-${Date.now()}`,
      type: 'approval',
      order: pipelineSteps.length,
    };
    setPipelineSteps([...pipelineSteps, newStep]);
    showNotification('Approval step added', 'success');
  };

  const removeStep = (stepId: string) => {
    const updated = pipelineSteps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, order: i }));
    setPipelineSteps(updated);
  };

  const savePipeline = async () => {
    if (!selectedPipeline && !formData.name.trim()) {
      showNotification('Pipeline name is required', 'warning');
      return;
    }

    const pipelineData: Pipeline = {
      id: editingId || Date.now().toString(),
      name: selectedPipeline?.name || formData.name,
      description: selectedPipeline?.description || formData.description,
      status: 'active',
      steps: pipelineSteps,
      createdAt: selectedPipeline?.createdAt || new Date().toISOString(),
    };

    try {
      if (editingId) {
        await APIClient.apiPut(`/pipelines/${editingId}`, pipelineData);
        setPipelines(pipelines.map(p => (p.id === editingId ? pipelineData : p)) as Pipeline[]);
        showNotification('Pipeline updated', 'success');
      } else {
        await APIClient.apiPost('/pipelines', pipelineData);
        setPipelines([...pipelines, pipelineData] as Pipeline[]);
        showNotification('Pipeline created', 'success');
      }
      setShowBuilder(false);
      setSelectedPipeline(null);
      setPipelineSteps([]);
      setEditingId(null);
      setFormData({ name: '', description: '' });
    } catch (err) {
      // Fallback
      if (editingId) {
        setPipelines(pipelines.map(p => (p.id === editingId ? pipelineData : p)));
      } else {
        setPipelines([...pipelines, pipelineData]);
      }
      setShowBuilder(false);
      setSelectedPipeline(null);
      setPipelineSteps([]);
      setEditingId(null);
      setFormData({ name: '', description: '' });
      showNotification('Pipeline saved locally', 'info');
    }
  };

  const runPipeline = async (pipelineId: string) => {
    try {
      const pipeline = pipelines.find(p => p.id === pipelineId);
      if (pipeline) {
        // Trigger any approval steps
        pipeline.steps.forEach(step => {
          if (step.type === 'approval') {
            const approval = {
              id: `approval-${Date.now()}`,
              pipelineId,
              status: 'pending',
              createdAt: new Date().toISOString(),
            };
            let approvals = JSON.parse(localStorage.getItem('approval-requests') || '[]');
            approvals.push(approval);
            localStorage.setItem('approval-requests', JSON.stringify(approvals));
          }
        });

        const updated: Pipeline = { ...pipeline, status: 'running', lastRun: new Date().toISOString() };
        await APIClient.apiPut(`/pipelines/${pipelineId}`, updated);
        setPipelines(pipelines.map(p => (p.id === pipelineId ? updated : p)) as Pipeline[]);
        showNotification('Pipeline execution started', 'success');
      }
    } catch (err) {
      showNotification('Failed to run pipeline', 'error');
    }
  };

  const filtered = pipelines.filter(p =>
    searchQuery === '' ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedPipelines = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: 'Pipelines' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Pipelines</h1>
          <p className="text-white/60">Create and manage ML workflows</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium"
        >
          <Plus size={20} />
          New Pipeline
        </button>
      </div>

      {loading ? (
        <SkeletonLoader count={6} variant="card" />
      ) : (
        <>
          {!loading && pipelines.length > 0 && (
            <SearchBar
              placeholder="Search pipelines..."
              onSearch={setSearchQuery}
            />
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon={<AlertCircle size={48} />}
              title="No pipelines found"
              description="Create your first pipeline to orchestrate your ML workflow"
              action={{
                label: 'Create Pipeline',
                onClick: () => setShowModal(true),
              }}
            />
          ) : (
            <>
              <div className="grid gap-6">
                {paginatedPipelines.map((pipeline) => (
                  <div
                    key={pipeline.id}
                    className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-white">{pipeline.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            pipeline.status === 'active' ? 'bg-green-600/20 text-green-400' :
                            pipeline.status === 'running' ? 'bg-blue-600/20 text-blue-400' :
                            pipeline.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                            pipeline.status === 'failed' ? 'bg-red-600/20 text-red-400' :
                            'bg-gray-600/20 text-gray-400'
                          }`}>
                            {pipeline.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{pipeline.description || 'No description'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startPipelineBuilder(pipeline)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition text-blue-400 hover:text-blue-300"
                          title="Edit pipeline"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => runPipeline(pipeline.id)}
                          className="p-2 hover:bg-green-600/20 rounded-lg transition text-green-400 hover:text-green-300"
                          title="Run pipeline"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(pipeline.id)}
                          className="p-2 hover:bg-red-600/20 rounded-lg transition text-red-400 hover:text-red-300"
                          title="Delete pipeline"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Pipeline Steps Preview */}
                    {pipeline.steps.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-2 flex-wrap">
                          {pipeline.steps.map((step, idx) => (
                            <React.Fragment key={step.id}>
                              {idx > 0 && <ArrowRight size={16} className="text-gray-500" />}
                              <div className={`px-3 py-1 rounded text-xs font-medium ${
                                step.type === 'approval'
                                  ? 'bg-yellow-600/20 text-yellow-400'
                                  : 'bg-blue-600/20 text-blue-400'
                              }`}>
                                {step.type === 'approval' ? '✓ Approval' : step.jobName}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="text-white">{new Date(pipeline.createdAt).toLocaleDateString()}</p>
                      </div>
                      {pipeline.lastRun && (
                        <div>
                          <p className="text-gray-500">Last Run</p>
                          <p className="text-white">{new Date(pipeline.lastRun).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filtered.length}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Create Pipeline Modal */}
      {showModal && !showBuilder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 w-full max-w-md border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Pipeline</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Pipeline Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="e.g., Data Processing Pipeline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-400 focus:outline-none transition-colors resize-none"
                  placeholder="Describe the pipeline"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (formData.name.trim()) {
                    setShowModal(false);
                    startPipelineBuilder();
                  }
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all font-medium"
              >
                Next: Configure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 w-full max-w-2xl border border-slate-700 shadow-xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Pipeline Workflow</h2>
              <button onClick={() => setShowBuilder(false)} className="hover:opacity-70">
                <X size={24} />
              </button>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-3 mb-6">
              {pipelineSteps.length === 0 ? (
                <p className="text-gray-400 text-sm">No steps added yet</p>
              ) : (
                pipelineSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      {step.type === 'approval' ? (
                        <p className="text-yellow-400 font-medium">✓ Manual Approval</p>
                      ) : (
                        <p className="text-blue-400 font-medium">{step.jobName}</p>
                      )}
                      <p className="text-xs text-gray-400">{step.type === 'approval' ? 'Awaits manual approval' : 'Executes job'}</p>
                    </div>
                    <button
                      onClick={() => removeStep(step.id)}
                      className="p-1 hover:bg-red-600/20 rounded text-red-400 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Steps Buttons */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setShowJobPicker(!showJobPicker)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition"
              >
                + Add Job
              </button>
              <button
                onClick={addApprovalStep}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm transition"
              >
                + Add Approval
              </button>
            </div>

            {/* Job Picker */}
            {showJobPicker && (
              <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600 max-h-48 overflow-y-auto">
                <p className="text-sm text-white mb-3 font-medium">Available Jobs:</p>
                {availableJobs.length === 0 ? (
                  <p className="text-xs text-gray-400">No jobs created yet</p>
                ) : (
                  <div className="space-y-2">
                    {availableJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => addJobToStep(job)}
                        className="w-full text-left px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm transition"
                      >
                        <div className="font-medium text-white">{job.name}</div>
                        <div className="text-xs text-gray-400">{job.type}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBuilder(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={savePipeline}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg transition-all font-medium flex items-center justify-center gap-2"
              >
                <Save size={16} /> Save Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
