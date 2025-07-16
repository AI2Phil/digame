import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Database,
  Globe,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
  Brain,
  Workflow,
  Key,
  Webhook,
  Code,
  Monitor,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  Filter,
  Search,
  Star,
  Heart,
  Eye,
  GitBranch
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const APIManagementHub = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [apiMetrics, setApiMetrics] = useState({});
  const [webhookLogs, setWebhookLogs] = useState([]);

  // Mock data for API management
  const apiEndpoints = [
    {
      id: 'auth-login',
      name: 'Authentication Login',
      method: 'POST',
      path: '/api/auth/login',
      category: 'authentication',
      status: 'active',
      calls: 15420,
      avgResponseTime: 145,
      successRate: 99.2,
      lastUsed: '2025-01-07T10:30:00Z'
    },
    {
      id: 'user-profile',
      name: 'User Profile',
      method: 'GET',
      path: '/api/users/profile',
      category: 'users',
      status: 'active',
      calls: 8950,
      avgResponseTime: 89,
      successRate: 98.8,
      lastUsed: '2025-01-07T10:25:00Z'
    },
    {
      id: 'integration-sync',
      name: 'Integration Sync',
      method: 'POST',
      path: '/api/integrations/sync',
      category: 'integrations',
      status: 'active',
      calls: 12340,
      avgResponseTime: 234,
      successRate: 97.5,
      lastUsed: '2025-01-07T10:20:00Z'
    },
    {
      id: 'webhook-handler',
      name: 'Webhook Handler',
      method: 'POST',
      path: '/api/webhooks/handler',
      category: 'webhooks',
      status: 'active',
      calls: 5670,
      avgResponseTime: 67,
      successRate: 99.8,
      lastUsed: '2025-01-07T10:15:00Z'
    },
    {
      id: 'analytics-data',
      name: 'Analytics Data',
      method: 'GET',
      path: '/api/analytics/data',
      category: 'analytics',
      status: 'active',
      calls: 7890,
      avgResponseTime: 156,
      successRate: 98.9,
      lastUsed: '2025-01-07T10:10:00Z'
    }
  ];

  const webhookConfigs = [
    {
      id: 'slack-notifications',
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      events: ['user.created', 'integration.connected', 'sync.completed'],
      status: 'active',
      lastTriggered: '2025-01-07T10:30:00Z',
      successRate: 99.5,
      totalCalls: 2340
    },
    {
      id: 'teams-alerts',
      name: 'Teams Alerts',
      url: 'https://outlook.office.com/webhook/xxxxx',
      events: ['error.occurred', 'system.maintenance'],
      status: 'active',
      lastTriggered: '2025-01-07T09:45:00Z',
      successRate: 98.2,
      totalCalls: 890
    },
    {
      id: 'custom-endpoint',
      name: 'Custom Endpoint',
      url: 'https://api.example.com/webhooks/digame',
      events: ['data.updated', 'user.activity'],
      status: 'paused',
      lastTriggered: '2025-01-06T15:20:00Z',
      successRate: 97.8,
      totalCalls: 1560
    }
  ];

  const marketplaceIntegrations = [
    {
      id: 'salesforce-crm',
      name: 'Salesforce CRM',
      description: 'Complete CRM integration with lead management and sales pipeline tracking',
      category: 'crm',
      provider: 'Salesforce',
      version: '2.1.0',
      downloads: 15420,
      rating: 4.8,
      price: 'Free',
      featured: true,
      tags: ['crm', 'sales', 'leads', 'pipeline'],
      lastUpdated: '2025-01-05T00:00:00Z'
    },
    {
      id: 'slack-communication',
      name: 'Slack Integration',
      description: 'Team communication and notification system with channel management',
      category: 'communication',
      provider: 'Slack Technologies',
      version: '3.0.2',
      downloads: 23450,
      rating: 4.9,
      price: 'Free',
      featured: true,
      tags: ['communication', 'team', 'notifications', 'channels'],
      lastUpdated: '2025-01-03T00:00:00Z'
    },
    {
      id: 'github-development',
      name: 'GitHub Integration',
      description: 'Code repository management with commit tracking and issue integration',
      category: 'development',
      provider: 'GitHub Inc.',
      version: '1.8.5',
      downloads: 18900,
      rating: 4.7,
      price: 'Free',
      featured: false,
      tags: ['development', 'git', 'repositories', 'issues'],
      lastUpdated: '2025-01-04T00:00:00Z'
    },
    {
      id: 'google-workspace',
      name: 'Google Workspace',
      description: 'Complete Google Workspace integration with Gmail, Drive, and Calendar',
      category: 'productivity',
      provider: 'Google LLC',
      version: '4.2.1',
      downloads: 34560,
      rating: 4.6,
      price: 'Premium',
      featured: true,
      tags: ['productivity', 'email', 'calendar', 'drive'],
      lastUpdated: '2025-01-06T00:00:00Z'
    },
    {
      id: 'jira-project',
      name: 'Jira Project Management',
      description: 'Agile project management with sprint tracking and issue management',
      category: 'project',
      provider: 'Atlassian',
      version: '2.5.3',
      downloads: 12780,
      rating: 4.5,
      price: 'Premium',
      featured: false,
      tags: ['project', 'agile', 'sprints', 'issues'],
      lastUpdated: '2025-01-02T00:00:00Z'
    },
    {
      id: 'hubspot-marketing',
      name: 'HubSpot Marketing',
      description: 'Inbound marketing automation with lead nurturing and analytics',
      category: 'marketing',
      provider: 'HubSpot Inc.',
      version: '1.9.7',
      downloads: 9870,
      rating: 4.4,
      price: 'Premium',
      featured: false,
      tags: ['marketing', 'automation', 'leads', 'analytics'],
      lastUpdated: '2025-01-01T00:00:00Z'
    }
  ];

  const apiUsageData = [
    { name: 'Jan', calls: 45000, errors: 120, responseTime: 145 },
    { name: 'Feb', calls: 52000, errors: 98, responseTime: 138 },
    { name: 'Mar', calls: 48000, errors: 156, responseTime: 142 },
    { name: 'Apr', calls: 61000, errors: 89, responseTime: 135 },
    { name: 'May', calls: 58000, errors: 67, responseTime: 128 },
    { name: 'Jun', calls: 67000, errors: 45, responseTime: 122 }
  ];

  useEffect(() => {
    loadAPIMetrics();
    loadWebhookLogs();
    setEndpoints(apiEndpoints);
    setWebhooks(webhookConfigs);
    setMarketplaceItems(marketplaceIntegrations);
  }, [apiEndpoints, loadAPIMetrics, marketplaceIntegrations, webhookConfigs]);

  const loadAPIMetrics = useCallback(async () => {
    setApiMetrics({
      totalEndpoints: apiEndpoints.length,
      totalCalls: 50270,
      avgResponseTime: 138,
      successRate: 98.6,
      activeWebhooks: webhookConfigs.filter(w => w.status === 'active').length,
      totalWebhookCalls: 4790
    });
  }, [apiEndpoints, webhookConfigs]);

  const loadWebhookLogs = useCallback(async () => {
    const logs = [
      {
        id: '1',
        webhook: 'slack-notifications',
        event: 'user.created',
        status: 'success',
        timestamp: '2025-01-07T10:30:00Z',
        responseTime: 234,
        payload: { userId: '12345', email: 'user@example.com' }
      },
      {
        id: '2',
        webhook: 'teams-alerts',
        event: 'error.occurred',
        status: 'failed',
        timestamp: '2025-01-07T10:25:00Z',
        responseTime: 5000,
        error: 'Connection timeout'
      },
      {
        id: '3',
        webhook: 'custom-endpoint',
        event: 'data.updated',
        status: 'success',
        timestamp: '2025-01-07T10:20:00Z',
        responseTime: 156,
        payload: { recordId: '67890', changes: ['name', 'email'] }
      }
    ];
    setWebhookLogs(logs);
  }, []);

  const filteredMarketplace = useMemo(() => {
    return marketplaceItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [marketplaceItems, searchTerm, categoryFilter]);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Endpoints</p>
                <p className="text-2xl font-bold">{apiMetrics.totalEndpoints}</p>
              </div>
              <Code className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total API Calls</p>
                <p className="text-2xl font-bold">{apiMetrics.totalCalls?.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{apiMetrics.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{apiMetrics.avgResponseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage Trends</CardTitle>
          <CardDescription>API calls and performance metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={apiUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="calls" stroke="#3b82f6" name="API Calls" />
              <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke="#10b981" name="Response Time (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Top API Endpoints</CardTitle>
          <CardDescription>Most frequently used API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpoints
              .sort((a, b) => b.calls - a.calls)
              .slice(0, 5)
              .map(endpoint => (
                <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant={endpoint.method === 'GET' ? 'default' : 
                                   endpoint.method === 'POST' ? 'secondary' : 'destructive'}>
                      {endpoint.method}
                    </Badge>
                    <div>
                      <h3 className="font-medium">{endpoint.name}</h3>
                      <p className="text-sm text-muted-foreground">{endpoint.path}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{endpoint.calls.toLocaleString()} calls</p>
                    <p className="text-sm text-muted-foreground">{endpoint.avgResponseTime}ms avg</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEndpointsTab = () => (
    <div className="space-y-6">
      {/* Endpoint Controls */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Management</CardTitle>
          <CardDescription>Manage and monitor your API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Endpoint
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Documentation
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints List */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>All available API endpoints and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpoints.map(endpoint => (
              <div key={endpoint.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant={endpoint.method === 'GET' ? 'default' : 
                                   endpoint.method === 'POST' ? 'secondary' : 
                                   endpoint.method === 'PUT' ? 'outline' : 'destructive'}>
                      {endpoint.method}
                    </Badge>
                    <div>
                      <h3 className="font-medium">{endpoint.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{endpoint.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={endpoint.status === 'active' ? 'default' : 'secondary'}>
                      {endpoint.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Calls</p>
                    <p className="font-medium">{endpoint.calls.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Response</p>
                    <p className="font-medium">{endpoint.avgResponseTime}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{endpoint.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Used</p>
                    <p className="font-medium">{new Date(endpoint.lastUsed).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWebhooksTab = () => (
    <div className="space-y-6">
      {/* Webhook Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Management</CardTitle>
          <CardDescription>Configure and monitor webhook endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
            <Button variant="outline">
              <Monitor className="h-4 w-4 mr-2" />
              Test All
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configurations</CardTitle>
          <CardDescription>Active webhook endpoints and their settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.map(webhook => (
              <div key={webhook.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{webhook.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                      {webhook.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground mb-2">Events:</p>
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map(event => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Calls</p>
                    <p className="font-medium">{webhook.totalCalls.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{webhook.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Triggered</p>
                    <p className="font-medium">{new Date(webhook.lastTriggered).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <div className="flex items-center space-x-1">
                      {webhook.status === 'active' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Pause className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="font-medium capitalize">{webhook.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Webhook Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Activity</CardTitle>
          <CardDescription>Latest webhook calls and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {webhookLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{log.webhook}</p>
                    <p className="text-sm text-muted-foreground">{log.event}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{log.responseTime}ms</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMarketplaceTab = () => (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Marketplace</CardTitle>
          <CardDescription>Discover and install new integrations for your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="crm">CRM</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="project">Project Management</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Integrations</CardTitle>
          <CardDescription>Popular and recommended integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketplace
              .filter(item => item.featured)
              .map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.provider}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Download className="h-3 w-3" />
                        <span>{item.downloads.toLocaleString()}</span>
                      </div>
                      <span className="font-medium text-green-600">{item.price}</span>
                    </div>
                    <Button size="sm">
                      Install
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* All Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>All Integrations</CardTitle>
          <CardDescription>Browse all available integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMarketplace.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        v{item.version}
                      </Badge>
                      {item.featured && (
                        <Badge variant="default" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Download className="h-3 w-3" />
                        <span>{item.downloads.toLocaleString()} downloads</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{item.rating} rating</span>
                      </div>
                      <span>by {item.provider}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-green-600">{item.price}</span>
                  <Button size="sm">
                    Install
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Management Hub</h1>
        <p className="text-muted-foreground mt-2">
          Manage APIs, webhooks, and integration marketplace
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="endpoints">
          {renderEndpointsTab()}
        </TabsContent>

        <TabsContent value="webhooks">
          {renderWebhooksTab()}
        </TabsContent>

        <TabsContent value="marketplace">
          {renderMarketplaceTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

