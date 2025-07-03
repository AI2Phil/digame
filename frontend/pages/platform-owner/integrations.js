import React, { useState } from 'react';
import Head from 'next/head';
import { Plug, Key, Webhook, Download, Upload, Settings, Plus, Eye, EyeOff, Copy, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import PageHeader from '../../src/components/navigation/PageHeader';

export default function IntegrationsAPI() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState({});
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const integrationStats = {
    totalIntegrations: 24,
    activeConnections: 18,
    apiCalls: 1247892,
    webhookEvents: 45623,
    dataTransfer: '2.4 TB',
    uptime: '99.97%'
  };

  const ssoProviders = [
    {
      id: 1,
      name: 'Google Workspace',
      provider: 'google',
      status: 'active',
      users: 1234,
      lastSync: '2024-01-30T14:30:00Z',
      config: {
        domain: 'company.com',
        autoProvisioning: true,
        groupMapping: true
      }
    },
    {
      id: 2,
      name: 'Microsoft Azure AD',
      provider: 'azure',
      status: 'active',
      users: 856,
      lastSync: '2024-01-30T13:45:00Z',
      config: {
        tenantId: 'abc123-def456',
        autoProvisioning: true,
        groupMapping: false
      }
    },
    {
      id: 3,
      name: 'Okta',
      provider: 'okta',
      status: 'inactive',
      users: 0,
      lastSync: null,
      config: {
        domain: 'company.okta.com',
        autoProvisioning: false,
        groupMapping: false
      }
    }
  ];

  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'pk_live_1234567890abcdef',
      permissions: ['read', 'write', 'admin'],
      lastUsed: '2024-01-30T15:30:00Z',
      created: '2024-01-01T00:00:00Z',
      status: 'active',
      usage: 45623
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'pk_test_abcdef1234567890',
      permissions: ['read', 'write'],
      lastUsed: '2024-01-30T12:15:00Z',
      created: '2024-01-15T00:00:00Z',
      status: 'active',
      usage: 12847
    },
    {
      id: 3,
      name: 'Analytics Integration',
      key: 'pk_live_analytics_xyz789',
      permissions: ['read'],
      lastUsed: '2024-01-29T18:45:00Z',
      created: '2024-01-20T00:00:00Z',
      status: 'active',
      usage: 8934
    }
  ];

  const webhooks = [
    {
      id: 1,
      name: 'User Registration Webhook',
      url: 'https://api.company.com/webhooks/user-registration',
      events: ['user.created', 'user.updated'],
      status: 'active',
      lastTriggered: '2024-01-30T15:45:00Z',
      successRate: 98.5,
      retries: 3
    },
    {
      id: 2,
      name: 'Payment Processing Webhook',
      url: 'https://payments.company.com/webhooks/digame',
      events: ['payment.succeeded', 'payment.failed'],
      status: 'active',
      lastTriggered: '2024-01-30T14:20:00Z',
      successRate: 99.2,
      retries: 5
    },
    {
      id: 3,
      name: 'Analytics Webhook',
      url: 'https://analytics.company.com/webhooks/events',
      events: ['user.activity', 'feature.used'],
      status: 'failed',
      lastTriggered: '2024-01-30T10:30:00Z',
      successRate: 45.2,
      retries: 3
    }
  ];

  const dataExports = [
    {
      id: 1,
      name: 'User Data Export',
      type: 'users',
      format: 'CSV',
      size: '45.2 MB',
      created: '2024-01-30T10:00:00Z',
      status: 'completed',
      downloadUrl: '/exports/users-2024-01-30.csv'
    },
    {
      id: 2,
      name: 'Analytics Data Export',
      type: 'analytics',
      format: 'JSON',
      size: '128.7 MB',
      created: '2024-01-29T15:30:00Z',
      status: 'completed',
      downloadUrl: '/exports/analytics-2024-01-29.json'
    },
    {
      id: 3,
      name: 'Transaction Export',
      type: 'transactions',
      format: 'CSV',
      size: '23.4 MB',
      created: '2024-01-30T14:00:00Z',
      status: 'processing',
      downloadUrl: null
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case 'completed': return 'text-green-600 bg-green-100';
      case 'inactive': case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'failed': case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleApiKeyVisibility = (keyId) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const maskApiKey = (key) => {
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  return (
    <>
      <Head>
        <title>Integrations & API - Platform Owner - Digame</title>
        <meta name="description" content="Integration and API management for platform owners" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Integrations & API"
          subtitle="Integration and API management for platform owners"
          icon={<Plug className="w-6 h-6 text-purple-600" />}
          badge="PLATFORM OWNER"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: Plug },
                  { id: 'sso', label: 'SSO Providers', icon: Key },
                  { id: 'api', label: 'API Keys', icon: Key },
                  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                  { id: 'data', label: 'Data Export/Import', icon: Download }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Integration Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Plug className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Total Integrations</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{integrationStats.totalIntegrations}</div>
                  <div className="text-sm text-gray-600">{integrationStats.activeConnections} active</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">API Calls</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{integrationStats.apiCalls.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Webhook className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Webhook Events</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{integrationStats.webhookEvents.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Download className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-900">Data Transfer</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{integrationStats.dataTransfer}</div>
                  <div className="text-sm text-gray-600">This month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <RefreshCw className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-gray-900">API Uptime</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">{integrationStats.uptime}</div>
                  <div className="text-sm text-gray-600">Last 30 days</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Plus className="w-5 h-5 text-purple-600" />
                    <span>Add Integration</span>
                  </button>
                  <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Key className="w-5 h-5 text-blue-600" />
                    <span>Generate API Key</span>
                  </button>
                  <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Webhook className="w-5 h-5 text-green-600" />
                    <span>Create Webhook</span>
                  </button>
                  <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Download className="w-5 h-5 text-orange-600" />
                    <span>Export Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SSO Providers Tab */}
          {activeTab === 'sso' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">SSO Providers</h3>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Add SSO Provider
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {ssoProviders.map((provider) => (
                    <div key={provider.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {provider.provider.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{provider.name}</h4>
                            <p className="text-sm text-gray-600">{provider.users.toLocaleString()} users</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                            {provider.status}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Domain:</span>
                          <span className="ml-2 font-medium">{provider.config.domain || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Auto Provisioning:</span>
                          <span className="ml-2 font-medium">{provider.config.autoProvisioning ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Sync:</span>
                          <span className="ml-2 font-medium">
                            {provider.lastSync ? new Date(provider.lastSync).toLocaleString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Generate New Key
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                          <div className="flex items-center space-x-2 mt-2">
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                              {showApiKey[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                            </code>
                            <button
                              onClick={() => toggleApiKeyVisibility(apiKey.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showApiKey[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(apiKey.key)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apiKey.status)}`}>
                            {apiKey.status}
                          </span>
                          <button className="text-gray-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Permissions:</span>
                          <div className="mt-1">
                            {apiKey.permissions.map((permission) => (
                              <span key={permission} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Usage:</span>
                          <span className="ml-2 font-medium">{apiKey.usage.toLocaleString()} calls</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Used:</span>
                          <span className="ml-2 font-medium">{new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <span className="ml-2 font-medium">{new Date(apiKey.created).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Webhooks</h3>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Create Webhook
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="text-sm text-gray-600">{webhook.url}</code>
                            <button className="text-gray-400 hover:text-gray-600">
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(webhook.status)}`}>
                            {webhook.status}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Events:</span>
                          <div className="mt-1">
                            {webhook.events.map((event) => (
                              <span key={event} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1">
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="ml-2 font-medium">{webhook.successRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Max Retries:</span>
                          <span className="ml-2 font-medium">{webhook.retries}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Triggered:</span>
                          <span className="ml-2 font-medium">{new Date(webhook.lastTriggered).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Data Export/Import Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* Export Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Data Exports</h3>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                    Create Export
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {dataExports.map((exportItem) => (
                    <div key={exportItem.id} className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{exportItem.name}</h4>
                          <p className="text-sm text-gray-600">{exportItem.format} • {exportItem.size}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exportItem.status)}`}>
                            {exportItem.status}
                          </span>
                          {exportItem.downloadUrl && (
                            <button className="text-blue-600 hover:text-blue-700">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(exportItem.created).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Import Section */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Data Import</h3>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Import Data
                  </button>
                </div>
                <div className="p-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Import Data</h4>
                    <p className="text-gray-600 mb-4">
                      Upload CSV, JSON, or XML files to import data into the platform
                    </p>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                      Choose File
                    </button>
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