import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntegrationDashboard } from '../../src/components/integrations/IntegrationDashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function IntegrationDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ padding: '20px' }}>
          <IntegrationDashboard />
        </div>
      </div>
    </QueryClientProvider>
  );
}