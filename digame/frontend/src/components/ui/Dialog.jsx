import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Dialog Context
const DialogContext = React.createContext();

// Main Dialog component
export const Dialog = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

// Dialog Trigger
export const DialogTrigger = ({ children, asChild = false }) => {
  const context = React.useContext(DialogContext);
  
  if (!context) {
    throw new Error('DialogTrigger must be used within a Dialog');
  }

  const { setIsOpen } = context;

  const handleClick = () => {
    setIsOpen(true);
  };

  if (asChild) {
    return React.cloneElement(children, {
      onClick: handleClick
    });
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
};

// Dialog Content
export const DialogContent = ({ 
  children, 
  className = '',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  const context = React.useContext(DialogContext);
  const contentRef = useRef(null);
  
  if (!context) {
    throw new Error('DialogContent must be used within a Dialog');
  }

  const { isOpen, setIsOpen } = context;

  // Size variants
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm', 
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full'
  };

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen, closeOnEscape]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div
        ref={contentRef}
        className={`
          relative bg-white rounded-xl shadow-2xl
          ${sizeClasses[size]} w-full
          animate-scale-in
          ${className}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {children}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};

// Dialog Header
export const DialogHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Dialog Title
export const DialogTitle = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
};

// Dialog Description
export const DialogDescription = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
};

// Dialog Body
export const DialogBody = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

// Dialog Footer
export const DialogFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 ${className}`}>
      {children}
    </div>
  );
};

// Alert Dialog (for confirmations)
export const AlertDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'text-blue-600 bg-blue-100 hover:bg-blue-200',
    destructive: 'text-red-600 bg-red-100 hover:bg-red-200',
    success: 'text-green-600 bg-green-100 hover:bg-green-200',
    warning: 'text-orange-600 bg-orange-100 hover:bg-orange-200'
  };

  const iconMap = {
    default: '❓',
    destructive: '⚠️',
    success: '✅',
    warning: '⚠️'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" closeOnOverlayClick={false}>
        <DialogBody>
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${variantStyles[variant]}`}>
              <span className="text-lg">{iconMap[variant]}</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-base">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogBody>
        
        <DialogFooter>
          <button
            onClick={() => {
              onCancel?.();
              onOpenChange?.(false);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onOpenChange?.(false);
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              variant === 'destructive' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook for programmatic dialog control
export const useDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
};

export default Dialog;