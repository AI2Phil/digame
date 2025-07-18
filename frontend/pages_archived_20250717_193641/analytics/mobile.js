import React from 'react';
import { ToastProvider } from '../../src/components/ui/Toast';
import MobileAnalyticsSection from '../../src/components/analytics/MobileAnalyticsSection';

const MobileAnalyticsPage = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mobile Analytics</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Comprehensive mobile application performance, user engagement, and platform analytics.
            </p>
          </div>
          
          <MobileAnalyticsSection />
        </div>
      </div>
    </ToastProvider>
  );
};

export default MobileAnalyticsPage;