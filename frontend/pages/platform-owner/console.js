import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Crown, Server, Users, Building, TrendingUp, Activity, Settings, Code, AlertTriangle, CheckCircle, Database, Cpu, HardDrive, Network, Menu, RefreshCw } from 'lucide-react';
import NextJSComprehensiveNavigation from '../../src/components/navigation/NextJSComprehensiveNavigation';
import NavigationHubFooter from '../../src/components/layout/NavigationHubFooter';
import { useAuth } from '../../src/contexts/AuthContext';

export default function PlatformConsole() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or not a platform owner
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isPlatformOwner)) {
      router.push('/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.isPlatformOwner) {
      fetchPlatformData();
    }
  }, [isAuthenticated, user, selectedTimeRange]);

  const fetchPlatformData = async () => {
    try {
      setLoading(true);
      
      // Try to get backend service info first
      let backendUrl = 'http://localhost:8001'; // Default fallback
      try {
        const serviceResponse = await fetch('http://localhost:8001/service-info');
        if (serviceResponse.ok) {
          const serviceInfo = await serviceResponse.json();
          backendUrl = serviceInfo.url || `http://localhost:${serviceInfo.port}`;
        }
      } catch (serviceError) {
        console.log('Using default backend URL');
      }

      // Fetch platform analytics and data management overview
      const [analyticsResponse, dataOverviewResponse] = await Promise.all([
        fetch(`${backendUrl}/analytics/platform?timeRange=${selectedTimeRange}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${backendUrl}/api/data-management/overview`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const analyticsData = analyticsResponse.ok ? await analyticsResponse.json() : null;
      const dataOverview = dataOverviewResponse.ok ? await dataOverviewResponse.json() : null;

      if (analyticsData?.success || dataOverview?.success) {
        setPlatformData({
          analytics: analyticsData?.data,
          dataOverview: dataOverview?.data
        });
      } else {
        // Fall back to mock data
        setPlatformData(null);
      }
    } catch (error) {
      console.error('Error fetching platform data:', error);
      setPlatformData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not platform owner
  if (!isAuthenticated || !user?.isPlatformOwner) {
    return null;
  }

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Mock data fallback
  const mockData = {
    analytics: {
      overview: {
        totalUsers: 24567,
        activeTenants: 147,
        monthlyRevenue: 847000,
        systemHealth: 99.9
      },
      growth: {
        userGrowth: '+12.5%',
        tenantGrowth: '+8.2%',
        revenueGrowth: '+18.7%'
      }
    },
    dataOverview: {
      summary: {
        totalRecords: 15420,
        mockRecords: 12336,
        realRecords: 3084,
        mockPercentage: 80.0
      },
      healthMetrics: {
        dataIntegrity: 'healthy',
        mockDataRatio: 80.0
      }
    }
  };

  const currentData = platformData || mockData;

  return (
    <>
      <Head>
        <title>Platform Console - Digame</title>
        <meta name="description" content="Platform Owner exclusive management console" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        <NextJSComprehensiveNavigation
          isDemoMode={user?.isDemoMode || false}
          onLogout={handleLogout}
          currentUser={{
            name: user?.fullName || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username,
            role: user?.role,
            is_platform_owner: user?.isPlatformOwner,
            subscription_tier: user?.subscriptionTier,
            tenant_id: user?.teamId,
            tenant_name: user?.teamId ? `Team ${user?.teamId}` : 'Individual',
            permissions: user?.permissions || []
          }}
          isOpen={isNavOpen}
          onToggle={toggleNav}
          showAllFeatures={true}
        />
        
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isNavOpen ? 'ml-0' : 'ml-0'
        }`}>
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleNav}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                  title={isNavOpen ? 'Collapse Menu' : 'Expand Menu'}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <Crown className="w-6 h-6 text-yellow-600" />
                    <span>Platform Console</span>
                  </h1>
                  <p className="text-sm text-gray-600">Comprehensive platform management and oversight</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  PLATFORM OWNER
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">

            <div className="container mx-auto px-4 py-8">
              {/* Time Range Selector and Controls */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {['1h', '24h', '7d', '30d'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setSelectedTimeRange(range)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedTimeRange === range
                            ? 'bg-yellow-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={fetchPlatformData}
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8 mb-6">
                  <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading platform data...</span>
                </div>
              )}

              {/* Platform Overview Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      {currentData.analytics?.growth?.userGrowth || '+12.5%'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {currentData.analytics?.overview?.totalUsers?.toLocaleString() || '24,567'}
                  </h3>
                  <p className="text-gray-600 text-sm">Total Users</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      {currentData.analytics?.growth?.tenantGrowth || '+8.2%'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {currentData.analytics?.overview?.activeTenants?.toLocaleString() || '147'}
                  </h3>
                  <p className="text-gray-600 text-sm">Active Tenants</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      {currentData.analytics?.growth?.revenueGrowth || '+18.7%'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    ${Math.round((currentData.analytics?.overview?.monthlyRevenue || 847000) / 1000)}K
                  </h3>
                  <p className="text-gray-600 text-sm">Monthly Revenue</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      {currentData.analytics?.overview?.systemHealth?.toFixed(1) || '99.9'}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {currentData.dataOverview?.healthMetrics?.dataIntegrity === 'healthy' ? 'Healthy' : 'Warning'}
                  </h3>
                  <p className="text-gray-600 text-sm">System Status</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Manage Users</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <Building className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Tenant Overview</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Revenue Analytics</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <Settings className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">Platform Settings</span>
                  </button>
                </div>
              </div>

              {/* System Health Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Database</span>
                      </div>
                      <span className="text-green-600 text-sm font-medium">Operational</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">API Services</span>
                      </div>
                      <span className="text-green-600 text-sm font-medium">Operational</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-900">Background Jobs</span>
                      </div>
                      <span className="text-yellow-600 text-sm font-medium">Degraded</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">File Storage</span>
                      </div>
                      <span className="text-green-600 text-sm font-medium">Operational</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Platform Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">New tenant registered</div>
                        <div className="text-sm text-gray-600">Acme Corp joined the platform</div>
                      </div>
                      <div className="text-xs text-gray-500">5 min ago</div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Revenue milestone reached</div>
                        <div className="text-sm text-gray-600">Monthly revenue exceeded $800K</div>
                      </div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Server className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">System update deployed</div>
                        <div className="text-sm text-gray-600">Version 2.4.1 successfully deployed</div>
                      </div>
                      <div className="text-xs text-gray-500">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management Overview */}
              {currentData.dataOverview && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentData.dataOverview.summary?.totalRecords?.toLocaleString() || '15,420'}
                      </div>
                      <div className="text-sm text-gray-600">Total Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {currentData.dataOverview.summary?.mockRecords?.toLocaleString() || '12,336'}
                      </div>
                      <div className="text-sm text-gray-600">Mock Data</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentData.dataOverview.summary?.realRecords?.toLocaleString() || '3,084'}
                      </div>
                      <div className="text-sm text-gray-600">Real Data</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentData.dataOverview.summary?.mockPercentage?.toFixed(1) || '80.0'}%
                      </div>
                      <div className="text-sm text-gray-600">Mock Ratio</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Analytics Summary */}
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">
                  {platformData ? '📊 Live Platform Data' : '🎭 Demo Platform Data'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Growth Metrics</h4>
                    <p className="text-yellow-100">
                      {platformData
                        ? `User base grew ${currentData.analytics?.growth?.userGrowth || '12.5%'} with ${currentData.analytics?.overview?.activeTenants || 147} active tenants generating $${Math.round((currentData.analytics?.overview?.monthlyRevenue || 847000) / 1000)}K revenue.`
                        : 'User base grew 12.5% this month with 147 active tenants generating $847K in revenue.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">System Reliability</h4>
                    <p className="text-yellow-100">
                      {currentData.analytics?.overview?.systemHealth?.toFixed(1) || '99.9'}% uptime maintained with all critical services operational and responsive.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Data Management</h4>
                    <p className="text-yellow-100">
                      {platformData
                        ? `${currentData.dataOverview?.summary?.mockPercentage?.toFixed(1) || '80'}% mock data ratio with ${currentData.dataOverview?.healthMetrics?.dataIntegrity || 'healthy'} data integrity status.`
                        : 'Data management system ready for production with comprehensive mock data controls.'}
                    </p>
                 </div>
               </div>
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