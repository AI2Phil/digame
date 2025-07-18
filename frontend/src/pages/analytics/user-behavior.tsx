import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserBehaviorAnalyticsSection from '../../components/analytics/UserBehaviorAnalyticsSection';

// Create a query client for this page
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const UserBehaviorAnalyticsPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Behavior Analytics</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive insights into user engagement, behavior patterns, and conversion metrics
            </p>
          </div>

          <UserBehaviorAnalyticsSection data={{}} />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default UserBehaviorAnalyticsPage;
