import React, { useState, useEffect } from 'react';
import Head from 'next/head';
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
import { useToastActions } from '../../components/ui/Toast';
import apiService from '../../services/apiService';

interface User {
  id: string;
  username?: string;
  email?: string;
  is_active?: boolean;
  last_login?: string;
}

interface SystemStats {
  totalUsers?: number;
  activeSessions?: number;
  apiRequests?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  dbLoad?: number;
  avgResponseTime?: number;
}

const AdminPage: React.FC = () => {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToastActions();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({});
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [onboardingStats, setOnboardingStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>({});
  const [platformHealth, setPlatformHealth] = useState<any>({});
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Use available API methods with fallback mock data
      const [userAnalyticsData] = await Promise.all([
        apiService.getUserAnalytics().catch(() => ({})),
      ]);

      // Mock data for admin dashboard
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@digame.com',
          is_active: true,
          last_login: new Date().toISOString(),
        },
        {
          id: '2',
          username: 'user1',
          email: 'user1@example.com',
          is_active: true,
          last_login: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '3',
          username: 'user2',
          email: 'user2@example.com',
          is_active: false,
          last_login: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      const mockSystemStats: SystemStats = {
        totalUsers: 1234,
        activeSessions: 156,
        apiRequests: 45678,
        cpuUsage: 45,
        memoryUsage: 62,
        dbLoad: 38,
        avgResponseTime: 120,
      };

      setUsers(mockUsers);
      setSystemStats(mockSystemStats);
      setApiKeys([]);
      setOnboardingStats({});
      setSystemConfig({});
      setPlatformHealth({});
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toastError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      // Mock user action
      console.log(`Performing ${action} on user ${userId}`);
      toastSuccess(`User ${action} successfully`);
      loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toastError(`Failed to ${action} user`);
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
    <>
      <Head>
        <title>Admin Dashboard - Digame</title>
        <meta name="description" content="Manage users, monitor system performance, and track platform analytics" />
      </Head>

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
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(user => (
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
                              <Badge className={user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleUserAction(user.id, 'view')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleUserAction(user.id, 'edit')}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}>
                                  {user.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
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
            </TabsContent>

            {/* System Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>CPU Usage</span>
                        <span className="font-semibold">{systemStats.cpuUsage || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Usage</span>
                        <span className="font-semibold">{systemStats.memoryUsage || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database Load</span>
                        <span className="font-semibold">{systemStats.dbLoad || 0}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Key Management</CardTitle>
                  <CardDescription>Manage API keys and access tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No API keys configured</p>
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onboarding Tab */}
            <TabsContent value="onboarding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Analytics</CardTitle>
                  <CardDescription>Track user onboarding progress and completion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Onboarding analytics will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-6">
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'emerald';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon: Icon, color }) => {
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
const SystemHealthCard: React.FC<{ systemStats: SystemStats }> = ({ systemStats }) => (
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
const RecentActivityCard: React.FC = () => (
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
const UserGrowthCard: React.FC = () => (
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
const PerformanceMetricsCard: React.FC = () => (
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
const AlertsCard: React.FC = () => (
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

export default AdminPage;