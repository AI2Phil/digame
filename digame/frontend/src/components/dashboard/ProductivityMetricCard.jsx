import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/Card'; // CardHeader, CardTitle, CardDescription might be useful later if structure changes
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';
import { ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';

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

  const cardBaseClasses = "transition-all duration-200"; // Base classes for Card
  const interactiveClasses = interactive ? "cursor-pointer hover:shadow-lg" : "";
  const hoverStateClasses = isHovered && interactive ? "transform scale-105" : "";


  return (
    <Card
      className={`${cardBaseClasses} ${interactiveClasses} ${hoverStateClasses}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={interactive ? onClick : undefined}
    >
      <CardContent className="p-4"> {/* Assuming p-4 was part of metric-card style */}
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
                  {changeType === 'positive' && <ArrowUp className="w-3 h-3" />}
                  {changeType === 'negative' && <ArrowDown className="w-3 h-3" />}
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
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
    <Card className="p-0"> {/* Enhanced card is also a Card, remove default padding if Productiv..Card has its own */}
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
      {/* This content should be part of the Enhanced Card's own CardContent, not outside ProductivityMetricCard's Card structure */}
      {target && (
        <CardContent className="pt-0 px-4 pb-4"> {/* Add padding here for content below the base card */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress to target</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          </div>
        </CardContent>
      )}

      {/* Expandable details */}
      {showDetails && (
        <CardContent className="pt-0 px-4 pb-4 animate-fade-in"> {/* Add padding here */}
          <div className="pt-4 border-t border-gray-200">
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
                    <Button
                      key={index}
                      variant="outline" // Using outline for a less prominent look, similar to original
                      size="sm" // Using sm as xs might be too small or not available
                      onClick={action.onClick}
                      className="text-xs" // Keep text small
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProductivityMetricCard;
export { EnhancedProductivityMetricCard };