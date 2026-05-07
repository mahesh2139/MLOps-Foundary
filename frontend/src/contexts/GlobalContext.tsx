import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Type Definitions
export interface ProjectCode {
  id: string;
  name: string;
  language: 'python' | 'yaml' | 'json' | 'dockerfile' | 'text';
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  environment: 'dev' | 'staging' | 'prod';
  status: 'active' | 'inactive';
  code: ProjectCode[];
  createdAt: string;
}

export interface IngestionJob {
  id: string;
  name: string;
  projectId: string;
  codeId?: string;
  dataSource: 'csv' | 'database' | 'api' | 'cloud' | 'desktop';
  sourceConfig?: Record<string, any>;
  uploadedFile?: {
    name: string;
    path: string;
    size: number;
    type: string;
  };
  status: 'created' | 'running' | 'completed' | 'failed';
  outputPath?: string;
  outputShape?: { rows: number; columns: number };
  outputColumns?: string[];
  createdAt: string;
  lastRun?: string;
}

export interface PreparationJob {
  id: string;
  name: string;
  projectId: string;
  codeId?: string;
  ingestionJobId: string;
  processingConfig?: Record<string, any>;
  status: 'created' | 'running' | 'completed' | 'failed';
  outputPath?: string;
  outputShape?: { rows: number; columns: number };
  outputColumns?: string[];
  createdAt: string;
  lastRun?: string;
}

export interface RegistryModel {
  id: string;
  name: string;
  version: string;
  projectId: string;
  codeId?: string;
  uploadedFile?: {
    name: string;
    path: string;
    size: number;
    type: string;
  };
  modelType: 'classification' | 'regression' | 'clustering' | 'nlp' | 'custom';
  metrics?: Record<string, number>;
  stage: 'dev' | 'staging' | 'production';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface DeploymentJob {
  id: string;
  name: string;
  projectId: string;
  modelId: string;
  dockerfileCodeId?: string;
  deploymentCodes?: string[]; // Array of code IDs for deployment scripts
  containerName?: string;
  environment: 'dev' | 'staging' | 'prod';
  status: 'created' | 'building' | 'deploying' | 'active' | 'failed';
  deploymentLogs?: string[];
  createdAt: string;
  lastDeployed?: string;
}

export interface InferencingJob {
  id: string;
  name: string;
  projectId: string;
  modelId: string;
  codeId?: string;
  inputDatasetId?: string;
  status: 'created' | 'running' | 'completed' | 'failed';
  outputPath?: string;
  predictions?: any[];
  createdAt: string;
  lastRun?: string;
}

export interface MonitoringJob {
  id: string;
  name: string;
  projectId: string;
  modelId: string;
  codeId?: string;
  inputDatasetId?: string;
  monitoringMetrics?: Record<string, number>;
  metrics?: {
    dataDrift?: number;
    modelDrift?: number;
    performanceDegradation?: number;
    lastChecked?: string;
  };
  status: 'created' | 'running' | 'completed' | 'failed';
  outputPath?: string;
  createdAt: string;
  lastRun?: string;
}

export interface PipelineJob {
  id: string;
  projectId: string;
  name: string;
  stages: {
    ingestion?: string; // Job ID
    preparation?: string;
    training?: string;
    registry?: string;
    deployment?: string;
    inferencing?: string;
    monitoring?: string;
  };
  status: 'created' | 'running' | 'completed' | 'failed';
  createdAt: string;
  lastRun?: string;
}

interface GlobalContextType {
  // Projects
  projects: Project[];
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;

  // Project Code
  addProjectCode: (projectId: string, code: Omit<ProjectCode, 'id' | 'createdAt'>) => ProjectCode;
  updateProjectCode: (projectId: string, codeId: string, updates: Partial<ProjectCode>) => void;
  deleteProjectCode: (projectId: string, codeId: string) => void;
  getProjectCode: (projectId: string, codeId: string) => ProjectCode | undefined;
  getProjectCodes: (projectId: string) => ProjectCode[];

  // Ingestion Jobs
  ingestionJobs: IngestionJob[];
  createIngestionJob: (job: Omit<IngestionJob, 'id' | 'createdAt'>) => IngestionJob;
  updateIngestionJob: (id: string, updates: Partial<IngestionJob>) => void;
  deleteIngestionJob: (id: string) => void;
  getIngestionJob: (id: string) => IngestionJob | undefined;

  // Preparation Jobs
  preparationJobs: PreparationJob[];
  createPreparationJob: (job: Omit<PreparationJob, 'id' | 'createdAt'>) => PreparationJob;
  updatePreparationJob: (id: string, updates: Partial<PreparationJob>) => void;
  deletePreparationJob: (id: string) => void;
  getPreparationJob: (id: string) => PreparationJob | undefined;

  // Registry Models
  registryModels: RegistryModel[];
  createRegistryModel: (model: Omit<RegistryModel, 'id' | 'createdAt'>) => RegistryModel;
  updateRegistryModel: (id: string, updates: Partial<RegistryModel>) => void;
  deleteRegistryModel: (id: string) => void;
  getRegistryModel: (id: string) => RegistryModel | undefined;

  // Deployment Jobs
  deploymentJobs: DeploymentJob[];
  createDeploymentJob: (job: Omit<DeploymentJob, 'id' | 'createdAt'>) => DeploymentJob;
  updateDeploymentJob: (id: string, updates: Partial<DeploymentJob>) => void;
  deleteDeploymentJob: (id: string) => void;
  getDeploymentJob: (id: string) => DeploymentJob | undefined;

  // Inferencing Jobs
  inferencingJobs: InferencingJob[];
  createInferencingJob: (job: Omit<InferencingJob, 'id' | 'createdAt'>) => InferencingJob;
  updateInferencingJob: (id: string, updates: Partial<InferencingJob>) => void;
  deleteInferencingJob: (id: string) => void;
  getInferencingJob: (id: string) => InferencingJob | undefined;

  // Monitoring Jobs
  monitoringJobs: MonitoringJob[];
  createMonitoringJob: (job: Omit<MonitoringJob, 'id' | 'createdAt'>) => MonitoringJob;
  updateMonitoringJob: (id: string, updates: Partial<MonitoringJob>) => void;
  deleteMonitoringJob: (id: string) => void;
  getMonitoringJob: (id: string) => MonitoringJob | undefined;

