import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toaster';
import { TwinInsightsPanel } from '../../components/digital-twin/TwinInsightsPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const TwinInsightsPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TwinInsightsPanel twinId="demo-twin" />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default TwinInsightsPage;
