import React from 'react';
import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    return null;
  }

  const { notifications, removeNotification } = context;

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-[9999] pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto animate-slideUp flex items-start gap-3 p-4 rounded-lg backdrop-blur-md border shadow-lg min-w-[300px] max-w-[500px]"
          style={{
            backgroundColor: notification.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 
                           notification.type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                           notification.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                           'rgba(59, 130, 246, 0.1)',
            borderColor: notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' :
                        notification.type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                        notification.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
                        'rgba(59, 130, 246, 0.3)'
          }}
        >
          <div className="flex-shrink-0">
            {notification.type === 'success' && <CheckCircle size={20} className="text-green-400" />}
            {notification.type === 'error' && <AlertCircle size={20} className="text-red-400" />}
            {notification.type === 'warning' && <AlertCircle size={20} className="text-yellow-400" />}
            {notification.type === 'info' && <Info size={20} className="text-blue-400" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium"
              style={{
                color: notification.type === 'success' ? '#10b981' :
                       notification.type === 'error' ? '#ef4444' :
                       notification.type === 'warning' ? '#f59e0b' :
                       '#3b82f6'
              }}
            >
              {notification.message}
            </p>
          </div>

          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
