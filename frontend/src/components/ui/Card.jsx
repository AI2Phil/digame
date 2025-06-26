import React from 'react';

const Card = React.forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = `
    bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
    theme-transition
  `;

  const variants = {
    default: 'shadow-sm',
    elevated: 'shadow-md hover:shadow-lg',
    outlined: 'border-2',
    glass: 'glass-effect',
    flat: 'shadow-none border-0 bg-gray-50 dark:bg-gray-900'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const hoverClasses = hover ? 'hover-lift cursor-pointer' : '';

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${paddings[padding]}
    ${hoverClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 pb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({
  children,
  className = '',
  as: Component = 'h3',
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`flex items-center pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};