import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import { ToastProvider } from '../../components/ui/Toast';
import TeamManagement from '../../components/team/TeamManagement';

interface TeamPageProps {
  initialData?: any;
}

const TeamPage: React.FC<TeamPageProps> = ({ initialData }) => {
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
          <p className="text-gray-600 mb-6">Please log in to access team management features.</p>
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

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Team Management - Digame</title>
          <meta
            name="description"
            content="Manage your teams, invite members, and collaborate effectively with Digame's team management tools."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <TeamManagement />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  // You can fetch initial data here if needed
  // For now, we'll let the component handle data fetching

  return {
    props: {
      initialData: null,
    },
  };
};

export default TeamPage;
