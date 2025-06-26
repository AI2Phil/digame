import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  AccountTree as StrategyIcon,
  Speed as OptimizeIcon,
  Timeline as ForecastIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
// Mock auth and API for now
const useAuth = () => ({ user: { tenant_id: 1 } });
const useApi = () => ({
  apiCall: async (url: string, options?: any) => {
    // Mock API responses for demo
    if (url.includes('/analytics')) {
      return {
        total_simulations: 12,
        completed_simulations: 8,
        average_execution_time: 45.2,
        success_rate: 0.85,
        simulation_types: {},
        recent_simulations: [],
        top_insights: [],
        common_recommendations: []
      };
    }
    if (url.includes('/simulations')) {
      return []; // Return empty array for simulations
    }
    return null;
  }
});
import { formatDistanceToNow } from 'date-fns';

interface Simulation {
  id: number;
  name: string;
  simulation_type: string;
  status: string;
  confidence_score: number;
  created_at: string;
  execution_duration?: number;
  insights_count: number;
  recommendations_count: number;
}

interface SimulationAnalytics {
  total_simulations: number;
  completed_simulations: number;
  average_execution_time: number;
  success_rate: number;
  simulation_types: Record<string, number>;
  recent_simulations: Simulation[];
  top_insights: string[];
  common_recommendations: string[];
}

const simulationTypeIcons: Record<string, React.ReactElement> = {
  scenario_planning: <TrendingUpIcon />,
  decision_impact: <AssessmentIcon />,
  risk_assessment: <SecurityIcon />,
  strategic_planning: <StrategyIcon />,
  resource_optimization: <OptimizeIcon />,
  performance_forecasting: <ForecastIcon />
};

const simulationTypeLabels: Record<string, string> = {
  scenario_planning: 'Scenario Planning',
  decision_impact: 'Decision Impact',
  risk_assessment: 'Risk Assessment',
  strategic_planning: 'Strategic Planning',
  resource_optimization: 'Resource Optimization',
  performance_forecasting: 'Performance Forecasting'
};

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'default',
  running: 'info',
  completed: 'success',
  failed: 'error',
  cancelled: 'warning'
};

export const SimulationDashboard: React.FC = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [analytics, setAnalytics] = useState<SimulationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSimulationType, setNewSimulationType] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);

  useEffect(() => {
    loadSimulations();
    loadAnalytics();
  }, [selectedType, selectedStatus]);

  const loadSimulations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        tenant_id: user?.tenant_id?.toString() || '1'
      });
      
      if (selectedType) params.append('simulation_type', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await apiCall(`/api/simulation/simulations?${params}`);
      setSimulations(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to load simulations');
      console.error('Error loading simulations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        tenant_id: user?.tenant_id?.toString() || '1'
      });
      
      const response = await apiCall(`/api/simulation/analytics?${params}`);
      setAnalytics(response && !Array.isArray(response) ? response : null);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const handleExecuteSimulation = async (simulationId: number) => {
    try {
      const params = new URLSearchParams({
        tenant_id: user?.tenant_id?.toString() || '1'
      });
      
      await apiCall(`/api/simulation/simulations/${simulationId}/execute?${params}`, {
        method: 'POST',
        body: JSON.stringify({
          parameters: {},
          options: {}
        })
      });
      
      // Refresh simulations
      loadSimulations();
    } catch (err) {
      setError('Failed to execute simulation');
      console.error('Error executing simulation:', err);
    }
  };

  const handleCreateSimulation = () => {
    if (!newSimulationType) return;
    
    // Navigate to specific simulation creation page based on type
    const routes: Record<string, string> = {
      scenario_planning: '/simulations/create/scenario-planning',
      decision_impact: '/simulations/create/decision-impact',
      risk_assessment: '/simulations/create/risk-assessment',
      strategic_planning: '/simulations/create/strategic-planning',
      resource_optimization: '/simulations/create/resource-optimization',
      performance_forecasting: '/simulations/create/performance-forecasting'
    };
    
    window.location.href = routes[newSimulationType] || '/simulations/create';
    setCreateDialogOpen(false);
    setNewSimulationType('');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, simulation: Simulation) => {
    setAnchorEl(event.currentTarget);
    setSelectedSimulation(simulation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSimulation(null);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  if (loading && simulations.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading simulations...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Simulation & Decision Support
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Simulation
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Simulations
                </Typography>
                <Typography variant="h4">
                  {analytics.total_simulations}
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
                <Typography variant="h4">
                  {(analytics.success_rate * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Execution Time
                </Typography>
                <Typography variant="h4">
                  {analytics.average_execution_time.toFixed(1)}s
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4">
                  {analytics.completed_simulations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Simulation Type</InputLabel>
          <Select
            value={selectedType}
            label="Simulation Type"
            onChange={(e: SelectChangeEvent) => setSelectedType(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            {Object.entries(simulationTypeLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            label="Status"
            onChange={(e: SelectChangeEvent) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="running">Running</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Simulations Grid */}
      <Grid container spacing={3}>
        {simulations.map((simulation) => (
          <Grid item xs={12} sm={6} md={4} key={simulation.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {simulationTypeIcons[simulation.simulation_type]}
                    <Typography variant="h6" component="h2" noWrap>
                      {simulation.name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, simulation)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography color="textSecondary" gutterBottom>
                  {simulationTypeLabels[simulation.simulation_type]}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={simulation.status}
                    color={statusColors[simulation.status]}
                    size="small"
                  />
                  <Chip
                    label={`${(simulation.confidence_score * 100).toFixed(0)}% confidence`}
                    color={getConfidenceColor(simulation.confidence_score)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Created {formatDistanceToNow(new Date(simulation.created_at))} ago
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InsightsIcon fontSize="small" />
                    <Typography variant="body2">
                      {simulation.insights_count} insights
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {simulation.recommendations_count} recommendations
                  </Typography>
                </Box>

                {simulation.execution_duration && (
                  <Typography variant="body2" color="textSecondary">
                    Executed in {simulation.execution_duration.toFixed(1)}s
                  </Typography>
                )}
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PlayIcon />}
                  onClick={() => handleExecuteSimulation(simulation.id)}
                  disabled={simulation.status === 'running'}
                >
                  {simulation.status === 'running' ? 'Running...' : 'Execute'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {simulations.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No simulations found
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 3 }}>
            Create your first simulation to get started with decision support
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Simulation
          </Button>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedSimulation) {
            window.location.href = `/simulations/${selectedSimulation.id}`;
          }
          handleMenuClose();
        }}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedSimulation) {
            handleExecuteSimulation(selectedSimulation.id);
          }
          handleMenuClose();
        }}>
          Execute
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedSimulation) {
            window.location.href = `/simulations/${selectedSimulation.id}/results`;
          }
          handleMenuClose();
        }}>
          View Results
        </MenuItem>
      </Menu>

      {/* Create Simulation Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Simulation</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Choose the type of simulation you want to create:
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Simulation Type</InputLabel>
            <Select
              value={newSimulationType}
              label="Simulation Type"
              onChange={(e: SelectChangeEvent) => setNewSimulationType(e.target.value)}
            >
              {Object.entries(simulationTypeLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {simulationTypeIcons[key]}
                    {label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSimulation}
            variant="contained"
            disabled={!newSimulationType}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick Access */}
      <Tooltip title="Quick Insights">
        <Fab
          color="secondary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => window.location.href = '/simulations/insights'}
        >
          <InsightsIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default SimulationDashboard;