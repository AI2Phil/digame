import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toast';
import AdvancedTeamAnalytics from '../../src/components/team/AdvancedTeamAnalytics.jsx';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const TeamAnalyticsPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto py-8">
            <AdvancedTeamAnalytics />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default TeamAnalyticsPage;