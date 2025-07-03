import React from 'react';
import Head from 'next/head';
import { Bot, Brain, Activity, Target, Zap, Settings, Eye, TrendingUp } from 'lucide-react';

export default function MyDigitalTwin() {
  return (
    <>
      <Head>
        <title>My Digital Twin - Digame</title>
        <meta name="description" content="Your personal AI-powered digital twin dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Digital Twin</h1>
                <p className="text-gray-600">Your AI-powered professional development companion</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Zap className="w-3 h-3 mr-1" />
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Twin Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">Excellent</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">94%</h3>
              <p className="text-gray-600 text-sm">Twin Accuracy</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-blue-600 font-medium">Learning</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">1,247</h3>
              <p className="text-gray-600 text-sm">Data Points</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-purple-600 font-medium">On Track</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">8/10</h3>
              <p className="text-gray-600 text-sm">Goals Progress</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">87.3</h3>
              <p className="text-gray-600 text-sm">Performance Score</p>
            </div>
          </div>

          {/* Twin Interaction Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Chat with Your Twin</h3>
              <div className="bg-gray-50 rounded-lg p-4 h-64 mb-4 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-blue-900">Hello! I've analyzed your recent work patterns. Would you like insights on optimizing your productivity?</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 justify-end">
                    <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-gray-900">Yes, show me the insights</p>
                    </div>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask your digital twin..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  Send
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Twin Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="font-medium text-green-900">Productivity Peak</span>
                  </div>
                  <p className="text-sm text-green-800">Your most productive hours are 9-11 AM. Consider scheduling important tasks during this window.</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Brain className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="font-medium text-blue-900">Learning Opportunity</span>
                  </div>
                  <p className="text-sm text-blue-800">Based on your goals, I recommend focusing on data analysis skills this month.</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Target className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="font-medium text-purple-900">Goal Adjustment</span>
                  </div>
                  <p className="text-sm text-purple-800">You're ahead of schedule on your Q1 objectives. Consider setting more ambitious targets.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Twin Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Twin Configuration</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Observation Mode</h4>
                <p className="text-sm text-gray-600">Continuously learning from your behavior patterns</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">AI Processing</h4>
                <p className="text-sm text-gray-600">Advanced algorithms analyzing your professional data</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Goal Alignment</h4>
                <p className="text-sm text-gray-600">Recommendations aligned with your objectives</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}