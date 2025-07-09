import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdvancedSecurityDashboard from '../../src/components/security/AdvancedSecurityDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function AdvancedSecurityDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <AdvancedSecurityDashboard />
        </div>
      </div>
    </QueryClientProvider>
  );
}