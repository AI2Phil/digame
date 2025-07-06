import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

const Checkbox = forwardRef(/** @param {{className?: string, label?: string, description?: string, error?: string, disabled?: boolean, checked?: boolean, indeterminate?: boolean, onCheckedChange?: (checked: boolean) => void, size?: string, variant?: string, required?: boolean} & React.InputHTMLAttributes<HTMLInputElement>} props */ ({
  className,
  label,
  description,
  error,
  disabled,
  checked,
  indeterminate,
  onCheckedChange,
  size,
  variant,
  required,
  ...props
}, ref) => {
  // Set default values
  const finalDisabled = disabled ?? false;
  const finalChecked = checked ?? false;
  const finalIndeterminate = indeterminate ?? false;
  const finalSize = size ?? 'default';
  const finalVariant = variant ?? 'default';
  const finalRequired = required ?? false;
  const handleChange = (e) => {
    if (!finalDisabled) {
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
    sizeClasses[finalSize],
    
    // Variant styles
    variantClasses[finalVariant],
    
    // Checked state
    (finalChecked || finalIndeterminate) && "bg-primary border-primary text-primary-foreground",
    
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
        checked={finalChecked}
        onChange={handleChange}
        disabled={finalDisabled}
        required={finalRequired}
        data-state={finalIndeterminate ? "indeterminate" : finalChecked ? "checked" : "unchecked"}
        {...props}
      />
      
      {/* Check/Indeterminate Icon */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none",
        "text-current transition-opacity duration-200",
        (finalChecked || finalIndeterminate) ? "opacity-100" : "opacity-0"
      )}>
        {finalIndeterminate ? (
          <Minus className={cn("stroke-[3]", sizeClasses[finalSize])} />
        ) : (
          <Check className={cn("stroke-[3]", sizeClasses[finalSize])} />
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
            {finalRequired && <span className="text-destructive ml-1">*</span>}
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
/**
 * @param {{
 *   children?: React.ReactNode,
 *   value?: any[],
 *   onValueChange?: (value: any[]) => void,
 *   disabled?: boolean,
 *   className?: string,
 *   label?: string,
 *   description?: string,
 *   error?: string,
 *   required?: boolean
 * } & React.HTMLAttributes<HTMLDivElement>} props
 */
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
export const CheckboxGroupItem = forwardRef(/** @param {{
  value?: any,
  children?: React.ReactNode
} & React.ComponentProps<typeof Checkbox>} props */ ({
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
  Card: forwardRef(/** @param {{className?: string, children?: React.ReactNode} & React.ComponentProps<typeof Checkbox>} props */ ({ className, children, ...props }, ref) => (
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
  Switch: forwardRef(/** @param {{className?: string} & React.ComponentProps<typeof Checkbox>} props */ ({ className, ...props }, ref) => (
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
  Minimal: forwardRef(/** @param {{className?: string} & React.ComponentProps<typeof Checkbox>} props */ ({ className, ...props }, ref) => (
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
/**
 * @param {any[]} [initialValue=[]] - Initial checkbox group value
 * @returns {{
 *   value: any[],
 *   setValue: (value: any[]) => void,
 *   toggle: (item: any) => void,
 *   add: (item: any) => void,
 *   remove: (item: any) => void,
 *   clear: () => void,
 *   isChecked: (item: any) => boolean
 * }}
 */
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

// Named exports for compatibility
export { Checkbox };
export default Checkbox;