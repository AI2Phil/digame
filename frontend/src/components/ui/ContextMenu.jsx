import React, { forwardRef } from 'react';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * @param {{children: any, onOpenChange: function, modal?: boolean}} props
 */
const ContextMenu = ({ children, ...props }) => {
  return <ContextMenuProvider {...props}>{children}</ContextMenuProvider>;
};

const ContextMenuContext = React.createContext({
  open: false,
  position: { x: 0, y: 0 },
  activeSubmenu: null,
  setActiveSubmenu: (/** @type {any} */ value) => {},
  handleContextMenu: (/** @type {Event} */ event) => {},
  handleOpenChange: (/** @type {boolean} */ newOpen) => {}
});

/**
 * @param {{children: any, onOpenChange: function, modal?: boolean}} props
 */
const ContextMenuProvider = ({ children, onOpenChange, modal = true }) => {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [activeSubmenu, setActiveSubmenu] = React.useState(null);

  const handleOpenChange = React.useCallback((newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setActiveSubmenu(null);
    }
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  const handleContextMenu = React.useCallback((event) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    handleOpenChange(true);
  }, [handleOpenChange]);

  React.useEffect(() => {
    if (open) {
      const handleClickOutside = () => handleOpenChange(false);
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleOpenChange(false);
        }
      };

      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, handleOpenChange]);

  return (
    <ContextMenuContext.Provider value={{
      open,
      position,
      activeSubmenu,
      setActiveSubmenu,
      handleContextMenu,
      handleOpenChange
    }}>
      {children}
    </ContextMenuContext.Provider>
  );
};

const useContextMenu = () => {
  const context = React.useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within ContextMenu');
  }
  return context;
};

const ContextMenuTrigger = forwardRef((/** @type {{className?: string, children: any, asChild?: boolean, disabled?: boolean}} */ {
  className,
  children,
  asChild = false,
  disabled = false,
  ...props
}, ref) => {
  const { handleContextMenu } = useContextMenu();

  const handleRightClick = (e) => {
    if (!disabled) {
      handleContextMenu(e);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onContextMenu: handleRightClick,
      ...props
    });
  }

  return (
    <div
      ref={ref}
      className={className}
      onContextMenu={handleRightClick}
      {...props}
    >
      {children}
    </div>
  );
});

ContextMenuTrigger.displayName = "ContextMenuTrigger";

const ContextMenuContent = forwardRef((/** @type {{className?: string, children: any}} */ {
  className,
  children,
  ...props
}, ref) => {
  const { open, position } = useContextMenu();
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

      // Adjust position to keep menu within viewport
      if (x + rect.width > viewport.width) {
        x = viewport.width - rect.width - 8;
      }
      if (y + rect.height > viewport.height) {
        y = viewport.height - rect.height - 8;
      }

      x = Math.max(8, x);
      y = Math.max(8, y);

      setAdjustedPosition({ x, y });
    }
  }, [open, position]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
      {...props}
    >
      {children}
    </div>
  );
});

ContextMenuContent.displayName = "ContextMenuContent";

