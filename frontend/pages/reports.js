import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FileText, BarChart3, Download, Calendar, Share } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function ReportsHub() {
  const reportsFeatures = [
    {
      title: 'Custom Reports',
      description: 'Create and customize detailed reports',
      icon: <FileText className="w-6 h-6" />,
      path: '/reports/custom',
      color: 'blue'
    },
    {
      title: 'Analytics Reports',
      description: 'Comprehensive analytics and insights reports',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/reports/analytics',
      color: 'green'
    },
    {
      title: 'Scheduled Reports',
      description: 'Automated report generation and delivery',
      icon: <Calendar className="w-6 h-6" />,
      path: '/reports/scheduled',
      color: 'purple'
    },
    {
      title: 'Export & Publishing',
      description: 'Export reports in multiple formats',
      icon: <Download className="w-6 h-6" />,
      path: '/reports/export',
      color: 'orange'
    },
    {
      title: 'Report Sharing',
      description: 'Share reports with teams and stakeholders',
      icon: <Share className="w-6 h-6" />,
      path: '/reports/sharing',
      color: 'indigo'
    }
  ];

  return (
    <>
      <Head>
        <title>Reports Hub - Digame</title>
        <meta name="description" content="Comprehensive reporting and content publishing tools" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  ← Back to Dashboard
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Reports Hub</h1>
                  <p className="text-sm text-gray-600">Comprehensive reporting and content publishing</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Reports & Publishing Features</h2>
              <p className="text-lg text-emerald-100">
                Generate comprehensive reports and publish content with powerful reporting tools. 
                Create custom reports, schedule deliveries, and share insights across your organization.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportsFeatures.map((feature, index) => (
              <Link key={index} href={feature.path}>
                <div className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-${feature.color}-200`}>
                  <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Reports Stats */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Reports Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">5</div>
                <div className="text-sm text-gray-600">Report Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">∞</div>
                <div className="text-sm text-gray-600">Custom Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Auto</div>
                <div className="text-sm text-gray-600">Scheduling</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Multi</div>
                <div className="text-sm text-gray-600">Format Export</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Hub Footer */}
        <NavigationHubFooter />
      </div>
    </>
  );
}