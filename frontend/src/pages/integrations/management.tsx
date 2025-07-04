/**
 * Integration Management Page - Next.js Page
 * Route: /integrations/management
 */

import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import IntegrationManagementDashboard from '../../components/integrations/IntegrationManagementDashboard';

interface ManagementPageProps {
  // Add any server-side props if needed
}

const ManagementPage: React.FC<ManagementPageProps> = () => {
  return (
    <>
      <Head>
        <title>Integration Management - Digame</title>
        <meta name="description" content="Manage your installed integrations and monitor their performance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <IntegrationManagementDashboard />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Add any server-side logic here if needed
  // For example, authentication checks, data fetching, etc.
  
  return {
    props: {
      // Pass any props to the component
    },
  };
};

export default ManagementPage;