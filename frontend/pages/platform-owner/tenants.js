import React, { useState } from 'react';
import Head from 'next/head';
import { Building, Users, TrendingUp, Settings, Crown, Plus, Search, Filter, MoreVertical, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import PageHeader from '../../src/components/navigation/PageHeader';

export default function TenantManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState(null);

  const tenants = [
    {
      id: 1,
      name: 'Acme Corporation',
      domain: 'acme.digame.com',
      status: 'active',
      plan: 'enterprise',
      users: 245,
      revenue: 12500,
      created: '2023-06-15',
      lastActive: '2024-01-30T14:30:00Z',
      usage: {
        storage: 85,
        bandwidth: 67,
        apiCalls: 92
      },
      contact: {
        name: 'John Smith',
        email: 'john.smith@acme.com',
        phone: '+1 (555) 123-4567'
      }
    },
    {
      id: 2,
      name: 'TechStart Inc',
      domain: 'techstart.digame.com',
      status: 'active',
      plan: 'team',
      users: 45,
      revenue: 2400,
      created: '2023-09-22',
      lastActive: '2024-01-30T09:15:00Z',
      usage: {
        storage: 34,
        bandwidth: 45,
        apiCalls: 56
      },
      contact: {
        name: 'Sarah Johnson',
        email: 'sarah@techstart.com',
        phone: '+1 (555) 987-6543'
      }
    },
    {
      id: 3,
      name: 'Global Solutions Ltd',
      domain: 'global.digame.com',
      status: 'suspended',
      plan: 'enterprise',
      users: 189,
      revenue: 8900,
      created: '2023-03-10',
      lastActive: '2024-01-25T16:45:00Z',
      usage: {
        storage: 78,
        bandwidth: 23,
        apiCalls: 12
      },
      contact: {
        name: 'Michael Chen',
        email: 'michael@globalsolutions.com',
        phone: '+1 (555) 456-7890'
      }
    },
    {
      id: 4,
      name: 'Innovation Labs',
      domain: 'innovation.digame.com',
      status: 'trial',
      plan: 'professional',
      users: 12,
      revenue: 0,
      created: '2024-01-20',
      lastActive: '2024-01-30T11:20:00Z',
      usage: {
        storage: 15,
        bandwidth: 28,
        apiCalls: 34
      },
      contact: {
        name: 'Emily Rodriguez',
        email: 'emily@innovationlabs.com',
        phone: '+1 (555) 234-5678'
      }
    },
    {
      id: 5,
      name: 'DataFlow Systems',
      domain: 'dataflow.digame.com',
      status: 'inactive',
      plan: 'team',
      users: 67,
      revenue: 3200,
      created: '2023-11-05',
      lastActive: '2024-01-15T08:30:00Z',
      usage: {
        storage: 45,
        bandwidth: 12,
        apiCalls: 8
      },
      contact: {
        name: 'David Kim',
        email: 'david@dataflow.com',
        phone: '+1 (555) 345-6789'
      }
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trial': return 'text-blue-600 bg-blue-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'trial': return <AlertTriangle className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'enterprise': return 'text-purple-600 bg-purple-100';
      case 'team': return 'text-blue-600 bg-blue-100';
      case 'professional': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStats = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter(t => t.status === 'active').length,
    totalRevenue: tenants.reduce((sum, t) => sum + t.revenue, 0),
    totalUsers: tenants.reduce((sum, t) => sum + t.users, 0)
  };

  return (
    <>
      <Head>
        <title>Tenant Management - Platform Owner - Digame</title>
        <meta name="description" content="Manage all platform tenants and organizations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Tenant Management"
          subtitle="Manage all platform tenants and organizations"
          icon={<Building className="w-6 h-6 text-blue-600" />}
          badge="PLATFORM OWNER"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.totalTenants}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.activeTenants}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${totalStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                <span>Add Tenant</span>
              </button>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
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
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                            <div className="text-sm text-gray-500">{tenant.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                          {getStatusIcon(tenant.status)}
                          <span className="ml-1 capitalize">{tenant.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(tenant.plan)}`}>
                          {tenant.plan === 'enterprise' && <Crown className="w-3 h-3 mr-1" />}
                          <span className="capitalize">{tenant.plan}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tenant.users.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${tenant.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tenant.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedTenant(tenant)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tenant Details Modal */}
          {selectedTenant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Tenant Details</h3>
                    <button
                      onClick={() => setSelectedTenant(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Name</label>
                          <div className="font-medium">{selectedTenant.name}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Domain</label>
                          <div className="font-medium">{selectedTenant.domain}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Status</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTenant.status)}`}>
                            {getStatusIcon(selectedTenant.status)}
                            <span className="ml-1 capitalize">{selectedTenant.status}</span>
                          </span>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Plan</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(selectedTenant.plan)}`}>
                            {selectedTenant.plan === 'enterprise' && <Crown className="w-3 h-3 mr-1" />}
                            <span className="capitalize">{selectedTenant.plan}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Usage Statistics</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Storage Usage</span>
                            <span>{selectedTenant.usage.storage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${selectedTenant.usage.storage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Bandwidth Usage</span>
                            <span>{selectedTenant.usage.bandwidth}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${selectedTenant.usage.bandwidth}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>API Calls</span>
                            <span>{selectedTenant.usage.apiCalls}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${selectedTenant.usage.apiCalls}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="text-sm text-gray-600">Primary Contact</label>
                          <div className="font-medium">{selectedTenant.contact.name}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Email</label>
                          <div className="font-medium">{selectedTenant.contact.email}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Phone</label>
                          <div className="font-medium">{selectedTenant.contact.phone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Edit Tenant
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        View Analytics
                      </button>
                      <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                        Suspend
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}