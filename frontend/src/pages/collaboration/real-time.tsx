import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RealTimeCollaborationDashboard } from '../../components/collaboration/RealTimeCollaborationDashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RealTimeCollaborationPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto">
          <header className="bg-white shadow-sm border-b border-gray-200 mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Real-Time Collaboration</h1>
                  <p className="text-gray-600 mt-1">
                    Team communication, workspace management, and real-time collaboration features
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">Connected to collaboration workspace</div>
                </div>
              </div>
            </div>
          </header>

          <main>
            <RealTimeCollaborationDashboard />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default RealTimeCollaborationPage;
