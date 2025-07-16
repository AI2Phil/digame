import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'condition' | 'action' | 'trigger' | 'delay';
  config: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'monitoring' | 'optimization' | 'maintenance';
  trigger: {
    type: 'schedule' | 'event' | 'metric_threshold' | 'manual';
    config: any;
  };
  steps: WorkflowStep[];
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  successRate: number;
  averageDuration: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  steps: WorkflowStep[];
  logs: string[];
  metrics: {
    duration: number;
    memoryUsed: number;
    cpuUsed: number;
  };
}

const WorkflowAutomation: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  // Predefined workflow templates
  const workflowTemplates = [
    {
      name: 'Performance Optimization',
      description: 'Automatically optimize performance when metrics exceed thresholds',
      category: 'performance' as const,
      trigger: {
        type: 'metric_threshold' as const,
        config: {
          metric: 'bundle_size',
          threshold: 500000,
          operator: 'greater_than',
        },
      },
      steps: [
        {
          id: '1',
          name: 'Analyze Bundle',
          type: 'action' as const,
          config: { action: 'run_bundle_analyzer' },
          status: 'pending' as const,
        },
        {
          id: '2',
          name: 'Check for Duplicates',
          type: 'condition' as const,
          config: { condition: 'duplicates_found' },
          status: 'pending' as const,
        },
        {
          id: '3',
          name: 'Remove Duplicates',
          type: 'action' as const,
          config: { action: 'remove_duplicate_modules' },
          status: 'pending' as const,
        },
        {
          id: '4',
          name: 'Rebuild Bundle',
          type: 'action' as const,
          config: { action: 'rebuild_optimized' },
          status: 'pending' as const,
        },
      ],
    },
    {
      name: 'Memory Cleanup',
      description: 'Clean up memory usage when it exceeds safe limits',
      category: 'maintenance' as const,
      trigger: {
        type: 'metric_threshold' as const,
        config: {
          metric: 'memory_usage',
          threshold: 100000000, // 100MB
          operator: 'greater_than',
        },
      },
      steps: [
        {
          id: '1',
          name: 'Force Garbage Collection',
          type: 'action' as const,
          config: { action: 'force_gc' },
          status: 'pending' as const,
        },
        {
          id: '2',
          name: 'Clear Component Cache',
          type: 'action' as const,
          config: { action: 'clear_component_cache' },
          status: 'pending' as const,
        },
        {
          id: '3',
          name: 'Optimize Images',
          type: 'action' as const,
          config: { action: 'optimize_images' },
          status: 'pending' as const,
        },
      ],
    },
    {
      name: 'Daily Health Check',
      description: 'Perform comprehensive health checks every day',
      category: 'monitoring' as const,
      trigger: {
        type: 'schedule' as const,
        config: {
          cron: '0 9 * * *', // 9 AM daily
          timezone: 'UTC',
        },
      },
      steps: [
        {
          id: '1',
          name: 'Check API Health',
          type: 'action' as const,
          config: { action: 'health_check_api' },
          status: 'pending' as const,
        },
        {
          id: '2',
          name: 'Verify Database Connection',
          type: 'action' as const,
          config: { action: 'check_database' },
          status: 'pending' as const,
        },
        {
          id: '3',
          name: 'Test Critical Paths',
          type: 'action' as const,
          config: { action: 'test_critical_paths' },
          status: 'pending' as const,
        },
        {
          id: '4',
          name: 'Generate Report',
          type: 'action' as const,
          config: { action: 'generate_health_report' },
          status: 'pending' as const,
        },
      ],
    },
  ];

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockWorkflows: Workflow[] = workflowTemplates.map((template, index) => ({
      id: `workflow-${index + 1}`,
      ...template,
      isActive: index < 2, // First two workflows are active
      lastRun: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
      nextRun: new Date(Date.now() + Math.random() * 86400000), // Random time in next 24h
      runCount: Math.floor(Math.random() * 50) + 10,
      successRate: 85 + Math.random() * 15, // 85-100%
      averageDuration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
    }));
    
    setWorkflows(mockWorkflows);
    setLoading(false);
  }, []);

  const loadExecutions = useCallback(async () => {
    // Generate mock execution history
    const mockExecutions: WorkflowExecution[] = [];
    
    workflows.forEach(workflow => {
      for (let i = 0; i < 5; i++) {
        const startTime = new Date(Date.now() - Math.random() * 604800000); // Last week
        const duration = Math.floor(Math.random() * 300) + 30;
        const endTime = new Date(startTime.getTime() + duration * 1000);
        
        mockExecutions.push({
          id: `exec-${workflow.id}-${i}`,
          workflowId: workflow.id,
          startTime,
          endTime,
          status: Math.random() > 0.1 ? 'completed' : 'failed',
          steps: workflow.steps.map(step => ({
            ...step,
            status: Math.random() > 0.05 ? 'completed' : 'failed',
            duration: Math.floor(Math.random() * 60) + 5,
          })),
          logs: [
            `Started workflow execution at ${startTime.toISOString()}`,
            `Executing step 1: ${workflow.steps[0]?.name}`,
            `Step 1 completed successfully`,
            `Workflow completed at ${endTime.toISOString()}`,
          ],
          metrics: {
            duration,
            memoryUsed: Math.floor(Math.random() * 50) + 10,
            cpuUsed: Math.floor(Math.random() * 80) + 10,
          },
        });
      }
    });
    
    setExecutions(mockExecutions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime()));
  }, [workflows]);

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, [loadWorkflows, loadExecutions]);

  const executeWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    // Create new execution
    const execution: WorkflowExecution = {
      id: `exec-${workflowId}-${Date.now()}`,
      workflowId,
      startTime: new Date(),
      status: 'running',
      steps: workflow.steps.map(step => ({ ...step, status: 'pending' })),
      logs: [`Started workflow execution: ${workflow.name}`],
      metrics: {
        duration: 0,
        memoryUsed: 0,
        cpuUsed: 0,
      },
    };

    setExecutions(prev => [execution, ...prev]);

    // Simulate step execution
    for (let i = 0; i < workflow.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay per step
      
      execution.steps[i].status = 'running';
      execution.logs.push(`Executing step ${i + 1}: ${workflow.steps[i].name}`);
      setExecutions(prev => prev.map(e => e.id === execution.id ? { ...execution } : e));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      execution.steps[i].status = Math.random() > 0.1 ? 'completed' : 'failed';
      execution.steps[i].duration = Math.floor(Math.random() * 30) + 5;
      execution.logs.push(`Step ${i + 1} ${execution.steps[i].status}`);
      
      if (execution.steps[i].status === 'failed') {
        execution.status = 'failed';
        execution.endTime = new Date();
        break;
      }
    }

    if (execution.status !== 'failed') {
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.logs.push('Workflow completed successfully');
    }

    execution.metrics.duration = execution.endTime 
      ? (execution.endTime.getTime() - execution.startTime.getTime()) / 1000
      : 0;
    execution.metrics.memoryUsed = Math.floor(Math.random() * 50) + 10;
    execution.metrics.cpuUsed = Math.floor(Math.random() * 80) + 10;

    setExecutions(prev => prev.map(e => e.id === execution.id ? { ...execution } : e));
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'running':
        return <CircularProgress size={20} />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'info';
      default:
        return 'warning';
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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
        <Box display="flex" alignItems="center" gap={2}>
          <AutoAwesomeIcon color="primary" fontSize="large" />
          <Typography variant="h4" component="h1">
            Workflow Automation
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setWorkflowDialogOpen(true)}
          >
            Create Workflow
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadWorkflows}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Workflow Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TimelineIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {workflows.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Workflows
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
                <PlayIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {workflows.filter(w => w.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Workflows
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
                <CheckCircleIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
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
                <SpeedIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    {Math.round(workflows.reduce((sum, w) => sum + w.averageDuration, 0) / workflows.length)}s
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Duration
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Workflows List */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Workflows
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Last Run</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {workflow.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {workflow.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={workflow.category} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={workflow.trigger.type.replace('_', ' ')} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Switch
                          checked={workflow.isActive}
                          onChange={() => toggleWorkflow(workflow.id)}
                          size="small"
                        />
                        <Typography variant="body2">
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={workflow.successRate > 90 ? 'success.main' : 'warning.main'}>
                        {workflow.successRate.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workflow.lastRun?.toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Run Now">
                          <IconButton
                            size="small"
                            onClick={() => executeWorkflow(workflow.id)}
                            disabled={!workflow.isActive}
                          >
                            <PlayIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedWorkflow(workflow);
                              setWorkflowDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Settings">
                          <IconButton size="small">
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Executions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Memory</TableCell>
                  <TableCell>CPU</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {executions.slice(0, 10).map((execution) => {
                  const workflow = workflows.find(w => w.id === execution.workflowId);
                  return (
                    <TableRow key={execution.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {workflow?.name || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getStatusIcon(execution.status)}
                          <Chip
                            label={execution.status}
                            color={getStatusColor(execution.status) as any}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {execution.startTime.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDuration(execution.metrics.duration)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {execution.metrics.memoryUsed}MB
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {execution.metrics.cpuUsed}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedExecution(execution);
                            setExecutionDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Execution Details Dialog */}
      <Dialog open={executionDialogOpen} onClose={() => setExecutionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Execution Details
        </DialogTitle>
        <DialogContent>
          {selectedExecution && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStatusIcon(selectedExecution.status)}
                    <Typography variant="body1">
                      {selectedExecution.status}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {formatDuration(selectedExecution.metrics.duration)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Memory Used
                  </Typography>
                  <Typography variant="body1">
                    {selectedExecution.metrics.memoryUsed}MB
                  </Typography>
                </Grid>
              </Grid>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Execution Steps</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stepper orientation="vertical">
                    {selectedExecution.steps.map((step, index) => (
                      <Step key={step.id} active={true} completed={step.status === 'completed'}>
                        <StepLabel
                          error={step.status === 'failed'}
                          icon={getStatusIcon(step.status)}
                        >
                          {step.name}
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2">
                            Duration: {step.duration ? formatDuration(step.duration) : 'N/A'}
                          </Typography>
                          {step.error && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                              {step.error}
                            </Alert>
                          )}
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Execution Logs</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                    {selectedExecution.logs.map((log, index) => (
                      <Typography key={index} variant="body2" fontFamily="monospace">
                        {log}
                      </Typography>
                    ))}
                  </Paper>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecutionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowAutomation;