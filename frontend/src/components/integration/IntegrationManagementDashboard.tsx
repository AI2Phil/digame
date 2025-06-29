import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Plus, Settings, Trash2, RefreshCw, ExternalLink,
  CheckCircle, XCircle, AlertTriangle, Clock,
  Key, Shield, Webhook, Database, Cloud,
  Github, Slack, Globe, Building, Database as DatabaseIcon,
  Zap, Activity, BarChart3, Users, Mail,
  Copy, Eye, EyeOff, Edit, Download, Upload, X
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  provider: string;
  type: 'oauth' | 'api_key' | 'webhook' | 'database';
  status: 'active' | 'inactive' | 'error' | 'pending';
  description: string;
  icon: string;
  connected_at: string;
  last_sync: string;
  sync_frequency: string;
  data_points: number;
  error_count: number;
  success_rate: number;
  config: Record<string, any>;
  scopes?: string[];
  webhook_url?: string;
  api_usage: {
    requests_today: number;
    requests_limit: number;
    rate_limit_remaining: number;
  };
}

interface IntegrationTemplate {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  icon: string;
  type: 'oauth' | 'api_key' | 'webhook' | 'database';
  popular: boolean;
  setup_complexity: 'easy' | 'medium' | 'hard';
  features: string[];
  pricing_tier: 'free' | 'premium' | 'enterprise';
  documentation_url: string;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'error';
  events: string[];
  secret: string;
  created_at: string;
  last_triggered: string;
  success_count: number;
  error_count: number;
  retry_policy: {
    max_retries: number;
    backoff_strategy: string;
  };
}

interface OAuthFlow {
  id: string;
  provider: string;
  client_id: string;
  scopes: string[];
  redirect_uri: string;
  state: string;
  status: 'pending' | 'authorized' | 'expired' | 'revoked';
  created_at: string;
  expires_at: string;
  user_info?: {
    name: string;
    email: string;
    avatar: string;
  };
}

const PROVIDER_ICONS: Record<string, React.ComponentType<any>> = {
  github: Github,
  slack: Slack,
  google: Globe,
  microsoft: Building,
  salesforce: DatabaseIcon,
  default: Cloud
};

