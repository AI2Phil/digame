import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Tooltip = ({ children, ...props }) => {
  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>
  );
};

const TooltipContext = React.createContext();

const TooltipProvider = ({ children, delayDuration = 700 }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const timeoutRef = React.useRef(null);

  const showTooltip = React.useCallback((x, y) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setPosition({ x, y });
      setIsOpen(true);
    }, delayDuration);
  }, [delayDuration]);

  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContext.Provider value={{ 
      isOpen, 
      position, 
      showTooltip, 
      hideTooltip 
    }}>
      {children}
    </TooltipContext.Provider>
  );
};

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within Tooltip');
  }
  return context;
};

const TooltipTrigger = forwardRef(({ 
  className,
  children,
  asChild = false,
  ...props 
}, ref) => {
  const { showTooltip, hideTooltip } = useTooltip();
  const triggerRef = React.useRef(null);

  React.useImperativeHandle(ref, () => triggerRef.current);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    showTooltip(x, y);
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  const handleFocus = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    showTooltip(x, y);
  };

  const handleBlur = () => {
    hideTooltip();
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      ...props
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </button>
  );
});

TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = forwardRef(({ 
  className,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 4,
  ...props 
}, ref) => {
  const { isOpen, position } = useTooltip();
  const contentRef = React.useRef(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);

  React.useImperativeHandle(ref, () => contentRef.current);

  // Adjust position based on viewport boundaries
  React.useEffect(() => {
    if (isOpen && contentRef.current) {
      const content = contentRef.current;
      const rect = content.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let { x, y } = position;

      // Adjust horizontal position
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
  }, [isOpen, position, side, align, sideOffset]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "fixed z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
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

TooltipContent.displayName = "TooltipContent";

// Simple tooltip component for quick use
export const SimpleTooltip = ({ 
  content, 
  children, 
  side = 'top',
  delayDuration = 700,
  ...props 
}) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} {...props}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Predefined tooltip variants
export const TooltipVariants = {
  // Info tooltip with icon
  Info: ({ content, children, ...props }) => (
    <SimpleTooltip
      content={
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
            i
          </div>
          <span>{content}</span>
        </div>
      }
      {...props}
    >
      {children}
    </SimpleTooltip>
  ),

  // Warning tooltip
  Warning: ({ content, children, ...props }) => (
    <SimpleTooltip
      content={content}
      className="bg-yellow-500 text-yellow-50 border-yellow-600"
      {...props}
    >
      {children}
    </SimpleTooltip>
  ),

  // Error tooltip
  Error: ({ content, children, ...props }) => (
    <SimpleTooltip
      content={content}
      className="bg-red-500 text-red-50 border-red-600"
      {...props}
    >
      {children}
    </SimpleTooltip>
  ),

  // Success tooltip
  Success: ({ content, children, ...props }) => (
    <SimpleTooltip
      content={content}
      className="bg-green-500 text-green-50 border-green-600"
      {...props}
    >
      {children}
    </SimpleTooltip>
  ),

  // Rich tooltip with title and description
  Rich: ({ title, description, children, ...props }) => (
    <SimpleTooltip
      content={
        <div className="space-y-1">
          <div className="font-semibold">{title}</div>
          <div className="text-xs opacity-90">{description}</div>
        </div>
      }
      className="max-w-xs"
      {...props}
    >
      {children}
    </SimpleTooltip>
  )
};

// Hook for tooltip state management
export const useTooltipState = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const showTooltip = React.useCallback((newContent, x, y) => {
    setContent(newContent);
    setPosition({ x, y });
    setIsVisible(true);
  }, []);

  const hideTooltip = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  const updatePosition = React.useCallback((x, y) => {
    setPosition({ x, y });
  }, []);

  return {
    isVisible,
    content,
    position,
    showTooltip,
    hideTooltip,
    updatePosition
  };
};

// Programmatic tooltip component
export const ProgrammaticTooltip = ({ 
  isVisible, 
  content, 
  position, 
  className,
  ...props 
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{
        left: position.x,
        top: position.y
      }}
      {...props}
    >
      {content}
    </div>
  );
};

// Utility function for adding tooltips to elements
export const withTooltip = (Component, tooltipContent, tooltipProps = {}) => {
  return forwardRef((props, ref) => (
    <SimpleTooltip content={tooltipContent} {...tooltipProps}>
      <Component ref={ref} {...props} />
    </SimpleTooltip>
  ));
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
export default Tooltip;