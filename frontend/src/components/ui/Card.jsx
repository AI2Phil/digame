import React from 'react';

// Main Card component
export const Card = ({ 
  children,
  className = '',
  variant = 'default', // default, outlined, elevated
  padding = 'md', // none, sm, md, lg, xl
  ...props 
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-100'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  return (
    <div 
      className={`
        rounded-lg
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header
export const CardHeader = ({ 
  children,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`border-b border-gray-200 pb-4 mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Content
export const CardContent = ({ 
  children,
  className = '',
  padding = 'none', // none, sm, md, lg, xl
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  return (
    <div 
      className={`${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Footer
export const CardFooter = ({ 
  children,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`border-t border-gray-200 pt-4 mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Title
export const CardTitle = ({ 
  children,
  className = '',
  as: Component = 'h3',
  ...props 
}) => {
  return (
    <Component 
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Description
export const CardDescription = ({ 
  children,
  className = '',
  ...props 
}) => {
  return (
    <p 
      className={`text-sm text-gray-600 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export default Card;