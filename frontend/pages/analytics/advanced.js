import React from 'react';
import Head from 'next/head';
import { TrendingUp, BarChart3, PieChart, Activity, Target } from 'lucide-react';

export default function AdvancedAnalytics() {
  return (
    <>
      <Head>
        <title>Advanced Analytics - Digame</title>
        <meta name="description" content="Advanced analytics dashboard with deep insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-600">Deep insights and advanced analytics dashboard</p>
              </div>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+24.5%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">$127K</h3>
              <p className="text-gray-600 text-sm">Revenue Growth</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+12.8%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">89.2%</h3>
              <p className="text-gray-600 text-sm">Goal Completion</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-blue-600 font-medium">+7.3%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">94.7%</h3>
              <p className="text-gray-600 text-sm">User Satisfaction</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+18.9%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">73.4%</h3>
              <p className="text-gray-600 text-sm">Conversion Rate</p>
            </div>
          </div>

          {/* Advanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Advanced revenue trend chart</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Behavior Flow</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">User behavior flow visualization</p>
              </div>
            </div>
          </div>

          {/* Cohort Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Cohort</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Users</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Week 1</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Week 2</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Week 4</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Week 8</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Jan 2025</td>
                    <td className="py-3 px-4 text-gray-900">1,234</td>
                    <td className="py-3 px-4 text-green-600">85%</td>
                    <td className="py-3 px-4 text-green-600">72%</td>
                    <td className="py-3 px-4 text-yellow-600">58%</td>
                    <td className="py-3 px-4 text-red-600">42%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Dec 2024</td>
                    <td className="py-3 px-4 text-gray-900">1,567</td>
                    <td className="py-3 px-4 text-green-600">82%</td>
                    <td className="py-3 px-4 text-green-600">69%</td>
                    <td className="py-3 px-4 text-yellow-600">55%</td>
                    <td className="py-3 px-4 text-red-600">38%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Predictive Insights */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">AI-Powered Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Predicted Growth</h4>
                <p className="text-blue-100">Based on current trends, expect 32% growth in user engagement next quarter.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Optimization Opportunity</h4>
                <p className="text-blue-100">Improving mobile experience could increase conversion by 15%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}