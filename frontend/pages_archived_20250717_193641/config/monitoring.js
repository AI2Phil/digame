import React from 'react';
import DashboardLayout from '../../src/components/layout/DashboardLayout';
import SystemConfigurationDashboard from '../../src/components/settings/SystemConfigurationDashboard';

// Configuration Monitoring - extracted view from SystemConfigurationDashboard
export default function ConfigurationMonitoring() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration Monitoring</h1>
              <p className="text-gray-600">Monitor configuration changes and system health</p>
            </div>
            
            {/* For now, render the full dashboard - will be extracted later */}
            <SystemConfigurationDashboard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}