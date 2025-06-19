import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';

const ActivityBreakdown = ({ userId = 1 }) => {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryIcons = {
    'Development': '💻',
    'Meetings': '📞',
    'Learning': '📚',
    'Planning': '📋',
    'Documentation': '📝',
    'Testing': '🧪',
    'Break': '☕',
    'default': '📊'
  };

  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || categoryIcons['default'];
  };

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getActivityBreakdown(userId);
        setActivityData(data);
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError('Failed to load activity breakdown. Please try again later.');
        // Optionally, set some fallback data or leave it null
        // setActivityData({ categories: [], totalHours: 0, mostProductiveTime: 'N/A', efficiency: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivityData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activity Breakdown</h3>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activity Breakdown</h3>
        </div>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">😟</div>
          <p className="text-red-600 mb-2 font-medium">Error</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!activityData || activityData.categories.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activity Breakdown</h3>
        </div>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600 mb-2 font-medium">No Activity Data Available</p>
          <p className="text-sm text-gray-500">Start tracking your activities to see the breakdown here.</p>
        </div>
      </div>
    );
  }

  const { categories, totalHours, mostProductiveTime, efficiency } = activityData;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Activity Breakdown</h3>
        <span className="text-sm text-gray-500">Last 7 days</span>
      </div>

      {/* Activity Categories */}
      <div className="space-y-4 mb-6">
        {categories.map((category, index) => (
          <div key={index} className="activity-item">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getCategoryIcon(category.name)}</span>
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{category.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${category.value}%`,
                  backgroundColor: category.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalHours !== undefined ? `${totalHours}h` : 'N/A'}</div>
            <div className="text-xs text-gray-600">Total Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{efficiency !== undefined ? `${efficiency}%` : 'N/A'}</div>
            <div className="text-xs text-gray-600">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-900">Peak Time</div>
            <div className="text-xs text-gray-600">{mostProductiveTime || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="text-xs text-gray-600">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityBreakdown;