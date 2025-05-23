import React, { useState, forwardRef } from 'react';

// Main Input component
const Input = forwardRef(({ 
  type = 'text',
  variant = 'default',
  size = 'md',
  placeholder = '',
  disabled = false,
  error = false,
  success = false,
  icon,
  iconPosition = 'left',
  clearable = false,
  loading = false,
  className = '',
  onChange,
  onClear,
  ...props 
}, ref) => {

  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-3 py-2 text-sm h-10',
    lg: 'px-4 py-3 text-base h-12'
  };

  // Variant styles
  const variantClasses = {
    default: `
      border-gray-300 bg-white text-gray-900
      focus:border-blue-500 focus:ring-blue-500
    `,
    filled: `
      border-transparent bg-gray-100 text-gray-900
      focus:border-blue-500 focus:ring-blue-500 focus:bg-white
    `,
    flushed: `
      border-0 border-b-2 border-gray-300 bg-transparent rounded-none px-0
      focus:border-blue-500 focus:ring-0
    `,
    unstyled: `
      border-0 bg-transparent p-0 focus:ring-0
    `
  };

  // State-based styles
  const getStateClasses = () => {
    if (error) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    }
    if (success) {
      return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    }
    return variantClasses[variant];
  };

  // Base input classes
  const baseClasses = `
    w-full rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
    ${sizeClasses[size]}
    ${getStateClasses()}
    ${icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${clearable && props.value ? 'pr-10' : ''}
    ${type === 'password' ? 'pr-10' : ''}
    ${className}
  `;

  const handleChange = (e) => {
    onChange?.(e);
  };

  const handleClear = () => {
    const syntheticEvent = {
      target: { value: '' },
      currentTarget: { value: '' }
    };
    onChange?.(syntheticEvent);
    onClear?.();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="relative">
      {/* Left Icon */}
      {icon && iconPosition === 'left' && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
      )}

      {/* Input Field */}
      <input
        ref={ref}
        type={inputType}
        placeholder={placeholder}
        disabled={disabled || loading}
        className={baseClasses}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {/* Right Side Icons */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        {/* Loading Spinner */}
        {loading && (
          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        )}

        {/* Clear Button */}
        {clearable && props.value && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Password Toggle */}
        {type === 'password' && !loading && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}

        {/* Right Icon */}
        {icon && iconPosition === 'right' && !clearable && !loading && type !== 'password' && (
          <div className="text-gray-400">
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </div>
        )}

        {/* Success/Error Icons */}
        {success && !loading && (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {error && !loading && (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

// Input Group component for combining inputs with addons
export const InputGroup = ({ children, className = '' }) => {
  return (
    <div className={`flex ${className}`}>
      {children}
    </div>
  );
};

// Input Addon component
export const InputAddon = ({ 
  children, 
  position = 'left',
  className = '' 
}) => {
  const positionClasses = {
    left: 'rounded-l-lg border-r-0',
    right: 'rounded-r-lg border-l-0'
  };

  return (
    <div className={`
      flex items-center px-3 py-2 bg-gray-100 border border-gray-300 text-gray-500 text-sm
      ${positionClasses[position]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Search Input component
export const SearchInput = ({ 
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);

    setDebounceTimer(timer);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch?.('');
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleChange}
      onClear={handleClear}
      clearable
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      {...props}
    />
  );
};

// Number Input component
export const NumberInput = ({ 
  min,
  max,
  step = 1,
  value,
  onChange,
  ...props 
}) => {
  const handleIncrement = () => {
    const newValue = (parseFloat(value) || 0) + step;
    if (max === undefined || newValue <= max) {
      onChange?.({ target: { value: newValue.toString() } });
    }
  };

  const handleDecrement = () => {
    const newValue = (parseFloat(value) || 0) - step;
    if (min === undefined || newValue >= min) {
      onChange?.({ target: { value: newValue.toString() } });
    }
  };

  return (
    <div className="relative">
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="pr-16"
        {...props}
      />
      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
        <button
          type="button"
          onClick={handleIncrement}
          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

// File Input component
export const FileInput = ({ 
  accept,
  multiple = false,
  onChange,
  className = '',
  ...props 
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    onChange?.({ target: { files } });
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center transition-colors
        ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="hidden"
        id="file-input"
        {...props}
      />
      <label htmlFor="file-input" className="cursor-pointer">
        <div className="text-gray-600">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span>
            {' '}or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {accept || 'Any file type'}
          </p>
        </div>
      </label>
    </div>
  );
};

export default Input;