import React, { useState, useEffect } from 'react';

const ActivityBreakdown = ({ userId }) => {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample data for demo mode
  const sampleData = {
    categories: [
      { name: 'Development', value: 45, color: '#2563eb', icon: '💻' },
      { name: 'Meetings', value: 25, color: '#7c3aed', icon: '📞' },
      { name: 'Learning', value: 15, color: '#16a34a', icon: '📚' },
      { name: 'Planning', value: 10, color: '#ea580c', icon: '📋' },
      { name: 'Break', value: 5, color: '#6b7280', icon: '☕' }
    ],
    totalHours: 8.5,
    mostProductiveTime: '9:00 AM - 11:00 AM',
    efficiency: 87
  };

  useEffect(() => {
    // Simulate API call
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        // In demo mode, use sample data
        setTimeout(() => {
          setActivityData(sampleData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setActivityData(sampleData);
        setLoading(false);
      }
    };

    fetchActivityData();
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
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600 mb-2 font-medium">No Activity Data</p>
          <p className="text-sm text-gray-500">Start tracking to see your breakdown</p>
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
                <span className="text-lg">{category.icon}</span>
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
            <div className="text-2xl font-bold text-gray-900">{totalHours}h</div>
            <div className="text-xs text-gray-600">Total Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{efficiency}%</div>
            <div className="text-xs text-gray-600">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-900">Peak Time</div>
            <div className="text-xs text-gray-600">{mostProductiveTime}</div>
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