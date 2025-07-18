import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Key,
  ShieldCheck,
  Globe,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  FileText,
  BarChart3,
  Link,
  Lock,
  CreditCard
} from 'lucide-react';

export default function SSOIntegration() {
  const router = useRouter();
  const [ssoProviders, setSsoProviders] = useState([]);
  const [ssoSettings, setSsoSettings] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('providers');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    fetchSSOData();
  }, []);

  const fetchSSOData = async () => {
    try {
      // Simulate API calls
      const [providersRes, settingsRes, statsRes] = await Promise.all([
        fetch('/api/integration/sso/providers'),
        fetch('/api/integration/sso/settings'),
        fetch('/api/integration/sso/stats')
      ]);
      
      const providersData = await providersRes.json();
      const settingsData = await settingsRes.json();
      const statsData = await statsRes.json();
      
      setSsoProviders(providersData.data || []);
      setSsoSettings(settingsData.data || {});
      setStats(statsData.data || {});
    } catch (error) {
      console.error('Error fetching SSO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'disabled':
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disabled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderIcon = (type) => {
    const iconClass = "h-8 w-8";
    switch (type) {
      case 'saml':
        return <ShieldCheck className={`${iconClass} text-blue-600`} />;
      case 'oauth':
        return <Key className={`${iconClass} text-green-600`} />;
      case 'oidc':
        return <CreditCard className={`${iconClass} text-purple-600`} />;
      case 'ldap':
        return <Users className={`${iconClass} text-orange-600`} />;
      default:
        return <Globe className={`${iconClass} text-gray-600`} />;
    }
  };

  const handleTestConnection = async (providerId) => {
    try {
      const response = await fetch(`/api/integration/sso/providers/${providerId}/test`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Handle success
        fetchSSOData();
      }
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  };

  const handleToggleProvider = async (providerId, enabled) => {
    try {
      const response = await fetch(`/api/integration/sso/providers/${providerId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      if (response.ok) {
        fetchSSOData();
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
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
                <Key className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Single Sign-On (SSO)</h1>
                  <p className="text-sm text-gray-600">Configure and manage SSO authentication providers</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowProviderModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
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
                <Key className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SSO Providers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProviders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProviders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SSO Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ssoUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'providers', name: 'Providers', icon: Key },
                { id: 'configuration', name: 'Configuration', icon: Settings },
                { id: 'users', name: 'Users', icon: Users },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
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
            {activeTab === 'providers' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">SSO Providers</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Types</option>
                      <option value="saml">SAML</option>
                      <option value="oauth">OAuth</option>
                      <option value="oidc">OpenID Connect</option>
                      <option value="ldap">LDAP</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search providers..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ssoProviders.map((provider) => (
                    <div key={provider.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {getProviderIcon(provider.type)}
                          <div className="ml-3">
                            <h4 className="text-lg font-medium text-gray-900">{provider.name}</h4>
                            <p className="text-sm text-gray-600">{provider.type.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(provider.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(provider.status)}`}>
                            {provider.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Users:</span>
                          <span className="font-medium">{provider.userCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Sync:</span>
                          <span className="font-medium">{provider.lastSync}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="font-medium">{provider.successRate}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleTestConnection(provider.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Test
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                            Configure
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {ssoProviders.length === 0 && (
                  <div className="text-center py-12">
                    <Key className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No SSO providers configured</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first SSO provider.</p>
                    <div className="mt-6">
                      <button 
                        onClick={() => setShowProviderModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Provider
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'configuration' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">SSO Configuration</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Global Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Provider
                        </label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                          <option value="">Select default provider</option>
                          <option value="azure">Azure AD</option>
                          <option value="google">Google Workspace</option>
                          <option value="okta">Okta</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          defaultValue="480"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Security Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Force SSO for all users</h5>
                          <p className="text-sm text-gray-600">Require all users to authenticate via SSO</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Allow local fallback</h5>
                          <p className="text-sm text-gray-600">Enable local authentication if SSO fails</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Auto-provision users</h5>
                          <p className="text-sm text-gray-600">Automatically create accounts for new SSO users</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Attribute Mapping</h4>
                    <div className="space-y-3">
                      {[
                        { platform: 'Email', sso: 'email', required: true },
                        { platform: 'First Name', sso: 'given_name', required: true },
                        { platform: 'Last Name', sso: 'family_name', required: true },
                        { platform: 'Department', sso: 'department', required: false },
                        { platform: 'Role', sso: 'role', required: false }
                      ].map((mapping, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 w-24">{mapping.platform}</span>
                            <RotateCcw className="h-4 w-4 text-gray-400 mx-3" />
                            <input
                              type="text"
                              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                              defaultValue={mapping.sso}
                            />
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            mapping.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {mapping.required ? 'Required' : 'Optional'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">SSO Users</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Providers</option>
                      <option value="azure">Azure AD</option>
                      <option value="google">Google</option>
                      <option value="okta">Okta</option>
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
                          Provider
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
                      {[
                        {
                          id: 1,
                          name: 'John Doe',
                          email: 'john.doe@company.com',
                          provider: 'Azure AD',
                          lastLogin: '2 hours ago',
                          status: 'active'
                        },
                        {
                          id: 2,
                          name: 'Jane Smith',
                          email: 'jane.smith@company.com',
                          provider: 'Google',
                          lastLogin: '1 day ago',
                          status: 'active'
                        }
                      ].map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
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
                              {user.provider}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Edit className="h-4 w-4" />
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

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">SSO Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Authentication Success Rate</h4>
                    <div className="space-y-3">
                      {[
                        { provider: 'Azure AD', rate: 98.5, color: 'bg-green-500' },
                        { provider: 'Google', rate: 97.2, color: 'bg-blue-500' },
                        { provider: 'Okta', rate: 96.8, color: 'bg-purple-500' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{item.provider}</span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className={`h-2 rounded-full ${item.color}`}
                                style={{ width: `${item.rate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.rate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      {[
                        { action: 'Successful login', user: 'john.doe@company.com', time: '2 minutes ago' },
                        { action: 'Failed authentication', user: 'jane.smith@company.com', time: '15 minutes ago' },
                        { action: 'User provisioned', user: 'new.user@company.com', time: '1 hour ago' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-600">{activity.user}</p>
                          </div>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Provider Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add SSO Provider</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Type</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select provider type</option>
                    <option value="saml">SAML 2.0</option>
                    <option value="oauth">OAuth 2.0</option>
                    <option value="oidc">OpenID Connect</option>
                    <option value="ldap">LDAP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Azure AD, Google Workspace"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Brief description of this SSO provider..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowProviderModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowProviderModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}