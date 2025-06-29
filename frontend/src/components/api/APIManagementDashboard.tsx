import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Code, Play, Pause, RotateCcw, Download, Upload,
  Clock, CheckCircle, XCircle, AlertTriangle,
  BarChart3, Activity, Database, Globe, Key,
  Settings, Eye, EyeOff, Copy, Edit, Trash2,
  Plus, Filter, Search, Calendar, FileText,
  Zap, Shield, Monitor, TrendingUp, TrendingDown
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'active' | 'deprecated' | 'beta' | 'maintenance';
  version: string;
  category: string;
  authentication: 'none' | 'api_key' | 'bearer' | 'oauth';
  rate_limit: {
    requests_per_minute: number;
    burst_limit: number;
  };
  metrics: {
    total_requests: number;
    success_rate: number;
    avg_response_time: number;
    error_count: number;
    last_called: string;
  };
  documentation_url?: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created_at: string;
  last_used: string;
  expires_at?: string;
  usage_count: number;
  rate_limit_remaining: number;
  status: 'active' | 'revoked' | 'expired';
}

interface APITest {
  id: string;
  endpoint_id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  expected_status: number;
  expected_response?: string;
  last_run: string;
  status: 'passed' | 'failed' | 'pending';
  response_time: number;
  error_message?: string;
}

interface APIMetrics {
  total_endpoints: number;
  total_requests_today: number;
  average_response_time: number;
  error_rate: number;
  top_endpoints: Array<{
    endpoint: string;
    requests: number;
    response_time: number;
  }>;
  status_codes: Record<string, number>;
  geographic_distribution: Array<{
    country: string;
    requests: number;
    percentage: number;
  }>;
}

