import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
  IconButton,
  Badge,
  Tooltip,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CloudQueue,
  DeveloperMode,
  Public,
  Security,
  Storage,
  NetworkCheck,
  MonitorHeart,
  Settings,
  Code,
  BugReport,
  Rocket,
  ExpandMore,
  Add,
  Edit,
  Delete,
  Visibility,
  FileCopy,
  Download,
  Upload,
  Refresh,
  PlayArrow,
  Stop,
  CheckCircle,
  Warning,
  Error,
  Info,
  Timeline,
  Assessment,
  Speed,
  Memory,
  Dns,
  VpnKey,
  Dataset,
  Api
} from '@mui/icons-material';

interface TabPanelProps {
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
      id={`environment-tabpanel-${index}`}
      aria-labelledby={`environment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Environment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production' | 'testing';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  url: string;
  version: string;
  lastDeployed: Date;
  uptime: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  errorRate: number;
  deploymentCount: number;
  healthScore: number;
}

interface ConfigVariable {
  id: string;
  key: string;
  value: string;
  environment: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'secret';
  description: string;
  required: boolean;
  lastModified: Date;
  modifiedBy: string;
}

interface Deployment {
  id: string;
  environment: string;
  version: string;
  status: 'pending' | 'in-progress' | 'success' | 'failed' | 'rolled-back';
  startTime: Date;
  endTime?: Date;
  deployedBy: string;
  changes: string[];
  rollbackAvailable: boolean;
}

const EnvironmentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [newVariableDialog, setNewVariableDialog] = useState(false);
  const [deploymentDialog, setDeploymentDialog] = useState(false);

  // Mock data for environments
  const environments: Environment[] = [
    {
      id: '1',
      name: 'Production',
      type: 'production',
      status: 'active',
      url: 'https://app.digame.com',
      version: 'v2.1.3',
      lastDeployed: new Date('2025-01-10T08:30:00'),
      uptime: 99.9,
      responseTime: 145,
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 38,
      activeUsers: 1247,
      errorRate: 0.1,
      deploymentCount: 156,
      healthScore: 98
    },
    {
      id: '2',
      name: 'Staging',
      type: 'staging',
      status: 'active',
      url: 'https://staging.digame.com',
      version: 'v2.2.0-rc1',
      lastDeployed: new Date('2025-01-10T14:15:00'),
      uptime: 98.5,
      responseTime: 180,
      cpuUsage: 32,
      memoryUsage: 48,
      diskUsage: 25,
      activeUsers: 23,
      errorRate: 0.3,
      deploymentCount: 89,
      healthScore: 95
    },
    {
      id: '3',
      name: 'Development',
      type: 'development',
      status: 'active',
      url: 'https://dev.digame.com',
      version: 'v2.2.0-dev',
      lastDeployed: new Date('2025-01-10T16:45:00'),
      uptime: 97.2,
      responseTime: 220,
      cpuUsage: 28,
      memoryUsage: 41,
      diskUsage: 30,
      activeUsers: 8,
      errorRate: 1.2,
      deploymentCount: 234,
      healthScore: 92
    },
    {
      id: '4',
      name: 'Testing',
      type: 'testing',
      status: 'maintenance',
      url: 'https://test.digame.com',
      version: 'v2.1.3',
      lastDeployed: new Date('2025-01-09T10:20:00'),
      uptime: 85.0,
      responseTime: 350,
      cpuUsage: 15,
      memoryUsage: 25,
      diskUsage: 20,
      activeUsers: 3,
      errorRate: 2.5,
      deploymentCount: 67,
      healthScore: 78
    }
  ];

  // Mock data for configuration variables
  const configVariables: ConfigVariable[] = [
    {
      id: '1',
      key: 'DATABASE_URL',
      value: 'postgresql://prod-db:5432/digame',
      environment: 'production',
      type: 'secret',
      description: 'Primary database connection string',
      required: true,
      lastModified: new Date('2025-01-08'),
      modifiedBy: 'admin@digame.com'
    },
    {
      id: '2',
      key: 'API_RATE_LIMIT',
      value: '1000',
      environment: 'production',
      type: 'number',
      description: 'API requests per hour limit',
      required: true,
      lastModified: new Date('2025-01-05'),
      modifiedBy: 'devops@digame.com'
    },
    {
      id: '3',
      key: 'FEATURE_FLAGS',
      value: '{"newDashboard": true, "betaFeatures": false}',
      environment: 'staging',
      type: 'json',
      description: 'Feature flag configuration',
      required: false,
      lastModified: new Date('2025-01-10'),
      modifiedBy: 'product@digame.com'
    }
  ];

  // Mock data for deployments
  const deployments: Deployment[] = [
    {
      id: '1',
      environment: 'production',
      version: 'v2.1.3',
      status: 'success',
      startTime: new Date('2025-01-10T08:25:00'),
      endTime: new Date('2025-01-10T08:30:00'),
      deployedBy: 'devops@digame.com',
      changes: ['Bug fixes', 'Performance improvements', 'Security updates'],
      rollbackAvailable: true
    },
    {
      id: '2',
      environment: 'staging',
      version: 'v2.2.0-rc1',
      status: 'success',
      startTime: new Date('2025-01-10T14:10:00'),
      endTime: new Date('2025-01-10T14:15:00'),
      deployedBy: 'developer@digame.com',
      changes: ['New features', 'UI improvements', 'API enhancements'],
      rollbackAvailable: true
    },
    {
      id: '3',
      environment: 'development',
      version: 'v2.2.0-dev',
      status: 'in-progress',
      startTime: new Date('2025-01-10T16:40:00'),
      deployedBy: 'developer@digame.com',
      changes: ['Experimental features', 'Code refactoring'],
      rollbackAvailable: false
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'production': return <Rocket color="error" />;
      case 'staging': return <Public color="warning" />;
      case 'development': return <DeveloperMode color="info" />;
      case 'testing': return <BugReport color="secondary" />;
      default: return <CloudQueue />;
    }
  };

  const getEnvironmentColor = (type: string) => {
    switch (type) {
      case 'production': return 'error';
      case 'staging': return 'warning';
      case 'development': return 'info';
      case 'testing': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle color="success" />;
      case 'inactive': return <Stop color="disabled" />;
      case 'maintenance': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'maintenance': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getDeploymentStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'in-progress': return 'info';
      case 'pending': return 'warning';
      case 'rolled-back': return 'secondary';
      default: return 'default';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 95) return 'success';
    if (score >= 85) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CloudQueue color="primary" sx={{ fontSize: 40 }} />
          Environment Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage and monitor your application environments and configurations
        </Typography>
      </Box>

      {/* Environment Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {environments.map((env) => (
          <Grid item xs={12} md={6} lg={3} key={env.id}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => setSelectedEnvironment(env)}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getEnvironmentIcon(env.type)}
                    <Typography variant="h6">{env.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(env.status)}
                    <Chip 
                      label={env.status} 
                      size="small" 
                      color={getStatusColor(env.status) as any}
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {env.url}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Version: {env.version}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime: {env.uptime}%
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption">Health Score</Typography>
                    <Typography variant="caption" color={getHealthScoreColor(env.healthScore)}>
                      {env.healthScore}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={env.healthScore} 
                    color={getHealthScoreColor(env.healthScore) as any}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      CPU: {env.cpuUsage}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Memory: {env.memoryUsage}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Users: {env.activeUsers}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Errors: {env.errorRate}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="environment management tabs">
            <Tab icon={<Settings />} label="Configuration" />
            <Tab icon={<Rocket />} label="Deployments" />
            <Tab icon={<MonitorHeart />} label="Monitoring" />
            <Tab icon={<Security />} label="Security" />
          </Tabs>
        </Box>

        {/* Configuration Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Environment Variables</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setNewVariableDialog(true)}>
              Add Variable
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Environment</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Required</TableCell>
                  <TableCell>Last Modified</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configVariables.map((variable) => (
                  <TableRow key={variable.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {variable.key}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={variable.environment} 
                        size="small" 
                        color={getEnvironmentColor(variable.environment) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={variable.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {variable.type === 'secret' ? '••••••••' : variable.value.substring(0, 20)}
                          {variable.value.length > 20 && '...'}
                        </Typography>
                        <IconButton size="small">
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={variable.required ? 'Required' : 'Optional'} 
                        size="small" 
                        color={variable.required ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{variable.lastModified.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Deployments Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Deployment History</Typography>
            <Button variant="contained" startIcon={<Rocket />} onClick={() => setDeploymentDialog(true)}>
              New Deployment
            </Button>
          </Box>

          <Grid container spacing={3}>
            {deployments.map((deployment) => (
              <Grid item xs={12} md={6} key={deployment.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">{deployment.version}</Typography>
                      <Chip 
                        label={deployment.status} 
                        size="small" 
                        color={getDeploymentStatusColor(deployment.status) as any}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Environment: {deployment.environment}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Deployed by: {deployment.deployedBy}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Started: {deployment.startTime.toLocaleString()}
                    </Typography>
                    
                    {deployment.endTime && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Completed: {deployment.endTime.toLocaleString()}
                      </Typography>
                    )}
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Changes:
                    </Typography>
                    <List dense>
                      {deployment.changes.map((change, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={change} />
                        </ListItem>
                      ))}
                    </List>
                    
                    {deployment.rollbackAvailable && (
                      <Button variant="outlined" color="warning" size="small" sx={{ mt: 1 }}>
                        Rollback
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Monitoring Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Environment Monitoring
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Performance
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Assessment sx={{ fontSize: 100, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Performance metrics chart would be implemented here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Error Rate Trends
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Timeline sx={{ fontSize: 100, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Error rate timeline would be implemented here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Real-time Metrics
                  </Typography>
                  <Grid container spacing={2}>
                    {environments.filter(env => env.status === 'active').map((env) => (
                      <Grid item xs={12} sm={6} md={3} key={env.id}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          {getEnvironmentIcon(env.type)}
                          <Typography variant="h6" sx={{ mt: 1 }}>
                            {env.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Response Time: {env.responseTime}ms
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Active Users: {env.activeUsers}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            CPU: {env.cpuUsage}%
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Security & Access Control
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SSL Certificates
                  </Typography>
                  <List>
                    {environments.map((env) => (
                      <ListItem key={env.id}>
                        <ListItemAvatar>
                          <Avatar>
                            <Security />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={env.name}
                          secondary={`SSL Valid until: Dec 31, 2025`}
                        />
                        <Chip label="Valid" color="success" size="small" />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Access Permissions
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Production Access"
                        secondary="Restricted to DevOps team"
                      />
                      <Chip label="Restricted" color="error" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Staging Access"
                        secondary="Development team access"
                      />
                      <Chip label="Limited" color="warning" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Development Access"
                        secondary="Full team access"
                      />
                      <Chip label="Open" color="success" size="small" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Environment Detail Dialog */}
      <Dialog 
        open={!!selectedEnvironment} 
        onClose={() => setSelectedEnvironment(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedEnvironment && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getEnvironmentIcon(selectedEnvironment.type)}
                  <Typography variant="h6">{selectedEnvironment.name}</Typography>
                </Box>
                <Chip 
                  label={selectedEnvironment.status} 
                  color={getStatusColor(selectedEnvironment.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Environment Details</Typography>
                  <Typography variant="body2">URL: {selectedEnvironment.url}</Typography>
                  <Typography variant="body2">Version: {selectedEnvironment.version}</Typography>
                  <Typography variant="body2">Type: {selectedEnvironment.type}</Typography>
                  <Typography variant="body2">
                    Last Deployed: {selectedEnvironment.lastDeployed.toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
                  <Typography variant="body2">Uptime: {selectedEnvironment.uptime}%</Typography>
                  <Typography variant="body2">Response Time: {selectedEnvironment.responseTime}ms</Typography>
                  <Typography variant="body2">Active Users: {selectedEnvironment.activeUsers}</Typography>
                  <Typography variant="body2">Error Rate: {selectedEnvironment.errorRate}%</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Resource Usage</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">CPU Usage: {selectedEnvironment.cpuUsage}%</Typography>
                    <LinearProgress variant="determinate" value={selectedEnvironment.cpuUsage} />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Memory Usage: {selectedEnvironment.memoryUsage}%</Typography>
                    <LinearProgress variant="determinate" value={selectedEnvironment.memoryUsage} />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Disk Usage: {selectedEnvironment.diskUsage}%</Typography>
                    <LinearProgress variant="determinate" value={selectedEnvironment.diskUsage} />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEnvironment(null)}>Close</Button>
              <Button variant="outlined" startIcon={<MonitorHeart />}>
                View Logs
              </Button>
              <Button variant="contained" startIcon={<Rocket />}>
                Deploy
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* New Variable Dialog */}
      <Dialog 
        open={newVariableDialog} 
        onClose={() => setNewVariableDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Environment Variable</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Variable Key"
            placeholder="e.g., DATABASE_URL"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Variable Value"
            placeholder="Enter value"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Environment</InputLabel>
            <Select
              value=""
              label="Environment"
            >
              <MenuItem value="production">Production</MenuItem>
              <MenuItem value="staging">Staging</MenuItem>
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="testing">Testing</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value=""
              label="Type"
            >
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="secret">Secret</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Description"
            placeholder="Variable description"
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={<Switch />}
            label="Required Variable"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewVariableDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Add />}>
            Add Variable
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deployment Dialog */}
      <Dialog
        open={deploymentDialog}
        onClose={() => setDeploymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Deployment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Environment</InputLabel>
            <Select
              value=""
              label="Environment"
            >
              <MenuItem value="production">Production</MenuItem>
              <MenuItem value="staging">Staging</MenuItem>
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="testing">Testing</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Version"
            placeholder="e.g., v2.2.0"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Release Notes"
            placeholder="Describe the changes in this deployment"
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={<Switch />}
            label="Enable Rollback"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeploymentDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Rocket />}>
            Deploy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnvironmentManagement;