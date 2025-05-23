import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(({ 
  className, 
  label,
  error,
  helperText,
  required,
  disabled,
  resize = 'vertical',
  rows = 4,
  maxLength,
  showCharCount = false,
  ...props 
}, ref) => {
  const [charCount, setCharCount] = React.useState(props.value?.length || 0);

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const textareaClasses = cn(
    // Base styles
    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    
    // Resize options
    {
      'resize-none': resize === 'none',
      'resize-y': resize === 'vertical',
      'resize-x': resize === 'horizontal',
      'resize': resize === 'both'
    },
    
    // Error state
    error && "border-destructive focus-visible:ring-destructive",
    
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-destructive"
        )}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          className={textareaClasses}
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          {...props}
        />
        
        {(showCharCount && maxLength) && (
          <div className={cn(
            "absolute bottom-2 right-2 text-xs text-muted-foreground",
            charCount > maxLength * 0.9 && "text-warning",
            charCount >= maxLength && "text-destructive"
          )}>
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          "text-sm",
          error ? "text-destructive" : "text-muted-foreground"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

// Variants for different use cases
export const TextareaVariants = {
  default: Textarea,
  
  // Auto-resizing textarea
  AutoResize: forwardRef(({ className, ...props }, ref) => {
    const textareaRef = React.useRef(null);
    
    React.useImperativeHandle(ref, () => textareaRef.current);
    
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };
    
    React.useEffect(() => {
      adjustHeight();
    }, [props.value]);
    
    return (
      <Textarea
        ref={textareaRef}
        className={cn("resize-none overflow-hidden", className)}
        onInput={adjustHeight}
        {...props}
      />
    );
  }),
  
  // Code editor style textarea
  Code: forwardRef(({ className, ...props }, ref) => (
    <Textarea
      ref={ref}
      className={cn(
        "font-mono text-sm bg-muted/50 border-muted",
        "focus-visible:bg-background",
        className
      )}
      {...props}
    />
  )),
  
  // Minimal textarea without borders
  Minimal: forwardRef(({ className, ...props }, ref) => (
    <Textarea
      ref={ref}
      className={cn(
        "border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  ))
};

export default Textarea;