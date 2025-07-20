/**
 * Integration Optimization Panel - Phase 2A Implementation
 * Priority 2: Integration Ecosystem Completion (75% → 95%)
 * 
 * Advanced optimization interface for integration performance tuning,
 * automated optimization, and configuration management
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
import {
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  TuneRounded as TuneIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  AutoFixHigh as AutoFixIcon,
  Psychology as AIIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';

// Types
interface OptimizationResult {
  connection_id: number;
  connection_name: string;
  provider_name: string;
  optimization_status: 'pending' | 'running' | 'completed' | 'failed';
  improvements: {
    rate_limit_optimization: boolean;
    retry_strategy_enhancement: boolean;
    sync_settings_optimization: boolean;
    webhook_optimization: boolean;
  };
  performance_gains: {
    response_time_improvement: number;
    success_rate_improvement: number;
    throughput_improvement: number;
  };
  recommendations: Array<{
    type: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    implemented: boolean;
  }>;
  optimization_started: string;
  optimization_completed?: string;
}

interface OptimizationSettings {
  auto_optimize: boolean;
  optimization_schedule: string;
  performance_threshold: number;
  retry_optimization: boolean;
  webhook_optimization: boolean;
  rate_limit_optimization: boolean;
  sync_frequency_optimization: boolean;
}

interface PerformanceMetrics {
  before_optimization: {
    avg_response_time: number;
    success_rate: number;
    throughput: number;
    error_rate: number;
  };
  after_optimization: {
    avg_response_time: number;
    success_rate: number;
    throughput: number;
    error_rate: number;
  };
  improvement_percentage: {
    response_time: number;
    success_rate: number;
    throughput: number;
    error_rate: number;
  };
}

const IntegrationOptimizationPanel: React.FC = () => {
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimizationInProgress, setOptimizationInProgress] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    auto_optimize: false,
    optimization_schedule: 'weekly',
    performance_threshold: 85,
    retry_optimization: true,
    webhook_optimization: true,
    rate_limit_optimization: true,
    sync_frequency_optimization: true
  });
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Optimization steps
  const optimizationSteps = [
    'Analyzing Current Performance',
    'Identifying Optimization Opportunities',
    'Applying Rate Limit Optimizations',
    'Enhancing Retry Strategies',
    'Optimizing Sync Settings',
    'Configuring Webhooks',
    'Validating Improvements',
    'Generating Recommendations'
  ];

  // Fetch optimization results
  const fetchOptimizationResults = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockResults: OptimizationResult[] = [
        {
          connection_id: 1,
          connection_name: 'Slack Workspace',
          provider_name: 'Slack',
          optimization_status: 'completed',
          improvements: {
            rate_limit_optimization: true,
            retry_strategy_enhancement: true,
            sync_settings_optimization: true,
            webhook_optimization: false
          },
          performance_gains: {
            response_time_improvement: 25.5,
            success_rate_improvement: 3.2,
            throughput_improvement: 18.7
          },
          recommendations: [
            {
              type: 'rate_limit',
              description: 'Implement exponential backoff for rate limit handling',
              impact: 'high',
              implemented: true
            },
            {
              type: 'caching',
              description: 'Enable response caching for frequently accessed data',
              impact: 'medium',
              implemented: false
            }
          ],
          optimization_started: new Date(Date.now() - 3600000).toISOString(),
          optimization_completed: new Date().toISOString()
        },
        {
          connection_id: 2,
          connection_name: 'Google Drive',
          provider_name: 'Google Drive',
          optimization_status: 'running',
          improvements: {
            rate_limit_optimization: true,
            retry_strategy_enhancement: false,
            sync_settings_optimization: false,
            webhook_optimization: false
          },
          performance_gains: {
            response_time_improvement: 0,
            success_rate_improvement: 0,
            throughput_improvement: 0
          },
          recommendations: [],
          optimization_started: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      setOptimizationResults(mockResults);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger optimization
  const triggerOptimization = async (connectionId?: number) => {
    try {
      setOptimizationInProgress(true);
      setActiveStep(0);

      // Simulate optimization steps
      for (let i = 0; i < optimizationSteps.length; i++) {
        setActiveStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const response = await fetch('/api/v1/integrations/health/optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connection_id: connectionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to trigger optimization');
      }

      // Refresh results
      setTimeout(() => {
        fetchOptimizationResults();
        setOptimizationInProgress(false);
        setActiveStep(0);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger optimization');
      setOptimizationInProgress(false);
    }
  };

  // Get performance metrics for a connection
  const getPerformanceMetrics = async (connectionId: number) => {
    try {
      // Mock performance metrics
      const mockMetrics: PerformanceMetrics = {
        before_optimization: {
          avg_response_time: 2500,
          success_rate: 92.5,
          throughput: 150,
          error_rate: 7.5
        },
        after_optimization: {
          avg_response_time: 1875,
          success_rate: 95.7,
          throughput: 178,
          error_rate: 4.3
        },
        improvement_percentage: {
          response_time: 25.0,
          success_rate: 3.5,
          throughput: 18.7,
          error_rate: -42.7
        }
      };

      setPerformanceMetrics(mockMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    }
  };

  useEffect(() => {
    fetchOptimizationResults();
  }, []);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Chart data for performance comparison
  const getPerformanceComparisonData = () => {
    if (!performanceMetrics) return null;

    return {
      labels: ['Response Time (ms)', 'Success Rate (%)', 'Throughput (req/min)', 'Error Rate (%)'],
      datasets: [
        {
          label: 'Before Optimization',
          data: [
            performanceMetrics.before_optimization.avg_response_time,
            performanceMetrics.before_optimization.success_rate,
            performanceMetrics.before_optimization.throughput,
            performanceMetrics.before_optimization.error_rate
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'After Optimization',
          data: [
            performanceMetrics.after_optimization.avg_response_time,
            performanceMetrics.after_optimization.success_rate,
            performanceMetrics.after_optimization.throughput,
            performanceMetrics.after_optimization.error_rate
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Integration Optimization
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AutoFixIcon />}
            onClick={() => triggerOptimization()}
            disabled={optimizationInProgress}
            sx={{ mr: 1 }}
          >
            {optimizationInProgress ? 'Optimizing...' : 'Optimize All'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsDialogOpen(true)}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Optimization Progress */}
      {optimizationInProgress && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Optimization in Progress
            </Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
              {optimizationSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress />
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      {/* Optimization Results */}
      <Grid container spacing={3}>
        {optimizationResults.map((result) => (
          <Grid item xs={12} key={result.connection_id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6">
                      {result.connection_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {result.provider_name}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={result.optimization_status.toUpperCase()}
                      color={getStatusColor(result.optimization_status) as any}
                      size="small"
                    />
                    {result.optimization_status === 'completed' && (
                      <Button
                        size="small"
                        startIcon={<AnalyticsIcon />}
                        onClick={() => {
                          setSelectedConnection(result.connection_id);
                          getPerformanceMetrics(result.connection_id);
                        }}
                      >
                        View Metrics
                      </Button>
                    )}
                    <Button
                      size="small"
                      startIcon={<PlayIcon />}
                      onClick={() => triggerOptimization(result.connection_id)}
                      disabled={optimizationInProgress || result.optimization_status === 'running'}
                    >
                      Re-optimize
                    </Button>
                  </Box>
                </Box>

                {/* Optimization Improvements */}
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Applied Optimizations:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {Object.entries(result.improvements).map(([key, applied]) => (
                      <Chip
                        key={key}
                        label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        color={applied ? 'success' : 'default'}
                        size="small"
                        icon={applied ? <CheckCircleIcon /> : undefined}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Performance Gains */}
                {result.optimization_status === 'completed' && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Performance Improvements:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main">
                            {result.performance_gains.response_time_improvement > 0 ? '-' : ''}
                            {Math.abs(result.performance_gains.response_time_improvement).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Response Time
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main">
                            +{result.performance_gains.success_rate_improvement.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Success Rate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main">
                            +{result.performance_gains.throughput_improvement.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Throughput
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">
                        Optimization Recommendations ({result.recommendations.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {result.recommendations.map((rec, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              {rec.implemented ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <WarningIcon color="warning" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={rec.description}
                              secondary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Chip
                                    label={rec.impact.toUpperCase()}
                                    color={getImpactColor(rec.impact) as any}
                                    size="small"
                                  />
                                  <Typography variant="caption">
                                    {rec.implemented ? 'Implemented' : 'Pending'}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Metrics Dialog */}
      <Dialog
        open={selectedConnection !== null && performanceMetrics !== null}
        onClose={() => {
          setSelectedConnection(null);
          setPerformanceMetrics(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Performance Metrics Comparison</DialogTitle>
        <DialogContent>
          {performanceMetrics && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Before vs After Optimization
              </Typography>
              <Box height={400} mb={3}>
                <Bar
                  data={getPerformanceComparisonData()!}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Improvement Summary
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(performanceMetrics.improvement_percentage).map(([metric, improvement]) => (
                  <Grid item xs={6} sm={3} key={metric}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color={improvement > 0 ? 'success.main' : 'error.main'}>
                        {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSelectedConnection(null);
            setPerformanceMetrics(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Optimization Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={optimizationSettings.auto_optimize}
                  onChange={(e) => setOptimizationSettings({
                    ...optimizationSettings,
                    auto_optimize: e.target.checked
                  })}
                />
              }
              label="Enable Auto-Optimization"
            />
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Optimization Schedule</InputLabel>
              <Select
                value={optimizationSettings.optimization_schedule}
                onChange={(e) => setOptimizationSettings({
                  ...optimizationSettings,
                  optimization_schedule: e.target.value
                })}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Performance Threshold (%)"
              type="number"
              value={optimizationSettings.performance_threshold}
              onChange={(e) => setOptimizationSettings({
                ...optimizationSettings,
                performance_threshold: parseInt(e.target.value)
              })}
              sx={{ mt: 2 }}
              inputProps={{ min: 0, max: 100 }}
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Optimization Features
            </Typography>

            {Object.entries(optimizationSettings)
              .filter(([key]) => key.includes('_optimization'))
              .map(([key, value]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Switch
                      checked={value as boolean}
                      onChange={(e) => setOptimizationSettings({
                        ...optimizationSettings,
                        [key]: e.target.checked
                      })}
                    />
                  }
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                />
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setSettingsDialogOpen(false)}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationOptimizationPanel;