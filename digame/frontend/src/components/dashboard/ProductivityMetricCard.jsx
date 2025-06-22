import React, { useState } from 'react';

const ProductivityMetricCard = ({
  userId = 1,
  title,
  value,
  target,
  change,
  changeType = 'neutral',
  icon,
  color = 'blue',
  trend = [],
  insights = [],
  actions = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Color mappings for different themes
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      accent: 'text-blue-600',
      button: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      accent: 'text-green-600',
      button: 'bg-green-100 hover:bg-green-200 text-green-700'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      accent: 'text-purple-600',
      button: 'bg-purple-100 hover:bg-purple-200 text-purple-700'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      accent: 'text-orange-600',
      button: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderMiniChart = () => {
    if (!trend || trend.length === 0) return null;

    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;

    return (
      <div className="flex items-end space-x-1 h-8 mt-2">
        {trend.map((point, index) => {
          const height = ((point - min) / range) * 100;
          return (
            <div
              key={index}
              className={`w-2 ${colors.accent.replace('text-', 'bg-')} rounded-sm opacity-70`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all duration-200 hover:shadow-lg cursor-pointer`}
         onClick={() => setIsExpanded(!isExpanded)}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className={`text-sm font-medium ${colors.text}`}>{title}</h3>
            {target && (
              <p className="text-xs text-gray-500">Target: {target}{typeof target === 'number' && target < 20 ? 'h' : '%'}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
          {change && (
            <div className={`text-sm font-medium ${getChangeColor()}`}>
              {typeof change === 'string' ? change : `${change > 0 ? '+' : ''}${change}${typeof change === 'number' ? '%' : ''}`}
            </div>
          )}
        </div>
      </div>

      {/* Mini Chart */}
      {renderMiniChart()}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
          
          {/* Insights */}
          {insights && insights.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold ${colors.text} mb-2`}>Key Insights</h4>
              <ul className="space-y-1">
                {insights.map((insight, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold ${colors.text} mb-2`}>Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick && action.onClick();
                    }}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${colors.button}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar for Target */}
          {target && typeof value === 'string' && value.includes('%') && (
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress to Target</span>
                <span>{value} / {target}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${colors.accent.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min((parseInt(value) / target) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductivityMetricCard;
