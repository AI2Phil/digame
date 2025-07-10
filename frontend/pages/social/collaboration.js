import React from 'react';
import DashboardLayout from '../../src/components/layout/DashboardLayout';
import SocialCollaborationDashboard from '../../src/components/social/SocialCollaborationDashboard';

export default function SocialCollaborationPage() {
  return (
    <DashboardLayout>
      <SocialCollaborationDashboard />
    </DashboardLayout>
  );
}