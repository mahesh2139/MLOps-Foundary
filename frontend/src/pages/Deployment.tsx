import React, { useState } from 'react';
import { Plus, Trash2, Play, AlertCircle, Loader, Package, Code, Container, CheckCircle, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb } from '../components/UIPatterns';
import { CodeTerminal } from '../components/CodeTerminal';
import { themeClasses } from '../utils/themeClasses';

export default function Deployment() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [showJobModal, setShowJobModal] = useState(false);
  const [showDockerfileModal, setShowDockerfileModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    modelId: '',
    environment: 'dev' as const,
    containerName: '',
  });
  const [dockerfileContent, setDockerfileContent] = useState(`FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
EXPOSE 5000

CMD ["python", "src/inference.py"]`);
  const [selectedDeploymentCodes, setSelectedDeploymentCodes] = useState<string[]>([]);

  const selectedJob = selectedJobId ? global.getDeploymentJob(selectedJobId) : null;

  const handleCreateJob = () => {
    if (!formData.name.trim() || !formData.projectId || !formData.modelId) {
      showNotification('Job name, project, and model are required', 'warning');
      return;
    }

    const newJob = global.createDeploymentJob({
      name: formData.name,
      projectId: formData.projectId,
      modelId: formData.modelId,
      environment: formData.environment,
      containerName: formData.containerName || `${formData.name.toLowerCase()}-${Date.now()}`,
      deploymentCodes: selectedDeploymentCodes,
      status: 'created',
    });

    showNotification('Deployment job created', 'success');
    setShowJobModal(false);
    setFormData({ name: '', projectId: '', modelId: '', environment: 'dev', containerName: '' });
    setSelectedDeploymentCodes([]);
  };

  const handleRunDeployment = (jobId: string) => {
    global.updateDeploymentJob(jobId, { 
      status: 'building',
      deploymentLogs: ['$ Docker image building...'],
    });
    
    setTimeout(() => {
      global.updateDeploymentJob(jobId, { 
        status: 'deploying',
        deploymentLogs: ['$ Docker image building...', 'Successfully built 8c4a5d9e2f1b', 'Deploying to ECS...'],
      });
    }, 1500);

    setTimeout(() => {
      global.updateDeploymentJob(jobId, { 
        status: 'active',
        deploymentLogs: [
          '$ Docker image building...',
          'Successfully built 8c4a5d9e2f1b',
          'Deploying to ECS...',
          'Deployment successful ✓',
          'Service running on port 5000'
        ],
        lastDeployed: new Date().toISOString(),
      });
      showNotification('Deployment completed successfully', 'success');
    }, 3000);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Delete this deployment?')) {
      global.deleteDeploymentJob(jobId);
      showNotification('Deployment deleted', 'success');
    }
  };

  const handleSaveDockerfile = () => {
    if (selectedProjectId) {
      const project = global.getProject(selectedProjectId);
      if (project) {
        const existingDockerfile = project.code.find(c => c.name === 'Dockerfile');
        if (existingDockerfile) {
          global.updateProjectCode(selectedProjectId, existingDockerfile.id, {
            content: dockerfileContent,
          });
          showNotification('Dockerfile updated', 'success');
        } else {
          global.addProjectCode(selectedProjectId, {
            name: 'Dockerfile',
            language: 'dockerfile',
            content: dockerfileContent,
          });
          showNotification('Dockerfile created', 'success');
        }
      }
      setShowDockerfileModal(false);
    }
  };

  const getAvailableModels = (projectId: string) => {
    return global.registryModels.filter(m => m.projectId === projectId);
  };

  const getProjectPythonCodes = (projectId: string) => {
    const project = global.getProject(projectId);
    return project?.code.filter(c => c.language === 'python') || [];
  };

  const envColors = {
    dev: 'from-blue-600/20 to-blue-400/10 border-blue-400/30',
    staging: 'from-yellow-600/20 to-yellow-400/10 border-yellow-400/30',
    prod: 'from-red-600/20 to-red-400/10 border-red-400/30',
  };

  const envTextColors = {
    dev: 'text-blue-400',
    staging: 'text-yellow-400',
    prod: 'text-red-400',
  };

  const statusIcons = {
    created: Package,
    building: Loader,
    deploying: Container,
    active: CheckCircle,
    failed: AlertCircle,
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Model Deployment' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>Model Deployment</h1>
          <p className={`${themeClasses.textSecondary(theme)} mt-1`}>Deploy models to containers and environments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDockerfileModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
          >
            <Code size={20} />
            Manage Dockerfile
          </button>
          <button
            onClick={() => setShowJobModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <Plus size={20} />
            New Deployment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} rounded-lg border ${theme === 'dark' ? 'border-white/10' : 'border-slate-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Total Deployments</p>
          <p className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>{global.deploymentJobs.length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'} rounded-lg border ${theme === 'dark' ? 'border-green-400/30' : 'border-green-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Active</p>
          <p className="text-2xl font-bold text-green-400">{global.deploymentJobs.filter(j => j.status === 'active').length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'} rounded-lg border ${theme === 'dark' ? 'border-yellow-400/30' : 'border-yellow-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Deploying</p>
          <p className="text-2xl font-bold text-yellow-400">{global.deploymentJobs.filter(j => j.status === 'building' || j.status === 'deploying').length}</p>
        </div>
        <div className={`p-4 ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'} rounded-lg border ${theme === 'dark' ? 'border-red-400/30' : 'border-red-300'}`}>
          <p className={`${themeClasses.textSecondary(theme)} text-xs font-medium mb-1`}>Failed</p>
          <p className="text-2xl font-bold text-red-400">{global.deploymentJobs.filter(j => j.status === 'failed').length}</p>
        </div>
      </div>

      {/* Deployments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {global.deploymentJobs.length === 0 ? (
          <div className={`col-span-full p-12 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} rounded-lg border ${theme === 'dark' ? 'border-white/10' : 'border-slate-300'}`}>
            <Container size={48} className={`mx-auto mb-4 ${themeClasses.textSecondary(theme)}`} />
            <p className={`${themeClasses.textSecondary(theme)} mb-4`}>No deployments yet</p>
            <button
              onClick={() => setShowJobModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Create your first deployment
            </button>
          </div>
        ) : (
          global.deploymentJobs.map(job => {
            const StatusIcon = statusIcons[job.status as keyof typeof statusIcons];
            const model = global.getRegistryModel(job.modelId);
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`p-6 bg-gradient-to-br ${envColors[job.environment as keyof typeof envColors]} rounded-lg border cursor-pointer hover:border-white/50 transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${themeClasses.textPrimary(theme)}`}>{job.name}</h3>
                    <p className={`text-sm ${envTextColors[job.environment as keyof typeof envTextColors]}`}>{job.environment.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job.id);
                    }}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon size={16} className={
                      job.status === 'active' ? 'text-green-400' :
                      job.status === 'failed' ? 'text-red-400' :
                      job.status === 'deploying' || job.status === 'building' ? 'animate-spin text-yellow-400' :
                      'text-blue-400'
                    } />
                    <span className="text-sm capitalize">{job.status}</span>
                  </div>
                  <div className="text-sm">
                    <p className={themeClasses.textSecondary(theme)}>Model: {model?.name}</p>
                    <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>{job.containerName}</p>
                  </div>
                </div>

                {job.lastDeployed && (
                  <div className={`text-xs ${themeClasses.textSecondary(theme)} flex items-center gap-1`}>
                    <Clock size={12} />
                    {new Date(job.lastDeployed).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Deployment Details */}
      {selectedJob && (
        <div className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-300'} rounded-lg border p-6 space-y-6`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>{selectedJob.name}</h2>
            <button
              onClick={() => setSelectedJobId(null)}
              className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'} rounded-lg transition`}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
              <p className={`text-xs ${themeClasses.textSecondary(theme)} mb-1`}>ENVIRONMENT</p>
              <p className={`text-lg font-bold ${envTextColors[selectedJob.environment as keyof typeof envTextColors]}`}>{selectedJob.environment.toUpperCase()}</p>
            </div>
            <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
              <p className={`text-xs ${themeClasses.textSecondary(theme)} mb-1`}>STATUS</p>
              <p className={`text-lg font-bold capitalize ${
                selectedJob.status === 'active' ? 'text-green-400' :
                selectedJob.status === 'failed' ? 'text-red-400' :
                'text-yellow-400'
              }`}>{selectedJob.status}</p>
            </div>
            <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
              <p className={`text-xs ${themeClasses.textSecondary(theme)} mb-1`}>CONTAINER</p>
              <p className={`text-lg font-bold ${themeClasses.textPrimary(theme)} truncate`}>{selectedJob.containerName}</p>
            </div>
          </div>

          {/* Deployment Logs */}
          {selectedJob.deploymentLogs && (
            <CodeTerminal
              code={selectedJob.deploymentLogs.join('\n')}
              language="dockerfile"
              title="Deployment Logs"
              height="h-48"
            />
          )}

          {/* Deployment Action */}
          <button
            onClick={() => handleRunDeployment(selectedJob.id)}
            disabled={selectedJob.status === 'building' || selectedJob.status === 'deploying'}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
          >
            <Play size={18} />
            {selectedJob.status === 'building' || selectedJob.status === 'deploying' ? 'Deploying...' : selectedJob.status === 'active' ? 'Redeploy Model' : 'Deploy Model'} to {selectedJob.environment}
          </button>
        </div>
      )}

      {/* Create Deployment Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 w-full max-w-2xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'} max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-6`}>Create Deployment Job</h2>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Deployment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-black'
                  }`}
                  placeholder="e.g., Prod Deployment v1.2"
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Select Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value, modelId: '' })}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-black'
                  }`}
                >
                  <option value="">Choose a project...</option>
                  {global.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Model Selection */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Select Model *</label>
                  <select
                    value={formData.modelId}
                    onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-black'
                    }`}
                  >
                    <option value="">Choose a model...</option>
                    {getAvailableModels(formData.projectId).map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.version})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Environment */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Environment</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-black'
                    }`}
                  >
                    <option value="dev">Development</option>
                    <option value="staging">Staging</option>
                    <option value="prod">Production</option>
                  </select>
                </div>

                {/* Container Name */}
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Container Name</label>
                  <input
                    type="text"
                    value={formData.containerName}
                    onChange={(e) => setFormData({ ...formData, containerName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-black'
                    }`}
                    placeholder="auto-generated"
                  />
                </div>
              </div>

              {/* Deployment Scripts */}
              {formData.projectId && (
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Deployment Scripts (Optional)</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getProjectPythonCodes(formData.projectId).map(code => (
                      <label key={code.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDeploymentCodes.includes(code.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDeploymentCodes([...selectedDeploymentCodes, code.id]);
                            } else {
                              setSelectedDeploymentCodes(selectedDeploymentCodes.filter(id => id !== code.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className={`text-sm ${themeClasses.textPrimary(theme)}`}>{code.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-slate-700">
                <button
                  onClick={() => {
                    setShowJobModal(false);
                    setFormData({ name: '', projectId: '', modelId: '', environment: 'dev', containerName: '' });
                    setSelectedDeploymentCodes([]);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Create Deployment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dockerfile Management Modal */}
      {showDockerfileModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 w-full max-w-3xl border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'} max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-4`}>Manage Dockerfile</h2>

            {/* Project Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Select Project</label>
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value || null)}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-black'
                }`}
              >
                <option value="">Choose a project...</option>
                {global.projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Dockerfile Editor */}
            <div className="mb-6">
              <label className={`block text-sm font-medium ${themeClasses.textSecondary(theme)} mb-2`}>Dockerfile Content</label>
              <textarea
                value={dockerfileContent}
                onChange={(e) => setDockerfileContent(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm h-64 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-black'
                }`}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDockerfileModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDockerfile}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Save Dockerfile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
