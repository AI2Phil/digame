import React from 'react';
import Layout from '../../src/components/layout/Layout';
import SystemConfigurationDashboard from '../../src/components/settings/SystemConfigurationDashboard';

// Configuration Backups - extracted view from SystemConfigurationDashboard
export default function ConfigurationBackups() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration Backups</h1>
              <p className="text-gray-600">Manage configuration backups and restore points</p>
            </div>
            
            {/* For now, render the full dashboard - will be extracted later */}
            <SystemConfigurationDashboard />
          </div>
        </div>
      </div>
    </Layout>
  );
}