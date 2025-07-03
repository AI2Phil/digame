import React from 'react';
import Head from 'next/head';
import { Brain, Eye, Target, Activity, Zap } from 'lucide-react';

export default function BehavioralAnalytics() {
  return (
    <>
      <Head>
        <title>Behavioral Analytics - Digame</title>
        <meta name="description" content="AI-powered behavioral analysis and user insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Behavioral Analytics</h1>
                <p className="text-gray-600">AI-powered user behavior analysis and insights</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <Zap className="w-3 h-3 mr-1" />
                  AI-POWERED
                </span>
              </div>
            </div>
          </div>

          {/* Behavior Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+15.2%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">87.3%</h3>
              <p className="text-gray-600 text-sm">Engagement Score</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+8.7%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">92.1%</h3>
              <p className="text-gray-600 text-sm">Task Completion</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-blue-600 font-medium">+12.4%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">6.8</h3>
              <p className="text-gray-600 text-sm">Interaction Depth</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+22.1%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">94.5%</h3>
              <p className="text-gray-600 text-sm">Prediction Accuracy</p>
            </div>
          </div>

          {/* Behavior Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Journey Heatmap</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Interactive user journey heatmap</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavior Clusters</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">Power Users</div>
                    <div className="text-sm text-blue-700">High engagement, frequent usage</div>
                  </div>
                  <div className="text-blue-900 font-bold">23%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">Regular Users</div>
                    <div className="text-sm text-green-700">Consistent usage patterns</div>
                  </div>
                  <div className="text-green-900 font-bold">45%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-medium text-yellow-900">Casual Users</div>
                    <div className="text-sm text-yellow-700">Sporadic engagement</div>
                  </div>
                  <div className="text-yellow-900 font-bold">32%</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white mb-8">
            <h3 className="text-xl font-semibold mb-4">🤖 AI Behavioral Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">🎯 Engagement Patterns</h4>
                <p className="text-indigo-100">Users show 40% higher engagement during morning hours (8-11 AM). Consider scheduling important notifications during this window.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔄 Usage Optimization</h4>
                <p className="text-indigo-100">Feature adoption increases by 65% when introduced through guided tutorials rather than discovery.</p>
              </div>
            </div>
          </div>

          {/* Behavioral Trends */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Trend Analysis</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Behavioral trends over time visualization</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}