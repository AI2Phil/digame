import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toaster';
import { TwinInteractionPanel } from '../../components/digital-twin/TwinInteractionPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const TwinInteractionPage: React.FC = () => {
  return (

const TwinInteractionPage: React.FC = () => {

    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <TwinInteractionPanel twinId="demo-twin-001" />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default TwinInteractionPage;
