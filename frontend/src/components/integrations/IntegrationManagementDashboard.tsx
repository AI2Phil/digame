/**
 * Integration Management Dashboard - Phase 2B Implementation
 * Priority 2: Integration Ecosystem Completion (85% → 95%)
 * 
 * Comprehensive dashboard for managing installed integrations with enterprise features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Alert,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Badge
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  GetApp as InstallIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Types
interface TenantIntegration {
  connection_id: number;
  integration_id?: string;
  integration_name: string;
  connection_name: string;
  status: string;
  created_at: string;
  last_sync_at?: string;
  total_syncs: number;
  successful_syncs: number;
  error_count: number;
  usage_analytics?: {
    total_syncs: number;
    successful_syncs: number;
    failed_syncs: number;
    data_transferred_mb: number;
    avg_response_time_ms: number;
    uptime_percentage: number;
  };
  health_status: string;
  category: string;
  features_used: string[];
  optimization_score: number;
  cost_savings: number;
  management_actions: string[];
}

interface TenantStats {
  total_integrations: number;
  active_integrations: number;
  total_syncs_24h: number;
  avg_success_rate: number;
  total_cost_savings: number;
  categories_used: string[];
  health_distribution: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

interface ManagementData {
  tenant_id: number;
  integrations: TenantIntegration[];
  statistics: TenantStats;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
  }>;
  available_upgrades: any[];
  bulk_actions: string[];
}

const IntegrationManagementDashboard: React.FC = () => {
  const router = useRouter();
  const [managementData, setManagementData] = useState<ManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedIntegrations, setSelectedIntegrations] = useState<number[]>([]);
  const [bulkActionMenuAnchor, setBulkActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<TenantIntegration | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch management data
  const fetchManagementData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter })
      });

      const response = await fetch(`/api/v1/integrations/marketplace/my-integrations?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch management data');
      }

      const result = await response.json();
      setManagementData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  // Execute bulk action
  const executeBulkAction = async (action: string) => {
    try {
      const response = await fetch('/api/v1/integrations/marketplace/bulk-actions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          integration_ids: selectedIntegrations
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute bulk action');
      }

      const result = await response.json();
      
      if (result.success) {
        setBulkActionMenuAnchor(null);
        setSelectedIntegrations([]);
        // Refresh data
        fetchManagementData();
        alert(`Bulk action "${action}" initiated successfully`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    }
  };

  // Toggle integration selection
  const toggleIntegrationSelection = (connectionId: number) => {
    setSelectedIntegrations(prev => 
      prev.includes(connectionId)
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  // Select all integrations
  const selectAllIntegrations = () => {
    if (!managementData) return;
    
    if (selectedIntegrations.length === managementData.integrations.length) {
      setSelectedIntegrations([]);
    } else {
      setSelectedIntegrations(managementData.integrations.map(i => i.connection_id));
    }
  };

  useEffect(() => {
    fetchManagementData();
  }, [fetchManagementData]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'critical': return <ErrorIcon color="error" />;
      default: return <CheckCircleIcon color="disabled" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Chart data
  const getHealthDistributionData = () => {
    if (!managementData) return null;
    
    const { health_distribution } = managementData.statistics;
    return {
      labels: ['Healthy', 'Warning', 'Critical'],
      datasets: [{
        data: [health_distribution.healthy, health_distribution.warning, health_distribution.critical],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        borderWidth: 2
      }]
    };
  };

  const getCategoryDistributionData = () => {
    if (!managementData) return null;
    
    const categoryCount: Record<string, number> = {};
    managementData.integrations.forEach(integration => {
      categoryCount[integration.category] = (categoryCount[integration.category] || 0) + 1;
    });

    return {
      labels: Object.keys(categoryCount),
      datasets: [{
        label: 'Integrations by Category',
        data: Object.values(categoryCount),
        backgroundColor: [
          '#2196f3', '#4caf50', '#ff9800', '#f44336', 
          '#9c27b0', '#00bcd4', '#795548', '#607d8b'
        ]
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
        <Button color="inherit" size="small" onClick={fetchManagementData}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!managementData) {
    return <Alert severity="info">No management data available</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Integration Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchManagementData}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<InstallIcon />}
            onClick={() => router.push('/integrations/marketplace')}
          >
            Browse Marketplace
          </Button>
        </Box>
      </Box>

      {/* Statistics Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Integrations
              </Typography>
              <Typography variant="h4">
                {managementData.statistics.total_integrations}
              </Typography>
              <Typography variant="body2" color="success.main">
                {managementData.statistics.active_integrations} active
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
              <Typography variant="h4" color="success.main">
                {managementData.statistics.avg_success_rate.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={managementData.statistics.avg_success_rate} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                24h Syncs
              </Typography>
              <Typography variant="h4">
                {managementData.statistics.total_syncs_24h.toLocaleString()}
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
                Cost Savings
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(managementData.statistics.total_cost_savings)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Health Distribution
              </Typography>
              <Box height={300}>
                {getHealthDistributionData() && (
                  <Doughnut 
                    data={getHealthDistributionData()!}
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
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Distribution
              </Typography>
              <Box height={300}>
                {getCategoryDistributionData() && (
                  <Bar 
                    data={getCategoryDistributionData()!}
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
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Bulk Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category Filter</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category Filter"
              >
                <MenuItem value="">All Categories</MenuItem>
                {managementData.statistics.categories_used.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">
              {selectedIntegrations.length} selected
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<MoreIcon />}
              onClick={(e) => setBulkActionMenuAnchor(e.currentTarget)}
              disabled={selectedIntegrations.length === 0}
              fullWidth
            >
              Bulk Actions
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Integrations Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Installed Integrations
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIntegrations.length === managementData.integrations.length}
                      indeterminate={selectedIntegrations.length > 0 && selectedIntegrations.length < managementData.integrations.length}
                      onChange={selectAllIntegrations}
                    />
                  </TableCell>
                  <TableCell>Integration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Health</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell>Cost Savings</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {managementData.integrations.map((integration) => (
                  <TableRow key={integration.connection_id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIntegrations.includes(integration.connection_id)}
                        onChange={() => toggleIntegrationSelection(integration.connection_id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                          {integration.integration_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {integration.integration_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {integration.connection_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={integration.status}
                        color={getStatusColor(integration.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getHealthIcon(integration.health_status)}
                        <Typography variant="body2" ml={1}>
                          {integration.health_status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {integration.total_syncs > 0 
                            ? ((integration.successful_syncs / integration.total_syncs) * 100).toFixed(1)
                            : 0
                          }%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={integration.total_syncs > 0 
                            ? (integration.successful_syncs / integration.total_syncs) * 100
                            : 0
                          }
                          sx={{ width: 60 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {integration.last_sync_at 
                          ? formatDate(integration.last_sync_at)
                          : 'Never'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(integration.cost_savings)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Sync Now">
                          <IconButton size="small" color="primary">
                            <SyncIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Configure">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setConfigDialogOpen(true);
                            }}
                          >
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={integration.status === 'active' ? 'Pause' : 'Resume'}>
                          <IconButton size="small" color="warning">
                            {integration.status === 'active' ? <PauseIcon /> : <PlayIcon />}
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

      {/* Recommendations */}
      {managementData.recommendations.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            {managementData.recommendations.map((recommendation, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{recommendation.title}</Typography>
                <Typography variant="body2">{recommendation.description}</Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkActionMenuAnchor}
        open={Boolean(bulkActionMenuAnchor)}
        onClose={() => setBulkActionMenuAnchor(null)}
      >
        {managementData.bulk_actions.map((action) => (
          <MenuItem key={action} onClick={() => executeBulkAction(action)}>
            <ListItemIcon>
              {action === 'sync_all' && <SyncIcon />}
              {action === 'pause_all' && <PauseIcon />}
              {action === 'resume_all' && <PlayIcon />}
              {action === 'optimize_all' && <SpeedIcon />}
            </ListItemIcon>
            <ListItemText>
              {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Configure {selectedIntegration?.integration_name}
        </DialogTitle>
        <DialogContent>
          {selectedIntegration && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Connection Settings
              </Typography>
              <TextField
                fullWidth
                label="Connection Name"
                value={selectedIntegration.connection_name}
                margin="normal"
              />
              
              <FormControlLabel
                control={<Switch checked={selectedIntegration.status === 'active'} />}
                label="Active"
                sx={{ mt: 2, mb: 2 }}
              />
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Features Used
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {selectedIntegration.features_used.map((feature, index) => (
                  <Chip key={index} label={feature} size="small" />
                ))}
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Performance
              </Typography>
              <Typography variant="body2">
                Optimization Score: {selectedIntegration.optimization_score.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={selectedIntegration.optimization_score}
                sx={{ mt: 1, mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationManagementDashboard;