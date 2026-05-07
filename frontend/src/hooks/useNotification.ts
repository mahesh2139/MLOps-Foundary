/**
 * useNotification Hook - Simplified interface for showing notifications
 */

import { useContext } from 'react';
import { NotificationContext, NotificationType } from '../contexts/NotificationContext';

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  return {
    showNotification: (message: string, type: NotificationType = 'info', duration?: number) =>
      context.showNotification(message, type, duration),
    removeNotification: context.removeNotification,
    notifications: context.notifications,
  };
};;
