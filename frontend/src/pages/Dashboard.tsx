import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Package, GitBranch, AlertCircle, RefreshCw, Database, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import { APIClient } from '../services/APIClient';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb, SkeletonLoader } from '../components/UIPatterns';
import { themeClasses } from '../utils/themeClasses';

interface DashboardStats {
  projectCount: number;
  pipelineCount: number;
  deploymentCount: number;
  alertCount: number;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const global = useGlobal();
  const { showNotification } = useNotification();
  const [stats, setStats] = useState<DashboardStats>({
    projectCount: 0,
    pipelineCount: 0,
    deploymentCount: 0,
    alertCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use GlobalContext data instead of API
      setStats({
        projectCount: global.projects.length,
        pipelineCount: global.pipelineJobs.length,
        deploymentCount: global.deploymentJobs.length,
        alertCount: global.monitoringJobs.filter(m => m.metrics?.dataDrift && m.metrics.dataDrift > 0.25).length,
      });
    } catch (err) {
      console.warn('Failed to load dashboard data:', err);
      setStats({
        projectCount: global.projects.length,
        pipelineCount: 0,
        deploymentCount: 0,
        alertCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartDemo = async () => {
    setDemoRunning(true);
    showNotification('Starting quick demo...', 'info');

    try {
      console.log('🚀 Starting demo creation...');
      // Step 1: Create sample project
      const project = global.createProject({
        name: 'Boston Housing Model',
        description: 'Predict house prices using ML',
        environment: 'dev',
        status: 'active',
        code: [],
      });

      console.log('✅ Project created:', project);
      console.log('   Project ID:', project.id);
      showNotification('Created sample project', 'success');

      // Step 2: Create data ingestion job
      const ingestionJob = global.createIngestionJob({
        name: 'Load Boston Housing Data',
        projectId: project.id,
        dataSource: 'csv',
        status: 'completed',
        outputPath: '/data/boston_housing.csv',
        outputShape: { rows: 506, columns: 13 },
        outputColumns: ['CRIM', 'ZN', 'INDUS', 'CHAS', 'NOX', 'RM', 'AGE', 'DIS', 'RAD', 'TAX', 'PTRATIO', 'B', 'LSTAT'],
        lastRun: new Date().toISOString(),
      });

      console.log('✅ Ingestion job created:', ingestionJob);
      console.log('   Ingestion projectId:', ingestionJob.projectId);
      showNotification('Data ingestion job created', 'success');

      // Step 3: Create data preparation job
      const prepJob = global.createPreparationJob({
        name: 'Prepare Features',
        projectId: project.id,
        ingestionJobId: ingestionJob.id,
        status: 'completed',
        outputPath: '/data/prepared_features.csv',
        outputShape: { rows: 506, columns: 13 },
        outputColumns: ['CRIM', 'ZN', 'INDUS', 'CHAS', 'NOX', 'RM', 'AGE', 'DIS', 'RAD', 'TAX', 'PTRATIO', 'B', 'PRICE'],
        lastRun: new Date().toISOString(),
      });

      console.log('✅ Preparation job created:', prepJob);
      showNotification('Data preparation job created', 'success');

      // Step 4: Register model
      const model = global.createRegistryModel({
        name: 'Boston Price Predictor',
        version: '1.0.0',
        projectId: project.id,
        modelType: 'regression',
        stage: 'production',
        status: 'active',
        metrics: {
          accuracy: 0.73,
          precision: 0.72,
          recall: 0.74,
        },
      });

      showNotification('Model registered in registry', 'success');

      console.log('✅ Deployment job creating...');
      const deploymentJob = global.createDeploymentJob({
        name: 'Deploy to Production',
        projectId: project.id,
        modelId: model.id,
        environment: 'prod',
        containerName: 'boston-model-prod',
        status: 'active',
        lastDeployed: new Date().toISOString(),
      });

      showNotification('Model deployed successfully', 'success');

      console.log('✅ Deployment job created:', deploymentJob);

      // Step 6: Create inferencing job
      const inferencingJob = global.createInferencingJob({
        name: 'Weekly Price Predictions',
        projectId: project.id,
        modelId: model.id,
        inputDatasetId: prepJob.id,
        status: 'completed',
        outputPath: '/results/predictions.csv',
        predictions: Array.from({ length: 100 }, () => ({
          prediction: Math.random() * 50 + 10,
          confidence: Math.random() * 0.3 + 0.75,
        })),
        lastRun: new Date().toISOString(),
      });

      showNotification('Inferencing job created', 'success');

      // Step 7: Create monitoring job
      const monitoringJob = global.createMonitoringJob({
        name: 'Production Model Monitor',
        projectId: project.id,
        modelId: model.id,
        inputDatasetId: prepJob.id,
        metrics: {
          dataDrift: 0.08,
          modelDrift: 0.05,
          performanceDegradation: 0.03,
          lastChecked: new Date().toISOString(),
        },
        status: 'completed',
        lastRun: new Date().toISOString(),
      });

      showNotification('Monitoring job created', 'success');

      // Wait a moment for state to fully propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Final verification - check localStorage directly
      const storedState = JSON.parse(localStorage.getItem('mlops_studio_state') || '{}');
      console.log('\n🎉 DEMO COMPLETE! Checking stored state:');
      console.log('Project:', project.id, project.name);
      console.log('Stored ingestion jobs:', storedState.ingestionJobs?.length || 0, storedState.ingestionJobs);
      console.log('Stored preparation jobs:', storedState.preparationJobs?.length || 0, storedState.preparationJobs);
      console.log('Stored registry models:', storedState.registryModels?.length || 0, storedState.registryModels);
      console.log('Stored deployment jobs:', storedState.deploymentJobs?.length || 0, storedState.deploymentJobs);
      console.log('Stored inferencing jobs:', storedState.inferencingJobs?.length || 0, storedState.inferencingJobs);
      console.log('Stored monitoring jobs:', storedState.monitoringJobs?.length || 0, storedState.monitoringJobs);

      // Reload stats
      await loadDashboardData();

      showNotification('Demo completed! Explore the created pipeline in all sections.', 'success');
    } catch (err) {
      console.error('Demo error:', err);
      showNotification('Error creating demo: ' + (err as any).message, 'error');
    } finally {
      setDemoRunning(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [global.projects.length, global.deploymentJobs.length, global.pipelineJobs.length]);

  const StatCard = ({ icon: Icon, label, value, unit = '' }: { icon: any; label: string; value: number | string; unit?: string }) => (
    <div className={themeClasses.card(theme)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`${themeClasses.textSecondary(theme)} text-sm mb-2`}>{label}</p>
          <p className={`text-3xl font-bold ${themeClasses.textPrimary(theme)}`}>{value}{unit}</p>
        </div>
        <Icon size={32} className={themeClasses.iconDefault(theme)} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-bold ${themeClasses.textPrimary(theme)} mb-2`}>Dashboard</h1>
          <p className={themeClasses.textSecondary(theme)}>Welcome to MLOps Studio - Monitor your ML operations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleStartDemo}
            disabled={demoRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
              demoRunning
                ? `${theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'}`
                : `${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'} text-white`
            }`}
            title="Creates sample project with complete ML pipeline"
          >
            <Sparkles size={18} className={demoRunning ? 'animate-spin' : ''} />
            {demoRunning ? 'Setting up...' : 'Start Demo'}
          </button>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className={`flex items-center gap-2 ${themeClasses.buttonPrimary(theme)}`}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Demo Info */}
      <div className={`rounded-lg border backdrop-blur-sm p-4 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30'
          : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300'
      }`}>
        <div className="flex items-start gap-3">
          <Sparkles className={`flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
          <div>
            <p className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Quick Demo Available</p>
            <p className={`text-sm ${themeClasses.textSecondary(theme)} mt-1`}>
              Click "Start Demo" to automatically create a complete ML pipeline with Boston Housing dataset, including data ingestion, preparation, model registry, deployment, inferencing, and monitoring jobs.
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className={`p-4 ${themeClasses.alertError(theme)} rounded-lg flex items-start gap-3`}>
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className={`${themeClasses.textPrimary(theme)} font-medium`}>Error Loading Dashboard</p>
            <p className={`${themeClasses.textSecondary(theme)} text-sm mt-1`}>{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <>
          <SkeletonLoader count={4} variant="card" />
          <SkeletonLoader count={1} variant="card" />
        </>
      )}

      {/* Stats Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Database} label="Active Projects" value={stats.projectCount} />
            <StatCard icon={GitBranch} label="Pipelines" value={stats.pipelineCount} />
            <StatCard icon={Package} label="Deployments" value={stats.deploymentCount} />
            <StatCard icon={AlertCircle} label="Active Alerts" value={stats.alertCount} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/projects"
              className={`p-6 rounded-xl transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-blue-600/20 to-blue-400/10 hover:from-blue-600/30 hover:to-blue-400/20 border border-blue-400/30'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-100 border border-blue-300 shadow-sm'
              }`}
            >
              <Database size={24} className={`mb-2 group-hover:translate-x-1 transition-transform ${themeClasses.iconDefault(theme)}`} />
              <h3 className={`${themeClasses.textPrimary(theme)} font-bold mb-1`}>Manage Projects</h3>
              <p className={themeClasses.textSecondary(theme)}>Create and manage ML projects</p>
            </Link>

            <Link
              to="/pipelines"
              className={`p-6 rounded-xl transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-purple-600/20 to-purple-400/10 hover:from-purple-600/30 hover:to-purple-400/20 border border-purple-400/30'
                  : 'bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-100 border border-purple-300 shadow-sm'
              }`}
            >
              <GitBranch size={24} className={`mb-2 group-hover:translate-x-1 transition-transform ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              <h3 className={`${themeClasses.textPrimary(theme)} font-bold mb-1`}>View Pipelines</h3>
              <p className={themeClasses.textSecondary(theme)}>Monitor pipeline execution and DAG</p>
            </Link>

            <Link
              to="/monitoring"
              className={`p-6 rounded-xl transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-green-400 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-green-600/20 to-green-400/10 hover:from-green-600/30 hover:to-green-400/20 border border-green-400/30'
                  : 'bg-gradient-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-100 border border-green-300 shadow-sm'
              }`}
            >
              <BarChart3 size={24} className={`mb-2 group-hover:translate-x-1 transition-transform ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`${themeClasses.textPrimary(theme)} font-bold mb-1`}>Monitoring</h3>
              <p className={themeClasses.textSecondary(theme)}>View metrics and drift detection</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
