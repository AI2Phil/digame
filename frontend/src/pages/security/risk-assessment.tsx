import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RiskAssessmentEngine from '../../components/security/RiskAssessmentEngine';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const RiskAssessmentPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <RiskAssessmentEngine />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default RiskAssessmentPage;
