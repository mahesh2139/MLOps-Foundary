import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Play, Pause, RotateCcw, ArrowRight, CheckCircle, Clock, AlertCircle, Loader, Eye, GripVertical, Copy, Download, ChevronDown, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { useNotification } from '../hooks/useNotification';
import { themeClasses } from '../utils/themeClasses';

interface PipelineJob {
  jobId: string;
  jobType: 'ingestion' | 'preparation' | 'training' | 'registry' | 'deployment' | 'inferencing' | 'monitoring' | 'approval';
  jobName: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'approved' | 'rejected' | 'waiting';
  duration?: number;
  logs?: string[];
  approverNotes?: string;
  failureReason?: string;
}

interface Pipeline {
  id: string;
  projectId: string;
  name: string;
  jobs: PipelineJob[];
  status: 'created' | 'running' | 'completed' | 'failed' | 'waiting';
  progress: number;
  createdAt: string;
  executedAt?: string;
  totalDuration?: number;
  workflowYaml?: string;
  failureReason?: string;
  waitingAtJobIndex?: number;
}

interface MockLogEntry {
  timestamp: string;
  jobId: string;
  jobName: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface PendingApproval {
  id: string;
  pipelineId: string;
  pipelineName: string;
  jobId: string;
  jobName: string;
  approvalStepIndex: number;
  pipelineJobs: PipelineJob[];
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approverNotes?: string;
}

interface ApprovalHistory {
  id: string;
  pipelineId: string;
  pipelineName: string;
  jobName: string;
  status: 'approved' | 'rejected';
  requestedAt: string;
  decidedAt: string;
}

export default function Pipeline() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [pipelineName, setPipelineName] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<PipelineJob[]>([]);
  const [executingPipelineId, setExecutingPipelineId] = useState<string | null>(null);
  const [expandedPipelineId, setExpandedPipelineId] = useState<string | null>(null);
  const [pipelineLogs, setPipelineLogs] = useState<{ [pipelineId: string]: MockLogEntry[] }>({});
  const [showLogsPanel, setShowLogsPanel] = useState<string | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [pausedPipelines, setPausedPipelines] = useState<{ [pipelineId: string]: number }>({});
  const logsEndRef = useRef<HTMLDivElement>(null);
  const hasRestoredRef = useRef(false); // Track if we've already restored to prevent duplicate restores
  const runningPipelinesRef = useRef<{ [pipelineId: string]: { jobIndex: number; approvalId: string } }>({});
  const waitingPipelinePollingRef = useRef<{ [pipelineId: string]: NodeJS.Timeout }>({});

  // Robustly restore all pipeline state from localStorage on mount (ONLY ONCE)
  useEffect(() => {
    // Prevent duplicate restores caused by StrictMode or multiple mounts
    if (hasRestoredRef.current) {
      console.log('[Pipeline] Already restored, skipping duplicate restore');
      return;
    }
    hasRestoredRef.current = true;

    console.log('[Pipeline] Mount: Performing initial restore from localStorage');
    
    try {
      const stored = localStorage.getItem('pipelines');
      if (stored) {
        const loadedPipelines = JSON.parse(stored);
        if (Array.isArray(loadedPipelines) && loadedPipelines.length > 0) {
          setPipelines(loadedPipelines);
          console.log('[Pipeline] ✓ Restored', loadedPipelines.length, 'pipeline(s)');
        } else {
          console.log('[Pipeline] Storage is empty or not an array');
        }
      } else {
        console.log('[Pipeline] No pipelines stored in localStorage');
      }
    } catch (err) {
      console.error('[Pipeline] Failed to load pipelines from localStorage:', err);
    }

    try {
      const storedLogs = localStorage.getItem('pipeline-logs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        setPipelineLogs(parsedLogs);
      }
    } catch (err) {
      console.warn('[Pipeline] Failed to load pipeline logs from localStorage:', err);
    }

    try {
      const storedApprovals = localStorage.getItem('pending-pipeline-approvals');
      if (storedApprovals) {
        const loadedApprovals = JSON.parse(storedApprovals);
        if (Array.isArray(loadedApprovals)) {
          setPendingApprovals(loadedApprovals);
        }
      }
    } catch (err) {
      console.warn('[Pipeline] Failed to load pending approvals from localStorage:', err);
    }

    try {
      const storedHistory = localStorage.getItem('approval-history');
      if (storedHistory) {
        const loadedHistory = JSON.parse(storedHistory);
        if (Array.isArray(loadedHistory)) {
          setApprovalHistory(loadedHistory);
        }
      }
    } catch (err) {
      console.warn('[Pipeline] Failed to load approval history from localStorage:', err);
    }

    try {
      const storedUIState = localStorage.getItem('pipeline-ui-state');
      if (storedUIState) {
        const uiState = JSON.parse(storedUIState);
        if (uiState.expandedPipelineId) setExpandedPipelineId(uiState.expandedPipelineId);
        if (uiState.selectedPipelineId) setSelectedPipelineId(uiState.selectedPipelineId);
        if (uiState.showCreateModal) setShowCreateModal(uiState.showCreateModal);
        if (uiState.showLogsPanel) setShowLogsPanel(uiState.showLogsPanel);
      }
    } catch (err) {
      console.warn('[Pipeline] Failed to load pipeline UI state from localStorage:', err);
    }

    try {
      const storedBuilder = localStorage.getItem('pipeline-builder-state');
      if (storedBuilder) {
        const builder = JSON.parse(storedBuilder);
        if (builder.pipelineName) setPipelineName(builder.pipelineName);
        if (builder.selectedProjectId) setSelectedProjectId(builder.selectedProjectId);
        if (builder.selectedJobs && Array.isArray(builder.selectedJobs)) setSelectedJobs(builder.selectedJobs);
      }
    } catch (err) {
      console.warn('[Pipeline] Failed to load pipeline builder state from localStorage:', err);
    }
  }, []);

  // Save pipelines to localStorage immediately after any change
  // Use a separate effect that ensures writes happen synchronously
  useEffect(() => {
    if (pipelines.length > 0) {
      try {
        localStorage.setItem('pipelines', JSON.stringify(pipelines));
        console.log('[Pipeline] ✓ Persisted', pipelines.length, 'pipeline(s) to localStorage');
      } catch (err) {
        console.error('[Pipeline] CRITICAL: Failed to save pipelines to localStorage:', err);
      }
    }
  }, [pipelines]);

  // Save pipeline logs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('pipeline-logs', JSON.stringify(pipelineLogs));
    } catch (err) {
      console.warn('[Pipeline] Failed to save pipeline logs to localStorage:', err);
    }
  }, [pipelineLogs]);

  // Save pending approvals to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('pending-pipeline-approvals', JSON.stringify(pendingApprovals));
    } catch (err) {
      console.warn('[Pipeline] Failed to save pending approvals to localStorage:', err);
    }
  }, [pendingApprovals]);

  // Save approval history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('approval-history', JSON.stringify(approvalHistory));
    } catch (err) {
      console.warn('[Pipeline] Failed to save approval history to localStorage:', err);
    }
  }, [approvalHistory]);

  // Save UI state to localStorage to persist pipeline view across navigation
  useEffect(() => {
    try {
      const uiState = {
        expandedPipelineId,
        selectedPipelineId,
        showCreateModal,
        showLogsPanel,
      };
      localStorage.setItem('pipeline-ui-state', JSON.stringify(uiState));
    } catch (err) {
      console.warn('[Pipeline] Failed to save pipeline UI state to localStorage:', err);
    }
  }, [expandedPipelineId, selectedPipelineId, showCreateModal, showLogsPanel]);

  // Persist pipeline builder modal state (creation form)
  useEffect(() => {
    try {
      const builderState = {
        pipelineName,
        selectedProjectId,
        selectedJobs,
      };
      localStorage.setItem('pipeline-builder-state', JSON.stringify(builderState));
    } catch (err) {
      console.warn('[Pipeline] Failed to save pipeline builder state to localStorage:', err);
    }
  }, [pipelineName, selectedProjectId, selectedJobs]);

  // Defensive: Ensure data is synced to localStorage before component unmounts (on navigation)
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        if (pipelines.length > 0) {
          localStorage.setItem('pipelines', JSON.stringify(pipelines));
          console.log('[Pipeline] Pre-navigation sync: Saved', pipelines.length, 'pipeline(s)');
        }
      } catch (err) {
        console.error('[Pipeline] Failed to sync before navigation:', err);
      }
    };

    // Sync before page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pipelines]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [pipelineLogs, showLogsPanel]);

  // Monitor for approval completions and resume waiting pipelines - 5 second polling
  useEffect(() => {
    console.log('[Pipeline] 🔄 Approval monitoring effect mounted - 5 second poll cycle');
    
    const checkAndResumeApprovals = async () => {
      try {
        // Get all currently waiting pipelines
        const waitingPipelines = pipelines.filter(p => p.status === 'waiting');
        
        if (waitingPipelines.length === 0) {
          return;
        }

        console.log('[Pipeline] Checking', waitingPipelines.length, 'waiting pipeline(s) for approval status...');
        
        const storedApprovals = localStorage.getItem('pending-pipeline-approvals');
        if (!storedApprovals) {
          return;
        }

        const approvals = JSON.parse(storedApprovals) as PendingApproval[];
        console.log('[Pipeline] Found', approvals.length, 'pending approval(s)');
        
        // Check each approval for status changes
        for (const approval of approvals) {
          const correspondingPipeline = waitingPipelines.find(p => p.id === approval.pipelineId);
          
          if (!correspondingPipeline) {
            continue;
          }

          if (approval.status === 'approved') {
            console.log('[Pipeline] ✅ APPROVED DETECTED:', approval.id, '| Pipeline:', approval.pipelineId);
            console.log('[Pipeline] Removing from pending approvals and resuming pipeline...');
            
            // Remove this approval from pending
            const updated = approvals.filter((a: any) => a.id !== approval.id);
            localStorage.setItem('pending-pipeline-approvals', JSON.stringify(updated));
            setPendingApprovals(updated);
            
            // Add to history
            const historyEntry: ApprovalHistory = {
              id: approval.id,
              pipelineId: approval.pipelineId,
              pipelineName: approval.pipelineName,
              jobName: approval.jobName,
              status: 'approved',
              requestedAt: approval.requestedAt,
              decidedAt: new Date().toISOString(),
            };
            setApprovalHistory(prev => {
              const updated = [...prev, historyEntry];
              localStorage.setItem('approval-history', JSON.stringify(updated));
              return updated;
            });

            // Stop any polling for this pipeline
            if (waitingPipelinePollingRef.current[approval.pipelineId]) {
              console.log('[Pipeline] Clearing 30-second polling for:', approval.pipelineId);
              clearInterval(waitingPipelinePollingRef.current[approval.pipelineId]);
              delete waitingPipelinePollingRef.current[approval.pipelineId];
            }
            
            // Clean up the ref
            delete runningPipelinesRef.current[approval.pipelineId];
            
            console.log('[Pipeline] 🚀 NOW RESUMING Pipeline:', approval.pipelineId, '| from job index:', approval.approvalStepIndex);
            showNotification('✅ Approval granted! Pipeline resuming now...', 'success');
            
            // Resume the pipeline execution from where it paused
            await handleResumeAfterApproval(approval.pipelineId, approval.approvalStepIndex);
            
          } else if (approval.status === 'rejected') {
            console.log('[Pipeline] ❌ REJECTED DETECTED:', approval.id, '| Pipeline:', approval.pipelineId);
            
            // Remove this approval from pending
            const updated = approvals.filter((a: any) => a.id !== approval.id);
            localStorage.setItem('pending-pipeline-approvals', JSON.stringify(updated));
            setPendingApprovals(updated);
            
            // Add to history
            const historyEntry: ApprovalHistory = {
              id: approval.id,
              pipelineId: approval.pipelineId,
              pipelineName: approval.pipelineName,
              jobName: approval.jobName,
              status: 'rejected',
              requestedAt: approval.requestedAt,
              decidedAt: new Date().toISOString(),
            };
            setApprovalHistory(prev => {
              const updated = [...prev, historyEntry];
              localStorage.setItem('approval-history', JSON.stringify(updated));
              return updated;
            });

            // Mark pipeline as failed
            setPipelines(prev =>
              prev.map(p =>
                p.id === approval.pipelineId
                  ? { ...p, status: 'failed', progress: 0, failureReason: `Manual Approval rejected at step: ${approval.jobName}` }
                  : p
              )
            );
            
            // Stop any polling
            if (waitingPipelinePollingRef.current[approval.pipelineId]) {
              console.log('[Pipeline] Clearing 30-second polling for:', approval.pipelineId);
              clearInterval(waitingPipelinePollingRef.current[approval.pipelineId]);
              delete waitingPipelinePollingRef.current[approval.pipelineId];
            }
            
            delete runningPipelinesRef.current[approval.pipelineId];
            setExecutingPipelineId(null);
            showNotification('❌ Pipeline rejected at Manual Approval step', 'error');
          } else {
            // Status is still 'pending', log what we're waiting for
            console.log('[Pipeline] ⏳ Still waiting for approval:', approval.id, '| Status:', approval.status);
          }
        }
      } catch (err) {
        console.error('[Pipeline] Error in approval check:', err);
      }
    };

    // Poll every 1 second for approval status changes
    const interval = setInterval(checkAndResumeApprovals, 1000);
    
    // Also do one immediate check on mount
    checkAndResumeApprovals();
    
    return () => {
      console.log('[Pipeline] Clearing approval polling interval');
      clearInterval(interval);
    };
  }, [pipelines]);

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setPipelineName('');
    setSelectedProjectId('');
    setSelectedJobs([]);
    localStorage.removeItem('pipeline-builder-state');
  };

  // Get all available jobs for a project organized by type
  const getAvailableJobsByType = (projectId: string) => {
    const jobsByType: {
      [key: string]: Array<{ type: string; name: string; id: string; status: string }>
    } = {
      'Data Ingestion': [],
      'Data Preparation': [],
      'Model Registry': [],
      'Model Deployment': [],
      'Model Inferencing': [],
      'Model Monitoring': [],
    };

    global.ingestionJobs
      .filter(j => j.projectId === projectId)
      .forEach(j => jobsByType['Data Ingestion'].push({ type: 'ingestion', name: j.name, id: j.id, status: j.status }));

    global.preparationJobs
      .filter(j => j.projectId === projectId)
      .forEach(j => jobsByType['Data Preparation'].push({ type: 'preparation', name: j.name, id: j.id, status: j.status }));

    global.registryModels
      .filter(m => m.projectId === projectId)
      .forEach(m => jobsByType['Model Registry'].push({ type: 'registry', name: m.name, id: m.id, status: 'active' }));

    global.deploymentJobs
      .filter(j => j.projectId === projectId)
      .forEach(j => jobsByType['Model Deployment'].push({ type: 'deployment', name: j.name, id: j.id, status: j.status }));

    global.inferencingJobs
      .filter(j => j.projectId === projectId)
      .forEach(j => jobsByType['Model Inferencing'].push({ type: 'inferencing', name: j.name, id: j.id, status: j.status }));

    global.monitoringJobs
      .filter(j => j.projectId === projectId)
      .forEach(j => jobsByType['Model Monitoring'].push({ type: 'monitoring', name: j.name, id: j.id, status: j.status }));

    return jobsByType;
  };

  const getJobTypeColor = (type: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string; icon: string } } = {
      ingestion: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', icon: '📥' },
      preparation: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50', icon: '⚙️' },
      training: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', icon: '🧠' },
      registry: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50', icon: '📦' },
      deployment: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', icon: '🚀' },
      inferencing: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', icon: '🎯' },
      monitoring: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50', icon: '📊' },
      approval: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', icon: '✅' },
    };
    return colors[type] || { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/50', icon: '⚡' };
  };

  // Mock log generation functions
  const generateMockLogs = (jobType: string, jobName: string): string[] => {
    const logs: string[] = [];
    const timestamp = () => new Date().toLocaleTimeString();

    switch (jobType) {
      case 'ingestion':
        logs.push(`[${timestamp()}] Starting data ingestion: ${jobName}`);
        logs.push(`[${timestamp()}] Connecting to data source...`);
        logs.push(`[${timestamp()}] Validating data schema...`);
        logs.push(`[${timestamp()}] Loading 50000 records from source`);
        logs.push(`[${timestamp()}] Data ingestion completed successfully`);
        break;
      case 'preparation':
        logs.push(`[${timestamp()}] Starting data preparation: ${jobName}`);
        logs.push(`[${timestamp()}] Removing missing values...`);
        logs.push(`[${timestamp()}] Removed 1200 rows with null values`);
        logs.push(`[${timestamp()}] Normalizing numerical features...`);
        logs.push(`[${timestamp()}] Encoding categorical variables...`);
        logs.push(`[${timestamp()}] Feature engineering completed`);
        logs.push(`[${timestamp()}] Prepared dataset: 48800 rows × 25 columns`);
        break;
      case 'registry':
        logs.push(`[${timestamp()}] Registering model: ${jobName}`);
        logs.push(`[${timestamp()}] Loading model from artifact store...`);
        logs.push(`[${timestamp()}] Computing model fingerprint...`);
        logs.push(`[${timestamp()}] Creating model version tag`);
        logs.push(`[${timestamp()}] Model registered successfully`);
        logs.push(`[${timestamp()}] Version: 1.0.0 | Stage: production`);
        break;
      case 'deployment':
        logs.push(`[${timestamp()}] Starting deployment: ${jobName}`);
        logs.push(`[${timestamp()}] Building Docker image...`);
        logs.push(`[${timestamp()}] Image built successfully: mlops-model:latest`);
        logs.push(`[${timestamp()}] Pushing to container registry...`);
        logs.push(`[${timestamp()}] Creating Kubernetes deployment...`);
        logs.push(`[${timestamp()}] Service deployed and accessible`);
        logs.push(`[${timestamp()}] Deployment completed: http://localhost:8080`);
        break;
      case 'inferencing':
        logs.push(`[${timestamp()}] Starting inference: ${jobName}`);
        logs.push(`[${timestamp()}] Loading model from registry...`);
        logs.push(`[${timestamp()}] Processing batch of 5000 samples...`);
        logs.push(`[${timestamp()}] Inference completed on all samples`);
        logs.push(`[${timestamp()}] Average latency: 45ms per sample`);
        logs.push(`[${timestamp()}] Saving predictions to output store`);
        break;
      case 'monitoring':
        logs.push(`[${timestamp()}] Starting monitoring: ${jobName}`);
        logs.push(`[${timestamp()}] Collecting model metrics...`);
        logs.push(`[${timestamp()}] Accuracy: 0.947 | Precision: 0.923 | Recall: 0.931`);
        logs.push(`[${timestamp()}] Checking for data drift...`);
        logs.push(`[${timestamp()}] No significant drift detected`);
        logs.push(`[${timestamp()}] Monitoring metrics saved to dashboard`);
        break;
      default:
        logs.push(`[${timestamp()}] Processing job: ${jobName}`);
        logs.push(`[${timestamp()}] Execution completed`);
    }

    return logs;
  };

  const addLogEntry = (pipelineId: string, jobId: string, jobName: string, level: 'info' | 'success' | 'warning' | 'error', message: string) => {
    setPipelineLogs(prev => ({
      ...prev,
      [pipelineId]: [
        ...(prev[pipelineId] || []),
        {
          timestamp: new Date().toLocaleTimeString(),
          jobId,
          jobName,
          level,
          message
        }
      ]
    }));
  };

  const handleAddJob = (job: { type: string; name: string; id: string }) => {
    const newJob: PipelineJob = {
      jobId: job.id,
      jobType: job.type as any,
      jobName: job.name,
      projectId: selectedProjectId,
      status: 'pending',
      logs: [],
    };

    if (selectedJobs.find(j => j.jobId === job.id)) {
      showNotification('Job already added to pipeline', 'warning');
      return;
    }

    setSelectedJobs([...selectedJobs, newJob]);
    showNotification(`Added ${job.name} to pipeline`, 'success');
  };

  const handleRemoveJob = (jobId: string) => {
    setSelectedJobs(selectedJobs.filter(j => j.jobId !== jobId));
    showNotification('Job removed from pipeline', 'info');
  };

  const handleMoveJob = (fromIdx: number, toIdx: number) => {
    const newJobs = [...selectedJobs];
    const [moved] = newJobs.splice(fromIdx, 1);
    newJobs.splice(toIdx, 0, moved);
    setSelectedJobs(newJobs);
  };

  // Resume pipeline execution after approval is granted
  const handleResumeAfterApproval = async (pipelineId: string, resumeFromJobIndex: number) => {
    let pipeline = pipelines.find(p => p.id === pipelineId);
    
    // If pipeline not in current state, try to load from localStorage
    if (!pipeline) {
      console.log('[Pipeline] Pipeline not in current state, loading from localStorage:', pipelineId);
      const stored = localStorage.getItem(`pipeline-${pipelineId}`);
      if (stored) {
        try {
          pipeline = JSON.parse(stored);
          console.log('[Pipeline] ✓ Loaded pipeline from localStorage:', pipelineId);
          // Add to current state
          setPipelines(prev => [...prev, pipeline!]);
        } catch (err) {
          console.error('[Pipeline] Failed to parse pipeline from localStorage:', err);
          return;
        }
      } else {
        console.error('[Pipeline] Pipeline not found in state or localStorage:', pipelineId);
        return;
      }
    }

    console.log('[Pipeline] Resuming pipeline after approval:', pipelineId, 'from job index:', resumeFromJobIndex);
    setExecutingPipelineId(pipelineId);
    setExpandedPipelineId(pipelineId);
    addLogEntry(pipelineId, 'pipeline', 'System', 'success', `▶ Resuming pipeline after approval`);

    // Continue execution from the next job after the approval
    for (let i = resumeFromJobIndex + 1; i < pipeline!.jobs.length; i++) {
      const job = pipeline!.jobs[i];

      // Check if this is another approval job
      if (job.jobType === 'approval') {
        const approvalId = `approval-${pipelineId}-${i}-${Date.now()}`;
        const pendingApproval: PendingApproval = {
          id: approvalId,
          pipelineId,
          pipelineName: pipeline!.name,
          jobId: job.jobId,
          jobName: job.jobName,
          approvalStepIndex: i,
          pipelineJobs: pipeline!.jobs,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        };

        setPendingApprovals(prev => {
          const updated = [...prev, pendingApproval];
          localStorage.setItem('pending-pipeline-approvals', JSON.stringify(updated));
          return updated;
        });

        // Register this pipeline as waiting
        runningPipelinesRef.current[pipelineId] = { jobIndex: i, approvalId };

        // Update pipeline status to waiting and add to state if not present
        setPipelines(prev => {
          const exists = prev.some(p => p.id === pipelineId);
          if (!exists) {
            return [...prev, pipeline!];
          }
          return prev.map(p =>
            p.id === pipelineId
              ? { ...p, status: 'waiting', waitingAtJobIndex: i }
              : p
          );
        });

        addLogEntry(pipelineId, job.jobId, job.jobName, 'warning', `⏸ Pipeline paused - waiting for Manual Approval`);
        showNotification('Pipeline paused at Manual Approval step', 'warning');
        
        // Start polling for approval status every 30 seconds
        console.log('[Pipeline] Starting approval polling for:', pipelineId, 'Approval ID:', approvalId);
        const pollInterval = setInterval(() => {
          console.log('[Pipeline] Polling approval status for:', pipelineId, 'Approval ID:', approvalId);
          const stored = localStorage.getItem('pending-pipeline-approvals');
          if (stored) {
            const approvals = JSON.parse(stored) as PendingApproval[];
            const approval = approvals.find(a => a.id === approvalId);
            if (approval) {
              console.log('[Pipeline] Current approval status:', approval.status);
              if (approval.status === 'approved') {
                console.log('[Pipeline] ✓ Approval detected during polling! Clearing polling interval.');
                clearInterval(pollInterval);
              }
            }
          }
        }, 30000); // Check every 30 seconds
        
        waitingPipelinePollingRef.current[pipelineId] = pollInterval;
        
        // Exit - will resume again when this approval completes
        return;
      }

      // Execute regular job
      setPipelines(prev =>
        prev.map(p =>
          p.id === pipelineId
            ? {
                ...p,
                jobs: p.jobs.map((j, idx) =>
                  idx === i ? { ...j, status: 'running', logs: [`Starting ${j.jobName}...`] } : j
                ),
                status: 'running',
              }
            : p
        )
      );

      addLogEntry(pipelineId, job.jobId, job.jobName, 'info', `▶ Starting ${job.jobType} job: ${job.jobName}`);

      const mockLogs = generateMockLogs(job.jobType, job.jobName);
      const logInterval = 300;

      for (const logLine of mockLogs) {
        await new Promise(resolve => setTimeout(resolve, logInterval));
        addLogEntry(pipelineId, job.jobId, job.jobName, 'info', logLine);
      }

      setPipelines(prev =>
        prev.map(p =>
          p.id === pipelineId
            ? {
                ...p,
                jobs: p.jobs.map((j, idx) =>
                  idx === i
                    ? {
                        ...j,
                        status: 'completed',
                        duration: Math.random() * 3000 + 1000,
                        logs: mockLogs,
                      }
                    : j
                ),
                progress: ((i + 1) / pipeline!.jobs.length) * 100,
              }
            : p
        )
      );

      addLogEntry(pipelineId, job.jobId, job.jobName, 'success', `✓ ${job.jobName} completed successfully`);

      if (i < pipeline!.jobs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // All jobs completed
    setPipelines(prev =>
      prev.map(p =>
        p.id === pipelineId
          ? {
              ...p,
              status: 'completed',
              progress: 100,
              executedAt: new Date().toISOString(),
              totalDuration: Date.now() - new Date(p.createdAt).getTime(),
            }
          : p
      )
    );

    setExecutingPipelineId(null);
    addLogEntry(pipelineId, 'pipeline', 'System', 'success', `✓ Pipeline completed successfully! All ${pipeline!.jobs.length} jobs passed.`);
    showNotification('Pipeline completed successfully!', 'success');
  };

  const generateGitHubWorkflow = (jobs: PipelineJob[]): string => {
    const jobSteps = jobs.map((job, idx) => {
      const stepName = `${job.jobName} (${job.jobType})`;
      return `  - name: "${stepName}"
    run: |
      echo "Running ${job.jobType} job: ${job.jobName}"
      echo "Job ID: ${job.jobId}"
      # Add your actual job execution logic here`;
    }).join('\n\n');

    return `name: ML Pipeline - ${pipelineName}

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'  # Run every 6 hours

jobs:
  mlops-pipeline:
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 1
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      
${jobSteps}
      
      - name: Pipeline Summary
        run: |
          echo "Pipeline completed successfully!"
          echo "Total jobs executed: ${jobs.length}"
          echo "Status: Passed"
`;
  };

  const handleCreatePipeline = () => {
    if (!pipelineName || !selectedProjectId || selectedJobs.length === 0) {
      showNotification('Please fill all fields and add at least one job', 'warning');
      return;
    }

    const workflowYaml = generateGitHubWorkflow(selectedJobs);

    const newPipeline: Pipeline = {
      id: `pipeline-${Date.now()}`,
      projectId: selectedProjectId,
      name: pipelineName,
      jobs: selectedJobs,
      status: 'created',
      progress: 0,
      createdAt: new Date().toISOString(),
      workflowYaml,
    };

    const updatedPipelines = [...pipelines, newPipeline];
    // First update state
    setPipelines(updatedPipelines);
    // Then immediately persist to localStorage to ensure it's not lost
    try {
      localStorage.setItem('pipelines', JSON.stringify(updatedPipelines));
      console.log('[Pipeline] Pipeline saved to localStorage:', newPipeline.id);
    } catch (err) {
      console.error('[Pipeline] Failed to immediately persist new pipeline:', err);
      showNotification('Warning: Pipeline may not persist properly', 'warning');
    }
    
    showNotification('Pipeline created successfully!', 'success');
    handleCloseModal();
    setSelectedPipelineId(newPipeline.id);
    setExpandedPipelineId(newPipeline.id);
    localStorage.removeItem('pipeline-builder-state');
  };

  const handleExecutePipeline = async (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return;

    setExecutingPipelineId(pipelineId);
    setExpandedPipelineId(pipelineId);
    setPipelineLogs({ ...pipelineLogs, [pipelineId]: [] });
    showNotification('Pipeline execution started...', 'info');
    addLogEntry(pipelineId, 'pipeline', 'System', 'info', `▶ Starting pipeline execution: ${pipeline.name}`);

    for (let i = 0; i < pipeline.jobs.length; i++) {
      const job = pipeline.jobs[i];

      // Check if this is a manual approval job
      if (job.jobType === 'approval') {
        // Create a pending approval
        const approvalId = `approval-${pipelineId}-${i}-${Date.now()}`;
        const pendingApproval: PendingApproval = {
          id: approvalId,
          pipelineId,
          pipelineName: pipeline.name,
          jobId: job.jobId,
          jobName: job.jobName,
          approvalStepIndex: i,
          pipelineJobs: pipeline.jobs,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        };

        setPendingApprovals(prev => {
          const updated = [...prev, pendingApproval];
          // Store in localStorage for ManualApproval tab to access
          localStorage.setItem('pending-pipeline-approvals', JSON.stringify(updated));
          return updated;
        });
        setPausedPipelines(prev => ({ ...prev, [pipelineId]: i }));

        // Register this pipeline as waiting for approval
        runningPipelinesRef.current[pipelineId] = { jobIndex: i, approvalId };

        // Update pipeline status to waiting
        setPipelines(prev =>
          prev.map(p =>
            p.id === pipelineId
              ? { ...p, status: 'waiting', waitingAtJobIndex: i }
              : p
          )
        );

        addLogEntry(pipelineId, job.jobId, job.jobName, 'warning', `⏸ Pipeline paused - waiting for Manual Approval`);
        showNotification('Pipeline paused at Manual Approval step', 'warning');

        // Don't block here - the approval monitor will continue execution
        // Just return from execution and wait for the approval effect to resume
        return;
      }

      // Regular job execution
      setPipelines(prev =>
        prev.map(p =>
          p.id === pipelineId
            ? {
                ...p,
                jobs: p.jobs.map((j, idx) =>
                  idx === i ? { ...j, status: 'running', logs: [`Starting ${j.jobName}...`] } : j
                ),
                status: 'running',
              }
            : p
        )
      );

      addLogEntry(pipelineId, job.jobId, job.jobName, 'info', `▶ Starting ${job.jobType} job: ${job.jobName}`);

      const mockLogs = generateMockLogs(job.jobType, job.jobName);
      const logInterval = 300;

      for (const logLine of mockLogs) {
        await new Promise(resolve => setTimeout(resolve, logInterval));
        addLogEntry(pipelineId, job.jobId, job.jobName, 'info', logLine);
      }

      setPipelines(prev =>
        prev.map(p =>
          p.id === pipelineId
            ? {
                ...p,
                jobs: p.jobs.map((j, idx) =>
                  idx === i
                    ? {
                        ...j,
                        status: 'completed',
                        duration: Math.random() * 3000 + 1000,
                        logs: mockLogs,
                      }
                    : j
                ),
                progress: ((i + 1) / pipeline.jobs.length) * 100,
              }
            : p
        )
      );

      addLogEntry(pipelineId, job.jobId, job.jobName, 'success', `✓ ${job.jobName} completed successfully`);

      if (i < pipeline.jobs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setPipelines(prev =>
      prev.map(p =>
        p.id === pipelineId
          ? {
              ...p,
              status: 'completed',
              progress: 100,
              executedAt: new Date().toISOString(),
              totalDuration: Date.now() - new Date(p.createdAt).getTime(),
            }
          : p
      )
    );

    setExecutingPipelineId(null);
    addLogEntry(pipelineId, 'pipeline', 'System', 'success', `✓ Pipeline completed successfully! All ${pipeline.jobs.length} jobs passed.`);
    showNotification('Pipeline completed successfully!', 'success');
  };

  const handleDeletePipeline = (pipelineId: string) => {
    if (window.confirm('Are you sure you want to delete this pipeline? This action cannot be undone.')) {
      const updatedPipelines = pipelines.filter(p => p.id !== pipelineId);
      setPipelines(updatedPipelines);
      try {
        localStorage.setItem('pipelines', JSON.stringify(updatedPipelines));
        console.log('[Pipeline] ✓ Pipeline deleted:', pipelineId);
      } catch (err) {
        console.error('[Pipeline] Failed to delete pipeline from localStorage:', err);
      }
      showNotification('Pipeline deleted successfully', 'success');
      if (selectedPipelineId === pipelineId) {
        setSelectedPipelineId(null);
      }
      if (expandedPipelineId === pipelineId) {
        setExpandedPipelineId(null);
      }
    }
  };

  const handleDeleteApproval = (approvalId: string) => {
    if (window.confirm('Are you sure you want to delete this approval record?')) {
      setApprovalHistory(prev => {
        const updated = prev.filter(a => a.id !== approvalId);
        localStorage.setItem('approval-history', JSON.stringify(updated));
        return updated;
      });
      showNotification('Approval record deleted', 'success');
    }
  };

  const handleDownloadWorkflow = (pipeline: Pipeline) => {
    if (!pipeline.workflowYaml) return;

    const element = document.createElement('a');
    const file = new Blob([pipeline.workflowYaml], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = `${pipeline.name.replace(/\s+/g, '-')}-workflow.yml`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification('Workflow file downloaded', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-bold ${themeClasses.textPrimary(theme)} mb-2`}>ML Pipeline Orchestration</h1>
          <p className={themeClasses.textSecondary(theme)}>Create, visualize, and execute end-to-end ML workflows</p>
        </div>
        <button
          onClick={() => {
            setPipelineName('');
            setSelectedJobs([]);
            if (global.projects.length > 0) {
              setSelectedProjectId(global.projects[0].id);
            } else {
              setSelectedProjectId('');
            }
            setShowCreateModal(true);
          }}
          className={themeClasses.buttonPrimary(theme)}
        >
          <Plus size={20} />
          New Pipeline
        </button>
      </div>

      {/* Create Pipeline Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'} w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl`}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: theme === 'dark' ? '#3f3f46' : '#e5e7eb' }}>
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>Create New Pipeline</h2>
              <button onClick={handleCloseModal} className={`p-1 rounded transition ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                <X size={24} className={themeClasses.textSecondary(theme)} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Pipeline Name */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textPrimary(theme)} mb-2`}>
                  Pipeline Name *
                </label>
                <input
                  type="text"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  placeholder="e.g., Boston Housing Model Pipeline"
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textPrimary(theme)} mb-2`}>
                  Select Project *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setSelectedJobs([]);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                >
                  <option value="">Choose a project... ({global.projects.length} available)</option>
                  {global.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Job Selection by Category */}
              {selectedProjectId && (() => {
                const jobsByType = getAvailableJobsByType(selectedProjectId);
                const hasJobs = Object.values(jobsByType).some(jobs => jobs.length > 0);

                return (
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textPrimary(theme)} mb-3`}>
                        Configure Pipeline Workflow *
                      </label>
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => {
                            const approvalJob: PipelineJob = {
                              jobId: `approval-${Date.now()}`,
                              jobType: 'approval',
                              jobName: 'Manual Approval',
                              projectId: selectedProjectId,
                              status: 'pending',
                              logs: [],
                            };
                            setSelectedJobs([...selectedJobs, approvalJob]);
                            showNotification('Added Manual Approval step', 'success');
                          }}
                          className="px-3 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
                        >
                          ✅ Add Manual Approval
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                        {Object.entries(jobsByType).map(([category, jobs]) => (
                          <div key={category} className={`p-4 rounded-lg border ${
                            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                          }`}>
                            <h3 className={`text-sm font-bold ${themeClasses.textPrimary(theme)} mb-3`}>
                              {getJobTypeColor(jobs[0]?.type || 'approval').icon} {category} ({jobs.length})
                            </h3>
                            <div className="space-y-2">
                              {jobs.length === 0 ? (
                                <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>No jobs created yet</p>
                              ) : (
                                jobs.map(job => (
                                  <button
                                    key={job.id}
                                    onClick={() => handleAddJob(job)}
                                    className={`w-full p-2 rounded-lg text-left border-2 transition text-sm ${
                                      selectedJobs.find(j => j.jobId === job.id)
                                        ? theme === 'dark'
                                          ? 'border-blue-500 bg-blue-500/20'
                                          : 'border-blue-400 bg-blue-50'
                                        : theme === 'dark'
                                        ? 'border-slate-600 hover:border-slate-500'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {selectedJobs.find(j => j.jobId === job.id) && <CheckCircle size={14} className="text-blue-400" />}
                                      <span className="font-medium">{job.name}</span>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Graphical Pipeline Preview */}
                    {selectedJobs.length > 0 && (
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textPrimary(theme)} mb-3`}>
                          Pipeline Workflow ({selectedJobs.length} jobs)
                        </label>
                        <div className={`p-4 rounded-lg border-2 border-dashed ${
                          theme === 'dark' ? 'border-blue-500/50 bg-blue-500/5' : 'border-blue-400/50 bg-blue-50'
                        }`}>
                          <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {selectedJobs.map((job, idx) => (
                              <React.Fragment key={job.jobId}>
                                <div
                                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-center min-w-fit border-2 relative group ${
                                    theme === 'dark'
                                      ? `${getJobTypeColor(job.jobType).bg} border-slate-600`
                                      : `${getJobTypeColor(job.jobType).bg} border-slate-300`
                                  }`}
                                >
                                  <div className="text-xs font-bold text-center">
                                    <p className={getJobTypeColor(job.jobType).text}>{idx + 1}. {job.jobType.toUpperCase()}</p>
                                    <p className={`text-xs ${themeClasses.textPrimary(theme)}`}>{job.jobName.substring(0, 12)}{job.jobName.length > 12 ? '...' : ''}</p>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveJob(job.jobId)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                                {idx < selectedJobs.length - 1 && (
                                  <ArrowRight size={20} className={`flex-shrink-0 ${themeClasses.textSecondary(theme)}`} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>

                          {/* Job Ordering Controls */}
                          <div className="mt-4 space-y-2">
                            {selectedJobs.map((job, idx) => (
                              <div key={job.jobId} className={`flex items-center gap-3 p-2 rounded-lg ${
                                theme === 'dark' ? 'bg-slate-700' : 'bg-white border'
                              }`}>
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getJobTypeColor(job.jobType).bg} ${getJobTypeColor(job.jobType).text}`}>
                                  {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${themeClasses.textPrimary(theme)}`}>{job.jobName}</p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleMoveJob(idx, Math.max(0, idx - 1))}
                                    disabled={idx === 0}
                                    className={`p-1 rounded transition ${idx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-500/20'}`}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={() => handleMoveJob(idx, Math.min(selectedJobs.length - 1, idx + 1))}
                                    disabled={idx === selectedJobs.length - 1}
                                    className={`p-1 rounded transition ${idx === selectedJobs.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-500/20'}`}
                                  >
                                    ↓
                                  </button>
                                  <button
                                    onClick={() => handleRemoveJob(job.jobId)}
                                    className="p-1 hover:bg-red-500/20 rounded transition text-red-400"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t flex gap-3 justify-end" style={{ borderColor: theme === 'dark' ? '#3f3f46' : '#e5e7eb' }}>
              <button
                onClick={handleCloseModal}
                className={`px-4 py-2 rounded-lg transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePipeline}
                disabled={!pipelineName || !selectedProjectId || selectedJobs.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  !pipelineName || !selectedProjectId || selectedJobs.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : themeClasses.buttonPrimary(theme)
                }`}
              >
                <Plus size={18} className="inline mr-2" />
                Create Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipelines List */}
      <div className="space-y-4">
        <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)}`}>Created Pipelines</h2>

        {pipelines.length === 0 ? (
          <div className={`p-8 rounded-lg text-center ${themeClasses.card(theme)}`}>
            <p className={themeClasses.textSecondary(theme)}>No pipelines created yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pipelines.map(pipeline => (
              <div
                key={pipeline.id}
                className={`${themeClasses.card(theme)} overflow-hidden`}
              >
                {/* Pipeline Header */}
                <div className="p-6 border-b" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => setExpandedPipelineId(expandedPipelineId === pipeline.id ? null : pipeline.id)}
                        className={`transition ${themeClasses.textPrimary(theme)}`}
                      >
                        <ChevronDown size={24} className={`transition-transform ${expandedPipelineId === pipeline.id ? 'rotate-180' : ''}`} />
                      </button>
                      <div>
                        <h3 className={`text-xl font-bold ${themeClasses.textPrimary(theme)}`}>{pipeline.name}</h3>
                        <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>
                          {pipeline.jobs.length} job{pipeline.jobs.length !== 1 ? 's' : ''} • Created {new Date(pipeline.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        pipeline.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : pipeline.status === 'running'
                          ? 'bg-blue-500/20 text-blue-400'
                          : pipeline.status === 'waiting'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : pipeline.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {pipeline.status === 'waiting' ? '⏸ WAITING' : pipeline.status.toUpperCase()}
                      </span>
                      {pipeline.status === 'failed' && pipeline.failureReason && (
                        <span className="text-xs text-red-400" title={pipeline.failureReason}>
                          {pipeline.failureReason}
                        </span>
                      )}
                      <button
                        onClick={() => handleExecutePipeline(pipeline.id)}
                        disabled={executingPipelineId === pipeline.id}
                        className={`p-2 rounded-lg transition ${
                          executingPipelineId === pipeline.id
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-blue-500/20 text-blue-400'
                        }`}
                        title="Execute pipeline"
                      >
                        {executingPipelineId === pipeline.id ? <Loader size={20} className="animate-spin" /> : <Play size={20} />}
                      </button>
                      <button
                        onClick={() => handleDownloadWorkflow(pipeline)}
                        className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition"
                        title="Download GitHub Actions workflow"
                      >
                        <Download size={20} />
                      </button>
                      <button
                        onClick={() => handleDeletePipeline(pipeline.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                        title="Delete pipeline"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {pipeline.status === 'running' && (
                    <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pipeline.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Pipeline Content */}
                {expandedPipelineId === pipeline.id && (
                  <div className="p-6 space-y-4">
                    {/* Visual Pipeline */}
                    <div>
                      <h4 className={`font-semibold ${themeClasses.textPrimary(theme)} mb-3`}>Pipeline Workflow</h4>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {pipeline.jobs.map((job, idx) => (
                          <React.Fragment key={job.jobId}>
                            <button
                              onClick={() => setExpandedPipelineId(expandedPipelineId === pipeline.id ? null : pipeline.id)}
                              className={`flex-shrink-0 px-4 py-3 rounded-lg text-center min-w-fit border-2 transition cursor-pointer ${
                                job.status === 'completed'
                                  ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20'
                                  : job.status === 'running'
                                  ? 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
                                  : job.status === 'waiting'
                                  ? 'border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
                                  : job.status === 'failed'
                                  ? 'border-red-500 bg-red-500/10 hover:bg-red-500/20'
                                  : 'border-slate-500 bg-slate-500/10 hover:bg-slate-500/20'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {job.status === 'completed' && <CheckCircle size={16} className="text-green-400" />}
                                {job.status === 'running' && <Loader size={16} className="text-blue-400 animate-spin" />}
                                {job.status === 'waiting' && <Clock size={16} className="text-yellow-400" />}
                                {job.status === 'failed' && <AlertCircle size={16} className="text-red-400" />}
                                <div className="text-left">
                                  <p className={`text-xs font-bold ${getJobTypeColor(job.jobType).text}`}>{job.jobType.toUpperCase()}</p>
                                  <p className={`text-sm font-medium ${themeClasses.textPrimary(theme)}`}>{job.jobName}</p>
                                </div>
                              </div>
                            </button>
                            {idx < pipeline.jobs.length - 1 && (
                              <ArrowRight size={20} className={themeClasses.textSecondary(theme)} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Job Details */}
                    <div>
                      <h4 className={`font-semibold ${themeClasses.textPrimary(theme)} mb-3`}>Job Details</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {pipeline.jobs.map((job) => (
                          <div key={job.jobId} className={`p-3 rounded-lg border ${
                            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`font-medium ${themeClasses.textPrimary(theme)}`}>{job.jobName}</p>
                                <p className={`text-xs ${themeClasses.textSecondary(theme)}`}>
                                  Type: {job.jobType} • Status: {job.status} {job.duration && `• Duration: ${Math.round(job.duration)}ms`}
                                </p>
                              </div>
                              {job.status === 'completed' && (
                                <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GitHub Workflow */}
                    {pipeline.workflowYaml && (
                      <div>
                        <h4 className={`font-semibold ${themeClasses.textPrimary(theme)} mb-2`}>GitHub Actions Workflow</h4>
                        <pre className={`p-3 rounded-lg text-xs overflow-x-auto max-h-40 ${
                          theme === 'dark' ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {pipeline.workflowYaml.split('\n').slice(0, 15).join('\n')}...
                        </pre>
                      </div>
                    )}

                    {/* Summary */}
                    {pipeline.status === 'completed' && (
                      <div className={`p-4 rounded-lg border-2 border-green-500 bg-green-500/10`}>
                        <p className="text-green-400 font-semibold mb-2">✓ Pipeline Completed Successfully!</p>
                        <p className={`text-sm ${themeClasses.textSecondary(theme)}`}>
                          Total Duration: {Math.round((pipeline.totalDuration || 0) / 1000)}s • All {pipeline.jobs.length} jobs passed
                        </p>
                      </div>
                    )}

                    {/* Integrated Logs Panel */}
                    {pipelineLogs[pipeline.id] && pipelineLogs[pipeline.id].length > 0 && (
                      <div>
                        <h4 className={`font-semibold ${themeClasses.textPrimary(theme)} mb-3`}>Execution Logs</h4>
                        <div className={`border rounded-lg h-64 flex flex-col ${
                          theme === 'dark' ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
                        }`}>
                          <div className={`overflow-y-auto flex-1 p-4 font-mono text-xs`}>
                            {pipelineLogs[pipeline.id].map((entry, idx) => (
                              <div key={idx} className={`mb-1 ${
                                entry.level === 'success' ? 'text-green-400' :
                                entry.level === 'error' ? 'text-red-400' :
                                entry.level === 'warning' ? 'text-yellow-400' :
                                'text-slate-300'
                              }`}>
                                <span className="text-slate-500">[{entry.timestamp}]</span> <span className="text-blue-400">[{entry.jobName}]</span> {entry.message}
                              </div>
                            ))}
                            <div ref={logsEndRef} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logs Panel - Bottom Window */}
      {/* Removed: Logs are now integrated into each pipeline's expanded view */}
    </div>
  );
}
