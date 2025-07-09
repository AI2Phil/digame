import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toaster';
import PerformanceMonitoringDashboard from '../../src/components/performance/PerformanceMonitoringDashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function PerformanceMonitoringDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <PerformanceMonitoringDashboard />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}