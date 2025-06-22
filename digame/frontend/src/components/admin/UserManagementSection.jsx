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
import { Select } from '../ui/Select'; // Added
import { Checkbox } from '../ui/Checkbox'; // Added
import { Table } from '../ui/Table';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Toast } from '../ui/Toast';

const UserManagementSection = ({
  users,
  searchTerm,
  setSearchTerm,
  onUserAction,
  onUserSelect
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
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
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    );
  };

  const handleBulkAction = async (action) => {
    try {
      await Promise.all(
        selectedUsers.map(userId => onUserAction(userId, action))
      );
      setSelectedUsers([]);
      Toast.success(`Bulk ${action} completed successfully`);
    } catch (error) {
      Toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && user.is_active) ||
                           (filterStatus === 'inactive' && !user.is_active);
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const order = sortOrder === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * order;
      }
      return (aValue - bValue) * order;
    });

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
          <div className={`border rounded-lg overflow-hidden transition-all duration-300 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Table className={isDarkMode ? 'dark' : ''}>
              <thead className={`transition-all duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className="w-12 p-4">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all users"
                      className={`transition-all duration-200 ${
                        isDarkMode
                          ? 'border-gray-600 data-[state=checked]:bg-blue-600'
                          : 'border-gray-300 data-[state=checked]:bg-blue-600'
                      }`}
                    />
                  </th>
                  <th className={`text-left p-4 font-medium transition-all duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>User</th>
                  <th className={`text-left p-4 font-medium transition-all duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Role</th>
                  <th className={`text-left p-4 font-medium transition-all duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Status</th>
                  <th className={`text-left p-4 font-medium transition-all duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Last Login</th>
                  <th className={`text-left p-4 font-medium transition-all duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Created</th>
                  <th className={`text-left p-4 font-medium transition-all duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`border-t transition-all duration-200 ${
                    isDarkMode
                      ? 'border-gray-700 hover:bg-gray-700/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <td className="p-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                        aria-label={`Select user ${user.username}`}
                        className={`transition-all duration-200 ${
                          isDarkMode
                            ? 'border-gray-600 data-[state=checked]:bg-blue-600'
                            : 'border-gray-300 data-[state=checked]:bg-blue-600'
                        }`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar}
                          alt={user.username}
                          fallback={user.username?.charAt(0).toUpperCase()}
                          size="sm"
                          className={`transition-all duration-200 ${
                            isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'
                          }`}
                        />
                        <div>
                          <p className={`font-medium transition-all duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{user.username}</p>
                          <p className={`text-sm transition-all duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4">
                      {getUserStatusBadge(user)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {user.last_login ? (
                          <>
                            <p className={`transition-all duration-300 ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>{new Date(user.last_login).toLocaleDateString()}</p>
                            <p className={`transition-all duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {new Date(user.last_login).toLocaleTimeString()}
                            </p>
                          </>
                        ) : (
                          <span className={`transition-all duration-300 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>Never</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className={`transition-all duration-300 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>{new Date(user.created_at).toLocaleDateString()}</p>
                        <p className={`transition-all duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {new Date(user.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUserSelect(user)}
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
                          onClick={() => onUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                          className={`transition-all duration-200 ${
                            isDarkMode
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onUserAction(user.id, 'delete')}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className={`text-sm transition-all duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className={`transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-500 bg-gray-800'
                    : 'border-gray-300 text-gray-400 bg-gray-50'
                }`}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`transition-all duration-200 ${
                  isDarkMode
                    ? 'border-blue-600 text-white bg-blue-600 hover:bg-blue-700'
                    : 'border-blue-600 text-white bg-blue-600 hover:bg-blue-700'
                }`}
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className={`transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-500 bg-gray-800'
                    : 'border-gray-300 text-gray-400 bg-gray-50'
                }`}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementSection;