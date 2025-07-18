import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toaster';
import { TwinSimulation } from '../../components/digital-twin/TwinSimulation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const TwinSimulationPage: React.FC = () => {
  return (

const TwinSimulationPage: React.FC = () => {

    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <TwinSimulation />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default TwinSimulationPage;
