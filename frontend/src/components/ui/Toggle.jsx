import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Toggle = forwardRef(({ 
  className,
  pressed = false,
  onPressedChange,
  disabled = false,
  size = 'default',
  variant = 'default',
  children,
  ...props 
}, ref) => {
  const handleClick = () => {
    if (!disabled) {
      onPressedChange?.(!pressed);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    default: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  };

  const variantClasses = {
    default: cn(
      "bg-transparent hover:bg-muted hover:text-muted-foreground",
      "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
    ),
    outline: cn(
      "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
    )
  };

  return (
    <button
      ref={ref}
      type="button"
      role="button"
      aria-pressed={pressed}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      data-state={pressed ? "on" : "off"}
      {...props}
    >
      {children}
    </button>
  );
});

Toggle.displayName = "Toggle";

// Predefined toggle variants
export const ToggleVariants = {
  // Icon toggle
  Icon: forwardRef(({ className, children, ...props }, ref) => (
    <Toggle
      ref={ref}
      size="sm"
      className={cn("h-8 w-8 p-0", className)}
      {...props}
    >
      {children}
    </Toggle>
  )),

  // Text toggle
  Text: forwardRef(({ className, ...props }, ref) => (
    <Toggle
      ref={ref}
      variant="outline"
      className={className}
      {...props}
    />
  )),

  // Pill toggle
  Pill: forwardRef(({ className, ...props }, ref) => (
    <Toggle
      ref={ref}
      className={cn("rounded-full", className)}
      {...props}
    />
  ))
};

// Hook for toggle state
export const useToggle = (initialPressed = false) => {
  const [pressed, setPressed] = React.useState(initialPressed);

  const toggle = React.useCallback(() => {
    setPressed(prev => !prev);
  }, []);

  const turnOn = React.useCallback(() => {
    setPressed(true);
  }, []);

  const turnOff = React.useCallback(() => {
    setPressed(false);
  }, []);

  const reset = React.useCallback(() => {
    setPressed(initialPressed);
  }, [initialPressed]);

  return {
    pressed,
    setPressed,
    onPressedChange: setPressed,
    toggle,
    turnOn,
    turnOff,
    reset
  };
};

export default Toggle;