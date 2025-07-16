import React, { useState, useEffect, useCallback } from 'react';
import {
  Building, Users, Settings, Shield, Crown, Calendar,
  UserPlus, Mail, Key, BarChart3, Activity, AlertTriangle,
  CheckCircle, Clock, Globe, Database, Zap, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Label } from '../ui/Label';
import { useToastHelpers } from '../ui/Toaster';

const MultiTenancyDashboard = ({ currentTenant, userRole, onTenantSwitch }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantData, setTenantData] = useState(null);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [resourceAllocation, setResourceAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');
  const { success, error, warning, info } = useToastHelpers();

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Update configurable settings when tenantData changes
  useEffect(() => {
    if (tenantData?.name) {
      setTenantConfigurableSettings(prev => ({
        ...prev,
        orgName: tenantData.name
      }));
    }
  }, [tenantData]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/multi-tenancy/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if available
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTenantData(data.tenant_data);
        setUsers(data.users || []);
        setInvitations(data.invitations || []);
        setAuditLogs(data.audit_logs || []);
        setResourceAllocation(data.resource_allocation);
        setDataSource(data.data_source);
        
        if (data.data_source === 'enhanced_fallback') {
          info('Using demo data - API unavailable');
        } else if (data.data_source === 'database') {
          success('Multi-tenancy data loaded successfully');
        }
      } else {
        throw new Error('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      error('Failed to load multi-tenancy dashboard');
      
      // Enhanced fallback data
      const fallbackData = {
        tenant_data: {
          id: 1,
          name: "Demo Organization",
          slug: "demo-org",
          subscription_tier: "professional",
          is_trial: true,
          trial_ends_at: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
          users_count: 12,
          max_users: 50,
          storage_used: 15.7,
          storage_limit: 100,
          api_requests_today: 1247,
          api_daily_limit: 5000,
          is_active: true,
          admin_email: "admin@demo-org.com",
          admin_name: "Admin User"
        },
        users: [
          {
            id: 1,
            email: "admin@demo-org.com",
            full_name: "Admin User",
            role: "admin",
            joined_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            is_active: true
          },
          {
            id: 2,
            email: "manager@demo-org.com",
            full_name: "Team Manager",
            role: "manager",
            joined_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
            last_active: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            is_active: true
          },
          {
            id: 3,
            email: "member@demo-org.com",
            full_name: "Team Member",
            role: "member",
            joined_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            last_active: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            is_active: true
          }
        ],
        invitations: [
          {
            id: 1,
            email: "newuser@example.com",
            role: "member",
            invited_by: "admin@demo-org.com",
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending"
          }
        ],
        audit_logs: [
          {
            id: 1,
            action: "user_added_to_tenant",
            user_email: "admin@demo-org.com",
            details: "Added newuser@example.com as member",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            action: "settings_updated",
            user_email: "admin@demo-org.com",
            details: "Updated security settings",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      
      setTenantData(fallbackData.tenant_data);
      setUsers(fallbackData.users);
      setInvitations(fallbackData.invitations);
      setAuditLogs(fallbackData.audit_logs);
      setDataSource('enhanced_fallback');
      warning('Using enhanced demo data - API unavailable');
    } finally {
      setLoading(false);
    }
  }, [success, error, warning, info]);

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleInviteUser = async (email, role) => {
    try {
      const response = await fetch('http://localhost:8001/api/multi-tenancy/invite-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if available
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newInvitation = {
            id: data.invitation.id,
            email: data.invitation.email,
            role: data.invitation.role,
            invited_by: "admin@demo-org.com", // Would come from current user
            expires_at: data.invitation.expires_at,
            status: data.invitation.status
          };
          setInvitations([...invitations, newInvitation]);
          success(`Invitation sent to ${email}`);
        }
      } else {
        throw new Error('Failed to send invitation');
      }
    } catch (err) {
      console.error('Error inviting user:', err);
      error('Failed to send invitation');
      
      // Fallback: Add invitation locally
      const newInvitation = {
        id: invitations.length + 1,
        email,
        role,
        invited_by: "admin@demo-org.com",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending"
      };
      setInvitations([...invitations, newInvitation]);
      warning(`Invitation added locally for ${email} - API unavailable`);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:8001/api/multi-tenancy/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if available
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_role: newRole }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
          ));
          success(`User role updated to ${newRole}`);
        }
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      error('Failed to update user role');
      
      // Fallback: Update role locally
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      warning(`User role updated locally - API unavailable`);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8001/api/multi-tenancy/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if available
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(users.filter(user => user.id !== userId));
          success('User removed from tenant');
        }
      } else {
        throw new Error('Failed to remove user');
      }
    } catch (err) {
      console.error('Error removing user:', err);
      error('Failed to remove user');
      
      // Fallback: Remove user locally
      setUsers(users.filter(user => user.id !== userId));
      warning('User removed locally - API unavailable');
    }
  };

  // State for configurable settings in TenantSettingsSection
  const [tenantConfigurableSettings, setTenantConfigurableSettings] = useState({
    orgName: tenantData?.name || 'Default Organization', // Safe initialization with fallback
    timezone: 'America/Los_Angeles', // Default
    dateFormat: 'YYYY-MM-DD',   // Default
  });

  const handleTenantConfigurableSettingChange = (key, value) => {
    setTenantConfigurableSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading multi-tenancy dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load tenant data</p>
              <Button onClick={loadDashboardData} className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Multi-Tenancy Management</h1>
              <p className="text-gray-600">Enterprise tenant and user management</p>
            </div>
            {dataSource === 'enhanced_fallback' && (
              <Badge variant="warning" className="ml-auto">
                Demo Data
              </Badge>
            )}
            {dataSource === 'database' && (
              <Badge variant="success" className="ml-auto">
                Live Database
              </Badge>
            )}
          </div>

          {/* Tenant Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TenantMetricCard
              title="Subscription"
              value={tenantData.subscription_tier}
              icon={Crown}
              color="purple"
              badge={tenantData.is_trial ? "Trial" : "Active"}
              badgeColor={tenantData.is_trial ? "warning" : "success"}
            />
            <TenantMetricCard
              title="Users"
              value={`${tenantData.users_count}/${tenantData.max_users}`}
              icon={Users}
              color="blue"
              progress={(tenantData.users_count / tenantData.max_users) * 100}
            />
            <TenantMetricCard
              title="Storage"
              value={`${tenantData.storage_used}GB`}
              icon={Database}
              color="green"
              progress={(tenantData.storage_used / tenantData.storage_limit) * 100}
            />
            <TenantMetricCard
              title="API Usage"
              value={`${tenantData.api_requests_today}`}
              icon={Zap}
              color="orange"
              progress={(tenantData.api_requests_today / tenantData.api_daily_limit) * 100}
            />
          </div>

          {/* Trial Warning */}
          {tenantData.is_trial && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Trial Period Active</p>
                  <p className="text-sm text-yellow-700">
                    {calculateDaysRemaining(tenantData.trial_ends_at)} days remaining. 
                    <Button variant="link" className="p-0 ml-1 text-yellow-700 underline">
                      Upgrade now
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <TenantOverviewSection 
              tenantData={tenantData}
              users={users}
              invitations={invitations}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagementSection 
              users={users}
              invitations={invitations}
              onInviteUser={handleInviteUser}
              onUpdateUserRole={handleUpdateUserRole}
              onRemoveUser={handleRemoveUser}
              userRole={userRole}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <TenantSettingsSection 
              settings={tenantConfigurableSettings} 
              onSettingChange={handleTenantConfigurableSettingChange} 
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySettingsSection tenantData={tenantData} />
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <AuditLogsSection auditLogs={auditLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const TenantMetricCard = ({ title, value, icon: Icon, color, badge, badgeColor, progress }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <Badge variant={badgeColor}>{badge}</Badge>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {progress !== undefined && (
            <Progress value={progress} className="mt-2 h-2" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TenantOverviewSection = ({ tenantData, users, invitations }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Tenant Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Organization Name</label>
            <p className="text-lg font-semibold">{tenantData.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Tenant ID</label>
            <p className="text-sm text-gray-900">{tenantData.slug}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Subscription Tier</label>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{tenantData.subscription_tier}</Badge>
              {tenantData.is_trial && <Badge variant="warning">Trial</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Active Users</span>
            <span className="font-semibold">{users.filter(u => u.is_active).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Pending Invitations</span>
            <span className="font-semibold">{invitations.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Storage Used</span>
            <span className="font-semibold">{tenantData.storage_used}GB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">API Requests Today</span>
            <span className="font-semibold">{tenantData.api_requests_today}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const UserManagementSection = ({ users, invitations, onInviteUser, onUpdateUserRole, onRemoveUser, userRole }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const handleSubmitInvite = (e) => {
    e.preventDefault();
    onInviteUser(inviteEmail, inviteRole);
    setInviteEmail('');
    setInviteRole('member');
    setShowInviteForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Invite User Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Team Members</CardTitle>
            {userRole === 'admin' && (
              <Button onClick={() => setShowInviteForm(!showInviteForm)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showInviteForm && (
            <form onSubmit={handleSubmitInvite} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <Select
                  value={inviteRole}
                  onChange={setInviteRole}
                  options={[
                    { value: 'member', label: 'Member' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                  className="text-sm" // Standard Select component should handle its own padding/border
                />
                <div className="flex gap-2">
                  <Button type="submit">Send Invite</Button>
                  <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Users List */}
          <div className="space-y-3">
            {users.map((user) => (
              <UserRow 
                key={user.id} 
                user={user} 
                onUpdateRole={onUpdateUserRole}
                onRemove={onRemoveUser}
                canManage={userRole === 'admin'}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <InvitationRow key={invitation.id} invitation={invitation} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const UserRow = ({ user, onUpdateRole, onRemove, canManage }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-blue-600 font-medium">{user.full_name.charAt(0)}</span>
      </div>
      <div>
        <p className="font-medium">{user.full_name}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Badge variant="outline">{user.role}</Badge>
      <span className="text-xs text-gray-500">
        Last active: {new Date(user.last_active).toLocaleDateString()}
      </span>
      {canManage && user.role !== 'admin' && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => onRemove(user.id)}>
            Remove
          </Button>
        </div>
      )}
    </div>
  </div>
);

const InvitationRow = ({ invitation }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
    <div className="flex items-center gap-3">
      <Mail className="w-5 h-5 text-yellow-600" />
      <div>
        <p className="font-medium">{invitation.email}</p>
        <p className="text-sm text-gray-600">Invited as {invitation.role}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Badge variant="warning">Pending</Badge>
      <span className="text-xs text-gray-500">
        Expires: {new Date(invitation.expires_at).toLocaleDateString()}
      </span>
      <Button size="sm" variant="outline">Resend</Button>
    </div>
  </div>
);

const TenantSettingsSection = ({ settings, onSettingChange }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="orgNameInput" className="block text-sm font-medium mb-2">Organization Name</Label>
            <Input 
              id="orgNameInput" 
              value={settings.orgName} 
              onChange={(e) => onSettingChange('orgName', e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="timezoneSelect" className="block text-sm font-medium mb-2">Timezone</Label>
            <Select
              id="timezoneSelect"
              value={settings.timezone}
              onChange={(value) => onSettingChange('timezone', value)}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'America/New_York', label: '(GMT-05:00) Eastern Time' },
                { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time' },
                { value: 'Europe/London', label: '(GMT+00:00) London' },
                { value: 'Europe/Berlin', label: '(GMT+01:00) Berlin' },
              ]}
              className="w-full text-sm"
            />
          </div>
          <div>
            <Label htmlFor="dateFormatSelect" className="block text-sm font-medium mb-2">Date Format</Label>
            <Select
              id="dateFormatSelect"
              value={settings.dateFormat}
              onChange={(value) => onSettingChange('dateFormat', value)}
              options={[
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              ]}
              className="w-full text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const SecuritySettingsSection = ({ tenantData }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Require 2FA for all users</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Single Sign-On (SSO)</p>
              <p className="text-sm text-gray-600">Enterprise feature</p>
            </div>
            <Badge variant="secondary">Enterprise Only</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">IP Whitelist</p>
              <p className="text-sm text-gray-600">Restrict access by IP address</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AuditLogsSection = ({ auditLogs }) => (
  <Card>
    <CardHeader>
      <CardTitle>Audit Logs</CardTitle>
      <CardDescription>Track all tenant activities and changes</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Activity className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
              <p className="text-sm text-gray-600">{log.details}</p>
              <p className="text-xs text-gray-500">
                by {log.user_email} • {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default MultiTenancyDashboard;