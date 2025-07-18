import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toaster';
import MeetingSummarizer from '../../components/ai/MeetingSummarizer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

const MeetingSummarizerPage: React.FC = () => {
  return (

const MeetingSummarizerPage: React.FC = () => {

    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Meeting Summarizer & Insights
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Transform your meeting notes and transcripts into concise summaries with 
                key discussion points and actionable items automatically extracted.
              </p>
            </div>
            <MeetingSummarizer />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default MeetingSummarizerPage;
