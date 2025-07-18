import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import ComprehensiveNavigation from '../components/navigation/ComprehensiveNavigation';
import PersonalizedDashboard from '../components/dashboard/PersonalizedDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, TagBadge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import enhancedApiService from '../services/enhancedApiService';
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
  Home
} from 'lucide-react';

const ComprehensiveDashboardPage = ({ 
  isDemoMode: propIsDemoMode, 
  onLogout: propOnLogout, 
  isNewUser 
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isDemoMode: authIsDemoMode, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use AuthContext values or fallback to props
  const isDemoMode = authIsDemoMode || propIsDemoMode || false;
  const currentUser = user;
  
  const handleLogout = () => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      logout();
      router.push('/');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Transform AuthContext user to match ComprehensiveNavigation expected format
  const adaptedUser = currentUser ? {
    name: currentUser.name || currentUser.fullName || currentUser.firstName || currentUser.username,
    role: currentUser.role,
    is_platform_owner: currentUser.isPlatformOwner, // Convert camelCase to snake_case
    subscription_tier: currentUser.subscriptionTier, // Convert camelCase to snake_case
    tenant_id: currentUser.tenant_id || 1, // Provide default if missing
    tenant_name: currentUser.tenant_name || 'Digame Platform', // Provide default if missing
    permissions: currentUser.permissions || []
  } : null;

  // Platform Owners and Demo Mode should always have access to all features
  const shouldShowAllFeatures = isDemoMode || (adaptedUser?.is_platform_owner === true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Loading Comprehensive Dashboard...</h2>
            <p className="text-gray-600">Preparing your complete platform access</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Check if user has completed onboarding
  if (currentUser && !currentUser.onboardingCompleted && !isDemoMode) {
    router.push('/onboarding-wizard');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Comprehensive Navigation - Always visible on desktop, toggleable on mobile */}
      <ComprehensiveNavigation
        isDemoMode={isDemoMode}
        onLogout={handleLogout}
        currentUser={adaptedUser}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        showAllFeatures={shouldShowAllFeatures}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                type="button"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Digame - Comprehensive Platform Access
              </h1>
              {isDemoMode && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  Demo Mode
                </div>
              )}
              {adaptedUser?.is_platform_owner && (
                <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center gap-1">
                  <span className="text-yellow-600">👑</span>
                  Platform Owner
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <div className="text-sm text-gray-600">
                16 Sections • 80+ Features Available
              </div>
              <div className="text-sm text-gray-500">
                Complete Backend Access
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Welcome Banner for Platform Owners */}
          {adaptedUser?.is_platform_owner && (
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 m-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <span className="text-2xl">👑</span>
                    Welcome, Platform Owner!
                  </h2>
                  <p className="text-yellow-100">
                    You have complete access to all 16 sections and 80+ features across the entire platform.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-yellow-100">Full Access Level</div>
                  <div className="text-lg font-semibold">Platform Owner</div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Overview Cards for Platform Owners */}
          {adaptedUser?.is_platform_owner && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">16</div>
                        <div className="text-sm text-blue-800">Major Sections</div>
                      </div>
                      <div className="text-blue-500">
                        <Target className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-600">80+</div>
                        <div className="text-sm text-green-800">Features</div>
                      </div>
                      <div className="text-green-500">
                        <Star className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">100%</div>
                        <div className="text-sm text-purple-800">Backend Coverage</div>
                      </div>
                      <div className="text-purple-500">
                        <Award className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">∞</div>
                        <div className="text-sm text-orange-800">Access Level</div>
                      </div>
                      <div className="text-orange-500">
                        <Lightbulb className="w-8 h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Main Dashboard Content */}
          <div className="p-6">
            <PersonalizedDashboard />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ComprehensiveDashboardPage;