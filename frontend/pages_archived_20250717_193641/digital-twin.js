import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Bot, Brain, Target, Users, Settings, BarChart3, Zap } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function DigitalTwinHub() {
  const digitalTwinFeatures = [
    {
      title: 'My Digital Twin',
      description: 'Your personalized AI professional twin',
      icon: <Bot className="w-6 h-6" />,
      path: '/digital-twin/my-twin',
      color: 'blue'
    },
    {
      title: 'Twin Analytics',
      description: 'Deep insights from your digital twin data',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/digital-twin/analytics',
      color: 'purple'
    },
    {
      title: 'Behavioral Modeling',
      description: 'AI-powered behavior pattern analysis',
      icon: <Brain className="w-6 h-6" />,
      path: '/digital-twin/behavioral',
      color: 'green'
    },
    {
      title: 'Goal Optimization',
      description: 'AI-driven goal setting and achievement',
      icon: <Target className="w-6 h-6" />,
      path: '/digital-twin/goals',
      color: 'orange'
    },
    {
      title: 'Team Twin Collaboration',
      description: 'Collaborative digital twin insights',
      icon: <Users className="w-6 h-6" />,
      path: '/digital-twin/team',
      color: 'indigo'
    },
    {
      title: 'Twin Configuration',
      description: 'Customize your digital twin settings',
      icon: <Settings className="w-6 h-6" />,
      path: '/digital-twin/config',
      color: 'teal'
    },
    {
      title: 'Performance Optimization',
      description: 'AI recommendations for peak performance',
      icon: <Zap className="w-6 h-6" />,
      path: '/digital-twin/optimization',
      color: 'yellow'
    }
  ];

  return (
    <>
      <Head>
        <title>Digital Twin Hub - Digame</title>
        <meta name="description" content="Your AI-powered digital professional twin for enhanced productivity and growth" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Digital Twin Hub</h1>
                  <p className="text-sm text-gray-600">Your AI-powered digital professional twin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Digital Twin Features</h2>
              <p className="text-lg text-green-100">
                Experience the power of your AI digital twin. Get personalized insights, 
                behavioral analysis, and optimization recommendations tailored to your unique professional profile.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {digitalTwinFeatures.map((feature, index) => (
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

          {/* Twin Status */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Digital Twin Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">94%</div>
                <div className="text-sm text-gray-600">Twin Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">7</div>
                <div className="text-sm text-gray-600">Active Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Learning Mode</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">AI</div>
                <div className="text-sm text-gray-600">Powered Insights</div>
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