import React, { forwardRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Popover = ({ children, ...props }) => {
  return <PopoverProvider {...props}>{children}</PopoverProvider>;
};

const PopoverContext = React.createContext();

const PopoverProvider = ({ 
  children, 
  open, 
  onOpenChange, 
  modal = false,
  defaultOpen = false 
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  
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

    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('[data-popover-content]') && !e.target.closest('[data-popover-trigger]')) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  return (
    <PopoverContext.Provider value={{
      open: isOpen,
      setOpen,
      close,
      position,
      setPosition,
      modal
    }}>
      {children}
    </PopoverContext.Provider>
  );
};

const usePopover = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover must be used within Popover');
  }
  return context;
};

const PopoverTrigger = forwardRef(({ 
  className,
  children,
  asChild = false,
  ...props 
}, ref) => {
  const { open, setOpen, setPosition } = usePopover();

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom
    });
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onClick: handleClick,
      'data-popover-trigger': '',
      'aria-expanded': open,
      'aria-haspopup': 'dialog',
      ...props
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onClick={handleClick}
      data-popover-trigger=""
      aria-expanded={open}
      aria-haspopup="dialog"
      {...props}
    >
      {children}
    </button>
  );
});

PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = forwardRef(({ 
  className,
  align = 'center',
  side = 'bottom',
  sideOffset = 4,
  children,
  ...props 
}, ref) => {
  const { open, close, position, modal } = usePopover();
  const contentRef = React.useRef(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);

  React.useImperativeHandle(ref, () => contentRef.current);

  React.useEffect(() => {
    if (open && contentRef.current) {
      const content = contentRef.current;
      const rect = content.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let { x, y } = position;

      // Adjust horizontal position based on align
      if (align === 'center') {
        x = x - rect.width / 2;
      } else if (align === 'end') {
        x = x - rect.width;
      }

      // Adjust vertical position based on side
      if (side === 'top') {
        y = y - rect.height - sideOffset;
      } else if (side === 'bottom') {
        y = y + sideOffset;
      } else if (side === 'left') {
        x = x - rect.width - sideOffset;
        y = y - rect.height / 2;
      } else if (side === 'right') {
        x = x + sideOffset;
        y = y - rect.height / 2;
      }

      // Keep within viewport bounds
      x = Math.max(8, Math.min(x, viewport.width - rect.width - 8));
      y = Math.max(8, Math.min(y, viewport.height - rect.height - 8));

      setAdjustedPosition({ x, y });
    }
  }, [open, position, side, align, sideOffset]);

  if (!open) return null;

  return (
    <>
      {modal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
      )}
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y
        }}
        data-popover-content=""
        {...props}
      >
        {children}
      </div>
    </>
  );
});

PopoverContent.displayName = "PopoverContent";

const PopoverClose = forwardRef(({ 
  className,
  children,
  asChild = false,
  ...props 
}, ref) => {
  const { close } = usePopover();

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

PopoverClose.displayName = "PopoverClose";

const PopoverHeader = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
));

PopoverHeader.displayName = "PopoverHeader";

const PopoverTitle = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <h4
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));

PopoverTitle.displayName = "PopoverTitle";

const PopoverDescription = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

PopoverDescription.displayName = "PopoverDescription";

const PopoverFooter = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
));

PopoverFooter.displayName = "PopoverFooter";

// Predefined popover variants
export const PopoverVariants = {
  // Confirmation popover
  Confirmation: forwardRef(({ 
    className, 
    title = "Are you sure?", 
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    children,
    ...props 
  }, ref) => (
    <PopoverContent ref={ref} className={className} {...props}>
      <PopoverHeader>
        <PopoverTitle>{title}</PopoverTitle>
        {description && <PopoverDescription>{description}</PopoverDescription>}
      </PopoverHeader>
      {children}
      <PopoverFooter className="mt-4">
        <PopoverClose asChild>
          <button
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </PopoverClose>
        <button
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </PopoverFooter>
    </PopoverContent>
  )),

  // Form popover
  Form: forwardRef(({ 
    className, 
    title, 
    description,
    children,
    ...props 
  }, ref) => (
    <PopoverContent ref={ref} className={cn("w-80", className)} {...props}>
      <PopoverHeader>
        {title && <PopoverTitle>{title}</PopoverTitle>}
        {description && <PopoverDescription>{description}</PopoverDescription>}
      </PopoverHeader>
      <div className="mt-4">
        {children}
      </div>
      <PopoverClose />
    </PopoverContent>
  )),

  // Menu popover
  Menu: forwardRef(({ 
    className, 
    items = [],
    children,
    ...props 
  }, ref) => (
    <PopoverContent ref={ref} className={cn("w-56 p-1", className)} {...props}>
      {items.map((item, index) => (
        <button
          key={index}
          className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={item.onClick}
          disabled={item.disabled}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </button>
      ))}
      {children}
    </PopoverContent>
  )),

  // Info popover
  Info: forwardRef(({ 
    className, 
    title, 
    description,
    children,
    ...props 
  }, ref) => (
    <PopoverContent ref={ref} className={cn("w-64", className)} {...props}>
      <div className="space-y-2">
        {title && <h4 className="font-medium leading-none">{title}</h4>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
    </PopoverContent>
  ))
};

// Hook for popover state
export const usePopoverState = (defaultOpen = false) => {
  const [open, setOpen] = React.useState(defaultOpen);

  const openPopover = React.useCallback(() => {
    setOpen(true);
  }, []);

  const closePopover = React.useCallback(() => {
    setOpen(false);
  }, []);

  const togglePopover = React.useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return {
    open,
    setOpen,
    openPopover,
    closePopover,
    togglePopover
  };
};

// Hook for popover positioning
export const usePopoverPosition = (triggerRef, contentRef, options = {}) => {
  const { side = 'bottom', align = 'center', sideOffset = 4 } = options;
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    let x = triggerRect.left;
    let y = triggerRect.bottom;

    // Adjust based on align
    if (align === 'center') {
      x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
    } else if (align === 'end') {
      x = triggerRect.right - contentRect.width;
    }

    // Adjust based on side
    if (side === 'top') {
      y = triggerRect.top - contentRect.height - sideOffset;
    } else if (side === 'bottom') {
      y = triggerRect.bottom + sideOffset;
    } else if (side === 'left') {
      x = triggerRect.left - contentRect.width - sideOffset;
      y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
    } else if (side === 'right') {
      x = triggerRect.right + sideOffset;
      y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
    }

    setPosition({ x, y });
  }, [side, align, sideOffset]);

  return { position, updatePosition };
};

// Simple popover for quick use
export const SimplePopover = ({ 
  trigger, 
  content, 
  title,
  description,
  ...props 
}) => {
  return (
    <Popover {...props}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent>
        {title || description ? (
          <PopoverHeader>
            {title && <PopoverTitle>{title}</PopoverTitle>}
            {description && <PopoverDescription>{description}</PopoverDescription>}
          </PopoverHeader>
        ) : null}
        <div className={title || description ? "mt-4" : ""}>
          {content}
        </div>
        <PopoverClose />
      </PopoverContent>
    </Popover>
  );
};

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverFooter,
};

export default Popover;