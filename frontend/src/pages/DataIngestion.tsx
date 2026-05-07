import React, { useState } from 'react';
import { Plus, Trash2, Play, Upload, Database, FileUp, Cloud, Network, Folder, Download, Check, AlertCircle, Loader, Code as CodeIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb } from '../components/UIPatterns';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

export default function DataIngestion() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    dataSource: 'csv' as 'csv' | 'database' | 'api' | 'cloud' | 'desktop',
    sourceConfig: {},
  });
  const [selectedProjectCodeId, setSelectedProjectCodeId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{name: string; path: string; size: number; type: string} | null>(null);

  const selectedJob = selectedJobId ? global.getIngestionJob(selectedJobId) : null;
  const filteredJobs = formData.projectId 
    ? global.ingestionJobs.filter(j => j.projectId === formData.projectId)
    : global.ingestionJobs;

  const handleCreateJob = () => {
    if (!formData.name.trim() || !formData.projectId) {
      showNotification('Job name and project are required', 'warning');
      return;
    }

    const newJob = global.createIngestionJob({
      name: formData.name,
      projectId: formData.projectId,
      dataSource: formData.dataSource,
      codeId: selectedProjectCodeId || undefined,
      sourceConfig: formData.sourceConfig,
      uploadedFile: uploadedFile || undefined,
      status: 'created',
    });

    showNotification('Data ingestion job created', 'success');
    setShowJobModal(false);
    setFormData({ name: '', projectId: '', dataSource: 'csv', sourceConfig: {} });
    setSelectedProjectCodeId(null);
    setUploadedFile(null);
  };

  const handleRunJob = (jobId: string) => {
    global.updateIngestionJob(jobId, { status: 'running' });
    
    // Simulate job execution
    setTimeout(() => {
      global.updateIngestionJob(jobId, {
        status: 'completed',
        outputPath: `/data/ingested_${Date.now()}.csv`,
        outputShape: { rows: 5000, columns: 15 },
        outputColumns: ['id', 'age', 'income', 'credit_score', 'employment_years', 'savings', 'debt', 'loan_status'],
        lastRun: new Date().toISOString(),
      });
      showNotification('Data ingestion completed', 'success');
    }, 2000);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Delete this job?')) {
      global.deleteIngestionJob(jobId);
      if (selectedJobId === jobId) setSelectedJobId(null);
      showNotification('Job deleted', 'success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        path: `/uploads/${file.name}`,
        size: file.size,
        type: file.type,
      });
      showNotification(`File uploaded: ${file.name}`, 'success');
    }
  };

  const sourceOptions = [
    { value: 'csv' as const, label: 'CSV File', icon: FileUp },
    { value: 'database' as const, label: 'Database', icon: Database },
    { value: 'api' as const, label: 'API', icon: Network },
    { value: 'cloud' as const, label: 'Cloud Storage', icon: Cloud },
    { value: 'desktop' as const, label: 'Desktop Upload', icon: Folder },
  ];

  const getProjectCodes = (projectId: string) => {
    const project = global.getProject(projectId);
    return project?.code || [];
  };

  const getSourceIcon = (source: string) => {
    const option = sourceOptions.find(o => o.value === source);
    return option?.icon || FileUp;
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500/20 text-green-400' :
           status === 'running' ? 'bg-blue-500/20 text-blue-400' :
           status === 'failed' ? 'bg-red-500/20 text-red-400' :
           'bg-slate-500/20 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Data Ingestion</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Create and manage data ingestion jobs</p>
        </div>
        <button
          onClick={() => {
            setShowJobModal(true);
            setFormData({ name: '', projectId: '', dataSource: 'csv', sourceConfig: {} });
            setSelectedProjectCodeId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Ingestion Job
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
            {global.ingestionJobs.length === 0 ? (
              <div className={`text-center py-8 ${themeClasses.textSecondary(theme)}`}>
                No jobs created yet
              </div>
            ) : (
              global.ingestionJobs.map(job => (
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
                      {React.createElement(getSourceIcon(selectedJob.dataSource), { size: 18 })}
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
                {/* Source Information */}
                <div>
                  <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Data Source</h4>
                  <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'} rounded-lg p-3 space-y-2`}>
                    <div>
                      <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>Source Type</p>
                      <p className={`${themeClasses.textPrimary(theme)} font-semibold capitalize`}>{selectedJob.dataSource}</p>
                    </div>
                    {selectedJob.uploadedFile && (
                      <div>
                        <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>File</p>
                        <p className={`${themeClasses.textPrimary(theme)} text-sm`}>{selectedJob.uploadedFile.name}</p>
                        <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>{(selectedJob.uploadedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Code Information */}
                {selectedJob.codeId && (
                  <div>
                    <h4 className={`font-semibold text-sm mb-3 ${themeClasses.textPrimary(theme)}`}>Associated Code</h4>
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
              <h2 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>Create Data Ingestion Job</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Name */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Job Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Load Customer Data"
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
                    setFormData({ ...formData, projectId: e.target.value });
                    setSelectedProjectCodeId(null);
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'} focus:outline-none focus:border-blue-500`}
                >
                  <option value="">Select a project...</option>
                  {global.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Data Source */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${themeClasses.textPrimary(theme)}`}>Data Source *</label>
                <div className="grid grid-cols-2 gap-2">
                  {sourceOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, dataSource: option.value })}
                        className={`p-3 rounded-lg border-2 transition flex items-center gap-2 ${
                          formData.dataSource === option.value
                            ? `${theme === 'dark' ? 'bg-blue-900/50 border-blue-500' : 'bg-blue-100 border-blue-500'}`
                            : `${theme === 'dark' ? 'bg-slate-900 border-slate-700 hover:border-slate-600' : 'bg-slate-100 border-slate-300 hover:border-slate-400'}`
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Upload for Desktop Source */}
              {formData.dataSource === 'desktop' && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Upload File</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                    theme === 'dark' ? 'border-slate-600 hover:border-blue-500' : 'border-slate-300 hover:border-blue-500'
                  }`}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Upload size={32} className="mx-auto mb-2 opacity-50" />
                      <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>Click to upload or drag and drop</p>
                      {uploadedFile && (
                        <p className="text-sm text-green-400 mt-2">✓ {uploadedFile.name}</p>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Code Selection */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${themeClasses.textPrimary(theme)}`}>Ingestion Code (Optional)</label>
                  <select
                    value={selectedProjectCodeId || ''}
                    onChange={(e) => setSelectedProjectCodeId(e.target.value || null)}
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
                      No code files found in project. Create files in the Projects workspace first.
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
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
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
