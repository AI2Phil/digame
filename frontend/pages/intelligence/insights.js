import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IntelligenceInsights from '../../src/components/intelligence/IntelligenceInsights';
import { ToastProvider } from '../../src/components/ui/Toaster';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function IntelligenceInsightsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <IntelligenceInsights />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}