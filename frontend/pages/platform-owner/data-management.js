import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Database, Crown, BarChart3, Trash2, Download, Upload, 
  RefreshCw, AlertTriangle, CheckCircle, Settings, 
  Users, Activity, TrendingUp, Menu, Shield, Zap
} from 'lucide-react';
import NextJSComprehensiveNavigation from '../../src/components/navigation/NextJSComprehensiveNavigation';
import NavigationHubFooter from '../../src/components/layout/NavigationHubFooter';
import { useAuth } from '../../src/contexts/AuthContext';

export default function DataManagement() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dataOverview, setDataOverview] = useState(null);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not authenticated or not a platform owner
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isPlatformOwner)) {
      router.push('/auth');
    }
  }, [isAuthenticated, user, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.isPlatformOwner) {
      fetchDataOverview();
      fetchOperations();
    }
  }, [isAuthenticated, user]);

  const getBackendUrl = async () => {
    let backendUrl = 'http://localhost:8001';
    try {
      const serviceResponse = await fetch('http://localhost:8001/service-info');
      if (serviceResponse.ok) {
        const serviceInfo = await serviceResponse.json();
        backendUrl = serviceInfo.url || `http://localhost:${serviceInfo.port}`;
      }
    } catch (serviceError) {
      console.log('Using default backend URL');
    }
    return backendUrl;
  };

  const fetchDataOverview = async () => {
    try {
      setLoading(true);
      const backendUrl = await getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/data-management/overview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDataOverview(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOperations = async () => {
    try {
      const backendUrl = await getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/data-management/operations?limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setOperations(result.data.operations || []);
        }
      }
    } catch (error) {
      console.error('Error fetching operations:', error);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('This will generate mock data for development and testing. Continue?')) {
      return;
    }

    try {
      setActionLoading(true);
      const backendUrl = await getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/data-management/seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userCount: 25,
          teamCount: 5,
          projectCount: 15,
          taskCount: 100,
          analyticsEventCount: 500,
          category: 'demo'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(`Successfully generated ${result.data.totalRecords} mock records`);
          fetchDataOverview();
          fetchOperations();
        } else {
          alert('Failed to seed data: ' + result.message);
        }
      } else {
        alert('Failed to seed data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error seeding data: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCleanupData = async (dryRun = true) => {
    const action = dryRun ? 'preview cleanup' : 'permanently delete mock data';
    if (!confirm(`This will ${action}. Continue?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const backendUrl = await getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/data-management/cleanup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categories: ['demo', 'test', 'development'],
          dryRun
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(result.message);
          if (!dryRun) {
            fetchDataOverview();
            fetchOperations();
          }
        } else {
          alert('Failed to cleanup data: ' + result.message);
        }
      } else {
        alert('Failed to cleanup data');
      }
    } catch (error) {
      console.error('Error cleaning up data:', error);
      alert('Error cleaning up data: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setActionLoading(true);
      const backendUrl = await getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/data-management/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: 'json',
          includeSchema: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Create and download file
          const dataStr = JSON.stringify(result.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `digame-export-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
          
          alert(`Exported data from ${result.data.tables.length} tables`);
        } else {
          alert('Failed to export data: ' + result.message);
        }
      } else {
        alert('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Head>
        <title>Data Management - Digame Platform</title>
        <meta name="description" content="Platform Owner data management console" />
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
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleNav}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <Database className="w-6 h-6 text-blue-600" />
                    <span>Data Management</span>
                  </h1>
                  <p className="text-sm text-gray-600">Manage mock data and production readiness</p>
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
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('operations')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'operations'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Activity className="h-4 w-4 inline mr-2" />
                  Operations
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'actions'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Actions
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading data overview...</span>
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Data Statistics */}
                  {dataOverview && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {dataOverview.summary?.totalRecords?.toLocaleString() || '0'}
                        </h3>
                        <p className="text-gray-600 text-sm">Total Records</p>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {dataOverview.summary?.mockRecords?.toLocaleString() || '0'}
                        </h3>
                        <p className="text-gray-600 text-sm">Mock Data</p>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {dataOverview.summary?.realRecords?.toLocaleString() || '0'}
                        </h3>
                        <p className="text-gray-600 text-sm">Real Data</p>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {dataOverview.summary?.mockPercentage?.toFixed(1) || '0'}%
                        </h3>
                        <p className="text-gray-600 text-sm">Mock Ratio</p>
                      </div>
                    </div>
                  )}

                  {/* Health Status */}
                  {dataOverview && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Health Status</h3>
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                          dataOverview.healthMetrics?.dataIntegrity === 'healthy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dataOverview.healthMetrics?.dataIntegrity === 'healthy' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5" />
                          )}
                          <span className="font-medium">
                            Data Integrity: {dataOverview.healthMetrics?.dataIntegrity || 'Unknown'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Last operation: {dataOverview.healthMetrics?.lastOperation ? 
                            new Date(dataOverview.healthMetrics.lastOperation).toLocaleString() : 'None'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={fetchDataOverview}
                        disabled={loading}
                        className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
                        <span className="font-medium text-blue-900">Refresh Data</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('actions')}
                        className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Manage Data</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('operations')}
                        className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <Activity className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-900">View Operations</span>
                      </button>
                      <button
                        onClick={handleExportData}
                        disabled={actionLoading}
                        className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-5 h-5 text-orange-600" />
                        <span className="font-medium text-orange-900">Export Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'operations' && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Operations</h3>
                    <p className="text-sm text-gray-600">History of data management operations</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {operations.length > 0 ? operations.map((operation) => (
                      <div key={operation.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(operation.status)}`}>
                                {operation.status}
                              </span>
                              <span className="font-medium text-gray-900">
                                {operation.operation_type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Affected {operation.affected_records} records
                              {operation.entity_types?.length > 0 && (
                                <span> in {operation.entity_types.join(', ')}</span>
                              )}
                            </p>
                            {operation.error_message && (
                              <p className="text-sm text-red-600 mt-1">{operation.error_message}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-900">
                              {new Date(operation.created_at).toLocaleString()}
                            </div>
                            {operation.completed_at && (
                              <div className="text-xs text-gray-500">
                                Completed: {new Date(operation.completed_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-gray-500">
                        No operations found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-6">
                  {/* Data Generation */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Generation</h3>
                    <p className="text-gray-600 mb-4">Generate mock data for development and testing purposes.</p>
                    <button
                      onClick={handleSeedData}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Generate Mock Data</span>
                    </button>
                  </div>

                  {/* Data Cleanup */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Cleanup</h3>
                    <p className="text-gray-600 mb-4">Remove mock data while preserving real user data.</p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleCleanupData(true)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Preview Cleanup</span>
                      </button>
                      <button
                        onClick={() => handleCleanupData(false)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Mock Data</span>
                      </button>
                    </div>
                  </div>

                  {/* Data Export */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
                    <p className="text-gray-600 mb-4">Export data for backup or migration purposes.</p>
                    <button
                      onClick={handleExportData}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export All Data</span>
                    </button>
                  </div>

                  {/* Safety Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-6 h-6 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Safety Notice</h4>
                        <p className="text-yellow-800 text-sm mt-1">
                          All destructive operations require confirmation and automatically create backups. 
                          Mock data is clearly flagged and separated from real user data to prevent accidental deletion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {actionLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-900">Processing operation...</span>
                  </div>
                </div>
              )}
            </div>
          </main>

          <NavigationHubFooter />
        </div>
      </div>
    </>
  );
}