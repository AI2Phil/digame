import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';

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
    return activityIcons[activityType.toLowerCase()] || activityIcons['default'];
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
        const data = await dashboardService.getRecentActivities(userId);
        setActivities(data);
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="p-3 bg-gray-50 rounded-lg flex items-start space-x-3">
            <span className="text-xl mt-1">{getActivityIcon(activity.type)}</span>
            <div className="flex-grow">
              <p className="text-sm text-gray-800">{activity.description}</p>
              <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
