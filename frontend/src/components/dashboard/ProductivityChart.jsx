import React, { useState, useEffect } from 'react';
import { Chart } from '../ui/Chart'; // Import the standard Chart component
import enhancedApiService from '../../services/enhancedApiService';
import { Skeleton } from '../ui/Skeleton'; // Import Skeleton for loading state

const ProductivityChart = ({ userId, dateRange }) => {
  const [activityData, setActivityData] = useState([]);
  const [activityLabels, setActivityLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setError("User ID is required to fetch chart data.");
      setActivityData([]);
      setActivityLabels([]);
      return;
    }

    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use enhanced API service which handles demo mode automatically
        // Adapt the service call if it needs a date range or specific type of data
        const data = await enhancedApiService.getProductivityData(
          userId,
          'daily',
          dateRange?.from ? dateRange.from.toISOString().split('T')[0] : undefined,
          dateRange?.to ? dateRange.to.toISOString().split('T')[0] : undefined
        );

        if (!data || !Array.isArray(data)) {
          console.error("Fetched data is not an array:", data);
          throw new Error("Invalid data format from API.");
        }

        // Transform the data for the Chart component
        // Chart expects `data` as an array of numbers and `labels` as an array of strings
        const formattedData = data.map(item => item.productivity || item.tasks || item.value || 0);
        const formattedLabels = data.map(item =>
          new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        );

        setActivityData(formattedData);
        setActivityLabels(formattedLabels);

      } catch (e) {
        console.error("Failed to fetch or process chart data:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [userId, dateRange]); // Add dateRange to dependency array

  return (
    <div className="bg-white shadow rounded-lg p-4 h-full flex flex-col">
      {/* Title is now handled by DashboardPage, or can be added back if needed */}
      {/* <h3 className="text-lg font-semibold mb-2 text-gray-700">Productivity Trend</h3> */}
      <div className="flex-grow" style={{ minHeight: '250px' }}> {/* Ensure container has height */}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-full w-full" />
          </div>
        )}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-red-500 text-center">Could not load chart data. ({error})</p>
          </div>
        )}
        {!isLoading && !error && activityData.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500 text-center">No activity data available for the selected period.</p>
          </div>
        )}
        {!isLoading && !error && activityData.length > 0 && (
          <Chart
            data={activityData}
            labels={activityLabels}
            height={250} // Adjust height as needed
            // className="mt-4" // Add any necessary styling
          />
        )}
      </div>
    </div>
  );
};

export default ProductivityChart;
