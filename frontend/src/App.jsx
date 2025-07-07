import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext.tsx';
import enhancedApiService from './services/enhancedApiService';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import DemoPage from './pages/DemoPage';
import ComprehensiveDashboardPage from './pages/ComprehensiveDashboardPage.jsx';
import ComponentDemoPage from './pages/ComponentDemoPage';
import OnboardingPage from './pages/OnboardingPage';
import AdvancedWebAnalyticsDashboard from './pages/AdvancedWebAnalyticsDashboard';
import AdvancedMobileAnalyticsDashboard from './pages/AdvancedMobileAnalyticsDashboard';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import PlatformAnalyticsDashboard from './components/analytics/PlatformAnalyticsDashboard';
import EnhancedSocialCollaborationDashboard from './pages/EnhancedSocialCollaborationDashboard';
import AiToolsPage from './pages/AiToolsPage';
import TaskManagementPage from './pages/TaskManagementPage';
import EnterpriseDashboardPage from './pages/EnterpriseDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage'; // Import AdminDashboardPage
import UserListPage from './pages/UserListPage';
import UserProfileOverviewPage from './pages/UserProfileOverviewPage';
import FindPeersPage from './pages/FindPeersPage'; // Import FindPeersPage
import BehavioralAnalyticsPage from './pages/BehavioralAnalyticsPage';
import PredictiveAnalyticsPage from './pages/PredictiveAnalyticsPage';
import ReportsPage from './pages/ReportsPage';
// Integration Pages
import IntegrationsPage from './pages/IntegrationsPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
// Team Collaboration Pages
import TeamsPage from './pages/TeamsPage.jsx';
import TeamDashboardPage from './pages/TeamDashboardPage.jsx';
import SkillGapAnalysisPage from './pages/SkillGapAnalysisPage.jsx';
import WorkflowOptimizationPage from './pages/WorkflowOptimizationPage.jsx';
import WorkflowAutomationPage from './pages/WorkflowAutomationPage.tsx';
import AIMLDashboardPage from './pages/AIMLDashboardPage.jsx';
import PredictiveModeling from './components/ai/PredictiveModeling.jsx';
import AIPoweredAutomation from './components/ai/AIPoweredAutomation.jsx';
// Digital Twin Page
import TwinDashboard from './components/digital-twin/TwinDashboard.tsx';
// Platform Owner Components
import TestZone from './components/platform-owner/TestZone.tsx';
// Authentication Page
import AuthPage from './pages/AuthPage.tsx';
import LanguageSwitcher from './components/Layout/LanguageSwitcher'; // Import LanguageSwitcher
// Removed i18next dependency to simplify
import NavigationTestPage from './pages/NavigationTestPage.jsx'; // Import NavigationTestPage
import ComprehensiveNavigationDemo from './pages/ComprehensiveNavigationDemo.jsx'; // Import ComprehensiveNavigationDemo
// Guest User Journey Components
import GuestUserJourney from './components/onboarding/GuestUserJourney.jsx';
import './App.css';
import './styles/theme.css';

// Guest Journey Wrapper Component
const GuestJourneyWrapper = () => {
  const navigate = useNavigate();
  
  return (
    <GuestUserJourney
      onSignUp={() => navigate('/auth?mode=signup')}
      onLogin={() => navigate('/auth?mode=login')}
    />
  );
};

function App() {
  // Removed i18next translation hook
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (token) {
        // Verify token is still valid and get user data
        const response = await fetch('http://localhost:8001/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setCurrentUser(userData.user);
          console.log('App.jsx: User data loaded:', userData.user);
          
          // Check if user needs onboarding
          try {
            const onboardingResponse = await fetch('http://localhost:8001/auth/me/onboarding', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (onboardingResponse.ok) {
              const onboardingData = await onboardingResponse.json();
              setNeedsOnboarding(!onboardingData.onboarding_completed);
            } else {
              // If onboarding endpoint doesn't exist, assume onboarding is needed
              setNeedsOnboarding(true);
            }
          } catch (error) {
            console.warn('Could not check onboarding status:', error);
            setNeedsOnboarding(true);
          }
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine the correct dashboard based on user role
  const getDashboardRoute = (user) => {
    if (!user) return '/dashboard';
    
    if (user.isPlatformOwner || user.is_platform_owner) {
      console.log('App.jsx: Platform owner detected, redirecting to platform owner console');
      return '/platform-owner/console';
    } else if (user.role === 'admin') {
      console.log('App.jsx: Admin user detected, redirecting to admin dashboard');
      return '/admin/dashboard';
    } else {
      console.log('App.jsx: Regular user, redirecting to standard dashboard');
      return '/dashboard';
    }
  };

  const handleDemoAccess = () => {
    setIsDemoMode(true);
    setIsAuthenticated(false);
    setNeedsOnboarding(true); // Force demo users through onboarding
    enhancedApiService.enableDemoMode();
  };

  const handleLogin = (userData, tokens) => {
    setIsAuthenticated(true);
    setIsDemoMode(false);
    
    // Store tokens
    if (tokens) {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    
    // Check if user needs onboarding
    setNeedsOnboarding(!userData?.onboarding_completed);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setNeedsOnboarding(false);
    setCurrentUser(null);
    
    // Disable demo mode
    enhancedApiService.disableDemoMode();
    
    // Clear stored tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('dashboard_config');
    localStorage.removeItem('initial_recommendations');
  };

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Loading Digame...</h2>
              <p className="text-gray-600">Preparing your digital twin platform</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider position="top-right">
          <Router>
          <div className="App">
            <LanguageSwitcher /> {/* Add LanguageSwitcher here */}
            <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                needsOnboarding ? (
                  <Navigate to="/onboarding-wizard" replace />
                ) : (
                  <Navigate to={getDashboardRoute(currentUser)} replace />
                )
              ) : (
                <HomePage
                  onDemoAccess={handleDemoAccess}
                  onLogin={handleLogin}
                />
              )
            }
          />
          
          {/* Guest User Journey Routes */}
          <Route
            path="/guest-journey"
            element={<GuestJourneyWrapper />}
          />
          
          {/* Authentication Page */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Public Pages - No Authentication Required */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/demo" element={<DemoPage onDemoAccess={handleDemoAccess} />} />
          
          {/* Community/User Routes */}
          <Route
            path="/community"
            element={
              isAuthenticated || isDemoMode ? (
                <UserListPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/users/:userId/profile_overview"
            element={
              isAuthenticated || isDemoMode ? (
                <UserProfileOverviewPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/onboarding-wizard"
            element={
              isAuthenticated || isDemoMode ? (
                needsOnboarding || isDemoMode ? (
                  <OnboardingPage onComplete={handleOnboardingComplete} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* New route for Find Peers Page */}
          <Route
            path="/social/find-peers"
            element={
              isAuthenticated || isDemoMode ? (
                <FindPeersPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              isAuthenticated || isDemoMode ? (
                <ComprehensiveDashboardPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                  isNewUser={needsOnboarding}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* User Profile Overview Route */}
          <Route
            path="/profile/:userId"
            element={
              isAuthenticated || isDemoMode ? (
                <UserProfileOverviewPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/components"
            element={<ComponentDemoPage />}
          />
          
          <Route
            path="/analytics/web"
            element={
              isAuthenticated || isDemoMode ? (
                <AdvancedWebAnalyticsDashboard
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/analytics/mobile"
            element={
              isAuthenticated || isDemoMode ? (
                <AdvancedMobileAnalyticsDashboard
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/analytics"
            element={
              isAuthenticated || isDemoMode ? (
                <AnalyticsDashboardPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/social"
            element={
              isAuthenticated || isDemoMode ? (
                <EnhancedSocialCollaborationDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/ai-tools"
            element={
              isAuthenticated || isDemoMode ? (
                <AiToolsPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/tasks"
            element={
              isAuthenticated || isDemoMode ? (
                <TaskManagementPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/enterprise"
            element={
              isAuthenticated || isDemoMode ? (
                <EnterpriseDashboardPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* AI Tools Routes */}
          <Route
            path="/ai/insights"
            element={
              isAuthenticated || isDemoMode ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Insights</h1>
                    <p className="text-gray-600">Advanced AI-powered insights coming soon...</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/ai/recommendations"
            element={
              isAuthenticated || isDemoMode ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Smart Recommendations</h1>
                    <p className="text-gray-600">Personalized recommendations coming soon...</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/ai/coaching"
            element={
              isAuthenticated || isDemoMode ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏃</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Coaching</h1>
                    <p className="text-gray-600">Intelligent coaching features coming soon...</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/ai/automation"
            element={
              isAuthenticated || isDemoMode ? (
                <WorkflowAutomationPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/ai/ml-dashboard"
            element={
              isAuthenticated || isDemoMode ? (
                <AIMLDashboardPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/ai/predictive-modeling"
            element={
              isAuthenticated || isDemoMode ? (
                <PredictiveModeling />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/ai/ai-automation"
            element={
              isAuthenticated || isDemoMode ? (
                <AIPoweredAutomation />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* Analytics Routes */}
          <Route
            path="/analytics/platform"
            element={
              isAuthenticated || isDemoMode ? (
                <PlatformAnalyticsDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/analytics/behavioral"
            element={
              isAuthenticated || isDemoMode ? (
                <BehavioralAnalyticsPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/analytics/predictive"
            element={
              isAuthenticated || isDemoMode ? (
                <PredictiveAnalyticsPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* Reports Route */}
          <Route
            path="/reports"
            element={
              isAuthenticated || isDemoMode ? (
                <ReportsPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* Enterprise Features Routes */}
          <Route
            path="/enterprise/tenants"
            element={
              isAuthenticated || isDemoMode ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏢</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Tenant Management</h1>
                    <p className="text-gray-600">Multi-tenant architecture management</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/enterprise/security"
            element={
              isAuthenticated || isDemoMode ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Management</h1>
                    <p className="text-gray-600">Enhanced security framework and monitoring</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* Integration Management Routes */}
          <Route
            path="/integrations"
            element={
              isAuthenticated || isDemoMode ? (
                <IntegrationsPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/integrations/oauth/callback"
            element={<OAuthCallbackPage />}
          />
          
          <Route
            path="/enterprise/integrations"
            element={
              isAuthenticated || isDemoMode ? (
                <IntegrationsPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/enterprise/workflows"
            element={
              isAuthenticated || isDemoMode ? (
                <WorkflowAutomationPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/enterprise/market-intelligence"
            element={
              isAuthenticated || isDemoMode ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Market Intelligence</h1>
                    <p className="text-gray-600">Industry trends and competitive analysis</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Team Collaboration Routes */}
          <Route
            path="/teams"
            element={
              isAuthenticated || isDemoMode ? (
                <TeamsPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/teams/dashboard"
            element={
              isAuthenticated || isDemoMode ? (
                <TeamDashboardPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/teams/skills"
            element={
              isAuthenticated || isDemoMode ? (
                <SkillGapAnalysisPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/teams/workflows"
            element={
              isAuthenticated || isDemoMode ? (
                <WorkflowOptimizationPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Digital Twin Route */}
          <Route
            path="/digital-twin/:twinId"
            element={
              isAuthenticated || isDemoMode ? (
                <TwinDashboard
                  twinId={window.location.pathname.split('/')[2]}
                  userId="current-user"
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Admin Dashboard Route */}
          <Route
            path="/admin/dashboard"
            element={
              isAuthenticated || isDemoMode ? ( // Or just isAuthenticated if demo mode shouldn't access admin
                <AdminDashboardPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Platform Owner Routes */}
          <Route
            path="/platform-owner/console"
            element={
              isAuthenticated ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👑</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Console</h1>
                    <p className="text-gray-600">Platform management console coming soon...</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          


          {/* Navigation Test Route */}
          <Route
            path="/navigation-test"
            element={<NavigationTestPage />}
          />
          
          {/* Comprehensive Navigation Demo Route */}
          <Route
            path="/comprehensive-navigation-demo"
            element={
              isAuthenticated || isDemoMode ? (
                <ComprehensiveNavigationDemo />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* Comprehensive Dashboard Route */}
          <Route
            path="/comprehensive-dashboard"
            element={
              isAuthenticated || isDemoMode ? (
                <ComprehensiveDashboardPage
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                  isNewUser={needsOnboarding}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
          </Routes>
          </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;