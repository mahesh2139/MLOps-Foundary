/**
 * Authentication Context - Manages user auth state
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'ml-engineer' | 'data-engineer' | 'prod-team' | 'monitoring-team' | 'model-sponsor';
  teams: string[];
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  sessionWarning: boolean;
  timeUntilExpiry: number | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  extendSession: () => void;
}

const defaultContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  sessionWarning: false,
  timeUntilExpiry: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
  extendSession: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

/**
 * Role-based permissions
 */
const rolePermissions: Record<string, string[]> = {
  'admin': ['all'],
  'ml-engineer': ['create_pipelines', 'register_models', 'deploy_to_dev', 'view_all'],
  'data-engineer': ['ingest_data', 'prepare_data', 'create_features', 'view_data'],
  'prod-team': ['deploy_to_staging', 'deploy_to_prod', 'approve_promotion', 'view_deployments'],
  'monitoring-team': ['view_monitoring', 'create_alerts', 'acknowledge_alerts'],
  'model-sponsor': ['view_dashboards', 'view_models'],
};

/**
 * Auth Provider Component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  console.log('🔐 AuthProvider mounted - checking for stored token');

  // Check if user is already logged in on mount
  useEffect(() => {
    console.log('🔐 AuthProvider useEffect running');
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const sessionTimeout = localStorage.getItem('sessionTimeout');

    console.log('🔐 Stored token:', storedToken ? 'YES' : 'NO');
    console.log('🔐 Stored user:', storedUser ? 'YES' : 'NO');

    if (storedToken && storedUser) {
      // Check if session has expired
      if (sessionTimeout && Date.now() > parseInt(sessionTimeout)) {
        console.log('🔐 Session expired - logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('sessionTimeout');
        setError('Session expired. Please login again.');
      } else {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('🔐 Restored user from storage');
          // Refresh session timeout
          if (!sessionTimeout) {
            localStorage.setItem('sessionTimeout', (Date.now() + 24 * 60 * 60 * 1000).toString());
          }
        } catch (err) {
          console.warn('🔐 Failed to parse stored user:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('loginTime');
          localStorage.removeItem('sessionTimeout');
          setError('Session expired. Please login again.');
        }
      }
    } else {
      console.log('🔐 No stored token/user - user needs to login');
    }
    console.log('🔐 Setting isLoading to false');
    setIsLoading(false);
  }, []);

  // Monitor session timeout and warn user before expiry
  useEffect(() => {
    if (!user || !token) return;

    const checkSessionTimeout = () => {
      const sessionTimeout = localStorage.getItem('sessionTimeout');
      if (!sessionTimeout) return;

      const timeRemaining = parseInt(sessionTimeout) - Date.now();
      const warningThreshold = 60 * 60 * 1000; // 1 hour before expiry

      if (timeRemaining <= 0) {
        // Session expired
        logout();
        setError('Session expired. Please login again.');
      } else if (timeRemaining <= warningThreshold && timeRemaining > 0) {
        // Show warning
        setSessionWarning(true);
        setTimeUntilExpiry(Math.floor(timeRemaining / 1000)); // Convert to seconds
      } else {
        // Session still valid, hide warning
        setSessionWarning(false);
        setTimeUntilExpiry(null);
      }
    };

    // Check immediately
    checkSessionTimeout();

    // Set interval to check every minute
    const interval = setInterval(checkSessionTimeout, 60 * 1000);
    return () => clearInterval(interval);
  }, [user, token]);

  const extendSession = useCallback(() => {
    const newTimeout = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('sessionTimeout', newTimeout.toString());
    setSessionWarning(false);
    setTimeUntilExpiry(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Demo mode - allow login with demo credentials without backend
      if (email === 'admin@mlops.com' && password === 'password') {
        const demoUser: User = {
          id: '1',
          email: 'admin@mlops.com',
          name: 'Admin User',
          role: 'admin',
          teams: ['MLOps'],
          createdAt: new Date().toISOString(),
        };
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('loginTime', new Date().toISOString());
        setToken(demoToken);
        setUser(demoUser);
        return;
      }

      // Demo users for testing different roles
      const demoUsers: Record<string, User> = {
        'alice@org.com': {
          id: '2',
          email: 'alice@org.com',
          name: 'Alice Johnson',
          role: 'ml-engineer',
          teams: ['Data', 'Models'],
          createdAt: new Date().toISOString(),
        },
        'bob@org.com': {
          id: '3',
          email: 'bob@org.com',
          name: 'Bob Smith',
          role: 'data-engineer',
          teams: ['Data'],
          createdAt: new Date().toISOString(),
        },
        'carol@org.com': {
          id: '4',
          email: 'carol@org.com',
          name: 'Carol Davis',
          role: 'model-sponsor',
          teams: ['Stakeholders'],
          createdAt: new Date().toISOString(),
        },
      };

      // Check if it's a demo user
      if (demoUsers[email] && password === 'password') {
        const user = demoUsers[email];
        const token = 'demo-token-' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('loginTime', new Date().toISOString());
        localStorage.setItem('sessionTimeout', (Date.now() + 24 * 60 * 60 * 1000).toString()); // 24 hours
        setToken(token);
        setUser(user);
        return;
      }
      
      // Try to authenticate with backend
      try {
        const response = await authAPI.login(email, password) as any;
        
        if (response.token && response.user) {
          // Check if user is approved (not pending)
          if (response.user.status === 'pending') {
            throw new Error('Your account is pending admin approval. Please wait for an approval email.');
          }

          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('loginTime', new Date().toISOString());
          localStorage.setItem('sessionTimeout', (Date.now() + 24 * 60 * 60 * 1000).toString());
          setToken(response.token);
          setUser(response.user);
        } else {
          throw new Error(response.error || 'Login failed');
        }
      } catch (backendErr: any) {
        throw new Error('Invalid credentials or backend unavailable');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('sessionTimeout');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const register = useCallback(async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authAPI.register(data) as any;
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('all') || permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    error,
    sessionWarning,
    timeUntilExpiry,
    login,
    logout,
    register,
    hasPermission,
    hasRole,
    extendSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Higher-order component for protected routes
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string
) => {
  return (props: P) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div className="flex items-center justify-center h-screen">Please login</div>;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Unauthorized: Required role {requiredRole}</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
