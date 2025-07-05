import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Plug, Zap, Settings, Globe, Code, Database } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function IntegrationHub() {
  const integrationFeatures = [
    {
      title: 'API Management',
      description: 'Comprehensive API integration and management',
      icon: <Code className="w-6 h-6" />,
      path: '/integration/api',
      color: 'blue'
    },
    {
      title: 'Third-party Integrations',
      description: 'Connect with popular third-party services',
      icon: <Plug className="w-6 h-6" />,
      path: '/integration/third-party',
      color: 'green'
    },
    {
      title: 'Automation Workflows',
      description: 'Automated integration workflows and triggers',
      icon: <Zap className="w-6 h-6" />,
      path: '/integration/automation',
      color: 'purple'
    },
    {
      title: 'Data Synchronization',
      description: 'Real-time data sync across platforms',
      icon: <Database className="w-6 h-6" />,
      path: '/integration/sync',
      color: 'orange'
    },
    {
      title: 'Webhook Management',
      description: 'Configure and manage webhooks',
      icon: <Globe className="w-6 h-6" />,
      path: '/integration/webhooks',
      color: 'indigo'
    },
    {
      title: 'Integration Settings',
      description: 'Configure integration preferences and security',
      icon: <Settings className="w-6 h-6" />,
      path: '/integration/settings',
      color: 'teal'
    }
  ];

  return (
    <>
      <Head>
        <title>Integration Hub - Digame</title>
        <meta name="description" content="System integrations and API management tools" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Integration Hub</h1>
                  <p className="text-sm text-gray-600">System integrations and API management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Integration & API Features</h2>
              <p className="text-lg text-violet-100">
                Connect and integrate with external systems seamlessly. Manage APIs, 
                automate workflows, and synchronize data across your entire technology stack.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationFeatures.map((feature, index) => (
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

          {/* Integration Stats */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Integration Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-600">6</div>
                <div className="text-sm text-gray-600">Integration Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">∞</div>
                <div className="text-sm text-gray-600">API Endpoints</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Real-time</div>
                <div className="text-sm text-gray-600">Data Sync</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Auto</div>
                <div className="text-sm text-gray-600">Workflows</div>
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