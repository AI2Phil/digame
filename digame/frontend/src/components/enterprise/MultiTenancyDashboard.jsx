import React, { useState, useEffect } from 'react';
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

const MultiTenancyDashboard = ({ currentTenant, userRole, onTenantSwitch }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantData, setTenantData] = useState({
    id: 1,
    name: "Demo Organization",
    slug: "demo-org",
    subscription_tier: "professional",
    is_trial: true,
    trial_ends_at: "2025-06-23T00:00:00Z",
    users_count: 12,
    max_users: 50,
    storage_used: 15.7,
    storage_limit: 100,
    api_requests_today: 1247,
    api_daily_limit: 5000
  });

  const [users, setUsers] = useState([
    {
      id: 1,
      email: "admin@demo-org.com",
      full_name: "Admin User",
      role: "admin",
      joined_at: "2025-05-01T00:00:00Z",
      last_active: "2025-05-23T10:30:00Z",
      is_active: true
    },
    {
      id: 2,
      email: "manager@demo-org.com",
      full_name: "Team Manager",
      role: "manager",
      joined_at: "2025-05-05T00:00:00Z",
      last_active: "2025-05-23T09:15:00Z",
      is_active: true
    },
    {
      id: 3,
      email: "member@demo-org.com",
      full_name: "Team Member",
      role: "member",
      joined_at: "2025-05-10T00:00:00Z",
      last_active: "2025-05-22T16:45:00Z",
      is_active: true
    }
  ]);

  const [invitations, setInvitations] = useState([
    {
      id: 1,
      email: "newuser@example.com",
      role: "member",
      invited_by: "admin@demo-org.com",
      expires_at: "2025-05-30T00:00:00Z",
      status: "pending"
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      action: "user_added_to_tenant",
      user_email: "admin@demo-org.com",
      details: "Added newuser@example.com as member",
      timestamp: "2025-05-23T10:30:00Z"
    },
    {
      id: 2,
      action: "settings_updated",
      user_email: "admin@demo-org.com",
      details: "Updated security settings",
      timestamp: "2025-05-23T09:15:00Z"
    }
  ]);

  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleInviteUser = async (email, role) => {
    // Mock invitation
    const newInvitation = {
      id: invitations.length + 1,
      email,
      role,
      invited_by: "admin@demo-org.com",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending"
    };
    setInvitations([...invitations, newInvitation]);
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleRemoveUser = async (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Multi-Tenancy Management</h1>
              <p className="text-gray-600">Enterprise tenant and user management</p>
            </div>
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
            <TenantSettingsSection tenantData={tenantData} />
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
                <select
                  className="border rounded px-3 py-2"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
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

const TenantSettingsSection = ({ tenantData }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Organization Name</label>
            <Input defaultValue={tenantData.name} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select className="w-full border rounded px-3 py-2">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date Format</label>
            <select className="w-full border rounded px-3 py-2">
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
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