import React, { forwardRef, useState } from 'react';
import { MoreHorizontal, ChevronRight, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const DropdownMenu = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownMenuProvider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left" {...props}>
        {children}
      </div>
    </DropdownMenuProvider>
  );
};

const DropdownMenuContext = React.createContext();

const DropdownMenuProvider = ({ children, value }) => (
  <DropdownMenuContext.Provider value={value}>
    {children}
  </DropdownMenuContext.Provider>
);

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('useDropdownMenu must be used within DropdownMenu');
  }
  return context;
};

const DropdownMenuTrigger = forwardRef(({ 
  className, 
  children, 
  asChild = false,
  ...props 
}, ref) => {
  const { isOpen, setIsOpen } = useDropdownMenu();
  
  const handleClick = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onClick: handleClick,
      'aria-expanded': isOpen,
      'aria-haspopup': true,
      ...props
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup={true}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = forwardRef(({ 
  className,
  children,
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  ...props 
}, ref) => {
  const { isOpen, setIsOpen } = useDropdownMenu();
  const contentRef = React.useRef(null);

  React.useImperativeHandle(ref, () => contentRef.current);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  const sideClasses = {
    top: 'bottom-full mb-1',
    bottom: 'top-full mt-1',
    left: 'right-full mr-1',
    right: 'left-full ml-1'
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        alignmentClasses[align],
        sideClasses[side],
        className
      )}
      style={{ marginTop: side === 'bottom' ? sideOffset : undefined }}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = forwardRef(({ 
  className,
  children,
  disabled = false,
  destructive = false,
  onClick,
  ...props 
}, ref) => {
  const { setIsOpen } = useDropdownMenu();

  const handleClick = (e) => {
    if (!disabled) {
      onClick?.(e);
      setIsOpen(false);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        destructive && "text-destructive focus:text-destructive",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      data-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuCheckboxItem = forwardRef(({ 
  className,
  children,
  checked = false,
  onCheckedChange,
  disabled = false,
  ...props 
}, ref) => {
  const { setIsOpen } = useDropdownMenu();

  const handleClick = (e) => {
    if (!disabled) {
      onCheckedChange?.(!checked);
      // Don't close menu for checkbox items
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      data-disabled={disabled}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </button>
  );
});

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

const DropdownMenuRadioGroup = ({ children, value, onValueChange }) => {
  return (
    <DropdownMenuRadioGroupProvider value={{ value, onValueChange }}>
      {children}
    </DropdownMenuRadioGroupProvider>
  );
};

const DropdownMenuRadioGroupContext = React.createContext();

const DropdownMenuRadioGroupProvider = ({ children, value }) => (
  <DropdownMenuRadioGroupContext.Provider value={value}>
    {children}
  </DropdownMenuRadioGroupContext.Provider>
);

const useDropdownMenuRadioGroup = () => {
  return React.useContext(DropdownMenuRadioGroupContext);
};

const DropdownMenuRadioItem = forwardRef(({ 
  className,
  children,
  value,
  disabled = false,
  ...props 
}, ref) => {
  const radioGroup = useDropdownMenuRadioGroup();
  const isChecked = radioGroup?.value === value;

  const handleClick = (e) => {
    if (!disabled) {
      radioGroup?.onValueChange?.(value);
      // Don't close menu for radio items
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      data-disabled={disabled}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isChecked && <div className="h-2 w-2 rounded-full bg-current" />}
      </span>
      {children}
    </button>
  );
});

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

const DropdownMenuLabel = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));

DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuShortcut = ({ className, ...props }) => (
  <span
    className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
    {...props}
  />
);

DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

const DropdownMenuSub = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownMenuSubProvider value={{ isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </DropdownMenuSubProvider>
  );
};

const DropdownMenuSubContext = React.createContext();

const DropdownMenuSubProvider = ({ children, value }) => (
  <DropdownMenuSubContext.Provider value={value}>
    {children}
  </DropdownMenuSubContext.Provider>
);

const useDropdownMenuSub = () => {
  const context = React.useContext(DropdownMenuSubContext);
  if (!context) {
    throw new Error('useDropdownMenuSub must be used within DropdownMenuSub');
  }
  return context;
};

const DropdownMenuSubTrigger = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  const { isOpen, setIsOpen } = useDropdownMenuSub();

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </button>
  );
});

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => {
  const { isOpen } = useDropdownMenuSub();

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-full top-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

// Export all components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

export default DropdownMenu;