import React, { forwardRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Drawer = ({ children, ...props }) => {
  return <DrawerProvider {...props}>{children}</DrawerProvider>;
};

const DrawerContext = React.createContext();

const DrawerProvider = ({ 
  children, 
  open, 
  onOpenChange, 
  direction = 'bottom',
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  dismissible = true,
  modal = true 
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  
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
    setDragOffset(0);
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
      if (e.key === 'Escape' && isOpen && dismissible) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close, dismissible]);

  return (
    <DrawerContext.Provider value={{
      open: isOpen,
      setOpen,
      close,
      direction,
      snapPoints,
      activeSnapPoint,
      setActiveSnapPoint,
      dismissible,
      modal,
      isDragging,
      setIsDragging,
      dragOffset,
      setDragOffset
    }}>
      {children}
    </DrawerContext.Provider>
  );
};

const useDrawer = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within Drawer');
  }
  return context;
};

const DrawerTrigger = forwardRef(({ 
  className,
  children,
  asChild = false,
  ...props 
}, ref) => {
  const { setOpen } = useDrawer();

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

DrawerTrigger.displayName = "DrawerTrigger";

const DrawerContent = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  const { 
    open, 
    close, 
    direction, 
    dismissible, 
    modal,
    isDragging,
    setIsDragging,
    dragOffset,
    setDragOffset
  } = useDrawer();
  
  const contentRef = React.useRef(null);
  const dragStartRef = React.useRef(0);

  React.useImperativeHandle(ref, () => contentRef.current);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && dismissible) {
      close();
    }
  };

  const handleDragStart = (clientY) => {
    setIsDragging(true);
    dragStartRef.current = clientY;
  };

  const handleDragMove = (clientY) => {
    if (!isDragging) return;
    
    const delta = clientY - dragStartRef.current;
    const newOffset = direction === 'bottom' ? Math.max(0, delta) : Math.min(0, delta);
    setDragOffset(newOffset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Close drawer if dragged beyond threshold
    const threshold = 100;
    if (Math.abs(dragOffset) > threshold && dismissible) {
      close();
    } else {
      setDragOffset(0);
    }
  };

  const handleMouseDown = (e) => {
    if (dismissible) {
      handleDragStart(e.clientY);
    }
  };

  const handleTouchStart = (e) => {
    if (dismissible) {
      handleDragStart(e.touches[0].clientY);
    }
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleDragMove(e.clientY);
    const handleTouchMove = (e) => handleDragMove(e.touches[0].clientY);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, dragOffset]);

  const directionClasses = {
    top: 'inset-x-0 top-0 border-b rounded-b-lg',
    bottom: 'inset-x-0 bottom-0 border-t rounded-t-lg',
    left: 'inset-y-0 left-0 border-r rounded-r-lg',
    right: 'inset-y-0 right-0 border-l rounded-l-lg'
  };

  const transformStyle = {
    transform: direction === 'bottom' 
      ? `translateY(${dragOffset}px)` 
      : direction === 'top'
      ? `translateY(${dragOffset}px)`
      : direction === 'left'
      ? `translateX(${dragOffset}px)`
      : `translateX(${dragOffset}px)`
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      {modal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={handleBackdropClick}
        />
      )}

      {/* Drawer Content */}
      <div
        ref={contentRef}
        className={cn(
          "fixed z-50 flex flex-col bg-background shadow-lg transition-transform duration-300 ease-out",
          directionClasses[direction],
          direction === 'bottom' && "h-96 max-h-[80vh]",
          direction === 'top' && "h-96 max-h-[80vh]",
          direction === 'left' && "w-80 max-w-[80vw] h-full",
          direction === 'right' && "w-80 max-w-[80vw] h-full",
          className
        )}
        style={transformStyle}
        {...props}
      >
        {/* Drag Handle */}
        {dismissible && (direction === 'bottom' || direction === 'top') && (
          <div
            className={cn(
              "flex justify-center p-2 cursor-grab active:cursor-grabbing",
              direction === 'top' && "order-last"
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="w-12 h-1.5 bg-muted rounded-full" />
          </div>
        )}

        {children}
      </div>
    </div>
  );
});

DrawerContent.displayName = "DrawerContent";

const DrawerHeader = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 text-center sm:text-left p-6 pb-0", className)}
    {...props}
  />
));

DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0", className)}
    {...props}
  />
));

DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));

DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

DrawerDescription.displayName = "DrawerDescription";

const DrawerClose = forwardRef(({ 
  className,
  children,
  asChild = false,
  ...props 
}, ref) => {
  const { close } = useDrawer();

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

DrawerClose.displayName = "DrawerClose";

// Predefined drawer variants
export const DrawerVariants = {
  // Bottom sheet drawer (mobile-friendly)
  BottomSheet: forwardRef(({ className, children, ...props }, ref) => (
    <Drawer direction="bottom" {...props}>
      <DrawerContent ref={ref} className={className}>
        {children}
      </DrawerContent>
    </Drawer>
  )),

  // Navigation drawer
  Navigation: forwardRef(({ className, children, ...props }, ref) => (
    <Drawer direction="left" {...props}>
      <DrawerContent ref={ref} className={cn("w-80", className)}>
        <DrawerClose />
        {children}
      </DrawerContent>
    </Drawer>
  )),

  // Settings drawer
  Settings: forwardRef(({ className, title = "Settings", children, ...props }, ref) => (
    <Drawer direction="right" {...props}>
      <DrawerContent ref={ref} className={className}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 p-6">
          {children}
        </div>
        <DrawerClose />
      </DrawerContent>
    </Drawer>
  ))
};

// Hook for drawer state
export const useDrawerState = (initialOpen = false) => {
  const [open, setOpen] = React.useState(initialOpen);

  const openDrawer = React.useCallback(() => {
    setOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setOpen(false);
  }, []);

  const toggleDrawer = React.useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return {
    open,
    setOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer
  };
};

// Simple drawer for quick use
export const SimpleDrawer = ({ 
  trigger, 
  title, 
  description,
  children, 
  direction = 'bottom',
  ...props 
}) => {
  return (
    <Drawer direction={direction} {...props}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          {title && <DrawerTitle>{title}</DrawerTitle>}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="flex-1 p-6">
          {children}
        </div>
        <DrawerClose />
      </DrawerContent>
    </Drawer>
  );
};

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
};

export default Drawer;