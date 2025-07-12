import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast interface
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast container component
const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

// Individual toast item component
const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = `
      transform transition-all duration-300 ease-in-out
      bg-white border rounded-lg shadow-lg p-4 max-w-sm w-full
      ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `;

    const typeStyles = {
      success: 'border-green-200 bg-green-50',
      error: 'border-red-200 bg-red-50',
      warning: 'border-yellow-200 bg-yellow-50',
      info: 'border-blue-200 bg-blue-50'
    };

    return `${baseStyles} ${typeStyles[toast.type]}`;
  };

  const getIcon = () => {
    const iconStyles = 'h-5 w-5';
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`${iconStyles} text-green-600`} />;
      case 'error':
        return <AlertCircle className={`${iconStyles} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconStyles} text-yellow-600`} />;
      case 'info':
        return <Info className={`${iconStyles} text-blue-600`} />;
      default:
        return <Info className={`${iconStyles} text-gray-600`} />;
    }
  };

  const getTitleColor = () => {
    const colors = {
      success: 'text-green-800',
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800'
    };
    return colors[toast.type];
  };

  const getMessageColor = () => {
    const colors = {
      success: 'text-green-700',
      error: 'text-red-700',
      warning: 'text-yellow-700',
      info: 'text-blue-700'
    };
    return colors[toast.type];
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${getTitleColor()}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={`mt-1 text-sm ${getMessageColor()}`}>
              {toast.message}
            </p>
          )}
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className={`text-sm font-medium underline hover:no-underline ${getTitleColor()}`}
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className={`inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${getTitleColor()}`}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Note: These convenience functions are deprecated. Use useToastActions() hook instead.
// Keeping for backward compatibility but they should not be used directly.
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => {
    console.warn('toast.success() is deprecated. Use useToastActions() hook instead.');
  },
  
  error: (title: string, message?: string, options?: Partial<Toast>) => {
    console.warn('toast.error() is deprecated. Use useToastActions() hook instead.');
  },
  
  warning: (title: string, message?: string, options?: Partial<Toast>) => {
    console.warn('toast.warning() is deprecated. Use useToastActions() hook instead.');
  },
  
  info: (title: string, message?: string, options?: Partial<Toast>) => {
    console.warn('toast.info() is deprecated. Use useToastActions() hook instead.');
  }
};

// Hook for toast convenience functions
export const useToastActions = () => {
  const { addToast } = useToast();
  
  return {
    success: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'success', title, message, ...options });
    },
    
    error: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'error', title, message, ...options });
    },
    
    warning: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'warning', title, message, ...options });
    },
    
    info: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'info', title, message, ...options });
    },
    
    custom: (toast: Omit<Toast, 'id'>) => {
      addToast(toast);
    }
  };
};

export default ToastItem;