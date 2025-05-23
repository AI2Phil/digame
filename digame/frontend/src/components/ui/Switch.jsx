import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Switch = forwardRef(({ 
  className,
  label,
  description,
  error,
  checked = false,
  onCheckedChange,
  disabled = false,
  size = 'default',
  variant = 'default',
  required = false,
  ...props 
}, ref) => {
  const handleChange = () => {
    if (!disabled) {
      onCheckedChange?.(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleChange();
    }
  };

  const sizeClasses = {
    sm: {
      track: 'h-4 w-7',
      thumb: 'h-3 w-3 data-[state=checked]:translate-x-3'
    },
    default: {
      track: 'h-5 w-9',
      thumb: 'h-4 w-4 data-[state=checked]:translate-x-4'
    },
    lg: {
      track: 'h-6 w-11',
      thumb: 'h-5 w-5 data-[state=checked]:translate-x-5'
    }
  };

  const variantClasses = {
    default: {
      track: 'bg-input data-[state=checked]:bg-primary',
      thumb: 'bg-background'
    },
    destructive: {
      track: 'bg-input data-[state=checked]:bg-destructive',
      thumb: 'bg-background'
    },
    success: {
      track: 'bg-input data-[state=checked]:bg-green-600',
      thumb: 'bg-background'
    },
    warning: {
      track: 'bg-input data-[state=checked]:bg-yellow-600',
      thumb: 'bg-background'
    }
  };

  const trackClasses = cn(
    // Base track styles
    "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
    
    // Size variants
    sizeClasses[size].track,
    
    // Variant styles
    variantClasses[variant].track,
    
    // Error state
    error && "data-[state=checked]:bg-destructive",
    
    className
  );

  const thumbClasses = cn(
    // Base thumb styles
    "pointer-events-none block rounded-full shadow-lg ring-0 transition-transform",
    
    // Size and position variants
    sizeClasses[size].thumb,
    
    // Variant styles
    variantClasses[variant].thumb,
    
    // Checked state
    checked && "translate-x-4"
  );

  const SwitchComponent = (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={trackClasses}
      data-state={checked ? "checked" : "unchecked"}
      {...props}
    >
      <span className={thumbClasses} data-state={checked ? "checked" : "unchecked"} />
    </button>
  );

  // If no label, return just the switch
  if (!label && !description) {
    return SwitchComponent;
  }

  // Return switch with label and description
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="grid gap-1.5 leading-none flex-1">
        {label && (
          <label
            className={cn(
              "text-sm font-medium leading-none cursor-pointer",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-destructive",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={!disabled ? handleChange : undefined}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        {description && (
          <p className={cn(
            "text-xs text-muted-foreground",
            error && "text-destructive",
            disabled && "opacity-50"
          )}>
            {description}
          </p>
        )}
        
        {error && (
          <p className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
      
      {SwitchComponent}
    </div>
  );
});

Switch.displayName = "Switch";

// Switch Group Component for multiple switches
export const SwitchGroup = ({ 
  children, 
  disabled = false,
  className,
  label,
  description,
  error,
  orientation = 'vertical',
  ...props 
}) => {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <label className={cn(
              "text-sm font-medium leading-none",
              error && "text-destructive",
              disabled && "opacity-50"
            )}>
              {label}
            </label>
          )}
          
          {description && (
            <p className={cn(
              "text-xs text-muted-foreground",
              error && "text-destructive",
              disabled && "opacity-50"
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn(
        orientation === 'horizontal' ? "flex flex-wrap gap-4" : "space-y-3"
      )}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              disabled: disabled || child.props.disabled
            });
          }
          return child;
        })}
      </div>
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

// Predefined switch variants
export const SwitchVariants = {
  // Card-style switch
  Card: forwardRef(({ className, children, ...props }, ref) => (
    <div className={cn(
      "flex items-center justify-between rounded-lg border p-4",
      "hover:bg-accent hover:text-accent-foreground transition-colors",
      className
    )}>
      <div className="flex-1">{children}</div>
      <Switch ref={ref} {...props} />
    </div>
  )),

  // Compact switch without spacing
  Compact: forwardRef(({ className, ...props }, ref) => (
    <Switch
      ref={ref}
      size="sm"
      className={className}
      {...props}
    />
  )),

  // iOS-style switch
  iOS: forwardRef(({ className, ...props }, ref) => (
    <Switch
      ref={ref}
      className={cn(
        "bg-gray-200 data-[state=checked]:bg-green-500",
        "border-0 shadow-inner",
        className
      )}
      {...props}
    />
  )),

  // Material Design style switch
  Material: forwardRef(({ className, ...props }, ref) => (
    <Switch
      ref={ref}
      className={cn(
        "bg-gray-300 data-[state=checked]:bg-blue-600",
        "h-6 w-10",
        className
      )}
      {...props}
    />
  ))
};

// Hook for switch state management
export const useSwitchState = (initialValue = false) => {
  const [checked, setChecked] = React.useState(initialValue);

  const toggle = React.useCallback(() => {
    setChecked(prev => !prev);
  }, []);

  const turnOn = React.useCallback(() => {
    setChecked(true);
  }, []);

  const turnOff = React.useCallback(() => {
    setChecked(false);
  }, []);

  const reset = React.useCallback(() => {
    setChecked(initialValue);
  }, [initialValue]);

  return {
    checked,
    setChecked,
    onCheckedChange: setChecked,
    toggle,
    turnOn,
    turnOff,
    reset
  };
};

// Hook for multiple switches state management
export const useSwitchGroupState = (initialValues = {}) => {
  const [values, setValues] = React.useState(initialValues);

  const updateSwitch = React.useCallback((key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleSwitch = React.useCallback((key) => {
    setValues(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetAll = React.useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  const turnAllOn = React.useCallback(() => {
    const allOn = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setValues(allOn);
  }, [values]);

  const turnAllOff = React.useCallback(() => {
    const allOff = Object.keys(values).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
    setValues(allOff);
  }, [values]);

  return {
    values,
    setValues,
    updateSwitch,
    toggleSwitch,
    resetAll,
    turnAllOn,
    turnAllOff,
    isChecked: (key) => Boolean(values[key])
  };
};

export default Switch;