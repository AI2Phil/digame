import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

const Checkbox = forwardRef(({ 
  className,
  label,
  description,
  error,
  disabled = false,
  checked = false,
  indeterminate = false,
  onCheckedChange,
  size = 'default',
  variant = 'default',
  required = false,
  ...props 
}, ref) => {
  const handleChange = (e) => {
    if (!disabled) {
      onCheckedChange?.(e.target.checked);
    }
  };

  const sizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const variantClasses = {
    default: 'border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
    destructive: 'border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground',
    success: 'border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white',
    warning: 'border-yellow-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:text-white'
  };

  const checkboxClasses = cn(
    // Base styles
    "peer shrink-0 rounded-sm border border-primary ring-offset-background",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "transition-colors duration-200",
    
    // Size variants
    sizeClasses[size],
    
    // Variant styles
    variantClasses[variant],
    
    // Checked state
    (checked || indeterminate) && "bg-primary border-primary text-primary-foreground",
    
    // Error state
    error && "border-destructive focus-visible:ring-destructive",
    
    className
  );

  const CheckboxComponent = (
    <div className="relative">
      <input
        ref={ref}
        type="checkbox"
        className={checkboxClasses}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        data-state={indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"}
        {...props}
      />
      
      {/* Check/Indeterminate Icon */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none",
        "text-current transition-opacity duration-200",
        (checked || indeterminate) ? "opacity-100" : "opacity-0"
      )}>
        {indeterminate ? (
          <Minus className={cn("stroke-[3]", sizeClasses[size])} />
        ) : (
          <Check className={cn("stroke-[3]", sizeClasses[size])} />
        )}
      </div>
    </div>
  );

  // If no label, return just the checkbox
  if (!label && !description) {
    return CheckboxComponent;
  }

  // Return checkbox with label and description
  return (
    <div className="flex items-start space-x-2">
      {CheckboxComponent}
      
      <div className="grid gap-1.5 leading-none">
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              "cursor-pointer",
              error && "text-destructive"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        {description && (
          <p className={cn(
            "text-xs text-muted-foreground",
            error && "text-destructive"
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
    </div>
  );
});

Checkbox.displayName = "Checkbox";

// Checkbox Group Component
export const CheckboxGroup = ({ 
  children, 
  value = [], 
  onValueChange, 
  disabled = false,
  className,
  label,
  description,
  error,
  required = false,
  ...props 
}) => {
  const handleCheckboxChange = (checkboxValue, checked) => {
    if (disabled) return;
    
    const newValue = checked 
      ? [...value, checkboxValue]
      : value.filter(v => v !== checkboxValue);
    
    onValueChange?.(newValue);
  };

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
        </div>
      )}
      
      <div className="space-y-2">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === CheckboxGroupItem) {
            return React.cloneElement(child, {
              checked: value.includes(child.props.value),
              onCheckedChange: (checked) => handleCheckboxChange(child.props.value, checked),
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

// Checkbox Group Item
export const CheckboxGroupItem = forwardRef(({ 
  value, 
  children, 
  ...props 
}, ref) => (
  <Checkbox ref={ref} {...props}>
    {children}
  </Checkbox>
));

CheckboxGroupItem.displayName = "CheckboxGroupItem";

// Predefined checkbox variants
export const CheckboxVariants = {
  // Card-style checkbox
  Card: forwardRef(({ className, children, ...props }, ref) => (
    <div className={cn(
      "flex items-center space-x-2 rounded-lg border p-4 cursor-pointer",
      "hover:bg-accent hover:text-accent-foreground",
      "has-[:checked]:bg-accent has-[:checked]:text-accent-foreground has-[:checked]:border-primary",
      className
    )}>
      <Checkbox ref={ref} {...props} />
      <div className="flex-1">{children}</div>
    </div>
  )),

  // Switch-style checkbox
  Switch: forwardRef(({ className, ...props }, ref) => (
    <Checkbox
      ref={ref}
      className={cn(
        "w-11 h-6 rounded-full bg-input border-0",
        "data-[state=checked]:bg-primary",
        "relative transition-colors",
        className
      )}
      {...props}
    />
  )),

  // Minimal checkbox without border
  Minimal: forwardRef(({ className, ...props }, ref) => (
    <Checkbox
      ref={ref}
      className={cn(
        "border-0 bg-muted",
        "data-[state=checked]:bg-primary",
        className
      )}
      {...props}
    />
  ))
};

// Hook for checkbox group state
export const useCheckboxGroup = (initialValue = []) => {
  const [value, setValue] = React.useState(initialValue);

  const toggle = React.useCallback((item) => {
    setValue(prev => 
      prev.includes(item) 
        ? prev.filter(v => v !== item)
        : [...prev, item]
    );
  }, []);

  const add = React.useCallback((item) => {
    setValue(prev => prev.includes(item) ? prev : [...prev, item]);
  }, []);

  const remove = React.useCallback((item) => {
    setValue(prev => prev.filter(v => v !== item));
  }, []);

  const clear = React.useCallback(() => {
    setValue([]);
  }, []);

  const isChecked = React.useCallback((item) => {
    return value.includes(item);
  }, [value]);

  return {
    value,
    setValue,
    toggle,
    add,
    remove,
    clear,
    isChecked
  };
};

export default Checkbox;