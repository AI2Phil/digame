import React from 'react';
import ProductivityChart from './components/dashboard/ProductivityChart';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Digame Professional Dashboard
          </h1>
          <p className="text-gray-600">
            Enhanced with DigitalTwinPro productivity insights
          </p>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productivity Chart - Phase 1 Integration */}
          <div className="lg:col-span-2">
            <ProductivityChart userId={1} />
          </div>
          
          {/* Placeholder for future components */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Activity Breakdown
            </h3>
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📊</div>
              <p>Coming in Phase 1 expansion</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Activities
            </h3>
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📝</div>
              <p>Coming in Phase 1 expansion</p>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-500 mr-3">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900">
                Phase 1 Integration Active
              </h4>
              <p className="text-sm text-blue-700">
                ProductivityChart successfully integrated from DigitalTwinPro. 
                Displaying {'{'}mock data or live Digame behavioral analysis{'}'}.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            Integration Status: ProductivityChart ✅ | 
            API Service ✅ | 
            UI Components ✅ | 
            Backend Connection {'{'}testing{'}'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;