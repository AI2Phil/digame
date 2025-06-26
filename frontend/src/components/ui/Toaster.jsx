import React, { forwardRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

// Toast context and provider
const ToastContext = React.createContext();

export const ToastProvider = ({ children, limit = 5, duration = 4000 }) => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      duration: toast.duration ?? duration,
      ...toast
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, limit);
    });

    // Auto remove toast
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [duration, limit]);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = React.useCallback((id, updates) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      removeAllToasts,
      updateToast
    }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast component
const Toast = forwardRef(({ 
  className,
  variant = 'default',
  children,
  onClose,
  ...props 
}, ref) => {
  const variantClasses = {
    default: 'bg-background text-foreground border',
    destructive: 'bg-destructive text-destructive-foreground border-destructive',
    success: 'bg-green-600 text-white border-green-600',
    warning: 'bg-yellow-600 text-white border-yellow-600',
    info: 'bg-blue-600 text-white border-blue-600'
  };

  return (
    <div
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

Toast.displayName = "Toast";

const ToastAction = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
));

ToastAction.displayName = "ToastAction";

const ToastClose = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
));

ToastClose.displayName = "ToastClose";

const ToastTitle = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
));

ToastTitle.displayName = "ToastTitle";

const ToastDescription = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));

ToastDescription.displayName = "ToastDescription";

// Main Toaster component
const Toaster = forwardRef(({ 
  className,
  position = 'bottom-right',
  ...props 
}, ref) => {
  const { toasts, removeToast } = useToast();

  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0'
  };

  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:flex-col md:max-w-[420px]",
        positionClasses[position],
        className
      )}
      {...props}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
});

Toaster.displayName = "Toaster";

// Individual toast item
const ToastItem = ({ toast, onClose }) => {
  const getIcon = (variant) => {
    const iconProps = { className: "h-4 w-4 shrink-0" };
    
    switch (variant) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'destructive':
        return <AlertCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <Toast
      variant={toast.variant}
      className="mb-2 last:mb-0"
      onClose={onClose}
    >
      <div className="flex items-start space-x-2">
        {getIcon(toast.variant)}
        <div className="flex-1 space-y-1">
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
        </div>
      </div>
      {toast.action && (
        <ToastAction onClick={toast.action.onClick}>
          {toast.action.label}
        </ToastAction>
      )}
    </Toast>
  );
};

// Toast variants for easy use
export const ToastVariants = {
  success: (message, options = {}) => ({
    variant: 'success',
    title: 'Success',
    description: message,
    ...options
  }),

  error: (message, options = {}) => ({
    variant: 'destructive',
    title: 'Error',
    description: message,
    ...options
  }),

  warning: (message, options = {}) => ({
    variant: 'warning',
    title: 'Warning',
    description: message,
    ...options
  }),

  info: (message, options = {}) => ({
    variant: 'info',
    title: 'Info',
    description: message,
    ...options
  }),

  loading: (message, options = {}) => ({
    variant: 'default',
    title: 'Loading...',
    description: message,
    duration: 0, // Don't auto-dismiss loading toasts
    ...options
  }),

  promise: (promise, messages, options = {}) => {
    const { addToast, updateToast } = useToast();
    
    const toastId = addToast({
      variant: 'default',
      title: 'Loading...',
      description: messages.loading || 'Please wait...',
      duration: 0,
      ...options
    });

    promise
      .then((result) => {
        updateToast(toastId, {
          variant: 'success',
          title: 'Success',
          description: messages.success || 'Operation completed successfully',
          duration: 4000
        });
        return result;
      })
      .catch((error) => {
        updateToast(toastId, {
          variant: 'destructive',
          title: 'Error',
          description: messages.error || 'Something went wrong',
          duration: 4000
        });
        throw error;
      });

    return promise;
  }
};

// Hook for easy toast usage
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (message, options) => addToast(ToastVariants.success(message, options)),
    error: (message, options) => addToast(ToastVariants.error(message, options)),
    warning: (message, options) => addToast(ToastVariants.warning(message, options)),
    info: (message, options) => addToast(ToastVariants.info(message, options)),
    loading: (message, options) => addToast(ToastVariants.loading(message, options)),
    promise: (promise, messages, options) => ToastVariants.promise(promise, messages, options),
    custom: (toast) => addToast(toast)
  };
};

// Simple toast function for quick use
export const toast = {
  success: (message, options) => {
    // This would need to be called within a component that has access to the context
    console.warn('toast.success called outside of ToastProvider context');
  },
  error: (message, options) => {
    console.warn('toast.error called outside of ToastProvider context');
  },
  // ... other methods
};

// Update toast object when provider is available
if (typeof window !== 'undefined') {
  const updateToastMethods = () => {
    try {
      const context = React.useContext(ToastContext);
      if (context) {
        const { addToast } = context;
        toast.success = (message, options) => addToast(ToastVariants.success(message, options));
        toast.error = (message, options) => addToast(ToastVariants.error(message, options));
        toast.warning = (message, options) => addToast(ToastVariants.warning(message, options));
        toast.info = (message, options) => addToast(ToastVariants.info(message, options));
        toast.loading = (message, options) => addToast(ToastVariants.loading(message, options));
        toast.custom = (toastData) => addToast(toastData);
      }
    } catch (e) {
      // Context not available
    }
  };
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription,
  Toaster,
};

export default Toaster;