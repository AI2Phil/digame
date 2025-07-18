import React from 'react';
import Link from 'next/link';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function HowItWorksPage() {
  return (
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
            <Link href="/FeaturesPage" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/HowItWorksPage" className="text-blue-600 font-semibold">How it Works</Link>
            <Link href="/PricingPage" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          </div>
          <Link href="/">
            <Button variant="primary" size="md" icon="🚀">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            How Your Digital Twin
            <span className="text-blue-600"> Works</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover how Digame creates your professional digital twin in just a few simple steps
          </p>
        </div>

        {/* Process Steps */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Collection</h3>
                <p className="text-gray-600 mb-6">
                  Connect your productivity tools and let Digame securely analyze your work patterns, 
                  communication style, and professional behaviors.
                </p>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    Calendar integration
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    Email analysis
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    Task management sync
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    Communication patterns
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis</h3>
                <p className="text-gray-600 mb-6">
                  Our advanced machine learning algorithms process your data to identify patterns, 
                  strengths, and opportunities for professional growth.
                </p>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    Behavioral pattern recognition
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    Productivity optimization
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    Skill gap identification
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    Career trajectory modeling
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Personalized Insights</h3>
                <p className="text-gray-600 mb-6">
                  Receive actionable recommendations, predictive insights, and personalized coaching 
                  to accelerate your professional development.
                </p>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-purple-500 mr-2">•</span>
                    Custom recommendations
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-500 mr-2">•</span>
                    Goal tracking
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-500 mr-2">•</span>
                    Progress monitoring
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-500 mr-2">•</span>
                    Career coaching
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Powered by Advanced Technology
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Machine Learning</h4>
              <p className="text-sm text-gray-600">Advanced ML algorithms for pattern recognition and prediction</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Privacy First</h4>
              <p className="text-sm text-gray-600">End-to-end encryption and GDPR compliance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Processing</h4>
              <p className="text-sm text-gray-600">Instant insights and continuous learning</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Seamless Integration</h4>
              <p className="text-sm text-gray-600">Works with 100+ productivity and collaboration tools</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What You'll Achieve
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Growth</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Identify and develop key skills for career advancement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Receive personalized coaching recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Track progress toward professional goals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Predict and prepare for career opportunities</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Productivity Optimization</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Optimize your daily work patterns and habits</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Improve focus time and reduce distractions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Enhance communication effectiveness</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">Balance workload and prevent burnout</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does it take to create my digital twin?</h3>
              <p className="text-gray-600">Your initial digital twin is created within 24-48 hours of connecting your first data source. It continues to learn and improve as you use the platform.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my data secure and private?</h3>
              <p className="text-gray-600">Absolutely. We use bank-level encryption, comply with GDPR and SOC 2 standards, and never share your personal data with third parties. You maintain full control over your information.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Which tools and platforms does Digame integrate with?</h3>
              <p className="text-gray-600">Digame integrates with 100+ popular tools including Google Workspace, Microsoft 365, Slack, Zoom, Asana, Trello, and many more. We're constantly adding new integrations.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I customize the insights and recommendations?</h3>
              <p className="text-gray-600">Yes! You can set your professional goals, preferences, and focus areas. The AI adapts its recommendations based on your specific objectives and career aspirations.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Digital Twin?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your journey to professional excellence with AI-powered insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/DemoPage">
              <Button variant="secondary" size="xl" icon="🚀" className="bg-white text-blue-600 hover:bg-gray-50">
                Try Demo
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="xl" icon="⚡" className="border-white text-white hover:bg-white hover:text-blue-600">
                Get Started Free
              </Button>
            </Link>
          </div>
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
  );
}