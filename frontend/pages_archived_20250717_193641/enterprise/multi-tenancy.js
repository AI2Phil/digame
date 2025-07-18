import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toaster';
import MultiTenancyDashboard from '../../src/components/enterprise/MultiTenancyDashboard';

// Prevent static generation and SSR issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export default function MultiTenancyPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="py-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Enterprise Multi-Tenancy Management
                </h1>
                <p className="text-xl text-gray-600">
                  Comprehensive tenant administration, user management, and enterprise oversight dashboard
                </p>
              </div>
              
              <MultiTenancyDashboard 
                currentTenant={null}
                userRole="admin"
                onTenantSwitch={() => {}}
              />
            </div>
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}