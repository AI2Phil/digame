import React from 'react';

// Main Skeleton component
export const Skeleton = ({ 
  className = '',
  width,
  height,
  variant = 'rectangular', // rectangular, circular, text
  animation = 'pulse', // pulse, wave, none
  lines = 1
}) => {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: ''
  };

  const style = {
    width: width || (variant === 'circular' ? height : undefined),
    height: height || (variant === 'text' ? '1em' : undefined)
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`
              ${baseClasses}
              ${variantClasses[variant]}
              ${animationClasses[animation]}
              ${index === lines - 1 ? 'w-3/4' : 'w-full'}
            `}
            style={{ height: height || '1em' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
};

// Avatar Skeleton
export const SkeletonAvatar = ({ 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

// Text Skeleton
export const SkeletonText = ({ 
  lines = 3,
  className = ''
}) => {
  return (
    <Skeleton
      variant="text"
      lines={lines}
      className={className}
    />
  );
};

// Button Skeleton
export const SkeletonButton = ({ 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-28'
  };

  return (
    <Skeleton
      variant="rectangular"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

// Card Skeleton
export const SkeletonCard = ({ 
  className = '',
  showAvatar = true,
  showImage = true,
  lines = 3
}) => {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      {showImage && (
        <Skeleton
          variant="rectangular"
          className="w-full h-48 mb-4"
        />
      )}
      
      {showAvatar && (
        <div className="flex items-center space-x-3 mb-4">
          <SkeletonAvatar size="md" />
          <div className="flex-1">
            <Skeleton variant="text" className="w-1/3 mb-2" />
            <Skeleton variant="text" className="w-1/4" />
          </div>
        </div>
      )}
      
      <SkeletonText lines={lines} />
      
      <div className="flex items-center space-x-2 mt-4">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  );
};

// Table Skeleton
export const SkeletonTable = ({ 
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={`header-${index}`} variant="text" className="h-4" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
};

// List Skeleton
export const SkeletonList = ({ 
  items = 5,
  showAvatar = true,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-3">
          {showAvatar && <SkeletonAvatar size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Form Skeleton
export const SkeletonForm = ({ 
  fields = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" className="w-1/4 h-4" />
          <Skeleton variant="rectangular" className="w-full h-10" />
        </div>
      ))}
      
      <div className="flex space-x-2 pt-4">
        <SkeletonButton size="md" />
        <SkeletonButton size="md" />
      </div>
    </div>
  );
};

// Chart Skeleton
export const SkeletonChart = ({ 
  type = 'bar', // bar, line, pie
  className = ''
}) => {
  if (type === 'pie') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Skeleton variant="circular" className="w-48 h-48" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart area */}
      <div className="h-64 flex items-end space-x-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            className="flex-1"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton variant="rectangular" className="w-4 h-4" />
            <Skeleton variant="text" className="w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Page Skeleton
export const SkeletonPage = ({ 
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-32 h-4" />
        </div>
        <SkeletonButton size="lg" />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <Skeleton variant="text" className="w-16 h-4 mb-2" />
            <Skeleton variant="text" className="w-24 h-8" />
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart className="h-80" />
        </div>
        <div>
          <SkeletonList items={6} />
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton with custom content
export const LoadingSkeleton = ({ 
  loading = true,
  children,
  skeleton,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={className}>
        {skeleton || <Skeleton />}
      </div>
    );
  }

  return children;
};

// Skeleton Group
export const SkeletonGroup = ({ 
  children,
  loading = true,
  className = ''
}) => {
  if (!loading) return children;

  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};

// Image Skeleton
export const SkeletonImage = ({ 
  width = '100%',
  height = '200px',
  className = ''
}) => {
  return (
    <Skeleton
      variant="rectangular"
      className={className}
      width={width}
      height={height}
    />
  );
};

// Pulse Skeleton (alternative animation)
export const PulseSkeleton = ({ 
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children || <Skeleton animation="none" {...props} />}
    </div>
  );
};

// Wave Skeleton (alternative animation)
export const WaveSkeleton = ({ 
  className = '',
  ...props
}) => {
  return (
    <Skeleton
      animation="wave"
      className={className}
      {...props}
    />
  );
};

export default Skeleton;