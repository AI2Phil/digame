import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Shield,
  Users,
  Key,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Building,
  Crown,
  Star,
  BarChart3,
  TrendingUp,
  Activity,
  RefreshCw,
  Download,
} from 'lucide-react';

// UI Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({
  children,
  className = '',
  size = 'default',
  variant = 'default',
  onClick,
  disabled,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
  };
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = '', variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 bg-white text-gray-700',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const AccessControl: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockData = {
    overview: {
      totalUsers: 1247,
      activeUsers: 1089,
      roles: 8,
      permissions: 156,
      lastPolicyUpdate: '2024-03-10T14:30:00',
      accessViolations: 3,
      pendingRequests: 12,
    },
    roles: [
      {
        id: 1,
        name: 'Platform Owner',
        description: 'Full platform access and control',
        users: 2,
        permissions: 156,
        level: 'system',
        color: 'purple',
        icon: Crown,
        createdAt: '2024-01-01T00:00:00',
        lastModified: '2024-03-01T10:00:00',
      },
      {
        id: 2,
        name: 'Administrator',
        description: 'Administrative access to platform features',
        users: 8,
        permissions: 89,
        level: 'admin',
        color: 'red',
        icon: Shield,
        createdAt: '2024-01-01T00:00:00',
        lastModified: '2024-02-15T14:30:00',
      },
      {
        id: 3,
        name: 'Team Lead',
        description: 'Team management and project oversight',
        users: 45,
        permissions: 34,
        level: 'management',
        color: 'blue',
        icon: Star,
        createdAt: '2024-01-01T00:00:00',
        lastModified: '2024-03-05T09:15:00',
      },
      {
        id: 4,
        name: 'Developer',
        description: 'Development tools and code access',
        users: 234,
        permissions: 28,
        level: 'user',
        color: 'green',
        icon: Users,
        createdAt: '2024-01-01T00:00:00',
        lastModified: '2024-02-28T16:45:00',
      },
      {
        id: 5,
        name: 'Analyst',
        description: 'Analytics and reporting access',
        users: 156,
        permissions: 22,
        level: 'user',
        color: 'yellow',
        icon: BarChart3,
        createdAt: '2024-01-15T00:00:00',
        lastModified: '2024-03-08T11:20:00',
      },
      {
        id: 6,
        name: 'Guest',
        description: 'Limited read-only access',
        users: 89,
        permissions: 8,
        level: 'guest',
        color: 'gray',
        icon: Eye,
        createdAt: '2024-01-01T00:00:00',
        lastModified: '2024-02-20T13:10:00',
      },
    ],
    permissions: [
      {
        id: 1,
        name: 'user.create',
        description: 'Create new users',
        category: 'User Management',
        level: 'admin',
        roles: ['Platform Owner', 'Administrator'],
        riskLevel: 'high',
      },
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        category: 'User Management',
        level: 'user',
        roles: ['Platform Owner', 'Administrator', 'Team Lead'],
        riskLevel: 'low',
      },
      {
        id: 3,
        name: 'analytics.view',
        description: 'Access analytics dashboards',
        category: 'Analytics',
        level: 'user',
        roles: ['Platform Owner', 'Administrator', 'Team Lead', 'Analyst'],
        riskLevel: 'medium',
      },
      {
        id: 4,
        name: 'system.configure',
        description: 'Modify system configuration',
        category: 'System',
        level: 'system',
        roles: ['Platform Owner'],
        riskLevel: 'critical',
      },
    ],
    accessRequests: [
      {
        id: 1,
        user: 'john.doe@company.com',
        requestedRole: 'Team Lead',
        currentRole: 'Developer',
        reason: 'Promotion to team leadership position',
        requestedAt: '2024-03-14T10:30:00',
        requestedBy: 'jane.smith@company.com',
        status: 'pending',
        priority: 'medium',
      },
      {
        id: 2,
        user: 'alice.johnson@company.com',
        requestedRole: 'Analyst',
        currentRole: 'Guest',
        reason: 'Need access to analytics for project work',
        requestedAt: '2024-03-14T14:15:00',
        requestedBy: 'bob.wilson@company.com',
        status: 'pending',
        priority: 'low',
      },
      {
        id: 3,
        user: 'mike.brown@company.com',
        requestedRole: 'Administrator',
        currentRole: 'Team Lead',
        reason: 'Taking over admin responsibilities',
        requestedAt: '2024-03-13T16:45:00',
        requestedBy: 'admin@company.com',
        status: 'approved',
        priority: 'high',
      },
    ],
    recentActivity: [
      {
        id: 1,
        user: 'admin@company.com',
        action: 'Role Assignment',
        target: 'john.doe@company.com',
        details: 'Assigned Team Lead role',
        timestamp: '2024-03-15T10:30:00',
        status: 'success',
        riskLevel: 'medium',
      },
      {
        id: 2,
        user: 'jane.smith@company.com',
        action: 'Permission Denied',
        target: 'system.configure',
        details: 'Attempted to access system configuration',
        timestamp: '2024-03-15T09:15:00',
        status: 'blocked',
        riskLevel: 'high',
      },
      {
        id: 3,
        user: 'system',
        action: 'Policy Update',
        target: 'Developer Role',
        details: 'Updated permission set for Developer role',
        timestamp: '2024-03-15T08:45:00',
        status: 'success',
        riskLevel: 'low',
      },
    ],
    analytics: {
      roleDistribution: [
        { role: 'Developer', count: 234, percentage: 18.8 },
        { role: 'Analyst', count: 156, percentage: 12.5 },
        { role: 'Guest', count: 89, percentage: 7.1 },
        { role: 'Team Lead', count: 45, percentage: 3.6 },
        { role: 'Administrator', count: 8, percentage: 0.6 },
        { role: 'Platform Owner', count: 2, percentage: 0.2 },
      ],
      accessPatterns: {
        peakHours: '9:00 AM - 11:00 AM',
        averageSessionDuration: '4.2 hours',
        mostAccessedFeatures: ['Analytics', 'Project Management', 'Team Collaboration'],
        accessViolations: 3,
        successfulLogins: 15420,
        failedLogins: 234,
      },
    },
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCurrentData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRoleAction = (roleId, action) => {
    console.log(`${action} role:`, roleId);
  };

  const handleAccessRequest = (requestId, action) => {
    console.log(`${action} access request:`, requestId);
  };

  const handleCreateRole = () => {
    console.log('Creating new role');
  };

  const getRoleColor = color => {
    const colors = {
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[color] || colors.gray;
  };

  const getRiskLevelColor = level => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Access Control & RBAC</h1>
            <p className="text-gray-600 mt-2">
              Manage user roles, permissions, and access policies
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => {}} disabled={false}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={handleCreateRole} disabled={false}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </div>

        {/* Access Control Status */}
        <div className="mt-6">
          <Card className="bg-blue-50 border-blue-200 border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Access Control Active</h2>
                    <p className="text-gray-600">
                      {currentData.overview.activeUsers} of {currentData.overview.totalUsers} users
                      with proper access controls
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">
                    {currentData.overview.roles}
                  </div>
                  <div className="text-sm text-gray-600">Active Roles</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{currentData.overview.totalUsers}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {currentData.overview.activeUsers}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{currentData.overview.roles}</div>
          <div className="text-sm text-gray-600">Roles</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {currentData.overview.permissions}
          </div>
          <div className="text-sm text-gray-600">Permissions</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {currentData.overview.accessViolations}
          </div>
          <div className="text-sm text-gray-600">Violations</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {currentData.overview.pendingRequests}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'roles', label: 'Roles', icon: Users },
            { id: 'permissions', label: 'Permissions', icon: Key },
            { id: 'requests', label: 'Access Requests', icon: Clock },
            { id: 'activity', label: 'Activity Log', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.analytics.roleDistribution.map((role, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{role.role}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${role.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{role.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Access Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.recentActivity.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'roles' && (
        <div>
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="system">System</option>
              <option value="admin">Admin</option>
              <option value="management">Management</option>
              <option value="user">User</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.roles.map(role => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className={`hover:shadow-md transition-shadow border-2 ${getRoleColor(role.color)}`}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRoleColor(role.color)}`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{role.name}</h3>
                            <p className="text-sm text-gray-600">{role.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {role.level}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Users</div>
                          <div className="font-medium">{role.users}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Permissions</div>
                          <div className="font-medium">{role.permissions}</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Last modified: {new Date(role.lastModified).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm"
                          variant="outline"
                          onClick={() => handleRoleAction(role.id, 'edit')} disabled={false}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm"
                          variant="outline"
                          onClick={() => handleRoleAction(role.id, 'view')} disabled={false}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {role.level !== 'system' && (
                          <Button size="sm"
                            variant="destructive"
                            onClick={() => handleRoleAction(role.id, 'delete')} disabled={false}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {currentData.permissions.map(permission => (
            <Card key={permission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">{permission.category}</Badge>
                      <Badge className={getRiskLevelColor(permission.riskLevel)}>
                        {permission.riskLevel} risk
                      </Badge>
                      <span className="text-gray-500">{permission.roles.length} roles</span>
                    </div>

                    <div className="mt-3">
                      <div className="text-sm font-medium mb-1">Assigned to roles:</div>
                      <div className="flex flex-wrap gap-1">
                        {permission.roles.map((role, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => {}} disabled={false}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {}} disabled={false}>
                      <Eye className="h-4 w-4 mr-2" />
                      Usage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {currentData.accessRequests.map(request => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{request.user}</h4>
                        <p className="text-sm text-gray-600">
                          Requesting: {request.currentRole} → {request.requestedRole}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{request.reason}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority} priority
                      </Badge>
                      <span className="text-gray-500">Requested by: {request.requestedBy}</span>
                      <span className="text-gray-500">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" onClick={() => handleAccessRequest(request.id, 'approve')} disabled={false}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm"
                        variant="destructive"
                        onClick={() => handleAccessRequest(request.id, 'deny')} disabled={false}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Deny
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          {currentData.recentActivity.map(activity => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium">{activity.action}</h4>
                      <p className="text-sm text-gray-600">
                        User: {activity.user} | Target: {activity.target}
                      </p>
                      <p className="text-sm text-gray-700">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                    <Badge className={getRiskLevelColor(activity.riskLevel)}>
                      {activity.riskLevel} risk
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Access Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentData.analytics.accessPatterns.successfulLogins.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Successful Logins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {currentData.analytics.accessPatterns.failedLogins}
                </div>
                <div className="text-sm text-gray-600">Failed Logins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentData.analytics.accessPatterns.accessViolations}
                </div>
                <div className="text-sm text-gray-600">Access Violations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentData.analytics.accessPatterns.averageSessionDuration}
                </div>
                <div className="text-sm text-gray-600">Avg Session</div>
              </CardContent>
            </Card>
          </div>

          {/* Access Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Access Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Peak Access Hours</h4>
                  <p className="text-lg font-semibold text-blue-600">
                    {currentData.analytics.accessPatterns.peakHours}
                  </p>
                  <p className="text-sm text-gray-600">Highest user activity period</p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Most Accessed Features</h4>
                  <div className="space-y-2">
                    {currentData.analytics.accessPatterns.mostAccessedFeatures.map(
                      (feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Role Distribution Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.analytics.roleDistribution.map((role, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{role.role}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{role.count} users</span>
                        <span className="text-sm text-gray-600">({role.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${role.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
