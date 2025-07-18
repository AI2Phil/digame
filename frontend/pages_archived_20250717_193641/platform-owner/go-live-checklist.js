import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GoLiveChecklist from '../../src/components/platform-owner/GoLiveChecklist';
import { ToastProvider } from '../../src/components/ui/Toaster';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function GoLiveChecklistPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="px-4 py-6 sm:px-0">
              <div className="border-b border-gray-200 pb-5">
                <h1 className="text-3xl font-bold leading-6 text-gray-900">
                  Go-Live Readiness Checklist
                </h1>
                <p className="mt-2 max-w-4xl text-sm text-gray-500">
                  Comprehensive assessment of system readiness for production deployment. 
                  This checklist validates data quality, backup systems, performance benchmarks, 
                  security audits, and operational procedures required for go-live.
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-0">
              <GoLiveChecklist />
            </div>
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}