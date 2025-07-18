import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/ui/Toast';
import TwinAnalytics from '../../components/digital-twin/TwinAnalytics';
import { digitalTwinApi } from '../../services/digitalTwinApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const TwinAnalyticsPage: React.FC = () => {
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTwinStatus();
  }, []);

  const fetchTwinStatus = async () => {
    try {
      setLoading(true);
      const response = await digitalTwinApi.getTwinStatus();

      if (response.success && response.data) {
        setTwin({
          id: response.data.twin_id,
          name: response.data.name,
          status: response.data.status,
          learning_progress: response.data.learning_progress,
          accuracy_score: response.data.accuracy_score,
        });
      } else {
        // Use fallback twin data
        setTwin({
          id: 'fallback-twin',
          name: 'Digital Twin',
          status: 'active',
          learning_progress: 75,
          accuracy_score: 82,
        });
        setError('Using sample twin data - API connection unavailable');
      }
    } catch (error) {
      console.error('Error fetching twin status:', error);
      // Use fallback twin data
      setTwin({
        id: 'fallback-twin',
        name: 'Digital Twin',
        status: 'active',
        learning_progress: 75,
        accuracy_score: 82,
      });
      setError('Using sample twin data - API connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading twin analytics...</p>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load twin data</p>
          <button
            onClick={fetchTwinStatus}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Twin Analytics</h1>
              <p className="mt-2 text-gray-600">
                Comprehensive analytics and insights from your digital twin's learning patterns
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <TwinAnalytics twinId={twin.id} twin={twin} />
          </div>
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default TwinAnalyticsPage;
