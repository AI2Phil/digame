import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { useTranslation } from 'next-i18next';
import { Avatar } from '../components/ui/Avatar';
import AuthForm from '../components/auth/AuthForm';
import { Card, CardContent } from '../components/ui/Card';

export default function HomePage({ onDemoAccess, onLogin }) {
  const { t } = useTranslation('common'); // Assuming 'common' namespace
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleGetStarted = () => {
    setShowOnboarding(true);
  };

  const handleDemoClick = () => {
    router.push('/demo');
  };

  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleSignUp = () => {
    setShowAuthForm(true);
  };

  const handleAuthClose = () => {
    setShowAuthForm(false);
  };

  const handleAuthSuccess = (userData, tokens) => {
    setShowAuthForm(false);
    onLogin(userData, tokens);
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
            <Button variant="link" onClick={() => setShowOnboarding(false)}>
              ← Back
            </Button>
          </div>

          {/* Onboarding Content */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Experience</h1>
              <p className="text-xl text-gray-600">
                Explore Digame with our interactive demo or create your personal digital twin
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Explore Features Option */}
              <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">✨</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Explore Features</h3>
                    <p className="text-gray-600 text-sm">
                      Interactive journey through our complete platform capabilities
                    </p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">100% complete platform tour</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">Role-based recommendations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">Live feature previews</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">No registration needed</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push('/guest-journey')}
                    variant="outline"
                    size="md"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    ✨ Explore Platform
                  </Button>
                </CardContent>
              </Card>

              {/* Demo Option */}
              <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Try the Demo</h3>
                    <p className="text-gray-600">
                      Experience the full platform with sample data and see how your digital twin
                      works
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

                  <Button onClick={handleDemoClick} variant="primary" size="lg" className="w-full">
                    🚀 Launch Demo Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* Sign Up Option */}
              <Card className="rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h3>
                    <p className="text-gray-600">
                      Start building your personal digital twin with real data and personalized
                      insights
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">Personalized digital twin</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">Real-time productivity tracking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">AI-powered career coaching</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">30-day free trial</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push('/auth')}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    🎯 Create Account
                  </Button>
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Free 30-day trial • No credit card required
                  </p>
                </CardContent>
              </Card>
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
            <Link href="/features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">
              How it Works
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '8px 16px',
                border: '2px solid #3b82f6',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#3b82f6',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'block',
                visibility: 'visible',
                opacity: '1',
                zIndex: '10',
              }}
              className="hover:bg-blue-50 transition-colors"
            >
              Sign In
            </button>
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="md"
              className="text-sm sm:text-base px-3 sm:px-4"
            >
              <span className="hidden sm:inline">🚀 {t('getStarted', 'Get Started')}</span>
              <span className="sm:hidden">🚀 Start</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('heroTitlePart1', 'Your Digital')}
            <span className="text-blue-600"> {t('heroTitlePart2', 'Professional Twin')}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t(
              'heroSubtitle',
              'Unlock your professional potential with AI-powered behavioral analysis, predictive insights, and personalized career development recommendations.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button onClick={handleGetStarted} variant="primary" size="xl" className="text-lg">
              🎯 Start Your Journey
            </Button>
            <Button
              onClick={() => router.push('/guest-journey')}
              variant="outline"
              size="xl"
              className="text-lg border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              ✨ Explore Features
            </Button>
            <Button onClick={handleDemoClick} variant="outline" size="xl" className="text-lg">
              🚀 Try Demo
            </Button>
          </div>

          {/* Hero Image/Demo Preview */}
          <Card className="rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-8">
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
                        <Badge variant="info" size="sm">
                          High
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Productivity Score</div>
                      <Progress value={87} variant="default" size="sm" />
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-green-600">6.2h</div>
                        <Badge variant="success" size="sm">
                          +15%
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Focus Time</div>
                      <Progress value={75} variant="success" size="sm" />
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-purple-600">+12%</div>
                        <Badge variant="warning" size="sm">
                          Trending
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Growth</div>
                      <Progress value={62} variant="info" size="sm" />
                    </div>
                  </div>
                  <div className="bg-gray-100 h-32 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-gray-500 mb-2">📊 Interactive Productivity Chart</span>
                    <Progress value={45} className="w-3/4" showValue animated />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('featureBehavioralAnalysisTitle', 'Behavioral Analysis')}
              </h3>
              <p className="text-gray-600">
                {t(
                  'featureBehavioralAnalysisText',
                  'Advanced ML algorithms analyze your work patterns and identify optimization opportunities'
                )}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔮</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('featurePredictiveInsightsTitle', 'Predictive Insights')}
              </h3>
              <p className="text-gray-600">
                {t(
                  'featurePredictiveInsightsText',
                  'Get personalized predictions about your career trajectory and skill development'
                )}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('featureGoalAchievementTitle', 'Goal Achievement')}
              </h3>
              <p className="text-gray-600">
                {t(
                  'featureGoalAchievementText',
                  'Set and track professional goals with AI-powered recommendations and progress monitoring'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600">See how digital twins are transforming careers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar name="Sarah Chen" />
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">Product Manager</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Digame helped me identify productivity patterns I never knew existed. I've
                  increased my efficiency by 40% in just 3 months."
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar name="Marcus Rodriguez" />
                  <div>
                    <div className="font-semibold text-gray-900">Marcus Rodriguez</div>
                    <div className="text-sm text-gray-600">Software Engineer</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The predictive insights are incredible. Digame predicted my promotion 6 months
                  before it happened and helped me prepare perfectly."
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar name="Emily Watson" />
                  <div>
                    <div className="font-semibold text-gray-900">Emily Watson</div>
                    <div className="text-sm text-gray-600">Marketing Director</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "My digital twin became my career coach. The personalized recommendations led to a
                  60% salary increase within a year."
                </p>
              </CardContent>
            </Card>
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
            Join thousands of professionals who are already using their digital twins to accelerate
            their careers
          </p>
          <Button
            onClick={handleGetStarted}
            variant="secondary"
            size="xl"
            className="bg-white text-blue-600 hover:bg-gray-50 text-lg"
          >
            ⚡ Get Started Today
          </Button>
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
            {t('footerCopyright', '© 2025 Digame. Your Digital Professional Twin Platform.')}
          </p>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuthForm && <AuthForm onLogin={handleAuthSuccess} onClose={handleAuthClose} />}
    </div>
  );
}
