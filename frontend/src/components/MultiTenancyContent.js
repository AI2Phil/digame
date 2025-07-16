import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

/**
 * Enterprise Multi-Tenancy Management Page Content
 * 
 * Client-side only component to avoid SSR issues
 */
function MultiTenancyContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tenantData, setTenantData] = useState(null);
  const [error, setError] = useState(null);

  // SSR-safe data fetching with proper error handling
  const fetchTenantData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call with fallback data
      const mockData = {
        tenants: [
          {
            id: 1,
            name: 'Acme Corporation',
            users: 45,
            subscription: 'enterprise',
            status: 'active',
            lastActivity: '2025-01-16T10:30:00Z'
          },
          {
            id: 2,
            name: 'TechStart Inc',
            users: 23,
            subscription: 'professional',
            status: 'active',
            lastActivity: '2025-01-16T09:15:00Z'
          }
        ],
        metrics: {
          totalTenants: 2,
          totalUsers: 68,
          activeUsers: 52,
          storageUsed: 75
        }
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTenantData(mockData);
    } catch (err) {
      console.error('Failed to fetch tenant data:', err);
      setError('Failed to load tenant data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect with proper dependency array
  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading multi-tenancy dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={fetchTenantData}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Multi-Tenancy Management</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor all tenants across your enterprise deployment
          </p>
        </div>

        {/* Metrics Cards */}
        {tenantData?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Tenants</h3>
              <p className="text-2xl font-bold text-gray-900">{tenantData.metrics.totalTenants}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{tenantData.metrics.totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <p className="text-2xl font-bold text-gray-900">{tenantData.metrics.activeUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
              <p className="text-2xl font-bold text-gray-900">{tenantData.metrics.storageUsed}%</p>
            </div>
          </div>
        )}

        {/* Tenants Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Tenant Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenantData?.tenants?.map((tenant) => (
                  <tr key={tenant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.users}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tenant.subscription === 'enterprise' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tenant.subscription}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tenant.lastActivity).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiTenancyContent;