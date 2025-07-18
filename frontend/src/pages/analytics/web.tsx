import React from 'react';
import Head from 'next/head';
import { Globe, TrendingUp, Users, Eye, Clock } from 'lucide-react';

export default function WebAnalytics() {
  return (
    <>
      <Head>
        <title>Web Analytics - Digame</title>
        <meta name="description" content="Web usage analytics and insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Web Analytics</h1>
                <p className="text-gray-600">Comprehensive web usage analytics and insights</p>
              </div>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">24,567</h3>
              <p className="text-gray-600 text-sm">Total Visitors</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">89,234</h3>
              <p className="text-gray-600 text-sm">Page Views</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-red-600 font-medium">-2.1%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">3:42</h3>
              <p className="text-gray-600 text-sm">Avg. Session Duration</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+15.3%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">68.5%</h3>
              <p className="text-gray-600 text-sm">Bounce Rate</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Overview</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Traffic chart will be rendered here</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">/dashboard</span>
                  <span className="text-gray-900 font-medium">12,345 views</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">/analytics</span>
                  <span className="text-gray-900 font-medium">8,901 views</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">/profile</span>
                  <span className="text-gray-900 font-medium">6,789 views</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">/settings</span>
                  <span className="text-gray-900 font-medium">4,567 views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
