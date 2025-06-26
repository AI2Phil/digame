import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Digame - Your Digital Professional Twin</title>
        <meta name="description" content="Unlock your professional potential with AI-powered behavioral analysis, predictive insights, and personalized career development recommendations." />
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
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              🚀 Get Started
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
              Unlock your professional potential with AI-powered behavioral analysis, predictive insights, and personalized career development recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg">
                🎯 Start Your Journey
              </button>
              <button className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors text-lg">
                🚀 Try Demo
              </button>
            </div>

            {/* Hero Preview */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl mx-auto p-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-500 ml-4">Digame Dashboard Preview</span>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-blue-600">87%</div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">High</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Productivity Score</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-green-600">6.2h</div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">+15%</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Focus Time</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-purple-600">+12%</div>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Trending</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Growth</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '62%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 h-32 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-gray-500 mb-2">📊 Interactive Productivity Chart</span>
                    <div className="w-3/4 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
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
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors text-lg">
              ⚡ Get Started Today
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
    </>
  );
}