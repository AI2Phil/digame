import React, { useState, useEffect } from 'react';
import { Building, Users, Settings, Globe, ArrowRightLeft, Plus, Eye, Edit } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const MultiTenantConsolePage = () => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTenantSwitcher, setShowTenantSwitcher] = useState(false);

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      // Fetch current tenant info and available tenants
      const [tenantResponse, usersResponse] = await Promise.all([
        fetch('/api/v1/enterprise/multi-tenant/current', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/v1/enterprise/multi-tenant/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!tenantResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch tenant data');
      }

      const tenantData = await tenantResponse.json();
      const usersData = await usersResponse.json();

      setCurrentTenant(tenantData.current_tenant);
      setAvailableTenants(tenantData.available_tenants || []);
      setTenantUsers(usersData.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId) => {
    try {
      const response = await fetch('/api/v1/enterprise/multi-tenant/switch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tenant_id: tenantId })
      });

      if (!response.ok) {
        throw new Error('Failed to switch tenant');
      }

      // Refresh the page to update context
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'team': return 'bg-green-100 text-green-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Multi-Tenant Console...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTenantData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Multi-Tenant Console</h1>
                <p className="text-sm text-gray-500">Manage multiple tenant environments</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Advanced Enterprise
            </Badge>
          </div>
        </div>
      </div>

      {/* Current Tenant Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentTenant?.name || 'No Tenant Selected'}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentTenant?.slug} • {currentTenant?.subscription_tier?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowTenantSwitcher(!showTenantSwitcher)}
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Switch Tenant
              </Button>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Tenant Settings
              </Button>
            </div>
          </div>

          {/* Tenant Switcher Dropdown */}
          {showTenantSwitcher && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Available Tenants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      currentTenant?.id === tenant.id ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => switchTenant(tenant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500">{tenant.slug}</p>
                      </div>
                      <Badge className={`text-xs ${getTierBadgeColor(tenant.subscription_tier)}`}>
                        {tenant.subscription_tier?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tenant Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentTenant?.current_users || 0}
                </p>
                <p className="text-sm text-gray-500">
                  of {currentTenant?.max_users || 0} allowed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Storage Used</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentTenant?.current_storage_gb || 0} GB
                </p>
                <p className="text-sm text-gray-500">
                  of {currentTenant?.max_storage_gb || 0} GB limit
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">API Calls</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentTenant?.current_api_calls_monthly || 0}
                </p>
                <p className="text-sm text-gray-500">
                  of {currentTenant?.max_api_calls_monthly || 0} monthly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Tenant Users ({tenantUsers.length})
            </h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenantUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.name?.charAt(0) || user.email?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="text-xs bg-blue-100 text-blue-800">
                        {user.role || 'User'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`text-xs ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Settings className="h-6 w-6 mb-2" />
            <span className="text-sm">Tenant Settings</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Users className="h-6 w-6 mb-2" />
            <span className="text-sm">User Management</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Globe className="h-6 w-6 mb-2" />
            <span className="text-sm">Domain Settings</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Building className="h-6 w-6 mb-2" />
            <span className="text-sm">Billing & Usage</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiTenantConsolePage;