import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  Autocomplete,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Share as ShareIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  CloudQueue as CloudIcon
} from '@mui/icons-material';
import { api } from '../../services/api/EnhancedApiService';
import { useAdvancedLoading } from '../ui/AdvancedLoadingStates';
import { useErrorRecovery } from '../error/ErrorRecoverySystem';

// Types for enterprise dashboard
export interface EnterpriseMetrics {
  users: {
    total: number;
    active: number;
    growth: number;
    retention: number;
  };
  performance: {
    responseTime: number;
    uptime: number;
    throughput: number;
    errorRate: number;
  };
  business: {
    revenue: number;
    conversion: number;
    satisfaction: number;
    churn: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  employees: number;
  budget: number;
  performance: number;
  projects: number;
  location: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  budget: number;
  spent: number;
  team: number;
  deadline: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: any;
  visible: boolean;
  refreshInterval?: number;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`enterprise-tabpanel-${index}`}
      aria-labelledby={`enterprise-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Enterprise Dashboard Component
export const EnterpriseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState<EnterpriseMetrics | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);

  const { loading, error, startLoading, stopLoading, setLoadingError } = useAdvancedLoading();
  const { addError } = useErrorRecovery();

  // Fetch enterprise data
  const fetchEnterpriseData = useCallback(async () => {
    startLoading('Loading enterprise dashboard...');
    
    try {
      const [metricsResponse, departmentsResponse, projectsResponse, alertsResponse] = await Promise.all([
        api.get<EnterpriseMetrics>('/api/enterprise/metrics', { params: { timeRange: selectedTimeRange } }),
        api.get<Department[]>('/api/enterprise/departments'),
        api.get<Project[]>('/api/enterprise/projects'),
        api.get<SystemAlert[]>('/api/enterprise/alerts')
      ]);

      setMetrics(metricsResponse);
      setDepartments(departmentsResponse);
      setProjects(projectsResponse);
      setAlerts(alertsResponse);
      stopLoading();
    } catch (error: any) {
      setLoadingError('Failed to load enterprise data');
      addError({
        type: 'api',
        severity: 'high',
        message: 'Failed to load enterprise dashboard',
        details: error,
        recoverable: true,
        autoRetryable: true,
        maxRetries: 3
      });
    }
  }, [selectedTimeRange, startLoading, stopLoading, setLoadingError, addError]);

  // Initial data load
  useEffect(() => {
    fetchEnterpriseData();
  }, [fetchEnterpriseData]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(fetchEnterpriseData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchEnterpriseData]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesDepartment = filterDepartment === 'all' || project.department === filterDepartment;
      const matchesSearch = searchQuery === '' || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDepartment && matchesSearch;
    });
  }, [projects, filterDepartment, searchQuery]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'planning': return 'warning';
      case 'on-hold': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await api.post(`/api/enterprise/alerts/${alertId}/acknowledge`);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (error: any) {
      addError({
        type: 'api',
        severity: 'medium',
        message: 'Failed to acknowledge alert',
        details: error,
        recoverable: true,
        autoRetryable: false,
        maxRetries: 1
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading enterprise dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4">Enterprise Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive enterprise analytics and management
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              label="Time Range"
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <MenuItem value="1d">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          
          <Badge badgeContent={alerts.filter(a => !a.acknowledged).length} color="error">
            <IconButton onClick={() => setAlertsDrawerOpen(true)}>
              <NotificationsIcon />
            </IconButton>
          </Badge>
          
          <IconButton onClick={() => setCustomizationOpen(true)}>
            <SettingsIcon />
          </IconButton>
          
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchEnterpriseData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4">{metrics.users.total.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Users</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TrendingUpIcon fontSize="small" color="success" />
                      <Typography variant="caption" color="success.main">
                        +{metrics.users.growth}% growth
                      </Typography>
                    </Box>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4">{metrics.performance.uptime}%</Typography>
                    <Typography variant="body2" color="text.secondary">System Uptime</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CheckCircleIcon fontSize="small" color="success" />
                      <Typography variant="caption" color="success.main">
                        {metrics.performance.responseTime}ms avg
                      </Typography>
                    </Box>
                  </Box>
                  <SpeedIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4">${metrics.business.revenue.toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Revenue</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TrendingUpIcon fontSize="small" color="success" />
                      <Typography variant="caption" color="success.main">
                        {metrics.business.conversion}% conversion
                      </Typography>
                    </Box>
                  </Box>
                  <AnalyticsIcon sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4">{metrics.system.cpuUsage}%</Typography>
                    <Typography variant="body2" color="text.secondary">CPU Usage</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={metrics.system.cpuUsage} 
                      sx={{ mt: 1 }}
                      color={metrics.system.cpuUsage > 80 ? 'error' : 'primary'}
                    />
                  </Box>
                  <MemoryIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" icon={<DashboardIcon />} />
          <Tab label="Departments" icon={<BusinessIcon />} />
          <Tab label="Projects" icon={<AssessmentIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {/* Overview Dashboard */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Health</Typography>
                {metrics && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress 
                          variant="determinate" 
                          value={metrics.system.cpuUsage} 
                          size={80}
                          color={metrics.system.cpuUsage > 80 ? 'error' : 'primary'}
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          CPU: {metrics.system.cpuUsage}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress 
                          variant="determinate" 
                          value={metrics.system.memoryUsage} 
                          size={80}
                          color={metrics.system.memoryUsage > 80 ? 'error' : 'primary'}
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Memory: {metrics.system.memoryUsage}%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Alerts</Typography>
                <List dense>
                  {alerts.slice(0, 5).map((alert) => (
                    <ListItem key={alert.id}>
                      <ListItemIcon>
                        {alert.type === 'error' && <ErrorIcon color="error" />}
                        {alert.type === 'warning' && <WarningIcon color="warning" />}
                        {alert.type === 'info' && <InfoIcon color="info" />}
                        {alert.type === 'success' && <CheckCircleIcon color="success" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={alert.title}
                        secondary={new Date(alert.timestamp).toLocaleString()}
                      />
                      {!alert.acknowledged && (
                        <Button
                          size="small"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Performance Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Performance charts would be rendered here using Chart.js or similar
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Departments */}
        <Grid container spacing={3}>
          {departments.map((department) => (
            <Grid item xs={12} md={6} lg={4} key={department.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">{department.name}</Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Manager: {department.manager}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Employees</Typography>
                      <Typography variant="h6">{department.employees}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Projects</Typography>
                      <Typography variant="h6">{department.projects}</Typography>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Performance</Typography>
                      <Typography variant="body2">{department.performance}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={department.performance}
                      color={department.performance > 80 ? 'success' : department.performance > 60 ? 'warning' : 'error'}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip 
                      label={department.location}
                      size="small"
                      icon={<LocationIcon />}
                    />
                    <Typography variant="body2" color="text.secondary">
                      ${department.budget.toLocaleString()} budget
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Projects */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={filterDepartment}
              label="Department"
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.name}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {project.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.department}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={project.status}
                      size="small"
                      color={getStatusColor(project.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress}
                        sx={{ width: 80, mr: 1 }}
                      />
                      <Typography variant="body2">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(project.spent / project.budget) * 100}
                        sx={{ width: 60 }}
                        color={(project.spent / project.budget) > 0.9 ? 'error' : 'primary'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {project.team} members
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(project.deadline).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={project.priority}
                      size="small"
                      color={getPriorityColor(project.priority) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Analytics */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>User Growth</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    User growth chart would be rendered here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Revenue Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Revenue trends chart would be rendered here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Department Performance Comparison</Typography>
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Department comparison chart would be rendered here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Alerts Drawer */}
      <Drawer
        anchor="right"
        open={alertsDrawerOpen}
        onClose={() => setAlertsDrawerOpen(false)}
        PaperProps={{ sx: { width: 400 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            System Alerts ({alerts.filter(a => !a.acknowledged).length} unread)
          </Typography>
          
          <List>
            {alerts.map((alert) => (
              <React.Fragment key={alert.id}>
                <ListItem
                  sx={{
                    bgcolor: alert.acknowledged ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemIcon>
                    {alert.type === 'error' && <ErrorIcon color="error" />}
                    {alert.type === 'warning' && <WarningIcon color="warning" />}
                    {alert.type === 'info' && <InfoIcon color="info" />}
                    {alert.type === 'success' && <CheckCircleIcon color="success" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.title}
                    secondary={
                      <Box>
                        <Typography variant="body2">{alert.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.timestamp).toLocaleString()} • {alert.source}
                        </Typography>
                      </Box>
                    }
                  />
                  {!alert.acknowledged && (
                    <Button
                      size="small"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Ack
                    </Button>
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Customization Dialog */}
      <Dialog
        open={customizationOpen}
        onClose={() => setCustomizationOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Dashboard Customization</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Customize your enterprise dashboard layout and widgets.
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Widget Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Widget configuration options would be available here.
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Theme Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                Theme and appearance settings would be available here.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomizationOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setCustomizationOpen(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnterpriseDashboard;