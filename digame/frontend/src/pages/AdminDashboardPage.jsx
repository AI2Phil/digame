import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, BarChart3, Key, UserCheck, 
  Activity, Shield, Database, AlertTriangle, 
  TrendingUp, Clock, CheckCircle, XCircle,
  Search, Filter, Download, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Progress } from '../components/ui/Progress';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Toast } from '../components/ui/Toast';
import apiService from '../services/apiService';
import UserManagementSection from '../components/admin/UserManagementSection';
import SystemAnalyticsSection from '../components/admin/SystemAnalyticsSection';
import ApiKeyManagementSection from '../components/admin/ApiKeyManagementSection';
import OnboardingAnalyticsSection from '../components/admin/OnboardingAnalyticsSection';
import UserDetailsDialog from '../components/admin/UserDetailsDialog';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [apiKeys, setApiKeys] = useState([]);
  const [onboardingStats, setOnboardingStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData, keysData, onboardingData] = await Promise.all([
        apiService.getUsers(),
        apiService.getSystemStats(),
        apiService.getAdminApiKeys(),
        apiService.getOnboardingAnalytics()
      ]);

      setUsers(usersData);
      setSystemStats(statsData);
      setApiKeys(keysData);
      setOnboardingStats(onboardingData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await apiService.performUserAction(userId, action);
      Toast.success(`User ${action} successfully`);
      loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      Toast.error(`Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter(user =>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, monitor system performance, and track platform analytics</p>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">System Analytics</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
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
              onUserSelect={(user) => {
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
        </Tabs>

        {/* User Details Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Manage user account and permissions
              </DialogDescription>
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
    emerald: 'text-emerald-600 bg-emerald-100'
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
          { action: 'New user registration', user: 'john.doe@example.com', time: '2 minutes ago', type: 'success' },
          { action: 'API key created', user: 'admin@company.com', time: '5 minutes ago', type: 'info' },
          { action: 'Failed login attempt', user: 'suspicious@email.com', time: '10 minutes ago', type: 'warning' },
          { action: 'System backup completed', user: 'System', time: '1 hour ago', type: 'success' }
        ].map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              activity.type === 'success' ? 'bg-green-500' :
              activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
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

export default AdminDashboardPage;