import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-200 ease-in-out focus-visible
    disabled:opacity-50 disabled:cursor-not-allowed
    theme-transition
  `;

  const variants = {
    primary: `
      bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md
      dark:bg-blue-500 dark:hover:bg-blue-600
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      dark:focus:ring-offset-gray-800
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300
      dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600
      focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
      dark:focus:ring-offset-gray-800
    `,
    outline: `
      bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300
      dark:hover:bg-gray-800 dark:text-gray-300 dark:border-gray-600
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      dark:focus:ring-offset-gray-800
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 text-gray-700
      dark:hover:bg-gray-800 dark:text-gray-300
      focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
      dark:focus:ring-offset-gray-800
    `,
    danger: `
      bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md
      dark:bg-red-500 dark:hover:bg-red-600
      focus:ring-2 focus:ring-red-500 focus:ring-offset-2
      dark:focus:ring-offset-gray-800
    `,
    success: `
      bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md
      dark:bg-green-500 dark:hover:bg-green-600
      focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      dark:focus:ring-offset-gray-800
    `,
    warning: `
      bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow-md
      dark:bg-yellow-600 dark:hover:bg-yellow-700
      focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
      dark:focus:ring-offset-gray-800
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

// ButtonGroup component
export const ButtonGroup = ({ children, className = '', size = 'md', variant = 'primary' }) => {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`} role="group">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          return React.cloneElement(child, {
            size,
            variant,
            className: `
              ${child.props.className || ''}
              ${isFirst ? 'rounded-r-none' : ''}
              ${isLast ? 'rounded-l-none' : ''}
              ${!isFirst && !isLast ? 'rounded-none' : ''}
              ${!isFirst ? 'border-l-0' : ''}
            `.trim()
          });
        }
        return child;
      })}
    </div>
  );
};

// IconButton component
export const IconButton = React.forwardRef(({
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      className={`${sizeClasses[size]} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// Named export for convenience
export { Button };
export default Button;