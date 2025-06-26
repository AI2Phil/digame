import React, { useState, useEffect } from 'react';

// Main Progress component
export const Progress = ({ 
  value = 0,
  max = 100,
  className = '',
  size = 'md', // xs, sm, md, lg, xl
  variant = 'default', // default, success, warning, error, info
  showValue = false,
  animated = false,
  striped = false,
  indeterminate = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate value changes
  useEffect(() => {
    if (!indeterminate) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, indeterminate]);

  const percentage = indeterminate ? 100 : Math.min(Math.max((displayValue / max) * 100, 0), 100);

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-cyan-600'
  };

  const backgroundClasses = {
    default: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
    info: 'bg-cyan-100'
  };

  return (
    <div className={`progress-container ${className}`}>
      <div className={`
        relative w-full rounded-full overflow-hidden
        ${sizeClasses[size]}
        ${backgroundClasses[variant]}
      `}>
        <div
          className={`
            h-full transition-all duration-500 ease-out
            ${variantClasses[variant]}
            ${striped ? 'progress-striped' : ''}
            ${animated ? 'progress-animated' : ''}
            ${indeterminate ? 'progress-indeterminate' : ''}
          `}
          style={{ 
            width: `${percentage}%`,
            transform: indeterminate ? 'translateX(-100%)' : 'none'
          }}
        />
        
        {showValue && !indeterminate && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Circular Progress
export const CircularProgress = ({ 
  value = 0,
  max = 100,
  size = 64,
  strokeWidth = 4,
  className = '',
  variant = 'default',
  showValue = true,
  animated = true,
  indeterminate = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (!indeterminate) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, indeterminate]);

  const percentage = indeterminate ? 25 : Math.min(Math.max((displayValue / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantClasses = {
    default: 'stroke-blue-600',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-600',
    error: 'stroke-red-600',
    info: 'stroke-cyan-600'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${animated ? 'transition-all duration-500' : ''}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={indeterminate ? 0 : strokeDashoffset}
          strokeLinecap="round"
          className={`
            ${variantClasses[variant]}
            ${animated ? 'transition-all duration-500 ease-out' : ''}
            ${indeterminate ? 'animate-spin' : ''}
          `}
          style={{
            strokeDasharray: indeterminate ? `${circumference * 0.25} ${circumference}` : strokeDasharray
          }}
        />
      </svg>
      
      {showValue && !indeterminate && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Progress with Label
export const LabeledProgress = ({ 
  label,
  value = 0,
  max = 100,
  className = '',
  showValue = true,
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showValue && (
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <Progress value={value} max={max} {...props} />
    </div>
  );
};

// Multi Progress (stacked)
export const MultiProgress = ({ 
  segments = [],
  className = '',
  size = 'md',
  showLabels = false
}) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  return (
    <div className={`multi-progress ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between mb-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${segment.color || 'bg-blue-600'}`}
              />
              <span className="text-sm text-gray-700">{segment.label}</span>
              <span className="text-sm text-gray-500">
                {Math.round((segment.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className={`
        relative w-full rounded-full overflow-hidden bg-gray-200
        ${sizeClasses[size]}
      `}>
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          const offset = segments
            .slice(0, index)
            .reduce((sum, s) => sum + (s.value / total) * 100, 0);
          
          return (
            <div
              key={index}
              className={`
                absolute top-0 h-full transition-all duration-500 ease-out
                ${segment.color || 'bg-blue-600'}
              `}
              style={{
                left: `${offset}%`,
                width: `${percentage}%`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// Progress Steps
export const ProgressSteps = ({ 
  steps = [],
  currentStep = 0,
  className = '',
  variant = 'default'
}) => {
  const variantClasses = {
    default: {
      completed: 'bg-blue-600 text-white',
      current: 'bg-blue-100 text-blue-600 border-blue-600',
      pending: 'bg-gray-100 text-gray-400 border-gray-300'
    },
    success: {
      completed: 'bg-green-600 text-white',
      current: 'bg-green-100 text-green-600 border-green-600',
      pending: 'bg-gray-100 text-gray-400 border-gray-300'
    }
  };

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className={`progress-steps ${className}`}>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center
                  text-sm font-medium transition-colors duration-200
                  ${variantClasses[variant][status]}
                `}>
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`
                  mt-2 text-xs font-medium
                  ${status === 'current' ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {step.label || step}
                </span>
              </div>
              
              {!isLast && (
                <div className={`
                  w-16 h-0.5 mx-4
                  ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}
                  transition-colors duration-200
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Progress Ring (alternative circular design)
export const ProgressRing = ({ 
  value = 0,
  max = 100,
  size = 'md',
  thickness = 'md',
  className = '',
  variant = 'default',
  children
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const thicknessClasses = {
    sm: 'stroke-2',
    md: 'stroke-4',
    lg: 'stroke-6'
  };

  const variantClasses = {
    default: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-cyan-600'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="currentColor"
          className={`text-gray-200 ${thicknessClasses[thickness]}`}
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          className={`${variantClasses[variant]} ${thicknessClasses[thickness]} transition-all duration-500`}
          style={{
            strokeDasharray: `${percentage * 2.83} 283`,
            strokeDashoffset: 0
          }}
        />
      </svg>
      
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default Progress;