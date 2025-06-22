import React, { useState } from 'react';
import { 
  Search, Filter, Download, MoreHorizontal, ChevronDown, ChevronUp, ArrowUpDown,
  UserCheck, UserX, Shield, Key, Mail, 
  Calendar, Activity, Edit, Trash2, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '../ui/Table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox'; // Assuming Checkbox component exists
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '../ui/DropdownMenu'; // For actions
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
// import { Toast } from '../ui/Toast'; // Assuming Toast is handled globally or via a context

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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full sm:w-auto text-xs sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-auto text-xs sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {/* <Button variant="outline" size="sm" className="hidden sm:flex">
                <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
              </Button> */}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex gap-2 ml-0 sm:ml-auto mt-2 sm:mt-0">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => handleBulkAction('activate')}
                >
                  <UserCheck className="w-3 h-3 mr-1.5" /> Activate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <UserX className="w-3 h-3 mr-1.5" /> Deactivate
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="border rounded-lg overflow-x-auto dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="w-10 sm:w-12 p-2 sm:p-4">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all users"
                      className="dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                    />
                  </TableHead>
                  <TableHead className="p-2 sm:p-4 font-medium text-gray-600 dark:text-gray-300 min-w-[200px]">User</TableHead>
                  <TableHead className="p-2 sm:p-4 font-medium text-gray-600 dark:text-gray-300">Role</TableHead>
                  <TableHead className="p-2 sm:p-4 font-medium text-gray-600 dark:text-gray-300">Status</TableHead>
                  <TableHead className="p-2 sm:p-4 font-medium text-gray-600 dark:text-gray-300 min-w-[150px]">Last Login</TableHead>
                  <TableHead className="p-2 sm:p-4 font-medium text-gray-600 dark:text-gray-300 min-w-[150px]">Created</TableHead>
                  <TableHead className="p-2 sm:p-4 font-medium text-gray-600 dark:text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="p-2 sm:p-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                        aria-label={`Select user ${user.username}`}
                        className="dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                      />
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="dark:bg-gray-600 dark:text-gray-300">
                            {user.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="p-2 sm:p-4">{getUserStatusBadge(user)}</TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {user.last_login ? (
                          <>
                            <p>{new Date(user.last_login).toLocaleDateString()}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                              {new Date(user.last_login).toLocaleTimeString()}
                            </p>
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Never</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        <p>{new Date(user.created_at).toLocaleDateString()}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(user.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="dark:text-gray-400 dark:hover:bg-gray-700">
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="sr-only">User Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
                          <DropdownMenuItem onClick={() => onUserSelect(user)} className="dark:hover:bg-gray-700/70">
                            <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUserSelect(user)} className="dark:hover:bg-gray-700/70">
                            <Edit className="w-3.5 h-3.5 mr-2" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="dark:bg-gray-700" />
                          <DropdownMenuItem
                            onClick={() => onUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                            className="dark:hover:bg-gray-700/70"
                          >
                            {user.is_active ? <UserX className="w-3.5 h-3.5 mr-2" /> : <UserCheck className="w-3.5 h-3.5 mr-2" />}
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                             onClick={() => onUserAction(user.id, 'reset_password')}
                             className="dark:hover:bg-gray-700/70"
                          >
                            <Key className="w-3.5 h-3.5 mr-2" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="dark:bg-gray-700"/>
                          <DropdownMenuItem
                            onClick={() => onUserAction(user.id, 'delete')}
                            className="text-red-600 dark:text-red-400 dark:hover:bg-red-700/30 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-700/50"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {filteredUsers.length === 0 && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    No users found matching your criteria.
                </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredUsers.length > 0 ? 1 : 0} to {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="outline" size="sm" disabled className="dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                1
              </Button>
              {/* Add more page numbers if implementing full pagination */}
              <Button variant="outline" size="sm" disabled className="dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700">
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