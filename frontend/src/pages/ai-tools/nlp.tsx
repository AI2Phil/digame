import React from 'react';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toast';
import NLPEnhancement from '../../components/ai/NLPEnhancement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const NLPEnhancementPage = () => {
  return (
    <>
      <Head>
        <title>NLP Enhancement - Digame AI Tools</title>
        <meta
          name="description"
          content="Advanced natural language processing and text analysis tools"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <NLPEnhancement />
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </>
  );
};

export default NLPEnhancementPage;
