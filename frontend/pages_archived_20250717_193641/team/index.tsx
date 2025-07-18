import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../src/components/ui/Toast';
import TeamManagement from '../../src/components/team/TeamManagement';
import NavigationHubFooter from '../../src/components/layout/NavigationHubFooter';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const TeamCollaborationPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Team Management - Digame</title>
        <meta name="description" content="Manage your teams, invite members, and collaborate effectively" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Return to Dashboard Navigation */}
            <div className="bg-white border-b border-gray-200">
              <div className="container mx-auto px-4 py-3">
                <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Return to Dashboard</span>
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
              <TeamManagement />
            </div>

            {/* Navigation Hub Footer */}
            <NavigationHubFooter />
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </>
  );
};

export default TeamCollaborationPage;