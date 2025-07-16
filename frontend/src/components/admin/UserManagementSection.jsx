import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Download, MoreHorizontal,
  UserCheck, UserX, Shield, Key, Mail,
  Calendar, Activity, Edit, Trash2, Users,
  Clock, TrendingUp, BarChart3, AlertTriangle,
  CheckCircle, Globe, Zap, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { DataTable } from '../ui/Table';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

const UserManagementSection = () => {
  // Toast hook for notifications
  const { toast } = useToast();
  
  // State management for database-driven data
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilterRole, setCurrentFilterRole] = useState('all');
  const [currentFilterStatus, setCurrentFilterStatus] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Fetch users data from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        skip: ((pagination.page - 1) * pagination.limit).toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        role_filter: currentFilterRole,
        status_filter: currentFilterStatus
      });

      const response = await fetch(`http://localhost:8001/api/admin/users/comprehensive?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        pages: data.pages || 0
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      // Fallback to enhanced sample data
      generateEnhancedSampleData();
      // Show notification that fallback data is being used
      toast.warning('API Unavailable', 'Using sample data - API endpoints not accessible');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, currentFilterRole, currentFilterStatus, toast]);

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8001/api/admin/users/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserStats(data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
      // Fallback to sample stats
      setUserStats({
        totalUsers: 156,
        activeUsers: 142,
        inactiveUsers: 14,
        onlineUsers: 23,
        pendingUsers: 8,
        newUsersThisWeek: 12,
        growthRate: 8.3
      });
    }
  }, []);

  // Generate enhanced sample data as fallback
  const generateEnhancedSampleData = () => {
    const sampleUsers = [];
    const roles = ['admin', 'manager', 'user', 'viewer'];
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    
    for (let i = 1; i <= 50; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const isActive = Math.random() > 0.1; // 90% active
      const isOnline = isActive && Math.random() > 0.7; // 30% of active users online
      
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));
      
      const lastLoginDate = isActive ? new Date() : null;
      if (lastLoginDate) {
        lastLoginDate.setHours(lastLoginDate.getHours() - Math.floor(Math.random() * 168)); // Within last week
      }

      sampleUsers.push({
        id: i,
        username: `user${i.toString().padStart(3, '0')}`,
        email: `user${i}@${role === 'admin' ? 'admin.' : ''}company.com`,
        first_name: `First${i}`,
        last_name: `Last${i}`,
        is_active: isActive,
        created_at: createdDate.toISOString(),
        updated_at: new Date().toISOString(),
        last_login: lastLoginDate?.toISOString() || null,
        role: role,
        activity_count: Math.floor(Math.random() * 1000),
        is_online: isOnline,
        onboarding_completed: Math.random() > 0.2, // 80% completed
        avatar: `https://ui-avatars.com/api/?name=User${i}&background=random`,
        department: department
      });
    }
    
    setUsers(sampleUsers);
    setPagination(prev => ({
      ...prev,
      total: sampleUsers.length,
      pages: Math.ceil(sampleUsers.length / prev.limit)
    }));
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [fetchUsers, fetchUserStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchUserStats()]);
    setRefreshing(false);
  };

  // DataTable will call this with an array of selected row original data objects or their IDs/indices
  const handleSelectionChange = (selectedRowIdentifiers) => {
    // Assuming DataTable provides an array of user IDs if primaryKey="id" is set,
    // or indices if not. If it's indices, map to IDs based on processedUsers.
    // For simplicity, assuming it's IDs for now.
    setSelectedUserIds(new Set(selectedRowIdentifiers));
  };

  // Handle individual user actions
  const handleUserAction = async (userId, action) => {
    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'activate':
        case 'deactivate':
          endpoint = `http://localhost:8001/api/admin/users/${userId}/toggle-status`;
          break;
        case 'delete':
          endpoint = `http://localhost:8001/api/admin/users/${userId}`;
          method = 'DELETE';
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${action} user`);
      }

      const result = await response.json();
      toast.success('Success', result.message || `User ${action} successful`);
      
      // Refresh data
      await fetchUsers();
      await fetchUserStats();
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast.error('Error', error.message || `Failed to ${action} user`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUserIds.size === 0) {
      toast.error('Error', 'No users selected');
      return;
    }

    try {
      const response = await fetch('http://localhost:8001/api/admin/users/bulk-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          user_ids: Array.from(selectedUserIds)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to perform bulk ${action}`);
      }

      const result = await response.json();
      toast.success('Success', result.message || `Bulk ${action} completed successfully`);
      
      setSelectedUserIds(new Set()); // Clear selection
      
      // Refresh data
      await fetchUsers();
      await fetchUserStats();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error('Error', error.message || `Failed to perform bulk ${action}`);
    }
  };

  // Handle user selection for details view
  const handleUserSelect = (user) => {
    // This could open a modal or navigate to a detail page
    console.log('Selected user:', user);
    // For now, just show user info in console
    toast.info('User Selected', `Selected user: ${user.username}`);
  };

  // Since filtering is now handled by the API, we can use users directly
  const processedUsers = users;

  // Handle search input changes with debouncing
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleRoleFilterChange = (value) => {
    setCurrentFilterRole(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilterChange = (value) => {
    setCurrentFilterStatus(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getUserStatusBadge = (user) => {
    if (!user.is_active) return <Badge variant="destructive">Inactive</Badge>;
    if (user.last_login && new Date(user.last_login) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return <Badge variant="success">Online</Badge>;
    }
    return <Badge variant="secondary">Offline</Badge>;
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'destructive',
      manager: 'warning',
      user: 'default',
      viewer: 'secondary'
    };
    return <Badge variant={roleColors[role] || 'default'}>{role}</Badge>;
  };

  const columns = [
    {
      key: 'user', // This key should match a property in the user object or be arbitrary if using render
      title: 'User',
      sortable: true, // DataTable can sort by this column if data is structured appropriately
      render: (value, row) => ( // value is row[key], row is the full user object
        <div className="flex items-center gap-3">
          <Avatar
            src={row.avatar}
            alt={row.username}
            fallback={row.username?.charAt(0).toUpperCase()}
            size="sm"
            className={`transition-all duration-200 ${
              isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'
            }`}
          />
          <div>
            <p className={`font-medium transition-all duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{row.username}</p>
            <p className={`text-sm transition-all duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (role) => getRoleBadge(role),
    },
    {
      key: 'is_active', // Assuming user object has 'is_active' for status
      title: 'Status',
      sortable: true,
      render: (isActive, row) => getUserStatusBadge(row), // Pass the whole row if needed by badge function
    },
    {
      key: 'last_login',
      title: 'Last Login',
      sortable: true,
      render: (last_login) => (
        <div className="text-sm">
          {last_login ? (
            <>
              <p className={`transition-all duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>{new Date(last_login).toLocaleDateString()}</p>
              <p className={`transition-all duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {new Date(last_login).toLocaleTimeString()}
              </p>
            </>
          ) : (
            <span className={`transition-all duration-300 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>Never</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      render: (created_at) => (
         <div className="text-sm">
            <p className={`transition-all duration-300 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            }`}>{new Date(created_at).toLocaleDateString()}</p>
            <p className={`transition-all duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {new Date(created_at).toLocaleTimeString()}
            </p>
          </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); handleUserSelect(row); }}
            className={`transition-all duration-200 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); handleUserAction(row.id, row.is_active ? 'deactivate' : 'activate'); }}
            className={`transition-all duration-200 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {row.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => { e.stopPropagation(); handleUserAction(row.id, 'delete'); }}
            className="transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-lg">Loading users...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error && users.length === 0) {
    return (
      <div className="space-y-6">
        <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Users</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Shield className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Manage user accounts, roles, and permissions with advanced controls
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className={`transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                className={`transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`pl-10 transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                }`}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={currentFilterRole}
                onChange={handleRoleFilterChange}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'user', label: 'User' },
                  { value: 'viewer', label: 'Viewer' },
                ]}
                className={`text-sm min-w-[120px] transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <Select
                value={currentFilterStatus}
                onChange={handleStatusFilterChange}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                className={`text-sm min-w-[120px] transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <Button
                variant="outline"
                size="sm"
                className={`transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                title: 'Total Users',
                value: userStats.totalUsers || users.length,
                icon: Users,
                color: 'blue',
                trend: `+${userStats.growthRate || 12}%`
              },
              {
                title: 'Active Users',
                value: userStats.activeUsers || users.filter(u => u.is_active).length,
                icon: CheckCircle,
                color: 'green',
                trend: '+5%'
              },
              {
                title: 'Online Now',
                value: userStats.onlineUsers || users.filter(u => u.is_online).length,
                icon: Activity,
                color: 'purple',
                trend: '+8%'
              },
              {
                title: 'New This Week',
                value: userStats.newUsersThisWeek || users.filter(u => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(u.created_at) > weekAgo;
                }).length,
                icon: TrendingUp,
                color: 'green',
                trend: '+23%'
              },
            ].map(stat => {
              const StatIcon = stat.icon;
              return (
                <Card key={stat.title} className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                        <StatIcon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                      <div>
                        <p className={`text-xs text-gray-600 ${isDarkMode ? 'dark:text-gray-400' : ''}`}>{stat.title}</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                          <span className={`text-xs ${
                            stat.trend.startsWith('+') ? 'text-green-500' :
                            stat.trend.startsWith('-') ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {stat.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bulk Actions */}
          {selectedUserIds.size > 0 && (
            <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg border transition-all duration-200 ${
              isDarkMode
                ? 'bg-blue-900/30 border-blue-700'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                {selectedUserIds.size} user(s) selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                  className={`transition-all duration-200 ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('deactivate')}
                  className={`transition-all duration-200 ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <DataTable
            data={processedUsers}
            columns={columns}
            sortable={true} // Enable global sorting for DataTable
            filterable={false} // External filters are used via processedUsers
            searchable={false} // External search is used via processedUsers
            pagination={true}
            pageSize={10}
            className={`transition-all duration-300 ${isDarkMode ? 'dark' : ''}`} // Apply dark mode if needed
            onRowClick={(user) => handleUserSelect(user)} // Pass row data to handleUserSelect
            rowSelection={true} // Enable row selection in DataTable
            onSelectionChange={handleSelectionChange} // Handle selection changes from DataTable
            // primaryKey="id" // Assuming 'id' is the unique key for users, important for selection
          />
          {/* DataTable handles its own pagination if pagination={true} */}
          {/* The old manual pagination div is removed. */}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementSection;