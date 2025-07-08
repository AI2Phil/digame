import React from 'react';
import { ToastProvider } from '../../src/components/ui/ToastProvider';
import SecurityDashboard from '../../src/components/security/SecurityDashboard';

const SecurityPage = () => {
  return (
    <ToastProvider>
      <SecurityDashboard />
    </ToastProvider>
  );
};

export default SecurityPage;