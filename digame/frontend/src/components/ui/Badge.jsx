import React from 'react';

// Main Badge component
export const Badge = ({ 
  children,
  variant = 'default', // default, secondary, success, warning, error, info, outline
  size = 'md', // xs, sm, md, lg
  className = '',
  icon,
  removable = false,
  onRemove,
  dot = false,
  pulse = false
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-gray-600 text-white',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    outline: 'bg-transparent border border-gray-300 text-gray-700'
  };

  const dotClasses = {
    default: 'bg-gray-500',
    secondary: 'bg-gray-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    outline: 'bg-gray-500'
  };

  if (dot) {
    return (
      <span className={`
        inline-flex items-center space-x-1.5 ${className}
      `}>
        <span className={`
          w-2 h-2 rounded-full
          ${dotClasses[variant]}
          ${pulse ? 'animate-pulse' : ''}
        `} />
        <span className="text-sm text-gray-700">{children}</span>
      </span>
    );
  }

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${pulse ? 'animate-pulse' : ''}
      ${className}
    `}>
      {icon && (
        <span className="mr-1 flex-shrink-0">
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </span>
      )}
      
      {children}
      
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 flex-shrink-0 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
          aria-label="Remove badge"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Notification Badge (for counts)
export const NotificationBadge = ({ 
  count = 0,
  max = 99,
  showZero = false,
  className = '',
  variant = 'error',
  size = 'sm'
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge variant={variant} size={size} className={className}>
      {displayCount}
    </Badge>
  );
};

// Status Badge
export const StatusBadge = ({ 
  status = 'default', // online, offline, away, busy, default
  children,
  className = '',
  showDot = true
}) => {
  const statusConfig = {
    online: { variant: 'success', icon: '🟢', label: 'Online' },
    offline: { variant: 'default', icon: '⚫', label: 'Offline' },
    away: { variant: 'warning', icon: '🟡', label: 'Away' },
    busy: { variant: 'error', icon: '🔴', label: 'Busy' },
    default: { variant: 'default', icon: '⚪', label: 'Unknown' }
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <Badge 
      variant={config.variant} 
      icon={showDot ? config.icon : undefined}
      className={className}
    >
      {children || config.label}
    </Badge>
  );
};

// Priority Badge
export const PriorityBadge = ({ 
  priority = 'medium', // low, medium, high, urgent
  className = ''
}) => {
  const priorityConfig = {
    low: { variant: 'info', label: 'Low', icon: '🔵' },
    medium: { variant: 'warning', label: 'Medium', icon: '🟡' },
    high: { variant: 'error', label: 'High', icon: '🟠' },
    urgent: { variant: 'error', label: 'Urgent', icon: '🔴', pulse: true }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <Badge 
      variant={config.variant}
      icon={config.icon}
      pulse={config.pulse}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

// Tag Badge (for categories/tags)
export const TagBadge = ({ 
  children,
  color = 'blue', // blue, green, yellow, red, purple, pink, gray
  className = '',
  removable = false,
  onRemove
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${colorClasses[color]}
      ${className}
    `}>
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 flex-shrink-0 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
          aria-label="Remove tag"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Badge Group (for multiple badges)
export const BadgeGroup = ({ 
  children,
  className = '',
  spacing = 'normal' // tight, normal, loose
}) => {
  const spacingClasses = {
    tight: 'space-x-1',
    normal: 'space-x-2',
    loose: 'space-x-3'
  };

  return (
    <div className={`flex flex-wrap items-center ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

// Interactive Badge (clickable)
export const InteractiveBadge = ({ 
  children,
  onClick,
  href,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = `
    cursor-pointer transition-all duration-200
    hover:scale-105 hover:shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
  `;

  const content = (
    <Badge variant={variant} className={`${baseClasses} ${className}`} {...props}>
      {children}
    </Badge>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="inline-block">
      {content}
    </button>
  );
};

// Gradient Badge
export const GradientBadge = ({ 
  children,
  gradient = 'blue', // blue, green, purple, pink, orange
  className = '',
  ...props
}) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    green: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
    pink: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
      ${gradientClasses[gradient]}
      ${className}
    `}>
      {children}
    </span>
  );
};

// Badge with Tooltip
export const TooltipBadge = ({ 
  children,
  tooltip,
  className = '',
  ...props
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Badge className={className} {...props}>
        {children}
      </Badge>
      
      {showTooltip && tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

// Animated Badge
export const AnimatedBadge = ({ 
  children,
  animation = 'bounce', // bounce, pulse, ping, spin
  className = '',
  ...props
}) => {
  const animationClasses = {
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    ping: 'animate-ping',
    spin: 'animate-spin'
  };

  return (
    <Badge className={`${animationClasses[animation]} ${className}`} {...props}>
      {children}
    </Badge>
  );
};

export default Badge;