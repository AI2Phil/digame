import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Briefcase, TrendingUp, Target, Users, BookOpen, Award } from 'lucide-react';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';

export default function CareerHub() {
  const careerFeatures = [
    {
      title: 'Career Planning',
      description: 'Strategic career path planning and goal setting',
      icon: <Target className="w-6 h-6" />,
      path: '/career/planning',
      color: 'blue'
    },
    {
      title: 'Skill Development',
      description: 'Identify and develop key professional skills',
      icon: <BookOpen className="w-6 h-6" />,
      path: '/career/skills',
      color: 'green'
    },
    {
      title: 'Performance Tracking',
      description: 'Monitor and analyze career progression',
      icon: <TrendingUp className="w-6 h-6" />,
      path: '/career/performance',
      color: 'purple'
    },
    {
      title: 'Networking',
      description: 'Build and manage professional networks',
      icon: <Users className="w-6 h-6" />,
      path: '/career/networking',
      color: 'orange'
    },
    {
      title: 'Achievements',
      description: 'Track accomplishments and certifications',
      icon: <Award className="w-6 h-6" />,
      path: '/career/achievements',
      color: 'indigo'
    },
    {
      title: 'Career Insights',
      description: 'AI-powered career recommendations',
      icon: <Briefcase className="w-6 h-6" />,
      path: '/career/insights',
      color: 'teal'
    }
  ];

  return (
    <>
      <Head>
        <title>Career Hub - Digame</title>
        <meta name="description" content="Comprehensive career development and professional growth tools" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Career Hub</h1>
                  <p className="text-sm text-gray-600">Comprehensive career development and professional growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg p-8 mb-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">Career Development Features</h2>
              <p className="text-lg text-cyan-100">
                Accelerate your professional growth with comprehensive career development tools. 
                Plan your path, develop skills, and track your progress toward career success.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerFeatures.map((feature, index) => (
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

          {/* Career Stats */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Career Development Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">6</div>
                <div className="text-sm text-gray-600">Career Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">AI</div>
                <div className="text-sm text-gray-600">Powered Insights</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-gray-600">Progress Tracking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-sm text-gray-600">Growth Opportunities</div>
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