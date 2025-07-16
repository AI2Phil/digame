import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toast';
import CollaborationOptimization from '../../src/components/team/CollaborationOptimization.jsx';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const CollaborationOptimizationPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto py-8">
            <CollaborationOptimization />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default CollaborationOptimizationPage;