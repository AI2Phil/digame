import React from 'react';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserBehaviorAnalyticsSection from '../../src/components/analytics/UserBehaviorAnalyticsSection';

// Create a query client for this page
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function BehavioralAnalytics() {
  return (
    <>
      <Head>
        <title>Behavioral Analytics - Digame</title>
        <meta name="description" content="AI-powered behavioral analytics and user insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <UserBehaviorAnalyticsSection />
          </div>
        </div>
      </QueryClientProvider>
    </>
  );
}