  // Pipeline Jobs
  pipelineJobs: PipelineJob[];
  createPipelineJob: (job: Omit<PipelineJob, 'id' | 'createdAt'>) => PipelineJob;
  updatePipelineJob: (id: string, updates: Partial<PipelineJob>) => void;
  deletePipelineJob: (id: string) => void;
  getPipelineJob: (id: string) => PipelineJob | undefined;
  getPipelinesByProject: (projectId: string) => PipelineJob[];
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const STORAGE_KEY = 'mlops_studio_state';

const initialState: {
  projects: Project[];
  ingestionJobs: IngestionJob[];
  preparationJobs: PreparationJob[];
  registryModels: RegistryModel[];
  deploymentJobs: DeploymentJob[];
  inferencingJobs: InferencingJob[];
  monitoringJobs: MonitoringJob[];
  pipelineJobs: PipelineJob[];
} = {
  projects: [],
  ingestionJobs: [],
  preparationJobs: [],
  registryModels: [],
  deploymentJobs: [],
  inferencingJobs: [],
  monitoringJobs: [],
  pipelineJobs: [],
};

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to load state from localStorage:', err);
      }
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Helper function to generate IDs
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Projects
  const createProject = (project: Omit<Project, 'id' | 'createdAt'>): Project => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  };

  const deleteProject = (id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
    }));
  };

  const getProject = (id: string) => state.projects.find(p => p.id === id);

  // Project Code
  const addProjectCode = (projectId: string, code: Omit<ProjectCode, 'id' | 'createdAt'>): ProjectCode => {
    const newCode: ProjectCode = {
      ...code,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    updateProject(projectId, {
      code: [...(getProject(projectId)?.code || []), newCode],
    });
    return newCode;
  };

  const updateProjectCode = (projectId: string, codeId: string, updates: Partial<ProjectCode>) => {
    const project = getProject(projectId);
    if (project) {
      updateProject(projectId, {
        code: project.code.map(c => c.id === codeId ? { ...c, ...updates } : c),
      });
    }
  };

  const deleteProjectCode = (projectId: string, codeId: string) => {
    const project = getProject(projectId);
    if (project) {
      updateProject(projectId, {
        code: project.code.filter(c => c.id !== codeId),
      });
    }
  };

  const getProjectCode = (projectId: string, codeId: string) => {
    const project = getProject(projectId);
    return project?.code.find(c => c.id === codeId);
  };

  const getProjectCodes = (projectId: string) => {
    const project = getProject(projectId);
    return project?.code || [];
  };

  // Ingestion Jobs
  const createIngestionJob = (job: Omit<IngestionJob, 'id' | 'createdAt'>): IngestionJob => {
    const newJob: IngestionJob = {
      ...job,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      ingestionJobs: [...prev.ingestionJobs, newJob],
    }));
    return newJob;
  };

  const updateIngestionJob = (id: string, updates: Partial<IngestionJob>) => {
    setState(prev => ({
      ...prev,
      ingestionJobs: prev.ingestionJobs.map(j => j.id === id ? { ...j, ...updates } : j),
    }));
  };

  const deleteIngestionJob = (id: string) => {
    setState(prev => ({
      ...prev,
      ingestionJobs: prev.ingestionJobs.filter(j => j.id !== id),
    }));
  };

  const getIngestionJob = (id: string) => state.ingestionJobs.find(j => j.id === id);

  // Preparation Jobs
  const createPreparationJob = (job: Omit<PreparationJob, 'id' | 'createdAt'>): PreparationJob => {
    const newJob: PreparationJob = {
      ...job,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      preparationJobs: [...prev.preparationJobs, newJob],
    }));
    return newJob;
  };

  const updatePreparationJob = (id: string, updates: Partial<PreparationJob>) => {
    setState(prev => ({
      ...prev,
      preparationJobs: prev.preparationJobs.map(j => j.id === id ? { ...j, ...updates } : j),
    }));
  };

  const deletePreparationJob = (id: string) => {
    setState(prev => ({
      ...prev,
      preparationJobs: prev.preparationJobs.filter(j => j.id !== id),
    }));
  };

  const getPreparationJob = (id: string) => state.preparationJobs.find(j => j.id === id);

  // Registry Models
  const createRegistryModel = (model: Omit<RegistryModel, 'id' | 'createdAt'>): RegistryModel => {
    const newModel: RegistryModel = {
      ...model,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      registryModels: [...prev.registryModels, newModel],
    }));
    return newModel;
  };

  const updateRegistryModel = (id: string, updates: Partial<RegistryModel>) => {
    setState(prev => ({
      ...prev,
      registryModels: prev.registryModels.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
  };

  const deleteRegistryModel = (id: string) => {
    setState(prev => ({
      ...prev,
      registryModels: prev.registryModels.filter(m => m.id !== id),
    }));
  };

  const getRegistryModel = (id: string) => state.registryModels.find(m => m.id === id);

  // Deployment Jobs
  const createDeploymentJob = (job: Omit<DeploymentJob, 'id' | 'createdAt'>): DeploymentJob => {
    const newJob: DeploymentJob = {
      ...job,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      deploymentJobs: [...prev.deploymentJobs, newJob],
    }));
    return newJob;
  };

  const updateDeploymentJob = (id: string, updates: Partial<DeploymentJob>) => {
    setState(prev => ({
      ...prev,
      deploymentJobs: prev.deploymentJobs.map(j => j.id === id ? { ...j, ...updates } : j),
    }));
  };

  const deleteDeploymentJob = (id: string) => {
    setState(prev => ({
      ...prev,
      deploymentJobs: prev.deploymentJobs.filter(j => j.id !== id),
    }));
  };

  const getDeploymentJob = (id: string) => state.deploymentJobs.find(j => j.id === id);

  // Inferencing Jobs
  const createInferencingJob = (job: Omit<InferencingJob, 'id' | 'createdAt'>): InferencingJob => {
    const newJob: InferencingJob = {
      ...job,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      inferencingJobs: [...prev.inferencingJobs, newJob],
    }));
    return newJob;
  };

  const updateInferencingJob = (id: string, updates: Partial<InferencingJob>) => {
    setState(prev => ({
      ...prev,
      inferencingJobs: prev.inferencingJobs.map(j => j.id === id ? { ...j, ...updates } : j),
    }));
  };

  const deleteInferencingJob = (id: string) => {
    setState(prev => ({
      ...prev,
      inferencingJobs: prev.inferencingJobs.filter(j => j.id !== id),
    }));
  };

  const getInferencingJob = (id: string) => state.inferencingJobs.find(j => j.id === id);

  // Monitoring Jobs
  const createMonitoringJob = (job: Omit<MonitoringJob, 'id' | 'createdAt'>): MonitoringJob => {
    const newJob: MonitoringJob = {
      ...job,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      monitoringJobs: [...prev.monitoringJobs, newJob],
    }));
    return newJob;
  };

  const updateMonitoringJob = (id: string, updates: Partial<MonitoringJob>) => {
    setState(prev => ({
      ...prev,
      monitoringJobs: prev.monitoringJobs.map(j => j.id === id ? { ...j, ...updates } : j),
    }));
  };

  const deleteMonitoringJob = (id: string) => {
    setState(prev => ({
      ...prev,
      monitoringJobs: prev.monitoringJobs.filter(j => j.id !== id),
    }));
  };

  const getMonitoringJob = (id: string) => state.monitoringJobs.find(j => j.id === id);

  // Pipeline Jobs
  const createPipelineJob = (job: Omit<PipelineJob, 'id' | 'createdAt'>): PipelineJob => {
    const newJob: PipelineJob = {
      ...job,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      pipelineJobs: [...prev.pipelineJobs, newJob],
    }));
    return newJob;
  };

  const updatePipelineJob = (id: string, updates: Partial<PipelineJob>) => {
    setState(prev => ({
      ...prev,
      pipelineJobs: prev.pipelineJobs.map(j => j.id === id ? { ...j, ...updates } : j),
    }));
  };

  const deletePipelineJob = (id: string) => {
    setState(prev => ({
      ...prev,
      pipelineJobs: prev.pipelineJobs.filter(j => j.id !== id),
    }));
  };

  const getPipelineJob = (id: string) => state.pipelineJobs.find(j => j.id === id);

  const getPipelinesByProject = (projectId: string) => state.pipelineJobs.filter(j => j.projectId === projectId);

  const value: GlobalContextType = {
    projects: state.projects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    addProjectCode,
    updateProjectCode,
    deleteProjectCode,
    getProjectCode,
    getProjectCodes,
    ingestionJobs: state.ingestionJobs,
    createIngestionJob,
    updateIngestionJob,
    deleteIngestionJob,
    getIngestionJob,
    preparationJobs: state.preparationJobs,
    createPreparationJob,
    updatePreparationJob,
    deletePreparationJob,
    getPreparationJob,
    registryModels: state.registryModels,
    createRegistryModel,
    updateRegistryModel,
    deleteRegistryModel,
    getRegistryModel,
    deploymentJobs: state.deploymentJobs,
    createDeploymentJob,
    updateDeploymentJob,
    deleteDeploymentJob,
    getDeploymentJob,
    inferencingJobs: state.inferencingJobs,
    createInferencingJob,
    updateInferencingJob,
    deleteInferencingJob,
    getInferencingJob,
    monitoringJobs: state.monitoringJobs,
    createMonitoringJob,
    updateMonitoringJob,
    deleteMonitoringJob,
    getMonitoringJob,
    pipelineJobs: state.pipelineJobs,
    createPipelineJob,
    updatePipelineJob,
    deletePipelineJob,
    getPipelineJob,
    getPipelinesByProject,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within GlobalProvider');
  }
  return context;
};
