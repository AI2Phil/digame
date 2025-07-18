import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toaster';
import { TwinOverview } from '../../components/digital-twin/TwinOverview';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const TwinOverviewPage: React.FC = () => {
  return (

const TwinOverviewPage: React.FC = () => {

    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <TwinOverview />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default TwinOverviewPage;
