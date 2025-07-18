import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toaster';
import { TwinPredictionsPanel } from '../../src/components/digital-twin/TwinPredictionsPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function TwinPredictionsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <TwinPredictionsPanel twinId="demo-twin-001" />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}