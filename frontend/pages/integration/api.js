import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  CodeBracketIcon, 
  KeyIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PlusIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export default function APIManagement() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('keys');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    fetchAPIData();
  }, []);

  const fetchAPIData = async () => {
    try {
      // Simulate API calls
      const [keysRes, endpointsRes, statsRes] = await Promise.all([
        fetch('/api/integration/api/keys'),
        fetch('/api/integration/api/endpoints'),
        fetch('/api/integration/api/stats')
      ]);
      
      const keysData = await keysRes.json();
      const endpointsData = await endpointsRes.json();
      const statsData = await statsRes.json();
      
      setApiKeys(keysData.data || []);
      setEndpoints(endpointsData.data || []);
      setStats(statsData.data || {});
    } catch (error) {
      console.error('Error fetching API data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'suspended':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'expired':
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateKey = async (keyData) => {
    try {
      const response = await fetch('/api/integration/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyData)
      });
      
      if (response.ok) {
        setShowKeyModal(false);
        fetchAPIData();
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const handleRevokeKey = async (keyId) => {
    try {
      const response = await fetch(`/api/integration/api/keys/${keyId}/revoke`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchAPIData();
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CodeBracketIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">API Management</h1>
                  <p className="text-sm text-gray-600">Manage API keys, endpoints, and documentation</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowKeyModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Generate Key
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <KeyIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">API Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalKeys || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Endpoints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEndpoints || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Requests Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.requestsToday || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BoltIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'keys', name: 'API Keys', icon: KeyIcon },
                { id: 'endpoints', name: 'Endpoints', icon: GlobeAltIcon },
                { id: 'documentation', name: 'Documentation', icon: DocumentTextIcon },
                { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'keys' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search keys..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Key Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Key Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permissions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {apiKeys.map((key) => (
                        <tr key={key.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{key.name}</div>
                            <div className="text-sm text-gray-500">{key.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                {key.value.substring(0, 20)}...
                              </code>
                              <button 
                                onClick={() => copyToClipboard(key.value)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                <ClipboardDocumentIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {key.permissions.map((permission, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {permission}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{key.requestsToday} / {key.rateLimit}</div>
                            <div className="text-xs text-gray-500">requests today</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(key.status)}
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                                {key.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {key.expiresAt || 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleRevokeKey(key.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'endpoints' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">API Endpoints</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Methods</option>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search endpoints..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="ml-3 text-sm font-mono bg-white px-3 py-1 rounded border">
                            {endpoint.path}
                          </code>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(endpoint.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(endpoint.status)}`}>
                            {endpoint.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{endpoint.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Requests Today</p>
                          <p className="text-lg font-semibold text-gray-900">{endpoint.requestsToday}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response Time</p>
                          <p className="text-lg font-semibold text-gray-900">{endpoint.avgResponseTime}ms</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</p>
                          <p className="text-lg font-semibold text-gray-900">{endpoint.successRate}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <span className="text-xs text-gray-500">Auth Required:</span>
                          <span className={`text-xs font-medium ${endpoint.authRequired ? 'text-red-600' : 'text-green-600'}`}>
                            {endpoint.authRequired ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Docs
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                            Test
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documentation' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">API Documentation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Quick Start Guide</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 border">
                        <h5 className="font-medium text-gray-900 mb-2">1. Generate API Key</h5>
                        <p className="text-sm text-gray-600">Create a new API key with appropriate permissions for your application.</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <h5 className="font-medium text-gray-900 mb-2">2. Authentication</h5>
                        <p className="text-sm text-gray-600">Include your API key in the Authorization header of your requests.</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <h5 className="font-medium text-gray-900 mb-2">3. Make Requests</h5>
                        <p className="text-sm text-gray-600">Start making API calls to our endpoints using your preferred HTTP client.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Code Examples</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">cURL</h5>
                        <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.example.com/v1/users`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">JavaScript</h5>
                        <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`fetch('https://api.example.com/v1/users', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Rate Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border">
                      <h5 className="font-medium text-gray-900">Free Tier</h5>
                      <p className="text-2xl font-bold text-blue-600 mt-2">1,000</p>
                      <p className="text-sm text-gray-600">requests per hour</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                      <h5 className="font-medium text-gray-900">Pro Tier</h5>
                      <p className="text-2xl font-bold text-green-600 mt-2">10,000</p>
                      <p className="text-sm text-gray-600">requests per hour</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                      <h5 className="font-medium text-gray-900">Enterprise</h5>
                      <p className="text-2xl font-bold text-purple-600 mt-2">Unlimited</p>
                      <p className="text-sm text-gray-600">custom rate limits</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">API Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Top Endpoints</h4>
                    <div className="space-y-3">
                      {[
                        { endpoint: '/api/v1/users', requests: 15420, percentage: 45.2 },
                        { endpoint: '/api/v1/projects', requests: 8950, percentage: 26.3 },
                        { endpoint: '/api/v1/tasks', requests: 6780, percentage: 19.9 },
                        { endpoint: '/api/v1/teams', requests: 2890, percentage: 8.6 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div>
                            <code className="text-sm font-mono">{item.endpoint}</code>
                            <p className="text-xs text-gray-500">{item.requests} requests</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Response Times</h4>
                    <div className="space-y-3">
                      {[
                        { range: '< 100ms', count: 12450, color: 'bg-green-500' },
                        { range: '100-500ms', count: 8920, color: 'bg-yellow-500' },
                        { range: '500ms-1s', count: 2340, color: 'bg-orange-500' },
                        { range: '> 1s', count: 890, color: 'bg-red-500' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-900">{item.range}</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className={`h-2 rounded-full ${item.color}`}
                                style={{ width: `${(item.count / 25000) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Generate API Key</h3>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Production API Key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Brief description of this API key usage..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['read', 'write', 'delete', 'admin'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-700 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/hour)</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="1000">1,000</option>
                    <option value="5000">5,000</option>
                    <option value="10000">10,000</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiration</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Never expires</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateKey({})}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}