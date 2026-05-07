import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themeClasses } from '../utils/themeClasses';

const Documentation: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-4xl font-bold ${themeClasses.textPrimary(theme)} mb-2`}>Documentation</h1>
        <p className={themeClasses.textSecondary(theme)}>Complete guide to MLOps Studio features and workflows</p>
      </div>

      <div className="grid gap-6">
        {/* Getting Started */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>🚀 Getting Started</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <p>MLOps Studio is a comprehensive platform for managing machine learning operations, from data ingestion to model monitoring.</p>
            <h3 className={`font-semibold ${themeClasses.textPrimary(theme)} mt-4`}>Key Features:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Data Ingestion:</strong> Load and validate data from multiple sources</li>
              <li><strong>Data Preparation:</strong> Clean, transform, and prepare data for training</li>
              <li><strong>Model Registry:</strong> Version and manage trained models</li>
              <li><strong>Deployment:</strong> Deploy models to production environments</li>
              <li><strong>Inferencing:</strong> Run predictions using deployed models</li>
              <li><strong>Monitoring:</strong> Track model performance and detect data drift</li>
              <li><strong>Pipeline Orchestration:</strong> Chain jobs into automated workflows</li>
            </ul>
          </div>
        </div>

        {/* Pipelines */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>⚙️ Pipeline Orchestration</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <p>Pipelines allow you to automate complex ML workflows by chaining multiple jobs in sequence.</p>
            <h3 className={`font-semibold ${themeClasses.textPrimary(theme)} mt-4`}>Creating a Pipeline:</h3>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Click "New Pipeline" button</li>
              <li>Enter a pipeline name (e.g., "Boston Housing Training")</li>
              <li>Select the project to run against</li>
              <li>Add jobs in desired order (jobs will execute sequentially)</li>
              <li>Optionally add Manual Approval steps for oversight</li>
              <li>Click "Create Pipeline"</li>
            </ol>
            <h3 className={`font-semibold ${themeClasses.textPrimary(theme)} mt-4`}>Execution:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click the Play button to execute a pipeline</li>
              <li>Monitor progress in the expanded pipeline view</li>
              <li>View real-time logs at the bottom of the screen</li>
              <li>Manual approval steps will pause execution until approved</li>
            </ul>
          </div>
        </div>

        {/* Data Management */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>📊 Data Management</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <p><strong>Data Ingestion:</strong> Import data from CSV, Parquet, or database sources. Validate schema and data types.</p>
            <p><strong>Data Preparation:</strong> Apply transformations including scaling, encoding, handling missing values, and feature engineering.</p>
            <p><strong>Best Practices:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Always validate data quality before training</li>
              <li>Use consistent preprocessing for training and inference</li>
              <li>Version your datasets along with models</li>
              <li>Monitor for data drift in production</li>
            </ul>
          </div>
        </div>

        {/* Model Lifecycle */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>🧠 Model Lifecycle</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <p><strong>Model Registry:</strong> Centralized repository for all trained models. Track versions, metrics, and metadata.</p>
            <p><strong>Deployment:</strong> Deploy registered models to development, staging, or production environments.</p>
            <p><strong>Monitoring:</strong> Continuously track model performance metrics and detect data drift or model degradation.</p>
            <p><strong>Retraining:</strong> Use pipelines to automate periodic model retraining with new data.</p>
          </div>
        </div>

        {/* Advanced Topics */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>🔧 Advanced Topics</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <p><strong>Manual Approvals:</strong> Pause pipeline execution to review and approve critical steps before proceeding.</p>
            <p><strong>GitHub Actions Integration:</strong> Download pipeline definitions as GitHub Actions workflows for CI/CD integration.</p>
            <p><strong>Logs & Debugging:</strong> Access detailed execution logs for each job to troubleshoot issues.</p>
            <p><strong>API Integration:</strong> Integrate with external systems via REST APIs for data and model management.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