export const APIManagementDashboard: React.FC = () => {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [tests, setTests] = useState<APITest[]>([]);
  const [metrics, setMetrics] = useState<APIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'keys' | 'testing' | 'monitoring'>('overview');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchAPIData();
  }, []);

  const fetchAPIData = async () => {
    try {
      setLoading(true);
      
      const [endpointsRes, keysRes, testsRes, metricsRes] = await Promise.all([
        fetch('/api/management/endpoints', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/management/api-keys', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/management/tests', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/management/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (endpointsRes.ok) {
        const data = await endpointsRes.json();
        setEndpoints(data.endpoints || []);
      }

      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data.keys || []);
      }

      if (testsRes.ok) {
        const data = await testsRes.json();
        setTests(data.tests || []);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/management/tests/${testId}/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults(prev => ({ ...prev, [testId]: result }));
        await fetchAPIData();
      }
    } catch (err) {
      console.error('Failed to run test:', err);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/management/api-keys/${keyId}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchAPIData();
      }
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-600 bg-green-100';
      case 'POST': return 'text-blue-600 bg-blue-100';
      case 'PUT': return 'text-orange-600 bg-orange-100';
      case 'DELETE': return 'text-red-600 bg-red-100';
      case 'PATCH': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'passed': return 'text-green-600 bg-green-100';
      case 'deprecated':
      case 'failed': return 'text-red-600 bg-red-100';
      case 'beta':
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_endpoints}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Requests Today</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_requests_today.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.average_response_time}ms</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.error_rate}%</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Endpoints */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.top_endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{endpoint.endpoint}</h4>
                    <p className="text-sm text-gray-600">{endpoint.requests.toLocaleString()} requests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{endpoint.response_time}ms</p>
                    <p className="text-xs text-gray-600">avg response</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Code Distribution */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Response Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.status_codes).map(([code, count]) => (
                <div key={code} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={code.startsWith('2') ? 'success' : code.startsWith('4') ? 'warning' : 'error'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {code}
                    </Badge>
                    <span className="text-sm text-gray-700">HTTP {code}</span>
                  </div>
                  <span className="font-medium">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEndpointsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">API Endpoints</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Endpoint
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      variant="outline" 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                      className={getMethodColor(endpoint.method)}
                    >
                      {endpoint.method}
                    </Badge>
                    <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                    <Badge 
                      variant={endpoint.status === 'active' ? 'success' : endpoint.status === 'deprecated' ? 'error' : 'warning'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {endpoint.status}
                    </Badge>
                  </div>
                  
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.path}</code>
                  <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-600">Requests:</span>
                      <span className="ml-2 font-medium">{endpoint.metrics.total_requests.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="ml-2 font-medium">{endpoint.metrics.success_rate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Response:</span>
                      <span className="ml-2 font-medium">{endpoint.metrics.avg_response_time}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rate Limit:</span>
                      <span className="ml-2 font-medium">{endpoint.rate_limit.requests_per_minute}/min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => setSelectedEndpoint(endpoint)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Play className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    Docs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderApiKeysTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate New Key
        </Button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((key) => (
          <Card key={key.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{key.name}</h4>
                    <Badge 
                      variant={key.status === 'active' ? 'success' : key.status === 'expired' ? 'warning' : 'error'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {key.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {showApiKey[key.id] ? key.key : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowApiKey({...showApiKey, [key.id]: !showApiKey[key.id]})}
                    >
                      {showApiKey[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(key.key)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">{new Date(key.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Used:</span>
                      <span className="ml-2 font-medium">{new Date(key.last_used).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Usage Count:</span>
                      <span className="ml-2 font-medium">{key.usage_count.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rate Limit:</span>
                      <span className="ml-2 font-medium">{key.rate_limit_remaining} remaining</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" size="xs" icon={null} onRemove={() => {}}>
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRevokeApiKey(key.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Revoke
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTestingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">API Testing</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

      <div className="space-y-4">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    <Badge 
                      variant={test.status === 'passed' ? 'success' : test.status === 'failed' ? 'error' : 'warning'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {test.status}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                      className={getMethodColor(test.method)}
                    >
                      {test.method}
                    </Badge>
                  </div>
                  
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block mb-3">{test.url}</code>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Expected Status:</span>
                      <span className="ml-2 font-medium">{test.expected_status}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Response Time:</span>
                      <span className="ml-2 font-medium">{test.response_time}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Run:</span>
                      <span className="ml-2 font-medium">{new Date(test.last_run).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 font-medium ${test.status === 'passed' ? 'text-green-600' : test.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {test.status}
                      </span>
                    </div>
                  </div>

                  {test.error_message && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{test.error_message}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => handleRunTest(test.id)}>
                    <Play className="h-3 w-3 mr-1" />
                    Run Test
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">API Monitoring</h3>
      
      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time API Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Real-time API metrics chart</p>
              <p className="text-sm text-gray-500">Integration with Chart.js for live monitoring</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alert Rules</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'High Error Rate', condition: 'Error rate > 5%', status: 'active' },
              { name: 'Slow Response Time', condition: 'Avg response > 1000ms', status: 'active' },
              { name: 'Rate Limit Exceeded', condition: 'Rate limit > 90%', status: 'triggered' }
            ].map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <p className="text-sm text-gray-600">{rule.condition}</p>
                </div>
                <Badge 
                  variant={rule.status === 'active' ? 'success' : rule.status === 'triggered' ? 'error' : 'warning'} 
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {rule.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API management data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading API Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAPIData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">API Management</h1>
            <p className="text-gray-600">Monitor, test, and manage your API endpoints and integrations</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'endpoints', label: 'Endpoints', icon: Code },
                { id: 'keys', label: 'API Keys', icon: Key },
                { id: 'testing', label: 'Testing', icon: Play },
                { id: 'monitoring', label: 'Monitoring', icon: Monitor },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'endpoints' && renderEndpointsTab()}
          {activeTab === 'keys' && renderApiKeysTab()}
          {activeTab === 'testing' && renderTestingTab()}
          {activeTab === 'monitoring' && renderMonitoringTab()}
        </div>
      </div>
    </div>
  );
};