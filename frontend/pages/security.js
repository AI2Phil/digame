import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Shield, Lock, Eye, AlertTriangle, FileCheck } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function SecurityHub() {
  const securityFeatures = [
    {
      title: 'Access Control',
      description: 'Advanced user access and permission management',
      icon: <Lock className="w-6 h-6" />,
      path: '/security/access',
      color: 'blue'
    },
    {
      title: 'Security Monitoring',
      description: 'Real-time security monitoring and alerts',
      icon: <Eye className="w-6 h-6" />,
      path: '/security/monitoring',
      color: 'green'
    },
    {
      title: 'Threat Detection',
      description: 'AI-powered threat detection and prevention',
      icon: <AlertTriangle className="w-6 h-6" />,
      path: '/security/threats',
      color: 'purple'
    },
    {
      title: 'Compliance Management',
      description: 'Regulatory compliance and audit tools',
      icon: <FileCheck className="w-6 h-6" />,
      path: '/security/compliance',
      color: 'orange'
    },
    {
      title: 'Security Policies',
      description: 'Configure and manage security policies',
      icon: <Shield className="w-6 h-6" />,
      path: '/security/policies',
      color: 'indigo'
    }
  ];

  return (
    <>
      <Head>
        <title>Security Hub - Digame</title>
        <meta name="description" content="Comprehensive security and compliance management tools" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Security Hub</h1>
                  <p className="text-sm text-gray-600">Comprehensive security and compliance management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Security Features</h2>
              <p className="text-lg text-gray-100">
                Protect your organization with comprehensive security tools and compliance management. 
                Monitor threats, manage access, and ensure regulatory compliance.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
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

          {/* Security Stats */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">5</div>
                <div className="text-sm text-gray-600">Security Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-sm text-gray-600">Security Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">AI</div>
                <div className="text-sm text-gray-600">Threat Detection</div>
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