import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import { ToastProvider } from '../../components/ui/Toast';
import AdvancedTeamAnalytics from '../../components/team/AdvancedTeamAnalytics';

interface TeamAnalyticsPageProps {
  initialData?: any;
}

const TeamAnalyticsPage: React.FC<TeamAnalyticsPageProps> = ({ initialData }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access team analytics features.</p>
          <a
            href="/auth/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check if user has access to team analytics
  const hasAnalyticsAccess =
    user.subscriptionTier === 'team' ||
    user.subscriptionTier === 'enterprise' ||
    user.subscriptionTier === 'platform_owner';

  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Access Required</h2>
          <p className="text-gray-600 mb-6">
            Upgrade to Team or Enterprise subscription to access advanced team analytics.
          </p>
          <a
            href="/pricing"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            View Pricing Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Team Analytics - Digame</title>
          <meta
            name="description"
            content="Advanced team analytics and performance insights with AI-powered recommendations."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdvancedTeamAnalytics />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  // You can fetch initial analytics data here if needed
  // For now, we'll let the component handle data fetching

  return {
    props: {
      initialData: null,
    },
  };
};

export default TeamAnalyticsPage;
