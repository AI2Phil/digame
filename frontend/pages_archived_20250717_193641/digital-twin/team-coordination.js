import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamCoordination from '../../src/components/digital-twin/TeamCoordination';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function TeamCoordinationPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Team Coordination</h1>
            <p className="mt-2 text-gray-600">
              Orchestrate multi-twin optimization and collaboration across your team
            </p>
          </div>
          
          <TeamCoordination teamId="default" />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}