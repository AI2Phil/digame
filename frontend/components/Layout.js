import React from 'react';
import DashboardLayout from '../src/components/layout/DashboardLayout';

const Layout = ({ children }) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default Layout;