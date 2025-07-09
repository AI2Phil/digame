import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import AdvancedReportingDashboard from '../../components/reports/AdvancedReportingDashboard';

interface ReportsPageProps {
  user?: {
    id: number;
    name: string;
    email: string;
    subscription_tier: string;
    is_platform_owner: boolean;
  };
}

const ReportsPage: React.FC<ReportsPageProps> = ({ user }) => {
  return (
    <>
      <Head>
        <title>Advanced Reporting Dashboard - Digame</title>
        <meta name="description" content="Comprehensive business intelligence and analytics dashboard" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdvancedReportingDashboard />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // In a real application, you would:
  // 1. Check authentication status
  // 2. Verify user permissions
  // 3. Fetch user data from your authentication system
  
  // For demo purposes, we'll simulate an authenticated user
  const user = {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    subscription_tier: 'enterprise',
    is_platform_owner: false
  };

  // Check if user has access to advanced reporting
  const hasAccess = user.subscription_tier === 'enterprise' || user.subscription_tier === 'team';
  
  if (!hasAccess) {
    return {
      redirect: {
        destination: '/upgrade',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user,
    },
  };
};

export default ReportsPage;