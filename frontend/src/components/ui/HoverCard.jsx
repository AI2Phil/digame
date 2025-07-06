import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * @param {{
 *   children?: React.ReactNode,
 *   openDelay?: number,
 *   closeDelay?: number,
 *   onOpenChange?: (open: boolean) => void
 * }} props
 */
const HoverCard = ({ children, ...props }) => {
  return <HoverCardProvider {...props}>{children}</HoverCardProvider>;
};

const HoverCardContext = React.createContext({
  open: false,
  position: { x: 0, y: 0 },
  setPosition: (position) => {},
  scheduleOpen: () => {},
  scheduleClose: () => {},
  cancelScheduled: () => {},
  handleOpenChange: (open) => {}
});

/**
 * @param {{
 *   children?: React.ReactNode,
 *   openDelay?: number,
 *   closeDelay?: number,
 *   onOpenChange?: (open: boolean) => void
 * }} props
 */
const HoverCardProvider = ({
  children,
  openDelay = 700,
  closeDelay = 300,
  onOpenChange
}) => {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const openTimeoutRef = React.useRef(null);
  const closeTimeoutRef = React.useRef(null);

  const handleOpenChange = React.useCallback((newOpen) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  const scheduleOpen = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    if (!open) {
      openTimeoutRef.current = setTimeout(() => {
        handleOpenChange(true);
      }, openDelay);
    }
  }, [open, openDelay, handleOpenChange]);

  const scheduleClose = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    
    if (open) {
      closeTimeoutRef.current = setTimeout(() => {
        handleOpenChange(false);
      }, closeDelay);
    }
  }, [open, closeDelay, handleOpenChange]);

  const cancelScheduled = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      cancelScheduled();
    };
  }, [cancelScheduled]);

  return (
    <HoverCardContext.Provider value={{
      open,
      position,
      setPosition,
      scheduleOpen,
      scheduleClose,
      cancelScheduled,
      handleOpenChange
    }}>
      {children}
    </HoverCardContext.Provider>
  );
};

const useHoverCard = () => {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error('useHoverCard must be used within HoverCard');
  }
  return context;
};

const HoverCardTrigger = forwardRef(/** @param {{
  className?: string,
  children?: React.ReactNode,
  asChild?: boolean
} & React.HTMLAttributes<HTMLDivElement>} props */ ({
  className,
  children,
  asChild = false,
  ...props
}, ref) => {
  const { scheduleOpen, scheduleClose, setPosition } = useHoverCard();

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    scheduleOpen();
  };

  const handleMouseLeave = () => {
    scheduleClose();
  };

  const handleFocus = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    scheduleOpen();
  };

  const handleBlur = () => {
    scheduleClose();
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      ...props
    });
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </div>
  );
});

HoverCardTrigger.displayName = "HoverCardTrigger";

const HoverCardContent = forwardRef(/** @param {{
  className?: string,
  align?: 'start'|'center'|'end',
  side?: 'top'|'bottom'|'left'|'right',
  sideOffset?: number,
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>} props */ ({
  className,
  align = 'center',
  side = 'bottom',
  sideOffset = 4,
  children,
  ...props
}, ref) => {
  const { open, position, scheduleOpen, scheduleClose, cancelScheduled } = useHoverCard();
  const contentRef = React.useRef(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);

  React.useImperativeHandle(ref, () => contentRef.current);

  const handleMouseEnter = () => {
    cancelScheduled();
  };

  const handleMouseLeave = () => {
    scheduleClose();
  };

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
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
});

HoverCardContent.displayName = "HoverCardContent";

