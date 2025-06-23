import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext.tsx';
import enhancedApiService from './services/enhancedApiService';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import DemoPage from './pages/DemoPage';
import DashboardPage from './pages/DashboardPage';
import ComponentDemoPage from './pages/ComponentDemoPage';
import OnboardingPage from './pages/OnboardingPage';
import AdvancedWebAnalyticsDashboard from './pages/AdvancedWebAnalyticsDashboard';
import AdvancedMobileAnalyticsDashboard from './pages/AdvancedMobileAnalyticsDashboard';
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
// Team Collaboration Pages
import TeamsPage from './pages/TeamsPage.jsx';
import TeamDashboardPage from './pages/TeamDashboardPage.jsx';
import SkillGapAnalysisPage from './pages/SkillGapAnalysisPage.jsx';
import WorkflowOptimizationPage from './pages/WorkflowOptimizationPage.jsx';
// Authentication Page
import AuthPage from './pages/AuthPage.tsx';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Verify token is still valid
        const response = await fetch('http://localhost:8000/auth/verify-token', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
          
          // Check if user needs onboarding
          try {
            const onboardingResponse = await fetch('http://localhost:8000/auth/me/onboarding', {
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
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setIsDemoMode(true);
    setIsAuthenticated(false);
    enhancedApiService.enableDemoMode();
  };

  const handleLogin = (userData, tokens) => {
    setIsAuthenticated(true);
    setIsDemoMode(false);
    
    // Store tokens
    if (tokens) {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    
    // Check if user needs onboarding
    setNeedsOnboarding(!userData?.onboarding_completed);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setNeedsOnboarding(false);
    
    // Disable demo mode
    enhancedApiService.disableDemoMode();
    
    // Clear stored tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
    <AuthProvider>
      <ToastProvider position="top-right">
        <Router>
          <div className="App">
            <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                needsOnboarding ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <HomePage
                  onDemoAccess={handleDemoAccess}
                  onLogin={handleLogin}
                />
              )
            }
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
            path="/onboarding"
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
                <DashboardPage
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
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⚡</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Workflow Automation</h1>
                    <p className="text-gray-600">Automated workflows coming soon...</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          {/* Analytics Routes */}
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
          
          <Route
            path="/enterprise/integrations"
            element={
              isAuthenticated || isDemoMode ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔗</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Integration APIs</h1>
                    <p className="text-gray-600">Third-party productivity tool integrations</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/enterprise/workflows"
            element={
              isAuthenticated || isDemoMode ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⚙️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Workflow Automation</h1>
                    <p className="text-gray-600">Business process automation and management</p>
                  </div>
                </div>
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
  );
}

export default App;