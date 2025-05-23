import React, { useState } from 'react';

export default function HomePage({ onDemoAccess, onLogin }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleGetStarted = () => {
    setShowOnboarding(true);
  };

  const handleDemoClick = () => {
    onDemoAccess();
    window.location.href = '/dashboard';
  };

  const handleSignUp = () => {
    // In a real app, this would open a registration form
    alert('Registration coming soon! For now, try the demo.');
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Digame</span>
            </div>
            <button 
              onClick={() => setShowOnboarding(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </div>

          {/* Onboarding Content */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your Experience
              </h1>
              <p className="text-xl text-gray-600">
                Explore Digame with our interactive demo or create your personal digital twin
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Demo Option */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Try the Demo</h3>
                  <p className="text-gray-600">
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
                    <span className="text-gray-700">No registration required</span>
                  </div>
                </div>

                <button
                  onClick={handleDemoClick}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Launch Demo Dashboard
                </button>
              </div>

              {/* Sign Up Option */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Your Twin</h3>
                  <p className="text-gray-600">
                    Build your personal digital professional twin with your own data and insights
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Personal data tracking and analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Custom behavioral models</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Career development planning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Enterprise-grade security</span>
                  </div>
                </div>

                <button
                  onClick={handleSignUp}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Create Account
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Free 30-day trial • No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Digame</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
          </div>
          <button
            onClick={handleGetStarted}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Digital
            <span className="text-blue-600"> Professional Twin</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Unlock your professional potential with AI-powered behavioral analysis, 
            predictive insights, and personalized career development recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Start Your Journey
            </button>
            <button
              onClick={handleDemoClick}
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              Try Demo
            </button>
          </div>

          {/* Hero Image/Demo Preview */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-500 ml-4">Digame Dashboard Preview</span>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">87%</div>
                    <div className="text-sm text-gray-600">Productivity Score</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">6.2h</div>
                    <div className="text-sm text-gray-600">Focus Time</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">+12%</div>
                    <div className="text-sm text-gray-600">Growth</div>
                  </div>
                </div>
                <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">📊 Interactive Productivity Chart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Professional Growth
            </h2>
            <p className="text-xl text-gray-600">
              Advanced AI and machine learning to understand and optimize your professional life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Behavioral Analysis</h3>
              <p className="text-gray-600">
                Advanced ML algorithms analyze your work patterns and identify optimization opportunities
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔮</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Predictive Insights</h3>
              <p className="text-gray-600">
                Get personalized predictions about your career trajectory and skill development
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Goal Achievement</h3>
              <p className="text-gray-600">
                Set and track professional goals with AI-powered recommendations and progress monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Professional Life?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who are already using their digital twins to accelerate their careers
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Get Started Today
          </button>
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