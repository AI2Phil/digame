import React from 'react';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toast';
import CommunicationStyleAnalyzer from '../../components/ai/CommunicationStyleAnalyzer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const CommunicationAnalysis = () => {
  return (
    <>
      <Head>
        <title>Communication Style Analyzer - Digame AI Tools</title>
        <meta name="description" content="AI-powered communication style analysis and optimization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <CommunicationStyleAnalyzer />
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </>
  );
};

export default CommunicationAnalysis;