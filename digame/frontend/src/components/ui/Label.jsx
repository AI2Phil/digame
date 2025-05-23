import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Label = forwardRef(({ 
  className,
  htmlFor,
  required = false,
  optional = false,
  error = false,
  disabled = false,
  size = 'default',
  children,
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base'
  };

  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        sizeClasses[size],
        error && "text-destructive",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
      {optional && <span className="text-muted-foreground ml-1">(optional)</span>}
    </label>
  );
});

Label.displayName = "Label";

// Enhanced label with description and error message
export const EnhancedLabel = forwardRef(({ 
  className,
  label,
  description,
  error,
  required = false,
  optional = false,
  disabled = false,
  children,
  ...props 
}, ref) => {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label
          ref={ref}
          required={required}
          optional={optional}
          error={!!error}
          disabled={disabled}
          {...props}
        >
          {label}
        </Label>
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
      
      {children}
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

EnhancedLabel.displayName = "EnhancedLabel";

// Field wrapper with label
export const Field = forwardRef(({ 
  className,
  label,
  description,
  error,
  required = false,
  optional = false,
  disabled = false,
  orientation = 'vertical',
  children,
  ...props 
}, ref) => {
  const id = React.useId();

  return (
    <div 
      ref={ref}
      className={cn(
        "space-y-2",
        orientation === 'horizontal' && "flex items-center space-y-0 space-x-3",
        className
      )}
      {...props}
    >
      <div className={cn(
        orientation === 'horizontal' && "flex-shrink-0"
      )}>
        {label && (
          <Label
            htmlFor={id}
            required={required}
            optional={optional}
            error={!!error}
            disabled={disabled}
          >
            {label}
          </Label>
        )}
        
        {description && orientation === 'vertical' && (
          <p className={cn(
            "text-xs text-muted-foreground mt-1",
            error && "text-destructive",
            disabled && "opacity-50"
          )}>
            {description}
          </p>
        )}
      </div>
      
      <div className="flex-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id: child.props.id || id,
              'aria-describedby': description ? `${id}-description` : undefined,
              'aria-invalid': error ? 'true' : undefined,
              disabled: disabled || child.props.disabled
            });
          }
          return child;
        })}
        
        {description && orientation === 'horizontal' && (
          <p 
            id={`${id}-description`}
            className={cn(
              "text-xs text-muted-foreground mt-1",
              error && "text-destructive",
              disabled && "opacity-50"
            )}
          >
            {description}
          </p>
        )}
        
        {error && (
          <p className="text-xs text-destructive mt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

Field.displayName = "Field";

// Predefined label variants
export const LabelVariants = {
  // Floating label
  Floating: forwardRef(({ className, children, ...props }, ref) => (
    <Label
      ref={ref}
      className={cn(
        "absolute left-3 top-3 text-muted-foreground transition-all duration-200",
        "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base",
        "peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary",
        "peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs",
        className
      )}
      {...props}
    >
      {children}
    </Label>
  )),

  // Inline label
  Inline: forwardRef(({ className, children, ...props }, ref) => (
    <Label
      ref={ref}
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      {children}
    </Label>
  )),

  // Badge-style label
  Badge: forwardRef(({ className, children, ...props }, ref) => (
    <Label
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Label>
  ))
};

// Hook for label state
export const useLabelState = () => {
  const [focused, setFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  const handleFocus = React.useCallback(() => {
    setFocused(true);
  }, []);

  const handleBlur = React.useCallback(() => {
    setFocused(false);
  }, []);

  const handleValueChange = React.useCallback((value) => {
    setHasValue(!!value);
  }, []);

  return {
    focused,
    hasValue,
    handleFocus,
    handleBlur,
    handleValueChange,
    isFloating: focused || hasValue
  };
};

// Form section with label
export const FormSection = forwardRef(({ 
  className,
  title,
  description,
  children,
  ...props 
}, ref) => (
  <div ref={ref} className={cn("space-y-4", className)} {...props}>
    {title && (
      <div className="space-y-1">
        <h3 className="text-lg font-medium leading-none">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
));

FormSection.displayName = "FormSection";

// Utility function to create field props
export const createFieldProps = (label, options = {}) => {
  return {
    label,
    required: options.required || false,
    optional: options.optional || false,
    description: options.description,
    error: options.error,
    disabled: options.disabled || false
  };
};

export default Label;