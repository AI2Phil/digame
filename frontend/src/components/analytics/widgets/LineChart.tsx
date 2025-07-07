import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: any;
  options?: {
    title?: string;
    subtitle?: string;
    color_scheme?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'multi';
    show_legend?: boolean;
    show_grid?: boolean;
    show_points?: boolean;
    fill_area?: boolean;
    smooth_lines?: boolean;
    animation?: boolean;
    height?: number;
    time_series?: boolean;
    responsive?: boolean;
    show_trend_line?: boolean;
  };
  title?: string;
  isLoading?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  options = {},
  title,
  isLoading = false
}) => {
  // Color schemes with gradients for area fills
  const colorSchemes = {
    blue: {
      primary: '#3B82F6',
      gradient: 'rgba(59, 130, 246, 0.1)',
      hover: '#2563EB'
    },
    green: {
      primary: '#10B981',
      gradient: 'rgba(16, 185, 129, 0.1)',
      hover: '#059669'
    },
    red: {
      primary: '#EF4444',
      gradient: 'rgba(239, 68, 68, 0.1)',
      hover: '#DC2626'
    },
    purple: {
      primary: '#8B5CF6',
      gradient: 'rgba(139, 92, 246, 0.1)',
      hover: '#7C3AED'
    },
    orange: {
      primary: '#F59E0B',
      gradient: 'rgba(245, 158, 11, 0.1)',
      hover: '#D97706'
    },
    multi: [
      { primary: '#3B82F6', gradient: 'rgba(59, 130, 246, 0.1)', hover: '#2563EB' },
      { primary: '#10B981', gradient: 'rgba(16, 185, 129, 0.1)', hover: '#059669' },
      { primary: '#F59E0B', gradient: 'rgba(245, 158, 11, 0.1)', hover: '#D97706' },
      { primary: '#EF4444', gradient: 'rgba(239, 68, 68, 0.1)', hover: '#DC2626' },
      { primary: '#8B5CF6', gradient: 'rgba(139, 92, 246, 0.1)', hover: '#7C3AED' }
    ]
  };

  // Process and enhance data with time series patterns
  const processedData = useMemo(() => {
    if (!data) {
      // Enhanced sample data with realistic time series patterns
      const now = new Date();
      const sampleData = {
        labels: Array.from({ length: 30 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (29 - i));
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Daily Active Users',
          data: Array.from({ length: 30 }, (_, i) => {
            // Generate realistic data with trends and seasonality
            const baseValue = 1000;
            const trend = i * 5; // Growing trend
            const seasonality = Math.sin(i / 7 * Math.PI) * 100; // Weekly pattern
            const noise = (Math.random() - 0.5) * 50; // Random variation
            return Math.max(0, Math.round(baseValue + trend + seasonality + noise));
          }),
          trend: 'up',
          growth: 15.2
        }]
      };
      return sampleData;
    }

    // Handle different data formats
    if (Array.isArray(data)) {
      // Simple array format - generate time labels
      const labels = options.time_series
        ? data.map((_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (data.length - 1 - index));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          })
        : data.map((_, index) => `Point ${index + 1}`);
      
      return {
        labels,
        datasets: [{
          label: 'Values',
          data: data,
          trend: data.length > 1 ? (data[data.length - 1] > data[0] ? 'up' : 'down') : 'flat',
          growth: data.length > 1 ? ((data[data.length - 1] - data[0]) / data[0] * 100) : 0
        }]
      };
    }

    // Enhanced object format with metadata
    if (data.labels && data.datasets) {
      return {
        ...data,
        datasets: data.datasets.map((dataset: any, index: number) => ({
          ...dataset,
          trend: dataset.trend || (dataset.data?.length > 1 ?
            (dataset.data[dataset.data.length - 1] > dataset.data[0] ? 'up' : 'down') : 'flat'),
          growth: dataset.growth || (dataset.data?.length > 1 ?
            ((dataset.data[dataset.data.length - 1] - dataset.data[0]) / dataset.data[0] * 100) : 0)
        }))
      };
    }

    return data;
  }, [data, options.time_series]);

  // Chart configuration with enhanced styling
  const chartData: ChartData<'line'> = useMemo(() => {
    const isMultiColor = options.color_scheme === 'multi';
    const colors = isMultiColor ? colorSchemes.multi : colorSchemes[options.color_scheme || 'blue'];
    
    return {
      labels: processedData.labels || [],
      datasets: (processedData.datasets || []).map((dataset: any, index: number) => {
        const colorConfig = isMultiColor
          ? (colors as any)[index % (colors as any).length]
          : colors as any;
        
        return {
          label: dataset.label || `Dataset ${index + 1}`,
          data: dataset.data || [],
          borderColor: colorConfig.primary,
          backgroundColor: options.fill_area ? colorConfig.gradient : 'transparent',
          borderWidth: 3,
          pointBackgroundColor: colorConfig.primary,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: options.show_points !== false ? 4 : 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: colorConfig.hover,
          pointHoverBorderColor: '#FFFFFF',
          pointHoverBorderWidth: 3,
          fill: options.fill_area || false,
          tension: options.smooth_lines !== false ? 0.4 : 0,
          spanGaps: true
        };
      })
    };
  }, [processedData, options]);

  const chartOptions: ChartOptions<'line'> = useMemo(() => ({
    responsive: options.responsive !== false,
    maintainAspectRatio: false,
    animation: options.animation !== false ? {
      duration: 1200,
      easing: 'easeInOutQuart'
    } : false,
    scales: {
      x: {
        display: true,
        grid: {
          display: options.show_grid !== false,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          maxTicksLimit: 8
        }
      },
      y: {
        display: true,
        grid: {
          display: options.show_grid !== false,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(value) {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: options.show_legend !== false,
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round'
      }
    }
  }), [options]);

  // Calculate trend analysis
  const trendAnalysis = useMemo(() => {
    if (!processedData.datasets || processedData.datasets.length === 0) return null;
    
    const firstDataset = processedData.datasets[0];
    const values = firstDataset.data || [];
    
    if (values.length < 2) return null;
    
    const total = values.reduce((sum: number, val: number) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    const change = latest - previous;
    const changePercent = (change / previous) * 100;
    
    // Calculate simple linear trend
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = total;
    const sumXY = values.reduce((sum, val, index) => sum + (val * index), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return {
      total,
      average,
      max,
      min,
      latest,
      change,
      changePercent,
      trend: firstDataset.trend,
      growth: firstDataset.growth,
      slope: slope,
      direction: slope > 0 ? 'up' : slope < 0 ? 'down' : 'flat',
      volatility: Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / n)
    };
  }, [processedData]);

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Activity className="w-5 h-5 text-blue-600" />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {options.title || title || 'Line Chart'}
            </Typography>
          </Box>
          
          {trendAnalysis && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {trendAnalysis.direction === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
              {trendAnalysis.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
              {trendAnalysis.changePercent !== undefined && (
                <Chip
                  label={`${trendAnalysis.changePercent > 0 ? '+' : ''}${trendAnalysis.changePercent.toFixed(1)}%`}
                  size="small"
                  color={trendAnalysis.changePercent > 0 ? 'success' : trendAnalysis.changePercent < 0 ? 'error' : 'default'}
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        {/* Subtitle */}
        {options.subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {options.subtitle}
          </Typography>
        )}

        {/* Chart */}
        <Box sx={{
          height: options.height || 300,
          width: '100%',
          position: 'relative'
        }}>
          <Line data={chartData} options={chartOptions} />
        </Box>

        {/* Trend Analysis */}
        {trendAnalysis && (
          <Box sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Latest</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {trendAnalysis.latest.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Average</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {trendAnalysis.average.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Peak</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {trendAnalysis.max.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Change</Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: trendAnalysis.change > 0 ? 'success.main' :
                         trendAnalysis.change < 0 ? 'error.main' : 'text.primary'
                }}
              >
                {trendAnalysis.change > 0 ? '+' : ''}{trendAnalysis.change.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LineChart;