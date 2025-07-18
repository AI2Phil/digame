import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toaster';
import EmailAnalyzer from '../../src/components/ai/EmailAnalyzer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export default function EmailAnalysisPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Email Pattern Analyzer
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Analyze your email communication patterns to discover insights about productivity, 
                sentiment, and common themes in your email correspondence.
              </p>
            </div>
            <EmailAnalyzer />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}