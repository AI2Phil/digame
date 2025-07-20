import React, { useState, useEffect } from 'react';
import {
  Box,
import {
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
  Pagination
} from '@mui/material';
import {
  Api,
  Code,
  Security,
  Speed,
  Analytics,
  Description,
  Settings,
  Key,
  Timeline,
  TrendingUp,
  Error,
  CheckCircle,
  Warning,
  Info,
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
  BugReport,
  Hub,
  CloudUpload,
  Storage,
  NetworkCheck,
  MonitorHeart
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
      id={`config-api-tabpanel-${index}`}
      aria-labelledby={`config-api-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'active' | 'deprecated' | 'beta' | 'maintenance';
  version: string;
  responseTime: number;
  successRate: number;
  requestsPerDay: number;
  lastUsed: Date;
  authentication: 'none' | 'api-key' | 'oauth' | 'jwt';
  rateLimit: number;
  category: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdDate: Date;
  lastUsed: Date;
  expiryDate: Date;
  status: 'active' | 'revoked' | 'expired';
  usage: number;
  limit: number;
}

interface APIMetric {
  id: string;
  endpoint: string;
  timestamp: Date;
  responseTime: number;
  statusCode: number;
  userAgent: string;
  ipAddress: string;
  requestSize: number;
  responseSize: number;
}

const ConfigurationAPI: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [newKeyDialog, setNewKeyDialog] = useState(false);

  // Mock data for API endpoints
  const apiEndpoints: APIEndpoint[] = [
    {
      id: '1',
      name: 'Get User Profile',
      method: 'GET',
      path: '/api/v1/users/{id}',
      description: 'Retrieve user profile information',
      status: 'active',
      version: 'v1.2.0',
      responseTime: 145,
      successRate: 99.8,
      requestsPerDay: 15420,
      lastUsed: new Date('2025-01-10T10:30:00'),
      authentication: 'jwt',
      rateLimit: 1000,
      category: 'Users'
    },
    {
      id: '2',
      name: 'Update Configuration',
      method: 'PUT',
      path: '/api/v1/config/{section}',
      description: 'Update system configuration settings',
      status: 'active',
      version: 'v1.1.0',
      responseTime: 230,
      successRate: 98.5,
      requestsPerDay: 2340,
      lastUsed: new Date('2025-01-10T09:15:00'),
      authentication: 'api-key',
      rateLimit: 100,
      category: 'Configuration'
    },
    {
      id: '3',
      name: 'Analytics Data',
      method: 'GET',
      path: '/api/v2/analytics/metrics',
      description: 'Retrieve analytics and metrics data',
      status: 'beta',
      version: 'v2.0.0-beta',
      responseTime: 890,
      successRate: 97.2,
      requestsPerDay: 8760,
      lastUsed: new Date('2025-01-10T11:45:00'),
      authentication: 'oauth',
      rateLimit: 500,
      category: 'Analytics'
    },
    {
      id: '4',
      name: 'Legacy User Data',
      method: 'GET',
      path: '/api/v0/users/legacy',
      description: 'Legacy endpoint for backward compatibility',
      status: 'deprecated',
      version: 'v0.9.0',
      responseTime: 1200,
      successRate: 95.1,
      requestsPerDay: 450,
      lastUsed: new Date('2025-01-09T16:20:00'),
      authentication: 'api-key',
      rateLimit: 50,
      category: 'Legacy'
    }
  ];

  // Mock data for API keys
  const apiKeys: APIKey[] = [
    {
      id: '1',
      name: 'Production Frontend',
      key: 'pk_live_1234567890abcdef',
      permissions: ['read:users', 'write:config', 'read:analytics'],
      createdDate: new Date('2024-12-01'),
      lastUsed: new Date('2025-01-10T11:30:00'),
      expiryDate: new Date('2025-12-01'),
      status: 'active',
      usage: 15420,
      limit: 100000
    },
    {
      id: '2',
      name: 'Mobile App',
      key: 'pk_live_abcdef1234567890',
      permissions: ['read:users', 'read:analytics'],
      createdDate: new Date('2024-11-15'),
      lastUsed: new Date('2025-01-10T10:45:00'),
      expiryDate: new Date('2025-11-15'),
      status: 'active',
      usage: 8760,
      limit: 50000
    },
    {
      id: '3',
      name: 'Development Testing',
      key: 'pk_test_9876543210fedcba',
      permissions: ['read:users'],
      createdDate: new Date('2024-10-20'),
      lastUsed: new Date('2025-01-08T14:20:00'),
      expiryDate: new Date('2025-10-20'),
      status: 'active',
      usage: 2340,
      limit: 10000
    }
  ];

  // Mock data for API metrics
  const apiMetrics: APIMetric[] = [
    {
      id: '1',
      endpoint: '/api/v1/users/{id}',
      timestamp: new Date('2025-01-10T11:30:00'),
      responseTime: 145,
      statusCode: 200,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      ipAddress: '192.168.1.100',
      requestSize: 512,
      responseSize: 2048
    },
    {
      id: '2',
      endpoint: '/api/v1/config/{section}',
      timestamp: new Date('2025-01-10T11:25:00'),
      responseTime: 230,
      statusCode: 200,
      userAgent: 'API Client v1.0',
      ipAddress: '10.0.0.50',
      requestSize: 1024,
      responseSize: 256
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'primary';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      case 'PATCH': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'deprecated': return 'warning';
      case 'beta': return 'info';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle color="success" />;
      case 'deprecated': return <Warning color="warning" />;
      case 'beta': return <Info color="info" />;
      case 'maintenance': return <Error color="error" />;
      default: return <Info />;
    }
  };

  const getAuthIcon = (auth: string) => {
    switch (auth) {
      case 'none': return <Security color="disabled" />;
      case 'api-key': return <Key color="primary" />;
      case 'oauth': return <Security color="success" />;
      case 'jwt': return <Security color="info" />;
      default: return <Security />;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Api color="primary" sx={{ fontSize: 40 }} />
          Configuration API Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage API endpoints, authentication, and monitor usage analytics
        </Typography>
      </Box>

      {/* API Overview Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Api color="primary" />
                <Typography variant="h6">Total Endpoints</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">{apiEndpoints.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active API endpoints
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrendingUp color="success" />
                <Typography variant="h6">Success Rate</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {Math.round(apiEndpoints.reduce((acc, ep) => acc + ep.successRate, 0) / apiEndpoints.length * 100) / 100}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average across all endpoints
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Speed color="warning" />
                <Typography variant="h6">Avg Response</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {Math.round(apiEndpoints.reduce((acc, ep) => acc + ep.responseTime, 0) / apiEndpoints.length)}ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average response time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Analytics color="secondary" />
                <Typography variant="h6">Daily Requests</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main">
                {(apiEndpoints.reduce((acc, ep) => acc + ep.requestsPerDay, 0) / 1000).toFixed(1)}K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total requests per day
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="configuration api tabs">
            <Tab icon={<Api />} label="API Endpoints" />
            <Tab icon={<Key />} label="API Keys" />
            <Tab icon={<Analytics />} label="Usage Analytics" />
            <Tab icon={<Description />} label="Documentation" />
          </Tabs>
        </Box>

        {/* API Endpoints Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">API Endpoints</Typography>
            <Button variant="contained" startIcon={<Add />}>
              Add Endpoint
            </Button>
          </Box>

          <Grid container spacing={3}>
            {apiEndpoints.map((endpoint) => (
              <Grid item xs={12} md={6} lg={4} key={endpoint.id}>
                <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => setSelectedEndpoint(endpoint)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={endpoint.method} 
                        size="small" 
                        color={getMethodColor(endpoint.method) as any}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(endpoint.status)}
                        <Chip 
                          label={endpoint.status} 
                          size="small" 
                          color={getStatusColor(endpoint.status) as any}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {endpoint.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {endpoint.path}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {endpoint.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getAuthIcon(endpoint.authentication)}
                        <Typography variant="caption" color="text.secondary">
                          {endpoint.authentication}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        v{endpoint.version}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Response Time
                      </Typography>
                      <Typography variant="caption" color="primary">
                        {endpoint.responseTime}ms
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(endpoint.successRate, 100)} 
                      sx={{ mb: 1, height: 6, borderRadius: 3 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Success Rate: {endpoint.successRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {endpoint.requestsPerDay.toLocaleString()} req/day
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* API Keys Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">API Keys</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setNewKeyDialog(true)}>
              Generate New Key
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Last Used</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Key />
                        {key.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {key.key.substring(0, 16)}...
                        </Typography>
                        <IconButton size="small">
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={key.status} 
                        size="small" 
                        color={key.status === 'active' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {key.usage.toLocaleString()} / {key.limit.toLocaleString()}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(key.usage / key.limit) * 100} 
                          sx={{ width: 100, height: 4 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{key.lastUsed.toLocaleDateString()}</TableCell>
                    <TableCell>{key.expiryDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setSelectedKey(key)}>
                        <Visibility />
                      </IconButton>
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

        {/* Usage Analytics Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            API Usage Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Request Volume Over Time
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Timeline sx={{ fontSize: 100, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Time series chart would be implemented here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Response Time Distribution
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Speed sx={{ fontSize: 100, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Response time histogram would be implemented here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent API Requests
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Endpoint</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Response Time</TableCell>
                          <TableCell>IP Address</TableCell>
                          <TableCell>User Agent</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apiMetrics.map((metric) => (
                          <TableRow key={metric.id}>
                            <TableCell>{metric.timestamp.toLocaleString()}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{metric.endpoint}</TableCell>
                            <TableCell>
                              <Chip 
                                label={metric.statusCode} 
                                size="small" 
                                color={metric.statusCode < 300 ? 'success' : metric.statusCode < 400 ? 'warning' : 'error'}
                              />
                            </TableCell>
                            <TableCell>{metric.responseTime}ms</TableCell>
                            <TableCell>{metric.ipAddress}</TableCell>
                            <TableCell>{metric.userAgent.substring(0, 30)}...</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Documentation Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            API Documentation
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Description color="primary" />
                    <Typography variant="h6">Getting Started</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Learn how to authenticate and make your first API request
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    View Guide
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Code color="secondary" />
                    <Typography variant="h6">API Reference</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Complete reference for all available endpoints and parameters
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Browse Reference
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Hub color="success" />
                    <Typography variant="h6">SDKs & Libraries</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Download official SDKs for popular programming languages
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Download SDKs
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Interactive API Explorer
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Test API endpoints directly from your browser
                  </Typography>
                  
                  <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Try it out:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                      <Chip label="GET" color="success" size="small" />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        /api/v1/users/123
                      </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<PlayArrow />} size="small">
                      Send Request
                    </Button>
                  </Box>
                  
                  <Alert severity="info">
                    <Typography variant="body2">
                      Use the interactive explorer to test endpoints with your API key
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Endpoint Detail Dialog */}
      <Dialog 
        open={!!selectedEndpoint} 
        onClose={() => setSelectedEndpoint(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedEndpoint && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={selectedEndpoint.method} 
                    color={getMethodColor(selectedEndpoint.method) as any}
                  />
                  <Typography variant="h6">{selectedEndpoint.name}</Typography>
                </Box>
                <Chip 
                  label={selectedEndpoint.status} 
                  color={getStatusColor(selectedEndpoint.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedEndpoint.description}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Endpoint Details:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Path" 
                    secondary={selectedEndpoint.path}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Version" 
                    secondary={selectedEndpoint.version}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Authentication" 
                    secondary={selectedEndpoint.authentication}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Rate Limit" 
                    secondary={`${selectedEndpoint.rateLimit} requests/hour`}
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEndpoint(null)}>Close</Button>
              <Button variant="outlined" startIcon={<BugReport />}>
                Test Endpoint
              </Button>
              <Button variant="contained" startIcon={<Description />}>
                View Documentation
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* API Key Detail Dialog */}
      <Dialog 
        open={!!selectedKey} 
        onClose={() => setSelectedKey(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedKey && (
          <>
            <DialogTitle>API Key Details</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" gutterBottom>
                Key Name: {selectedKey.name}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                {selectedKey.key}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Permissions:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                {selectedKey.permissions.map((permission) => (
                  <Chip key={permission} label={permission} size="small" variant="outlined" />
                ))}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Usage Statistics:
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Usage</Typography>
                  <Typography variant="body2">
                    {selectedKey.usage.toLocaleString()} / {selectedKey.limit.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(selectedKey.usage / selectedKey.limit) * 100}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Created: {selectedKey.createdDate.toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Used: {selectedKey.lastUsed.toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expires: {selectedKey.expiryDate.toLocaleDateString()}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedKey(null)}>Close</Button>
              <Button variant="outlined" startIcon={<Edit />}>
                Edit Key
              </Button>
              <Button variant="outlined" color="error" startIcon={<Delete />}>
                Revoke Key
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* New API Key Dialog */}
      <Dialog
        open={newKeyDialog}
        onClose={() => setNewKeyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate New API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Key Name"
            placeholder="e.g., Mobile App Production"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={[]}
              label="Permissions"
            >
              <MenuItem value="read:users">Read Users</MenuItem>
              <MenuItem value="write:users">Write Users</MenuItem>
              <MenuItem value="read:config">Read Configuration</MenuItem>
              <MenuItem value="write:config">Write Configuration</MenuItem>
              <MenuItem value="read:analytics">Read Analytics</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Rate Limit"
            type="number"
            defaultValue={1000}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Expiry Date"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewKeyDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Key />}>
            Generate Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfigurationAPI;