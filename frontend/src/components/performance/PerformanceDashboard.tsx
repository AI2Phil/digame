import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
import {
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { performanceApi, DashboardData, SystemHealthStatus } from '../../services/performanceApi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const PerformanceDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState(24);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, healthResponse] = await Promise.all([
        performanceApi.getDashboard(timeRange),
        performanceApi.getSystemHealth()
      ]);
      
      setDashboardData(dashboardResponse.data);
      setHealthStatus(healthResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'resolved':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
      case 'high':
        return <ErrorIcon color="error" />;
      default:
        return <CheckCircleIcon color="disabled" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing':
      case 'improving':
        return <TrendingUpIcon color="success" />;
      case 'decreasing':
      case 'degrading':
        return <TrendingDownIcon color="error" />;
      default:
        return <TimelineIcon color="primary" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (loading && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton color="inherit" size="small" onClick={fetchDashboardData}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!dashboardData || !healthStatus) {
    return <Alert severity="info">No dashboard data available</Alert>;
  }

  // Chart configurations
  const responseTimeChartData = {
    labels: ['Current', 'Average', 'P95', 'P99'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [
          dashboardData.database_performance.avg_execution_time_ms,
          dashboardData.database_performance.avg_execution_time_ms,
          dashboardData.database_performance.p95_execution_time_ms,
          dashboardData.database_performance.p99_execution_time_ms
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336'],
        borderWidth: 1
      }
    ]
  };

  const systemMetricsChartData = {
    labels: Object.keys(dashboardData.system_metrics),
    datasets: [
      {
        label: 'Current Value',
        data: Object.values(dashboardData.system_metrics).map(m => m.current),
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2,
        fill: true
      }
    ]
  };

  const userExperienceChartData = {
    labels: ['Load Time', 'Error Rate', 'Bounce Rate'],
    datasets: [
      {
        data: [
          dashboardData.user_experience.avg_load_time_ms / 100, // Scale for visibility
          dashboardData.user_experience.error_rate_percent,
          dashboardData.user_experience.bounce_rate_percent
        ],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
        borderWidth: 2
      }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Performance Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={fetchDashboardData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* System Health Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {getStatusIcon(healthStatus.overall_status)}
            <Typography variant="h6">
              System Health: {healthStatus.overall_status.toUpperCase()}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {Object.entries(healthStatus.components).map(([component, status]) => (
              <Grid item xs={12} sm={6} md={3} key={component}>
                <Box display="flex" alignItems="center" gap={1}>
                  {getStatusIcon(status.status)}
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {component}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDuration(status.response_time_ms)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <SpeedIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {formatDuration(dashboardData.database_performance.avg_execution_time_ms)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <StorageIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {dashboardData.database_performance.total_queries.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Queries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PeopleIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {dashboardData.user_experience.unique_users.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ErrorIcon color={dashboardData.user_experience.error_rate_percent > 5 ? 'error' : 'success'} />
                <Box>
                  <Typography variant="h6">
                    {formatPercentage(dashboardData.user_experience.error_rate_percent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Error Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Database Performance
              </Typography>
              <Box height={300}>
                <Bar
                  data={responseTimeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Time (ms)'
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Experience Metrics
              </Typography>
              <Box height={300}>
                <Doughnut
                  data={userExperienceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Trends */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Trends
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={2}>
                {getTrendIcon(dashboardData.trends.response_time_trend)}
                <Box>
                  <Typography variant="body1">Response Time</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData.trends.response_time_trend}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={2}>
                {getTrendIcon(dashboardData.trends.error_rate_trend)}
                <Box>
                  <Typography variant="body1">Error Rate</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData.trends.error_rate_trend}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={2}>
                {getTrendIcon(dashboardData.trends.throughput_trend)}
                <Box>
                  <Typography variant="body1">Throughput</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardData.trends.throughput_trend}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {dashboardData.active_alerts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Alerts ({dashboardData.active_alerts.length})
            </Typography>
            {dashboardData.active_alerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={getStatusColor(alert.severity) as any}
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {alert.alert_name}
                  </Typography>
                  <Typography variant="body2">
                    {alert.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(alert.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Incidents */}
      {dashboardData.recent_incidents.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Incidents ({dashboardData.recent_incidents.length})
            </Typography>
            {dashboardData.recent_incidents.map((incident) => (
              <Box key={incident.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Chip
                    label={incident.severity}
                    color={getStatusColor(incident.severity) as any}
                    size="small"
                  />
                  <Chip
                    label={incident.status}
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="body1" fontWeight="bold">
                    {incident.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Started: {new Date(incident.started_at).toLocaleString()}
                  {incident.resolved_at && (
                    <> • Resolved: {new Date(incident.resolved_at).toLocaleString()}</>
                  )}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <Box mt={2} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(dashboardData.last_updated).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default PerformanceDashboard;