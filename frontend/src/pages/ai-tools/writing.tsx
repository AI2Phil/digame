import React from 'react';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toast';
import WritingAssistance from '../../components/ai/WritingAssistance';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const WritingAssistancePage = () => {
  return (
    <>
      <Head>
        <title>Writing Assistance - Digame AI Tools</title>
        <meta name="description" content="AI-powered writing assistance and content optimization" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <WritingAssistance />
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </>
  );
};

export default WritingAssistancePage;
