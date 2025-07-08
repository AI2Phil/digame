import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toaster';
import { TwinOverview } from '../../src/components/digital-twin/TwinOverview';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function TwinOverviewPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <TwinOverview />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}