/**
 * Integration Marketplace Page - Next.js Page
 * Route: /integrations/marketplace
 */

import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import IntegrationMarketplace from '../../components/integrations/IntegrationMarketplace';

interface MarketplacePageProps {
  // Add any server-side props if needed
}

const MarketplacePage: React.FC<MarketplacePageProps> = () => {
  return (
    <>
      <Head>
        <title>Integration Marketplace - Digame</title>
        <meta name="description" content="Discover and install integrations for your Digame platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <IntegrationMarketplace />
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

export default MarketplacePage;