/**
 * Integrations Index Page - Next.js Page
 * Route: /integrations
 */

import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import IntegrationsPage from '../IntegrationsPage';

interface IntegrationsIndexProps {
  // Add any server-side props if needed
}

const IntegrationsIndex: React.FC<IntegrationsIndexProps> = () => {
  return (
    <>
      <Head>
        <title>Integrations - Digame</title>
        <meta name="description" content="Manage your third-party service connections and APIs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <IntegrationsPage />
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

export default IntegrationsIndex;