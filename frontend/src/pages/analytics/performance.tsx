import React from 'react';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PerformanceMonitoringSection from '../../components/analytics/PerformanceMonitoringSection';

// Create a query client for this page
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minute for performance data
      refetchOnWindowFocus: false,
    },
  },
});

export default function PerformanceAnalytics() {
  return (
    <>
      <Head>
        <title>Performance Analytics - Digame</title>
        <meta name="description" content="Real-time performance monitoring and system analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <PerformanceMonitoringSection data={{}} />
          </div>
        </div>
      </QueryClientProvider>
    </>
  );
}