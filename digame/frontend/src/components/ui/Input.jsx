import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = React.forwardRef(({
  type = 'text',
  label,
  placeholder,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = !!error;
  const hasSuccess = !!success;
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon || (type === 'password' && showPasswordToggle) || hasError || hasSuccess;

  const baseClasses = `
    w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg
    placeholder-gray-400 dark:placeholder-gray-500
    text-gray-900 dark:text-gray-100
    transition-all duration-200 ease-in-out theme-transition
    focus:outline-none focus:ring-2 focus:ring-offset-2
    dark:focus:ring-offset-gray-800
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const stateClasses = hasError
    ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
    : hasSuccess
    ? 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500';

  const paddingClasses = `
    ${hasLeftIcon ? 'pl-10' : 'pl-3'}
    ${hasRightIcon ? 'pr-10' : 'pr-3'}
  `;

  const inputClasses = `
    ${baseClasses}
    ${stateClasses}
    ${paddingClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const renderIcon = (icon, position) => {
    const positionClasses = position === 'left' ? 'left-3' : 'right-3';
    const iconClasses = `absolute ${positionClasses} top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500`;

    if (position === 'right' && type === 'password' && showPasswordToggle) {
      return (
        <button
          type="button"
          onClick={handlePasswordToggle}
          className={`${iconClasses} hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300`}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      );
    }

    if (position === 'right' && hasError) {
      return (
        <AlertCircle className={`${iconClasses} text-red-500 w-4 h-4`} aria-hidden="true" />
      );
    }

    if (position === 'right' && hasSuccess) {
      return (
        <CheckCircle className={`${iconClasses} text-green-500 w-4 h-4`} aria-hidden="true" />
      );
    }

    if (icon) {
      return React.cloneElement(icon, {
        className: `${iconClasses} w-4 h-4`,
        'aria-hidden': 'true'
      });
    }

    return null;
  };

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id || 'input'}-error` : 
            success ? `${props.id || 'input'}-success` : 
            helperText ? `${props.id || 'input'}-helper` : undefined
          }
          {...props}
        />
        
        {hasLeftIcon && renderIcon(leftIcon, 'left')}
        {hasRightIcon && renderIcon(rightIcon, 'right')}
      </div>

      {/* Helper text, error, or success message */}
      {(error || success || helperText) && (
        <div className="text-xs">
          {error && (
            <p
              id={`${props.id || 'input'}-error`}
              className="text-red-600 dark:text-red-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="w-3 h-3" aria-hidden="true" />
              {error}
            </p>
          )}
          {success && !error && (
            <p
              id={`${props.id || 'input'}-success`}
              className="text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" aria-hidden="true" />
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p
              id={`${props.id || 'input'}-helper`}
              className="text-gray-500 dark:text-gray-400"
            >
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;