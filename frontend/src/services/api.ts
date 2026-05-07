/**
 * API Service Layer - Connects frontend to backend
 * Base URL: http://localhost:5000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestOptions {
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

/**
 * Generic API request handler
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, method = 'GET', body } = options;

  const token = localStorage.getItem('token');
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Projects API
 */
export const projectsAPI = {
  list: () => apiCall('/projects'),
  create: (data: any) => apiCall('/projects', { method: 'POST', body: data }),
  get: (id: string) => apiCall(`/projects/${id}`),
  update: (id: string, data: any) => apiCall(`/projects/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiCall(`/projects/${id}`, { method: 'DELETE' }),
};

/**
 * Pipelines API
 */
export const pipelinesAPI = {
  list: (projectId: string) => apiCall(`/pipelines?projectId=${projectId}`),
  create: (data: any) => apiCall('/pipelines', { method: 'POST', body: data }),
  get: (id: string) => apiCall(`/pipelines/${id}`),
  update: (id: string, data: any) => apiCall(`/pipelines/${id}`, { method: 'PUT', body: data }),
  lock: (id: string, nodeIds: string[]) => 
    apiCall(`/pipelines/${id}/lock`, { method: 'POST', body: { nodeIds } }),
  unlock: (id: string, nodeIds: string[]) => 
    apiCall(`/pipelines/${id}/unlock`, { method: 'POST', body: { nodeIds } }),
  run: (id: string) => apiCall(`/pipelines/${id}/run`, { method: 'POST' }),
  getDAG: (id: string) => apiCall(`/pipelines/${id}/dag`),
};

/**
 * Models API
 */
export const modelsAPI = {
  list: () => apiCall('/models'),
  register: (data: any) => apiCall('/models/register', { method: 'POST', body: data }),
  get: (id: string) => apiCall(`/models/${id}`),
  promote: (id: string, environment: string) => 
    apiCall(`/models/${id}/promote`, { method: 'POST', body: { environment } }),
  getMetrics: (id: string) => apiCall(`/models/${id}/metrics`),
  getVersions: (id: string) => apiCall(`/models/${id}/versions`),
};

/**
 * Deployments API
 */
export const deploymentsAPI = {
  list: () => apiCall('/deployments'),
  create: (data: any) => apiCall('/deployments', { method: 'POST', body: data }),
  get: (id: string) => apiCall(`/deployments/${id}`),
  getStatus: (id: string) => apiCall(`/deployments/${id}/status`),
  rollback: (id: string) => apiCall(`/deployments/${id}/rollback`, { method: 'POST' }),
  listByEnvironment: (environment: string) => 
    apiCall(`/deployments?environment=${environment}`),
};

/**
 * Monitoring API
 */
export const monitoringAPI = {
  getDrift: (modelId: string) => apiCall(`/monitoring/drift/${modelId}`),
  getAlerts: () => apiCall('/monitoring/alerts'),
  createAlert: (data: any) => apiCall('/monitoring/alerts', { method: 'POST', body: data }),
  acknowledgeAlert: (alertId: string) => 
    apiCall(`/monitoring/alerts/${alertId}/acknowledge`, { method: 'POST' }),
  getMetrics: (modelId: string) => apiCall(`/monitoring/metrics/${modelId}`),
};

/**
 * Integrations API
 */
export const integrationsAPI = {
  list: () => apiCall('/integrations'),
  connect: (provider: string, credentials: any) => 
    apiCall(`/integrations/${provider}/connect`, { method: 'POST', body: credentials }),
  disconnect: (provider: string) => 
    apiCall(`/integrations/${provider}/disconnect`, { method: 'POST' }),
  getStatus: (provider: string) => apiCall(`/integrations/${provider}/status`),
  sync: (provider: string) => 
    apiCall(`/integrations/${provider}/sync`, { method: 'POST' }),
};

/**
 * GitHub API
 */
export const githubAPI = {
  connect: (code: string) => 
    apiCall('/integrations/github/connect', { method: 'POST', body: { code } }),
  listRepos: () => apiCall('/integrations/github/repos'),
  sync: () => apiCall('/integrations/github/sync', { method: 'POST' }),
  getStatus: () => apiCall('/integrations/github/status'),
};

/**
 * Audit/Governance API
 */
export const auditAPI = {
  getLogs: (filters?: any) => 
    apiCall(`/audit/logs${filters ? '?' + new URLSearchParams(filters).toString() : ''}`),
  getLog: (id: string) => apiCall(`/audit/logs/${id}`),
  exportLogs: (format: 'json' | 'csv') => 
    apiCall(`/audit/export?format=${format}`),
};

/**
 * Users/Admin API
 */
export const usersAPI = {
  list: () => apiCall('/users'),
  create: (data: any) => apiCall('/users', { method: 'POST', body: data }),
  get: (id: string) => apiCall(`/users/${id}`),
  update: (id: string, data: any) => apiCall(`/users/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => apiCall(`/users/${id}`, { method: 'DELETE' }),
  getRoles: () => apiCall('/users/roles'),
  updateRole: (userId: string, role: string) => 
    apiCall(`/users/${userId}/role`, { method: 'PUT', body: { role } }),
};

/**
 * CI/CD API
 */
export const cicdAPI = {
  listRuns: () => apiCall('/cicd/runs'),
  getRun: (id: string) => apiCall(`/cicd/runs/${id}`),
  approve: (runId: string) => 
    apiCall(`/cicd/runs/${runId}/approve`, { method: 'POST' }),
  reject: (runId: string, reason: string) => 
    apiCall(`/cicd/runs/${runId}/reject`, { method: 'POST', body: { reason } }),
  getLogs: (runId: string) => apiCall(`/cicd/runs/${runId}/logs`),
};

/**
 * Data Processing API
 */
export const dataAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE_URL}/data/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    }).then(r => r.json());
  },
  processData: (fileId: string, config: any) => 
    apiCall('/data/process', { method: 'POST', body: { fileId, config } }),
  validateData: (fileId: string) => 
    apiCall(`/data/validate/${fileId}`, { method: 'POST' }),
  profileData: (fileId: string) => 
    apiCall(`/data/profile/${fileId}`),
};

/**
 * Auth API
 */
export const authAPI = {
  login: (email: string, password: string) => 
    apiCall('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  register: (data: any) => 
    apiCall('/auth/register', { method: 'POST', body: data }),
  verify: () => apiCall('/auth/verify'),
  refreshToken: () => 
    apiCall('/auth/refresh', { method: 'POST' }),
};

export default {
  projectsAPI,
  pipelinesAPI,
  modelsAPI,
  deploymentsAPI,
  monitoringAPI,
  integrationsAPI,
  githubAPI,
  auditAPI,
  usersAPI,
  cicdAPI,
  dataAPI,
  authAPI,
};
