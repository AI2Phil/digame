import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TwinSettings from '../../components/digital-twin/TwinSettings';
import { ToastProvider } from '../../components/ui/Toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const TwinSettingsPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <TwinSettings />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default TwinSettingsPage;
