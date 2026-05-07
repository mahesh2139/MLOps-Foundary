import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themeClasses } from '../utils/themeClasses';

const Training: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-4xl font-bold ${themeClasses.textPrimary(theme)} mb-2`}>Training & Tutorials</h1>
        <p className={themeClasses.textSecondary(theme)}>Learn how to use MLOps Studio through step-by-step guides and tutorials</p>
      </div>

      <div className="grid gap-6">
        {/* Quick Start */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>⚡ Quick Start Guide</h2>
          <div className={`space-y-4 ${themeClasses.textSecondary(theme)}`}>
            <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Step 1: Create a Project</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Navigate to the "Projects" tab</li>
              <li>Click "New Project"</li>
              <li>Enter your project name and description</li>
              <li>Click "Create" to initialize the project</li>
            </ol>

            <h3 className={`font-semibold ${themeClasses.textPrimary(theme)} mt-4`}>Step 2: Ingest Data</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>In your project, click "Data Ingestion"</li>
              <li>Select your data source (CSV, Parquet, Database)</li>
              <li>Upload or connect to your data</li>
              <li>Validate the schema and preview the data</li>
              <li>Click "Confirm" to ingest</li>
            </ol>

            <h3 className={`font-semibold ${themeClasses.textPrimary(theme)} mt-4`}>Step 3: Prepare Data</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Click "Data Preparation" in your project</li>
              <li>Select transformations you want to apply</li>
              <li>Preview the transformed data</li>
              <li>Click "Apply" to save transformations</li>
            </ol>

            <h3 className={`font-semibold ${themeClasses.textPrimary(theme)} mt-4`}>Step 4: Train Model</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Click "Model Training" in your project</li>
              <li>Select algorithm (Linear Regression, Decision Tree, etc.)</li>
              <li>Configure hyperparameters</li>
              <li>Click "Train" and monitor progress</li>
              <li>View training metrics when complete</li>
            </ol>

            <h3 className={`font-semibold ${themeClasses.textPrimary(theme)} mt-4`}>Step 5: Deploy Model</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Click "Model Deployment" in your project</li>
              <li>Select the trained model to deploy</li>
              <li>Choose target environment (dev, staging, prod)</li>
              <li>Click "Deploy" and confirm</li>
              <li>Monitor deployment status</li>
            </ol>
          </div>
        </div>

        {/* Pipeline Tutorial */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>🔄 Creating Your First Pipeline</h2>
          <div className={`space-y-4 ${themeClasses.textSecondary(theme)}`}>
            <p>Automate your entire ML workflow with pipelines. This tutorial shows a complete example.</p>
            
            <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Example: Boston Housing Training Pipeline</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Go to the "Pipelines" tab</li>
              <li>Click "New Pipeline"</li>
              <li>Name it "Boston Housing Training"</li>
              <li>Add these jobs in order:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Data Ingestion (boston-housing.csv)</li>
                  <li>Data Preparation (scaling + encoding)</li>
                  <li>Model Training (Linear Regression)</li>
                  <li>Model Evaluation</li>
                  <li>Manual Approval (optional - for oversight)</li>
                  <li>Model Deployment (to staging)</li>
                </ul>
              </li>
              <li>Click "Create Pipeline"</li>
              <li>Click the Play button to execute</li>
              <li>Watch real-time logs at the bottom</li>
              <li>Your model will automatically deploy upon completion</li>
            </ol>
          </div>
        </div>

        {/* Best Practices */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>✅ Best Practices</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>🏗️ Pipeline Design</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Keep jobs focused and single-purpose</li>
                <li>Use meaningful names for clarity</li>
                <li>Add manual approvals before critical steps</li>
                <li>Test pipelines in development first</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary(theme)} mt-3`}>📈 Model Management</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Always version your models</li>
                <li>Track hyperparameters with each version</li>
                <li>Compare model metrics before deployment</li>
                <li>Keep production model stable</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary(theme)} mt-3`}>🔍 Monitoring</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Monitor model performance regularly</li>
                <li>Set up drift detection alerts</li>
                <li>Review logs for failures</li>
                <li>Retrain models when performance degrades</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Common Workflows */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>🎯 Common Workflows</h2>
          <div className={`space-y-4 ${themeClasses.textSecondary(theme)}`}>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Workflow 1: Daily Model Retraining</h3>
              <p className="ml-2">Create a scheduled pipeline that ingests new data daily, retrains the model, evaluates performance, and deploys if improved.</p>
            </div>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Workflow 2: A/B Testing</h3>
              <p className="ml-2">Deploy two model versions simultaneously and compare performance metrics before rolling out the winner to production.</p>
            </div>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Workflow 3: Experiment Tracking</h3>
              <p className="ml-2">Run multiple experiments with different hyperparameters, compare results, and automatically promote the best performer.</p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-3`}>🔧 Troubleshooting</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Pipeline stopped unexpectedly?</h3>
              <p className="ml-2">Check the logs at the bottom of the screen. Look for error messages indicating which job failed and why.</p>
            </div>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Approval step not responding?</h3>
              <p className="ml-2">Refresh the page. The approval status will be detected automatically and pipeline will resume.</p>
            </div>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Model deployment failed?</h3>
              <p className="ml-2">Verify model compatibility and target environment availability. Check deployment logs for details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
