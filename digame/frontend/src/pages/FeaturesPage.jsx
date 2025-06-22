import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Digame</span>
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/features" className="text-blue-600 font-semibold">Features</Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          </div>
          <Link to="/">
            <Button variant="primary" size="md" icon="🚀">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Features Hero */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for 
            <span className="text-blue-600"> Professional Growth</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Advanced AI and machine learning to understand and optimize your professional life
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Behavioral Analysis</h3>
              <p className="text-gray-600 mb-6">
                Advanced ML algorithms analyze your work patterns and identify optimization opportunities
              </p>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Work pattern recognition
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Productivity optimization
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Behavioral insights
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔮</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Predictive Insights</h3>
              <p className="text-gray-600 mb-6">
                Get personalized predictions about your career trajectory and skill development
              </p>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Career trajectory forecasting
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Skill gap analysis
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Market trend predictions
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Goal Achievement</h3>
              <p className="text-gray-600 mb-6">
                Set and track professional goals with AI-powered recommendations and progress monitoring
              </p>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Smart goal setting
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Progress tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Achievement recommendations
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Advanced Capabilities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📊</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h4>
              <p className="text-sm text-gray-600">Live performance monitoring and insights</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Coaching</h4>
              <p className="text-sm text-gray-600">Personalized coaching recommendations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🔗</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Integrations</h4>
              <p className="text-sm text-gray-600">Connect with your favorite tools</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🔒</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Enterprise Security</h4>
              <p className="text-sm text-gray-600">Bank-level security and privacy</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Trusted by Professionals Worldwide
          </h2>
          <p className="text-center text-gray-600 mb-12">
            See how digital twins are transforming careers
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">SC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">Product Manager</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Digame helped me identify productivity patterns I never knew existed. 
                  I've increased my efficiency by 40% in just 3 months."
                </p>
              </CardContent>
            </Card>
            
            <Card className="rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">MR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Marcus Rodriguez</div>
                    <div className="text-sm text-gray-600">Software Engineer</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The predictive insights are incredible. Digame predicted my promotion 
                  6 months before it happened and helped me prepare perfectly."
                </p>
              </CardContent>
            </Card>
            
            <Card className="rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">EW</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Emily Watson</div>
                    <div className="text-sm text-gray-600">Marketing Director</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "My digital twin became my career coach. The personalized recommendations 
                  led to a 60% salary increase within a year."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Professional Life?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who are already using their digital twins to accelerate their careers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/demo">
              <Button variant="secondary" size="xl" icon="🚀" className="bg-white text-blue-600 hover:bg-gray-50">
                Try Demo
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="xl" icon="⚡" className="border-white text-white hover:bg-white hover:text-blue-600">
                Get Started
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