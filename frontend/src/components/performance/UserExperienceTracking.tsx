import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Zap, 
  Eye, 
  MousePointer, 
  Smartphone, 
  Monitor, 
  Tablet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'poor';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  duration: number;
  pageViews: number;
  interactions: number;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  bounceRate: number;
  conversionEvents: number;
}

interface PagePerformance {
  path: string;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  visits: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface UserExperienceTrackingProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const UserExperienceTracking: React.FC<UserExperienceTrackingProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [pagePerformance, setPagePerformance] = useState<PagePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');

  // Core Web Vitals tracking
  const trackWebVitals = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetric[] = [
        {
          name: 'First Contentful Paint',
          value: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          unit: 'ms',
          threshold: 1800,
          status: 'good',
          trend: 'stable',
          change: 0
  useEffect(() => {
    fetchInsights();
  }, [timeRange]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getPerformanceColor = (loadTime: number) => {
    if (loadTime < 1000) return 'success';
    if (loadTime < 3000) return 'warning';
    return 'error';
  };

  const getPerformanceIcon = (loadTime: number) => {
    if (loadTime < 1000) return <CheckCircleIcon color="success" />;
    if (loadTime < 3000) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  const getRateColor = (rate: number, isErrorRate: boolean = false) => {
    if (isErrorRate) {
      if (rate < 1) return 'success';
      if (rate < 5) return 'warning';
      return 'error';
    } else {
      // Bounce rate
      if (rate < 25) return 'success';
      if (rate < 50) return 'warning';
      return 'error';
    }
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
        <IconButton color="inherit" size="small" onClick={fetchInsights}>
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!insights) {
    return <Alert severity="info">No user experience data available</Alert>;
  }

  // Chart data for page performance
  const pagePerformanceChartData = {
    labels: insights.slow_pages.slice(0, 10).map(page => {
      const url = new URL(page.page);
      return url.pathname.length > 20 ? url.pathname.substring(0, 20) + '...' : url.pathname;
    }),
    datasets: [
      {
        label: 'Average Load Time (ms)',
        data: insights.slow_pages.slice(0, 10).map(page => page.avg_load_time_ms),
        backgroundColor: insights.slow_pages.slice(0, 10).map(page => 
          page.avg_load_time_ms < 1000 ? 'rgba(76, 175, 80, 0.6)' :
          page.avg_load_time_ms < 3000 ? 'rgba(255, 152, 0, 0.6)' :
          'rgba(244, 67, 54, 0.6)'
        ),
        borderColor: insights.slow_pages.slice(0, 10).map(page => 
          page.avg_load_time_ms < 1000 ? 'rgba(76, 175, 80, 1)' :
          page.avg_load_time_ms < 3000 ? 'rgba(255, 152, 0, 1)' :
          'rgba(244, 67, 54, 1)'
        ),
        borderWidth: 1
      }
    ]
  };

  // Chart data for device performance
  const devicePerformanceChartData = {
    labels: Object.keys(insights.device_performance),
    datasets: [
      {
        data: Object.values(insights.device_performance).map(perf => perf.avg_load_time_ms),
        backgroundColor: [
          'rgba(33, 150, 243, 0.6)',
          'rgba(76, 175, 80, 0.6)',
          'rgba(255, 152, 0, 0.6)',
          'rgba(156, 39, 176, 0.6)',
          'rgba(255, 87, 34, 0.6)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Chart data for metrics overview
  const metricsOverviewData = {
    labels: ['Error Rate', 'Bounce Rate', 'Performance Score'],
    datasets: [
      {
        data: [
          insights.error_rate_percent,
          insights.bounce_rate_percent,
          Math.max(0, 100 - (insights.error_rate_percent + insights.bounce_rate_percent))
        ],
        backgroundColor: [
          getRateColor(insights.error_rate_percent, true) === 'success' ? 'rgba(76, 175, 80, 0.6)' :
          getRateColor(insights.error_rate_percent, true) === 'warning' ? 'rgba(255, 152, 0, 0.6)' :
          'rgba(244, 67, 54, 0.6)',
          getRateColor(insights.bounce_rate_percent) === 'success' ? 'rgba(76, 175, 80, 0.6)' :
          getRateColor(insights.bounce_rate_percent) === 'warning' ? 'rgba(255, 152, 0, 0.6)' :
          'rgba(244, 67, 54, 0.6)',
          'rgba(33, 150, 243, 0.6)'
        ],
        borderWidth: 2
      }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          User Experience Tracking
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(Number(e.target.value))}
            >
              <MenuItem value={1}>Last Hour</MenuItem>
              <MenuItem value={6}>Last 6 Hours</MenuItem>
              <MenuItem value={24}>Last 24 Hours</MenuItem>
              <MenuItem value={72}>Last 3 Days</MenuItem>
              <MenuItem value={168}>Last Week</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInsights}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WebIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {insights.total_interactions.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Interactions
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
                <ErrorIcon color={getRateColor(insights.error_rate_percent, true) as any} />
                <Box>
                  <Typography variant="h6">
                    {formatPercentage(insights.error_rate_percent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Error Rate
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(insights.error_rate_percent * 10, 100)}
                color={getRateColor(insights.error_rate_percent, true) as any}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ExitToAppIcon color={getRateColor(insights.bounce_rate_percent) as any} />
                <Box>
                  <Typography variant="h6">
                    {formatPercentage(insights.bounce_rate_percent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bounce Rate
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={insights.bounce_rate_percent}
                color={getRateColor(insights.bounce_rate_percent) as any}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <DevicesIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {Object.keys(insights.device_performance).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Device Types
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
                Page Performance (Top 10 Slowest)
              </Typography>
              {insights.slow_pages.length > 0 ? (
                <Box height={300}>
                  <Bar
                    data={pagePerformanceChartData}
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
                            text: 'Load Time (ms)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Pages'
                          }
                        }
                      }
                    }}
                  />
                </Box>
              ) : (
                <Alert severity="success">No slow pages detected!</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Device Performance Distribution
              </Typography>
              {Object.keys(insights.device_performance).length > 0 ? (
                <Box height={300}>
                  <Doughnut
                    data={devicePerformanceChartData}
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
              ) : (
                <Alert severity="info">No device performance data available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Page Performance */}
      {insights.slow_pages.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Page Performance Details
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Page URL</TableCell>
                    <TableCell align="right">Avg Load Time</TableCell>
                    <TableCell align="right">P95 Load Time</TableCell>
                    <TableCell align="right">Sample Count</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insights.slow_pages.map((page, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {getPerformanceIcon(page.avg_load_time_ms)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" style={{ wordBreak: 'break-all' }}>
                          {page.page}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(page.avg_load_time_ms)}
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(page.p95_load_time_ms)}
                      </TableCell>
                      <TableCell align="right">
                        {page.sample_count.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            page.avg_load_time_ms < 1000 ? 'Excellent' :
                            page.avg_load_time_ms < 3000 ? 'Good' : 'Needs Improvement'
                          }
                          color={getPerformanceColor(page.avg_load_time_ms) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Device Performance Details */}
      {Object.keys(insights.device_performance).length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Device Performance Breakdown
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(insights.device_performance).map(([device, perf]) => (
                <Grid item xs={12} sm={6} md={4} key={device}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <DevicesIcon color="primary" />
                        <Typography variant="h6">
                          {device.charAt(0).toUpperCase() + device.slice(1)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Average Load Time
                      </Typography>
                      <Typography variant="h6" color={getPerformanceColor(perf.avg_load_time_ms)}>
                        {formatDuration(perf.avg_load_time_ms)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Sample Count: {perf.sample_count.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance Recommendations
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LightbulbIcon color="primary" />
                  <Typography variant="body1">
                    Optimization Suggestions ({insights.recommendations.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {insights.recommendations.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TrendingUpIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Box mt={2} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Data collected over the last {timeRange} hours • {insights.total_interactions.toLocaleString()} total interactions
        </Typography>
      </Box>
    </Box>
  );
};

export default UserExperienceTracking;