import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RealTimeTwinDashboard from '../../src/components/digital-twin/RealTimeTwinDashboard';
import { ToastProvider } from '../../src/components/ui/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RealTimeTwinPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="page-container">
          <RealTimeTwinDashboard />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}