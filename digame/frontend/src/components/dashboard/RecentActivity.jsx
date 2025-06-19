import React, { useState, useEffect } from 'react';

const RecentActivity = ({ userId = 1, maxItems = 5 }) => { // Assuming userId prop or context later
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(\`/behavior/patterns?user_id=\${userId}\`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: \${response.status}`);
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Fetched data is not an array:", data);
          throw new Error("Invalid data format from API.");
        }

        // Sort by timestamp descending (most recent first) and take top N items
        const sortedData = data
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, maxItems);

        setActivities(sortedData);

      } catch (e) {
        console.error("Failed to fetch or process recent activities:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchRecentActivities();
    }
  }, [userId, maxItems]);

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'No date';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Recent Activity</h3>
        <p className="text-gray-500">Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Recent Activity</h3>
        <p className="text-red-500">Error loading activities: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity found.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <li key={activity.activity_id || activity.timestamp} className="py-3">
              <p className="text-sm font-medium text-gray-800">{activity.activity_type || 'Unknown Activity'}</p>
              <p className="text-xs text-gray-500">
                {formatTimestamp(activity.timestamp)}
                {activity.app_category && \` - \${activity.app_category}\`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
