import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import { GlobalProvider } from './contexts/GlobalContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationContainer } from './components/NotificationContainer';
import { Clock, RefreshCw } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import DataIngestion from './pages/DataIngestion';
import DataPreparation from './pages/DataPreparation';
import ModelRegistry from './pages/ModelRegistry';
import Deployment from './pages/Deployment';
import Inferencing from './pages/Inferencing';
import ManualApprovals from './pages/ManualApprovals';
import Pipeline from './pages/Pipeline';
// import Pipelines from './pages/Pipelines';
import Monitoring from './pages/Monitoring';
import Integrations from './pages/Integrations';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Workflow from './App';
import TopBarEnhanced from './components/TopBarEnhanced';
import LeftNavigation from './components/LeftNavigation';
import Documentation from './pages/Documentation';
import Training from './pages/Training';
import SupportContacts from './pages/SupportContacts';
import SendFeedback from './pages/SendFeedback';

/**
 * Session Warning Banner Component
 */
const SessionWarningBanner: React.FC = () => {
  const { sessionWarning, timeUntilExpiry, extendSession } = useAuth();

  if (!sessionWarning || timeUntilExpiry === null) return null;

  const hours = Math.floor(timeUntilExpiry / 3600);
  const minutes = Math.floor((timeUntilExpiry % 3600) / 60);

  return (
    <div className="fixed top-20 left-0 right-0 z-[1000] mx-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/50 rounded-lg p-4 backdrop-blur-md md:ml-64">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-200 font-semibold text-sm">Your session expires in {hours}h {minutes}m</p>
            <p className="text-amber-300/70 text-xs">Your login session will expire due to inactivity.</p>
          </div>
        </div>
        <button
          onClick={extendSession}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all duration-200 flex-shrink-0 text-sm font-medium"
        >
          <RefreshCw size={16} />
          Extend Session
        </button>
      </div>
    </div>
  );
};

/**
 * Main Layout with Left Sidebar + Top Bar
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  const bgClass = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100';

  const textColorClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const secondaryTextClass = theme === 'dark' ? 'text-white/60' : 'text-slate-600';
  const borderClass = theme === 'dark' ? 'border-white/10' : 'border-slate-200';
  const bgSecondaryClass = theme === 'dark' ? 'bg-white/5' : 'bg-slate-100/40';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Session Warning Banner */}
      <SessionWarningBanner />

      {/* Top Bar */}
      <TopBarEnhanced />

      {/* Left Sidebar Navigation */}
      <LeftNavigation />

      {/* Main Content Area */}
      <main className="pt-20 md:pt-20 md:pl-64 transition-all duration-300">
        <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>

      {/* Notifications */}
      <NotificationContainer />

      {/* Footer */}
      <footer className={`border-t ${borderClass} ${bgSecondaryClass} mt-12 md:ml-64 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <p className={`${textColorClass} font-bold transition-colors`}>MLOps Studio v1.0</p>
              <p className={`${secondaryTextClass} text-sm transition-colors`}>Production ML Operations</p>
            </div>
            <div>
              <p className={`${secondaryTextClass} text-sm transition-colors`}>© 2026 ML Ops team. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/**
 * App Routes Component
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  const loadingBgClass = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100';

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-screen ${loadingBgClass} transition-colors duration-300`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4 ${
            theme === 'dark' ? 'border-white/30 border-t-white' : 'border-slate-300 border-t-blue-600'
          }`}></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/data-ingestion" element={<DataIngestion />} />
        <Route path="/data-preparation" element={<DataPreparation />} />
        <Route path="/model-registry" element={<ModelRegistry />} />
        <Route path="/deployment" element={<Deployment />} />
        <Route path="/inferencing" element={<Inferencing />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/pipelines" element={<Pipeline />} />
        <Route path="/manual-approvals" element={<ManualApprovals />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/training" element={<Training />} />
        <Route path="/support-contacts" element={<SupportContacts />} />
        <Route path="/send-feedback" element={<SendFeedback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

/**
 * Root App Component with Providers
 */
export default function AppRouter() {
  const basename = import.meta.env.MODE === 'production' 
    ? window.location.pathname.split('/').length > 2 
      ? '/' + window.location.pathname.split('/')[1]
      : '/'
    : '/';
  
  try {
    return (
      <ErrorBoundary>
        <Router basename={basename}>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                <NotificationProvider>
                  <GlobalProvider>
                    <AppRoutes />
                  </GlobalProvider>
                </NotificationProvider>
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </Router>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('❌ AppRouter fatal error:', error);
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        <h1>Error Loading App</h1>
        <p>{String(error)}</p>
      </div>
    );
  }
}

