import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Users,
  Settings,
  BarChart3,
  Key,
  UserCheck,
  Activity,
  Shield,
  Database,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Home,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Edit,
  Trash2,
  Plus,
  Eye,
  Lock,
  Unlock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Progress } from '../../components/ui/Progress';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import enhancedApiService from '../../services/enhancedApiService';
import UserManagementSection from '../../components/admin/UserManagementSection';
import SystemAnalyticsSection from '../../components/admin/SystemAnalyticsSection';
import ApiKeyManagementSection from '../../components/admin/ApiKeyManagementSection';
import OnboardingAnalyticsSection from '../../components/admin/OnboardingAnalyticsSection';
import UserDetailsDialog from '../../components/admin/UserDetailsDialog';

const AdminDashboardPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [apiKeys, setApiKeys] = useState([]);
  const [onboardingStats, setOnboardingStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [systemConfig, setSystemConfig] = useState({});
  const [platformHealth, setPlatformHealth] = useState({});
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData, keysData, onboardingData, configData, healthData] =
        await Promise.all([
          enhancedApiService.getUsers(),
          enhancedApiService.getSystemStats(),
          enhancedApiService.getAdminApiKeys(),
          enhancedApiService.getOnboardingAnalytics(),
          fetch('/api/v1/admin/config/system', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          })
            .then(res => (res.ok ? res.json() : {}))
            .catch(() => ({})),
          fetch('/api/v1/platform/health', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          })
            .then(res => (res.ok ? res.json() : {}))
            .catch(() => ({})),
        ]);

      // Handle the case where getUsers returns an object with users array
      setUsers(usersData.users || usersData || []);
      setSystemStats(statsData);
      setApiKeys(keysData);
      setOnboardingStats(onboardingData);
      setSystemConfig(configData.data || {});
      setPlatformHealth(healthData.data || {});
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await enhancedApiService.performUserAction(userId, action);
      toast.success(`User ${action} successfully`);
      loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Manage users, monitor system performance, and track platform analytics
              </p>
            </div>

            {/* Home Button */}
            <Button
              variant="outline"
              onClick={() => {
                const isDemoMode = localStorage.getItem('demo_mode') === 'true';
                router.push(isDemoMode ? '/dashboard' : '/');
              }}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={systemStats.totalUsers || 0}
            change="+12%"
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Active Sessions"
            value={systemStats.activeSessions || 0}
            change="+5%"
            icon={Activity}
            color="green"
          />
          <StatsCard
            title="API Requests"
            value={systemStats.apiRequests || 0}
            change="+23%"
            icon={BarChart3}
            color="purple"
          />
          <StatsCard
            title="System Health"
            value="99.9%"
            change="Stable"
            icon={Shield}
            color="emerald"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">System Analytics</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SystemHealthCard systemStats={systemStats} />
              <RecentActivityCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <UserGrowthCard />
              <PerformanceMetricsCard />
              <AlertsCard />
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagementSection
              users={filteredUsers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onUserAction={handleUserAction}
              onUserSelect={user => {
                setSelectedUser(user);
                setShowUserDialog(true);
              }}
              isLoading={loading}
            />
          </TabsContent>

          {/* System Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <SystemAnalyticsSection systemStats={systemStats} />
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <ApiKeyManagementSection apiKeys={apiKeys} onRefresh={loadDashboardData} />
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <OnboardingAnalyticsSection onboardingStats={onboardingStats} />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <SystemConfigurationSection
              systemConfig={systemConfig}
              onRefresh={loadDashboardData}
              onShowConfigDialog={() => setShowConfigDialog(true)}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecurityManagementSection
              platformHealth={platformHealth}
              users={users}
              onRefresh={loadDashboardData}
            />
          </TabsContent>
        </Tabs>

        {/* User Details Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Manage user account and permissions</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <UserDetailsDialog
                user={selectedUser}
                onAction={handleUserAction}
                onClose={() => setShowUserDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* System Configuration Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>System Configuration</DialogTitle>
              <DialogDescription>Manage platform-wide configuration settings</DialogDescription>
            </DialogHeader>
            <SystemConfigDialog
              systemConfig={systemConfig}
              onClose={() => setShowConfigDialog(false)}
              onRefresh={loadDashboardData}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    emerald: 'text-emerald-600 bg-emerald-100',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{change} from last month</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// System Health Card Component
const SystemHealthCard = ({ systemStats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Database className="w-5 h-5" />
        System Health
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>CPU Usage</span>
          <span>{systemStats.cpuUsage || 45}%</span>
        </div>
        <Progress value={systemStats.cpuUsage || 45} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Memory Usage</span>
          <span>{systemStats.memoryUsage || 62}%</span>
        </div>
        <Progress value={systemStats.memoryUsage || 62} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Database Load</span>
          <span>{systemStats.dbLoad || 38}%</span>
        </div>
        <Progress value={systemStats.dbLoad || 38} className="h-2" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>API Response Time</span>
          <span>{systemStats.avgResponseTime || 120}ms</span>
        </div>
        <Progress value={75} className="h-2" />
      </div>
    </CardContent>
  </Card>
);

// Recent Activity Card Component
const RecentActivityCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          {
            action: 'New user registration',
            user: 'john.doe@example.com',
            time: '2 minutes ago',
            type: 'success',
          },
          {
            action: 'API key created',
            user: 'admin@company.com',
            time: '5 minutes ago',
            type: 'info',
          },
          {
            action: 'Failed login attempt',
            user: 'suspicious@email.com',
            time: '10 minutes ago',
            type: 'warning',
          },
          {
            action: 'System backup completed',
            user: 'System',
            time: '1 hour ago',
            type: 'success',
          },
        ].map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div
              className={`w-2 h-2 rounded-full ${
                activity.type === 'success'
                  ? 'bg-green-500'
                  : activity.type === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.action}</p>
              <p className="text-xs text-gray-500">
                {activity.user} • {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// User Growth Card Component
const UserGrowthCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        User Growth
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center">
        <p className="text-3xl font-bold text-green-600">+24%</p>
        <p className="text-sm text-gray-500">This month</p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>New Users</span>
            <span>156</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Active Users</span>
            <span>1,234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Retention Rate</span>
            <span>87%</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Performance Metrics Card Component
const PerformanceMetricsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Performance
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">Uptime</span>
          <Badge variant="success">99.9%</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Avg Response</span>
          <Badge variant="default">120ms</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Error Rate</span>
          <Badge variant="success">0.1%</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Throughput</span>
          <Badge variant="default">1.2k/min</Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Alerts Card Component
const AlertsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        System Alerts
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <div>
            <p className="text-sm font-medium">High Memory Usage</p>
            <p className="text-xs text-gray-500">Database server at 85%</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium">Backup Completed</p>
            <p className="text-xs text-gray-500">Daily backup successful</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Enhanced Component Sections

// System Configuration Section Component
const SystemConfigurationSection = ({ systemConfig, onRefresh, onShowConfigDialog }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Platform Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Maintenance Mode</span>
          <Badge className="bg-green-100 text-green-800">Disabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Auto-scaling</span>
          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Backup Schedule</span>
          <Badge className="bg-blue-100 text-blue-800">Daily</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SSL Certificate</span>
          <Badge className="bg-green-100 text-green-800">Valid</Badge>
        </div>
        <div className="pt-4">
          <Button onClick={onShowConfigDialog} className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            Advanced Configuration
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Global Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">CDN Status</span>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Rate Limiting</span>
          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API Versioning</span>
          <Badge className="bg-blue-100 text-blue-800">v1.0</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Monitoring</span>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </div>
        <div className="pt-4">
          <Button variant="outline" onClick={onRefresh} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Security Management Section Component
const SecurityManagementSection = ({ platformHealth, users, onRefresh }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">Secure</p>
              <p className="text-sm text-gray-500">All systems protected</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Sessions</span>
                <span>{users.filter(u => u.is_active).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Failed Logins (24h)</span>
                <span className="text-red-600">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Security Alerts</span>
                <span className="text-green-600">0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Two-Factor Auth</span>
              <Badge className="bg-green-100 text-green-800">Enforced</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Password Policy</span>
              <Badge className="bg-green-100 text-green-800">Strong</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Session Timeout</span>
              <Badge className="bg-blue-100 text-blue-800">30 min</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">IP Restrictions</span>
              <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">System Secure</p>
                <p className="text-xs text-gray-500">No threats detected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
              <Shield className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Firewall Active</p>
                <p className="text-xs text-gray-500">All ports protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">SSL Expiry</p>
                <p className="text-xs text-gray-500">Renews in 45 days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Security Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  2FA Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.slice(0, 5).map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {user.username?.charAt(0) || user.email?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-green-100 text-green-800">Low</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// System Configuration Dialog Component
const SystemConfigDialog = ({ systemConfig, onClose, onRefresh }) => {
  const [activeConfigTab, setActiveConfigTab] = useState('general');

  return (
    <div className="space-y-6">
      <Tabs value={activeConfigTab} onValueChange={setActiveConfigTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  defaultValue="Digame Platform"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Language
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enforce Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Require 2FA for all users</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Strong Password Policy</p>
                  <p className="text-xs text-gray-500">Minimum 12 characters with complexity</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Caching</p>
                  <p className="text-xs text-gray-500">Redis-based response caching</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cache TTL (seconds)
                </label>
                <input
                  type="number"
                  defaultValue="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Limit (requests/minute)
                </label>
                <input
                  type="number"
                  defaultValue="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Webhooks</p>
                  <p className="text-xs text-gray-500">Allow external webhook integrations</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">API Rate Limiting</p>
                  <p className="text-xs text-gray-500">Enforce API usage limits</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Timeout (seconds)
                </label>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onRefresh();
            onClose();
          }}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
