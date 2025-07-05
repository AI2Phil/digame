import React, { useState } from 'react';
import Head from 'next/head';
import { Users, Crown, Search, Filter, Plus, MoreVertical, CheckCircle, XCircle, AlertTriangle, Shield, Mail, Phone } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@acme.com',
      role: 'platform_owner',
      subscriptionTier: 'platform_owner',
      status: 'active',
      tenant: 'Acme Corporation',
      lastLogin: '2024-01-30T14:30:00Z',
      created: '2023-06-15T09:00:00Z',
      permissions: ['all'],
      loginCount: 1247,
      avatar: null,
      phone: '+1 (555) 123-4567',
      department: 'Executive',
      isVerified: true,
      mfaEnabled: true
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@techstart.com',
      role: 'admin',
      subscriptionTier: 'team',
      status: 'active',
      tenant: 'TechStart Inc',
      lastLogin: '2024-01-30T09:15:00Z',
      created: '2023-09-22T10:30:00Z',
      permissions: ['admin', 'team_management'],
      loginCount: 892,
      avatar: null,
      phone: '+1 (555) 987-6543',
      department: 'Operations',
      isVerified: true,
      mfaEnabled: true
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael@globalsolutions.com',
      role: 'user',
      subscriptionTier: 'enterprise',
      status: 'suspended',
      tenant: 'Global Solutions Ltd',
      lastLogin: '2024-01-25T16:45:00Z',
      created: '2023-03-10T14:20:00Z',
      permissions: ['basic'],
      loginCount: 456,
      avatar: null,
      phone: '+1 (555) 456-7890',
      department: 'Engineering',
      isVerified: true,
      mfaEnabled: false
    },
    {
      id: 4,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily@innovationlabs.com',
      role: 'user',
      subscriptionTier: 'professional',
      status: 'active',
      tenant: 'Innovation Labs',
      lastLogin: '2024-01-30T11:20:00Z',
      created: '2024-01-20T08:45:00Z',
      permissions: ['basic', 'ai_tools'],
      loginCount: 23,
      avatar: null,
      phone: '+1 (555) 234-5678',
      department: 'Research',
      isVerified: false,
      mfaEnabled: false
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Kim',
      email: 'david@dataflow.com',
      role: 'admin',
      subscriptionTier: 'team',
      status: 'inactive',
      tenant: 'DataFlow Systems',
      lastLogin: '2024-01-15T08:30:00Z',
      created: '2023-11-05T16:15:00Z',
      permissions: ['admin', 'analytics'],
      loginCount: 234,
      avatar: null,
      phone: '+1 (555) 345-6789',
      department: 'Data Science',
      isVerified: true,
      mfaEnabled: true
    },
    {
      id: 6,
      firstName: 'Lisa',
      lastName: 'Wang',
      email: 'lisa.wang@acme.com',
      role: 'user',
      subscriptionTier: 'enterprise',
      status: 'active',
      tenant: 'Acme Corporation',
      lastLogin: '2024-01-29T13:45:00Z',
      created: '2023-07-20T11:30:00Z',
      permissions: ['basic', 'team_collaboration'],
      loginCount: 678,
      avatar: null,
      phone: '+1 (555) 567-8901',
      department: 'Marketing',
      isVerified: true,
      mfaEnabled: true
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'platform_owner': return 'text-yellow-600 bg-yellow-100';
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'user': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'platform_owner': return 'text-yellow-600 bg-yellow-100';
      case 'enterprise': return 'text-purple-600 bg-purple-100';
      case 'team': return 'text-blue-600 bg-blue-100';
      case 'professional': return 'text-green-600 bg-green-100';
      case 'free': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.tenant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    platformOwners: users.filter(u => u.role === 'platform_owner').length,
    verifiedUsers: users.filter(u => u.isVerified).length
  };

  return (
    <>
      <Head>
        <title>User Management - Platform Owner - Digame</title>
        <meta name="description" content="Manage all platform users across all tenants" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="User Management"
          subtitle="Manage all platform users across all tenants"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          badge="PLATFORM OWNER"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.activeUsers}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Owners</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.platformOwners}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.verifiedUsers}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Shield className="w-6 h-6 text-purple-600" />
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
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="platform_owner">Platform Owner</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              {user.role === 'platform_owner' && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                              {user.isVerified && (
                                <Shield className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role === 'platform_owner' && <Crown className="w-3 h-3 mr-1" />}
                          <span className="capitalize">{user.role.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(user.subscriptionTier)}`}>
                          <span className="capitalize">{user.subscriptionTier.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          <span className="ml-1 capitalize">{user.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.tenant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedUser(user)}
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

          {/* User Details Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-xl">
                          {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xl font-semibold text-gray-900">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </h4>
                          {selectedUser.role === 'platform_owner' && (
                            <Crown className="w-5 h-5 text-yellow-500" />
                          )}
                          {selectedUser.isVerified && (
                            <Shield className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-gray-600">{selectedUser.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                            <span className="capitalize">{selectedUser.role.replace('_', ' ')}</span>
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                            {getStatusIcon(selectedUser.status)}
                            <span className="ml-1 capitalize">{selectedUser.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Tenant</label>
                          <div className="font-medium">{selectedUser.tenant}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Department</label>
                          <div className="font-medium">{selectedUser.department}</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Subscription Tier</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(selectedUser.subscriptionTier)}`}>
                            <span className="capitalize">{selectedUser.subscriptionTier.replace('_', ' ')}</span>
                          </span>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Login Count</label>
                          <div className="font-medium">{selectedUser.loginCount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedUser.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Security */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Security</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Email Verified</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.isVerified ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                            {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">MFA Enabled</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.mfaEnabled ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                            {selectedUser.mfaEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Permissions</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.permissions.map((permission, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Edit User
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Reset Password
                      </button>
                      <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                        Suspend User
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