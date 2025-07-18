import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Features() {
  return (
    <>
      <Head>
        <title>Features - Digame</title>
        <meta
          name="description"
          content="Discover the powerful features of Digame's digital professional twin platform."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Digame</span>
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/features" className="text-blue-600 font-medium">
                Features
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">
                How it Works
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
            </div>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="text-blue-600"> Professional Growth</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover how Digame's AI-powered platform transforms your professional development
              with cutting-edge behavioral analysis and predictive insights.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Behavioral Analysis */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Behavioral Analysis</h3>
              <p className="text-gray-600 mb-6">
                Advanced machine learning algorithms analyze your work patterns, communication
                styles, and productivity habits to identify optimization opportunities.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Work pattern recognition
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Communication analysis
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Productivity tracking
                </li>
              </ul>
            </div>

            {/* Predictive Insights */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🔮</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Predictive Insights</h3>
              <p className="text-gray-600 mb-6">
                Get personalized predictions about your career trajectory, skill development needs,
                and optimal career moves based on your digital twin.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Career trajectory forecasting
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Skill gap identification
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Opportunity recommendations
                </li>
              </ul>
            </div>

            {/* Goal Achievement */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Goal Achievement</h3>
              <p className="text-gray-600 mb-6">
                Set and track professional goals with AI-powered recommendations, progress
                monitoring, and adaptive strategies for success.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Smart goal setting
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Progress tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Adaptive strategies
                </li>
              </ul>
            </div>

            {/* Real-time Analytics */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Analytics</h3>
              <p className="text-gray-600 mb-6">
                Monitor your professional performance with real-time dashboards, detailed reports,
                and actionable insights.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Live performance dashboards
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Detailed analytics reports
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Custom metrics tracking
                </li>
              </ul>
            </div>

            {/* AI Coaching */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Coaching</h3>
              <p className="text-gray-600 mb-6">
                Receive personalized coaching recommendations, skill development plans, and career
                guidance from your AI coach.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Personalized coaching
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Skill development plans
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Career guidance
                </li>
              </ul>
            </div>

            {/* Team Collaboration */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600 mb-6">
                Enhance team dynamics with collaborative features, shared insights, and team
                performance analytics.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Team performance tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Collaborative insights
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>Shared goal management
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start your journey with Digame today and unlock your professional potential.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg inline-block"
            >
              🚀 Get Started Now
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <span className="text-lg font-bold">Digame</span>
            </div>
            <p className="text-gray-400">
              © 2025 Digame. Your Digital Professional Twin Platform.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
