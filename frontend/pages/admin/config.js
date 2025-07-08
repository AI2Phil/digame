import React from 'react';
import { ToastProvider } from '../../src/components/ui/Toaster';
import { SystemConfigurationDashboard } from '../../src/components/settings/SystemConfigurationDashboard';

export default function AdminConfig() {
  return (
    <ToastProvider>
      <SystemConfigurationDashboard />
    </ToastProvider>
  );
}