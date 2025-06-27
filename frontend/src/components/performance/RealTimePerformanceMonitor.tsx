import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
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
  AccordionDetails
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
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { performanceOptimizationService, PerformanceMetrics, PerformanceOptimization } from '../../services/performanceOptimizationService';

interface RealTimeMetric {
  timestamp: number;
  value: number;
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
}

interface MetricHistory {
  [key: string]: RealTimeMetric[];
}

const RealTimePerformanceMonitor: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [metricHistory, setMetricHistory] = useState<MetricHistory>({});
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [selectedOptimization, setSelectedOptimization] = useState<PerformanceOptimization | null>(null);
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Metric thresholds for alerts
  const thresholds = {
    firstContentfulPaint: { warning: 1800, critical: 3000 },
    largestContentfulPaint: { warning: 2500, critical: 4000 },
    firstInputDelay: { warning: 100, critical: 300 },
    cumulativeLayoutShift: { warning: 0.1, critical: 0.25 },
    timeToInteractive: { warning: 3800, critical: 5000 },
    memoryUsage: { warning: 50000000, critical: 100000000 }, // 50MB, 100MB
    bundleSize: { warning: 500000, critical: 1000000 }, // 500KB, 1MB
  };

  useEffect(() => {
    // Initialize performance optimization service
    performanceOptimizationService.initialize().then(() => {
      const metrics = performanceOptimizationService.getCurrentMetrics();
      if (metrics) {
        setCurrentMetrics(metrics);
        updateMetricHistory(metrics);
      }
      setOptimizations(performanceOptimizationService.getOptimizations());
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      performanceOptimizationService.cleanup();
    };
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    intervalRef.current = setInterval(() => {
      collectMetrics();
    }, 1000); // Collect metrics every second
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const collectMetrics = () => {
    const metrics = performanceOptimizationService.getCurrentMetrics();
    if (metrics) {
      setCurrentMetrics(metrics);
      updateMetricHistory(metrics);
      checkThresholds(metrics);
      
      // Update optimizations
      const newOptimizations = performanceOptimizationService.getOptimizations();
      setOptimizations(newOptimizations);
      
      // Auto-optimize if enabled
      if (autoOptimize) {
        autoOptimizePerformance(newOptimizations);
      }
    }
  };

  const updateMetricHistory = (metrics: PerformanceMetrics) => {
    const timestamp = Date.now();
    const maxHistoryLength = 60; // Keep last 60 data points

    setMetricHistory(prev => {
      const updated = { ...prev };
      
      Object.entries(metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const threshold = thresholds[key as keyof typeof thresholds];
          const status = getMetricStatus(value, threshold);
          
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

  const getMetricStatus = (value: number, threshold?: { warning: number; critical: number }): 'good' | 'warning' | 'critical' => {
    if (!threshold) return 'good';
    if (value > threshold.critical) return 'critical';
    if (value > threshold.warning) return 'warning';
    return 'good';
  };

  const checkThresholds = (metrics: PerformanceMetrics) => {
    const newAlerts: string[] = [];
    
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        const threshold = thresholds[key as keyof typeof thresholds];
        if (threshold) {
          if (value > threshold.critical) {
            newAlerts.push(`Critical: ${key} exceeded ${threshold.critical}`);
          } else if (value > threshold.warning) {
            newAlerts.push(`Warning: ${key} exceeded ${threshold.warning}`);
          }
        }
      }
    });
    
    setAlerts(newAlerts);
  };

  const autoOptimizePerformance = (optimizations: PerformanceOptimization[]) => {
    // Auto-implement low-effort, high-impact optimizations
    const autoOptimizable = optimizations.filter(opt => 
      opt.effort === 'low' && 
      opt.priority === 'critical' && 
      opt.status === 'pending'
    );
    
    autoOptimizable.forEach(opt => {
      performanceOptimizationService.implementOptimization(opt.id);
    });
  };

  const formatValue = (key: string, value: number): string => {
    if (key.includes('Time') || key.includes('Paint') || key.includes('Delay')) {
      return `${value.toFixed(0)}ms`;
    }
    if (key.includes('Size') || key.includes('Usage')) {
      return formatBytes(value);
    }
    if (key.includes('Shift')) {
      return value.toFixed(3);
    }
    if (key.includes('Rate')) {
      return `${value.toFixed(1)}%`;
    }
    return value.toString();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          label: metricKey,
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
      await performanceOptimizationService.implementOptimization(selectedOptimization.id);
      setOptimizationDialogOpen(false);
      setSelectedOptimization(null);
    }
  };

  if (!currentMetrics) {
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
        <Typography variant="h4" component="h1">
          Real-Time Performance Monitor
        </Typography>
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.entries(currentMetrics).map(([key, value]) => {
          if (typeof value !== 'number') return null;
          
          const threshold = thresholds[key as keyof typeof thresholds];
          const status = getMetricStatus(value, threshold);
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
                      <TrendingUpIcon color="error" fontSize="small" />
                    ) : trend === 'down' ? (
                      <TrendingDownIcon color="success" fontSize="small" />
                    ) : null}
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  {threshold && (
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((value / threshold.critical) * 100, 100)}
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

      {/* Performance Charts */}
      {isMonitoring && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {['firstContentfulPaint', 'largestContentfulPaint', 'memoryUsage', 'bundleSize'].map(metricKey => (
            <Grid item xs={12} md={6} key={metricKey}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {metricKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
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
                    <TableCell>Impact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {optimizations.map((optimization) => (
                    <TableRow key={optimization.id}>
                      <TableCell>
                        <Chip
                          label={optimization.priority}
                          color={
                            optimization.priority === 'critical' ? 'error' :
                            optimization.priority === 'high' ? 'warning' :
                            optimization.priority === 'medium' ? 'info' : 'default'
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
                        <Chip label={optimization.type} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={optimization.effort}
                          color={
                            optimization.effort === 'low' ? 'success' :
                            optimization.effort === 'medium' ? 'warning' : 'error'
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {optimization.impact.performance + optimization.impact.userExperience}/20
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={optimization.status.replace('_', ' ')}
                          color={
                            optimization.status === 'completed' ? 'success' :
                            optimization.status === 'in_progress' ? 'info' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOptimizationClick(optimization)}
                          disabled={optimization.status !== 'pending'}
                        >
                          {optimization.status === 'pending' ? 'Implement' : 'View'}
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
              label={selectedOptimization?.priority}
              color={
                selectedOptimization?.priority === 'critical' ? 'error' :
                selectedOptimization?.priority === 'high' ? 'warning' : 'info'
              }
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
                    {selectedOptimization.effort} ({selectedOptimization.estimatedTimeHours}h)
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Performance Impact
                  </Typography>
                  <Typography variant="h6">
                    {selectedOptimization.impact.performance}/10
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    UX Impact
                  </Typography>
                  <Typography variant="h6">
                    {selectedOptimization.impact.userExperience}/10
                  </Typography>
                </Grid>
              </Grid>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Implementation Steps</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {selectedOptimization.implementation.steps.map((step, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Typography variant="body2" color="primary">
                            {index + 1}.
                          </Typography>
                        </ListItemIcon>
                        <ListItemText primary={step} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Code Changes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {selectedOptimization.implementation.codeChanges.map((change, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={
                            <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                              {change}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOptimizationDialogOpen(false)}>Cancel</Button>
          {selectedOptimization?.status === 'pending' && (
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