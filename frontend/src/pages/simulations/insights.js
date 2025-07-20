import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function SimulationInsightsPage() {
  return (
    <>
      <Head>
        <title>Simulation Insights - Digame</title>
        <meta name="description" content="Advanced simulation insights and analytics" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Simulation Insights</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Key Metrics */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Predictions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Productivity Forecast</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">+15%</div>
                    <p className="text-blue-700 text-sm">Expected improvement over next quarter</p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-green-900 mb-2">Goal Achievement</h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">87%</div>
                    <p className="text-green-700 text-sm">Probability of meeting targets</p>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-purple-900 mb-2">Efficiency Score</h3>
                    <div className="text-3xl font-bold text-purple-600 mb-2">8.4/10</div>
                    <p className="text-purple-700 text-sm">Current workflow efficiency</p>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-orange-900 mb-2">Risk Factor</h3>
                    <div className="text-3xl font-bold text-orange-600 mb-2">Low</div>
                    <p className="text-orange-700 text-sm">Burnout and stress indicators</p>
                  </div>
                </div>

                {/* Simulation Results */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white rounded border">
                      <div>
                        <h4 className="font-medium text-gray-900">Current Trajectory</h4>
                        <p className="text-sm text-gray-600">Maintaining current work patterns</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">Baseline</div>
                        <div className="text-sm text-gray-500">100% reference</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-white rounded border">
                      <div>
                        <h4 className="font-medium text-gray-900">Optimized Schedule</h4>
                        <p className="text-sm text-gray-600">AI-recommended time blocks</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">+23%</div>
                        <div className="text-sm text-gray-500">productivity gain</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-white rounded border">
                      <div>
                        <h4 className="font-medium text-gray-900">Focus Mode</h4>
                        <p className="text-sm text-gray-600">Deep work sessions enabled</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">+18%</div>
                        <div className="text-sm text-gray-500">quality improvement</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="font-medium text-blue-900">Run New Simulation</div>
                      <div className="text-sm text-blue-700">Test different scenarios</div>
                    </button>
                    
                    <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <div className="font-medium text-green-900">Apply Recommendations</div>
                      <div className="text-sm text-green-700">Implement suggested changes</div>
                    </button>
                    
                    <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                      <div className="font-medium text-purple-900">Export Report</div>
                      <div className="text-sm text-purple-700">Download detailed analysis</div>
                    </button>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Simulations</h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Q1 Planning Scenario</div>
                      <div className="text-gray-500">2 hours ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Team Collaboration Model</div>
                      <div className="text-gray-500">1 day ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Workload Optimization</div>
                      <div className="text-gray-500">3 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}