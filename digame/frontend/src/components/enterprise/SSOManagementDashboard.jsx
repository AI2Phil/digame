import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Users, Settings, Activity, AlertTriangle,
  CheckCircle, Clock, Globe, Database, Zap, Eye, Plus,
  Edit, Trash2, ExternalLink, Copy, Download, Upload
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch'; // Added
import { Label } from '../ui/Label';   // Added

const SSOManagementDashboard = ({ tenantId, userRole }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [ssoProviders, setSSOProviders] = useState([
    {
      id: 1,
      name: "Corporate SAML",
      provider_type: "saml",
      is_active: true,
      is_default: true,
      created_at: "2025-05-24T00:00:00Z",
      last_used: "2025-05-24T09:15:00Z",
      total_logins: 1247,
      success_rate: 97.2
    },
    {
      id: 2,
      name: "Google OAuth",
      provider_type: "oauth2",
      is_active: true,
      is_default: false,
      created_at: "2025-05-24T01:00:00Z",
      last_used: "2025-05-24T08:45:00Z",
      total_logins: 342,
      success_rate: 94.7
    },
    {
      id: 3,
      name: "Active Directory",
      provider_type: "ldap",
      is_active: false,
      is_default: false,
      created_at: "2025-05-24T02:00:00Z",
      last_used: "2025-05-23T16:30:00Z",
      total_logins: 49,
      success_rate: 91.8
    }
  ]);

  const [ssoSessions, setSSOSessions] = useState([
    {
      session_uuid: "session_123",
      provider_name: "Corporate SAML",
      user_email: "user1@demo.com",
      status: "authenticated",
      authenticated_at: "2025-05-24T09:00:00Z",
      last_activity_at: "2025-05-24T09:15:00Z",
      ip_address: "192.168.1.100",
      expires_at: "2025-05-24T17:00:00Z"
    },
    {
      session_uuid: "session_456",
      provider_name: "Google OAuth",
      user_email: "user2@demo.com",
      status: "authenticated",
      authenticated_at: "2025-05-24T08:30:00Z",
      last_activity_at: "2025-05-24T09:10:00Z",
      ip_address: "192.168.1.101",
      expires_at: "2025-05-24T16:30:00Z"
    }
  ]);

  const [ssoConfig, setSSOConfig] = useState({
    sso_enabled: true,
    enforce_sso: false,
    allow_local_fallback: true,
    session_timeout_minutes: 480,
    max_concurrent_sessions: 5,
    require_fresh_auth_minutes: 60,
    require_mfa_for_sso: false,
    auto_create_users: true,
    auto_update_user_attributes: true
  });

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      event_type: "saml_auth_success",
      provider_name: "Corporate SAML",
      user_email: "user1@demo.com",
      ip_address: "192.168.1.100",
      created_at: "2025-05-24T09:00:00Z",
      details: "Successful SAML authentication"
    },
    {
      id: 2,
      event_type: "oauth_auth_success",
      provider_name: "Google OAuth",
      user_email: "user2@demo.com",
      ip_address: "192.168.1.101",
      created_at: "2025-05-24T08:30:00Z",
      details: "Successful OAuth authentication"
    },
    {
      id: 3,
      event_type: "provider_created",
      provider_name: "New LDAP Provider",
      user_email: "admin@demo.com",
      ip_address: "192.168.1.102",
      created_at: "2025-05-24T08:00:00Z",
      details: "SSO provider configuration created"
    }
  ]);

  const [statistics, setStatistics] = useState({
    total_logins: 1247,
    successful_logins: 1198,
    failed_logins: 49,
    success_rate: 96.1,
    unique_users: 87,
    active_sessions: 23
  });

  const getProviderIcon = (type) => {
    switch (type) {
      case 'saml': return '🔐';
      case 'oauth2': return '🌐';
      case 'oidc': return '🔑';
      case 'ldap': return '📁';
      default: return '🔒';
    }
  };

  const getProviderTypeLabel = (type) => {
    switch (type) {
      case 'saml': return 'SAML 2.0';
      case 'oauth2': return 'OAuth 2.0';
      case 'oidc': return 'OpenID Connect';
      case 'ldap': return 'LDAP/AD';
      default: return type.toUpperCase();
    }
  };

  const handleCreateProvider = () => {
    // Mock provider creation
    console.log('Creating new SSO provider...');
  };

  const handleEditProvider = (providerId) => {
    console.log('Editing provider:', providerId);
  };

  const handleDeleteProvider = (providerId) => {
    setSSOProviders(ssoProviders.filter(p => p.id !== providerId));
  };

  const handleTerminateSession = (sessionUuid) => {
    setSSOSessions(ssoSessions.filter(s => s.session_uuid !== sessionUuid));
  };

  const handleUpdateConfig = (updates) => {
    setSSOConfig({ ...ssoConfig, ...updates });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Single Sign-On Management</h1>
              <p className="text-gray-600">Enterprise authentication and identity management</p>
            </div>
          </div>

          {/* SSO Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SSOMetricCard
              title="Active Providers"
              value={ssoProviders.filter(p => p.is_active).length}
              icon={Key}
              color="blue"
              subtitle={`${ssoProviders.length} total configured`}
            />
            <SSOMetricCard
              title="Success Rate"
              value={`${statistics.success_rate}%`}
              icon={CheckCircle}
              color="green"
              subtitle={`${statistics.successful_logins} successful logins`}
            />
            <SSOMetricCard
              title="Active Sessions"
              value={statistics.active_sessions}
              icon={Activity}
              color="purple"
              subtitle={`${statistics.unique_users} unique users`}
            />
            <SSOMetricCard
              title="Total Logins"
              value={statistics.total_logins}
              icon={Users}
              color="orange"
              subtitle="Last 30 days"
            />
          </div>

          {/* SSO Status */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">SSO Enabled</p>
                <p className="text-sm text-green-700">
                  Single Sign-On is active with {ssoProviders.filter(p => p.is_active).length} configured providers.
                  {!ssoConfig.enforce_sso && ' Local authentication fallback is enabled.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <SSOOverviewSection 
              providers={ssoProviders}
              statistics={statistics}
              recentSessions={ssoSessions.slice(0, 5)}
            />
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <SSOProvidersSection 
              providers={ssoProviders}
              onCreateProvider={handleCreateProvider}
              onEditProvider={handleEditProvider}
              onDeleteProvider={handleDeleteProvider}
              userRole={userRole}
            />
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <SSOSessionsSection 
              sessions={ssoSessions}
              onTerminateSession={handleTerminateSession}
              userRole={userRole}
            />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <SSOConfigurationSection 
              config={ssoConfig}
              onUpdateConfig={handleUpdateConfig}
              userRole={userRole}
            />
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <SSOAuditLogsSection auditLogs={auditLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const SSOMetricCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SSOOverviewSection = ({ providers, statistics, recentSessions }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Provider Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers.map((provider) => (
            <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getProviderIcon(provider.provider_type)}</span>
                <div>
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-sm text-gray-600">{getProviderTypeLabel(provider.provider_type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={provider.is_active ? "success" : "secondary"}>
                  {provider.is_active ? "Active" : "Inactive"}
                </Badge>
                {provider.is_default && <Badge variant="outline">Default</Badge>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentSessions.map((session) => (
            <div key={session.session_uuid} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-sm">{session.user_email}</p>
                <p className="text-xs text-gray-600">
                  {session.provider_name} • {new Date(session.authenticated_at).toLocaleString()}
                </p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const SSOProvidersSection = ({ providers, onCreateProvider, onEditProvider, onDeleteProvider, userRole }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>SSO Providers</CardTitle>
          {userRole === 'admin' && (
            <Button onClick={onCreateProvider}>
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers.map((provider) => (
            <ProviderCard 
              key={provider.id} 
              provider={provider}
              onEdit={onEditProvider}
              onDelete={onDeleteProvider}
              canManage={userRole === 'admin'}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const ProviderCard = ({ provider, onEdit, onDelete, canManage }) => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{getProviderIcon(provider.provider_type)}</span>
        <div>
          <h3 className="font-semibold text-lg">{provider.name}</h3>
          <p className="text-sm text-gray-600">{getProviderTypeLabel(provider.provider_type)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={provider.is_active ? "success" : "secondary"}>
          {provider.is_active ? "Active" : "Inactive"}
        </Badge>
        {provider.is_default && <Badge variant="outline">Default</Badge>}
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div>
        <p className="text-sm text-gray-600">Total Logins</p>
        <p className="font-semibold">{provider.total_logins}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Success Rate</p>
        <p className="font-semibold">{provider.success_rate}%</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Last Used</p>
        <p className="font-semibold text-sm">{new Date(provider.last_used).toLocaleDateString()}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Created</p>
        <p className="font-semibold text-sm">{new Date(provider.created_at).toLocaleDateString()}</p>
      </div>
    </div>

    {canManage && (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(provider.id)}>
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button size="sm" variant="outline">
          <Copy className="w-4 h-4 mr-1" />
          Test
        </Button>
        <Button size="sm" variant="outline">
          <Download className="w-4 h-4 mr-1" />
          Metadata
        </Button>
        {!provider.is_default && (
          <Button size="sm" variant="destructive" onClick={() => onDelete(provider.id)}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </div>
    )}
  </div>
);

const SSOSessionsSection = ({ sessions, onTerminateSession, userRole }) => (
  <Card>
    <CardHeader>
      <CardTitle>Active SSO Sessions</CardTitle>
      <CardDescription>Monitor and manage active user sessions</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionRow 
            key={session.session_uuid} 
            session={session}
            onTerminate={onTerminateSession}
            canManage={userRole === 'admin'}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

const SessionRow = ({ session, onTerminate, canManage }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      <div>
        <p className="font-medium">{session.user_email}</p>
        <p className="text-sm text-gray-600">
          {session.provider_name} • IP: {session.ip_address}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium">
          Active for {Math.floor((new Date() - new Date(session.authenticated_at)) / (1000 * 60))} min
        </p>
        <p className="text-xs text-gray-500">
          Expires: {new Date(session.expires_at).toLocaleTimeString()}
        </p>
      </div>
      {canManage && (
        <Button size="sm" variant="outline" onClick={() => onTerminate(session.session_uuid)}>
          Terminate
        </Button>
      )}
    </div>
  </div>
);

const SSOConfigurationSection = ({ config, onUpdateConfig, userRole }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>SSO Configuration</CardTitle>
        <CardDescription>Configure global SSO settings for your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium mb-2">Authentication Settings</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sso_enabled_switch" className="text-sm">Enable SSO</Label>
                  <Switch
                    id="sso_enabled_switch"
                    checked={config.sso_enabled}
                    onCheckedChange={(isChecked) => onUpdateConfig({ sso_enabled: isChecked })}
                    disabled={userRole !== 'admin'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enforce_sso_switch" className="text-sm">Enforce SSO (disable local login)</Label>
                  <Switch
                    id="enforce_sso_switch"
                    checked={config.enforce_sso}
                    onCheckedChange={(isChecked) => onUpdateConfig({ enforce_sso: isChecked })}
                    disabled={userRole !== 'admin'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow_local_fallback_switch" className="text-sm">Allow local fallback</Label>
                  <Switch
                    id="allow_local_fallback_switch"
                    checked={config.allow_local_fallback}
                    onCheckedChange={(isChecked) => onUpdateConfig({ allow_local_fallback: isChecked })}
                    disabled={userRole !== 'admin'}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Session Settings</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="session_timeout_input" className="block text-xs text-gray-600 mb-1">Session timeout (minutes)</Label>
                  <Input 
                    id="session_timeout_input"
                    type="number" 
                    value={config.session_timeout_minutes}
                    onChange={(e) => onUpdateConfig({ session_timeout_minutes: parseInt(e.target.value) })}
                    disabled={userRole !== 'admin'}
                  />
                </div>
                <div>
                  <Label htmlFor="max_concurrent_sessions_input" className="block text-xs text-gray-600 mb-1">Max concurrent sessions</Label>
                  <Input 
                    id="max_concurrent_sessions_input"
                    type="number" 
                    value={config.max_concurrent_sessions}
                    onChange={(e) => onUpdateConfig({ max_concurrent_sessions: parseInt(e.target.value) })}
                    disabled={userRole !== 'admin'}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">User Provisioning</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto_create_users_switch" className="text-sm">Auto-create users</Label>
                <Switch
                  id="auto_create_users_switch"
                  checked={config.auto_create_users}
                  onCheckedChange={(isChecked) => onUpdateConfig({ auto_create_users: isChecked })}
                  disabled={userRole !== 'admin'}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto_update_attributes_switch" className="text-sm">Auto-update attributes</Label>
                <Switch
                  id="auto_update_attributes_switch"
                  checked={config.auto_update_user_attributes}
                  onCheckedChange={(isChecked) => onUpdateConfig({ auto_update_user_attributes: isChecked })}
                  disabled={userRole !== 'admin'}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require_mfa_for_sso_switch" className="text-sm">Require MFA for SSO</Label>
                <Switch
                  id="require_mfa_for_sso_switch"
                  checked={config.require_mfa_for_sso}
                  onCheckedChange={(isChecked) => onUpdateConfig({ require_mfa_for_sso: isChecked })}
                  disabled={userRole !== 'admin'}
                />
              </div>
            </div>
          </div>

          {userRole === 'admin' && (
            <div className="pt-4 border-t">
              <Button>Save Configuration</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

const SSOAuditLogsSection = ({ auditLogs }) => (
  <Card>
    <CardHeader>
      <CardTitle>SSO Audit Logs</CardTitle>
      <CardDescription>Track all SSO authentication events and configuration changes</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Activity className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <p className="font-medium">{log.event_type.replace(/_/g, ' ')}</p>
              <p className="text-sm text-gray-600">{log.details}</p>
              <p className="text-xs text-gray-500">
                {log.provider_name} • {log.user_email} • {log.ip_address} • {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SSOManagementDashboard;