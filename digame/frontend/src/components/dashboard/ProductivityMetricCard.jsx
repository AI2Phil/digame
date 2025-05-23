import React, { useState, useEffect } from 'react';

const ProductivityMetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  color = 'blue',
  trend = [],
  interactive = true,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  // Color schemes for different metric types
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      gradient: 'from-red-500 to-red-600'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  // Animate value on mount
  useEffect(() => {
    const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
    if (!isNaN(numericValue)) {
      let start = 0;
      const duration = 1000;
      const increment = numericValue / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setAnimatedValue(numericValue);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    } else {
      setAnimatedValue(value);
    }
  }, [value]);

  // Format the animated value back to original format
  const formatValue = (val) => {
    if (typeof value === 'string' && value.includes('%')) {
      return `${val}%`;
    }
    if (typeof value === 'string' && value.includes('h')) {
      return `${val}h`;
    }
    if (typeof value === 'string' && value.includes('+')) {
      return `+${val}%`;
    }
    return val;
  };

  // Mini trend chart
  const renderTrendChart = () => {
    if (!trend || trend.length === 0) return null;

    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;

    return (
      <div className="flex items-end space-x-1 h-8">
        {trend.map((point, index) => {
          const height = ((point - min) / range) * 100;
          return (
            <div
              key={index}
              className={`w-1 bg-gradient-to-t ${scheme.gradient} rounded-full transition-all duration-300`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  const cardClasses = `
    metric-card 
    ${interactive ? 'cursor-pointer hover:shadow-lg' : ''} 
    ${isHovered ? 'transform scale-105' : ''}
    transition-all duration-200
  `;

  return (
    <div
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={interactive ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          
          {/* Value */}
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">
              {formatValue(animatedValue)}
            </p>
            
            {/* Change indicator */}
            {change && (
              <div className={`flex items-center space-x-1 ${
                changeType === 'positive' ? 'text-green-600' : 
                changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                <span className="text-sm font-medium">
                  {changeType === 'positive' && '+'}
                  {change}
                </span>
                {changeType === 'positive' && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {changeType === 'negative' && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>
          
          {/* Subtitle/Description */}
          {change && (
            <p className="text-xs text-gray-500 mt-1">
              {changeType === 'positive' ? 'from last week' : 
               changeType === 'negative' ? 'from last week' : 'vs average'}
            </p>
          )}
        </div>

        {/* Icon and Trend */}
        <div className="flex flex-col items-center space-y-2">
          {/* Icon */}
          <div className={`w-12 h-12 ${scheme.bg} rounded-xl flex items-center justify-center`}>
            {typeof icon === 'string' ? (
              <span className="text-xl">{icon}</span>
            ) : (
              <span className={`${scheme.text} text-xl`}>{icon}</span>
            )}
          </div>
          
          {/* Mini trend chart */}
          {trend && trend.length > 0 && (
            <div className="w-16">
              {renderTrendChart()}
            </div>
          )}
        </div>
      </div>

      {/* Interactive hover effect */}
      {interactive && isHovered && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Click for details</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced metric card with additional features
const EnhancedProductivityMetricCard = ({ 
  title, 
  value, 
  target,
  change,
  changeType,
  icon,
  color,
  trend,
  insights = [],
  actions = []
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const progressPercentage = target ? (parseFloat(value) / target) * 100 : null;

  return (
    <div className="metric-card">
      <ProductivityMetricCard
        title={title}
        value={value}
        change={change}
        changeType={changeType}
        icon={icon}
        color={color}
        trend={trend}
        onClick={() => setShowDetails(!showDetails)}
      />
      
      {/* Progress bar for targets */}
      {target && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress to target</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${
                progressPercentage >= 100 ? 'from-green-500 to-green-600' :
                progressPercentage >= 75 ? 'from-blue-500 to-blue-600' :
                'from-orange-500 to-orange-600'
              } transition-all duration-500`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Expandable details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
          {insights.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Insights</h4>
              <ul className="space-y-1">
                {insights.map((insight, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {actions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductivityMetricCard;
export { EnhancedProductivityMetricCard };