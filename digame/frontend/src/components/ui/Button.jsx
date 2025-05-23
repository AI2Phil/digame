import React, { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}, ref) => {
  
  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
  `;

  // Size variants
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs h-6',
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14'
  };

  // Variant styles
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 text-white
      hover:from-blue-700 hover:to-blue-800
      focus:ring-blue-500
      shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5
    `,
    secondary: `
      bg-white text-gray-900 border border-gray-300
      hover:bg-gray-50 hover:border-gray-400
      focus:ring-gray-500
      shadow-sm hover:shadow-md
    `,
    ghost: `
      bg-transparent text-gray-700 
      hover:bg-gray-100 hover:text-gray-900
      focus:ring-gray-500
    `,
    destructive: `
      bg-gradient-to-r from-red-600 to-red-700 text-white
      hover:from-red-700 hover:to-red-800
      focus:ring-red-500
      shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5
    `,
    outline: `
      bg-transparent border-2 border-blue-600 text-blue-600
      hover:bg-blue-600 hover:text-white
      focus:ring-blue-500
      transition-colors duration-200
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700 text-white
      hover:from-green-700 hover:to-green-800
      focus:ring-green-500
      shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5
    `,
    warning: `
      bg-gradient-to-r from-orange-600 to-orange-700 text-white
      hover:from-orange-700 hover:to-orange-800
      focus:ring-orange-500
      shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5
    `
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Shine effect for primary buttons
  const ShineEffect = () => (
    <div className="absolute inset-0 -top-px overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shine" />
    </div>
  );

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'cursor-wait' : ''}
    ${className}
    group
  `.trim().replace(/\s+/g, ' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Shine effect for gradient buttons */}
      {(variant === 'primary' || variant === 'destructive' || variant === 'success' || variant === 'warning') && (
        <ShineEffect />
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      
      {/* Button content */}
      <div className={`flex items-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </span>
        )}
        
        {/* Button text */}
        {children && (
          <span className="truncate">
            {children}
          </span>
        )}
        
        {/* Right icon */}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </span>
        )}
      </div>
    </button>
  );
});

Button.displayName = 'Button';

// Button group component for related actions
export const ButtonGroup = ({ children, className = '', orientation = 'horizontal' }) => {
  const groupClasses = `
    inline-flex
    ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}
    ${orientation === 'horizontal' ? '[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg' : '[&>button]:rounded-none [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg'}
    ${orientation === 'horizontal' ? '[&>button:not(:last-child)]:border-r-0' : '[&>button:not(:last-child)]:border-b-0'}
    ${className}
  `;

  return (
    <div className={groupClasses}>
      {children}
    </div>
  );
};

// Icon button component
export const IconButton = forwardRef(({ 
  icon, 
  'aria-label': ariaLabel,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props 
}, ref) => {
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`${iconSizes[size]} p-0 ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {typeof icon === 'string' ? <span className="text-lg">{icon}</span> : icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

export default Button;