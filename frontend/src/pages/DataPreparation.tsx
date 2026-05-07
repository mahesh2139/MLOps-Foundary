import React, { useState } from 'react';
import { Plus, Trash2, Play, AlertCircle, Loader, Check, Code as CodeIcon, Database } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

export default function DataPreparation() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    ingestionJobId: '',
  });
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  const selectedJob = selectedJobId ? global.getPreparationJob(selectedJobId) : null;

  const handleCreateJob = () => {
    if (!formData.name.trim() || !formData.projectId || !formData.ingestionJobId) {
      showNotification('Job name, project, and ingestion job are required', 'warning');
      return;
    }

    const newJob = global.createPreparationJob({
      name: formData.name,
      projectId: formData.projectId,
      ingestionJobId: formData.ingestionJobId,
      codeId: selectedCodeId || undefined,
      status: 'created',
    });

    showNotification('Data preparation job created', 'success');
    setShowJobModal(false);
    setFormData({ name: '', projectId: '', ingestionJobId: '' });
    setSelectedCodeId(null);
  };

  const handleRunJob = (jobId: string) => {
    global.updatePreparationJob(jobId, { status: 'running' });
    
    setTimeout(() => {
      global.updatePreparationJob(jobId, {
        status: 'completed',
        outputPath: `/data/prepared_${Date.now()}.csv`,
        outputShape: { rows: 4900, columns: 12 },
        outputColumns: ['age', 'income', 'credit_score', 'employment_years', 'savings', 'debt', 'loan_status'],
        lastRun: new Date().toISOString(),
      });
      showNotification('Data preparation completed', 'success');
    }, 2000);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Delete this job?')) {
      global.deletePreparationJob(jobId);
      if (selectedJobId === jobId) setSelectedJobId(null);
      showNotification('Job deleted', 'success');
    }
  };

  const getProjectCodes = (projectId: string) => {
    const project = global.getProject(projectId);
    return project?.code || [];
  };

  const getCompletedIngestionJobs = (projectId: string) => {
    return global.ingestionJobs.filter(
      j => j.projectId === projectId && j.status === 'completed'
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500/20 text-green-400' :
           status === 'running' ? 'bg-blue-500/20 text-blue-400' :
           status === 'failed' ? 'bg-red-500/20 text-red-400' :
           'bg-slate-500/20 text-slate-400';
  };

  const getSourceIngestionJob = (jobId: string) => {
    return global.getIngestionJob(jobId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Data Preparation</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Transform and clean ingested data</p>
        </div>
        <button
          onClick={() => {
            setShowJobModal(true);
            setFormData({ name: '', projectId: '', ingestionJobId: '' });
            setSelectedCodeId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Preparation Job
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-4 h-[600px]">
        {/* Jobs List */}
        <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'} border rounded-lg overflow-hidden flex flex-col`}>
          <div className={`p-4 border-b ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'} font-semibold`}>
            Jobs
          </div>
          <div className={`flex-1 overflow-y-auto space-y-2 p-3`}>
            {global.preparationJobs.length === 0 ? (
              <div className={`text-center py-8 ${themeClasses.textSecondary(theme)}`}>
                No jobs created yet
              </div>
            ) : (
              global.preparationJobs.map(job => (
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
                      <p className={`text-xs ${themeClasses.textSecondary(theme)} truncate`}>{global.getProject(job.projectId)?.name || 'Unknown'}</p>
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
                      <Database size={18} />
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
                {/* Source Data */}
                <div>
                  <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Source Data (Ingestion Job)</h4>
                  {(() => {
                    const sourceJob = getSourceIngestionJob(selectedJob.ingestionJobId);
                    return sourceJob ? (
                      <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3 space-y-2`}>
                        <div>
                          <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>Source Job</p>
                          <p className={`${themeClasses.textPrimary(theme)} font-semibold`}>{sourceJob.name}</p>
                        </div>
                        {sourceJob.outputShape && (
                          <div>
                            <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>Data Shape</p>
                            <p className={`${themeClasses.textPrimary(theme)}`}>{sourceJob.outputShape.rows.toLocaleString()} rows × {sourceJob.outputShape.columns} columns</p>
                          </div>
                        )}
                        {sourceJob.outputColumns && (
                          <div>
                            <p className={`text-xs ${themeClasses.textSecondary(theme)} mb-2`}>Available Columns</p>
                            <div className="flex flex-wrap gap-1">
                              {sourceJob.outputColumns.slice(0, 5).map((col, i) => (
                                <span key={i} className={`text-xs px-2 py-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'} rounded`}>
                                  {col}
                                </span>
                              ))}
                              {sourceJob.outputColumns.length > 5 && (
                                <span className={`text-xs px-2 py-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'} rounded`}>
                                  +{sourceJob.outputColumns.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className={`${themeClasses.textSecondary(theme)} text-sm`}>Source job not found</p>
                    );
                  })()}
                </div>

                {/* Processing Configuration */}
                <div>
                  <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Processing Configuration</h4>
                  <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3 space-y-2 text-sm`}>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary(theme)}>Handle Missing Values:</span>
                      <span className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Mean Imputation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary(theme)}>Feature Scaling:</span>
                      <span className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Standardization</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary(theme)}>Encoding:</span>
                      <span className={`font-semibold ${themeClasses.textPrimary(theme)}`}>One-Hot</span>
                    </div>
                  </div>
                </div>

                {/* Output Data */}
                {selectedJob.status === 'completed' && selectedJob.outputShape && (
                  <div>
                    <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Output Data</h4>
                    <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3 space-y-2`}>
                      <div>
                        <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>Shape</p>
                        <p className={`${themeClasses.textPrimary(theme)} font-semibold`}>{selectedJob.outputShape.rows.toLocaleString()} rows × {selectedJob.outputShape.columns} columns</p>
                      </div>
                      {selectedJob.outputColumns && (
                        <div>
                          <p className={`text-xs ${themeClasses.textSecondary(theme)} mb-2`}>Columns</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedJob.outputColumns.map((col, i) => (
                              <span key={i} className={`text-xs px-2 py-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'} rounded`}>
                                {col}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>Path</p>
                        <p className={`${themeClasses.textPrimary(theme)} text-xs font-mono`}>{selectedJob.outputPath}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Code Information */}
                {selectedJob.codeId && (
                  <div>
                    <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Processing Code</h4>
                    <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3`}>
                      {(() => {
                        const project = global.getProject(selectedJob.projectId);
                        const code = project?.code.find(c => c.id === selectedJob.codeId);
                        return code ? (
                          <div>
                            <p className={`${themeClasses.textPrimary(theme)} font-semibold text-sm`}>{code.name}</p>
                            <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>{code.language}</p>
                          </div>
                        ) : (
                          <p className={`${themeClasses.textSecondary(theme)} text-sm`}>Code not found</p>
                        );
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
                    {selectedJob.status === 'running' ? 'Running...' : selectedJob.status === 'completed' ? 'Rerun Job' : 'Run Job'}
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
              <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>Create Data Preparation Job</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Name */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Job Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Clean and Scale Features"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => {
                    setFormData({ ...formData, projectId: e.target.value, ingestionJobId: '' });
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

              {/* Ingestion Job Selection */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Source Ingestion Job *</label>
                  <select
                    value={formData.ingestionJobId}
                    onChange={(e) => setFormData({ ...formData, ingestionJobId: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">Select a completed ingestion job...</option>
                    {getCompletedIngestionJobs(formData.projectId).length === 0 ? (
                      <option disabled>No completed ingestion jobs</option>
                    ) : (
                      getCompletedIngestionJobs(formData.projectId).map(job => (
                        <option key={job.id} value={job.id}>{job.name}</option>
                      ))
                    )}
                  </select>
                  {getCompletedIngestionJobs(formData.projectId).length === 0 && (
                    <p className={`text-xs ${themeClasses.textSecondary(theme)} mt-2`}>
                      Create and run an ingestion job first.
                    </p>
                  )}
                </div>
              )}

              {/* Code Selection */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Processing Code (Optional)</label>
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
                  {getProjectCodes(formData.projectId).length === 0 && (
                    <p className={`text-xs ${themeClasses.textSecondary(theme)} mt-2`}>
                      No code files found. Create files in Projects workspace first.
                    </p>
                  )}
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
                  disabled={!formData.name || !formData.projectId || !formData.ingestionJobId}
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
