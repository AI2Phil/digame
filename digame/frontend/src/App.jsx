import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ComponentDemoPage from './pages/ComponentDemoPage';
import OnboardingPage from './pages/OnboardingPage';
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