const ContextMenuItem = forwardRef((/** @type {{className?: string, inset?: boolean, disabled?: boolean, children: any, onSelect?: function}} */ {
  className,
  inset = false,
  disabled = false,
  children,
  onSelect,
  ...props
}, ref) => {
  const { handleOpenChange } = useContextMenu();

  const handleClick = () => {
    if (!disabled) {
      onSelect?.();
      handleOpenChange(false);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      data-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  );
});

ContextMenuItem.displayName = "ContextMenuItem";

const ContextMenuCheckboxItem = forwardRef((/** @type {{className?: string, children: any, checked?: boolean, onCheckedChange?: function, disabled?: boolean}} */ {
  className,
  children,
  checked = false,
  onCheckedChange,
  disabled = false,
  ...props
}, ref) => {
  const { handleOpenChange } = useContextMenu();

  const handleClick = () => {
    if (!disabled) {
      onCheckedChange?.(!checked);
      // Don't close menu for checkbox items
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      data-disabled={disabled}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
});

ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

/**
 * @param {{children: any, value?: any, onValueChange?: function}} props
 */
const ContextMenuRadioGroup = ({ children, value, onValueChange, ...props }) => {
  return (
    <div role="group" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onCheckedChange: () => onValueChange?.(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
};

const ContextMenuRadioItem = forwardRef((/** @type {{className?: string, children: any, checked?: boolean, onCheckedChange?: function, disabled?: boolean, value?: any}} */ {
  className,
  children,
  checked = false,
  onCheckedChange,
  disabled = false,
  value,
  ...props
}, ref) => {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange?.(value);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      data-disabled={disabled}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Circle className="h-2 w-2 fill-current" />}
      </span>
      {children}
    </div>
  );
});

ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

const ContextMenuLabel = forwardRef((/** @type {{className?: string, inset?: boolean, children?: any}} */ {
  className,
  inset = false,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));

ContextMenuLabel.displayName = "ContextMenuLabel";

const ContextMenuSeparator = forwardRef((/** @type {{className?: string}} */ {
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));

ContextMenuSeparator.displayName = "ContextMenuSeparator";

const ContextMenuShortcut = forwardRef((/** @type {{className?: string, children?: any}} */ {
  className,
  ...props
}, ref) => (
  <span
    ref={ref}
    className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
    {...props}
  />
));

ContextMenuShortcut.displayName = "ContextMenuShortcut";

/**
 * @param {{children: any, onOpenChange?: function}} props
 */
const ContextMenuSub = ({ children, ...props }) => {
  return <ContextMenuSubProvider {...props}>{children}</ContextMenuSubProvider>;
};

/**
 * @param {{children: any, onOpenChange?: function}} props
 */
const ContextMenuSubProvider = ({ children, onOpenChange }) => {
  const [open, setOpen] = React.useState(false);
  const { activeSubmenu, setActiveSubmenu } = useContextMenu();

  const handleOpenChange = React.useCallback((newOpen) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  return (
    <ContextMenuSubContext.Provider value={{ open, handleOpenChange }}>
      {children}
    </ContextMenuSubContext.Provider>
  );
};

const ContextMenuSubContext = React.createContext({
  open: false,
  handleOpenChange: (/** @type {boolean} */ newOpen) => {}
});

const ContextMenuSubTrigger = forwardRef((/** @type {{className?: string, inset?: boolean, children: any}} */ {
  className,
  inset = false,
  children,
  ...props
}, ref) => {
  const { open, handleOpenChange } = React.useContext(ContextMenuSubContext);

  const handleMouseEnter = () => {
    handleOpenChange(true);
  };

  const handleMouseLeave = () => {
    handleOpenChange(false);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        inset && "pl-8",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-state={open ? "open" : "closed"}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </div>
  );
});

ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

const ContextMenuSubContent = forwardRef((/** @type {{className?: string, children: any}} */ {
  className,
  children,
  ...props
}, ref) => {
  const { open } = React.useContext(ContextMenuSubContext);

  if (!open) return null;

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

ContextMenuSubContent.displayName = "ContextMenuSubContent";

// Hook for context menu state
export const useContextMenuState = () => {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const openContextMenu = React.useCallback((x, y) => {
    setPosition({ x, y });
    setOpen(true);
  }, []);

  const closeContextMenu = React.useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    position,
    openContextMenu,
    closeContextMenu
  };
};

// Simple context menu for quick use
/**
 * @param {{trigger: any, items?: Array, onOpenChange?: function}} props
 */
export const SimpleContextMenu = ({
  trigger,
  items = [],
  ...props
}) => {
  return (
    <ContextMenu onOpenChange={(/** @type {boolean} */ open) => {}} {...props}>
      <ContextMenuTrigger asChild>
        {trigger}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <ContextMenuSeparator key={index} />;
          }
          
          if (item.type === 'label') {
            return <ContextMenuLabel key={index} children={item.label} />;
          }

          return (
            <ContextMenuItem
              key={index}
              onSelect={item.onSelect}
              disabled={item.disabled}
              children={[
                item.icon && <span key="icon" className="mr-2">{item.icon}</span>,
                item.label,
                item.shortcut && (
                  <ContextMenuShortcut key="shortcut" children={item.shortcut} />
                )
              ].filter(Boolean)}
            />
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
};

export default ContextMenu;