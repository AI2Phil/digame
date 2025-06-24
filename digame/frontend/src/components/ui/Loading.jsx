import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ 
  size = 'md', 
  variant = 'spinner',
  text = 'Loading...',
  fullScreen = false,
  className = '',
  showText = true
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => (
    <Loader2 
      className={`${sizes[size]} animate-spin text-blue-600 dark:text-blue-400`} 
      aria-hidden="true"
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : size === 'xl' ? 'w-5 h-5' : 'w-3 h-3'} 
                     bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`${sizes[size]} bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse`} aria-hidden="true" />
  );

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {variant !== 'skeleton' && renderVariant()}
      {variant === 'skeleton' && renderSkeleton()}
      
      {showText && variant !== 'skeleton' && (
        <div className={`${textSizes[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50 theme-transition">
        <div className="text-center space-y-4">
          {renderVariant()}
          {showText && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{text}</h2>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare everything</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return content;
};

// Skeleton components for specific use cases
const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse ${className}`}>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="flex space-x-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonList = ({ items = 5, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    ))}
  </div>
);

export default Loading;
export { SkeletonCard, SkeletonTable, SkeletonList };