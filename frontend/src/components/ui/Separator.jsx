import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

/**
 * @typedef {Object} SeparatorProps
 * @property {string} [className] - Additional CSS classes
 * @property {'horizontal'|'vertical'} [orientation] - Separator orientation
 * @property {boolean} [decorative] - Whether separator is decorative
 */

const Separator = forwardRef(
  /** @param {SeparatorProps} props */
  ({
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

/**
 * @typedef {Object} SeparatorVariantProps
 * @property {string} [className] - Additional CSS classes
 * @property {'horizontal'|'vertical'} [orientation] - Separator orientation
 * @property {string} [color] - Color variant for colored separator
 */

// Predefined separator variants
export const SeparatorVariants = {
  // Dashed separator
  Dashed: forwardRef(
    /** @param {SeparatorVariantProps} props */
    ({ className, ...props }, ref) => (
      <Separator
        ref={ref}
        className={cn("border-dashed border-t border-border bg-transparent", className)}
        {...props}
      />
    )
  ),

  // Dotted separator
  Dotted: forwardRef(
    /** @param {SeparatorVariantProps} props */
    ({ className, ...props }, ref) => (
      <Separator
        ref={ref}
        className={cn("border-dotted border-t border-border bg-transparent", className)}
        {...props}
      />
    )
  ),

  // Thick separator
  Thick: forwardRef(
    /** @param {SeparatorVariantProps} props */
    ({ className, orientation = 'horizontal', ...props }, ref) => (
      <Separator
        ref={ref}
        orientation={orientation}
        className={cn(
          orientation === 'horizontal' ? "h-1" : "w-1",
          className
        )}
        {...props}
      />
    )
  ),

  // Gradient separator
  Gradient: forwardRef(
    /** @param {SeparatorVariantProps} props */
    ({ className, orientation = 'horizontal', ...props }, ref) => (
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
    )
  ),

  // Colored separator
  Colored: forwardRef(
    /** @param {SeparatorVariantProps} props */
    ({ className, color = 'primary', ...props }, ref) => (
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
    )
  )
};

/**
 * @typedef {Object} SeparatorWithTextProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Text content
 * @property {'horizontal'|'vertical'} [orientation] - Separator orientation
 * @property {'start'|'center'|'end'} [position] - Text position
 */

// Separator with text
export const SeparatorWithText = forwardRef(
  /** @param {SeparatorWithTextProps} props */
  ({
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

/**
 * @typedef {Object} SeparatorWithIconProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} icon - Icon element
 * @property {'horizontal'|'vertical'} [orientation] - Separator orientation
 */

// Separator with icon
export const SeparatorWithIcon = forwardRef(
  /** @param {SeparatorWithIconProps} props */
  ({
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

/**
 * @typedef {Object} SectionSeparatorProps
 * @property {string} [className] - Additional CSS classes
 * @property {string} [title] - Section title
 * @property {string} [subtitle] - Section subtitle
 * @property {'horizontal'|'vertical'} [orientation] - Separator orientation
 */

// Section separator with title
export const SectionSeparator = forwardRef(
  /** @param {SectionSeparatorProps} props */
  ({
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

/**
 * @typedef {Object} BreadcrumbSeparatorProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Separator content
 */

// Breadcrumb separator
export const BreadcrumbSeparator = forwardRef(
  /** @param {BreadcrumbSeparatorProps} props */
  ({
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

/**
 * @typedef {Object} MenuSeparatorProps
 * @property {string} [className] - Additional CSS classes
 */

// Menu separator
export const MenuSeparator = forwardRef(
  /** @param {MenuSeparatorProps} props */
  ({
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

  return forwardRef(
    /** @param {SeparatorProps} props */
    ({ className, ...props }, ref) => (
    <Separator
      ref={ref}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  ));
};

/**
 * @typedef {Object} SimpleSeparatorProps
 * @property {string} [text] - Text content for separator
 * @property {React.ReactNode} [icon] - Icon element for separator
 * @property {'xs'|'sm'|'md'|'lg'|'xl'} [spacing] - Spacing size
 */

// Simple separator for quick use
export const SimpleSeparator = (
  /** @param {SimpleSeparatorProps} props */
  {
    text,
    icon,
    spacing = 'md',
    ...props
  }
) => {
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
export { Separator };