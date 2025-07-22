import React from 'react';
import Head from 'next/head';
import { Container, Typography, Box } from '@mui/material';
import UserExperienceTracking from '../../components/performance/UserExperienceTracking';
import PerformanceMonitoringDashboard from '../../components/performance/PerformanceMonitoringDashboard';

const PerformanceMonitoringPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Performance Monitoring - Digame</title>
        <meta
          name="description"
          content="Real-time performance monitoring dashboard with user experience tracking and system metrics"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Performance Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time performance monitoring dashboard with comprehensive user experience tracking
            and system performance metrics
          </Typography>
        </Box>

        <Box sx={{ mb: 6 }}>
          <UserExperienceTracking />
        </Box>

        <Box>
          <PerformanceMonitoringDashboard />
        </Box>
      </Container>
    </>
  );
};

export default PerformanceMonitoringPage;