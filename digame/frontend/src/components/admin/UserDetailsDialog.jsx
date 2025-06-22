import React, { useState } from 'react';
import { 
  User, Mail, Calendar, Shield, Activity, 
  Key, Settings, Edit, Save, X
} from 'lucide-react';
import { Button } from '../../ui/Button'; // Path corrected
import { Input } from '../../ui/Input';   // Path corrected
import { Badge } from '../../ui/Badge';   // Path corrected
import { Avatar } from '../../ui/Avatar'; // Path corrected
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs'; // Path corrected
import { Toast } from '../../ui/Toast';   // Path corrected
import { Select } from '../../ui/Select';
import { Label } from '../../ui/Label';
import { Checkbox } from '../../ui/Checkbox';

const UserDetailsDialog = ({ user, onAction, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user.username || '',
    email: user.email || '',
    role: user.role || 'user',
    is_active: user.is_active || false
  });

  const handleSave = async () => {
    try {
      await onAction(user.id, 'update', editData);
      setIsEditing(false);
      Toast.success('User updated successfully');
    } catch (error) {
      Toast.error('Failed to update user');
    }
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

  const getStatusBadge = (isActive) => {
    return isActive 
      ? <Badge variant="success">Active</Badge>
      : <Badge variant="destructive">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <Avatar
          src={user.avatar}
          alt={user.username}
          fallback={user.username?.charAt(0).toUpperCase()}
          size="lg"
        />
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editData.username}
                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Username"
              />
              <Input
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                type="email"
              />
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold">{user.username}</h3>
              <p className="text-gray-600">{user.email}</p>
            </>
          )}
          <div className="flex items-center gap-2 mt-2">
            {isEditing ? (
              <Select
                value={editData.role}
                onChange={(value) => setEditData(prev => ({ ...prev, role: value }))}
                options={[
                  { value: 'viewer', label: 'Viewer' },
                  { value: 'user', label: 'User' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'admin', label: 'Admin' },
                ]}
                placeholder="Select role..."
                className="w-full text-sm" // Added w-full for better layout in edit mode, kept text-sm
              />
            ) : (
              getRoleBadge(user.role)
            )}
            {isEditing && ( // Also allow editing status
              <div className="flex items-center space-x-2 ml-2">
                <Checkbox
                  id="is_active_edit"
                  checked={editData.is_active}
                  onCheckedChange={(checked) => setEditData(prev => ({...prev, is_active: checked}))}
                />
                <Label htmlFor="is_active_edit" className="text-sm">Active</Label>
              </div>
            )}
            {!isEditing && getStatusBadge(user.is_active)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* User Details Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">User ID</Label>
              <p className="text-sm text-gray-900">{user.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Created</Label>
              <p className="text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Last Login</Label>
              <p className="text-sm text-gray-900">
                {user.last_login 
                  ? new Date(user.last_login).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Login Count</Label>
              <p className="text-sm text-gray-900">{user.login_count || 0}</p>
            </div>
          </div>

          {/* Onboarding Status */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Onboarding Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Completed</span>
                <Badge variant={user.onboarding_completed ? 'success' : 'secondary'}>
                  {user.onboarding_completed ? 'Yes' : 'No'}
                </Badge>
              </div>
              {user.onboarding_completed && (
                <div className="flex justify-between">
                  <span className="text-sm">Completed At</span>
                  <span className="text-sm text-gray-600">
                    {new Date(user.onboarding_completed_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Recent Activity</h4>
            {[
              { action: 'Logged in', timestamp: '2025-05-23 19:15:32' },
              { action: 'Updated profile', timestamp: '2025-05-23 18:45:12' },
              { action: 'Created API key', timestamp: '2025-05-23 16:30:45' },
              { action: 'Completed onboarding', timestamp: '2025-05-22 14:20:18' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{activity.action}</span>
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Role Permissions</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                'read:dashboard',
                'write:profile',
                'read:analytics',
                'write:settings',
                'read:api_keys',
                'write:api_keys'
              ].map((permission, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Checkbox
                    checked={true}
                    disabled={true} // Using disabled for read-only behavior
                    aria-readonly="true"
                  />
                  <span className="text-sm font-mono">{permission}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">User API Keys</h4>
              <Button size="sm" variant="outline">
                <Key className="w-4 h-4 mr-1" />
                Create Key
              </Button>
            </div>
            <div className="space-y-2">
              {(user.api_keys || []).map((key, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{key.name}</p>
                    <p className="text-xs text-gray-500">
                      Created {new Date(key.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={key.is_active ? 'success' : 'secondary'}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              {(!user.api_keys || user.api_keys.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No API keys found
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={user.is_active ? "destructive" : "default"}
            onClick={() => onAction(user.id, user.is_active ? 'deactivate' : 'activate')}
          >
            {user.is_active ? 'Deactivate' : 'Activate'} User
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction(user.id, 'reset_password')}
          >
            Reset Password
          </Button>
        </div>
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default UserDetailsDialog;