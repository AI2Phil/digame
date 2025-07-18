import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  TrendingUp, 
  Users, 
  Target, 
  BookOpen, 
  Award, 
  Clock, 
  Lightbulb, 
  ChevronRight, 
  Star,
  Menu,
  X,
  Home,
  Bell,
  Crown,
  LogOut,
  BarChart3,
  Bot,
  CheckCircle,
  Activity
} from 'lucide-react';
import NextJSComprehensiveNavigation from '../src/components/navigation/NextJSComprehensiveNavigation';
import NavigationHubFooter from '../src/components/layout/NavigationHubFooter';
import PersonalizedDashboard from '../src/components/dashboard/PersonalizedDashboard';
import { useAuth } from '../src/contexts/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleNavigation = () => {
    setIsNavigationOpen(!isNavigationOpen);
  };

  // Transform user data to match navigation component expectations
  const adaptedUser = user ? {
    name: user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
    role: user.role,
    is_platform_owner: user.isPlatformOwner,
    subscription_tier: user.subscriptionTier,
    tenant_id: user.teamId || 1,
    tenant_name: user.teamId ? `Team ${user.teamId}` : 'Individual',
    permissions: user.permissions || []
  } : null;

  // Platform Owners and Demo Mode should always have access to all features
  const shouldShowAllFeatures = user?.isDemoMode || user?.isPlatformOwner;

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('Dashboard - Current user object:', user);
      console.log('Dashboard - isPlatformOwner:', user.isPlatformOwner);
      console.log('Dashboard - role:', user.role);
      console.log('Dashboard - subscriptionTier:', user.subscriptionTier);
      console.log('Dashboard - shouldShowAllFeatures:', shouldShowAllFeatures);
    }
  }, [user, shouldShowAllFeatures]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check if user has completed onboarding
  if (user && !user.onboardingCompleted && !user.isDemoMode) {
    router.push('/onboarding-wizard');
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {user?.isPlatformOwner ? 'Platform Owner Dashboard - Digame' : 'Dashboard - Digame'}
        </title>
        <meta 
          name="description" 
          content={user?.isPlatformOwner 
            ? "Platform Owner comprehensive dashboard with full feature access" 
            : "Your personal productivity dashboard"
          } 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="flex min-h-screen bg-gray-50">
        {/* Comprehensive Navigation Sidebar */}
        <NextJSComprehensiveNavigation
          isDemoMode={user?.isDemoMode || false}
          onLogout={handleLogout}
          currentUser={adaptedUser}
          isOpen={isNavigationOpen}
          onToggle={toggleNavigation}
          showAllFeatures={shouldShowAllFeatures}
        />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isNavigationOpen ? 'ml-0' : 'ml-0'
        }`}>
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleNavigation}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                  title={isNavigationOpen ? 'Collapse Menu' : 'Expand Menu'}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.isPlatformOwner ? 'Platform Owner Dashboard' : 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {user?.isPlatformOwner
                      ? 'Complete access to all 14 sections with 95+ features'
                      : 'Your personal productivity dashboard'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <button className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow" title="Return to Home">
                    <Home className="w-5 h-5 text-gray-600" />
                  </button>
                </Link>
                <button className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                {user?.subscriptionTier && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize">
                    {user.subscriptionTier.replace('_', ' ')}
                  </span>
                )}
                {user?.isPlatformOwner && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Crown className="w-3 h-3 mr-1" />
                    Platform Owner
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1">
            <div className="container mx-auto px-6 py-8">
              {/* Platform Owner Welcome Banner */}
              {user?.isPlatformOwner && (
                <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Crown className="w-6 h-6" />
                        Welcome, Platform Owner!
                      </h2>
                      <p className="text-yellow-100">
                        You have complete access to all platform features and management tools.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">14</div>
                      <div className="text-sm text-yellow-200">Feature Sections</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Personalized Welcome Banner - Show for all users */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome back, {user?.firstName || user?.name || user?.username || 'User'}! 👋
                </h2>
                <p className="text-purple-100">
                  Your personalized dashboard is ready with widgets tailored to your interests in{' '}
                  {user?.onboardingData?.interests?.join(', ') || 'analytics, ai, productivity, team_management'} and goals for{' '}
                  {user?.onboardingData?.goals?.join(', ') || 'productivity, data_insights, team_optimization'}.
                </p>
              </div>

              {/* Regular Welcome Section for non-Platform Owners */}
              {!user?.isPlatformOwner && (
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          Welcome back, {user?.firstName || user?.name || user?.username || 'User'}!
                        </h2>
                        <p className="text-blue-100">
                          Access your personalized dashboard and productivity tools.
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">12</div>
                        <div className="text-sm text-blue-200">Feature Sections</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Owner Feature Overview */}
              {user?.isPlatformOwner && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">14</div>
                          <div className="text-sm text-blue-800">Major Sections</div>
                        </div>
                        <Target className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">95+</div>
                          <div className="text-sm text-green-800">Features</div>
                        </div>
                        <Star className="w-8 h-8 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">100%</div>
                          <div className="text-sm text-purple-800">Backend Coverage</div>
                        </div>
                        <Award className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">∞</div>
                          <div className="text-sm text-orange-800">Access Level</div>
                        </div>
                        <Lightbulb className="w-8 h-8 text-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Metrics - Clickable Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link href="/tasks">
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm text-green-600 font-medium">+12%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">24</h3>
                    <p className="text-gray-600 text-sm">Tasks Completed</p>
                  </div>
                </Link>

                <Link href="/analytics/performance">
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm text-green-600 font-medium">+8%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">87%</h3>
                    <p className="text-gray-600 text-sm">Productivity Score</p>
                  </div>
                </Link>

                <Link href="/digital-twin/my-twin">
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-sm text-blue-600 font-medium">Active</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">94%</h3>
                    <p className="text-gray-600 text-sm">AI Twin Accuracy</p>
                  </div>
                </Link>

                <Link href="/analytics/behavioral">
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-sm text-green-600 font-medium">+15%</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">6.2h</h3>
                    <p className="text-gray-600 text-sm">Focus Time Today</p>
                  </div>
                </Link>
              </div>

              {/* Platform Owner Quick Actions - Only show for platform owners */}
              {user?.isPlatformOwner && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <Crown className="w-5 h-5 inline mr-2 text-yellow-600" />
                    Platform Owner Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/platform-owner/console">
                      <div className="p-4 rounded-lg border-2 border-transparent hover:border-yellow-200 hover:bg-yellow-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                          <Crown className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Platform Console</h4>
                        <p className="text-xs text-gray-600 mt-1">Manage entire platform</p>
                      </div>
                    </Link>
                    <Link href="/platform-owner/users">
                      <div className="p-4 rounded-lg border-2 border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">User Management</h4>
                        <p className="text-xs text-gray-600 mt-1">All platform users</p>
                      </div>
                    </Link>
                    <Link href="/platform-owner/revenue">
                      <div className="p-4 rounded-lg border-2 border-transparent hover:border-green-200 hover:bg-green-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Revenue Analytics</h4>
                        <p className="text-xs text-gray-600 mt-1">Business intelligence</p>
                      </div>
                    </Link>
                    <Link href="/platform-owner/health">
                      <div className="p-4 rounded-lg border-2 border-transparent hover:border-purple-200 hover:bg-purple-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                          <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">System Health</h4>
                        <p className="text-xs text-gray-600 mt-1">Platform monitoring</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}

              {/* Main Dashboard Content */}
              <div className="mb-8">
                <PersonalizedDashboard />
              </div>
            </div>
          </main>

          {/* Navigation Hub Footer */}
          <NavigationHubFooter />
        </div>
      </div>
    </>
  );
}