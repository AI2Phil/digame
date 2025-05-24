import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ComponentDemoPage from './pages/ComponentDemoPage';
import OnboardingPage from './pages/OnboardingPage';
import AdvancedWebAnalyticsDashboard from './pages/AdvancedWebAnalyticsDashboard';
import AdvancedMobileAnalyticsDashboard from './pages/AdvancedMobileAnalyticsDashboard';
import EnhancedSocialCollaborationDashboard from './pages/EnhancedSocialCollaborationDashboard';
import AiToolsPage from './pages/AiToolsPage';
import TaskManagementPage from './pages/TaskManagementPage';
import EnterpriseDashboardPage from './pages/EnterpriseDashboardPage';
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
          
          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                needsOnboarding ? (
                  <OnboardingPage onComplete={handleOnboardingComplete} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
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
          
          <Route
            path="/components"
            element={<ComponentDemoPage />}
          />
          
          <Route
            path="/analytics/web"
            element={
              isAuthenticated || isDemoMode ? (
                <AdvancedWebAnalyticsDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/analytics/mobile"
            element={
              isAuthenticated || isDemoMode ? (
                <AdvancedMobileAnalyticsDashboard />
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
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🧠</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Behavioral Analytics</h1>
                    <p className="text-gray-600">Advanced behavioral analysis coming soon...</p>
                  </div>
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          
          <Route
            path="/analytics/predictive"
            element={
              isAuthenticated || isDemoMode ? (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔮</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Predictive Analytics</h1>
                    <p className="text-gray-600">Predictive insights coming soon...</p>
                  </div>
                </div>
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
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Insights</h1>
                    <p className="text-gray-600">Comprehensive reporting features coming soon...</p>
                  </div>
                </div>
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

          {/* Catch all route */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;