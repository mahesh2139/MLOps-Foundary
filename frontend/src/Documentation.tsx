import React, { useState, useMemo } from 'react';
import {
  ChevronDown, ChevronRight, Search, Code, Layers, GitBranch, Database, Container,
  Cloud, BarChart3, Shield, CheckCircle, Zap, ArrowRight, ExternalLink, Copy, Check
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface DocItem {
  id: string;
  section: string;
  title: string;
  content: React.ReactNode;
  tags?: string[];
}

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const docSections: DocSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Layers className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      description: 'Architecture and key capabilities'
    },
    {
      id: 'pipeline',
      title: 'Pipeline Stages',
      icon: <GitBranch className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      description: '8 canonical pipeline stages'
    },
    {
      id: 'architecture',
      title: 'Architecture',
      icon: <Cloud className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
      description: 'AWS infrastructure and components'
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: <Code className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      description: '25+ REST endpoints'
    },
    {
      id: 'deployment',
      title: 'Deployment',
      icon: <Container className="w-5 h-5" />,
      color: 'from-indigo-500 to-blue-500',
      description: 'CI/CD and deployment workflows'
    },
    {
      id: 'monitoring',
      title: 'Monitoring',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500',
      description: 'Drift detection and alerts'
    },
    {
      id: 'governance',
      title: 'Governance',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-rose-500 to-pink-500',
      description: 'RBAC and compliance'
    },
    {
      id: 'quickstart',
      title: 'Quick Start',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-cyan-500 to-blue-500',
      description: 'Setup and installation'
    }
  ];

  const docItems: DocItem[] = [
    {
      id: 'overview-capabilities',
      section: 'overview',
      title: 'Key Capabilities',
      tags: ['core', 'features'],
      content: (
        <div className="space-y-3">
          {[
            { title: 'Pipeline-First Architecture', desc: 'Visual DAG builder with 8 canonical stages' },
            { title: 'GitHub as System of Record', desc: 'All code, configs, and definitions in GitHub' },
            { title: 'AWS-Managed Compute', desc: 'ECS Fargate, Step Functions, no K8s required' },
            { title: 'Role-Based Access Control', desc: 'Multiple personas with approval workflows' },
            { title: 'Model Registry', desc: 'MLflow-based with promotion stages' },
            { title: 'Container-Based Deployment', desc: 'ECR + ECS for real-time and batch inference' },
            { title: 'Comprehensive Monitoring', desc: 'Data drift, concept drift, system health' },
            { title: 'CI/CD Enforcement', desc: 'GitHub Actions with locked pipeline nodes' },
            { title: 'Immutable Audit Logs', desc: 'Full traceability for compliance' }
          ].map((item, i) => (
            <div key={i} className="group p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-sm text-slate-300 mt-1">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'overview-roles',
      section: 'overview',
      title: 'User Roles',
      tags: ['users', 'rbac'],
      content: (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-white font-semibold">Role</th>
                <th className="text-left p-3 text-white font-semibold">Responsibilities</th>
              </tr>
            </thead>
            <tbody>
              {[
                { role: 'ML Engineers', resp: 'Define pipelines, register models, create features' },
                { role: 'Data Team', resp: 'Data ingestion, preparation, feature definitions' },
                { role: 'Production Team', resp: 'Deployment, rollback, version management' },
                { role: 'Monitoring Team', resp: 'Drift detection, alerts, performance tracking' },
                { role: 'Model Sponsors', resp: 'Dashboard access (read-only)' },
                { role: 'Admins', resp: 'Access control, integrations, approvals' }
              ].map((item, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 text-white font-medium">{item.role}</td>
                  <td className="p-3 text-slate-300">{item.resp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
    {
      id: 'pipeline-stages',
      section: 'pipeline',
      title: 'Canonical Stages',
      tags: ['workflow', 'pipeline'],
      content: (
        <div className="space-y-3">
          {[
            { num: 1, name: 'Data Ingestion', desc: 'Ingest data from multiple sources' },
            { num: 2, name: 'Data Preparation', desc: 'Clean, validate, and transform data' },
            { num: 3, name: 'Feature Store', desc: 'Compute and store features' },
            { num: 4, name: 'Model Registry', desc: 'Register pre-trained models (MLflow)' },
            { num: 5, name: 'Deployment', desc: 'Deploy containers to ECS' },
            { num: 6, name: 'Inferencing', desc: 'Real-time + batch inference services' },
            { num: 7, name: 'Monitoring', desc: 'Drift detection and alerts' },
            { num: 8, name: 'CI/CD Enforcement', desc: 'GitHub Actions and approval gates' }
          ].map((stage, i) => (
            <div key={i} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                  {stage.num}
                </div>
                {i < 7 && <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500 to-purple-500 mt-2" />}
              </div>
              <div className="pb-6 pt-1">
                <h4 className="font-semibold text-white">{stage.name}</h4>
                <p className="text-sm text-slate-300 mt-1">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'architecture-aws',
      section: 'architecture',
      title: 'AWS Services',
      tags: ['aws', 'infrastructure'],
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { service: 'ECR', purpose: 'Container registry for models & services' },
            { service: 'S3', purpose: 'Data, features, model artifacts' },
            { service: 'RDS (Postgres)', purpose: 'Metadata, registry, audit logs' },
            { service: 'ECS Fargate', purpose: 'Serverless container execution' },
            { service: 'Step Functions', purpose: 'Pipeline orchestration' },
            { service: 'CloudWatch', purpose: 'Logs, metrics, alerts' },
            { service: 'IAM', purpose: 'Identity & access control' },
            { service: 'SNS', purpose: 'Notifications, alerts' }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start gap-3">
                <Cloud className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">{item.service}</h4>
                  <p className="text-sm text-slate-300 mt-1">{item.purpose}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'api-endpoints',
      section: 'api',
      title: 'REST Endpoints',
      tags: ['api', 'backend'],
      content: (
        <div className="space-y-3">
          {[
            { method: 'GET', endpoint: '/projects', desc: 'List all projects' },
            { method: 'POST', endpoint: '/projects', desc: 'Create new project' },
            { method: 'GET', endpoint: '/pipelines/:projectId', desc: 'List pipelines' },
            { method: 'POST', endpoint: '/pipelines/:id/run', desc: 'Trigger execution' },
            { method: 'GET', endpoint: '/models', desc: 'List models' },
            { method: 'POST', endpoint: '/models/register', desc: 'Register model' },
            { method: 'POST', endpoint: '/models/:id/promote', desc: 'Promote to environment' },
            { method: 'GET', endpoint: '/deployments', desc: 'List deployments' },
            { method: 'POST', endpoint: '/deployments/:id/rollback', desc: 'Rollback deployment' },
            { method: 'GET', endpoint: '/monitoring/drift/:modelId', desc: 'Get drift metrics' },
            { method: 'POST', endpoint: '/integrations/github/connect', desc: 'OAuth connect GitHub' }
          ].map((api, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  api.method === 'GET' ? 'bg-blue-500/20 text-blue-300' :
                  api.method === 'POST' ? 'bg-green-500/20 text-green-300' :
                  api.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {api.method}
                </span>
                <code className="font-mono text-sm text-cyan-300 flex-1">{api.endpoint}</code>
                <span className="text-xs text-slate-400">{api.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'deployment-cicd',
      section: 'deployment',
      title: 'CI/CD Workflows',
      tags: ['cicd', 'github'],
      content: (
        <div className="space-y-3">
          {[
            {
              name: 'Pipeline Validation',
              trigger: 'Triggered on PR to main',
              steps: ['Validates pipeline YAML/JSON syntax', 'Checks locked node enforcement', 'Runs tests for affected stages']
            },
            {
              name: 'Deploy to Dev',
              trigger: 'Triggered on merge to main',
              steps: ['Builds container images', 'Updates pipeline definition', 'Deploys to dev ECS cluster']
            },
            {
              name: 'Promote to Staging',
              trigger: 'Triggered manually / scheduled',
              steps: ['Approval gate required', 'Runs integration tests', 'Deploys to staging ECS cluster']
            },
            {
              name: 'Promote to Production',
              trigger: 'Triggered manually with strict approval',
              steps: ['Multi-level approval required', 'Canary deployment option', 'Blue-green deployment', 'Auto-rollback on failure']
            }
          ].map((workflow, i) => (
            <div key={i} className="p-4 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all">
              <h4 className="font-semibold text-white mb-2">{workflow.name}</h4>
              <p className="text-xs text-slate-400 mb-3">{workflow.trigger}</p>
              <div className="space-y-2">
                {workflow.steps.map((step, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'monitoring-drift',
      section: 'monitoring',
      title: 'Drift Detection',
      tags: ['monitoring', 'drift', 'alerts'],
      content: (
        <div className="space-y-4">
          {[
            { type: 'Data Drift', desc: 'Input feature distribution changes' },
            { type: 'Concept Drift', desc: 'Target variable distribution changes' },
            { type: 'Prediction Drift', desc: 'Model output distribution changes' }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-semibold text-white mb-2">{item.type}</h4>
              <p className="text-sm text-slate-300">{item.desc}</p>
            </div>
          ))}
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <h4 className="font-semibold text-yellow-300 mb-2">Monitoring Metrics</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Model inference latency (p50, p99)</li>
              <li>• Model prediction distribution</li>
              <li>• Data feature availability</li>
              <li>• Pipeline execution duration</li>
              <li>• API endpoint health</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'governance-compliance',
      section: 'governance',
      title: 'Compliance & Governance',
      tags: ['compliance', 'audit', 'governance'],
      content: (
        <div className="space-y-3">
          {[
            { feature: 'Immutable Audit Logs', desc: 'All actions logged with timestamps & user' },
            { feature: 'Version Control', desc: 'All artifacts tracked in Git' },
            { feature: 'Approval Workflows', desc: 'Mandatory gates per environment' },
            { feature: 'Data Lineage', desc: 'Track data from ingestion to inference' },
            { feature: 'Access Logs', desc: 'AWS CloudTrail integration' }
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all">
              <h4 className="font-semibold text-white">{item.feature}</h4>
              <p className="text-sm text-slate-300 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'quickstart-install',
      section: 'quickstart',
      title: 'Installation',
      tags: ['setup', 'install'],
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-3">Prerequisites</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {['AWS Account with IAM permissions', 'GitHub organization & repository', 'Node.js 16+', 'Python 3.9+', 'Terraform 1.0+', 'Docker'].map((req, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
          <CodeBlock
            code={`# Clone the repository
git clone <repo-url>
cd mlops-studio

# Install dependencies
npm run install-all

# Configure AWS credentials
aws configure

# Set environment variables
cp .env.example .env`}
          />
        </div>
      )
    },
    {
      id: 'quickstart-dev',
      section: 'quickstart',
      title: 'Development Setup',
      tags: ['dev', 'local'],
      content: (
        <CodeBlock
          code={`# Start frontend + backend
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5000

# Deploy infrastructure
cd infra
terraform init
terraform plan
terraform apply`}
        />
      )
    }
  ];

  // Filter items based on search query and active section
  const filteredItems = useMemo(() => {
    return docItems.filter(item => {
      const matchesSection = item.section === activeSection;
      const matchesSearch = searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSection && matchesSearch;
    });
  }, [activeSection, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Documentation
              </h1>
              <p className="text-slate-400 mt-2">Enterprise MLOps Platform</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500/50 text-white placeholder-slate-400 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-3">
              {docSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-lg'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <div>
                      <h3 className="font-semibold text-sm">{section.title}</h3>
                      <p className="text-xs opacity-75 mt-0.5">{section.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-2">No results found for "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-slideUp">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <button
                      onClick={() => {
                        const newSet = new Set(expandedItems);
                        if (newSet.has(item.id)) {
                          newSet.delete(item.id);
                        } else {
                          newSet.add(item.id);
                        }
                        setExpandedItems(newSet);
                      }}
                      className="w-full p-6 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 hover:border-white/30 hover:from-white/15 hover:to-white/10 transition-all duration-300 text-left group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                            {item.title}
                          </h3>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs rounded-full bg-white/10 text-slate-300 border border-white/10"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {expandedItems.has(item.id) ? (
                          <ChevronDown className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0 group-hover:text-white transition-colors" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0 group-hover:text-white transition-colors" />
                        )}
                      </div>
                    </button>

                    {expandedItems.has(item.id) && (
                      <div className="border-t border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-6 animate-slideDown">
                        {item.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Code Block Component with Copy Functionality
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <pre className="p-4 rounded-lg bg-slate-950/50 border border-white/10 overflow-x-auto">
        <code className="text-sm text-cyan-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}
