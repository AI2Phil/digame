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
  // No longer need processedDataForDisplay, will render chart directly

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
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7); // Keep only last 7 days for simplicity

        setChartData(formattedChartData);
        console.log("Processed chart data for rendering:", formattedChartData);

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

  // Basic Bar Chart Rendering
  const renderSimpleBarChart = () => {
    if (!chartData || chartData.length === 0) return <p className="text-sm text-gray-500">No data for chart.</p>;

    const maxValue = Math.max(...chartData.map(d => d.count), 0);
    const chartHeight = 150; // px
    const barWidthPercentage = 80 / chartData.length; // Distribute bars across 80% of width

    return (
      <div className="flex justify-around items-end h-full w-full pt-4 px-2 border-t border-gray-200">
        {chartData.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.count / maxValue) * chartHeight : 0;
          return (
            <div
              key={item.date}
              className="flex flex-col items-center"
              style={{ width: \`\${barWidthPercentage}%\` }}
            >
              <div className="text-xs text-gray-700 mb-1">{item.count}</div>
              <div
                className="bg-blue-500 rounded-t"
                style={{ height: \`\${barHeight}px\`, minHeight: '1px' }} // minHeight to show 0-value bars
                title={\`\${item.date}: \${item.count} activities\`}
              ></div>
              <div className="text-xs text-gray-500 mt-1 transform rotate-[-45deg] whitespace-nowrap">
                {item.date.substring(5)} {/* Show MM-DD */}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Productivity Trend (Activities per Day - Last 7 Days)</h3>
      {isLoading && <p className="text-gray-500">Loading chart data...</p>}
      {error && <p className="text-sm text-red-500">Could not load chart data. (`${error}`)</p>}
      {!isLoading && !error && (
        <div className="h-48 bg-gray-50 rounded p-2 mt-2"> {/* Fixed height container for chart area */}
          {renderSimpleBarChart()}
        </div>
      )}
    </div>
  );
};

export default ProductivityChart;
