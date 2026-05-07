import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, GitBranch, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const CICD: React.FC = () => {
  const { theme } = useTheme();
  const [runs, setRuns] = useState([
    {
      id: '1',
      workflow: 'Deploy to Dev',
      status: 'completed',
      branch: 'main',
      commit: 'a3f8c2e',
      timestamp: '5 mins ago',
      duration: '2m 34s',
      approvals: 2,
    },
    {
      id: '2',
      workflow: 'Promote to Staging',
      status: 'pending_approval',
      branch: 'main',
      commit: 'f2e9d1c',
      timestamp: '15 mins ago',
      duration: '5m 12s',
      approvals: 1,
      required: 2,
    },
    {
      id: '3',
      workflow: 'Pipeline Validation',
      status: 'running',
      branch: 'develop',
      commit: 'b1e4a3f',
      timestamp: '2 hours ago',
      duration: '3m 45s',
      approvals: 0,
    },
    {
      id: '4',
      workflow: 'Promote to Prod',
      status: 'failed',
      branch: 'main',
      commit: '7c2f9e3',
      timestamp: '4 hours ago',
      duration: '2m 18s',
      approvals: 0,
      error: 'Locked node validation failed',
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'pending_approval':
        return <MessageSquare className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600/10 border-green-500';
      case 'running':
        return 'bg-blue-600/10 border-blue-500';
      case 'failed':
        return 'bg-red-600/10 border-red-500';
      case 'pending_approval':
        return 'bg-yellow-600/10 border-yellow-500';
      default:
        return 'bg-gray-600/10 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">CI/CD Pipeline Runs</h1>

      {/* Filters */}
      <div className="flex gap-3">
        <select className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
          <option>All Workflows</option>
          <option>Deploy to Dev</option>
          <option>Promote to Staging</option>
          <option>Promote to Prod</option>
        </select>
        <select className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
          <option>All Branches</option>
          <option>main</option>
          <option>develop</option>
          <option>feature/*</option>
        </select>
      </div>

      {/* Runs List */}
      <div className="space-y-3">
        {runs.map((run) => (
          <div key={run.id} className={`p-4 rounded-lg border flex items-start justify-between ${getStatusColor(run.status)}`}>
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1">{getStatusIcon(run.status)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{run.workflow}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 capitalize">
                    {run.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {run.branch} • {run.commit}
                  </span>
                  <span>{run.timestamp}</span>
                  <span>Duration: {run.duration}</span>
                </div>

                {run.error && (
                  <div className="mt-2 p-2 bg-red-600/20 rounded text-sm text-red-400">
                    ⚠️ {run.error}
                  </div>
                )}

                {run.status === 'pending_approval' && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm">Approvals: {run.approvals}/{run.required}</p>
                    <div className="flex gap-2">
                      <button className="text-xs bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition">
                        ✓ Approve
                      </button>
                      <button className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition">
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap">
              View Details →
            </button>
          </div>
        ))}
      </div>

      {/* Workflow Configuration */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">GitHub Actions Workflows</h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-700/50 rounded border-l-4 border-blue-500">
            <p className="font-medium text-sm">pipeline-validation.yml</p>
            <p className="text-xs text-gray-400 mt-1">Validates pipeline YAML, runs tests, checks locked nodes</p>
          </div>
          <div className="p-3 bg-gray-700/50 rounded border-l-4 border-green-500">
            <p className="font-medium text-sm">deploy-to-dev.yml</p>
            <p className="text-xs text-gray-400 mt-1">Builds container, deploys to dev ECS</p>
          </div>
          <div className="p-3 bg-gray-700/50 rounded border-l-4 border-yellow-500">
            <p className="font-medium text-sm">promote-to-staging.yml</p>
            <p className="text-xs text-gray-400 mt-1">Requires approval gate before staging deployment</p>
          </div>
          <div className="p-3 bg-gray-700/50 rounded border-l-4 border-red-500">
            <p className="font-medium text-sm">promote-to-prod.yml</p>
            <p className="text-xs text-gray-400 mt-1">Blue-green deployment, requires 2+ approvals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CICD;
