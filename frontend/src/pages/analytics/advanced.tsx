import React from 'react';
import Head from 'next/head';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

export default function AdvancedAnalytics() {
  return (
    <>
      <Head>
        <title>Advanced Analytics - Digame</title>
        <meta name="description" content="Advanced analytics dashboard with ML-powered insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-600">ML-powered insights and predictive analytics</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+24.3%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">94.2%</h3>
              <p className="text-gray-600 text-sm">Prediction Accuracy</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-blue-600 font-medium">Real-time</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">1,247</h3>
              <p className="text-gray-600 text-sm">Active ML Models</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-orange-600 font-medium">+18.7%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">2.3ms</h3>
              <p className="text-gray-600 text-sm">Avg. Processing Time</p>
            </div>
          </div>

          {/* Advanced Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Trends</h3>
              <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-500">ML-powered trend analysis</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Anomaly Detection</h3>
              <div className="h-64 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-red-400 mx-auto mb-2" />
                  <p className="text-gray-500">Real-time anomaly monitoring</p>
                </div>
              </div>
            </div>
          </div>

          {/* ML Model Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ML Model Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Model</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Accuracy</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Latency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">User Behavior Prediction</td>
                    <td className="py-3 px-4 text-green-600 font-medium">96.8%</td>
                    <td className="py-3 px-4 text-gray-600">1.2ms</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">Churn Prediction</td>
                    <td className="py-3 px-4 text-green-600 font-medium">94.2%</td>
                    <td className="py-3 px-4 text-gray-600">2.1ms</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">Revenue Forecasting</td>
                    <td className="py-3 px-4 text-green-600 font-medium">92.5%</td>
                    <td className="py-3 px-4 text-gray-600">3.4ms</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Training</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}