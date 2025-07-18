/**
 * Integration Configuration Page - Next.js Dynamic Page
 * Route: /integrations/configure/[integrationId]
 */

import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import IntegrationConfigurationWizard from '../../../components/integrations/IntegrationConfigurationWizard';

interface ConfigurePageProps {
  integrationId: string;
}

const ConfigurePage: React.FC<ConfigurePageProps> = ({ integrationId }) => {
  const router = useRouter();

  const handleComplete = (configuration: any) => {
    // Handle successful configuration
    console.log('Integration configured:', configuration);
    // Redirect to management page
    router.push('/integrations/management');
  };

  const handleCancel = () => {
    // Handle cancellation
    router.back();
  };

  return (
    <>
      <Head>
        <title>Configure Integration - Digame</title>
        <meta name="description" content="Configure your integration with step-by-step guidance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <IntegrationConfigurationWizard
        integrationId={integrationId}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  const { integrationId } = context.params!;

  // Validate integrationId
  if (!integrationId || typeof integrationId !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      integrationId,
    },
  };
};

export default ConfigurePage;
