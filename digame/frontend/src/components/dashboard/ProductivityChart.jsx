import React, { useState, useEffect } from 'react';
// Step 1: Assume Recharts is installed and import necessary components.
// In a real environment: npm install recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import enhancedApiService from '../../services/enhancedApiService';

// Helper function to format date as YYYY-MM-DD (keep existing)
const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const ProductivityChart = ({ userId }) => { // Removed default for userId, expect it from DashboardPage
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setError("User ID is required to fetch chart data.");
      setChartData([]); // Clear data if no userId
      return;
    }

    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use enhanced API service which handles demo mode automatically
        const data = await enhancedApiService.getProductivityData(userId, 'daily');

        if (!data || !Array.isArray(data)) {
          console.error("Fetched data is not an array:", data);
          throw new Error("Invalid data format from API.");
        }

        // Transform the data for the chart
        const formattedChartData = data.map(item => ({
          date: item.date,
          displayDate: new Date(item.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
          count: item.productivity || item.tasks || item.value || 0,
          productivity: item.productivity || 0,
          focus: item.focus || 0,
          collaboration: item.collaboration || 0
        }));

        setChartData(formattedChartData);
        console.log("Processed chart data for Recharts:", formattedChartData);

      } catch (e) {
        console.error("Failed to fetch or process chart data:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [userId]);


  return (
    <div className="bg-white shadow rounded-lg p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Productivity Trend (Activities per Day - Last 7 Days)</h3>
      <div className="flex-grow" style={{ minHeight: '200px' }}> {/* Ensure container has height for ResponsiveContainer */}
        {isLoading && <p className="text-gray-500 text-center pt-10">Loading chart data...</p>}
        {error && <p className="text-sm text-red-500 text-center pt-10">Could not load chart data. ({error})</p>}
        {!isLoading && !error && chartData.length === 0 && (
          <p className="text-sm text-gray-500 text-center pt-10">No activity data to display chart for the last 7 days.</p>
        )}
        {!isLoading && !error && chartData.length > 0 && (
          // Step 2: Use ResponsiveContainer for a responsive chart.
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5, right: 20, left: -20, bottom: 5, // Adjusted left margin for YAxis
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                labelStyle={{ fontWeight: 'bold', color: '#333' }}
                formatter={(value, name, props) => [`${value} activities`, null]}
                labelFormatter={(label) => chartData.find(d => d.displayDate === label)?.date} // Show full date in tooltip
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              {/* Step 3: Define the Bar. dataKey="count" should match your data structure. */}
              <Bar dataKey="count" name="Activities" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProductivityChart;
