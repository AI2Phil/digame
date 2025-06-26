import React, { forwardRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Sheet = ({ children, ...props }) => {
  return <SheetProvider {...props}>{children}</SheetProvider>;
};

const SheetContext = React.createContext();

const SheetProvider = ({ children, open, onOpenChange, modal = true }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback((newOpen) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);

  const close = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  React.useEffect(() => {
    if (isOpen && modal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, modal]);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  return (
    <SheetContext.Provider value={{ open: isOpen, setOpen, close, modal }}>
      {children}
    </SheetContext.Provider>
  );
};

const useSheet = () => {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error('useSheet must be used within Sheet');
  }
  return context;
};

const SheetTrigger = forwardRef(({ 
  className,
  children,
  asChild = false,
  ...props 
}, ref) => {
  const { setOpen } = useSheet();

  const handleClick = () => {
    setOpen(true);
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
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});

SheetTrigger.displayName = "SheetTrigger";

const SheetContent = forwardRef(({ 
  className,
  side = 'right',
  size = 'default',
  children,
  onEscapeKeyDown,
  onPointerDownOutside,
  ...props 
}, ref) => {
  const { open, close, modal } = useSheet();
  const contentRef = React.useRef(null);

  React.useImperativeHandle(ref, () => contentRef.current);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };

  const sideClasses = {
    top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
    bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm'
  };

  const sizeClasses = {
    sm: side === 'top' || side === 'bottom' ? 'h-1/3' : 'sm:max-w-sm',
    default: side === 'top' || side === 'bottom' ? 'h-1/2' : 'sm:max-w-md',
    lg: side === 'top' || side === 'bottom' ? 'h-2/3' : 'sm:max-w-lg',
    xl: side === 'top' || side === 'bottom' ? 'h-3/4' : 'sm:max-w-xl',
    full: side === 'top' || side === 'bottom' ? 'h-full' : 'w-full'
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      {modal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={handleBackdropClick}
          data-state={open ? 'open' : 'closed'}
        />
      )}

      {/* Sheet Content */}
      <div
        ref={contentRef}
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          sideClasses[side],
          sizeClasses[size],
          className
        )}
        data-state={open ? 'open' : 'closed'}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});

SheetContent.displayName = "SheetContent";

const SheetHeader = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
));

SheetHeader.displayName = "SheetHeader";

const SheetFooter = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
));

SheetFooter.displayName = "SheetFooter";

const SheetTitle = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));

SheetTitle.displayName = "SheetTitle";

const SheetDescription = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

SheetDescription.displayName = "SheetDescription";

const SheetClose = forwardRef(({ 
  className,
  children,
  asChild = false,
  ...props 
}, ref) => {
  const { close } = useSheet();

  const handleClick = () => {
    close();
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
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children || <X className="h-4 w-4" />}
      <span className="sr-only">Close</span>
    </button>
  );
});

SheetClose.displayName = "SheetClose";

// Predefined sheet variants
export const SheetVariants = {
  // Navigation sheet
  Navigation: forwardRef(({ className, children, ...props }, ref) => (
    <Sheet {...props}>
      <SheetContent ref={ref} side="left" className={cn("w-80", className)}>
        <SheetClose />
        {children}
      </SheetContent>
    </Sheet>
  )),

  // Settings sheet
  Settings: forwardRef(({ className, title = "Settings", children, ...props }, ref) => (
    <Sheet {...props}>
      <SheetContent ref={ref} side="right" className={className}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {children}
        </div>
        <SheetClose />
      </SheetContent>
    </Sheet>
  )),

  // Bottom sheet (mobile-friendly)
  Bottom: forwardRef(({ className, children, ...props }, ref) => (
    <Sheet {...props}>
      <SheetContent ref={ref} side="bottom" className={cn("rounded-t-lg", className)}>
        <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mb-4" />
        {children}
      </SheetContent>
    </Sheet>
  )),

  // Full screen sheet
  FullScreen: forwardRef(({ className, children, ...props }, ref) => (
    <Sheet {...props}>
      <SheetContent ref={ref} size="full" className={cn("max-w-none", className)}>
        <SheetClose />
        {children}
      </SheetContent>
    </Sheet>
  ))
};

// Hook for sheet state
export const useSheetState = (initialOpen = false) => {
  const [open, setOpen] = React.useState(initialOpen);

  const openSheet = React.useCallback(() => {
    setOpen(true);
  }, []);

  const closeSheet = React.useCallback(() => {
    setOpen(false);
  }, []);

  const toggleSheet = React.useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return {
    open,
    setOpen,
    openSheet,
    closeSheet,
    toggleSheet
  };
};

// Simple sheet for quick use
export const SimpleSheet = ({ 
  trigger, 
  title, 
  description,
  children, 
  side = 'right',
  ...props 
}) => {
  return (
    <Sheet {...props}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          {title && <SheetTitle>{title}</SheetTitle>}
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-6">
          {children}
        </div>
        <SheetClose />
      </SheetContent>
    </Sheet>
  );
};

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
};

export default Sheet;