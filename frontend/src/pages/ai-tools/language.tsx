import React from 'react';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toast';
import LanguageTool from '../../components/ai/LanguageTool';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const LanguageLearningPage = () => {
  return (
    <>
      <Head>
        <title>Language Learning AI - Digame AI Tools</title>
        <meta
          name="description"
          content="AI-powered language learning with personalized lessons and practice"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <LanguageTool />
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </>
  );
};

export default LanguageLearningPage;
