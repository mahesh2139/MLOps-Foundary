/**
 * Notification Context - Manages toast notifications and audit logging
 */

import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'run' | 'approve' | 'reject' | 'other';
  user?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  auditLogs: AuditLog[];
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
  logAction: (action: string, details: string, actionType: AuditLog['type']) => void;
  clearAuditLogs: () => void;
}

const defaultContext: NotificationContextType = {
  notifications: [],
  auditLogs: [],
  showNotification: () => {},
  removeNotification: () => {},
  logAction: () => {},
  clearAuditLogs: () => {},
};

export const NotificationContext = createContext<NotificationContextType>(defaultContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Load persisted notifications from localStorage on initialization
    try {
      const stored = localStorage.getItem('pending-notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out notifications older than 30 seconds
        const now = Date.now();
        return parsed.filter((n: any) => (now - n.timestamp) < 30000);
      }
    } catch (err) {
      console.error('[NotificationContext] Failed to restore notifications:', err);
    }
    return [];
  });
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    // Load from localStorage on initialization
    const stored = localStorage.getItem('auditLogs');
    return stored ? JSON.parse(stored) : [];
  });

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    const notificationsWithTimestamp = notifications.map(n => ({
      ...n,
      timestamp: Date.now()
    }));
    localStorage.setItem('pending-notifications', JSON.stringify(notificationsWithTimestamp));
  }, [notifications]);

  // Persist audit logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('auditLogs', JSON.stringify(auditLogs.slice(0, 100))); // Keep last 100 entries
    // Also update notifications array in localStorage for the TopBar
    const notificationsList = auditLogs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp,
      type: log.type === 'create' || log.type === 'run' ? 'success' as const :
           log.type === 'delete' || log.type === 'reject' ? 'error' as const :
           log.type === 'update' ? 'info' as const : 'success' as const
    }));
    localStorage.setItem('notifications', JSON.stringify(notificationsList));
  }, [auditLogs]);

  const showNotification = useCallback(
    (message: string, type: NotificationType, duration = 5000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const notification: Notification = { id, message, type, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const logAction = useCallback((action: string, details: string, actionType: AuditLog['type']) => {
    const log: AuditLog = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      type: actionType,
      user: localStorage.getItem('currentUser') || 'System',
    };

    setAuditLogs((prev) => [log, ...prev]);

    // Also show a toast notification
    const typeMap = {
      'create': 'success',
      'update': 'info',
      'delete': 'warning',
      'run': 'success',
      'approve': 'success',
      'reject': 'warning',
      'other': 'info',
    };
    showNotification(action, typeMap[actionType] as NotificationType, 3000);
  }, [showNotification]);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
    localStorage.removeItem('auditLogs');
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        auditLogs,
        showNotification,
        removeNotification,
        logAction,
        clearAuditLogs,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
