/**
 * Integration Health Dashboard - Phase 2A Implementation
 * Priority 2: Integration Ecosystem Completion (75% → 95%)
 * 
 * Comprehensive dashboard for monitoring integration health, performance metrics,
 * alerts, and optimization recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon
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

// Types
interface OverviewMetrics {
  total_integrations: number;
  active_integrations: number;
  integration_utilization: number;
  last_24h_syncs: number;
  overall_success_rate: number;
  data_processed_mb: number;
  active_alerts: number;
  avg_response_time: number;
  uptime_percentage: number;
}

interface ProviderHealth {
  provider_id: number;
  provider_name: string;
  total_connections: number;
  active_connections: number;
  healthy_connections: number;
  warning_connections: number;
  critical_connections: number;
  health_score: number;
  avg_response_time: number;
  success_rate: number;
  uptime_percentage: number;
  last_check: string;
  trending: 'improving' | 'stable' | 'degrading';
}

interface HealthAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  description: string;
  provider_name: string;
  connection_id?: number;
  created_at: string;
  resolved_at?: string;
  metrics: Record<string, any>;
}

interface PerformanceTrend {
  date: string;
  value: number;
}

interface DashboardData {
  overview: OverviewMetrics;
  provider_health: ProviderHealth[];
  recent_alerts: HealthAlert[];
  performance_trends: {
    success_rate: PerformanceTrend[];
    response_time: PerformanceTrend[];
    sync_volume: PerformanceTrend[];
    error_rate: PerformanceTrend[];
  };
  top_performers: Array<{
    connection_name: string;
    provider_name: string;
    score: number;
    success_rate: number;
    avg_response_time: number;
  }>;
  recommendations: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    actions: string[];
  }>;
}

const IntegrationHealthDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<HealthAlert | null>(null);
  const [monitoringInProgress, setMonitoringInProgress] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/integrations/health/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setDashboardData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger health monitoring
  const triggerMonitoring = async () => {
    try {
      setMonitoringInProgress(true);
      const response = await fetch('/api/v1/integrations/health/monitor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to trigger monitoring');
      }

      // Refresh dashboard after a delay
      setTimeout(() => {
        fetchDashboardData();
        setMonitoringInProgress(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger monitoring');
      setMonitoringInProgress(false);
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string, notes: string) => {
    try {
      const response = await fetch(`/api/v1/integrations/health/alerts/${alertId}/resolve?resolution_notes=${encodeURIComponent(notes)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to resolve alert');
      }

      // Refresh dashboard
      fetchDashboardData();
      setAlertDialogOpen(false);
      setSelectedAlert(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'error';
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50'; // Green
    if (score >= 70) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'improving': return <TrendingUpIcon color="success" />;
      case 'degrading': return <TrendingDownIcon color="error" />;
      default: return <TrendingFlatIcon color="action" />;
    }
  };

  // Chart configurations
  const getPerformanceTrendChartData = (trends: PerformanceTrend[], label: string, color: string) => ({
    labels: trends.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [{
      label,
      data: trends.map(t => t.value),
      borderColor: color,
      backgroundColor: `${color}20`,
      fill: true,
      tension: 0.4
    }]
  });

  const getHealthDistributionChartData = (providers: ProviderHealth[]) => {
    const totalHealthy = providers.reduce((sum, p) => sum + p.healthy_connections, 0);
    const totalWarning = providers.reduce((sum, p) => sum + p.warning_connections, 0);
    const totalCritical = providers.reduce((sum, p) => sum + p.critical_connections, 0);

    return {
      labels: ['Healthy', 'Warning', 'Critical'],
      datasets: [{
        data: [totalHealthy, totalWarning, totalCritical],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        borderWidth: 2
      }]
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchDashboardData}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!dashboardData) {
    return <Alert severity="info">No dashboard data available</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Integration Health Dashboard
        </Typography>
        <Box>
          <Tooltip title="Trigger Health Monitoring">
            <IconButton 
              onClick={triggerMonitoring} 
              disabled={monitoringInProgress}
              color="primary"
            >
              {monitoringInProgress ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            sx={{ ml: 1 }}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {/* Overview Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Integrations
              </Typography>
              <Typography variant="h4">
                {dashboardData.overview.total_integrations}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {dashboardData.overview.active_integrations} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4" color={dashboardData.overview.overall_success_rate >= 95 ? 'success.main' : 'warning.main'}>
                {dashboardData.overview.overall_success_rate.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.overview.overall_success_rate} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Response Time
              </Typography>
              <Typography variant="h4">
                {dashboardData.overview.avg_response_time.toFixed(0)}ms
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Alerts
              </Typography>
              <Typography variant="h4" color={dashboardData.overview.active_alerts > 0 ? 'error.main' : 'success.main'}>
                <Badge badgeContent={dashboardData.overview.active_alerts} color="error">
                  <NotificationsIcon />
                </Badge>
                {dashboardData.overview.active_alerts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Provider Health" />
          <Tab label="Performance Trends" />
          <Tab label="Alerts" />
          <Tab label="Top Performers" />
          <Tab label="Recommendations" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {/* Health Distribution Chart */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Health Distribution
                </Typography>
                <Box height={300}>
                  <Doughnut 
                    data={getHealthDistributionChartData(dashboardData.provider_health)}
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

          {/* Provider Health Table */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Provider Health Status
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Provider</TableCell>
                        <TableCell>Health Score</TableCell>
                        <TableCell>Connections</TableCell>
                        <TableCell>Success Rate</TableCell>
                        <TableCell>Response Time</TableCell>
                        <TableCell>Trending</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.provider_health.map((provider) => (
                        <TableRow key={provider.provider_id}>
                          <TableCell>{provider.provider_name}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={provider.health_score}
                                sx={{ 
                                  width: 60, 
                                  mr: 1,
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getHealthScoreColor(provider.health_score)
                                  }
                                }}
                              />
                              <Typography variant="body2">
                                {provider.health_score.toFixed(0)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Chip 
                                size="small" 
                                label={`${provider.healthy_connections}H`} 
                                color="success" 
                                sx={{ mr: 0.5 }}
                              />
                              {provider.warning_connections > 0 && (
                                <Chip 
                                  size="small" 
                                  label={`${provider.warning_connections}W`} 
                                  color="warning" 
                                  sx={{ mr: 0.5 }}
                                />
                              )}
                              {provider.critical_connections > 0 && (
                                <Chip 
                                  size="small" 
                                  label={`${provider.critical_connections}C`} 
                                  color="error" 
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{provider.success_rate.toFixed(1)}%</TableCell>
                          <TableCell>{provider.avg_response_time.toFixed(0)}ms</TableCell>
                          <TableCell>{getTrendingIcon(provider.trending)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Success Rate Trend
                </Typography>
                <Box height={300}>
                  <Line
                    data={getPerformanceTrendChartData(
                      dashboardData.performance_trends.success_rate,
                      'Success Rate (%)',
                      '#4caf50'
                    )}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100
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
                  Response Time Trend
                </Typography>
                <Box height={300}>
                  <Line
                    data={getPerformanceTrendChartData(
                      dashboardData.performance_trends.response_time,
                      'Response Time (ms)',
                      '#2196f3'
                    )}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
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
                  Sync Volume Trend
                </Typography>
                <Box height={300}>
                  <Bar
                    data={getPerformanceTrendChartData(
                      dashboardData.performance_trends.sync_volume,
                      'Sync Count',
                      '#ff9800'
                    )}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
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
                  Error Rate Trend
                </Typography>
                <Box height={300}>
                  <Line
                    data={getPerformanceTrendChartData(
                      dashboardData.performance_trends.error_rate,
                      'Error Rate (%)',
                      '#f44336'
                    )}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {selectedTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Alerts
            </Typography>
            {dashboardData.recent_alerts.length === 0 ? (
              <Alert severity="success">No active alerts</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Severity</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Provider</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recent_alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Chip
                            size="small"
                            label={alert.severity.toUpperCase()}
                            color={getSeverityColor(alert.severity) as any}
                          />
                        </TableCell>
                        <TableCell>{alert.title}</TableCell>
                        <TableCell>{alert.provider_name}</TableCell>
                        <TableCell>
                          {new Date(alert.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {alert.resolved_at ? (
                            <Chip size="small" label="Resolved" color="success" />
                          ) : (
                            <Chip size="small" label="Active" color="error" />
                          )}
                        </TableCell>
                        <TableCell>
                          {!alert.resolved_at && (
                            <Button
                              size="small"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setAlertDialogOpen(true);
                              }}
                            >
                              Resolve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Performing Integrations
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Connection</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Performance Score</TableCell>
                    <TableCell>Success Rate</TableCell>
                    <TableCell>Avg Response Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.top_performers.map((performer, index) => (
                    <TableRow key={index}>
                      <TableCell>{performer.connection_name}</TableCell>
                      <TableCell>{performer.provider_name}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={performer.score}
                            sx={{ width: 60, mr: 1 }}
                          />
                          <Typography variant="body2">
                            {performer.score.toFixed(0)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{performer.success_rate.toFixed(1)}%</TableCell>
                      <TableCell>{performer.avg_response_time.toFixed(0)}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {selectedTab === 4 && (
        <Grid container spacing={3}>
          {dashboardData.recommendations.map((recommendation, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip
                      size="small"
                      label={recommendation.priority.toUpperCase()}
                      color={recommendation.priority === 'high' ? 'error' : 'warning'}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="h6">
                      {recommendation.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {recommendation.description}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommended Actions:
                  </Typography>
                  <ul>
                    {recommendation.actions.map((action, actionIndex) => (
                      <li key={actionIndex}>
                        <Typography variant="body2">{action}</Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Alert Resolution Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Alert</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedAlert.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {selectedAlert.description}
              </Typography>
              <Typography variant="body2">
                Provider: {selectedAlert.provider_name}
              </Typography>
              <Typography variant="body2">
                Created: {new Date(selectedAlert.created_at).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedAlert && resolveAlert(selectedAlert.id, 'Resolved by user')}
            variant="contained"
          >
            Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationHealthDashboard;