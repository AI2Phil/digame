import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Zap, Key, Globe, Shield, Code, Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function ConfigurationAPI() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchApiData();
  }, []);

  const fetchApiData = async () => {
    try {
      const response = await fetch('/api/admin/config/api', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setApiData(result.data);
      } else {
        setApiData(getMockApiData());
      }
    } catch (error) {
      console.error('Error fetching API data:', error);
      setApiData(getMockApiData());
    } finally {
      setLoading(false);
    }
  };

  const getMockApiData = () => ({
    apiKey: 'sk-1234567890abcdef1234567890abcdef',
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/config',
        description: 'Get all configuration settings',
        rateLimit: '100/hour',
        authentication: 'required'
      },
      {
        method: 'POST',
        path: '/api/admin/config',
        description: 'Create new configuration setting',
        rateLimit: '50/hour',
        authentication: 'required'
      },
      {
        method: 'PUT',
        path: '/api/admin/config/{id}',
        description: 'Update configuration setting',
        rateLimit: '50/hour',
        authentication: 'required'
      },
      {
        method: 'DELETE',
        path: '/api/admin/config/{id}',
        description: 'Delete configuration setting',
        rateLimit: '25/hour',
        authentication: 'required'
      },
      {
        method: 'GET',
        path: '/api/admin/config/backup',
        description: 'Create configuration backup',
        rateLimit: '10/hour',
        authentication: 'required'
      }
    ],
    usage: {
      totalRequests: 1247,
      successfulRequests: 1198,
      failedRequests: 49,
      averageResponseTime: 145
    },
    recentRequests: [
      {
        timestamp: '2024-01-05T10:30:00Z',
        method: 'GET',
        endpoint: '/api/admin/config',
        status: 200,
        responseTime: 120,
        userAgent: 'ConfigManager/1.0'
      },
      {
        timestamp: '2024-01-05T10:25:00Z',
        method: 'PUT',
        endpoint: '/api/admin/config/auth-timeout',
        status: 200,
        responseTime: 89,
        userAgent: 'ConfigManager/1.0'
      },
      {
        timestamp: '2024-01-05T10:20:00Z',
        method: 'POST',
        endpoint: '/api/admin/config',
        status: 400,
        responseTime: 45,
        userAgent: 'curl/7.68.0'
      }
    ]
  });

  const getMethodColor = (method) => {
    const colors = {
      'GET': 'bg-green-100 text-green-600',
      'POST': 'bg-blue-100 text-blue-600',
      'PUT': 'bg-yellow-100 text-yellow-600',
      'DELETE': 'bg-red-100 text-red-600',
      'PATCH': 'bg-purple-100 text-purple-600'
    };
    return colors[method] || 'bg-gray-100 text-gray-600';
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return time.toLocaleDateString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const generateNewApiKey = () => {
    // Simulate API key generation
    const newKey = 'sk-' + Math.random().toString(36).substring(2, 34);
    setApiData({...apiData, apiKey: newKey});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Configuration API - Admin - Digame</title>
        <meta name="description" content="Programmatic access to configuration management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/admin/config" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to System Configuration</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuration API</h1>
              <p className="text-gray-600">Programmatic access to configuration management</p>
            </div>
          </div>

          {/* API Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{apiData?.usage?.totalRequests?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((apiData?.usage?.successfulRequests / apiData?.usage?.totalRequests) * 100)}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{apiData?.usage?.averageResponseTime}ms</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Endpoints</p>
                  <p className="text-2xl font-bold text-gray-900">{apiData?.endpoints?.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Code className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: <Globe className="w-4 h-4" /> },
                  { id: 'endpoints', label: 'Endpoints', icon: <Code className="w-4 h-4" /> },
                  { id: 'authentication', label: 'Authentication', icon: <Key className="w-4 h-4" /> },
                  { id: 'activity', label: 'Recent Activity', icon: <Zap className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Overview</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4">
                      The Configuration API provides programmatic access to manage system configurations. 
                      Use this API to automate configuration management, integrate with external systems, 
                      and build custom administration tools.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Base URL</h4>
                      <code className="text-blue-800 bg-blue-100 px-2 py-1 rounded">
                        https://api.digame.com/v1
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* Endpoints Tab */}
              {activeTab === 'endpoints' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Endpoints</h3>
                  <div className="space-y-4">
                    {apiData?.endpoints?.map((endpoint, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Shield className="w-3 h-3" />
                            <span>{endpoint.authentication}</span>
                            <span>•</span>
                            <span>{endpoint.rateLimit}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{endpoint.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Authentication Tab */}
              {activeTab === 'authentication' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Authentication</h3>
                  <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">API Key</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(apiData?.apiKey)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={generateNewApiKey}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <code className="text-sm font-mono bg-white border rounded px-3 py-2 block">
                        {showApiKey ? apiData?.apiKey : apiData?.apiKey?.replace(/./g, '•')}
                      </code>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">Usage Instructions</h4>
                      <div className="text-sm text-yellow-800 space-y-2">
                        <p>Include your API key in the Authorization header:</p>
                        <code className="block bg-yellow-100 border rounded px-3 py-2 font-mono">
                          Authorization: Bearer {showApiKey ? apiData?.apiKey : 'YOUR_API_KEY'}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent API Activity</h3>
                  <div className="space-y-3">
                    {apiData?.recentRequests?.map((request, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(request.method)}`}>
                            {request.method}
                          </span>
                          <code className="text-sm font-mono text-gray-800">{request.endpoint}</code>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <span className="text-gray-500">{request.responseTime}ms</span>
                          <span className="text-gray-500">{formatTimeAgo(request.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}