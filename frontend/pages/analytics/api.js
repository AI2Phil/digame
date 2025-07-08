import React from 'react';
import { ToastProvider } from '../../src/components/ui/Toast';
import ApiAnalyticsSection from '../../src/components/analytics/ApiAnalyticsSection';

const ApiAnalyticsPage = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <ApiAnalyticsSection />
        </div>
      </div>
    </ToastProvider>
  );
};

export default ApiAnalyticsPage;