import React from 'react';
import Head from 'next/head';
import { Smartphone, Battery, Wifi, Download, Upload } from 'lucide-react';

export default function MobileAnalytics() {
  return (
    <>
      <Head>
        <title>Mobile Analytics - Digame</title>
        <meta name="description" content="Mobile app analytics and performance metrics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mobile Analytics</h1>
                <p className="text-gray-600">Mobile app usage patterns and performance metrics</p>
              </div>
            </div>
          </div>

          {/* Mobile Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+18.7%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">15,432</h3>
              <p className="text-gray-600 text-sm">Active Users</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Battery className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+5.2%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">4.2s</h3>
              <p className="text-gray-600 text-sm">App Launch Time</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+22.1%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">2,847</h3>
              <p className="text-gray-600 text-sm">Downloads</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm text-red-600 font-medium">-1.8%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">0.3%</h3>
              <p className="text-gray-600 text-sm">Crash Rate</p>
            </div>
          </div>

          {/* Device and Platform Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">iPhone</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <span className="text-gray-900 font-medium">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Android</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    <span className="text-gray-900 font-medium">35%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">App Performance</h3>
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Performance metrics chart</p>
              </div>
            </div>
          </div>

          {/* User Engagement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">7.2</div>
                <div className="text-gray-600">Sessions per User</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">12:34</div>
                <div className="text-gray-600">Avg Session Duration</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                <div className="text-gray-600">Retention Rate (Day 7)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}