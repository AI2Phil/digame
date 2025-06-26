import React, { forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Alert = forwardRef(({ 
  className,
  variant = 'default',
  dismissible = false,
  onDismiss,
  children,
  ...props 
}, ref) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const variantClasses = {
    default: "bg-background text-foreground border-border",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800/30",
    success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800/30",
    info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800/30"
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
});

Alert.displayName = "Alert";

const AlertTitle = forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));

AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));

AlertDescription.displayName = "AlertDescription";

const AlertIcon = ({ variant = 'default', className, ...props }) => {
  const icons = {
    default: Info,
    destructive: XCircle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info
  };

  const Icon = icons[variant];

  return (
    <Icon 
      className={cn("h-4 w-4", className)} 
      {...props} 
    />
  );
};

AlertIcon.displayName = "AlertIcon";

// Predefined alert variants for common use cases
export const AlertVariants = {
  // Success alert
  Success: forwardRef(({ title, children, ...props }, ref) => (
    <Alert ref={ref} variant="success" {...props}>
      <div className="flex items-start space-x-2">
        <AlertIcon variant="success" className="mt-0.5" />
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>{children}</AlertDescription>
        </div>
      </div>
    </Alert>
  )),

  // Error alert
  Error: forwardRef(({ title, children, ...props }, ref) => (
    <Alert ref={ref} variant="destructive" {...props}>
      <div className="flex items-start space-x-2">
        <AlertIcon variant="destructive" className="mt-0.5" />
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>{children}</AlertDescription>
        </div>
      </div>
    </Alert>
  )),

  // Warning alert
  Warning: forwardRef(({ title, children, ...props }, ref) => (
    <Alert ref={ref} variant="warning" {...props}>
      <div className="flex items-start space-x-2">
        <AlertIcon variant="warning" className="mt-0.5" />
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>{children}</AlertDescription>
        </div>
      </div>
    </Alert>
  )),

  // Info alert
  Info: forwardRef(({ title, children, ...props }, ref) => (
    <Alert ref={ref} variant="info" {...props}>
      <div className="flex items-start space-x-2">
        <AlertIcon variant="info" className="mt-0.5" />
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>{children}</AlertDescription>
        </div>
      </div>
    </Alert>
  )),

  // Inline alert (smaller, no icon)
  Inline: forwardRef(({ className, children, ...props }, ref) => (
    <Alert 
      ref={ref} 
      className={cn("p-2 text-xs", className)} 
      {...props}
    >
      {children}
    </Alert>
  )),

  // Banner alert (full width, prominent)
  Banner: forwardRef(({ className, children, ...props }, ref) => (
    <Alert 
      ref={ref} 
      className={cn("rounded-none border-x-0 border-t-0", className)} 
      {...props}
    >
      {children}
    </Alert>
  ))
};

// Hook for programmatic alerts
export const useAlert = () => {
  const [alerts, setAlerts] = React.useState([]);

  const addAlert = React.useCallback((alert) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert = { ...alert, id };
    
    setAlerts(prev => [...prev, newAlert]);

    // Auto-dismiss after timeout if specified
    if (alert.timeout) {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, alert.timeout);
    }

    return id;
  }, []);

  const removeAlert = React.useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAlerts = React.useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts
  };
};

// Alert container for displaying multiple alerts
export const AlertContainer = ({ alerts = [], onDismiss, className }) => {
  if (alerts.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          dismissible={alert.dismissible !== false}
          onDismiss={() => onDismiss?.(alert.id)}
        >
          {alert.icon && (
            <div className="flex items-start space-x-2">
              <AlertIcon variant={alert.variant} className="mt-0.5" />
              <div className="flex-1">
                {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
                <AlertDescription>{alert.message}</AlertDescription>
              </div>
            </div>
          )}
          {!alert.icon && (
            <>
              {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
              <AlertDescription>{alert.message}</AlertDescription>
            </>
          )}
        </Alert>
      ))}
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription, AlertIcon };
export default Alert;