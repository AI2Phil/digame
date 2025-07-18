import React from 'react';
import DashboardLayout from '../../src/components/layout/DashboardLayout';
import SocialDashboard from '../../src/components/social/SocialDashboard.tsx';

export default const SocialIndex: React.FC = () => {
  return (
    <DashboardLayout>
      <SocialDashboard />
    </DashboardLayout>
  );
}