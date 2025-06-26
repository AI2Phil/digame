import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Fade,
  Skeleton
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  GetApp as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

import { analyticsApi } from '../../../services/api/analytics';
import { KPICard } from './KPICard';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { DataTable } from './DataTable';
import { GaugeChart } from './GaugeChart';
import { HeatmapChart } from './HeatmapChart';
import { TimelineChart } from './TimelineChart';

interface DashboardWidgetProps {
  widget: {
    id: number;
    widget_uuid: string;
    widget_type: string;
    title: string;
    data_source_config: any;
    display_options: any;
    created_at: string;
    updated_at: string;
  };
  filters?: any;
  timeRange?: any;
  isEditMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onFullscreen?: () => void;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  widget,
  filters = {},
  timeRange = {},
  isEditMode = false,
  onEdit,
  onDelete,
  onFullscreen
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch widget data
  const {
    data: widgetData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['widget-data', widget.id, filters, timeRange],
    queryFn: () => analyticsApi.getWidgetData(widget.id, {
      filters,
      timeRange,
      refresh_cache: isRefreshing
    }),
    refetchInterval: widget.display_options?.auto_refresh ? 30000 : false,
    staleTime: 60000 // 1 minute
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    handleMenuClose();
  };

  const handleDownload = () => {
    // Export widget data as CSV/JSON
    const dataStr = JSON.stringify(widgetData?.data || {}, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${widget.title.replace(/\s+/g, '_')}_data.json`;
    link.click();
    URL.revokeObjectURL(url);
    handleMenuClose();
  };

  const renderWidgetContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" height={200} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          sx={{ m: 2 }}
          action={
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          Failed to load widget data: {error.message}
        </Alert>
      );
    }

    if (!widgetData?.data) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          No data available
        </Alert>
      );
    }

    const data = widgetData.data;
    const displayOptions = widget.display_options || {};

    // Render different widget types
    switch (widget.widget_type) {
      case 'kpi_card':
        return (
          <KPICard
            data={data}
            options={displayOptions}
            title={widget.title}
          />
        );
      
      case 'line_chart':
        return (
          <LineChart
            data={data}
            options={displayOptions}
            title={widget.title}
          />
        );
      
      case 'bar_chart':
        return (
          <BarChart
            data={data}
            options={displayOptions}
            title={widget.title}
          />
        );
      
      case 'pie_chart':
        return (
          <PieChart
            data={data}
            options={displayOptions}
            title={widget.title}
          />
        );
      
      case 'table':
        return (
          <DataTable
            data={data}
            options={displayOptions}
            title={widget.title}
          />
        );
      
      case 'gauge':
        return (
          <GaugeChart
            data={data}
            options={displayOptions}
            title={widget.title}
          />
        );
      
      case 'heatmap':
        return (
          <HeatmapChart
            data={data}
            options={displayOptions}
            title={widget.title}
          />
        );
      
      case 'timeline':
        return (
          <TimelineChart
            data={data}
            options={displayOptions}
            title={widget.title}
          />
        );
      
      default:
        return (
          <Alert severity="warning" sx={{ m: 2 }}>
            Unknown widget type: {widget.widget_type}
          </Alert>
        );
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'increasing':
        return <TrendingUpIcon color="success" />;
      case 'down':
      case 'decreasing':
        return <TrendingDownIcon color="error" />;
      case 'flat':
      case 'stable':
        return <TrendingFlatIcon color="info" />;
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover .widget-actions': {
          opacity: isEditMode ? 1 : 0
        }
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div" noWrap>
              {widget.title}
            </Typography>
            {widgetData?.data?.trend && getTrendIcon(widgetData.data.trend)}
            {widgetData?.metadata?.has_error && (
              <Tooltip title="Data error">
                <ErrorIcon color="error" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        }
        action={
          <Box className="widget-actions" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
            {isRefreshing && <CircularProgress size={20} />}
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flex: 1, pt: 0, overflow: 'hidden' }}>
        <Fade in={!isLoading}>
          <Box sx={{ height: '100%' }}>
            {renderWidgetContent()}
          </Box>
        </Fade>
      </CardContent>

      {/* Widget metadata */}
      {widgetData?.metadata && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {widgetData.metadata.data_count && (
              <Chip
                label={`${widgetData.metadata.data_count} items`}
                size="small"
                variant="outlined"
              />
            )}
            {widgetData.metadata.personalized && (
              <Chip
                label="Personalized"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {widgetData.cache_info?.from_cache && (
              <Chip
                label="Cached"
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleRefresh}>
          <RefreshIcon sx={{ mr: 1 }} />
          Refresh
        </MenuItem>
        
        <MenuItem onClick={handleDownload}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download Data
        </MenuItem>
        
        {onFullscreen && (
          <MenuItem onClick={() => { onFullscreen(); handleMenuClose(); }}>
            <FullscreenIcon sx={{ mr: 1 }} />
            Fullscreen
          </MenuItem>
        )}
        
        {isEditMode && onEdit && (
          <MenuItem onClick={() => { onEdit(); handleMenuClose(); }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit Widget
          </MenuItem>
        )}
        
        {isEditMode && onDelete && (
          <MenuItem 
            onClick={() => { onDelete(); handleMenuClose(); }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Widget
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default DashboardWidget;