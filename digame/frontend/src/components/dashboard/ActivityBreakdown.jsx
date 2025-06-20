import React, { useState, useEffect } from 'react';

const ActivityBreakdown = ({ userId = 1 }) => {
  const [breakdownData, setBreakdownData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Predefined colors for some activity types for consistency
  const activityColorMap = {
    'Work': 'bg-blue-500',
    'Meeting': 'bg-green-500',
    'Break': 'bg-yellow-500',
    'Communication': 'bg-indigo-500',
    'Learning': 'bg-purple-500',
    'Research': 'bg-pink-500',
    'default': 'bg-gray-400'
  };

  const getActivityColor = (activityType) => {
    return activityColorMap[activityType] || activityColorMap['default'];
  };

  useEffect(() => {
    const fetchActivityBreakdown = async () => {
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

        // Process data to get counts per activity_type
        const counts = data.reduce((acc, activity) => {
          const type = activity.activity_type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const totalActivities = data.length;

        const formattedBreakdown = Object.entries(counts).map(([type, count]) => ({
          type,
          count,
          percentage: totalActivities > 0 ? ((count / totalActivities) * 100).toFixed(1) : 0,
          color: getActivityColor(type)
        })).sort((a,b) => b.count - a.count); // Sort by count descending

        setBreakdownData(formattedBreakdown);

      } catch (e) {
        console.error("Failed to fetch or process activity breakdown:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchActivityBreakdown();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Activity Breakdown</h3>
        <p className="text-gray-500">Loading breakdown...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Activity Breakdown</h3>
        <p className="text-sm text-red-500">Could not load activity breakdown. (`${error}`)</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Activity Breakdown</h3>
      {breakdownData.length === 0 ? (
        <p className="text-sm text-gray-500">No activity data to display breakdown.</p>
      ) : (
        <div className="space-y-3">
          {breakdownData.map((item) => (
            <div key={item.type}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.type}</span>
                <span className="text-sm font-medium text-gray-500">{item.count} activities ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full \${item.color}`}
                  style={{ width: \`\${item.percentage}%\` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityBreakdown;
