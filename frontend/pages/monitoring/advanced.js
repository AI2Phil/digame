import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdvancedMonitoringDashboard } from '../../src/components/monitoring/AdvancedMonitoringDashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Toast Provider Component
const ToastProvider = ({ children }) => {
  React.useEffect(() => {
    // Simple toast implementation
    if (typeof window !== 'undefined') {
      window.toast = (message, type = 'info') => {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm ${
          type === 'success' ? 'bg-green-500' :
          type === 'warning' ? 'bg-yellow-500' :
          type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      };
    }
  }, []);

  return <>{children}</>;
};

export default function AdvancedMonitoringPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Advanced Monitoring</h1>
                  <p className="text-gray-600 mt-1">
                    Comprehensive system monitoring, alerting, and performance analytics
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>System Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <AdvancedMonitoringDashboard />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}