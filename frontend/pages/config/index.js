import React from 'react';
import Layout from '../../src/components/layout/Layout';
import SystemConfigurationDashboard from '../../src/components/settings/SystemConfigurationDashboard';

export default function ConfigurationPage() {
  return (
    <Layout>
      <SystemConfigurationDashboard />
    </Layout>
  );
}