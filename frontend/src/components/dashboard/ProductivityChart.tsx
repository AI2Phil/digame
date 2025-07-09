import React, { useState, useEffect } from 'react';
import { Chart } from '../ui/Chart'; // Import the standard Chart component
import { Skeleton } from '../ui/Skeleton'; // Import Skeleton for loading state
import { Badge } from '../ui/Badge';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface ProductivityDataItem {
  date: string;
  productivity?: number;
  tasks?: number;
  value?: number;
  focus?: number;
  energy?: number;
  hours?: number;
}

interface ProductivityChartProps {
  userId?: number;
  dateRange?: DateRange | null;
  period?: string;
  days?: number;
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({
  userId = 1,
  dateRange,
  period = 'daily',
  days = 30
}) => {
  const [activityData, setActivityData] = useState<number[]>([]);
  const [activityLabels, setActivityLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    const fetchChartData = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the new database-driven API endpoint
        const response = await fetch(
          `http://localhost:8001/api/activity/productivity-data?period=${period}&days=${days}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // Add authorization header if available
              ...(localStorage.getItem('token') && {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              })
            }
          }
        );

        if (response.ok) {
          const result = await response.json();
          const data = result.data || [];
          setDataSource(result.dataSource || 'unknown');

          if (!Array.isArray(data)) {
            throw new Error("Invalid data format from API.");
          }

          // Transform the data for the Chart component
          const formattedData = data.map((item: ProductivityDataItem) =>
            item.productivity || item.value || 0
          );
          
          const formattedLabels = data.map((item: ProductivityDataItem) => {
            if (period === 'hourly') {
              return item.date; // Already formatted as "HH:MM"
            }
            return new Date(item.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            });
          });

          setActivityData(formattedData);
          setActivityLabels(formattedLabels);
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }

      } catch (e: any) {
        console.error("Failed to fetch or process chart data:", e);
        setError(e.message);
        setDataSource('fallback');
        
        // Enhanced fallback data
        const fallbackData = generateFallbackData(period, days);
        setActivityData(fallbackData.data);
        setActivityLabels(fallbackData.labels);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [userId, dateRange, period, days]);

  const generateFallbackData = (period: string, days: number) => {
    const data: number[] = [];
    const labels: string[] = [];

    if (period === 'hourly') {
      // Generate hourly pattern for today
      const productivityByHour = [
        45, 50, 55, 65, 75, 80, 85, 90, 88, 85, 82, 78,  // Morning peak
        70, 65, 60, 55, 60, 70, 75, 80, 75, 70, 60, 50   // Afternoon dip, evening recovery
      ];
      
      for (let hour = 0; hour < 24; hour++) {
        data.push(productivityByHour[hour]);
        labels.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    } else {
      // Generate daily pattern
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        
        // Simulate realistic productivity patterns
        const baseProductivity = 75 + (i % 7) * 3;  // Weekly pattern
        const dailyVariation = (i % 3) * 5 - 5;  // Some daily variation
        const productivity = Math.max(40, Math.min(95, baseProductivity + dailyVariation));
        
        data.push(productivity);
        labels.push(date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      }
    }

    return { data, labels };
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 h-full flex flex-col">
      {/* Header with data source indicator */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Productivity Trend ({period})
        </h3>
        {dataSource && (
          <Badge variant={dataSource === 'database' ? 'default' : 'secondary'}>
            {dataSource === 'database' ? 'Live Data' : 'Demo Data'}
          </Badge>
        )}
      </div>
      
      <div className="flex-grow" style={{ minHeight: '250px' }}>
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-full w-full" width="100%" height="100%" />
          </div>
        )}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-red-500 mb-2">Could not load chart data</p>
              <p className="text-xs text-gray-400">Using fallback data</p>
            </div>
          </div>
        )}
        {!isLoading && activityData.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500 text-center">
              No activity data available for the selected period.
            </p>
          </div>
        )}
        {!isLoading && activityData.length > 0 && (
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