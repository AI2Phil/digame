import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/Sheet';
import { Progress } from '../components/ui/Progress';
import Alert, { AlertDescription } from '../components/ui/Alert';
import { 
  Settings, 
  Plus, 
  ExternalLink, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Zap,
  Globe,
  Shield,
  Webhook,
  Key,
  Monitor,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Download
} from 'lucide-react';

/**
 * @returns {React.ReactElement} IntegrationsPage component
 */
const IntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [connections, setConnections] = useState([]);
  const [providers, setProviders] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [analytics, setAnalytics] = useState(/** @type {{
    total_connections: number,
    active_connections: number,
    total_syncs: number,
    successful_syncs: number,
    failed_syncs: number,
    webhook_triggers: number,
    avg_response_time_ms: number,
    success_rate: number,
    uptime_percentage: number
  }} */ ({}));
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProviders = [
      {
        id: 1,
        name: 'Slack',
        display_name: 'Slack',
        description: 'Team communication and collaboration',
        category: 'communication',
        auth_type: 'oauth2',
        is_active: true,
        supported_operations: ['read', 'write', 'webhook'],
        logo_url: '/api/placeholder/32/32'
      },
      {
        id: 2,
        name: 'Google Workspace',
        display_name: 'Google Workspace',
        description: 'Gmail, Drive, Calendar, and Contacts integration',
        category: 'productivity',
        auth_type: 'oauth2',
        is_active: true,
        supported_operations: ['read', 'write', 'webhook'],
        logo_url: '/api/placeholder/32/32'
      },
      {
        id: 3,
        name: 'Microsoft Teams',
        display_name: 'Microsoft Teams',
        description: 'Team collaboration and communication',
        category: 'communication',
        auth_type: 'oauth2',
        is_active: true,
        supported_operations: ['read', 'write', 'webhook'],
        logo_url: '/api/placeholder/32/32'
      },
      {
        id: 4,
        name: 'GitHub',
        display_name: 'GitHub',
        description: 'Code repository and project management',
        category: 'development',
        auth_type: 'oauth2',
        is_active: true,
        supported_operations: ['read', 'write', 'webhook'],
        logo_url: '/api/placeholder/32/32'
      },
      {
        id: 5,
        name: 'Trello',
        display_name: 'Trello',
        description: 'Project management and task tracking',
        category: 'project_management',
        auth_type: 'oauth2',
        is_active: true,
        supported_operations: ['read', 'write', 'webhook'],
        logo_url: '/api/placeholder/32/32'
      }
    ];

    const mockConnections = [
      {
        id: 1,
        provider_id: 1,
        provider_name: 'Slack',
        display_name: 'Development Team Slack',
        status: 'active',
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        last_sync_at: '2024-06-24T06:30:00Z',
        sync_frequency: 'real_time',
        health_status: 'healthy',
        error_count: 0,
        total_syncs: 1247
      },
      {
        id: 2,
        provider_id: 2,
        provider_name: 'Google Workspace',
        display_name: 'Company Google Workspace',
        status: 'active',
        is_active: true,
        created_at: '2024-02-01T14:30:00Z',
        last_sync_at: '2024-06-24T06:25:00Z',
        sync_frequency: 'hourly',
        health_status: 'healthy',
        error_count: 2,
        total_syncs: 892
      },
      {
        id: 3,
        provider_id: 4,
        provider_name: 'GitHub',
        display_name: 'Personal GitHub',
        status: 'warning',
        is_active: true,
        created_at: '2024-03-10T09:15:00Z',
        last_sync_at: '2024-06-23T18:45:00Z',
        sync_frequency: 'daily',
        health_status: 'degraded',
        error_count: 5,
        total_syncs: 234
      }
    ];

    const mockWebhooks = [
      {
        id: 1,
        connection_id: 1,
        webhook_url: 'https://api.digame.com/webhooks/slack/1',
        events: ['message.posted', 'channel.created', 'user.joined'],
        is_active: true,
        total_triggers: 1847,
        successful_triggers: 1832,
        failed_triggers: 15,
        last_triggered_at: '2024-06-24T06:30:00Z'
      },
      {
        id: 2,
        connection_id: 2,
        webhook_url: 'https://api.digame.com/webhooks/google/2',
        events: ['file.created', 'file.modified', 'calendar.event'],
        is_active: true,
        total_triggers: 623,
        successful_triggers: 618,
        failed_triggers: 5,
        last_triggered_at: '2024-06-24T06:25:00Z'
      }
    ];

    const mockAnalytics = {
      total_connections: 3,
      active_connections: 3,
      total_syncs: 2373,
      successful_syncs: 2351,
      failed_syncs: 22,
      webhook_triggers: 2470,
      avg_response_time_ms: 245,
      success_rate: 99.1,
      uptime_percentage: 99.8
    };

    setProviders(mockProviders);
    setConnections(mockConnections);
    setWebhooks(mockWebhooks);
    setAnalytics(mockAnalytics);
    setLoading(false);
  }, []);

  /**
   * @param {string} status - Connection status
   * @returns {string} CSS classes for status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * @param {string} health - Health status
   * @returns {React.ReactElement} Health icon component
   */
  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  /**
   * @param {Object} provider - Provider configuration object
   * @param {string} provider.name - Provider name
   */
  const initiateOAuthFlow = (provider) => {
    // Mock OAuth flow initiation - using Next.js router for callback
    const authUrl = `https://oauth.${provider.name.toLowerCase()}.com/authorize?client_id=demo&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/integrations/oauth/callback&scope=read+write`;
    if (typeof window !== 'undefined') {
      window.open(authUrl, 'oauth', 'width=600,height=600');
    }
  };

  /**
   * @param {number} connectionId - Connection ID to test
   * @returns {Promise<void>}
   */
  const testConnection = async (connectionId) => {
    // Mock connection test
    console.log(`Testing connection ${connectionId}`);
    // Show success/failure feedback
  };

  /**
   * @param {number} connectionId - Connection ID to sync
   * @returns {Promise<void>}
   */
  const syncConnection = async (connectionId) => {
    // Mock manual sync
    console.log(`Syncing connection ${connectionId}`);
    // Update UI with sync status
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">Manage your third-party service connections and APIs</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Connect to third-party services to enhance your productivity workflow
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {providers.map((provider) => (
                <Card key={provider.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img 
                        src={provider.logo_url} 
                        alt={provider.name}
                        className="w-8 h-8 rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{provider.display_name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {provider.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{provider.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {provider.supported_operations.map((op) => (
                        <Badge key={op} variant="secondary" className="text-xs">
                          {op}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => initiateOAuthFlow(provider)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Connections</p>
                    <p className="text-2xl font-bold">{analytics.total_connections}</p>
                  </div>
                  <Globe className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold">{analytics.success_rate}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Webhook Triggers</p>
                    <p className="text-2xl font-bold">{analytics.webhook_triggers.toLocaleString()}</p>
                  </div>
                  <Webhook className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold">{analytics.avg_response_time_ms}ms</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest integration events and sync operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.slice(0, 3).map((connection) => (
                    <div key={connection.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getHealthIcon(connection.health_status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {connection.display_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Last sync: {formatDate(connection.last_sync_at)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(connection.status)}>
                        {connection.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Overall integration system performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uptime</span>
                    <span>{analytics.uptime_percentage}%</span>
                  </div>
                  <Progress value={analytics.uptime_percentage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Success Rate</span>
                    <span>{analytics.success_rate}%</span>
                  </div>
                  <Progress value={analytics.success_rate} className="h-2" />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Total Syncs</span>
                    <span>{analytics.total_syncs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Failed Syncs</span>
                    <span>{analytics.failed_syncs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Connections</h2>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>

          <div className="grid gap-4">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getHealthIcon(connection.health_status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{connection.display_name}</h3>
                        <p className="text-sm text-gray-600">{connection.provider_name}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Created: {formatDate(connection.created_at)}</span>
                          <span>Last sync: {formatDate(connection.last_sync_at)}</span>
                          <span>Syncs: {connection.total_syncs}</span>
                          {connection.error_count > 0 && (
                            <span className="text-red-500">Errors: {connection.error_count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(connection.status)}>
                        {connection.status}
                      </Badge>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>{connection.display_name}</SheetTitle>
                            <SheetDescription>
                              Manage connection settings and configuration
                            </SheetDescription>
                          </SheetHeader>
                          <div className="space-y-6 mt-6">
                            <div>
                              <h4 className="font-medium mb-2">Connection Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Provider:</span>
                                  <span>{connection.provider_name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <Badge className={getStatusColor(connection.status)}>
                                    {connection.status}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Sync Frequency:</span>
                                  <span>{connection.sync_frequency}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Health:</span>
                                  <span className="flex items-center">
                                    {getHealthIcon(connection.health_status)}
                                    <span className="ml-1">{connection.health_status}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Button 
                                className="w-full" 
                                onClick={() => testConnection(connection.id)}
                              >
                                <Activity className="h-4 w-4 mr-2" />
                                Test Connection
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => syncConnection(connection.id)}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Manual Sync
                              </Button>
                              <Button variant="outline" className="w-full">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Settings
                              </Button>
                              <Button variant="danger" className="w-full">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Webhook Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>

          <div className="grid gap-4">
            {webhooks.map((webhook) => {
              const connection = connections.find(c => c.id === webhook.connection_id);
              const successRate = ((webhook.successful_triggers / webhook.total_triggers) * 100).toFixed(1);
              
              return (
                <Card key={webhook.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{connection?.display_name} Webhook</h3>
                        <p className="text-sm text-gray-600">{webhook.webhook_url}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={webhook.is_active ? "default" : "secondary"}>
                          {webhook.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Triggers</p>
                        <p className="text-xl font-bold">{webhook.total_triggers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-xl font-bold text-green-600">{successRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last Triggered</p>
                        <p className="text-sm">{formatDate(webhook.last_triggered_at)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Events</p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Monitoring</CardTitle>
                <CardDescription>Real-time status of all integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getHealthIcon(connection.health_status)}
                        <div>
                          <p className="font-medium">{connection.display_name}</p>
                          <p className="text-sm text-gray-500">{connection.provider_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{connection.health_status}</p>
                        <p className="text-xs text-gray-500">
                          {connection.error_count} errors
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Integration performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Response Time</span>
                      <span>{analytics.avg_response_time_ms}ms</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Throughput</span>
                      <span>1.2k req/min</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Error Rate</span>
                      <span>0.9%</span>
                    </div>
                    <Progress value={9} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    GitHub connection experiencing intermittent failures. Last error: Rate limit exceeded.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All Slack webhooks are operating normally. 99.8% success rate in the last 24 hours.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>Configure integration system preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Default Sync Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Default Sync Frequency</label>
                    <select className="border rounded px-3 py-1 text-sm">
                      <option>Real-time</option>
                      <option>Every 15 minutes</option>
                      <option>Hourly</option>
                      <option>Daily</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Retry Failed Syncs</label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Max Retry Attempts</label>
                    <Input type="number" defaultValue="3" className="w-20" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Security Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Require Webhook Signatures</label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Token Refresh Threshold (hours)</label>
                    <Input type="number" defaultValue="24" className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Enable Audit Logging</label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Notification Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Email Alerts for Failures</label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys & Credentials</CardTitle>
              <CardDescription>Manage API keys for third-party services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">OpenAI API Key</p>
                      <p className="text-sm text-gray-500">For AI-powered features</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Configured</Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Webhook Secret</p>
                      <p className="text-sm text-gray-500">For webhook signature verification</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Not Set</Badge>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Export integration data and logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Integration Logs</p>
                    <p className="text-sm text-gray-500">Export sync logs and webhook events</p>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Connection Data</p>
                    <p className="text-sm text-gray-500">Export connection configurations</p>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsPage;