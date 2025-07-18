import React from 'react';
import Head from 'next/head';
import { Container, Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Home as HomeIcon, Speed as SpeedIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import RealTimePerformanceMonitor from '../../src/components/performance/RealTimePerformanceMonitor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toaster';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RealTimeMonitorPage: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Real-Time Performance Monitor - Digame</title>
        <meta name="description" content="Real-time performance monitoring with automated optimizations and comprehensive metrics tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ToastProvider>
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
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/');
                }}
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Dashboard
              </Link>
              <Link
                color="inherit"
                href="/performance"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/performance');
                }}
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                <SpeedIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Performance
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                Real-Time Monitor
              </Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Box mb={3}>
              <Typography variant="h4" component="h1" gutterBottom>
                Real-Time Performance Monitor
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Live performance monitoring with automated optimizations, comprehensive metrics tracking, and intelligent alerting system
              </Typography>
            </Box>

            {/* Real-Time Performance Monitor Component */}
            <RealTimePerformanceMonitor />
          </Container>
        </ToastProvider>
      </QueryClientProvider>
    </>
  );
};

export default RealTimeMonitorPage;