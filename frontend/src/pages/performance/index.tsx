import React from 'react';
import Head from 'next/head';
import { Container, Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip } from '@mui/material';
import { 
  Speed as SpeedIcon, 
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Storage as StorageIcon,
  AutoAwesome as AutoAwesomeIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';

const PerformanceIndexPage: React.FC = () => {
  const router = useRouter();

  const performanceTools = [
    {
      title: 'Real-Time Monitor',
      description: 'Live performance monitoring with automated optimizations and comprehensive metrics tracking',
      icon: <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/performance/real-time-monitor',
      status: 'Active',
      statusColor: 'success' as const,
      features: ['Live Metrics', 'Auto-Optimization', 'Alerts', 'Real-time Charts']
    },
    {
      title: 'Advanced Performance Center',
      description: 'Comprehensive performance monitoring, optimization, and automation platform',
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/AdvancedPerformancePage',
      status: 'Available',
      statusColor: 'primary' as const,
      features: ['Bundle Analysis', 'Query Optimization', 'UX Tracking', 'AI Insights']
    },
    {
      title: 'Performance Analytics',
      description: 'Deep dive into performance metrics and historical trends',
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/analytics/performance',
      status: 'Available',
      statusColor: 'primary' as const,
      features: ['Historical Data', 'Trend Analysis', 'Benchmarking', 'Reports']
    },
    {
      title: 'System Monitoring',
      description: 'Monitor system health, resource usage, and infrastructure performance',
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/monitoring',
      status: 'Admin Only',
      statusColor: 'warning' as const,
      features: ['System Health', 'Resource Usage', 'Infrastructure', 'Alerts']
    }
  ];

  const quickStats = [
    { label: 'Performance Score', value: '92', color: 'success.main', icon: <SpeedIcon /> },
    { label: 'Active Monitors', value: '8', color: 'primary.main', icon: <TimelineIcon /> },
    { label: 'Optimizations', value: '15', color: 'info.main', icon: <AutoAwesomeIcon /> },
    { label: 'System Health', value: 'Good', color: 'success.main', icon: <TrendingUpIcon /> }
  ];

  return (
    <>
      <Head>
        <title>Performance Center - Digame</title>
        <meta name="description" content="Comprehensive performance monitoring and optimization tools for your digital platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Page Header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            Performance Center
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Monitor, analyze, and optimize your platform's performance with comprehensive tools and real-time insights
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ color: stat.color }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ color: stat.color, fontWeight: 'bold' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Performance Tools */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Performance Tools & Dashboards
        </Typography>

        <Grid container spacing={3}>
          {performanceTools.map((tool, index) => (
            <Grid item xs={12} md={6} lg={6} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    {tool.icon}
                    <Box flexGrow={1}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Typography variant="h6" component="h3">
                          {tool.title}
                        </Typography>
                        <Chip 
                          label={tool.status} 
                          color={tool.statusColor} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {tool.description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Features:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {tool.features.map((feature, featureIndex) => (
                        <Chip 
                          key={featureIndex}
                          label={feature} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => router.push(tool.path)}
                    disabled={tool.status === 'Coming Soon'}
                  >
                    {tool.status === 'Coming Soon' ? 'Coming Soon' : 'Open Dashboard'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Additional Info */}
        <Box mt={4} p={3} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Performance Monitoring Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Our performance monitoring suite provides comprehensive insights into your platform's health and performance. 
            From real-time monitoring to advanced analytics, you have all the tools needed to maintain optimal performance.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>Real-Time Monitoring</Typography>
              <Typography variant="body2" color="text.secondary">
                Live performance metrics with automated optimization recommendations
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>Historical Analysis</Typography>
              <Typography variant="body2" color="text.secondary">
                Trend analysis and performance benchmarking over time
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>AI-Powered Insights</Typography>
              <Typography variant="body2" color="text.secondary">
                Machine learning algorithms identify optimization opportunities
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default PerformanceIndexPage;