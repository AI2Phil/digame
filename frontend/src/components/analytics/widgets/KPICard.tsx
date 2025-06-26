import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';

interface KPICardProps {
  data: {
    value: number;
    formatted_value?: string;
    unit?: string;
    previous_value?: number;
    target_value?: number;
    change_percent?: number;
    trend?: 'up' | 'down' | 'flat';
    status?: 'excellent' | 'good' | 'warning' | 'critical';
    percentage?: number;
  };
  options: {
    format?: 'number' | 'percentage' | 'currency';
    currency?: string;
    decimals?: number;
    show_trend?: boolean;
    show_progress?: boolean;
    color_scheme?: string;
    icon?: string;
  };
  title: string;
}

export const KPICard: React.FC<KPICardProps> = ({ data, options, title }) => {
  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: 'error.main' }} />;
      case 'flat':
        return <TrendingFlatIcon sx={{ color: 'info.main' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'primary';
    }
  };

  const formatValue = () => {
    if (data.formatted_value) {
      return data.formatted_value;
    }

    const value = data.value;
    const decimals = options.decimals || 0;

    switch (options.format) {
      case 'percentage':
        return `${value.toFixed(decimals)}%`;
      case 'currency':
        const currency = options.currency || 'USD';
        return `${currency} ${value.toLocaleString(undefined, { 
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals 
        })}`;
      case 'number':
      default:
        return value.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
    }
  };

  const getChangeColor = () => {
    if (!data.change_percent) return 'text.secondary';
    return data.change_percent > 0 ? 'success.main' : 
           data.change_percent < 0 ? 'error.main' : 'text.secondary';
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Header with icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {options.icon && (
            <Avatar
              sx={{
                bgcolor: `${getStatusColor()}.light`,
                color: `${getStatusColor()}.main`,
                mr: 2,
                width: 40,
                height: 40
              }}
            >
              {/* Icon would be rendered here based on options.icon */}
              📊
            </Avatar>
          )}
          <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>
            {title}
          </Typography>
          {options.show_trend && getTrendIcon()}
        </Box>

        {/* Main Value */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: `${getStatusColor()}.main`,
              lineHeight: 1.2
            }}
          >
            {formatValue()}
          </Typography>
          {data.unit && (
            <Typography variant="body2" color="text.secondary">
              {data.unit}
            </Typography>
          )}
        </Box>

        {/* Change Indicator */}
        {data.change_percent !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip
              label={`${data.change_percent > 0 ? '+' : ''}${data.change_percent.toFixed(1)}%`}
              size="small"
              sx={{
                bgcolor: data.change_percent > 0 ? 'success.light' : 
                         data.change_percent < 0 ? 'error.light' : 'grey.200',
                color: data.change_percent > 0 ? 'success.dark' : 
                       data.change_percent < 0 ? 'error.dark' : 'text.secondary'
              }}
            />
            {data.previous_value && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                vs previous: {data.previous_value.toLocaleString()}
              </Typography>
            )}
          </Box>
        )}

        {/* Progress Bar (for targets) */}
        {options.show_progress && data.target_value && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Progress to target
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.target_value.toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((data.value / data.target_value) * 100, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: `${getStatusColor()}.main`
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {((data.value / data.target_value) * 100).toFixed(1)}% of target
            </Typography>
          </Box>
        )}

        {/* Status Indicator */}
        {data.status && (
          <Box sx={{ mt: 'auto' }}>
            <Chip
              label={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              color={getStatusColor() as any}
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </CardContent>
    </Box>
  );
};

export default KPICard;