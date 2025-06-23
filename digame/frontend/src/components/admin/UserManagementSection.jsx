import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '../ui/Checkbox'; // Keep for now, DataTable might have its own selection checkboxes
// import { Table } from '../ui/Table'; // Will use DataTable
import { DataTable } from '../ui/Table'; // Import DataTable
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
// Dialog is not directly used in this section in the new structure, but kept for AdminDashboardPage.
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Toast } from '../ui/Toast'; // Keep Toast for notifications

const UserManagementSection = ({
  users, // This will be the 'data' prop for DataTable
  searchTerm: initialSearchTerm, // Renamed to avoid conflict if DataTable has internal search
  setSearchTerm: onSearchTermChange, // Callback for external search changes
  onUserAction,
  onUserSelect,
  // isLoading prop can be used to show a loading state in DataTable if supported, or handle outside
}) => {
  const [selectedUserIds, setSelectedUserIds] = useState(new Set()); // Store IDs for selected users
  // External filter states, to be used for pre-filtering data passed to DataTable
  const [currentFilterRole, setCurrentFilterRole] = useState('all');
  const [currentFilterStatus, setCurrentFilterStatus] = useState('all');
  // sortBy and sortOrder will be handled by DataTable internally if its sorting is used.
  // If external sorting controls are desired, these states might be needed to control DataTable.
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    // NOTE: In a real app, you'd likely call a prop function to reload data.
    // For now, just simulate a delay.
    setTimeout(() => {
        setRefreshing(false);
        // Consider calling a prop like onRefreshData() if AdminDashboardPage should handle it
    }, 1000);
  };

  // DataTable will call this with an array of selected row original data objects or their IDs/indices
  const handleSelectionChange = (selectedRowIdentifiers) => {
    // Assuming DataTable provides an array of user IDs if primaryKey="id" is set,
    // or indices if not. If it's indices, map to IDs based on processedUsers.
    // For simplicity, assuming it's IDs for now.
    setSelectedUserIds(new Set(selectedRowIdentifiers));
  };

  const handleBulkAction = async (action) => {
    try {
      await Promise.all(
        Array.from(selectedUserIds).map(userId => onUserAction(userId, action))
      );
      setSelectedUserIds(new Set()); // Clear selection
      Toast.success(`Bulk ${action} completed successfully`);
    } catch (error) {
      Toast.error(`Failed to perform bulk ${action}`);
    }
  };

  // Memoized filtered and sorted data for DataTable
  // DataTable will handle its own sorting if its internal sort controls are used.
  // If we want external sort controls, this memo would also include sorting.
  const processedUsers = React.useMemo(() => {
    let filtered = users;

    // Apply external search term
    if (initialSearchTerm) {
      const lowerSearchTerm = initialSearchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(lowerSearchTerm) ||
        user.email?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply external role filter
    if (currentFilterRole !== 'all') {
      filtered = filtered.filter(user => user.role === currentFilterRole);
    }

    // Apply external status filter
    if (currentFilterStatus !== 'all') {
      filtered = filtered.filter(user =>
        (currentFilterStatus === 'active' && user.is_active) ||
        (currentFilterStatus === 'inactive' && !user.is_active)
      );
    }

    // Sorting is expected to be handled by DataTable itself if `sortable` prop is true on columns
    return filtered;
  }, [users, initialSearchTerm, currentFilterRole, currentFilterStatus]);

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
            onClick={(e) => { e.stopPropagation(); onUserSelect(row); }}
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
            onClick={(e) => { e.stopPropagation(); onUserAction(row.id, row.is_active ? 'deactivate' : 'activate'); }}
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
            onClick={(e) => { e.stopPropagation(); onUserAction(row.id, 'delete'); }}
            className="transition-all duration-200 hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                }`}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterRole}
                onChange={setFilterRole}
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
                value={filterStatus}
                onChange={setFilterStatus}
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
                value: users.length,
                icon: Users,
                color: 'blue',
                trend: '+12%'
              },
              {
                title: 'Active Users',
                value: users.filter(u => u.is_active).length,
                icon: CheckCircle,
                color: 'green',
                trend: '+5%'
              },
              {
                title: 'New This Week',
                value: users.filter(u => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(u.created_at) > weekAgo;
                }).length,
                icon: TrendingUp,
                color: 'purple',
                trend: '+23%'
              },
              {
                title: 'Admin Users',
                value: users.filter(u => u.role === 'admin').length,
                icon: Shield,
                color: 'red',
                trend: '0%'
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
          {selectedUsers.length > 0 && (
            <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg border transition-all duration-200 ${
              isDarkMode
                ? 'bg-blue-900/30 border-blue-700'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                {selectedUsers.length} user(s) selected
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
            onRowClick={(user) => onUserSelect(user)} // Pass row data to onUserSelect
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