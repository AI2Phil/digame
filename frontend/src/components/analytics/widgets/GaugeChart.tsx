import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';

interface GaugeChartProps {
  data: any;
  options?: any;
  title?: string;
}

interface GaugeData {
  value: number;
  min?: number;
  max?: number;
  target?: number;
  unit?: string;
  label?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ 
  data, 
  options = {}, 
  title 
}) => {
  const gaugeData: GaugeData = useMemo(() => {
    if (!data) return { value: 0 };
    
    // Handle different data formats
    if (typeof data === 'number') {
      return { value: data };
    }
    
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      return {
        value: item.value || item.current || item.score || 0,
        min: item.min || 0,
        max: item.max || 100,
        target: item.target,
        unit: item.unit || '%',
        label: item.label || item.name,
        trend: item.trend,
        trendValue: item.trend_value || item.change,
        status: item.status,
        thresholds: item.thresholds
      };
    }
    
    return {
      value: data.value || data.current || data.score || 0,
      min: data.min || 0,
      max: data.max || 100,
      target: data.target,
      unit: data.unit || '%',
      label: data.label || data.name,
      trend: data.trend,
      trendValue: data.trend_value || data.change,
      status: data.status,
      thresholds: data.thresholds
    };
  }, [data]);

  const {
    value,
    min = 0,
    max = 100,
    target,
    unit = '%',
    label,
    trend,
    trendValue,
    status,
    thresholds
  } = gaugeData;

  // Calculate percentage for progress bar
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  
  // Determine status based on thresholds if not provided
  const getStatus = () => {
    if (status) return status;
    if (!thresholds) return 'info';
    
    if (thresholds.critical && value >= thresholds.critical) return 'error';
    if (thresholds.warning && value >= thresholds.warning) return 'warning';
    return 'success';
  };

  const currentStatus = getStatus();

  // Color mapping for different statuses
  const getColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'primary';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" fontSize="small" />;
      case 'down':
        return <TrendingDownIcon color="error" fontSize="small" />;
      case 'flat':
        return <TrendingFlatIcon color="info" fontSize="small" />;
      default:
        return null;
    }
  };

  // Format value display
  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toFixed(1);
  };

  if (!data) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No gauge data available
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      {(title || label) && (
        <Typography variant="h6" gutterBottom align="center">
          {title || label}
        </Typography>
      )}

      {/* Main Gauge Display */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Value Display */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h2" 
            component="div" 
            color={`${getColor(currentStatus)}.main`}
            sx={{ fontWeight: 'bold', lineHeight: 1 }}
          >
            {formatValue(value)}
            <Typography 
              component="span" 
              variant="h4" 
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              {unit}
            </Typography>
          </Typography>
          
          {/* Trend Indicator */}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              {getTrendIcon()}
              {trendValue && (
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {trendValue > 0 ? '+' : ''}{trendValue}{unit}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={getColor(currentStatus) as any}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
              }
            }}
          />
          
          {/* Range Labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {formatValue(min)}{unit}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatValue(max)}{unit}
            </Typography>
          </Box>
        </Box>

        {/* Target Indicator */}
        {target && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Chip
              label={`Target: ${formatValue(target)}${unit}`}
              size="small"
              variant="outlined"
              color={value >= target ? 'success' : 'default'}
            />
          </Box>
        )}

        {/* Status Indicators */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={currentStatus.toUpperCase()}
            size="small"
            color={getColor(currentStatus) as any}
            variant="filled"
          />
          
          {thresholds && (
            <>
              {thresholds.warning && (
                <Chip
                  label={`Warning: ${formatValue(thresholds.warning)}${unit}`}
                  size="small"
                  variant="outlined"
                  color="warning"
                />
              )}
              {thresholds.critical && (
                <Chip
                  label={`Critical: ${formatValue(thresholds.critical)}${unit}`}
                  size="small"
                  variant="outlined"
                  color="error"
                />
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Additional Metrics */}
      {options.showDetails && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Range: {formatValue(min)} - {formatValue(max)}{unit}
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Progress: {percentage.toFixed(1)}%
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GaugeChart;