import React, { useMemo } from 'react';
import {
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  Avatar,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';

interface TimelineChartProps {
  data: any;
  options?: any;
  title?: string;
}

interface TimelineEvent {
  id: string | number;
  timestamp: string | Date;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'pending';
  category?: string;
  user?: string;
  avatar?: string;
  metadata?: Record<string, any>;
  duration?: number;
  status?: string;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ 
  data, 
  options = {}, 
  title 
}) => {
  const timelineData: TimelineEvent[] = useMemo(() => {
    if (!data) return [];
    
    // Handle different data formats
    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        id: item.id || index,
        timestamp: item.timestamp || item.date || item.created_at || new Date(),
        title: item.title || item.name || item.event || `Event ${index + 1}`,
        description: item.description || item.details || item.message,
        type: item.type || item.status || 'info',
        category: item.category || item.tag,
        user: item.user || item.author || item.created_by,
        avatar: item.avatar || item.user_avatar,
        metadata: item.metadata || item.data,
        duration: item.duration,
        status: item.status
      }));
    }
    
    // Handle single event
    if (typeof data === 'object') {
      return [{
        id: data.id || 1,
        timestamp: data.timestamp || data.date || data.created_at || new Date(),
        title: data.title || data.name || data.event || 'Event',
        description: data.description || data.details || data.message,
        type: data.type || data.status || 'info',
        category: data.category || data.tag,
        user: data.user || data.author || data.created_by,
        avatar: data.avatar || data.user_avatar,
        metadata: data.metadata || data.data,
        duration: data.duration,
        status: data.status
      }];
    }
    
    return [];
  }, [data]);

  // Sort events by timestamp (most recent first)
  const sortedEvents = useMemo(() => {
    return [...timelineData].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  }, [timelineData]);

  // Get icon based on event type
  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  // Get color based on event type
  const getEventColor = (event: TimelineEvent): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' => {
    switch (event.type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'pending':
        return 'secondary';
      case 'info':
      default:
        return 'primary';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes} min ago` : 'Just now';
    }
  };

  // Format duration
  const formatDuration = (duration: number): string => {
    if (duration < 60) {
      return `${duration}s`;
    } else if (duration < 3600) {
      return `${Math.floor(duration / 60)}m`;
    } else {
      return `${Math.floor(duration / 3600)}h`;
    }
  };

  if (!data || sortedEvents.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No timeline events available
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
          label={`${sortedEvents.length} events`}
          size="small"
          variant="outlined"
          color="primary"
        />
        {sortedEvents.length > 0 && (
          <Chip
            label={`Latest: ${formatTimestamp(sortedEvents[0].timestamp)}`}
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {/* Custom Timeline */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Stack spacing={2}>
          {sortedEvents.map((event, index) => (
            <Box key={event.id} sx={{ display: 'flex', gap: 2 }}>
              {/* Timeline connector */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                {/* Icon/Avatar */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${getEventColor(event)}.main`,
                    color: 'white',
                    mb: 1
                  }}
                >
                  {event.avatar ? (
                    <Avatar
                      src={event.avatar}
                      sx={{ width: 32, height: 32 }}
                    >
                      {event.user?.charAt(0).toUpperCase()}
                    </Avatar>
                  ) : (
                    getEventIcon(event)
                  )}
                </Box>
                
                {/* Connector line */}
                {index < sortedEvents.length - 1 && (
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      bgcolor: 'divider',
                      minHeight: 20
                    }}
                  />
                )}
              </Box>

              {/* Event content */}
              <Box sx={{ flex: 1, pb: 2 }}>
                {/* Timestamp */}
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  {formatTimestamp(event.timestamp)}
                  {event.duration && ` • Duration: ${formatDuration(event.duration)}`}
                </Typography>

                {/* Event card */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: 'background.paper',
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  {/* Event header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" component="h6">
                      {event.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {event.category && (
                        <Chip
                          label={event.category}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      )}
                      {event.status && (
                        <Chip
                          label={event.status}
                          size="small"
                          color={getEventColor(event)}
                          variant="filled"
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Event description */}
                  {event.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {event.description}
                    </Typography>
                  )}

                  {/* Event metadata */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {Object.entries(event.metadata).slice(0, 3).map(([key, value]) => (
                        <Typography key={key} variant="caption" display="block" color="text.secondary">
                          {key}: {String(value)}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* User info */}
                  {event.user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {event.user}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Summary */}
      {options.showSummary && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            {sortedEvents.length} events tracked
          </Typography>
          {sortedEvents.length > 0 && (
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              From {formatTimestamp(sortedEvents[sortedEvents.length - 1].timestamp)} to {formatTimestamp(sortedEvents[0].timestamp)}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TimelineChart;