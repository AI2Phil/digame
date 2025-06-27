import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '../src/components/ui/Button';
import { Card, CardContent } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Progress } from '../src/components/ui/Progress';
import demoService from '../src/services/demoService';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check if user is authenticated or in demo mode
      const token = localStorage.getItem('access_token');
      const demoMode = demoService.isDemoMode();
      
      if (!token && !demoMode) {
        router.push('/auth');
        return;
      }

      setIsDemoMode(demoMode);

      if (demoMode) {
        // Load demo data
        setUser(demoService.getCurrentUser());
        setMetrics(demoService.getDashboardMetrics());
      } else {
        // Load real user data from API
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setMetrics(data.metrics);
        } else {
          // Token invalid, redirect to auth
          localStorage.removeItem('access_token');
          router.push('/auth');
          return;
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (!demoService.isDemoMode()) {
        router.push('/auth');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    demoService.setDemoMode(false);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Loading Dashboard...</h2>
            <p className="text-gray-600">Preparing your digital twin insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Glassmorphic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Digame Dashboard</span>
              {isDemoMode && (
                <Badge variant="warning" size="sm" className="ml-2">Demo Mode</Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.firstName || 'User'}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your digital twin insights for today
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-lg backdrop-blur-lg bg-white/80 border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-blue-600">
                  {metrics?.productivityScore?.current || 87}%
                </div>
                <Badge variant="info" size="sm">
                  {metrics?.productivityScore?.change > 0 ? '+' : ''}{metrics?.productivityScore?.change || 5}%
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mb-3">Productivity Score</div>
              <Progress 
                value={metrics?.productivityScore?.current || 87} 
                variant="default" 
                size="sm" 
                className="mb-2"
              />
              <div className="text-xs text-gray-500">
                Target: {metrics?.productivityScore?.target || 90}%
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg backdrop-blur-lg bg-white/80 border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-green-600">
                  {metrics?.focusTime?.current || 6.2}h
                </div>
                <Badge variant="success" size="sm">
                  +{metrics?.focusTime?.change || 0.8}h
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mb-3">Focus Time</div>
              <Progress 
                value={(metrics?.focusTime?.current / metrics?.focusTime?.target * 100) || 75} 
                variant="success" 
                size="sm" 
                className="mb-2"
              />
              <div className="text-xs text-gray-500">
                Target: {metrics?.focusTime?.target || 8}h
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg backdrop-blur-lg bg-white/80 border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-purple-600">
                  +{metrics?.growthRate?.current || 12}%
                </div>
                <Badge variant="warning" size="sm">Trending</Badge>
              </div>
              <div className="text-sm text-gray-600 mb-3">Growth Rate</div>
              <Progress 
                value={metrics?.growthRate?.current || 12} 
                variant="info" 
                size="sm" 
                className="mb-2"
              />
              <div className="text-xs text-gray-500">
                Monthly improvement
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Productivity Chart */}
          <Card className="rounded-2xl shadow-lg backdrop-blur-lg bg-white/80 border border-white/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Productivity Trends
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-600">Interactive Chart</p>
                  <p className="text-sm text-gray-500">7-day productivity trend</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="rounded-2xl shadow-lg backdrop-blur-lg bg-white/80 border border-white/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🤖 AI Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">💡</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Peak Performance</h4>
                      <p className="text-sm text-gray-600">
                        Your productivity is 23% higher between 9-11 AM. Consider scheduling important tasks during this time.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🎯</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Goal Progress</h4>
                      <p className="text-sm text-gray-600">
                        You're on track to exceed your monthly productivity goal by 15%.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📚</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Learning Opportunity</h4>
                      <p className="text-sm text-gray-600">
                        Based on your interests, we recommend the "Advanced React Patterns" course.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="rounded-2xl shadow-lg backdrop-blur-lg bg-white/80 border border-white/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ⚡ Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span className="text-2xl mb-1">📊</span>
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span className="text-2xl mb-1">🎯</span>
                  <span className="text-sm">Goals</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span className="text-2xl mb-1">🤝</span>
                  <span className="text-sm">Social</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <span className="text-2xl mb-1">⚙️</span>
                  <span className="text-sm">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}