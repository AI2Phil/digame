import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Shield, Users, Settings, BarChart3, Database } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function AdminHub() {
  const adminFeatures = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <Users className="w-6 h-6" />,
      path: '/admin/users',
      color: 'blue'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: <Settings className="w-6 h-6" />,
      path: '/admin/settings',
      color: 'purple'
    },
    {
      title: 'Security & Compliance',
      description: 'Security policies and compliance management',
      icon: <Shield className="w-6 h-6" />,
      path: '/admin/security',
      color: 'green'
    },
    {
      title: 'Analytics Dashboard',
      description: 'System-wide analytics and reporting',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/admin/analytics',
      color: 'orange'
    },
    {
      title: 'Data Management',
      description: 'Database and data management tools',
      icon: <Database className="w-6 h-6" />,
      path: '/admin/data',
      color: 'indigo'
    }
  ];

  return (
    <>
      <Head>
        <title>Admin Hub - Digame</title>
        <meta name="description" content="Administrative tools and system management" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Admin Hub</h1>
                  <p className="text-sm text-gray-600">Administrative tools and system management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Administration Features</h2>
              <p className="text-lg text-slate-100">
                Comprehensive administrative tools for system management, user control, 
                and security oversight. Maintain optimal system performance and compliance.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature, index) => (
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

          {/* Admin Stats */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">5</div>
                <div className="text-sm text-gray-600">Admin Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Secure</div>
                <div className="text-sm text-gray-600">Infrastructure</div>
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