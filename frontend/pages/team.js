import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Users, MessageSquare, BarChart3, Settings, Calendar, Target } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function TeamHub() {
  const teamFeatures = [
    {
      title: 'Team Dashboard',
      description: 'Comprehensive team performance overview',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/team/dashboard',
      color: 'blue'
    },
    {
      title: 'Team Collaboration',
      description: 'Enhanced collaboration tools and features',
      icon: <Users className="w-6 h-6" />,
      path: '/team/collaboration',
      color: 'purple'
    },
    {
      title: 'Team Communication',
      description: 'Streamlined team communication channels',
      icon: <MessageSquare className="w-6 h-6" />,
      path: '/team/communication',
      color: 'green'
    },
    {
      title: 'Team Goals',
      description: 'Shared goal setting and tracking',
      icon: <Target className="w-6 h-6" />,
      path: '/team/goals',
      color: 'orange'
    },
    {
      title: 'Team Calendar',
      description: 'Shared scheduling and event management',
      icon: <Calendar className="w-6 h-6" />,
      path: '/team/calendar',
      color: 'indigo'
    },
    {
      title: 'Team Settings',
      description: 'Configure team preferences and permissions',
      icon: <Settings className="w-6 h-6" />,
      path: '/team/settings',
      color: 'teal'
    }
  ];

  return (
    <>
      <Head>
        <title>Team Hub - Digame</title>
        <meta name="description" content="Comprehensive team collaboration and management tools" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Team Hub</h1>
                  <p className="text-sm text-gray-600">Comprehensive team collaboration and management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Team Features</h2>
              <p className="text-lg text-pink-100">
                Enhance team collaboration and productivity with powerful team management tools. 
                Foster better communication, track shared goals, and optimize team performance.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamFeatures.map((feature, index) => (
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

          {/* Team Stats */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">6</div>
                <div className="text-sm text-gray-600">Team Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">∞</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-gray-600">Collaboration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">AI</div>
                <div className="text-sm text-gray-600">Team Insights</div>
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