import React, { useState, useEffect } from 'react';
import enhancedApiService from '../../services/enhancedApiService';

const RecentActivity = ({ userId = 1 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activityIcons = {
    'analysis': '📊',
    'meeting': '📞',
    'coding': '💻',
    'design': '🎨',
    'documentation': '📝',
    'testing': '🧪',
    'research': '🔬',
    'learning': '📚',
    'default': '⚡'
  };

  const getActivityIcon = (activityType) => {
    if (typeof activityType === 'string') {
      return activityIcons[activityType.toLowerCase()] || activityIcons['default'];
    }
    return activityIcons['default'];
  };

  // Simplified timestamp formatter
  const formatTimestamp = (isoTimestamp) => {
    const date = new Date(isoTimestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await enhancedApiService.getRecentActivities(userId);
        if (Array.isArray(data)) {
          setActivities(data);
        } else {
          console.error('Recent activities data is not an array:', data);
          setActivities([]); // Default to empty array if data is not as expected
          // Optionally, set an error state here as well if non-array is critical
          // setError('Failed to load recent activities due to invalid data format.');
        }
      } catch (err) {
        console.error('Error fetching recent activities:', err);
        setError('Failed to load recent activities.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecentActivities();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <p className="text-gray-500">Loading recent activities...</p>
        <div className="animate-pulse mt-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <p className="text-gray-500">No recent activities found.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <span className="text-sm text-gray-500">Last 24 hours</span>
      </div>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="group p-3 bg-gray-50 hover:bg-blue-50 rounded-lg flex items-start space-x-3 transition-colors cursor-pointer">
            <div className="flex-shrink-0">
              <span className="text-xl mt-1 group-hover:scale-110 transition-transform">{getActivityIcon(activity.type)}</span>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                    {activity.title || activity.description}
                  </p>
                  {activity.title && activity.description !== activity.title && (
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  )}
                  <div className="flex items-center space-x-3 mt-2">
                    <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                    {activity.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {activity.category}
                      </span>
                    )}
                    {activity.impact && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        activity.impact === 'high' ? 'bg-green-100 text-green-800' :
                        activity.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.impact} impact
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Activity Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{activities.length}</div>
            <div className="text-xs text-gray-600">Activities Today</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {activities.filter(a => a.impact === 'high').length}
            </div>
            <div className="text-xs text-gray-600">High Impact</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {new Set(activities.map(a => a.category)).size}
            </div>
            <div className="text-xs text-gray-600">Categories</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors">
            View All Activities
          </button>
          <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
