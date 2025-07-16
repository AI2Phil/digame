import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const RadioGroup = forwardRef((/** @type {{className?: string, value?: any, onValueChange?: function, disabled?: boolean, orientation?: 'horizontal'|'vertical', children?: any}} */ {
  className,
  value,
  onValueChange,
  disabled = false,
  orientation = 'vertical',
  children,
  ...props
}, ref) => {
  return (
    <RadioGroupProvider value={{ value, onValueChange, disabled }}>
      <div
        ref={ref}
        className={cn(
          "grid gap-2",
          orientation === 'horizontal' ? "grid-flow-col auto-cols-max" : "grid-rows-auto",
          className
        )}
        role="radiogroup"
        {...props}
      >
        {children}
      </div>
    </RadioGroupProvider>
  );
});

RadioGroup.displayName = "RadioGroup";

const RadioGroupContext = React.createContext({
  value: undefined,
  onValueChange: (/** @type {any} */ value) => {},
  disabled: false
});

/**
 * @param {{children: any, value: any}} props
 */
const RadioGroupProvider = ({ children, value }) => (
  <RadioGroupContext.Provider value={value}>
    {children}
  </RadioGroupContext.Provider>
);

const useRadioGroup = () => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error('useRadioGroup must be used within RadioGroup');
  }
  return context;
};

const RadioGroupItem = forwardRef((/** @type {{className?: string, value?: any, disabled?: boolean, size?: 'sm'|'default'|'lg'}} */ {
  className,
  value,
  disabled: itemDisabled = false,
  size = 'default',
  ...props
}, ref) => {
  const { value: groupValue, onValueChange, disabled: groupDisabled } = useRadioGroup();
  const disabled = groupDisabled || itemDisabled;
  const checked = groupValue === value;

  const handleChange = () => {
    if (!disabled && !checked) {
      onValueChange?.(value);
    }
  };

  const sizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={handleChange}
      disabled={disabled}
      className={cn(
        // Base styles
        "aspect-square rounded-full border border-primary text-primary ring-offset-background",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors duration-200",
        
        // Size variants
        sizeClasses[size],
        
        // Checked state
        checked && "bg-primary text-primary-foreground",
        
        className
      )}
      {...props}
    >
      {/* Inner dot */}
      <div className={cn(
        "flex items-center justify-center w-full h-full",
        "transition-opacity duration-200",
        checked ? "opacity-100" : "opacity-0"
      )}>
        <div className={cn(
          "rounded-full bg-current",
          size === 'sm' ? "h-1.5 w-1.5" : size === 'lg' ? "h-2.5 w-2.5" : "h-2 w-2"
        )} />
      </div>
    </button>
  );
});

RadioGroupItem.displayName = "RadioGroupItem";

// Radio with label component
export const Radio = forwardRef((/** @type {{className?: string, label?: string, description?: string, error?: string, value?: any, disabled?: boolean, size?: 'sm'|'default'|'lg'}} */ {
  className,
  label,
  description,
  error,
  value,
  disabled = false,
  size = 'default',
  ...props
}, ref) => {
  // Move useRadioGroup to component level to follow Rules of Hooks
  const { onValueChange } = useRadioGroup();
  
  const RadioComponent = (
    <RadioGroupItem
      ref={ref}
      value={value}
      disabled={disabled}
      size={size}
      className={className}
      {...props}
    />
  );

  // If no label, return just the radio
  if (!label && !description) {
    return RadioComponent;
  }

  // Handle label click
  const handleLabelClick = () => {
    if (!disabled) {
      onValueChange?.(value);
    }
  };

  // Return radio with label and description
  return (
    <div className="flex items-start space-x-2">
      {RadioComponent}
      
      <div className="grid gap-1.5 leading-none">
        {label && (
          <label
            className={cn(
              "text-sm font-medium leading-none cursor-pointer",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-destructive",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleLabelClick}
          >
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
        
        {error && (
          <p className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

Radio.displayName = "Radio";

// Enhanced RadioGroup with label and error handling
export const LabeledRadioGroup = forwardRef((/** @type {{className?: string, label?: string, description?: string, error?: string, required?: boolean, children?: any, disabled?: boolean}} */ {
  className,
  label,
  description,
  error,
  required = false,
  children,
  ...props
}, ref) => {
  return (
    <div className={cn("space-y-3", className)}>
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <label className={cn(
              "text-sm font-medium leading-none",
              error && "text-destructive",
              props.disabled && "opacity-50"
            )}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          
          {description && (
            <p className={cn(
              "text-xs text-muted-foreground",
              error && "text-destructive",
              props.disabled && "opacity-50"
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      
      <RadioGroup ref={ref} {...props}>
        {children}
      </RadioGroup>
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

LabeledRadioGroup.displayName = "LabeledRadioGroup";

// Predefined radio group variants
export const RadioGroupVariants = {
  // Card-style radio group
  Cards: forwardRef((/** @type {{className?: string, children?: any}} */ { className, children, ...props }, ref) => (
    <RadioGroup
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return (
            <div className={cn(
              "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer",
              "hover:bg-accent hover:text-accent-foreground",
              "has-[:checked]:bg-accent has-[:checked]:text-accent-foreground has-[:checked]:border-primary",
              "transition-colors duration-200"
            )}>
              {child}
            </div>
          );
        }
        return child;
      })}
    </RadioGroup>
  )),

  // Inline horizontal radio group
  Inline: forwardRef((/** @type {{className?: string}} */ { className, ...props }, ref) => (
    <RadioGroup
      ref={ref}
      orientation="horizontal"
      className={cn("flex flex-wrap gap-4", className)}
      {...props}
    />
  )),

  // Button-style radio group
  Buttons: forwardRef((/** @type {{className?: string, children?: any, options?: Array}} */ { className, children, options = [], ...props }, ref) => {
    return (
      <RadioGroupProvider value={props}>
        <ButtonRadioGroup className={className} options={options} {...props} />
      </RadioGroupProvider>
    );
  })
};

// Separate component for button radio group to avoid hook violations
const ButtonRadioGroup = ({ className, options = [], ...props }) => {
  const { value, onValueChange, disabled } = useRadioGroup() || {};
  
  return (
    <div className={cn("flex rounded-md border", className)} role="radiogroup">
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isDisabled = disabled || option.disabled;
        
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => !isDisabled && onValueChange?.(option.value)}
            disabled={isDisabled}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              index === 0 && "rounded-l-md",
              index === options.length - 1 && "rounded-r-md",
              index > 0 && "border-l",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

// Hook for radio group state
export const useRadioGroupState = (initialValue = '') => {
  const [value, setValue] = React.useState(initialValue);

  const handleValueChange = React.useCallback((newValue) => {
    setValue(newValue);
  }, []);

  const reset = React.useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  const clear = React.useCallback(() => {
    setValue('');
  }, []);

  return {
    value,
    onValueChange: handleValueChange,
    setValue,
    reset,
    clear
  };
};

// Utility function to create radio options
export const createRadioOptions = (items, labelKey = 'label', valueKey = 'value') => {
  return items.map(item => ({
    label: typeof item === 'string' ? item : item[labelKey],
    value: typeof item === 'string' ? item : item[valueKey],
    disabled: item.disabled || false,
    description: item.description
  }));
};

export { RadioGroup, RadioGroupItem };
export default RadioGroup;