import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

// Import our new advanced components
import PerformanceDashboard from '../../components/performance/PerformanceDashboard';
import BundleAnalyzer from '../../components/performance/BundleAnalyzer';
import QueryOptimization from '../../components/performance/QueryOptimization';
import UserExperienceTracking from '../../components/performance/UserExperienceTracking';
import RealTimePerformanceMonitor from '../../components/performance/RealTimePerformanceMonitor';
import AIInsightsDashboard from '../../components/advanced/AIInsightsDashboard';
import WorkflowAutomation from '../../components/advanced/WorkflowAutomation';

// Import performance optimization service
import { performanceOptimizationService } from '../../services/performanceOptimizationService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `performance-tab-${index}`,
    'aria-controls': `performance-tabpanel-${index}`,
  };
}

const AdvancedPerformancePage = () => {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [systemStatus, setSystemStatus] = useState('healthy');
  const [activeOptimizations, setActiveOptimizations] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Define tabs array before useEffect
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <SpeedIcon />,
      component: <PerformanceDashboard />,
      description: 'Comprehensive performance overview and system health',
    },
    {
      id: 'realtime',
      label: 'Real-Time Monitor',
      icon: <TimelineIcon />,
      component: <RealTimePerformanceMonitor />,
      description: 'Live performance monitoring with automated optimizations',
    },
    {
      id: 'bundle',
      label: 'Bundle Analysis',
      icon: <StorageIcon />,
      component: <BundleAnalyzer />,
      description: 'Analyze and optimize JavaScript bundle size and composition',
    },
    {
      id: 'queries',
      label: 'Query Optimization',
      icon: <AssessmentIcon />,
      component: <QueryOptimization />,
      description: 'Database query performance analysis and recommendations',
    },
    {
      id: 'ux',
      label: 'User Experience',
      icon: <AnalyticsIcon />,
      component: <UserExperienceTracking />,
      description: 'User experience metrics and behavior analysis',
    },
    {
      id: 'ai',
      label: 'AI Insights',
      icon: <AutoAwesomeIcon />,
      component: <AIInsightsDashboard />,
      description: 'AI-powered performance insights and recommendations',
    },
    {
      id: 'automation',
      label: 'Automation',
      icon: <SettingsIcon />,
      component: <WorkflowAutomation />,
      description: 'Automated performance optimization workflows',
    },
  ];

  useEffect(() => {
    setIsClient(true);

    // Initialize performance monitoring only on client
    if (typeof window !== 'undefined') {
      initializePerformanceMonitoring();
    }

    // Set tab from URL parameter
    const tab = router.query.tab;
    if (tab && Array.isArray(tabs)) {
      const tabIndex = tabs.findIndex(t => t.id === tab);
      if (tabIndex !== -1) {
        setTabValue(tabIndex);
      }
    }
  }, [router.query.tab]);

  const initializePerformanceMonitoring = async () => {
    try {
      if (typeof window === 'undefined') return;

      await performanceOptimizationService.initialize();

      // Get current metrics
      const metrics = performanceOptimizationService.getCurrentMetrics();
      if (metrics) {
        // Calculate performance score based on key metrics
        const score = calculatePerformanceScore(metrics);
        setPerformanceScore(score);
        setSystemStatus(score > 80 ? 'healthy' : score > 60 ? 'warning' : 'critical');
      }

      // Get active optimizations
      const optimizations = performanceOptimizationService.getOptimizations();
      if (Array.isArray(optimizations)) {
        setActiveOptimizations(optimizations.filter(opt => opt.status === 'pending').length);
      }
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  };

  const calculatePerformanceScore = metrics => {
    if (!metrics || typeof metrics !== 'object') return 85; // Default score

    // Simplified performance score calculation
    let score = 100;

    // Penalize for slow load times
    if (metrics.firstContentfulPaint > 2000) score -= 20;
    if (metrics.largestContentfulPaint > 3000) score -= 20;

    // Penalize for high memory usage
    if (metrics.memoryUsage > 100000000) score -= 15; // 100MB

    // Penalize for large bundle size
    if (metrics.bundleSize > 1000000) score -= 15; // 1MB

    // Penalize for poor interactivity
    if (metrics.firstInputDelay > 100) score -= 10;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 10;

    return Math.max(0, score);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (Array.isArray(tabs) && tabs[newValue]) {
      const tab = tabs[newValue];
      router.push(`/AdvancedPerformancePage?tab=${tab.id}`, undefined, { shallow: true });
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  // SSR safety check
  if (!isClient) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Advanced Performance Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Loading performance monitoring tools...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          color="inherit"
          href="/"
          onClick={e => {
            e.preventDefault();
            router.push('/');
          }}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <SpeedIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Advanced Performance
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Advanced Performance Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive performance monitoring, optimization, and automation platform
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch checked={realTimeMode} onChange={e => setRealTimeMode(e.target.checked)} />
            }
            label="Real-Time Mode"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={initializePerformanceMonitoring}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Performance Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <SpeedIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" color={getStatusColor(systemStatus)}>
                    {performanceScore !== null ? performanceScore : '--'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Performance Score
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
                <MemoryIcon color="primary" fontSize="large" />
                <Box>
                  <Chip
                    label={systemStatus.toUpperCase()}
                    color={getStatusColor(systemStatus)}
                    variant="filled"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    System Status
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
                <AutoAwesomeIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4">{activeOptimizations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Optimizations
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
                <TimelineIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {realTimeMode ? 'ON' : 'OFF'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-Time Monitoring
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Alert */}
      {systemStatus !== 'healthy' && (
        <Alert
          severity={systemStatus === 'warning' ? 'warning' : 'error'}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setTabValue(1)}>
              View Details
            </Button>
          }
        >
          {systemStatus === 'warning'
            ? 'Performance issues detected. Consider reviewing optimization recommendations.'
            : 'Critical performance issues detected. Immediate attention required.'}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="performance tabs"
          >
            {Array.isArray(tabs) &&
              tabs.map((tab, index) => (
                <Tab
                  key={tab.id}
                  icon={tab.icon}
                  label={tab.label}
                  {...a11yProps(index)}
                  sx={{ minHeight: 72 }}
                />
              ))}
          </Tabs>
        </Box>

        {/* Tab Description */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {Array.isArray(tabs) && tabs[tabValue] ? tabs[tabValue].description : 'Loading...'}
          </Typography>
        </Box>

        {/* Tab Panels */}
        {Array.isArray(tabs) &&
          tabs.map((tab, index) => (
            <TabPanel key={tab.id} value={tabValue} index={index}>
              {tab.component}
            </TabPanel>
          ))}
      </Card>

      {/* Footer Info */}
      <Box mt={3} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Advanced Performance Center • Real-time monitoring and AI-powered optimization
          {realTimeMode && ' • Live monitoring active'}
        </Typography>
      </Box>
    </Container>
  );
};

export default AdvancedPerformancePage;
