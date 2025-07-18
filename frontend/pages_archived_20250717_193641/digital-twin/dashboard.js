import React from 'react';
import Head from 'next/head';
import { ToastProvider } from '../../src/components/ui/Toast';
import { DigitalTwinDashboard } from '../../src/components/digital-twin/DigitalTwinDashboard';

const DigitalTwinDashboardPage = () => {
  return (
    <>
      <Head>
        <title>Digital Twin Dashboard - Digame</title>
        <meta name="description" content="Comprehensive digital twin management and analytics dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <ToastProvider>
        <DigitalTwinDashboard />
      </ToastProvider>
    </>
  );
};

export default DigitalTwinDashboardPage;