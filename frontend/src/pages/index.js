import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import dynamic from 'next/dynamic';
// import Button from '../components/ui/Button';

// Temporary Button component
const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
    outline:
      'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { useTranslation } from 'next-i18next';
import { Avatar } from '../components/ui/Avatar';
import { Card, CardContent } from '../components/ui/Card';

// Dynamically import AuthForm to avoid SSR issues
const AuthForm = dynamic(() => import('../components/auth/AuthForm'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function HomePage({ onDemoAccess, onLogin }) {
  const { t } = useTranslation('common');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleGetStarted = () => {
    setShowOnboarding(true);
  };

  const handleDemoClick = () => {
    window.location.href = '/demo';
  };

  const handleSignUp = () => {
    setShowAuthForm(true);
  };

  const handleAuthClose = () => {
    setShowAuthForm(false);
  };

  const handleAuthSuccess = (userData, tokens) => {
    setShowAuthForm(false);
    onLogin?.(userData, tokens);
  };

  if (showOnboarding) {
    return (
      <>
        <Head>
          <title>Get Started - Digame</title>
          <meta
            name="description"
            content="Choose your Digame experience - try our demo or create your personal digital twin."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Digame</span>
              </Link>
              <Button variant="ghost" onClick={() => setShowOnboarding(false)}>
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

              <div className="grid md:grid-cols-2 gap-8">
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
                        <span className="text-gray-700">
                          Predictive insights and recommendations
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xs">✓</span>
                        </div>
                        <span className="text-gray-700">No registration required</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleDemoClick}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
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

                    <Button onClick={handleSignUp} variant="primary" size="lg" className="w-full">
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
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Digame - Your Digital Professional Twin</title>
        <meta
          name="description"
          content="Unlock your professional potential with AI-powered behavioral analysis, predictive insights, and personalized career development recommendations."
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
              <Link
                href="/features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                How it Works
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/LoginPage">
                <Button
                  variant="outline"
                  size="md"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Sign In
                </Button>
              </Link>
              <Button onClick={handleGetStarted} variant="primary" size="md">
                🚀 {t('getStarted', 'Get Started')}
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
                          <Badge variant="default" size="sm">
                            High
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Productivity Score</div>
                        <Progress value={87} className="h-2" />
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl font-bold text-green-600">6.2h</div>
                          <Badge variant="secondary" size="sm">
                            +15%
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Focus Time</div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-2xl font-bold text-purple-600">+12%</div>
                          <Badge variant="outline" size="sm">
                            Trending
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Growth</div>
                        <Progress value={62} className="h-2" />
                      </div>
                    </div>
                    <div className="bg-gray-100 h-32 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-gray-500 mb-2">📊 Interactive Productivity Chart</span>
                      <Progress value={45} className="w-3/4 h-2" />
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
              <p className="text-xl text-gray-600">
                See how digital twins are transforming careers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="rounded-lg shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar name="Sarah Chen" className="mr-3" />
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
                    <Avatar name="Marcus Rodriguez" className="mr-3" />
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
                    <Avatar name="Emily Watson" className="mr-3" />
                    <div>
                      <div className="font-semibold text-gray-900">Emily Watson</div>
                      <div className="text-sm text-gray-600">Marketing Director</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "My digital twin became my career coach. The personalized recommendations led to
                    a 60% salary increase within a year."
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
              Join thousands of professionals who are already using their digital twins to
              accelerate their careers
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
    </>
  );
}

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
