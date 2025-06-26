import React, { forwardRef } from 'react';
import { Dot } from 'lucide-react';
import { cn } from '../../lib/utils';

const InputOTP = forwardRef(({ 
  className,
  maxLength = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  pattern = /^[0-9]*$/,
  placeholder = '',
  render,
  ...props 
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(value);
  const [focusedIndex, setFocusedIndex] = React.useState(autoFocus ? 0 : -1);
  const inputRefs = React.useRef([]);

  const currentValue = value !== undefined ? value : internalValue;

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      const firstEmptyIndex = currentValue.length;
      const targetIndex = Math.min(firstEmptyIndex, maxLength - 1);
      inputRefs.current[targetIndex]?.focus();
    },
    blur: () => {
      inputRefs.current[focusedIndex]?.blur();
    },
    clear: () => {
      const newValue = '';
      setInternalValue(newValue);
      onChange?.(newValue);
      inputRefs.current[0]?.focus();
    }
  }));

  const handleChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
    
    if (newValue.length === maxLength) {
      onComplete?.(newValue);
    }
  };

  const handleInputChange = (index, inputValue) => {
    if (!pattern.test(inputValue) && inputValue !== '') return;

    const newValue = currentValue.split('');
    newValue[index] = inputValue;
    const finalValue = newValue.join('').slice(0, maxLength);
    
    handleChange(finalValue);

    // Move to next input if value was entered
    if (inputValue && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (currentValue[index]) {
        // Clear current input
        const newValue = currentValue.split('');
        newValue[index] = '';
        handleChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        const newValue = currentValue.split('');
        newValue[index - 1] = '';
        handleChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < maxLength - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const newValue = currentValue.split('');
      newValue[index] = '';
      handleChange(newValue.join(''));
    } else if (/^[0-9]$/.test(e.key)) {
      // Handle direct number input
      e.preventDefault();
      handleInputChange(index, e.key);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const validChars = pastedData.split('').filter(char => pattern.test(char));
    const newValue = validChars.slice(0, maxLength).join('');
    
    handleChange(newValue);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(newValue.length, maxLength - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  // Auto-focus first input on mount if autoFocus is true
  React.useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  if (render) {
    return render({ value: currentValue, onChange: handleChange });
  }

  return (
    <OTPInput
      className={className}
      maxLength={maxLength}
      value={currentValue}
      disabled={disabled}
      placeholder={placeholder}
      inputRefs={inputRefs}
      focusedIndex={focusedIndex}
      onInputChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
});

InputOTP.displayName = "InputOTP";

const OTPInput = ({ 
  className,
  maxLength,
  value,
  disabled,
  placeholder,
  inputRefs,
  focusedIndex,
  onInputChange,
  onKeyDown,
  onPaste,
  onFocus,
  onBlur,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        disabled && "opacity-50",
        className
      )}
      {...props}
    >
      {Array.from({ length: maxLength }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={value[index] || ''}
          placeholder={placeholder[index] || ''}
          disabled={disabled}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all",
            "first:rounded-l-md first:border-l last:rounded-r-md",
            "focus:z-10 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "text-center font-medium",
            focusedIndex === index && "z-10 border-ring ring-2 ring-ring ring-offset-2"
          )}
          onChange={(e) => onInputChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={index === 0 ? onPaste : undefined}
          onFocus={() => onFocus(index)}
          onBlur={onBlur}
          maxLength={1}
        />
      ))}
    </div>
  );
};

// Separator component for grouped OTP inputs
export const InputOTPSeparator = forwardRef(({ 
  className,
  ...props 
}, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn("flex w-3 items-center justify-center", className)}
    {...props}
  >
    <Dot className="h-3 w-3" />
  </div>
));

InputOTPSeparator.displayName = "InputOTPSeparator";

// Group component for organizing OTP inputs
export const InputOTPGroup = forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  >
    {children}
  </div>
));

InputOTPGroup.displayName = "InputOTPGroup";

// Slot component for individual OTP input slots
export const InputOTPSlot = forwardRef(({ 
  className,
  index,
  char,
  hasFakeCaret,
  isActive,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all",
      "first:rounded-l-md first:border-l last:rounded-r-md",
      isActive && "z-10 ring-2 ring-ring ring-offset-2",
      className
    )}
    {...props}
  >
    {char}
    {hasFakeCaret && (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
      </div>
    )}
  </div>
));

InputOTPSlot.displayName = "InputOTPSlot";

// Predefined OTP variants
export const InputOTPVariants = {
  // Standard 6-digit OTP
  Standard: forwardRef((props, ref) => (
    <InputOTP ref={ref} maxLength={6} {...props} />
  )),

  // 4-digit PIN
  PIN: forwardRef((props, ref) => (
    <InputOTP ref={ref} maxLength={4} {...props} />
  )),

  // Grouped OTP (e.g., 3-3 format)
  Grouped: forwardRef(({ separator = true, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <InputOTP ref={ref} maxLength={3} {...props} />
      {separator && <InputOTPSeparator />}
      <InputOTP maxLength={3} {...props} />
    </div>
  )),

  // Large OTP for better visibility
  Large: forwardRef(({ className, ...props }, ref) => (
    <InputOTP
      ref={ref}
      className={cn("gap-3", className)}
      maxLength={6}
      {...props}
      render={({ value, onChange }) => (
        <div className="flex items-center gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              value={value[index] || ''}
              className="h-14 w-14 rounded-lg border-2 border-input text-center text-xl font-semibold focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              maxLength={1}
              onChange={(e) => {
                const newValue = value.split('');
                newValue[index] = e.target.value;
                onChange(newValue.join(''));
              }}
            />
          ))}
        </div>
      )}
    />
  ))
};

// Hook for OTP state management
export const useInputOTP = (maxLength = 6, options = {}) => {
  const [value, setValue] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleChange = React.useCallback((newValue) => {
    setValue(newValue);
    setIsComplete(newValue.length === maxLength);
    if (error) setError('');
  }, [maxLength, error]);

  const handleComplete = React.useCallback((completedValue) => {
    if (options.onComplete) {
      options.onComplete(completedValue);
    }
  }, [options]);

  const clear = React.useCallback(() => {
    setValue('');
    setIsComplete(false);
    setError('');
  }, []);

  const validate = React.useCallback((validationFn) => {
    if (validationFn && isComplete) {
      const validationResult = validationFn(value);
      if (validationResult !== true) {
        setError(validationResult || 'Invalid code');
        return false;
      }
    }
    setError('');
    return true;
  }, [value, isComplete]);

  return {
    value,
    setValue: handleChange,
    isComplete,
    error,
    setError,
    clear,
    validate,
    handleComplete
  };
};

// Hook for OTP timer
export const useOTPTimer = (initialTime = 60) => {
  const [timeLeft, setTimeLeft] = React.useState(initialTime);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const start = React.useCallback(() => {
    setTimeLeft(initialTime);
    setIsActive(true);
  }, [initialTime]);

  const stop = React.useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = React.useCallback(() => {
    setTimeLeft(initialTime);
    setIsActive(false);
  }, [initialTime]);

  return {
    timeLeft,
    isActive,
    start,
    stop,
    reset,
    canResend: timeLeft === 0
  };
};

export default InputOTP;