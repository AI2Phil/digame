import React, { useState, useEffect } from 'react';
import { Crown, Users, Building, DollarSign, Activity, AlertTriangle, TrendingUp, Server } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const PlatformOwnerConsolePage = () => {
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlatformOverview();
  }, []);

  const fetchPlatformOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/platform/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch platform overview');
      }

      const data = await response.json();
      setPlatformData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Platform Console...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Console</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchPlatformOverview}>Retry</Button>
        </div>
      </div>
    );
  }

  const overview = platformData?.overview || {};
  const subscriptionBreakdown = platformData?.subscription_breakdown || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Owner Console</h1>
                <p className="text-sm text-gray-500">Comprehensive platform management and analytics</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Crown className="w-3 h-3 mr-1" />
              Platform Owner Access
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                <p className="text-2xl font-semibold text-gray-900">{overview.total_tenants || 0}</p>
                <p className="text-sm text-green-600">
                  {overview.active_tenants || 0} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{overview.total_users || 0}</p>
                <p className="text-sm text-green-600">
                  {overview.active_users || 0} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Estimated MRR</p>
                <p className="text-2xl font-semibold text-gray-900">${overview.estimated_mrr || 0}</p>
                <p className="text-sm text-gray-500">Monthly Recurring Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">API Calls Today</p>
                <p className="text-2xl font-semibold text-gray-900">{overview.api_calls_today || 0}</p>
                <p className="text-sm text-gray-500">
                  {overview.total_storage_gb || 0} GB storage used
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Subscription Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(subscriptionBreakdown).map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        tier === 'free' ? 'bg-gray-400' :
                        tier === 'individual_pro' ? 'bg-blue-500' :
                        tier === 'team' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {tier.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = '/platform-owner/tenants'}
                >
                  <Building className="h-6 w-6 mb-2" />
                  <span className="text-sm">Manage Tenants</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = '/platform-owner/users'}
                >
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = '/platform-owner/revenue'}
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="text-sm">Revenue Analytics</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = '/platform-owner/health'}
                >
                  <Server className="h-6 w-6 mb-2" />
                  <span className="text-sm">System Health</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Platform Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h4 className="text-sm font-medium text-gray-900">System Health</h4>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">API Performance</h4>
                <p className="text-xs text-gray-500">Average response: 245ms</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Server className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Infrastructure</h4>
                <p className="text-xs text-gray-500">99.9% uptime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformOwnerConsolePage;