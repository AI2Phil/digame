import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { PieChart as PieChartIcon, Circle } from 'lucide-react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: any;
  options?: {
    title?: string;
    subtitle?: string;
    color_scheme?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'multi' | 'pastel';
    show_legend?: boolean;
    show_percentages?: boolean;
    show_values?: boolean;
    animation?: boolean;
    height?: number;
    doughnut?: boolean;
    responsive?: boolean;
    cutout_percentage?: number;
    show_data_labels?: boolean;
  };
  title?: string;
  isLoading?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  options = {},
  title,
  isLoading = false
}) => {
  // Color schemes for pie charts
  const colorSchemes = useMemo(() => ({
    blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#1E40AF', '#2563EB'],
    green: ['#10B981', '#34D399', '#6EE7B7', '#D1FAE5', '#047857', '#059669'],
    red: ['#EF4444', '#F87171', '#FCA5A5', '#FEE2E2', '#B91C1C', '#DC2626'],
    purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#EDE9FE', '#6D28D9', '#7C3AED'],
    orange: ['#F59E0B', '#FBBF24', '#FCD34D', '#FEF3C7', '#B45309', '#D97706'],
    multi: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
    pastel: ['#FECACA', '#FED7AA', '#FEF3C7', '#D1FAE5', '#DBEAFE', '#E0E7FF', '#F3E8FF', '#FCE7F3']
  }), []);

  // Process and enhance data
  const processedData = useMemo(() => {
    if (!data) {
      // Enhanced sample data with realistic distribution
      const sampleData = {
        labels: ['Desktop', 'Mobile', 'Tablet', 'Smart TV', 'Other'],
        datasets: [{
          label: 'Device Usage',
          data: [45.2, 38.7, 12.1, 2.8, 1.2],
          total: 100
        }]
      };
      return sampleData;
    }

    // Handle different data formats
    if (Array.isArray(data)) {
      // Simple array format
      const total = data.reduce((sum, val) => sum + val, 0);
      return {
        labels: data.map((_, index) => `Segment ${index + 1}`),
        datasets: [{
          label: 'Values',
          data: data,
          total: total
        }]
      };
    }

    // Enhanced object format with metadata
    if (data.labels && data.datasets) {
      return {
        ...data,
        datasets: data.datasets.map((dataset: any) => ({
          ...dataset,
          total: dataset.total || dataset.data?.reduce((sum: number, val: number) => sum + val, 0)
        }))
      };
    }

    return data;
  }, [data]);

  // Chart configuration
  const chartData: ChartData<'pie'> = useMemo(() => {
    const colors = colorSchemes[options.color_scheme || 'multi'];
    
    return {
      labels: processedData.labels || [],
      datasets: (processedData.datasets || []).map((dataset: any) => ({
        label: dataset.label || 'Data',
        data: dataset.data || [],
        backgroundColor: colors.slice(0, dataset.data?.length || colors.length),
        borderColor: colors.slice(0, dataset.data?.length || colors.length).map(color => color),
        borderWidth: 2,
        hoverBackgroundColor: colors.slice(0, dataset.data?.length || colors.length).map(color =>
          color.replace(')', ', 0.8)').replace('rgb', 'rgba')
        ),
        hoverBorderColor: '#FFFFFF',
        hoverBorderWidth: 3,
        hoverOffset: 8
      }))
    };
  }, [processedData, options.color_scheme, colorSchemes]);

  const chartOptions: ChartOptions<'pie'> = useMemo(() => ({
    responsive: options.responsive !== false,
    maintainAspectRatio: false,
    animation: options.animation !== false ? {
      duration: 1000,
      easing: 'easeInOutQuart'
    } : false,
    cutout: options.doughnut ? (options.cutout_percentage || 50) + '%' : 0,
    plugins: {
      legend: {
        display: options.show_legend !== false,
        position: 'bottom' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              const dataset = data.datasets[0];
              const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
              
              return data.labels.map((label, index) => {
                const value = Number(dataset.data[index]);
                const percentage = ((value / Number(total)) * 100).toFixed(1);
                
                return {
                  text: options.show_percentages !== false
                    ? `${label} (${percentage}%)`
                    : label as string,
                  fillStyle: dataset.backgroundColor?.[index] as string,
                  strokeStyle: dataset.borderColor?.[index] as string,
                  lineWidth: 2,
                  hidden: false,
                  index: index
                };
              });
            }
            return [];
          }
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
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            if (options.show_values && options.show_percentages !== false) {
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            } else if (options.show_values) {
              return `${label}: ${value.toLocaleString()}`;
            } else {
              return `${label}: ${percentage}%`;
            }
          }
        }
      }
    },
    interaction: {
      intersect: true
    }
  }), [options]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!processedData.datasets || processedData.datasets.length === 0) return null;
    
    const dataset = processedData.datasets[0];
    const values = dataset.data || [];
    const labels = processedData.labels || [];
    const total = values.reduce((sum: number, val: number) => sum + val, 0);
    
    const segments = values.map((value: number, index: number) => ({
      label: labels[index] || `Segment ${index + 1}`,
      value: value,
      percentage: (value / total) * 100,
      color: chartData.datasets[0].backgroundColor?.[index]
    })).sort((a, b) => b.value - a.value);
    
    const largest = segments[0];
    const smallest = segments[segments.length - 1];
    
    return {
      total,
      segments,
      largest,
      smallest,
      count: values.length
    };
  }, [processedData, chartData]);

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
            <PieChartIcon className="w-5 h-5 text-blue-600" />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {options.title || title || (options.doughnut ? 'Doughnut Chart' : 'Pie Chart')}
            </Typography>
          </Box>
          
          {statistics && (
            <Chip
              label={`${statistics.count} segments`}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
        </Box>

        {/* Subtitle */}
        {options.subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {options.subtitle}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 3, height: options.height || 300 }}>
          {/* Chart */}
          <Box sx={{
            flex: 1,
            position: 'relative',
            minWidth: 200
          }}>
            <Pie data={chartData} options={chartOptions} />
          </Box>

          {/* Data Summary */}
          {statistics && options.show_legend === false && (
            <Box sx={{ width: 200, overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Breakdown
              </Typography>
              <List dense>
                {statistics.segments.map((segment, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <Circle
                        className="w-3 h-3"
                        style={{
                          fill: segment.color as string,
                          color: segment.color as string
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {segment.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {segment.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      }
                      secondary={
                        options.show_values && (
                          <Typography variant="caption" color="text.secondary">
                            {segment.value.toLocaleString()}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {/* Summary Statistics */}
        {statistics && (
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
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {statistics.total.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Largest</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {statistics.largest.label} ({statistics.largest.percentage.toFixed(1)}%)
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Smallest</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {statistics.smallest.label} ({statistics.smallest.percentage.toFixed(1)}%)
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Segments</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {statistics.count}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChart;