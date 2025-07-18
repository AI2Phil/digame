import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toaster';
import BundleAnalyzer from '../../src/components/performance/BundleAnalyzer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function BundleAnalyzerPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Bundle Analyzer</h1>
              <p className="text-gray-600">
                Analyze and optimize your application bundle size and performance
              </p>
            </div>
            <BundleAnalyzer />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}
