import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Users as UserGroupIcon,
  Globe as GlobeAltIcon,
  ShieldCheck as ShieldCheckIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Plus as PlusIcon,
  Settings as Cog6ToothIcon,
  Eye as EyeIcon,
  Edit as PencilIcon,
  Trash2 as TrashIcon,
  RotateCcw as ArrowPathIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  Key as KeyIcon,
  Lock as LockClosedIcon
} from 'lucide-react';

export default function GuestAccess() {
  const router = useRouter();
  const [guestUsers, setGuestUsers] = useState([]);
  const [guestSettings, setGuestSettings] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchGuestData();
  }, []);

  const fetchGuestData = async () => {
    try {
      // Simulate API calls
      const [usersRes, settingsRes, statsRes] = await Promise.all([
        fetch('/api/integration/guest/users'),
        fetch('/api/integration/guest/settings'),
        fetch('/api/integration/guest/stats')
      ]);
      
      const usersData = await usersRes.json();
      const settingsData = await settingsRes.json();
      const statsData = await statsRes.json();
      
      setGuestUsers(usersData.data || []);
      setGuestSettings(settingsData.data || {});
      setStats(statsData.data || {});
    } catch (error) {
      console.error('Error fetching guest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'expired':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'suspended':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInviteGuest = async (guestData) => {
    try {
      const response = await fetch('/api/integration/guest/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData)
      });
      
      if (response.ok) {
        setShowInviteModal(false);
        fetchGuestData();
      }
    } catch (error) {
      console.error('Error inviting guest:', error);
    }
  };

  const handleRevokeAccess = async (userId) => {
    try {
      const response = await fetch(`/api/integration/guest/users/${userId}/revoke`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchGuestData();
      }
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const handleExtendAccess = async (userId, duration) => {
    try {
      const response = await fetch(`/api/integration/guest/users/${userId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration })
      });
      
      if (response.ok) {
        fetchGuestData();
      }
    } catch (error) {
      console.error('Error extending access:', error);
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
                <GlobeAltIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Guest Access Management</h1>
                  <p className="text-sm text-gray-600">Manage temporary access for external users</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Invite Guest
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center">
                  <Cog6ToothIcon className="h-4 w-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Guests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGuests || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeGuests || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.securityScore || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'users', name: 'Guest Users', icon: UserGroupIcon },
                { id: 'permissions', name: 'Permissions', icon: KeyIcon },
                { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
                { id: 'security', name: 'Security', icon: ShieldCheckIcon }
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
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Guest Users</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="expired">Expired</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search guests..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Guest User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Access Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {guestUsers.map((user) => (
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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.accessLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                              {user.expiresAt}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(user.status)}
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastActive}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleRevokeAccess(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Guest Permissions</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Default Access Levels</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Read Only', 'Limited Access', 'Contributor'].map((level) => (
                        <div key={level} className="bg-white rounded-lg p-4 border">
                          <h5 className="font-medium text-gray-900">{level}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {level === 'Read Only' && 'View-only access to shared resources'}
                            {level === 'Limited Access' && 'Basic interaction with specific features'}
                            {level === 'Contributor' && 'Can create and edit assigned content'}
                          </p>
                          <div className="mt-3">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Configure →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Resource Access</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Project Documents', access: 'read', icon: '📄' },
                        { name: 'Team Discussions', access: 'comment', icon: '💬' },
                        { name: 'File Uploads', access: 'none', icon: '📁' },
                        { name: 'Analytics Dashboard', access: 'read', icon: '📊' }
                      ].map((resource) => (
                        <div key={resource.name} className="flex items-center justify-between bg-white rounded-lg p-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{resource.icon}</span>
                            <span className="font-medium text-gray-900">{resource.name}</span>
                          </div>
                          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                            <option value="none">No Access</option>
                            <option value="read">Read Only</option>
                            <option value="comment">Comment</option>
                            <option value="edit">Edit</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Guest Access Settings</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Access Duration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Access Duration
                        </label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                          <option value="7">7 days</option>
                          <option value="14">14 days</option>
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Access Duration
                        </label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                          <option value="180">180 days</option>
                          <option value="365">1 year</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Security Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Require Email Verification</h5>
                          <p className="text-sm text-gray-600">Guests must verify their email before accessing</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Enable Session Timeout</h5>
                          <p className="text-sm text-gray-600">Automatically log out inactive guests</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">IP Restriction</h5>
                          <p className="text-sm text-gray-600">Limit access to specific IP addresses</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Security Monitoring</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      {[
                        { action: 'Guest login', user: 'john@external.com', time: '2 minutes ago', risk: 'low' },
                        { action: 'File download', user: 'sarah@partner.com', time: '15 minutes ago', risk: 'low' },
                        { action: 'Failed login attempt', user: 'unknown@suspicious.com', time: '1 hour ago', risk: 'high' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            activity.risk === 'high' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {activity.risk} risk
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Security Alerts</h4>
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium text-yellow-800">3 guests expiring soon</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">Review and extend access if needed</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <LockClosedIcon className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">Security scan completed</span>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">No vulnerabilities detected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Guest Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Invite Guest User</h3>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="guest@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="read">Read Only</option>
                    <option value="limited">Limited Access</option>
                    <option value="contributor">Contributor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Duration</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Welcome message for the guest user..."
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleInviteGuest({})}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}