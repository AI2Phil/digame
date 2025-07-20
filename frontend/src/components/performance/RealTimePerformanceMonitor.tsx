import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { performanceApi, DashboardData, PerformanceOptimization } from '../../services/performanceApi';
import { useToastHelpers } from '../ui/Toaster';

interface RealTimeMetric {
  timestamp: number;
  value: number;
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
}

interface MetricHistory {
  [key: string]: RealTimeMetric[];
}

interface CurrentMetrics {
  cpu_usage: number;
  memory_usage: number;
  response_time_ms: number;
  requests_per_second: number;
  error_rate: number;
  database_connections: number;
  cache_hit_rate: number;
  disk_usage: number;
  network_throughput: number;
}

const RealTimePerformanceMonitor: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<CurrentMetrics | null>(null);
  const [metricHistory, setMetricHistory] = useState<MetricHistory>({});
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [selectedOptimization, setSelectedOptimization] = useState<PerformanceOptimization | null>(null);
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { success, error, warning, info } = useToastHelpers();

  // Metric thresholds for alerts
  const thresholds = {
    cpu_usage: { warning: 70, critical: 90 },
    memory_usage: { warning: 80, critical: 95 },
    response_time_ms: { warning: 500, critical: 1000 },
    error_rate: { warning: 1, critical: 5 },
    database_connections: { warning: 80, critical: 95 },
    cache_hit_rate: { warning: 85, critical: 70 }, // Lower is worse for cache hit rate
    disk_usage: { warning: 80, critical: 95 },
    network_throughput: { warning: 80, critical: 95 },
  };

  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initializePerformanceMonitoring = async () => {
    setLoading(true);
    try {
      // Try to fetch real data from API
      await Promise.all([
        fetchDashboardData(),
        fetchOptimizations(),
        fetchRealTimeMetrics()
      ]);
      setUsingFallbackData(false);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      // Use enhanced fallback data
      setUsingFallbackData(true);
      generateFallbackData();
      warning('Using demo data - API unavailable');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await performanceApi.getDashboard(24);
      setDashboardData(response.data);
    } catch (error) {
      throw new Error('Failed to fetch dashboard data');
    }
  };

  const fetchOptimizations = async () => {
    try {
      const response = await performanceApi.getOptimizations('pending', 20);
      setOptimizations(response.data);
    } catch (error) {
      // Generate fallback optimizations
      setOptimizations(generateFallbackOptimizations());
    }
  };

  const fetchRealTimeMetrics = async () => {
    try {
      const response = await performanceApi.getRealTimeMetrics();
      const metrics = response.data.metrics;
      setCurrentMetrics(metrics);
      updateMetricHistory(metrics);
      checkThresholds(metrics);
    } catch (error) {
      // Generate fallback metrics
      const fallbackMetrics = generateFallbackMetrics();
      setCurrentMetrics(fallbackMetrics);
      updateMetricHistory(fallbackMetrics);
      checkThresholds(fallbackMetrics);
    }
  };

  const generateFallbackData = () => {
    const fallbackMetrics = generateFallbackMetrics();
    setCurrentMetrics(fallbackMetrics);
    updateMetricHistory(fallbackMetrics);
    checkThresholds(fallbackMetrics);
    setOptimizations(generateFallbackOptimizations());
  };

  const generateFallbackMetrics = (): CurrentMetrics => {
    return {
      cpu_usage: 45.2 + Math.random() * 10,
      memory_usage: 67.8 + Math.random() * 10,
      response_time_ms: 234.5 + Math.random() * 50,
      requests_per_second: 156.7 + Math.random() * 20,
      error_rate: 0.02 + Math.random() * 0.05,
      database_connections: 45 + Math.random() * 10,
      cache_hit_rate: 94.5 + Math.random() * 3,
      disk_usage: 34.2 + Math.random() * 5,
      network_throughput: 78.5 + Math.random() * 10,
    };
  };

  const generateFallbackOptimizations = (): PerformanceOptimization[] => {
    return [
      {
        id: 1,
        tenant_id: 1,
        optimization_type: 'database',
        component: 'Query Engine',
        title: 'Optimize Slow Database Queries',
        description: 'Several database queries are taking longer than optimal. Consider adding indexes and optimizing query structure.',
        current_performance: { avg_query_time: 450 },
        expected_improvement: { avg_query_time: 180 },
        effort_estimate: 'medium',
        priority_score: 85,
        implementation_status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        tenant_id: 1,
        optimization_type: 'caching',
        component: 'API Layer',
        title: 'Implement Redis Caching',
        description: 'Add Redis caching layer to reduce database load and improve response times for frequently accessed data.',
        current_performance: { cache_hit_rate: 0 },
        expected_improvement: { cache_hit_rate: 85 },
        effort_estimate: 'high',
        priority_score: 92,
        implementation_status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        tenant_id: 1,
        optimization_type: 'frontend',
        component: 'Bundle Size',
        title: 'Code Splitting Implementation',
        description: 'Implement code splitting to reduce initial bundle size and improve page load times.',
        current_performance: { bundle_size: 2.1 },
        expected_improvement: { bundle_size: 1.2 },
        effort_estimate: 'medium',
        priority_score: 78,
        implementation_status: 'pending',
        created_at: new Date().toISOString(),
      }
    ];
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    intervalRef.current = setInterval(() => {
      collectMetrics();
    }, 5000); // Collect metrics every 5 seconds
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const collectMetrics = async () => {
    try {
      if (!usingFallbackData) {
        await fetchRealTimeMetrics();
      } else {
        // Update fallback metrics with slight variations
        const updatedMetrics = generateFallbackMetrics();
        setCurrentMetrics(updatedMetrics);
        updateMetricHistory(updatedMetrics);
        checkThresholds(updatedMetrics);
      }
      
      // Auto-optimize if enabled
      if (autoOptimize) {
        autoOptimizePerformance(optimizations);
      }
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  };

  const updateMetricHistory = (metrics: CurrentMetrics) => {
    const timestamp = Date.now();
    const maxHistoryLength = 60; // Keep last 60 data points

    setMetricHistory(prev => {
      const updated = { ...prev };
      
      Object.entries(metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const threshold = thresholds[key as keyof typeof thresholds];
          const status = getMetricStatus(value, threshold, key === 'cache_hit_rate');
          
          if (!updated[key]) {
            updated[key] = [];
          }
          
          updated[key].push({
            timestamp,
            value,
            threshold: threshold?.critical,
            status,
          });
          
          // Keep only recent history
          if (updated[key].length > maxHistoryLength) {
            updated[key] = updated[key].slice(-maxHistoryLength);
          }
        }
      });
      
      return updated;
    });
  };

  const getMetricStatus = (value: number, threshold?: { warning: number; critical: number }, isInverted: boolean = false): 'good' | 'warning' | 'critical' => {
    if (!threshold) return 'good';
    
    if (isInverted) {
      // For metrics like cache hit rate where lower is worse
      if (value < threshold.critical) return 'critical';
      if (value < threshold.warning) return 'warning';
      return 'good';
    } else {
      // For metrics where higher is worse
      if (value > threshold.critical) return 'critical';
      if (value > threshold.warning) return 'warning';
      return 'good';
    }
  };

  const checkThresholds = (metrics: CurrentMetrics) => {
    const newAlerts: string[] = [];
    
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        const threshold = thresholds[key as keyof typeof thresholds];
        const isInverted = key === 'cache_hit_rate';
        
        if (threshold) {
          if (isInverted) {
            if (value < threshold.critical) {
              newAlerts.push(`Critical: ${formatMetricName(key)} below ${threshold.critical}%`);
            } else if (value < threshold.warning) {
              newAlerts.push(`Warning: ${formatMetricName(key)} below ${threshold.warning}%`);
            }
          } else {
            if (value > threshold.critical) {
              newAlerts.push(`Critical: ${formatMetricName(key)} exceeded ${threshold.critical}${getMetricUnit(key)}`);
            } else if (value > threshold.warning) {
              newAlerts.push(`Warning: ${formatMetricName(key)} exceeded ${threshold.warning}${getMetricUnit(key)}`);
            }
          }
        }
      }
    });
    
    setAlerts(newAlerts);
  };

  const formatMetricName = (key: string): string => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getMetricUnit = (key: string): string => {
    if (key.includes('usage') || key.includes('rate')) return '%';
    if (key.includes('time') || key.includes('ms')) return 'ms';
    if (key.includes('per_second')) return '/s';
    return '';
  };

  const autoOptimizePerformance = async (optimizations: PerformanceOptimization[]) => {
    // Auto-implement low-effort, high-impact optimizations
    const autoOptimizable = optimizations.filter(opt => 
      opt.effort_estimate === 'low' && 
      opt.priority_score > 80 && 
      opt.implementation_status === 'pending'
    );
    
    for (const opt of autoOptimizable) {
      try {
        await performanceApi.updateOptimization(opt.id, {
          implementation_status: 'in_progress'
        });
        info(`Auto-implementing: ${opt.title}`);
      } catch (error) {
        console.error('Failed to auto-implement optimization:', error);
      }
    }
  };

  const formatValue = (key: string, value: number): string => {
    if (key.includes('time') || key.includes('ms')) {
      return `${value.toFixed(0)}ms`;
    }
    if (key.includes('usage') || key.includes('rate')) {
      return `${value.toFixed(1)}%`;
    }
    if (key.includes('per_second')) {
      return `${value.toFixed(1)}/s`;
    }
    if (key.includes('connections')) {
      return value.toFixed(0);
    }
    if (key.includes('throughput')) {
      return `${value.toFixed(1)} MB/s`;
    }
    return value.toFixed(2);
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <ErrorIcon color="error" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
    }
  };

  const createChartData = (metricKey: string) => {
    const history = metricHistory[metricKey] || [];
    const labels = history.map(point => new Date(point.timestamp).toLocaleTimeString());
    const data = history.map(point => point.value);
    const threshold = history[0]?.threshold;

    return {
      labels,
      datasets: [
        {
          label: formatMetricName(metricKey),
          data,
          borderColor: 'rgb(33, 150, 243)',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.1,
          fill: true,
        },
        ...(threshold ? [{
          label: 'Critical Threshold',
          data: new Array(data.length).fill(threshold),
          borderColor: 'rgb(244, 67, 54)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          pointRadius: 0,
        }] : []),
      ],
    };
  };

  const handleOptimizationClick = (optimization: PerformanceOptimization) => {
    setSelectedOptimization(optimization);
    setOptimizationDialogOpen(true);
  };

  const implementOptimization = async () => {
    if (selectedOptimization) {
      try {
        await performanceApi.updateOptimization(selectedOptimization.id, {
          implementation_status: 'in_progress'
        });
        success(`Started implementing: ${selectedOptimization.title}`);
        setOptimizationDialogOpen(false);
        setSelectedOptimization(null);
        // Refresh optimizations
        await fetchOptimizations();
      } catch (error) {
        error('Failed to implement optimization');
      }
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await initializePerformanceMonitoring();
      success('Performance data refreshed');
    } catch (error) {
      error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentMetrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Initializing performance monitoring...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Real-Time Performance Monitor
            {usingFallbackData && (
              <Chip 
                label="Demo Data" 
                color="warning" 
                size="small" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoOptimize}
                onChange={(e) => setAutoOptimize(e.target.checked)}
              />
            }
            label="Auto-Optimize"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant={isMonitoring ? "outlined" : "contained"}
            startIcon={isMonitoring ? <PauseIcon /> : <PlayIcon />}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            color={isMonitoring ? "secondary" : "primary"}
          >
            {isMonitoring ? 'Pause' : 'Start'} Monitoring
          </Button>
          {isMonitoring && (
            <Button
              variant="outlined"
              startIcon={<StopIcon />}
              onClick={stopMonitoring}
              color="error"
            >
              Stop
            </Button>
          )}
        </Box>
      </Box>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance Alerts ({alerts.length})
          </Typography>
          {alerts.map((alert, index) => (
            <Typography key={index} variant="body2">
              • {alert}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Current Metrics */}
      {currentMetrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {Object.entries(currentMetrics).map(([key, value]) => {
            if (typeof value !== 'number') return null;
            
            const threshold = thresholds[key as keyof typeof thresholds];
            const status = getMetricStatus(value, threshold, key === 'cache_hit_rate');
            const history = metricHistory[key] || [];
            const trend = history.length > 1 ? 
              (history[history.length - 1].value > history[history.length - 2].value ? 'up' : 'down') : 'stable';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      {getStatusIcon(status)}
                      <Typography variant="h6" color={getStatusColor(status)}>
                        {formatValue(key, value)}
                      </Typography>
                      {trend === 'up' ? (
                        <TrendingUpIcon color={key === 'cache_hit_rate' ? 'success' : 'error'} fontSize="small" />
                      ) : trend === 'down' ? (
                        <TrendingDownIcon color={key === 'cache_hit_rate' ? 'error' : 'success'} fontSize="small" />
                      ) : null}
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatMetricName(key)}
                    </Typography>
                    {threshold && (
                      <LinearProgress
                        variant="determinate"
                        value={key === 'cache_hit_rate' ? value : Math.min((value / threshold.critical) * 100, 100)}
                        color={getStatusColor(status) as any}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Performance Charts */}
      {isMonitoring && currentMetrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {['cpu_usage', 'memory_usage', 'response_time_ms', 'cache_hit_rate'].map(metricKey => (
            <Grid item xs={12} md={6} key={metricKey}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {formatMetricName(metricKey)}
                  </Typography>
                  <Box height={200}>
                    <Line
                      data={createChartData(metricKey)}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Optimization Recommendations */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Optimizations ({optimizations.length})
          </Typography>
          
          {optimizations.length === 0 ? (
            <Alert severity="success">
              <CheckCircleIcon sx={{ mr: 1 }} />
              No performance issues detected! Your application is running optimally.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Priority</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Effort</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {optimizations.map((optimization) => (
                    <TableRow key={optimization.id}>
                      <TableCell>
                        <Chip
                          label={optimization.priority_score > 90 ? 'Critical' : optimization.priority_score > 70 ? 'High' : 'Medium'}
                          color={
                            optimization.priority_score > 90 ? 'error' :
                            optimization.priority_score > 70 ? 'warning' : 'info'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {optimization.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {optimization.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={optimization.optimization_type} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={optimization.effort_estimate}
                          color={
                            optimization.effort_estimate === 'low' ? 'success' :
                            optimization.effort_estimate === 'medium' ? 'warning' : 'error'
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {optimization.priority_score}/100
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={optimization.implementation_status.replace('_', ' ')}
                          color={
                            optimization.implementation_status === 'completed' ? 'success' :
                            optimization.implementation_status === 'in_progress' ? 'info' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOptimizationClick(optimization)}
                          disabled={optimization.implementation_status !== 'pending'}
                        >
                          {optimization.implementation_status === 'pending' ? 'Implement' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Optimization Details Dialog */}
      <Dialog open={optimizationDialogOpen} onClose={() => setOptimizationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <LightbulbIcon />
            {selectedOptimization?.title}
            <Chip
              label={selectedOptimization?.priority_score && selectedOptimization.priority_score > 90 ? 'Critical' : 'High'}
              color={selectedOptimization?.priority_score && selectedOptimization.priority_score > 90 ? 'error' : 'warning'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOptimization && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {selectedOptimization.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Effort Required
                  </Typography>
                  <Typography variant="h6">
                    {selectedOptimization.effort_estimate}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Priority Score
                  </Typography>
                  <Typography variant="h6">
                    {selectedOptimization.priority_score}/100
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Component
                  </Typography>
                  <Typography variant="h6">
                    {selectedOptimization.component}
                  </Typography>
                </Grid>
              </Grid>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Current Performance</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                    <pre>{JSON.stringify(selectedOptimization.current_performance, null, 2)}</pre>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Expected Improvement</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                    <pre>{JSON.stringify(selectedOptimization.expected_improvement, null, 2)}</pre>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptimizationDialogOpen(false)}>Cancel</Button>
          {selectedOptimization?.implementation_status === 'pending' && (
            <Button variant="contained" onClick={implementOptimization}>
              Implement Optimization
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RealTimePerformanceMonitor;