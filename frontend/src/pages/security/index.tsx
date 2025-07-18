import React from 'react';
import { ToastProvider } from '../../components/ui/Toaster';
import { SecurityDashboard } from '../../components/security/SecurityDashboard';

const SecurityPage: React.FC = () => {
  return (
    <ToastProvider>
      <SecurityDashboard />
    </ToastProvider>
  );
};

export default SecurityPage;
