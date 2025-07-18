import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toaster';
import { TwinWorkspace } from '../../components/digital-twin/TwinWorkspace';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const TwinWorkspacePage: React.FC = () => {
  return (

const TwinWorkspacePage: React.FC = () => {

    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <TwinWorkspace twinId="demo-twin-001" />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default TwinWorkspacePage;
