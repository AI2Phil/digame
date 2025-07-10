import React from 'react';
import DashboardLayout from './layout/DashboardLayout';

const Layout = ({ children }) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default Layout;