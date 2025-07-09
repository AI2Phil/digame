import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import CustomReportBuilder from '../../components/CustomReportBuilder';

interface ReportBuilderPageProps {
  user?: {
    id: number;
    name: string;
    email: string;
    subscription_tier: string;
    is_platform_owner: boolean;
  };
}

const ReportBuilderPage: React.FC<ReportBuilderPageProps> = ({ user }) => {
  return (
    <>
      <Head>
        <title>Custom Report Builder - Digame</title>
        <meta name="description" content="Create custom reports with advanced visualization and filtering" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CustomReportBuilder
            onSave={(report) => {
              console.log('Report saved:', report);
              // Handle report save - could redirect or show success message
            }}
            onCancel={() => {
              console.log('Report creation cancelled');
              // Handle cancel - could redirect back to reports list
            }}
          />
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

  // Check if user has access to report builder
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

export default ReportBuilderPage;