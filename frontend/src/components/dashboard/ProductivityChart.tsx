import React, { useState, useEffect } from 'react';
import { Chart } from '../ui/Chart'; // Import the standard Chart component
import enhancedApiService from '../../services/enhancedApiService';
import { Skeleton } from '../ui/Skeleton'; // Import Skeleton for loading state

interface DateRange {
  from?: Date;
  to?: Date;
}

interface ProductivityDataItem {
  date: string;
  productivity?: number;
  tasks?: number;
  value?: number;
}

interface ProductivityChartProps {
  userId: number;
  dateRange?: DateRange | null;
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({ userId, dateRange }) => {
  const [activityData, setActivityData] = useState<number[]>([]);
  const [activityLabels, setActivityLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setError("User ID is required to fetch chart data.");
      setActivityData([]);
      setActivityLabels([]);
      return;
    }

    const fetchChartData = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        // Use enhanced API service which handles demo mode automatically
        // Adapt the service call if it needs a date range or specific type of data
        const data = await enhancedApiService.getProductivityData(
          userId,
          'daily'
        );

        if (!data || !Array.isArray(data)) {
          console.error("Fetched data is not an array:", data);
          throw new Error("Invalid data format from API.");
        }

        // Transform the data for the Chart component
        // Chart expects `data` as an array of numbers and `labels` as an array of strings
        const formattedData = data.map((item: ProductivityDataItem) => 
          item.productivity || item.tasks || item.value || 0
        );
        const formattedLabels = data.map((item: ProductivityDataItem) =>
          new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        );

        setActivityData(formattedData);
        setActivityLabels(formattedLabels);

      } catch (e: any) {
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
            <Skeleton className="h-full w-full" width="100%" height="100%" />
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
            className=""
            data={activityData}
            labels={activityLabels}
            height={250}
            secondaryData={[]}
          />
        )}
      </div>
    </div>
  );
};

export default ProductivityChart;