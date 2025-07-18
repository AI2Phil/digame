import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const TenantManagement = () => {
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    plan: 'all',
    search: ''
  });

  useEffect(() => {
    fetchTenants();
  }, [filters]);

  const fetchTenants = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.plan !== 'all') queryParams.append('plan', filters.plan);
      
      const response = await fetch(`/api/enterprise/tenants?${queryParams}`);
      const data = await response.json();
      setTenants(data.data?.tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockTenants = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      domain: 'techcorp.digame.com',
      contactEmail: 'admin@techcorp.com',
      users: 2341,
      plan: 'Enterprise Plus',
      revenue: 45600,
      status: 'active',
      features: ['SSO', 'Advanced Analytics', 'Custom Integrations'],
      createdAt: '2023-01-15',
      lastActivity: '2024-01-16T10:30:00Z',
      billing: {
        nextBilling: '2024-02-15',
        paymentMethod: 'Credit Card',
        autoRenew: true
      }
    },
    {
      id: 2,
      name: 'Global Industries',
      domain: 'global.digame.com',
      contactEmail: 'it@globalind.com',
      users: 1987,
      plan: 'Enterprise',
      revenue: 38200,
      status: 'active',
      features: ['SSO', 'Analytics'],
      createdAt: '2023-02-20',
      lastActivity: '2024-01-16T09:15:00Z',
      billing: {
        nextBilling: '2024-02-20',
        paymentMethod: 'Bank Transfer',
        autoRenew: true
      }
    },
    {
      id: 3,
      name: 'DataFlow Inc',
      domain: 'dataflow.digame.com',
      contactEmail: 'ops@dataflow.com',
      users: 1654,
      plan: 'Enterprise',
      revenue: 32100,
      status: 'warning',
      features: ['Analytics', 'API Access'],
      createdAt: '2023-03-10',
      lastActivity: '2024-01-15T16:45:00Z',
      billing: {
        nextBilling: '2024-03-10',
        paymentMethod: 'Credit Card',
        autoRenew: false
      }
    },
    {
      id: 4,
      name: 'Innovation Labs',
      domain: 'innovation.digame.com',
      contactEmail: 'admin@innovationlabs.com',
      users: 1432,
      plan: 'Enterprise Plus',
      revenue: 28900,
      status: 'active',
      features: ['SSO', 'Advanced Analytics', 'Custom Integrations', 'Priority Support'],
      createdAt: '2023-04-05',
      lastActivity: '2024-01-16T11:20:00Z',
      billing: {
        nextBilling: '2024-04-05',
        paymentMethod: 'Credit Card',
        autoRenew: true
      }
    },
    {
      id: 5,
      name: 'Future Systems',
      domain: 'future.digame.com',
      contactEmail: 'contact@futuresys.com',
      users: 1298,
      plan: 'Enterprise',
      revenue: 25400,
      status: 'suspended',
      features: ['Analytics'],
      createdAt: '2023-05-12',
      lastActivity: '2024-01-10T14:30:00Z',
      billing: {
        nextBilling: '2024-05-12',
        paymentMethod: 'Credit Card',
        autoRenew: false
      }
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending_setup':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const CreateTenantModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New Tenant</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter tenant name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="subdomain.digame.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="admin@company.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Enterprise</option>
                <option>Enterprise Plus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Users</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['SSO', 'Advanced Analytics', 'Custom Integrations', 'Priority Support', 'API Access'].map((feature) => (
                <label key={feature} className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Tenant
          </button>
        </div>
      </div>
    </div>
  );

  const TenantDetailsModal = ({ tenant, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{tenant.name} - Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Domain:</span> {tenant.domain}</div>
                <div><span className="font-medium">Contact Email:</span> {tenant.contactEmail}</div>
                <div><span className="font-medium">Plan:</span> {tenant.plan}</div>
                <div><span className="font-medium">Users:</span> {tenant.users.toLocaleString()}</div>
                <div><span className="font-medium">Revenue:</span> ${tenant.revenue.toLocaleString()}</div>
                <div><span className="font-medium">Created:</span> {formatDate(tenant.createdAt)}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(tenant.status)}`}>
                    {tenant.status}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Billing Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Next Billing:</span> {formatDate(tenant.billing.nextBilling)}</div>
                <div><span className="font-medium">Payment Method:</span> {tenant.billing.paymentMethod}</div>
                <div><span className="font-medium">Auto Renew:</span> {tenant.billing.autoRenew ? 'Yes' : 'No'}</div>
              </div>
              <h4 className="font-medium text-gray-900 mb-3 mt-6">Features</h4>
              <div className="flex flex-wrap gap-2">
                {tenant.features.map((feature, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Edit Tenant
          </button>
        </div>
      </div>
    </div>
  );

  const filteredTenants = mockTenants.filter(tenant => {
    const matchesStatus = filters.status === 'all' || tenant.status === filters.status;
    const matchesPlan = filters.plan === 'all' || tenant.plan === filters.plan;
    const matchesSearch = filters.search === '' || 
      tenant.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesPlan && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Tenant Management"
        subtitle="Manage enterprise tenants and their configurations"
        breadcrumbs={[
          { label: 'Enterprise', href: '/enterprise' },
          { label: 'Tenant Management', href: '/enterprise/tenants' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tenants..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 pl-10 text-sm w-64"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="warning">Warning</option>
              <option value="suspended">Suspended</option>
              <option value="pending_setup">Pending Setup</option>
            </select>
            <select
              value={filters.plan}
              onChange={(e) => setFilters({...filters, plan: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Enterprise Plus">Enterprise Plus</option>
            </select>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Tenant
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Tenants</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">{mockTenants.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Tenants</h3>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {mockTenants.filter(t => t.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {mockTenants.reduce((sum, t) => sum + t.users, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${mockTenants.reduce((sum, t) => sum + t.revenue, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Tenants ({filteredTenants.length})
            </h3>
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
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.domain}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.users.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${tenant.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tenant.status)}`}>
                        {tenant.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(tenant.lastActivity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedTenant(tenant)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && <CreateTenantModal />}
      {selectedTenant && (
        <TenantDetailsModal 
          tenant={selectedTenant} 
          onClose={() => setSelectedTenant(null)} 
        />
      )}
    </div>
  );
};

export default TenantManagement;