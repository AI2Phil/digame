import React, { useState, useEffect } from 'react';

const ProductivityMetricCard = ({ userId = 1 }) => { // Assuming userId prop or context later
  const [metric, setMetric] = useState({ title: 'Activities Today', value: 'Loading...', unit: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivitiesToday = async () => {
      setError(null);
      try {
        // Actual API endpoint: /behavior/patterns?user_id={user_id}
        // The router for behavior.py is prefixed with /behavior
        const response = await fetch(\`/behavior/patterns?user_id=\${userId}\`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: \${response.status}`);
        }
        const data = await response.json(); // Expects a list of ActivityPatternResponse

        if (!Array.isArray(data)) {
          console.error("Fetched data is not an array:", data);
          throw new Error("Invalid data format from API.");
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0];

        // Filter activities for today
        const activitiesToday = data.filter(activity => {
          // Assuming activity.timestamp is in ISO format e.g., "2023-10-27T10:00:00Z"
          // or a format that can be parsed into a Date object correctly.
          // For robustness, ensure timestamp parsing is correct.
          if (!activity.timestamp) return false;
          try {
            const activityDate = new Date(activity.timestamp);
            return activityDate.toISOString().split('T')[0] === todayDateString;
          } catch (e) {
            console.error("Error parsing activity timestamp:", activity.timestamp, e);
            return false;
          }
        });

        setMetric({ title: 'Activities Today', value: activitiesToday.length.toString(), unit: 'tasks' });

      } catch (e) {
        console.error("Failed to fetch or process activities:", e);
        setError(e.message);
        setMetric({ title: 'Activities Today', value: 'N/A', unit: '' });
      }
    };

    if (userId) {
      fetchActivitiesToday();
    }
  }, [userId]);

  return (
    <div className="bg-white shadow rounded-lg p-4 text-center">
      <h4 className="text-md font-semibold text-gray-500 mb-1">{metric.title}</h4>
      {error ? (
        <p className="text-2xl font-bold text-red-500">{metric.value}</p>
      ) : (
        <p className="text-3xl font-bold text-gray-800">
          {metric.value}
          {metric.unit && <span className="text-lg font-normal ml-1">{metric.unit}</span>}
        </p>
      )}
      {error && <p className="text-sm text-red-500 mt-2">Could not load data. (`${error}`)</p>}
    </div>
  );
};

export default ProductivityMetricCard;
