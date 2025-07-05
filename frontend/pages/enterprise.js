import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Building2, Users, Shield, BarChart3, Settings, Globe } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function EnterpriseHub() {
  const enterpriseFeatures = [
    {
      title: 'Organization Management',
      description: 'Comprehensive enterprise organization tools',
      icon: <Building2 className="w-6 h-6" />,
      path: '/enterprise/organization',
      color: 'blue'
    },
    {
      title: 'Team Management',
      description: 'Advanced team coordination and management',
      icon: <Users className="w-6 h-6" />,
      path: '/enterprise/teams',
      color: 'green'
    },
    {
      title: 'Enterprise Security',
      description: 'Advanced security and compliance features',
      icon: <Shield className="w-6 h-6" />,
      path: '/enterprise/security',
      color: 'purple'
    },
    {
      title: 'Enterprise Analytics',
      description: 'Organization-wide analytics and insights',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/enterprise/analytics',
      color: 'orange'
    },
    {
      title: 'Global Operations',
      description: 'Multi-region and global deployment tools',
      icon: <Globe className="w-6 h-6" />,
      path: '/enterprise/global',
      color: 'indigo'
    },
    {
      title: 'Enterprise Settings',
      description: 'Organization-wide configuration and policies',
      icon: <Settings className="w-6 h-6" />,
      path: '/enterprise/settings',
      color: 'teal'
    }
  ];

  return (
    <>
      <Head>
        <title>Enterprise Hub - Digame</title>
        <meta name="description" content="Enterprise-grade features and management tools" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Enterprise Hub</h1>
                  <p className="text-sm text-gray-600">Enterprise-grade features and management tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Enterprise Features</h2>
              <p className="text-lg text-red-100">
                Scale your organization with enterprise-grade tools and features. 
                Manage teams, ensure security, and drive organizational success at scale.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterpriseFeatures.map((feature, index) => (
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

          {/* Enterprise Stats */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Enterprise Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">6</div>
                <div className="text-sm text-gray-600">Enterprise Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">∞</div>
                <div className="text-sm text-gray-600">Scalability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Global</div>
                <div className="text-sm text-gray-600">Deployment</div>
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