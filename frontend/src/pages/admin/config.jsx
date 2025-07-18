import React from 'react';
import { ToastProvider } from '../components/ui/Toaster';
import { SystemConfigurationDashboard } from '../components/settings/SystemConfigurationDashboard';

const SystemConfigurationPage = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <SystemConfigurationDashboard />
      </div>
    </ToastProvider>
  );
};

export default SystemConfigurationPage;
