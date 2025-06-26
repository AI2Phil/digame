import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Collapsible = forwardRef(({ 
  className,
  open = false,
  onOpenChange,
  disabled = false,
  children,
  ...props 
}, ref) => {
  return (
    <CollapsibleProvider open={open} onOpenChange={onOpenChange} disabled={disabled}>
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </CollapsibleProvider>
  );
});

Collapsible.displayName = "Collapsible";

const CollapsibleContext = React.createContext();

const CollapsibleProvider = ({ children, open, onOpenChange, disabled }) => {
  const [internalOpen, setInternalOpen] = React.useState(open);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const toggle = React.useCallback(() => {
    if (disabled) return;
    
    const newOpen = !isOpen;
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [disabled, isOpen, isControlled, onOpenChange]);

  const setOpen = React.useCallback((newOpen) => {
    if (disabled) return;
    
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [disabled, isControlled, onOpenChange]);

  return (
    <CollapsibleContext.Provider value={{
      open: isOpen,
      disabled,
      toggle,
      setOpen
    }}>
      {children}
    </CollapsibleContext.Provider>
  );
};

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsible must be used within Collapsible');
  }
  return context;
};

const CollapsibleTrigger = forwardRef(({ 
  className,
  children,
  asChild = false,
  ...props 
}, ref) => {
  const { open, disabled, toggle } = useCollapsible();

  const handleClick = () => {
    if (!disabled) {
      toggle();
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      toggle();
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      'aria-expanded': open,
      'data-state': open ? 'open' : 'closed',
      disabled,
      ...props
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full items-center justify-between py-2 font-medium transition-all",
        "hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={open}
      data-state={open ? 'open' : 'closed'}
      disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  );
});

CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  const { open } = useCollapsible();
  const contentRef = React.useRef(null);
  const [height, setHeight] = React.useState(0);

  React.useImperativeHandle(ref, () => contentRef.current);

  React.useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        className
      )}
      style={{
        height: open ? height : 0
      }}
      data-state={open ? 'open' : 'closed'}
      {...props}
    >
      <div ref={contentRef} className="pb-2">
        {children}
      </div>
    </div>
  );
});

CollapsibleContent.displayName = "CollapsibleContent";

// Predefined collapsible variants
export const CollapsibleVariants = {
  // Card-style collapsible
  Card: forwardRef(({ className, title, children, ...props }, ref) => (
    <Collapsible ref={ref} {...props}>
      <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
        <CollapsibleTrigger className="px-4 py-3 hover:bg-accent hover:text-accent-foreground">
          {title}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-3">
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )),

  // Simple collapsible without styling
  Simple: forwardRef(({ className, title, children, ...props }, ref) => (
    <Collapsible ref={ref} className={className} {...props}>
      <CollapsibleTrigger className="text-left">
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )),

  // FAQ-style collapsible
  FAQ: forwardRef(({ className, question, answer, ...props }, ref) => (
    <Collapsible ref={ref} {...props}>
      <div className={cn("border-b border-border", className)}>
        <CollapsibleTrigger className="py-4 text-left">
          <span className="font-medium">{question}</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4">
          <div className="text-muted-foreground">{answer}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  ))
};

// Hook for collapsible state
export const useCollapsibleState = (initialOpen = false) => {
  const [open, setOpen] = React.useState(initialOpen);

  const toggle = React.useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const close = React.useCallback(() => {
    setOpen(false);
  }, []);

  const openCollapsible = React.useCallback(() => {
    setOpen(true);
  }, []);

  const reset = React.useCallback(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  return {
    open,
    setOpen,
    toggle,
    close,
    open: openCollapsible,
    reset
  };
};

// Hook for multiple collapsibles
export const useCollapsibleGroup = (initialStates = {}) => {
  const [states, setStates] = React.useState(initialStates);

  const toggle = React.useCallback((key) => {
    setStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const open = React.useCallback((key) => {
    setStates(prev => ({
      ...prev,
      [key]: true
    }));
  }, []);

  const close = React.useCallback((key) => {
    setStates(prev => ({
      ...prev,
      [key]: false
    }));
  }, []);

  const openAll = React.useCallback(() => {
    setStates(prev => {
      const newStates = {};
      Object.keys(prev).forEach(key => {
        newStates[key] = true;
      });
      return newStates;
    });
  }, []);

  const closeAll = React.useCallback(() => {
    setStates(prev => {
      const newStates = {};
      Object.keys(prev).forEach(key => {
        newStates[key] = false;
      });
      return newStates;
    });
  }, []);

  const isOpen = React.useCallback((key) => {
    return Boolean(states[key]);
  }, [states]);

  return {
    states,
    toggle,
    open,
    close,
    openAll,
    closeAll,
    isOpen
  };
};

// Simple collapsible for quick use
export const SimpleCollapsible = ({ 
  title, 
  children, 
  defaultOpen = false,
  ...props 
}) => {
  return (
    <Collapsible open={defaultOpen} {...props}>
      <CollapsibleTrigger>{title}</CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
export default Collapsible;