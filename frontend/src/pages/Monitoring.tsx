import React, { useState } from 'react';
import { Plus, Trash2, Play, AlertCircle, Loader, Check, Activity, Database, Clock, BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

export default function ModelMonitoring() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    modelId: '',
    inputDatasetId: '',
    frequency: 'daily' as 'on-demand' | 'hourly' | 'daily' | 'weekly',
  });
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  const selectedJob = selectedJobId ? global.getMonitoringJob(selectedJobId) : null;

  const handleCreateJob = () => {
    if (!formData.name.trim() || !formData.projectId || !formData.modelId || !formData.inputDatasetId) {
      showNotification('All fields are required', 'warning');
      return;
    }

    const newJob = global.createMonitoringJob({
      name: formData.name,
      projectId: formData.projectId,
      modelId: formData.modelId,
      codeId: selectedCodeId || undefined,
      inputDatasetId: formData.inputDatasetId,
      metrics: {
        dataDrift: Math.random() * 0.3,
        modelDrift: Math.random() * 0.2,
        performanceDegradation: Math.random() * 0.15,
        lastChecked: new Date().toISOString(),
      },
      status: 'created',
    });

    showNotification('Monitoring job created', 'success');
    setShowJobModal(false);
    setFormData({ name: '', projectId: '', modelId: '', inputDatasetId: '', frequency: 'daily' });
    setSelectedCodeId(null);
  };

  const handleRunJob = (jobId: string) => {
    global.updateMonitoringJob(jobId, { status: 'running' });
    
    setTimeout(() => {
      global.updateMonitoringJob(jobId, {
        status: 'completed',
        metrics: {
          dataDrift: Math.random() * 0.3,
          modelDrift: Math.random() * 0.2,
          performanceDegradation: Math.random() * 0.15,
          lastChecked: new Date().toISOString(),
        },
        lastRun: new Date().toISOString(),
      });
      showNotification('Monitoring check completed', 'success');
    }, 2000);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Delete this job?')) {
      global.deleteMonitoringJob(jobId);
      if (selectedJobId === jobId) setSelectedJobId(null);
      showNotification('Job deleted', 'success');
    }
  };

  const getProjectCodes = (projectId: string) => {
    const project = global.getProject(projectId);
    return project?.code || [];
  };

  const getAvailableModels = (projectId: string) => {
    return global.registryModels.filter(m => m.projectId === projectId && m.stage === 'production');
  };

  const getAvailableDatasets = (projectId: string) => {
    return global.preparationJobs.filter(j => j.projectId === projectId && j.status === 'completed');
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500/20 text-green-400' :
           status === 'running' ? 'bg-blue-500/20 text-blue-400' :
           status === 'failed' ? 'bg-red-500/20 text-red-400' :
           'bg-slate-500/20 text-slate-400';
  };

  const getDriftSeverity = (value: number) => {
    if (value > 0.25) return { color: 'text-red-400', label: 'High' };
    if (value > 0.15) return { color: 'text-yellow-400', label: 'Medium' };
    return { color: 'text-green-400', label: 'Low' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Model Monitoring</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Monitor model performance and data drift</p>
        </div>
        <button
          onClick={() => {
            setShowJobModal(true);
            setFormData({ name: '', projectId: '', modelId: '', inputDatasetId: '', frequency: 'daily' });
            setSelectedCodeId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Monitoring Job
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-4 h-[600px]">
        {/* Jobs List */}
        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-lg overflow-hidden flex flex-col`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'} font-semibold`}>
            Monitoring Jobs
          </div>
          <div className={`flex-1 overflow-y-auto space-y-2 p-3`}>
            {global.monitoringJobs.length === 0 ? (
              <div className={`text-center py-8 ${themeClasses.textSecondary(theme)}`}>
                No jobs created yet
              </div>
            ) : (
              global.monitoringJobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedJobId === job.id
                      ? `${theme === 'dark' ? 'bg-blue-900/50 border-blue-500' : 'bg-blue-100 border-blue-500'} border-2`
                      : `${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} border border-transparent`
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`p-2 rounded ${getStatusColor(job.status)}`}>
                      {job.status === 'running' ? (
                        <Loader size={14} className="animate-spin" />
                      ) : job.status === 'completed' ? (
                        <Check size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${themeClasses.textPrimary(theme)}`}>{job.name}</p>
                      <p className={`text-xs ${themeClasses.textSecondary(theme)} truncate`}>{global.getProject(job.projectId)?.name}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className={`col-span-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-lg overflow-hidden flex flex-col`}>
          {selectedJob ? (
            <>
              <div className={`p-4 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${getStatusColor(selectedJob.status)}`}>
                      <Activity size={18} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${themeClasses.textPrimary(theme)}`}>{selectedJob.name}</h3>
                      <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>Project: {global.getProject(selectedJob.projectId)?.name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto p-4 space-y-6`}>
                {/* Model Information */}
                <div>
                  <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Monitored Model</h4>
                  {(() => {
                    const model = global.getRegistryModel(selectedJob.modelId);
                    return model ? (
                      <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3 space-y-2`}>
                        <div>
                          <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>Model Name</p>
                          <p className={`${themeClasses.textPrimary(theme)} font-semibold`}>{model.name}</p>
                        </div>
                        <div>
                          <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>Version</p>
                          <p className={`${themeClasses.textPrimary(theme)}`}>{model.version}</p>
                        </div>
                      </div>
                    ) : (
                      <p className={`${themeClasses.textSecondary(theme)} text-sm`}>Model not found</p>
                    );
                  })()}
                </div>

                {/* Monitoring Metrics */}
                {selectedJob.metrics && selectedJob.status === 'completed' && (
                  <div>
                    <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Latest Metrics</h4>
                    <div className="space-y-3">
                      {/* Data Drift */}
                      <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>Data Drift</p>
                          <span className={`text-sm font-semibold ${getDriftSeverity(selectedJob.metrics.dataDrift || 0).color}`}>
                            {getDriftSeverity(selectedJob.metrics.dataDrift || 0).label}
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'}`}>
                          <div
                            className={`h-full rounded-full transition-all ${
                              (selectedJob.metrics.dataDrift || 0) > 0.25
                                ? 'bg-red-500'
                                : (selectedJob.metrics.dataDrift || 0) > 0.15
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((selectedJob.metrics.dataDrift || 0) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs ${themeClasses.textSecondary(theme)} mt-1`}>{((selectedJob.metrics.dataDrift || 0) * 100).toFixed(2)}%</p>
                      </div>

                      {/* Model Drift */}
                      <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>Model Drift</p>
                          <span className={`text-sm font-semibold ${getDriftSeverity(selectedJob.metrics.modelDrift || 0).color}`}>
                            {getDriftSeverity(selectedJob.metrics.modelDrift || 0).label}
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'}`}>
                          <div
                            className={`h-full rounded-full transition-all ${
                              (selectedJob.metrics.modelDrift || 0) > 0.25
                                ? 'bg-red-500'
                                : (selectedJob.metrics.modelDrift || 0) > 0.15
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((selectedJob.metrics.modelDrift || 0) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs ${themeClasses.textSecondary(theme)} mt-1`}>{((selectedJob.metrics.modelDrift || 0) * 100).toFixed(2)}%</p>
                      </div>

                      {/* Performance Degradation */}
                      <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>Performance Degradation</p>
                          <span className={`text-sm font-semibold ${getDriftSeverity(selectedJob.metrics.performanceDegradation || 0).color}`}>
                            {getDriftSeverity(selectedJob.metrics.performanceDegradation || 0).label}
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'}`}>
                          <div
                            className={`h-full rounded-full transition-all ${
                              (selectedJob.metrics.performanceDegradation || 0) > 0.25
                                ? 'bg-red-500'
                                : (selectedJob.metrics.performanceDegradation || 0) > 0.15
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((selectedJob.metrics.performanceDegradation || 0) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs ${themeClasses.textSecondary(theme)} mt-1`}>{((selectedJob.metrics.performanceDegradation || 0) * 100).toFixed(2)}%</p>
                      </div>

                      {selectedJob.metrics.lastChecked && (
                        <div className={`text-xs ${themeClasses.textSecondary(theme)}`}>
                          Last checked: {new Date(selectedJob.metrics.lastChecked).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Input Dataset */}
                <div>
                  <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Monitoring Dataset</h4>
                  {(() => {
                    const dataset = global.getPreparationJob(selectedJob.inputDatasetId || '');
                    return dataset ? (
                      <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3 space-y-2`}>
                        <div>
                          <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>Dataset</p>
                          <p className={`${themeClasses.textPrimary(theme)} font-semibold`}>{dataset.name}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Code Information */}
                {selectedJob.codeId && (
                  <div>
                    <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Monitoring Code</h4>
                    <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3`}>
                      {(() => {
                        const project = global.getProject(selectedJob.projectId);
                        const code = project?.code.find(c => c.id === selectedJob.codeId);
                        return code ? (
                          <div>
                            <p className={`${themeClasses.textPrimary(theme)} font-semibold text-sm`}>{code.name}</p>
                            <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>{code.language}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleRunJob(selectedJob.id)}
                    disabled={selectedJob.status === 'running'}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg text-sm transition"
                  >
                    <Play size={14} />
                    {selectedJob.status === 'running' ? 'Running...' : 'Run Check'}
                  </button>
                  <button
                    onClick={() => handleDeleteJob(selectedJob.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={`flex-1 flex items-center justify-center ${themeClasses.textSecondary(theme)}`}>
              Select a job to view details
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'} sticky top-0`}>
              <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>Create Monitoring Job</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Name */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Job Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Production Model Health Check"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                />
              </div>

              {/* Project */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => {
                    setFormData({ ...formData, projectId: e.target.value, modelId: '', inputDatasetId: '' });
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

              {/* Model Selection */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Production Model *</label>
                  <select
                    value={formData.modelId}
                    onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">Select a model...</option>
                    {getAvailableModels(formData.projectId).length === 0 ? (
                      <option disabled>No production models available</option>
                    ) : (
                      getAvailableModels(formData.projectId).map(model => (
                        <option key={model.id} value={model.id}>{model.name} (v{model.version})</option>
                      ))
                    )}
                  </select>
                  {getAvailableModels(formData.projectId).length === 0 && (
                    <p className={`text-xs ${themeClasses.textSecondary(theme)} mt-2`}>
                      No production models. Promote a model to production first.
                    </p>
                  )}
                </div>
              )}

              {/* Monitoring Dataset */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Monitoring Dataset *</label>
                  <select
                    value={formData.inputDatasetId}
                    onChange={(e) => setFormData({ ...formData, inputDatasetId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">Select a prepared dataset...</option>
                    {getAvailableDatasets(formData.projectId).length === 0 ? (
                      <option disabled>No prepared datasets available</option>
                    ) : (
                      getAvailableDatasets(formData.projectId).map(dataset => (
                        <option key={dataset.id} value={dataset.id}>{dataset.name}</option>
                      ))
                    )}
                  </select>
                  {getAvailableDatasets(formData.projectId).length === 0 && (
                    <p className={`text-xs ${themeClasses.textSecondary(theme)} mt-2`}>
                      No prepared datasets. Complete a data preparation job first.
                    </p>
                  )}
                </div>
              )}

              {/* Monitoring Frequency */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Monitoring Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                >
                  <option value="on-demand">On-Demand</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {/* Code Selection */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Monitoring Code (Optional)</label>
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
                  onClick={() => setShowJobModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} transition`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  disabled={!formData.name || !formData.projectId || !formData.modelId || !formData.inputDatasetId}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition"
                >
                  Create Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
