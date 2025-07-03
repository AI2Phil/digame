import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const CustomIntegrations = () => {
  const router = useRouter();
  const [integrationsData, setIntegrationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchIntegrationsData();
  }, []);

  const fetchIntegrationsData = async () => {
    try {
      const response = await fetch('/api/enterprise/integrations');
      const data = await response.json();
      setIntegrationsData(data.data);
    } catch (error) {
      console.error('Error fetching integrations data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockIntegrationsData = {
    overview: {
      totalIntegrations: 45,
      activeIntegrations: 38,
      pendingApproval: 4,
      failed: 3
    },
    integrations: [
      {
        id: 1,
        name: 'Salesforce CRM Integration',
        tenant: 'TechCorp Solutions',
        type: 'CRM',
        status: 'active',
        lastSync: '2024-01-16T10:30:00Z',
        dataPoints: 15420,
        apiCalls: 2340,
        errorRate: 0.02,
        configuration: {
          endpoint: 'https://api.salesforce.com/v1',
          authentication: 'OAuth 2.0',
          syncFrequency: 'Every 15 minutes'
        }
      },
      {
        id: 2,
        name: 'Slack Notifications',
        tenant: 'Global Industries',
        type: 'Communication',
        status: 'active',
        lastSync: '2024-01-16T10:25:00Z',
        dataPoints: 8760,
        apiCalls: 1250,
        errorRate: 0.01,
        configuration: {
          endpoint: 'https://hooks.slack.com/services',
          authentication: 'Webhook Token',
          syncFrequency: 'Real-time'
        }
      },
      {
        id: 3,
        name: 'Custom Analytics API',
        tenant: 'DataFlow Inc',
        type: 'Analytics',
        status: 'pending',
        lastSync: null,
        dataPoints: 0,
        apiCalls: 0,
        errorRate: 0,
        configuration: {
          endpoint: 'https://api.dataflow.com/v2',
          authentication: 'API Key',
          syncFrequency: 'Hourly'
        }
      },
      {
        id: 4,
        name: 'HubSpot Marketing',
        tenant: 'Innovation Labs',
        type: 'Marketing',
        status: 'active',
        lastSync: '2024-01-16T09:45:00Z',
        dataPoints: 12340,
        apiCalls: 1890,
        errorRate: 0.03,
        configuration: {
          endpoint: 'https://api.hubapi.com/v3',
          authentication: 'OAuth 2.0',
          syncFrequency: 'Every 30 minutes'
        }
      },
      {
        id: 5,
        name: 'Jira Project Management',
        tenant: 'Future Systems',
        type: 'Project Management',
        status: 'error',
        lastSync: '2024-01-15T14:20:00Z',
        dataPoints: 5670,
        apiCalls: 890,
        errorRate: 0.15,
        configuration: {
          endpoint: 'https://futuresys.atlassian.net/rest/api/3',
          authentication: 'Basic Auth',
          syncFrequency: 'Every hour'
        }
      }
    ],
    availableConnectors: [
      { name: 'Salesforce', category: 'CRM', complexity: 'Medium', description: 'Customer relationship management' },
      { name: 'HubSpot', category: 'CRM', complexity: 'Low', description: 'Marketing and sales platform' },
      { name: 'Slack', category: 'Communication', complexity: 'Low', description: 'Team communication' },
      { name: 'Microsoft Teams', category: 'Communication', complexity: 'Medium', description: 'Collaboration platform' },
      { name: 'Jira', category: 'Project Management', complexity: 'Medium', description: 'Issue and project tracking' },
      { name: 'Asana', category: 'Project Management', complexity: 'Low', description: 'Work management' },
      { name: 'Zapier', category: 'Automation', complexity: 'Low', description: 'Workflow automation' },
      { name: 'Custom API', category: 'Custom', complexity: 'High', description: 'Build your own integration' }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'disabled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CreateIntegrationModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create Custom Integration</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Integration Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter integration name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>TechCorp Solutions</option>
                <option>Global Industries</option>
                <option>DataFlow Inc</option>
                <option>Innovation Labs</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Integration Type</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>CRM</option>
                <option>Communication</option>
                <option>Project Management</option>
                <option>Marketing</option>
                <option>Analytics</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Connector</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {mockIntegrationsData.availableConnectors.map((connector, index) => (
                  <option key={index}>{connector.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="https://api.example.com/v1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authentication</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>API Key</option>
                <option>OAuth 2.0</option>
                <option>Basic Auth</option>
                <option>Bearer Token</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sync Frequency</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Real-time</option>
                <option>Every 5 minutes</option>
                <option>Every 15 minutes</option>
                <option>Every 30 minutes</option>
                <option>Hourly</option>
                <option>Daily</option>
              </select>
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
            Create Integration
          </button>
        </div>
      </div>
    </div>
  );

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
        title="Custom Integrations"
        subtitle="Enterprise integration platform and connector management"
        breadcrumbs={[
          { label: 'Enterprise', href: '/enterprise' },
          { label: 'Custom Integrations', href: '/enterprise/integrations' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Integrations</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {mockIntegrationsData.overview.totalIntegrations}
            </div>
            <div className="text-sm text-gray-600 mt-1">Across all tenants</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Integrations</h3>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {mockIntegrationsData.overview.activeIntegrations}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {Math.round((mockIntegrationsData.overview.activeIntegrations / mockIntegrationsData.overview.totalIntegrations) * 100)}% success rate
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Approval</h3>
            <div className="text-3xl font-bold text-yellow-600 mt-2">
              {mockIntegrationsData.overview.pendingApproval}
            </div>
            <div className="text-sm text-gray-600 mt-1">Awaiting review</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Failed Integrations</h3>
            <div className="text-3xl font-bold text-red-600 mt-2">
              {mockIntegrationsData.overview.failed}
            </div>
            <div className="text-sm text-gray-600 mt-1">Need attention</div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-4">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Filter by Status
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Filter by Type
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Integration
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Active Integrations' },
              { id: 'connectors', label: 'Available Connectors' },
              { id: 'monitoring', label: 'Monitoring' },
              { id: 'logs', label: 'Integration Logs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Integrations Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {mockIntegrationsData.integrations.map((integration) => (
              <div key={integration.id} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-600">{integration.tenant} • {integration.type}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                        {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Last Sync</div>
                      <div className="text-sm text-gray-900 mt-1">{formatDate(integration.lastSync)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Data Points</div>
                      <div className="text-sm text-gray-900 mt-1">{integration.dataPoints.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">API Calls</div>
                      <div className="text-sm text-gray-900 mt-1">{integration.apiCalls.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Error Rate</div>
                      <div className={`text-sm mt-1 ${
                        integration.errorRate > 0.1 ? 'text-red-600' : 
                        integration.errorRate > 0.05 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {(integration.errorRate * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Endpoint:</span>
                        <div className="text-gray-900 mt-1 break-all">{integration.configuration.endpoint}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Authentication:</span>
                        <div className="text-gray-900 mt-1">{integration.configuration.authentication}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Sync Frequency:</span>
                        <div className="text-gray-900 mt-1">{integration.configuration.syncFrequency}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Test Connection
                      </button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        View Logs
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Sync Now
                      </button>
                      {integration.status === 'active' ? (
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          Pause
                        </button>
                      ) : (
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                          Resume
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Available Connectors Tab */}
        {activeTab === 'connectors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockIntegrationsData.availableConnectors.map((connector, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">{connector.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(connector.complexity)}`}>
                    {connector.complexity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{connector.description}</p>
                <div className="text-sm text-gray-500 mb-4">Category: {connector.category}</div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Integration
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Health Overview</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-600">Integration monitoring dashboard</p>
                  <p className="text-sm text-gray-500">Real-time health metrics and alerts</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Response Time</span>
                    <span className="text-sm font-medium">245ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-sm font-medium text-green-600">98.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total API Calls (24h)</span>
                    <span className="text-sm font-medium">45,230</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data Throughput</span>
                    <span className="text-sm font-medium">2.3 GB/day</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">High error rate detected</p>
                      <p className="text-xs text-yellow-600">Jira integration - 5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">Integration restored</p>
                      <p className="text-xs text-green-600">Salesforce CRM - 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integration Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Integration Activity Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Integration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { time: '10:30 AM', integration: 'Salesforce CRM', action: 'Data Sync', status: 'success', details: '1,234 records synced' },
                    { time: '10:25 AM', integration: 'Slack Notifications', action: 'Message Sent', status: 'success', details: 'Alert notification delivered' },
                    { time: '10:20 AM', integration: 'HubSpot Marketing', action: 'Contact Update', status: 'success', details: '567 contacts updated' },
                    { time: '10:15 AM', integration: 'Jira Project Management', action: 'Issue Sync', status: 'error', details: 'Authentication failed' },
                    { time: '10:10 AM', integration: 'Custom Analytics API', action: 'Health Check', status: 'pending', details: 'Awaiting response' }
                  ].map((log, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.integration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && <CreateIntegrationModal />}
    </div>
  );
};

export default CustomIntegrations;