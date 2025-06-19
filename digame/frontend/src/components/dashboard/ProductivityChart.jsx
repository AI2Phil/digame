import React, { useState, useEffect } from 'react';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const ProductivityChart = ({ userId = 1 }) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedDataForDisplay, setProcessedDataForDisplay] = useState('');


  useEffect(() => {
    const fetchChartData = async () => {
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

        // Process data: Count activities per day
        const countsByDay = data.reduce((acc, activity) => {
          if (!activity.timestamp) return acc;
          try {
            const day = formatDate(new Date(activity.timestamp));
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          } catch (e) {
            console.error("Error parsing activity timestamp for chart:", activity.timestamp, e);
            return acc;
          }
        }, {});

        const formattedChartData = Object.entries(countsByDay)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

        setChartData(formattedChartData);
        // For now, just display the processed data as a string for verification
        setProcessedDataForDisplay(JSON.stringify(formattedChartData, null, 2));
        console.log("Processed chart data:", formattedChartData);

      } catch (e) {
        console.error("Failed to fetch or process chart data:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchChartData();
    }
  }, [userId]);

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Productivity Trend (Activities per Day)</h3>
      {isLoading && <p className="text-gray-500">Loading chart data...</p>}
      {error && <p className="text-red-500">Error loading chart data: {error}</p>}
      {!isLoading && !error && chartData.length === 0 && (
        <p className="text-sm text-gray-500">No activity data to display chart.</p>
      )}
      {!isLoading && !error && chartData.length > 0 && (
        <div className="h-64 bg-gray-100 flex flex-col items-center justify-center rounded p-2">
          <p className="text-gray-600 text-sm mb-2">Chart rendering would happen here.</p>
          <p className="text-gray-500 text-xs">Data prepared for chart (see console for structure):</p>
          <pre className="text-xs bg-gray-200 p-2 rounded overflow-auto max-h-40 w-full">
            {processedDataForDisplay || "No data processed."}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ProductivityChart;
