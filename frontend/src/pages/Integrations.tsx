import React, { useState } from 'react';
import { Plus, Check, X, ExternalLink, Settings, Trash2, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb, SearchBar, FilterChip } from '../components/UIPatterns';

interface Integration {
  id: string;
  name: string;
  provider: string;
  category: 'vcs' | 'storage' | 'ml' | 'cloud' | 'messaging' | 'monitoring' | 'data';
  icon: string;
  status: 'connected' | 'disconnected' | 'pending';
  description: string;
  config?: Record<string, string>;
  lastSync?: string;
  docs?: string;
}

interface IntegrationConfig {
  [key: string]: {
    fields: { name: string; type: string; label: string; required: boolean }[];
    defaultConfig: Record<string, string>;
  };
}

const Integrations: React.FC = () => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const [integrations, setIntegrations] = useState<Integration[]>([
    // VCS
    { id: '1', name: 'GitHub', provider: 'GitHub', category: 'vcs', icon: '🐙', status: 'connected', description: 'Version control and collaboration', lastSync: '2 mins ago', config: { token: '***', org: 'ml-ops' } },
    { id: '2', name: 'GitLab', provider: 'GitLab', category: 'vcs', icon: '🦊', status: 'disconnected', description: 'GitLab repository management', config: {} },
    { id: '3', name: 'Bitbucket', provider: 'Bitbucket', category: 'vcs', icon: '📦', status: 'disconnected', description: 'Atlassian Bitbucket integration', config: {} },

    // Storage
    { id: '4', name: 'AWS S3', provider: 'S3', category: 'storage', icon: '☁️', status: 'connected', description: 'Amazon S3 storage', lastSync: '1 min ago', config: { bucket: 'ml-ops-data', region: 'us-east-1' } },
    { id: '5', name: 'GCS', provider: 'Google Cloud Storage', category: 'storage', icon: '🔵', status: 'disconnected', description: 'Google Cloud Storage', config: {} },
    { id: '6', name: 'Azure Blob', provider: 'Azure', category: 'storage', icon: '🟦', status: 'disconnected', description: 'Microsoft Azure Blob Storage', config: {} },
    { id: '7', name: 'MinIO', provider: 'MinIO', category: 'storage', icon: '📁', status: 'disconnected', description: 'S3-compatible object storage', config: {} },

    // ML & Model Registry
    { id: '8', name: 'MLflow', provider: 'MLflow', category: 'ml', icon: '📊', status: 'connected', description: 'MLflow model registry', lastSync: '5 mins ago', config: { uri: 'http://localhost:5000' } },
    { id: '9', name: 'Hugging Face', provider: 'Hugging Face', category: 'ml', icon: '🤗', status: 'disconnected', description: 'Hugging Face Hub access', config: {} },
    { id: '10', name: 'Model Registry', provider: 'Custom Registry', category: 'ml', icon: '🎯', status: 'disconnected', description: 'Custom model registry', config: {} },

    // Cloud Platforms
    { id: '11', name: 'AWS SageMaker', provider: 'AWS SageMaker', category: 'cloud', icon: '🤖', status: 'disconnected', description: 'Amazon SageMaker training', config: {} },
    { id: '12', name: 'Google Vertex AI', provider: 'Vertex AI', category: 'cloud', icon: '⚡', status: 'disconnected', description: 'Google Vertex AI ML Platform', config: {} },

    // Messaging & Events
    { id: '13', name: 'Slack', provider: 'Slack', category: 'messaging', icon: '💬', status: 'disconnected', description: 'Slack notifications', config: {} },
    { id: '14', name: 'Kafka', provider: 'Apache Kafka', category: 'messaging', icon: '📢', status: 'disconnected', description: 'Apache Kafka event streaming', config: {} },
    { id: '15', name: 'RabbitMQ', provider: 'RabbitMQ', category: 'messaging', icon: '🐰', status: 'disconnected', description: 'RabbitMQ message broker', config: {} },

    // Monitoring
    { id: '16', name: 'Prometheus', provider: 'Prometheus', category: 'monitoring', icon: '📈', status: 'disconnected', description: 'Prometheus metrics', config: {} },
    { id: '17', name: 'Grafana', provider: 'Grafana', category: 'monitoring', icon: '📊', status: 'disconnected', description: 'Grafana dashboards', config: {} },
    { id: '18', name: 'DataDog', provider: 'DataDog', category: 'monitoring', icon: '🐕', status: 'disconnected', description: 'DataDog monitoring', config: {} },

    // Data
    { id: '19', name: 'PostgreSQL', provider: 'PostgreSQL', category: 'data', icon: '🐘', status: 'disconnected', description: 'PostgreSQL database', config: {} },
    { id: '20', name: 'MongoDB', provider: 'MongoDB', category: 'data', icon: '🍃', status: 'disconnected', description: 'MongoDB NoSQL', config: {} },
  ]);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vcs' | 'storage' | 'ml' | 'cloud' | 'messaging' | 'monitoring' | 'data'>('all');

  const integrationConfigs: IntegrationConfig = {
    GitHub: {
      fields: [
        { name: 'token', label: 'Personal Access Token', type: 'password', required: true },
        { name: 'org', label: 'Organization', type: 'text', required: false },
      ],
      defaultConfig: { token: '', org: '' },
    },
    'Google Cloud Storage': {
      fields: [
        { name: 'projectId', label: 'Project ID', type: 'text', required: true },
        { name: 'bucket', label: 'Bucket Name', type: 'text', required: true },
      ],
      defaultConfig: { projectId: '', bucket: '' },
    },
    'Hugging Face': {
      fields: [
        { name: 'token', label: 'API Token', type: 'password', required: true },
      ],
      defaultConfig: { token: '' },
    },
    Slack: {
      fields: [
        { name: 'webhookUrl', label: 'Webhook URL', type: 'password', required: true },
        { name: 'channel', label: 'Channel', type: 'text', required: false },
      ],
      defaultConfig: { webhookUrl: '', channel: '#ml-alerts' },
    },
    Prometheus: {
      fields: [
        { name: 'url', label: 'Prometheus URL', type: 'text', required: true },
        { name: 'scrapeInterval', label: 'Scrape Interval (s)', type: 'text', required: false },
      ],
      defaultConfig: { url: 'http://localhost:9090', scrapeInterval: '15' },
    },
    PostgreSQL: {
      fields: [
        { name: 'host', label: 'Host', type: 'text', required: true },
        { name: 'port', label: 'Port', type: 'text', required: false },
        { name: 'database', label: 'Database', type: 'text', required: true },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
      ],
      defaultConfig: { host: 'localhost', port: '5432', database: '', username: '', password: '' },
    },
  };

  const categories = {
    vcs: 'Version Control',
    storage: 'Storage',
    ml: 'ML & Models',
    cloud: 'Cloud Platforms',
    messaging: 'Messaging',
    monitoring: 'Monitoring',
    data: 'Data & Databases',
  };

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    const config = integrationConfigs[integration.provider];
    if (config) {
      setConfigValues(config.defaultConfig);
    } else {
      setConfigValues({});
    }
    setShowConfigModal(true);
  };

  const handleSaveConfig = () => {
    if (!selectedIntegration) return;

    setIntegrations(integrations.map(i =>
      i.id === selectedIntegration.id
        ? { ...i, status: 'connected', config: configValues, lastSync: 'just now' }
        : i
    ));
    setShowConfigModal(false);
    showNotification(`${selectedIntegration.name} connected successfully`, 'success');
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(integrations.map(i =>
      i.id === integrationId
        ? { ...i, status: 'disconnected', config: {}, lastSync: undefined }
        : i
    ));
    showNotification('Integration disconnected', 'success');
  };

  const groupedIntegrations = Object.entries(categories).map(([key, label]) => ({
    key: key as keyof typeof categories,
    label,
    items: integrations.filter(i => i.category === key),
  }));

  const getStatusColor = (status: string) => {
    return status === 'connected' ? 'text-green-400' : status === 'pending' ? 'text-yellow-400' : 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Integrations' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setShowConfigModal(true);
              }
            }}
          >
            <Plus className="w-4 h-4" />
            Browse Integrations
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          placeholder="Search integrations..."
          onSearch={setSearchQuery}
        />

        <div className="flex gap-2 flex-wrap">
          <FilterChip
            label="All"
            isActive={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
          />
          <FilterChip
            label="VCS"
            isActive={categoryFilter === 'vcs'}
            onClick={() => setCategoryFilter('vcs')}
          />
          <FilterChip
            label="Storage"
            isActive={categoryFilter === 'storage'}
            onClick={() => setCategoryFilter('storage')}
          />
          <FilterChip
            label="ML"
            isActive={categoryFilter === 'ml'}
            onClick={() => setCategoryFilter('ml')}
          />
          <FilterChip
            label="Cloud"
            isActive={categoryFilter === 'cloud'}
            onClick={() => setCategoryFilter('cloud')}
          />
          <FilterChip
            label="Messaging"
            isActive={categoryFilter === 'messaging'}
            onClick={() => setCategoryFilter('messaging')}
          />
          <FilterChip
            label="Monitoring"
            isActive={categoryFilter === 'monitoring'}
            onClick={() => setCategoryFilter('monitoring')}
          />
          <FilterChip
            label="Data"
            isActive={categoryFilter === 'data'}
            onClick={() => setCategoryFilter('data')}
          />
        </div>
      </div>

      {/* Integration Groups */}
      {groupedIntegrations
        .filter(group => categoryFilter === 'all' || group.key === categoryFilter)
        .map(group => {
          const filteredItems = group.items.filter(i =>
            searchQuery === '' ||
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.description.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={group.key} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-300">{group.label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(integration => (
              <div
                key={integration.id}
                className={`rounded-lg p-5 border transition ${
                  integration.status === 'connected'
                    ? 'bg-green-600/10 border-green-500/30'
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{integration.icon}</div>
                    <div>
                      <h3 className="font-semibold">{integration.name}</h3>
                      <p className="text-xs text-gray-400">{integration.provider}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${getStatusColor(integration.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      integration.status === 'connected' ? 'bg-green-500' :
                      integration.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    {integration.status}
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3">{integration.description}</p>

                {integration.status === 'connected' && integration.config && Object.keys(integration.config).length > 0 && (
                  <div className="mb-3 text-xs text-gray-400 space-y-1">
                    {Object.entries(integration.config)
                      .filter(([, v]) => v && !v.includes('***'))
                      .slice(0, 2)
                      .map(([k, v]) => (
                        <div key={k}><span className="font-mono">{k}:</span> {v}</div>
                      ))}
                    {integration.lastSync && <div className="text-xs text-gray-500 pt-2">Synced {integration.lastSync}</div>}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-700/50">
                  {integration.status === 'disconnected' ? (
                    <button
                      onClick={() => handleConnect(integration)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                    >
                      Connect
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleConnect(integration)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
                        title="Reconfigure"
                      >
                        <Settings className="w-3 h-3" />
                        Config
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm transition"
                        title="Disconnect"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
              </div>
            </div>
          );
        })}

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Configure {selectedIntegration.name}</h2>

            {integrationConfigs[selectedIntegration.provider] ? (
              <div className="space-y-4">
                {integrationConfigs[selectedIntegration.provider].fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium mb-2">
                      {field.label}
                      {field.required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type={field.type}
                      value={configValues[field.name] || ''}
                      onChange={(e) => setConfigValues({ ...configValues, [field.name]: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-yellow-300">Configuration template not available. Please use default settings.</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
