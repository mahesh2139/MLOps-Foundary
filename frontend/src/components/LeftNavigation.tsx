import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Folder,
  Database,
  Filter,
  Package,
  Server,
  Eye,
  TrendingUp,
  Zap,
  CheckCircle,
  Settings,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import Logo from './Logo';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredRoles?: string[];
}

const LeftNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Define navigation items with role-based visibility
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'projects',
      label: 'Projects',
      path: '/projects',
      icon: <Folder size={20} />,
      requiredRoles: ['admin', 'ml-engineer', 'data-engineer'],
    },
    {
      id: 'data-ingestion',
      label: 'Data Ingestion',
      path: '/data-ingestion',
      icon: <Database size={20} />,
      requiredRoles: ['admin', 'data-engineer'],
    },
    {
      id: 'data-preparation',
      label: 'Data Preparation',
      path: '/data-preparation',
      icon: <Filter size={20} />,
      requiredRoles: ['admin', 'data-engineer', 'ml-engineer'],
    },
    {
      id: 'model-registry',
      label: 'Model Registry',
      path: '/model-registry',
      icon: <Package size={20} />,
      requiredRoles: ['admin', 'ml-engineer'],
    },
    {
      id: 'deployment',
      label: 'Model Deployment',
      path: '/deployment',
      icon: <Server size={20} />,
      requiredRoles: ['admin', 'ml-engineer', 'prod-team'],
    },
    {
      id: 'inferencing',
      label: 'Model Inferencing',
      path: '/inferencing',
      icon: <Eye size={20} />,
      requiredRoles: ['admin', 'ml-engineer', 'prod-team'],
    },
    {
      id: 'monitoring',
      label: 'Model Monitoring',
      path: '/monitoring',
      icon: <TrendingUp size={20} />,
      requiredRoles: ['admin', 'ml-engineer', 'monitoring-team'],
    },
    {
      id: 'pipelines',
      label: 'Pipelines',
      path: '/pipelines',
      icon: <Zap size={20} />,
      requiredRoles: ['admin', 'ml-engineer'],
    },
    {
      id: 'manual-approvals',
      label: 'Manual Approvals',
      path: '/manual-approvals',
      icon: <CheckCircle size={20} />,
      requiredRoles: ['admin', 'prod-team', 'ml-engineer'],
    },
    {
      id: 'integrations',
      label: 'Integrations',
      path: '/integrations',
      icon: <Zap size={20} />,
      requiredRoles: ['admin'],
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: <Settings size={20} />,
    },
    {
      id: 'admin',
      label: 'Admin',
      path: '/admin',
      icon: <Settings size={20} />,
      requiredRoles: ['admin'],
    },
  ];

  // Filter items based on user role
  const visibleItems = navItems.filter(item => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.includes(user?.role || '');
  });

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={`flex items-center justify-between p-4 border-b transition-colors ${
        theme === 'dark' ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <Logo size="md" />
          {!isCollapsed && <span className={`text-sm font-bold hidden md:block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>MLOps</span>}
        </div>
        {/* Collapse button (desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:block p-1 rounded transition ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronDown size={16} className={`transition-transform ${isCollapsed ? 'rotate-90' : '-rotate-90'} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} />
        </button>
        {/* Close button (mobile only) */}
        <button
          onClick={() => setMobileOpen(false)}
          className={`md:hidden p-1 rounded transition ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
        >
          <X size={20} className={theme === 'dark' ? 'text-white' : 'text-slate-900'} />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-2 px-3">
          {visibleItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                isActive(item.path)
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border border-blue-400/50'
                    : 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 text-slate-900 border border-blue-400/50'
                  : theme === 'dark'
                  ? 'text-white/70 hover:bg-white/10 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive(item.path) && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'}`} />
                  )}
                </>
              )}
              {isCollapsed && (
                <div className={`absolute left-full ml-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none ${
                  theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-200 text-slate-900'
                }`}>
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={`border-t p-4 mt-auto transition-colors ${
        theme === 'dark' ? 'border-white/10 text-white/60' : 'border-slate-200 text-slate-600'
      }`}>
        {!isCollapsed && (
          <div className="text-xs text-center">
            <p className={`font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-900'}`}>{user?.name}</p>
            <p className={`capitalize ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{user?.role}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Navigation Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] border-r transition-all duration-300 z-40 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-white/10'
            : 'bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 border-slate-200'
        } ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Menu Button (in top bar) */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`md:hidden fixed left-4 top-3 z-50 p-2 rounded transition ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-200 text-slate-900'}`}
      >
        <Menu size={24} />
      </button>

      {/* Mobile Navigation Sidebar */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className={`md:hidden fixed inset-0 top-16 z-30 ${theme === 'dark' ? 'bg-black/50' : 'bg-black/30'}`}
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar */}
          <aside className={`md:hidden fixed left-0 top-16 w-64 h-[calc(100vh-64px)] border-r z-40 transition-colors ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-white/10'
              : 'bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 border-slate-200'
          }`}>
            {navContent}
          </aside>
        </>
      )}
    </>
  );
};

export default LeftNavigation;
