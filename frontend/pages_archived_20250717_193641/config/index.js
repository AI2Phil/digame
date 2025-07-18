import React from 'react';
import DashboardLayout from '../../src/components/layout/DashboardLayout';
import SystemConfigurationDashboard from '../../src/components/settings/SystemConfigurationDashboard';

export default function ConfigurationPage() {
  return (
    <DashboardLayout>
      <SystemConfigurationDashboard />
    </DashboardLayout>
  );
}