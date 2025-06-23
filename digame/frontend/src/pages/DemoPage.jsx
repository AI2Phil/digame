import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import demoService from '../services/demoService';

export default function DemoPage({ onDemoAccess }) {
  const [selectedDemo, setSelectedDemo] = useState(null);
  const navigate = useNavigate();

  const handleDemoSelect = (demoType) => {
    setSelectedDemo(demoType);
    // Enable demo mode
    demoService.setDemoMode(true);
    if (onDemoAccess) {
      onDemoAccess();
    }
    
    if (demoType === 'guided') {
      // For guided tour, navigate to onboarding wizard
      navigate('/onboarding');
    } else {
      // For interactive demo, go directly to dashboard
      navigate('/dashboard');
    }
  };

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
            <Link to="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
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

      {/* Demo Selection */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="text-blue-600"> Demo Experience</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore Digame with our interactive demo or see how your digital twin works
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Interactive Demo */}
          <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Dashboard</h3>
                <p className="text-gray-600 mb-6">
                  Experience the full platform with sample data and see how your digital twin works
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Interactive productivity dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Behavioral pattern analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Predictive insights and recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">AI-powered coaching suggestions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">No registration required</span>
                </div>
              </div>

              <Button
                onClick={() => handleDemoSelect('interactive')}
                variant="primary"
                size="lg"
                className="w-full"
                icon="🚀"
              >
                Launch Interactive Demo
              </Button>
            </CardContent>
          </Card>

          {/* Guided Tour */}
          <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Guided Tour</h3>
                <p className="text-gray-600 mb-6">
                  Take a step-by-step tour through all features with explanations and examples
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Step-by-step feature walkthrough</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Detailed explanations and tooltips</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Real-world use case examples</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Personalized recommendations preview</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Perfect for first-time users</span>
                </div>
              </div>

              <Button
                onClick={() => handleDemoSelect('guided')}
                variant="outline"
                size="lg"
                className="w-full"
                icon="🎯"
              >
                Start Guided Tour
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Demo Features Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What You'll Experience in the Demo
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Live Analytics</h4>
              <p className="text-sm text-gray-600">See real-time productivity metrics and behavioral insights</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Recommendations</h4>
              <p className="text-sm text-gray-600">Experience personalized AI coaching and suggestions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Goal Tracking</h4>
              <p className="text-sm text-gray-600">See how goal setting and progress tracking works</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl p-12 text-center mt-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Own Digital Twin?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            After exploring the demo, sign up to start building your personalized professional twin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="secondary" size="xl" icon="⚡" className="bg-white text-blue-600 hover:bg-gray-50">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="xl" icon="💎" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Pricing
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