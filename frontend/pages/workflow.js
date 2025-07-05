import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Workflow, GitBranch, Zap, Settings, Users, BarChart3, Clock } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function WorkflowHub() {
  const workflowFeatures = [
    {
      title: 'Workflow Builder',
      description: 'Create and customize automated workflows',
      icon: <Workflow className="w-6 h-6" />,
      path: '/workflow/builder',
      color: 'blue'
    },
    {
      title: 'Process Automation',
      description: 'Automate repetitive tasks and processes',
      icon: <Zap className="w-6 h-6" />,
      path: '/workflow/automation',
      color: 'purple'
    },
    {
      title: 'Workflow Templates',
      description: 'Pre-built templates for common workflows',
      icon: <GitBranch className="w-6 h-6" />,
      path: '/workflow/templates',
      color: 'green'
    },
    {
      title: 'Team Workflows',
      description: 'Collaborative workflow management',
      icon: <Users className="w-6 h-6" />,
      path: '/workflow/team',
      color: 'orange'
    },
    {
      title: 'Workflow Analytics',
      description: 'Monitor and optimize workflow performance',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/workflow/analytics',
      color: 'indigo'
    },
    {
      title: 'Schedule Management',
      description: 'Time-based workflow scheduling',
      icon: <Clock className="w-6 h-6" />,
      path: '/workflow/schedule',
      color: 'teal'
    },
    {
      title: 'Workflow Settings',
      description: 'Configure workflow preferences and rules',
      icon: <Settings className="w-6 h-6" />,
      path: '/workflow/settings',
      color: 'pink'
    }
  ];

  return (
    <>
      <Head>
        <title>Workflow Hub - Digame</title>
        <meta name="description" content="Powerful workflow automation and process management tools" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Workflow Hub</h1>
                  <p className="text-sm text-gray-600">Powerful workflow automation and process management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Workflow Features</h2>
              <p className="text-lg text-indigo-100">
                Streamline your processes with powerful workflow automation. Build, customize, 
                and optimize workflows to boost productivity and eliminate repetitive tasks.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowFeatures.map((feature, index) => (
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

          {/* Workflow Stats */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Workflow Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">7</div>
                <div className="text-sm text-gray-600">Workflow Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">∞</div>
                <div className="text-sm text-gray-600">Automation Rules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Active Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">AI</div>
                <div className="text-sm text-gray-600">Smart Optimization</div>
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