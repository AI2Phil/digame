import React from 'react';
import DashboardLayout from '../../src/components/layout/DashboardLayout';
import SocialDashboard from '../../src/components/social/SocialDashboard.tsx';

export default function SocialIndex() {
  return (
    <DashboardLayout>
      <SocialDashboard />
    </DashboardLayout>
  );
}