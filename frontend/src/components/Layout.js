import React from 'react';
import DashboardLayout from './layout/DashboardLayout';

const Layout = ({ children, isDemoMode, currentUser, onLogout }) => {
  return (
    <DashboardLayout
      isDemoMode={isDemoMode}
      currentUser={currentUser}
      onLogout={onLogout}
    >
      {children}
    </DashboardLayout>
  );
};

export default Layout;