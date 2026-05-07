/**
 * Error Boundary - Catches and displays errors
 */

import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full p-8 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
                <h2 className="text-xl font-bold text-white">Something went wrong</h2>
              </div>

              <p className="text-slate-300 text-sm mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div className="mb-6 p-3 bg-slate-900/50 rounded border border-slate-700 overflow-auto max-h-48">
                  <p className="text-xs text-slate-400 font-mono mb-2">Stack trace:</p>
                  <p className="text-xs text-slate-300 font-mono">
                    {this.state.errorInfo.componentStack}
                  </p>
                </div>
              )}

              <button
                onClick={this.resetError}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error handler for functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = (error: Error) => {
    console.error('Error handled:', error);
    setError(error);
  };

  const clearError = () => {
    setError(null);
  };

  return { error, handleError, clearError };
};

/**
 * Error display component
 */
export const ErrorMessage: React.FC<{
  message: string;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
}> = ({ message, onDismiss, action }) => {
  return (
    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-300 text-sm">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="text-red-400 hover:text-red-300 text-xs mt-2 font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-300">
          ✕
        </button>
      )}
    </div>
  );
};
