import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Grid,
  Paper,
  Alert,
  Chip,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface HeatmapChartProps {
  data: any;
  options?: any;
  title?: string;
}

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  label?: string;
  tooltip?: string;
}

interface HeatmapData {
  cells: HeatmapCell[];
  xLabels?: string[];
  yLabels?: string[];
  minValue?: number;
  maxValue?: number;
  colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ 
  data, 
  options = {}, 
  title 
}) => {
  const theme = useTheme();

  const heatmapData: HeatmapData = useMemo(() => {
    if (!data) return { cells: [] };
    
    // Handle different data formats
    if (Array.isArray(data)) {
      // If it's an array of objects with x, y, value
      if (data.length > 0 && typeof data[0] === 'object' && 'value' in data[0]) {
        const cells = data.map((item, index) => ({
          x: item.x ?? (index % 7), // Default to 7-day week layout
          y: item.y ?? Math.floor(index / 7),
          value: item.value || 0,
          label: item.label || item.name,
          tooltip: item.tooltip || item.description
        }));
        
        const values = cells.map(cell => cell.value);
        return {
          cells,
          xLabels: data[0].xLabels || options.xLabels,
          yLabels: data[0].yLabels || options.yLabels,
          minValue: Math.min(...values),
          maxValue: Math.max(...values),
          colorScheme: options.colorScheme || 'blue'
        };
      }
      
      // If it's a 2D array (matrix format)
      if (Array.isArray(data[0])) {
        const cells: HeatmapCell[] = [];
        data.forEach((row, y) => {
          row.forEach((value, x) => {
            cells.push({ x, y, value: value || 0 });
          });
        });
        
        const values = cells.map(cell => cell.value);
        return {
          cells,
          xLabels: options.xLabels,
          yLabels: options.yLabels,
          minValue: Math.min(...values),
          maxValue: Math.max(...values),
          colorScheme: options.colorScheme || 'blue'
        };
      }
    }
    
    // Handle object format
    if (typeof data === 'object' && data.matrix) {
      const cells: HeatmapCell[] = [];
      data.matrix.forEach((row: any[], y: number) => {
        row.forEach((value, x) => {
          cells.push({ x, y, value: value || 0 });
        });
      });
      
      const values = cells.map(cell => cell.value);
      return {
        cells,
        xLabels: data.xLabels || options.xLabels,
        yLabels: data.yLabels || options.yLabels,
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        colorScheme: data.colorScheme || options.colorScheme || 'blue'
      };
    }
    
    return { cells: [] };
  }, [data, options]);

  const {
    cells,
    xLabels = [],
    yLabels = [],
    minValue = 0,
    maxValue = 100,
    colorScheme = 'blue'
  } = heatmapData;

  // Get color intensity based on value
  const getColorIntensity = (value: number): number => {
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  // Get color based on scheme and intensity
  const getColor = (intensity: number): string => {
    const alpha = Math.max(0.1, Math.min(1, intensity));
    
    switch (colorScheme) {
      case 'green':
        return `rgba(76, 175, 80, ${alpha})`;
      case 'red':
        return `rgba(244, 67, 54, ${alpha})`;
      case 'purple':
        return `rgba(156, 39, 176, ${alpha})`;
      case 'orange':
        return `rgba(255, 152, 0, ${alpha})`;
      case 'blue':
      default:
        return `rgba(33, 150, 243, ${alpha})`;
    }
  };

  // Format value for display
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(1);
  };

  // Calculate grid dimensions
  const maxX = Math.max(...cells.map(cell => cell.x), 0);
  const maxY = Math.max(...cells.map(cell => cell.y), 0);
  const gridWidth = maxX + 1;
  const gridHeight = maxY + 1;

  // Create grid matrix for easier rendering
  const gridMatrix = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null));
  cells.forEach(cell => {
    if (cell.y < gridHeight && cell.x < gridWidth) {
      gridMatrix[cell.y][cell.x] = cell;
    }
  });

  if (!data || cells.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No heatmap data available
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      {title && (
        <Typography variant="h6" gutterBottom align="center">
          {title}
        </Typography>
      )}

      {/* Statistics */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          label={`Min: ${formatValue(minValue)}`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`Max: ${formatValue(maxValue)}`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`${cells.length} cells`}
          size="small"
          variant="outlined"
          color="primary"
        />
      </Box>

      {/* Heatmap Grid */}
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ display: 'inline-block' }}>
          {/* Y-axis labels */}
          <Box sx={{ display: 'flex' }}>
            {yLabels.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1 }}>
                {yLabels.map((label, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pr: 1,
                      minWidth: 60
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Main grid */}
            <Box>
              {/* X-axis labels */}
              {xLabels.length > 0 && (
                <Box sx={{ display: 'flex', mb: 1 }}>
                  {xLabels.map((label, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 32,
                        textAlign: 'center',
                        mr: index < xLabels.length - 1 ? 1 : 0
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              
              {/* Grid cells */}
              <Box>
                {gridMatrix.map((row, y) => (
                  <Box key={y} sx={{ display: 'flex', mb: 1 }}>
                    {row.map((cell, x) => {
                      const intensity = cell ? getColorIntensity(cell.value) : 0;
                      const backgroundColor = cell ? getColor(intensity) : theme.palette.grey[100];
                      
                      return (
                        <Tooltip
                          key={x}
                          title={
                            cell ? (
                              <Box>
                                <Typography variant="body2">
                                  {cell.label || `(${x}, ${y})`}
                                </Typography>
                                <Typography variant="body2">
                                  Value: {formatValue(cell.value)}
                                </Typography>
                                {cell.tooltip && (
                                  <Typography variant="caption">
                                    {cell.tooltip}
                                  </Typography>
                                )}
                              </Box>
                            ) : 'No data'
                          }
                          arrow
                        >
                          <Paper
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor,
                              border: 1,
                              borderColor: 'grey.300',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              mr: x < row.length - 1 ? 1 : 0,
                              '&:hover': {
                                transform: 'scale(1.1)',
                                zIndex: 1,
                                boxShadow: 2
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            {cell && options.showValues && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: '0.6rem',
                                  fontWeight: 'bold',
                                  color: intensity > 0.5 ? 'white' : 'text.primary'
                                }}
                              >
                                {cell.value < 1000 ? cell.value.toFixed(0) : formatValue(cell.value)}
                              </Typography>
                            )}
                          </Paper>
                        </Tooltip>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {formatValue(minValue)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => (
            <Box
              key={index}
              sx={{
                width: 16,
                height: 16,
                backgroundColor: getColor(intensity),
                border: 1,
                borderColor: 'grey.300'
              }}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {formatValue(maxValue)}
        </Typography>
      </Box>
    </Box>
  );
};

export default HeatmapChart;