export const IntegrationManagementDashboard: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [oauthFlows, setOAuthFlows] = useState<OAuthFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'integrations' | 'webhooks' | 'oauth' | 'marketplace'>('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  const fetchIntegrationData = async () => {
    try {
      setLoading(true);
      
      const [integrationsRes, templatesRes, webhooksRes, oauthRes] = await Promise.all([
        fetch('/api/integrations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/integrations/templates', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/integrations/webhooks', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/integrations/oauth/flows', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (integrationsRes.ok) {
        const data = await integrationsRes.json();
        setIntegrations(data.integrations || []);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }

      if (webhooksRes.ok) {
        const data = await webhooksRes.json();
        setWebhooks(data.webhooks || []);
      }

      if (oauthRes.ok) {
        const data = await oauthRes.json();
        setOAuthFlows(data.flows || []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integration data');
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationToggle = async (integrationId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/${enabled ? 'enable' : 'disable'}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchIntegrationData();
      }
    } catch (err) {
      console.error('Failed to toggle integration:', err);
    }
  };

  const handleIntegrationDelete = async (integrationId: string) => {
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchIntegrationData();
      }
    } catch (err) {
      console.error('Failed to delete integration:', err);
    }
  };

  const handleWebhookTest = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/integrations/webhooks/${webhookId}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        alert('Test webhook sent successfully!');
      }
    } catch (err) {
      console.error('Failed to test webhook:', err);
    }
  };

  const handleOAuthRevoke = async (flowId: string) => {
    try {
      const response = await fetch(`/api/integrations/oauth/flows/${flowId}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchIntegrationData();
      }
    } catch (err) {
      console.error('Failed to revoke OAuth flow:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return XCircle;
      case 'error': return AlertTriangle;
      case 'pending': return Clock;
      default: return XCircle;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.filter(i => i.status === 'active').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Webhook Endpoints</p>
                <p className="text-2xl font-bold text-gray-900">{webhooks.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Webhook className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">OAuth Connections</p>
                <p className="text-2xl font-bold text-gray-900">
                  {oauthFlows.filter(f => f.status === 'authorized').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Requests Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.reduce((sum, i) => sum + (i.api_usage?.requests_today || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Integration Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.slice(0, 5).map((integration) => {
              const IconComponent = PROVIDER_ICONS[integration.provider] || PROVIDER_ICONS.default;
              const StatusIcon = getStatusIcon(integration.status);
              
              return (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{integration.name}</h4>
                      <p className="text-sm text-gray-600">Last sync: {new Date(integration.last_sync).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {integration.status}
                    </Badge>
                    <span className="text-sm text-gray-600">{integration.success_rate}% success</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Active Integrations</h3>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const IconComponent = PROVIDER_ICONS[integration.provider] || PROVIDER_ICONS.default;
          const StatusIcon = getStatusIcon(integration.status);
          
          return (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <p className="text-sm text-gray-600">{integration.provider}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={integration.status === 'active' ? 'success' : integration.status === 'error' ? 'error' : 'warning'} 
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{integration.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data Points:</span>
                    <span className="ml-2 font-medium">{integration.data_points.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="ml-2 font-medium">{integration.success_rate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">API Usage:</span>
                    <span className="ml-2 font-medium">
                      {integration.api_usage?.requests_today || 0}/{integration.api_usage?.requests_limit || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="ml-2 font-medium">{new Date(integration.last_sync).toLocaleDateString()}</span>
                  </div>
                </div>

                {integration.scopes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.scopes.slice(0, 3).map((scope) => (
                        <Badge key={scope} variant="outline" size="xs" icon={null} onRemove={() => {}}>
                          {scope}
                        </Badge>
                      ))}
                      {integration.scopes.length > 3 && (
                        <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                          +{integration.scopes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant={integration.status === 'active' ? 'outline' : 'primary'}
                    onClick={() => handleIntegrationToggle(integration.id, integration.status !== 'active')}
                  >
                    {integration.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedIntegration(integration)}>
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleIntegrationDelete(integration.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderWebhooksTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Webhook Endpoints</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      <div className="space-y-4">
        {webhooks.map((webhook) => {
          const StatusIcon = getStatusIcon(webhook.status);
          
          return (
            <Card key={webhook.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                      <Badge 
                        variant={webhook.status === 'active' ? 'success' : webhook.status === 'error' ? 'error' : 'warning'} 
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {webhook.status}
                      </Badge>
                      <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {webhook.method}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{webhook.url}</code>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(webhook.url)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Success:</span>
                        <span className="ml-2 font-medium text-green-600">{webhook.success_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Errors:</span>
                        <span className="ml-2 font-medium text-red-600">{webhook.error_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Triggered:</span>
                        <span className="ml-2 font-medium">
                          {webhook.last_triggered ? new Date(webhook.last_triggered).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Events:</span>
                        <span className="ml-2 font-medium">{webhook.events.length}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {webhook.events.slice(0, 5).map((event) => (
                        <Badge key={event} variant="outline" size="xs" icon={null} onRemove={() => {}}>
                          {event}
                        </Badge>
                      ))}
                      {webhook.events.length > 5 && (
                        <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                          +{webhook.events.length - 5} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Secret:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {showSecrets[webhook.id] ? webhook.secret : '••••••••••••••••'}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowSecrets({...showSecrets, [webhook.id]: !showSecrets[webhook.id]})}
                      >
                        {showSecrets[webhook.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleWebhookTest(webhook.id)}>
                      <Zap className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderOAuthTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">OAuth Connections</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New OAuth App
        </Button>
      </div>

      <div className="space-y-4">
        {oauthFlows.map((flow) => {
          const IconComponent = PROVIDER_ICONS[flow.provider] || PROVIDER_ICONS.default;
          const StatusIcon = getStatusIcon(flow.status);
          
          return (
            <Card key={flow.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{flow.provider}</h4>
                        <Badge 
                          variant={flow.status === 'authorized' ? 'success' : flow.status === 'expired' ? 'warning' : 'error'} 
                          size="sm"
                          icon={null}
                          onRemove={() => {}}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {flow.status}
                        </Badge>
                      </div>

                      {flow.user_info && (
                        <div className="flex items-center gap-2 mb-3">
                          <img 
                            src={flow.user_info.avatar} 
                            alt={flow.user_info.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-900">{flow.user_info.name}</span>
                          <span className="text-sm text-gray-600">({flow.user_info.email})</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Client ID:</span>
                          <code className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">{flow.client_id}</code>
                        </div>
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <span className="ml-2 font-medium">{new Date(flow.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Expires:</span>
                          <span className="ml-2 font-medium">
                            {flow.expires_at ? new Date(flow.expires_at).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Scopes:</span>
                          <span className="ml-2 font-medium">{flow.scopes.length}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {flow.scopes.slice(0, 5).map((scope) => (
                          <Badge key={scope} variant="outline" size="xs" icon={null} onRemove={() => {}}>
                            {scope}
                          </Badge>
                        ))}
                        {flow.scopes.length > 5 && (
                          <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                            +{flow.scopes.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {flow.status === 'authorized' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOAuthRevoke(flow.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Revoke Access
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderMarketplaceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Integration Marketplace</h3>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="">All Categories</option>
            <option value="productivity">Productivity</option>
            <option value="communication">Communication</option>
            <option value="analytics">Analytics</option>
            <option value="crm">CRM</option>
            <option value="development">Development</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="">All Types</option>
            <option value="oauth">OAuth</option>
            <option value="api_key">API Key</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const IconComponent = PROVIDER_ICONS[template.provider] || PROVIDER_ICONS.default;
          const isConnected = integrations.some(i => i.provider === template.provider);
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {template.popular && (
                      <Badge variant="warning" size="xs" icon={null} onRemove={() => {}}>
                        Popular
                      </Badge>
                    )}
                    <Badge
                      variant={template.pricing_tier === 'free' ? 'success' : template.pricing_tier === 'premium' ? 'warning' : 'error'}
                      size="xs"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {template.pricing_tier}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                    {template.type}
                  </Badge>
                  <Badge
                    variant={template.setup_complexity === 'easy' ? 'success' : template.setup_complexity === 'medium' ? 'warning' : 'error'}
                    size="xs"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {template.setup_complexity} setup
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-gray-700">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" size="xs" icon={null} onRemove={() => {}}>
                        {feature}
                      </Badge>
                    ))}
                    {template.features.length > 3 && (
                      <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                        +{template.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Button size="sm" variant="outline" disabled>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Button>
                  ) : (
                    <Button size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Docs
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integrations...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Integrations</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchIntegrationData}>Try Again</Button>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Integration Management</h1>
            <p className="text-gray-600">Manage your third-party integrations, webhooks, and OAuth connections</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'integrations', label: 'Integrations', icon: Zap },
                { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                { id: 'oauth', label: 'OAuth', icon: Shield },
                { id: 'marketplace', label: 'Marketplace', icon: Plus },
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
          {activeTab === 'integrations' && renderIntegrationsTab()}
          {activeTab === 'webhooks' && renderWebhooksTab()}
          {activeTab === 'oauth' && renderOAuthTab()}
          {activeTab === 'marketplace' && renderMarketplaceTab()}
        </div>
      </div>

      {/* Integration Configuration Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configure {selectedIntegration.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIntegration(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Connection Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sync Frequency
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="realtime">Real-time</option>
                      <option value="5min">Every 5 minutes</option>
                      <option value="15min">Every 15 minutes</option>
                      <option value="1hour">Every hour</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Retention
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="30days">30 days</option>
                      <option value="90days">90 days</option>
                      <option value="1year">1 year</option>
                      <option value="forever">Forever</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Permissions</h4>
                <div className="space-y-2">
                  {selectedIntegration.scopes?.map((scope) => (
                    <label key={scope} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Webhook Configuration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={selectedIntegration.webhook_url || ''}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="https://your-domain.com/webhook"
                      />
                      <Button size="sm" variant="outline">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                  Cancel
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};