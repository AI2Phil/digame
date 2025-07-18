import React from 'react';
import AIMLDashboard from '../../components/ai/AIMLDashboard';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AIMLDashboardPage = ({ isDemoMode = false, onLogout }) => {
  return (
    <DashboardLayout isDemoMode={isDemoMode} onLogout={onLogout} title="AI & ML Dashboard">
      <AIMLDashboard />
    </DashboardLayout>
  );
};

export default AIMLDashboardPage;