// Predefined hover card variants
export const HoverCardVariants = {
  // Profile hover card
  Profile: forwardRef(/** @param {{
    className?: string,
    avatar?: React.ReactNode | string,
    name?: string,
    username?: string,
    bio?: string,
    stats?: Record<string, string | number>,
    children?: React.ReactNode
  } & React.ComponentProps<typeof HoverCardContent>} props */ ({
    className,
    avatar,
    name,
    username,
    bio,
    stats,
    children,
    ...props
  }, ref) => (
    <HoverCardContent ref={ref} className={cn("w-80", className)} {...props}>
      <div className="flex justify-between space-x-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{name}</h4>
          {username && (
            <p className="text-sm text-muted-foreground">@{username}</p>
          )}
          {bio && (
            <p className="text-sm">{bio}</p>
          )}
          {stats && (
            <div className="flex items-center pt-2">
              <div className="flex space-x-4 text-sm text-muted-foreground">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium text-foreground">{value}</span> {key}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {avatar && (
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            {typeof avatar === 'string' ? (
              <img src={avatar} alt={name} className="h-12 w-12 rounded-full" />
            ) : (
              avatar
            )}
          </div>
        )}
      </div>
      {children}
    </HoverCardContent>
  )),

  // Info hover card
  Info: forwardRef(/** @param {{
    className?: string,
    title?: React.ReactNode,
    description?: React.ReactNode,
    children?: React.ReactNode
  } & React.ComponentProps<typeof HoverCardContent>} props */ ({
    className,
    title,
    description,
    children,
    ...props
  }, ref) => (
    <HoverCardContent ref={ref} className={className} {...props}>
      <div className="space-y-2">
        {title && (
          <h4 className="text-sm font-semibold">{title}</h4>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    </HoverCardContent>
  )),

  // Rich hover card with image
  Rich: forwardRef(/** @param {{
    className?: string,
    image?: React.ReactNode | string,
    title?: React.ReactNode,
    description?: React.ReactNode,
    metadata?: Record<string, string | number>,
    children?: React.ReactNode
  } & React.ComponentProps<typeof HoverCardContent>} props */ ({
    className,
    image,
    title,
    description,
    metadata,
    children,
    ...props
  }, ref) => (
    <HoverCardContent ref={ref} className={cn("w-96", className)} {...props}>
      <div className="space-y-3">
        {image && (
          <div className="aspect-video rounded-md overflow-hidden bg-muted">
            {typeof image === 'string' ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              image
            )}
          </div>
        )}
        <div className="space-y-1">
          {title && (
            <h4 className="text-sm font-semibold">{title}</h4>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {metadata && (
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.entries(metadata).map(([key, value]) => (
                <span key={key} className="text-xs bg-muted px-2 py-1 rounded">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>
        {children}
      </div>
    </HoverCardContent>
  ))
};

// Hook for hover card state
export const useHoverCardState = (openDelay = 700, closeDelay = 300) => {
  const [open, setOpen] = React.useState(false);
  const openTimeoutRef = React.useRef(null);
  const closeTimeoutRef = React.useRef(null);

  const scheduleOpen = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    openTimeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, openDelay);
  }, [openDelay]);

  const scheduleClose = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, closeDelay);
  }, [closeDelay]);

  const openImmediately = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setOpen(true);
  }, []);

  const closeImmediately = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setOpen(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return {
    open,
    scheduleOpen,
    scheduleClose,
    openImmediately,
    closeImmediately
  };
};

// Simple hover card for quick use
/**
 * @param {{
 *   trigger?: React.ReactNode,
 *   content?: React.ReactNode,
 *   title?: React.ReactNode,
 *   description?: React.ReactNode
 * } & React.ComponentProps<typeof HoverCard>} props
 */
export const SimpleHoverCard = ({
  trigger,
  content,
  title,
  description,
  ...props
}) => {
  return (
    <HoverCard {...props}>
      <HoverCardTrigger asChild>
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent>
        {title || description ? (
          <div className="space-y-2">
            {title && <h4 className="text-sm font-semibold">{title}</h4>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {content}
          </div>
        ) : (
          content
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export { HoverCard, HoverCardTrigger, HoverCardContent };
export default HoverCard;