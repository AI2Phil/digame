import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { BarChart3, TrendingUp, Activity, PieChart, LineChart, Users, Clock, Target } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function AnalyticsHub() {
  const analyticsFeatures = [
    {
      title: 'Web Analytics',
      description: 'Comprehensive web traffic and user behavior analysis',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/analytics/web',
      color: 'blue'
    },
    {
      title: 'Performance Analytics',
      description: 'Track and analyze your productivity metrics',
      icon: <TrendingUp className="w-6 h-6" />,
      path: '/analytics/performance',
      color: 'green'
    },
    {
      title: 'Behavioral Analytics',
      description: 'Deep insights into work patterns and habits',
      icon: <Activity className="w-6 h-6" />,
      path: '/analytics/behavioral',
      color: 'purple'
    },
    {
      title: 'Team Analytics',
      description: 'Collaborative performance and team dynamics',
      icon: <Users className="w-6 h-6" />,
      path: '/analytics/team',
      color: 'orange'
    },
    {
      title: 'Time Analytics',
      description: 'Time tracking and productivity optimization',
      icon: <Clock className="w-6 h-6" />,
      path: '/analytics/time',
      color: 'indigo'
    },
    {
      title: 'Goal Analytics',
      description: 'Progress tracking and achievement metrics',
      icon: <Target className="w-6 h-6" />,
      path: '/analytics/goals',
      color: 'teal'
    },
    {
      title: 'Custom Dashboards',
      description: 'Build personalized analytics dashboards',
      icon: <PieChart className="w-6 h-6" />,
      path: '/analytics/custom',
      color: 'pink'
    },
    {
      title: 'Predictive Analytics',
      description: 'AI-powered forecasting and trend analysis',
      icon: <LineChart className="w-6 h-6" />,
      path: '/analytics/predictive',
      color: 'cyan'
    }
  ];

  return (
    <>
      <Head>
        <title>Analytics Hub - Digame</title>
        <meta name="description" content="Comprehensive analytics and AI-powered insights for professional growth" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Analytics Hub</h1>
                  <p className="text-sm text-gray-600">Comprehensive analytics and AI-powered insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Analytics & AI Features</h2>
              <p className="text-lg text-purple-100">
                Unlock powerful insights with our comprehensive analytics suite. Track performance, 
                analyze behavior, and get AI-powered recommendations to optimize your professional growth.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {analyticsFeatures.map((feature, index) => (
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

          {/* Quick Stats */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">9</div>
                <div className="text-sm text-gray-600">Analytics Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-gray-600">Real-time Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">AI</div>
                <div className="text-sm text-gray-600">Powered Insights</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">∞</div>
                <div className="text-sm text-gray-600">Custom Dashboards</div>
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