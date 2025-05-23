import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Separator = forwardRef(({ 
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props 
}, ref) => (
  <div
    ref={ref}
    role={decorative ? 'none' : 'separator'}
    aria-orientation={decorative ? undefined : orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === 'horizontal' ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
));

Separator.displayName = "Separator";

// Predefined separator variants
export const SeparatorVariants = {
  // Dashed separator
  Dashed: forwardRef(({ className, ...props }, ref) => (
    <Separator
      ref={ref}
      className={cn("border-dashed border-t border-border bg-transparent", className)}
      {...props}
    />
  )),

  // Dotted separator
  Dotted: forwardRef(({ className, ...props }, ref) => (
    <Separator
      ref={ref}
      className={cn("border-dotted border-t border-border bg-transparent", className)}
      {...props}
    />
  )),

  // Thick separator
  Thick: forwardRef(({ className, orientation = 'horizontal', ...props }, ref) => (
    <Separator
      ref={ref}
      orientation={orientation}
      className={cn(
        orientation === 'horizontal' ? "h-1" : "w-1",
        className
      )}
      {...props}
    />
  )),

  // Gradient separator
  Gradient: forwardRef(({ className, orientation = 'horizontal', ...props }, ref) => (
    <Separator
      ref={ref}
      orientation={orientation}
      className={cn(
        "bg-gradient-to-r from-transparent via-border to-transparent",
        orientation === 'vertical' && "bg-gradient-to-b",
        className
      )}
      {...props}
    />
  )),

  // Colored separator
  Colored: forwardRef(({ className, color = 'primary', ...props }, ref) => (
    <Separator
      ref={ref}
      className={cn(
        color === 'primary' && "bg-primary",
        color === 'secondary' && "bg-secondary",
        color === 'accent' && "bg-accent",
        color === 'destructive' && "bg-destructive",
        color === 'muted' && "bg-muted",
        className
      )}
      {...props}
    />
  ))
};

// Separator with text
export const SeparatorWithText = forwardRef(({ 
  className,
  children,
  orientation = 'horizontal',
  position = 'center',
  ...props 
}, ref) => {
  if (orientation === 'vertical') {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center", className)}
        {...props}
      >
        <Separator orientation="vertical" className="flex-1" />
        <div className={cn(
          "px-2 py-1 text-xs text-muted-foreground bg-background",
          position === 'start' && "order-first",
          position === 'end' && "order-last"
        )}>
          {children}
        </div>
        <Separator orientation="vertical" className="flex-1" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("relative flex items-center", className)}
      {...props}
    >
      <Separator className="flex-1" />
      <div className={cn(
        "px-2 text-xs text-muted-foreground bg-background",
        position === 'start' && "order-first pr-2 pl-0",
        position === 'end' && "order-last pl-2 pr-0"
      )}>
        {children}
      </div>
      {position !== 'start' && position !== 'end' && (
        <Separator className="flex-1" />
      )}
    </div>
  );
});

SeparatorWithText.displayName = "SeparatorWithText";

// Separator with icon
export const SeparatorWithIcon = forwardRef(({ 
  className,
  icon,
  orientation = 'horizontal',
  ...props 
}, ref) => {
  if (orientation === 'vertical') {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center", className)}
        {...props}
      >
        <Separator orientation="vertical" className="flex-1" />
        <div className="p-2 bg-background">
          {icon}
        </div>
        <Separator orientation="vertical" className="flex-1" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("relative flex items-center", className)}
      {...props}
    >
      <Separator className="flex-1" />
      <div className="px-2 bg-background">
        {icon}
      </div>
      <Separator className="flex-1" />
    </div>
  );
});

SeparatorWithIcon.displayName = "SeparatorWithIcon";

// Section separator with title
export const SectionSeparator = forwardRef(({ 
  className,
  title,
  subtitle,
  orientation = 'horizontal',
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-4 py-4",
      orientation === 'vertical' && "flex-col",
      className
    )}
    {...props}
  >
    <div className={cn(
      "text-center",
      orientation === 'vertical' && "writing-mode-vertical"
    )}>
      {title && (
        <h3 className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">
          {subtitle}
        </p>
      )}
    </div>
    <Separator 
      orientation={orientation} 
      className={cn(
        orientation === 'horizontal' ? "flex-1" : "flex-1"
      )} 
    />
  </div>
));

SectionSeparator.displayName = "SectionSeparator";

// Breadcrumb separator
export const BreadcrumbSeparator = forwardRef(({ 
  className,
  children = '/',
  ...props 
}, ref) => (
  <span
    ref={ref}
    role="presentation"
    className={cn("text-muted-foreground", className)}
    {...props}
  >
    {children}
  </span>
));

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// Menu separator
export const MenuSeparator = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <Separator
    ref={ref}
    className={cn("my-1", className)}
    {...props}
  />
));

MenuSeparator.displayName = "MenuSeparator";

// Hook for separator animations
export const useSeparatorAnimation = (type = 'fade') => {
  const [isVisible, setIsVisible] = React.useState(false);
  const separatorRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (separatorRef.current) {
      observer.observe(separatorRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animationClasses = {
    fade: isVisible ? 'opacity-100' : 'opacity-0',
    slide: isVisible ? 'translate-x-0' : 'translate-x-full',
    scale: isVisible ? 'scale-x-100' : 'scale-x-0',
    draw: isVisible ? 'w-full' : 'w-0'
  };

  return {
    separatorRef,
    isVisible,
    animationClass: `transition-all duration-500 ${animationClasses[type]}`
  };
};

// Utility function to create separator with spacing
export const createSeparatorWithSpacing = (spacing = 'md') => {
  const spacingClasses = {
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8'
  };

  return forwardRef(({ className, ...props }, ref) => (
    <Separator
      ref={ref}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  ));
};

// Simple separator for quick use
export const SimpleSeparator = ({ 
  text,
  icon,
  spacing = 'md',
  ...props 
}) => {
  if (text) {
    return <SeparatorWithText {...props}>{text}</SeparatorWithText>;
  }
  
  if (icon) {
    return <SeparatorWithIcon icon={icon} {...props} />;
  }
  
  const SpacedSeparator = createSeparatorWithSpacing(spacing);
  return <SpacedSeparator {...props} />;
};

export default Separator;