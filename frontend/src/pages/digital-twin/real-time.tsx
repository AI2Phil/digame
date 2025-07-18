import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RealTimeTwinDashboard from '../../components/digital-twin/RealTimeTwinDashboard';
import { ToastProvider } from '../../components/ui/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RealTimeTwinPage: React.FC = () => {
  return (

const RealTimeTwinPage: React.FC = () => {

    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="page-container">
          <RealTimeTwinDashboard />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default RealTimeTwinPage;
