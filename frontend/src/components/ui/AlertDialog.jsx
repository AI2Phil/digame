import React, { forwardRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

const AlertDialog = ({ children, ...props }) => {
  return (
    <AlertDialogProvider>
      {children}
    </AlertDialogProvider>
  );
};

const AlertDialogContext = React.createContext();

const AlertDialogProvider = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <AlertDialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const useAlertDialog = () => {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within AlertDialog');
  }
  return context;
};

const AlertDialogTrigger = forwardRef(({ 
  className,
  children,
  asChild = false,
  ...props 
}, ref) => {
  const { setIsOpen } = useAlertDialog();

  const handleClick = () => {
    setIsOpen(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onClick: handleClick,
      ...props
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});

AlertDialogTrigger.displayName = "AlertDialogTrigger";

const AlertDialogContent = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  const { isOpen, setIsOpen } = useAlertDialog();

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Dialog */}
      <div
        ref={ref}
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
          "sm:rounded-lg md:w-full",
          className
        )}
        role="alertdialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </div>
    </div>
  );
});

AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
));

AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
));

AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));

AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = forwardRef(({ 
  className,
  children,
  onClick,
  ...props 
}, ref) => {
  const { setIsOpen } = useAlertDialog();

  const handleClick = (e) => {
    onClick?.(e);
    setIsOpen(false);
  };

  return (
    <Button
      ref={ref}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
});

AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = forwardRef(({ 
  className,
  children,
  onClick,
  ...props 
}, ref) => {
  const { setIsOpen } = useAlertDialog();

  const handleClick = (e) => {
    onClick?.(e);
    setIsOpen(false);
  };

  return (
    <Button
      ref={ref}
      variant="outline"
      className={cn("mt-2 sm:mt-0", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
});

AlertDialogCancel.displayName = "AlertDialogCancel";

// Predefined alert dialog variants
export const AlertDialogVariants = {
  // Confirmation dialog
  Confirm: ({ 
    title = "Are you sure?",
    description,
    confirmText = "Continue",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    destructive = false,
    children,
    ...props 
  }) => (
    <AlertDialog {...props}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),

  // Delete confirmation
  Delete: ({ 
    title = "Delete item?",
    description = "This action cannot be undone. This will permanently delete the item.",
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    children,
    ...props 
  }) => (
    <AlertDialogVariants.Confirm
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      onCancel={onCancel}
      destructive={true}
      {...props}
    >
      {children}
    </AlertDialogVariants.Confirm>
  ),

  // Save changes confirmation
  SaveChanges: ({ 
    title = "Save changes?",
    description = "You have unsaved changes. Do you want to save them before leaving?",
    confirmText = "Save",
    cancelText = "Don't save",
    onConfirm,
    onCancel,
    children,
    ...props 
  }) => (
    <AlertDialogVariants.Confirm
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    >
      {children}
    </AlertDialogVariants.Confirm>
  )
};

// Hook for programmatic alert dialogs
export const useAlertDialogState = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState({});

  const showDialog = React.useCallback((dialogConfig) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  }, []);

  const hideDialog = React.useCallback(() => {
    setIsOpen(false);
    setConfig({});
  }, []);

  const confirm = React.useCallback((options = {}) => {
    return new Promise((resolve) => {
      showDialog({
        ...options,
        onConfirm: () => {
          hideDialog();
          resolve(true);
        },
        onCancel: () => {
          hideDialog();
          resolve(false);
        }
      });
    });
  }, [showDialog, hideDialog]);

  return {
    isOpen,
    config,
    showDialog,
    hideDialog,
    confirm
  };
};

// Programmatic alert dialog component
export const ProgrammaticAlertDialog = ({ isOpen, config, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div
        className="relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold">
            {config.title || "Are you sure?"}
          </h2>
          {config.description && (
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            className="mt-2 sm:mt-0"
            onClick={() => {
              config.onCancel?.();
              onClose();
            }}
          >
            {config.cancelText || "Cancel"}
          </Button>
          <Button
            variant={config.destructive ? "destructive" : "default"}
            onClick={() => {
              config.onConfirm?.();
              onClose();
            }}
          >
            {config.confirmText || "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

export default AlertDialog;