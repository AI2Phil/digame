import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

// Toast Context
const ToastContext = createContext();

// Toast Provider
export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    
    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto dismiss if duration is set
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div className={`fixed z-50 ${positionClasses[position]}`}>
          <div className="space-y-2">
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// Individual Toast component
export const Toast = ({ 
  title,
  description,
  variant = 'default',
  duration = 5000,
  action,
  onClose,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const variantStyles = {
    default: {
      bg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      icon: '📄',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600'
    },
    success: {
      bg: 'bg-white',
      border: 'border-green-200',
      text: 'text-gray-900',
      icon: '✅',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    error: {
      bg: 'bg-white',
      border: 'border-red-200',
      text: 'text-gray-900',
      icon: '❌',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    warning: {
      bg: 'bg-white',
      border: 'border-yellow-200',
      text: 'text-gray-900',
      icon: '⚠️',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    info: {
      bg: 'bg-white',
      border: 'border-blue-200',
      text: 'text-gray-900',
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className={`
      ${style.bg} ${style.border} ${style.text}
      border rounded-lg shadow-lg p-4 min-w-80 max-w-md
      transform transition-all duration-300 ease-in-out
      ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      ${className}
    `}>
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 ${style.iconBg} rounded-full flex items-center justify-center`}>
          <span className="text-sm">{style.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
          
          {/* Action */}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div 
            className={`h-1 rounded-full ${
              variant === 'success' ? 'bg-green-500' :
              variant === 'error' ? 'bg-red-500' :
              variant === 'warning' ? 'bg-yellow-500' :
              variant === 'info' ? 'bg-blue-500' :
              'bg-gray-500'
            }`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast hook
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, removeAllToasts } = context;

  const toast = (options) => {
    return addToast(options);
  };

  // Convenience methods
  toast.success = (title, description, options = {}) => {
    return addToast({ title, description, variant: 'success', ...options });
  };

  toast.error = (title, description, options = {}) => {
    return addToast({ title, description, variant: 'error', ...options });
  };

  toast.warning = (title, description, options = {}) => {
    return addToast({ title, description, variant: 'warning', ...options });
  };

  toast.info = (title, description, options = {}) => {
    return addToast({ title, description, variant: 'info', ...options });
  };

  toast.promise = async (promise, options = {}) => {
    const { loading, success, error } = options;
    
    const loadingToastId = addToast({
      title: loading?.title || 'Loading...',
      description: loading?.description,
      variant: 'info',
      duration: 0
    });

    try {
      const result = await promise;
      removeToast(loadingToastId);
      addToast({
        title: success?.title || 'Success',
        description: success?.description,
        variant: 'success'
      });
      return result;
    } catch (err) {
      removeToast(loadingToastId);
      addToast({
        title: error?.title || 'Error',
        description: error?.description || err.message,
        variant: 'error'
      });
      throw err;
    }
  };

  return {
    toast,
    dismiss: removeToast,
    dismissAll: removeAllToasts
  };
};

// Toaster component (alternative to provider)
export const Toaster = ({ position = 'top-right', ...props }) => {
  return <ToastProvider position={position} {...props} />;
};

// Toast action button component
export const ToastAction = ({ 
  children, 
  onClick,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400',
    primary: 'text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-400'
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1 text-xs font-medium border rounded
        transition-colors duration-200
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// CSS for animations (to be added to global styles)
export const toastStyles = `
  @keyframes toast-progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

export default Toast;