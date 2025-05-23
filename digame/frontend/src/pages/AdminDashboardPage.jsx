import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Progress } from '../components/ui/Progress';
import Avatar from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch users, analytics, and other admin data
      const [usersResponse, analyticsResponse] = await Promise.all([
        fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (usersResponse.ok && analyticsResponse.ok) {
        const usersData = await usersResponse.json();
        const analyticsData = await analyticsResponse.json();
        setUsers(usersData);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error(`Error performing ${action} on user:`, error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      suspended: { variant: 'destructive', label: 'Suspended' },
      pending: { variant: 'warning', label: 'Pending' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const userTableColumns = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center space-x-3">
          <Avatar
            src={user.avatar}
            alt={user.username}
            fallback={user.username?.charAt(0)?.toUpperCase() || 'U'}
            size="sm"
          />
          <div>
            <div className="font-medium">{user.username}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => getStatusBadge(user.status || 'active')
    },
    {
      key: 'onboarding',
      header: 'Onboarding',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <Progress 
            value={user.onboarding_completed ? 100 : 0} 
            className="w-16"
          />
          <span className="text-sm text-gray-600">
            {user.onboarding_completed ? '100%' : '0%'}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user) => (
        <span className="text-sm text-gray-600">
          {formatDate(user.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUserAction(user.id, 'view')}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
          >
            {user.status === 'active' ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      )
    }
  ];

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.newUsersThisMonth || 0} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeUsersPercentage || 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Rate</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.onboardingRate || 0}%</div>
            <Progress value={analytics.onboardingRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              {analytics.uptime || 99.9}% uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
          <CardDescription>Latest user registrations and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center space-x-4">
                <Avatar
                  src={user.avatar}
                  alt={user.username}
                  fallback={user.username?.charAt(0)?.toUpperCase() || 'U'}
                  size="sm"
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {formatDate(user.created_at)}
                  </p>
                </div>
                {getStatusBadge(user.status || 'active')}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => fetchAdminData()}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table
            data={users}
            columns={userTableColumns}
            loading={loading}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab /> },
    { id: 'users', label: 'Users', content: <UsersTab /> },
    { id: 'analytics', label: 'Analytics', content: <div>Analytics content coming soon...</div> },
    { id: 'settings', label: 'Settings', content: <div>Settings content coming soon...</div> }
  ];

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your Digame platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="success">Admin</Badge>
                <Avatar
                  src="/admin-avatar.jpg"
                  alt="Admin"
                  fallback="A"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;