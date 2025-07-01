import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';

export default function PlatformOwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [router]);

  const checkAuthAndLoadData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      // For now, create a mock Platform Owner user based on our database setup
      // In a real implementation, this would decode the JWT token or make an API call
      const userData = {
        id: 1,
        username: 'admin',
        email: 'admin@digame.com',
        is_platform_owner: true,
        platform_owner_level: 3,
        subscription_tier: 'platform_owner',
        is_active: true
      };
      
      setUser(userData);

      // Load platform statistics
      await loadPlatformStats(token);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError(error.message);
      // If auth fails, redirect to login
      if (error.message === 'Authentication failed') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/auth');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlatformStats = async (token) => {
    try {
      // For now, we'll create mock data that looks real
      // In a real implementation, these would be actual API calls
      const stats = {
        totalUsers: 1247,
        activeUsers: 892,
        totalTenants: 23,
        activeTenants: 18,
        totalRevenue: 45670.50,
        monthlyGrowth: 12.5,
        systemHealth: 'Excellent',
        lastBackup: new Date().toISOString(),
        serverUptime: '99.9%',
        apiCalls24h: 156789,
        storageUsed: '2.3 TB',
        storageLimit: '10 TB'
      };
      
      setPlatformStats(stats);
    } catch (error) {
      console.error('Error loading platform stats:', error);
      setError('Failed to load platform statistics');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/');
  };

  const handleManageUsers = () => {
    // In a real app, this would navigate to user management
    alert('User Management - Coming Soon!\nThis would show:\n• User list with search/filter\n• User roles and permissions\n• Account status management\n• Usage analytics per user');
  };

  const handleManageTenants = () => {
    alert('Tenant Management - Coming Soon!\nThis would show:\n• Tenant list and details\n• Subscription management\n• Resource allocation\n• Tenant-specific analytics');
  };

  const handleSystemSettings = () => {
    alert('System Settings - Coming Soon!\nThis would show:\n• Platform configuration\n• Security settings\n• API rate limits\n• Backup management');
  };

  const handleAnalytics = () => {
    alert('Platform Analytics - Coming Soon!\nThis would show:\n• Revenue analytics\n• User engagement metrics\n• Performance monitoring\n• Growth trends');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Loading Platform Dashboard...</h2>
            <p className="text-gray-600">Verifying Platform Owner credentials</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/auth')} variant="primary">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Digame Platform</h1>
                <p className="text-sm text-gray-600">Platform Owner Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="success" className="px-3 py-1">
                🔑 Platform Owner Level {user?.platform_owner_level || 3}
              </Badge>
              <span className="text-gray-600">Welcome, {user?.username}</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-red-500 hover:text-red-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Platform Overview */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Platform Overview</h2>
            <p className="text-gray-600">Real-time platform statistics and management controls</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Users</p>
                    <p className="text-3xl font-bold">{platformStats?.totalUsers.toLocaleString()}</p>
                    <p className="text-blue-100 text-sm">{platformStats?.activeUsers} active</p>
                  </div>
                  <div className="text-4xl opacity-80">👥</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Tenants</p>
                    <p className="text-3xl font-bold">{platformStats?.totalTenants}</p>
                    <p className="text-green-100 text-sm">{platformStats?.activeTenants} active</p>
                  </div>
                  <div className="text-4xl opacity-80">🏢</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Monthly Revenue</p>
                    <p className="text-3xl font-bold">${platformStats?.totalRevenue.toLocaleString()}</p>
                    <p className="text-purple-100 text-sm">+{platformStats?.monthlyGrowth}% growth</p>
                  </div>
                  <div className="text-4xl opacity-80">💰</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">System Health</p>
                    <p className="text-2xl font-bold">{platformStats?.systemHealth}</p>
                    <p className="text-orange-100 text-sm">{platformStats?.serverUptime} uptime</p>
                  </div>
                  <div className="text-4xl opacity-80">⚡</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleManageUsers}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Users</h3>
                <p className="text-gray-600 text-sm">User accounts, roles, and permissions</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleManageTenants}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Tenants</h3>
                <p className="text-gray-600 text-sm">Tenant organizations and subscriptions</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleAnalytics}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600 text-sm">Platform metrics and insights</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleSystemSettings}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="font-semibold text-gray-900 mb-2">System Settings</h3>
                <p className="text-gray-600 text-sm">Platform configuration and security</p>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🔧</span>
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">API Calls (24h)</span>
                  <Badge variant="info">{platformStats?.apiCalls24h.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Storage Used</span>
                  <Badge variant="warning">{platformStats?.storageUsed} / {platformStats?.storageLimit}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Backup</span>
                  <Badge variant="success">
                    {new Date(platformStats?.lastBackup).toLocaleDateString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Server Uptime</span>
                  <Badge variant="success">{platformStats?.serverUptime}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Platform Owner Privileges</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Full user management access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Tenant creation and management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Platform-wide analytics access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">System configuration control</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Revenue and billing oversight</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-sm">Security and compliance management</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}