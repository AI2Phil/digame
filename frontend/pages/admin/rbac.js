import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Key as KeyIcon,
  Users as UserGroupIcon,
  ShieldCheck as ShieldCheckIcon,
  Lock as LockClosedIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Plus as PlusIcon,
  Edit as PencilIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  RotateCcw as ArrowPathIcon,
  Settings as Cog6ToothIcon,
  User as UserIcon,
  FileText as DocumentTextIcon,
  ClipboardList as ClipboardDocumentListIcon
} from 'lucide-react';

export default function AdminRBAC() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roles');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    fetchRBACData();
  }, []);

  const fetchRBACData = async () => {
    try {
      // Simulate API calls
      const [rolesRes, permissionsRes, usersRes] = await Promise.all([
        fetch('/api/admin/rbac/roles'),
        fetch('/api/admin/rbac/permissions'),
        fetch('/api/admin/rbac/users')
      ]);
      
      const rolesData = await rolesRes.json();
      const permissionsData = await permissionsRes.json();
      const usersData = await usersRes.json();
      
      setRoles(rolesData.data || []);
      setPermissions(permissionsData.data || []);
      setUsers(usersData.data || []);
    } catch (error) {
      console.error('Error fetching RBAC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (level) => {
    switch (level) {
      case 'system':
        return <ShieldCheckIcon className="h-5 w-5 text-red-600" />;
      case 'admin':
        return <KeyIcon className="h-5 w-5 text-purple-600" />;
      case 'manager':
        return <UserGroupIcon className="h-5 w-5 text-blue-600" />;
      case 'user':
        return <UserIcon className="h-5 w-5 text-green-600" />;
      default:
        return <LockClosedIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleColor = (level) => {
    switch (level) {
      case 'system':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionIcon = (category) => {
    switch (category) {
      case 'user':
        return <UserIcon className="h-4 w-4 text-blue-600" />;
      case 'system':
        return <Cog6ToothIcon className="h-4 w-4 text-red-600" />;
      case 'content':
        return <DocumentTextIcon className="h-4 w-4 text-green-600" />;
      case 'security':
        return <ShieldCheckIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <LockClosedIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleCreateRole = async (roleData) => {
    try {
      const response = await fetch('/api/admin/rbac/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      });
      
      if (response.ok) {
        setShowRoleModal(false);
        fetchRBACData();
      }
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        const response = await fetch(`/api/admin/rbac/roles/${roleId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchRBACData();
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      const response = await fetch(`/api/admin/rbac/users/${userId}/assign-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId })
      });
      
      if (response.ok) {
        fetchRBACData();
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <KeyIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Role-Based Access Control</h1>
                  <p className="text-sm text-gray-600">Manage roles, permissions, and user access</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowRoleModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Role
                </button>
                <button 
                  onClick={fetchRBACData}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* RBAC Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LockClosedIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Permissions</p>
                <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.filter(r => r.status === 'active').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RBAC Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'roles', name: 'Roles', icon: UserGroupIcon },
                { id: 'permissions', name: 'Permissions', icon: LockClosedIcon },
                { id: 'users', name: 'User Assignments', icon: UserIcon },
                { id: 'audit', name: 'Access Audit', icon: ClipboardDocumentListIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'roles' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">System Roles</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Levels</option>
                      <option value="system">System</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="user">User</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search roles..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.map((role) => (
                    <div key={role.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {getRoleIcon(role.level)}
                          <div className="ml-3">
                            <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role.level)}`}>
                              {role.level}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Users:</span>
                          <span className="font-medium">{role.userCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Permissions:</span>
                          <span className="font-medium">{role.permissionCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{role.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Status: <span className={`font-medium ${role.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {role.status}
                          </span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Manage Permissions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">System Permissions</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Categories</option>
                      <option value="user">User Management</option>
                      <option value="system">System</option>
                      <option value="content">Content</option>
                      <option value="security">Security</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(
                    permissions.reduce((acc, permission) => {
                      if (!acc[permission.category]) {
                        acc[permission.category] = [];
                      }
                      acc[permission.category].push(permission);
                      return acc;
                    }, {})
                  ).map(([category, categoryPermissions]) => (
                    <div key={category} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                        {getPermissionIcon(category)}
                        <span className="ml-2 capitalize">{category} Permissions</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="bg-white rounded-lg p-4 border">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{permission.name}</h5>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                permission.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                permission.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {permission.riskLevel}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Used in {permission.roleCount} roles
                              </span>
                              <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                View Roles
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">User Role Assignments</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Roles</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-gray-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getRoleIcon(user.roleLevel)}
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.roleLevel)}`}>
                                {user.roleName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <select 
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                onChange={(e) => handleAssignRole(user.id, e.target.value)}
                                defaultValue={user.roleId}
                              >
                                {roles.map((role) => (
                                  <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Access Audit Trail</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Events</option>
                      <option value="role_assigned">Role Assigned</option>
                      <option value="permission_granted">Permission Granted</option>
                      <option value="access_denied">Access Denied</option>
                    </select>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      event: 'Role assigned',
                      user: 'john.doe@company.com',
                      role: 'Manager',
                      timestamp: '2024-01-15 14:30:25',
                      actor: 'admin@company.com',
                      type: 'role_assigned'
                    },
                    {
                      id: 2,
                      event: 'Permission granted',
                      user: 'jane.smith@company.com',
                      permission: 'user.delete',
                      timestamp: '2024-01-15 14:28:15',
                      actor: 'admin@company.com',
                      type: 'permission_granted'
                    },
                    {
                      id: 3,
                      event: 'Access denied',
                      user: 'guest@external.com',
                      resource: '/admin/config',
                      timestamp: '2024-01-15 14:25:10',
                      reason: 'Insufficient permissions',
                      type: 'access_denied'
                    }
                  ].map((audit) => (
                    <div key={audit.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              audit.type === 'role_assigned' ? 'bg-green-100 text-green-800' :
                              audit.type === 'permission_granted' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {audit.event}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">{audit.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{audit.user}</span>
                            {audit.role && ` was assigned role "${audit.role}"`}
                            {audit.permission && ` was granted permission "${audit.permission}"`}
                            {audit.resource && ` was denied access to "${audit.resource}"`}
                            {audit.actor && ` by ${audit.actor}`}
                          </p>
                          {audit.reason && (
                            <p className="text-sm text-gray-600 mt-1">Reason: {audit.reason}</p>
                          )}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Role</h3>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Content Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Level</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Describe the role and its responsibilities..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {permissions.slice(0, 6).map((permission) => (
                      <label key={permission.id} className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-700">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateRole({})}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}