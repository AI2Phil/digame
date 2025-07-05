import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Settings as CogIcon,
  Server as ServerIcon,
  ShieldCheck as ShieldCheckIcon,
  Database as DatabaseIcon,
  Bell as BellIcon,
  Globe as GlobeAltIcon,
  Key as KeyIcon,
  Users as UserGroupIcon,
  BarChart3 as ChartBarIcon,
  AlertTriangle as ExclamationTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  Plus as PlusIcon,
  Edit as PencilIcon,
  Trash2 as TrashIcon,
  RotateCcw as ArrowPathIcon,
  FileText as DocumentTextIcon,
  Cloud as CloudIcon,
  Lock as LockClosedIcon
} from 'lucide-react';

export default function PlatformOwnerSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    fetchPlatformSettings();
  }, []);

  const fetchPlatformSettings = async () => {
    try {
      // Simulate API calls
      const [settingsRes, healthRes] = await Promise.all([
        fetch('/api/platform-owner/settings'),
        fetch('/api/platform-owner/system-health')
      ]);
      
      const settingsData = await settingsRes.json();
      const healthData = await healthRes.json();
      
      setSettings(settingsData.data || {});
      setSystemHealth(healthData.data || {});
    } catch (error) {
      console.error('Error fetching platform settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (section, data) => {
    try {
      setSaveStatus('saving');
      const response = await fetch(`/api/platform-owner/settings/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
        fetchPlatformSettings();
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                  <p className="text-sm text-gray-600">Configure global platform settings and system preferences</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {saveStatus && (
                  <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    saveStatus === 'success' ? 'bg-green-100 text-green-800' :
                    saveStatus === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {saveStatus === 'success' ? 'Settings saved' :
                     saveStatus === 'error' ? 'Save failed' :
                     'Saving...'}
                  </div>
                )}
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ServerIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <div className="flex items-center mt-1">
                  {getHealthIcon(systemHealth.overall)}
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getHealthColor(systemHealth.overall)}`}>
                    {systemHealth.overall || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DatabaseIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Database</p>
                <div className="flex items-center mt-1">
                  {getHealthIcon(systemHealth.database)}
                  <span className="text-sm font-medium text-gray-900">{systemHealth.dbConnections || 0} connections</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CloudIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Storage</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.storageUsed || '0 GB'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.activeUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'general', name: 'General', icon: CogIcon },
                { id: 'security', name: 'Security', icon: ShieldCheckIcon },
                { id: 'notifications', name: 'Notifications', icon: BellIcon },
                { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
                { id: 'advanced', name: 'Advanced', icon: ServerIcon }
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
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Platform Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue={settings.platformName || "Digame Platform"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Platform Description</label>
                          <textarea
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            rows="3"
                            defaultValue={settings.platformDescription || "Comprehensive business management platform"}
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                          <input
                            type="email"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue={settings.supportEmail || "support@digame.com"}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Regional Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Default Timezone</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Feature Toggles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'User Registration', description: 'Allow new users to register', enabled: true },
                      { name: 'Guest Access', description: 'Enable guest user functionality', enabled: true },
                      { name: 'API Access', description: 'Enable API endpoints', enabled: true },
                      { name: 'Webhooks', description: 'Enable webhook functionality', enabled: false },
                      { name: 'Analytics', description: 'Enable analytics tracking', enabled: true },
                      { name: 'Maintenance Mode', description: 'Put platform in maintenance mode', enabled: false }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4">
                        <div>
                          <h5 className="font-medium text-gray-900">{feature.name}</h5>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-blue-600" 
                          defaultChecked={feature.enabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Authentication</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="480"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="basic">Basic (8+ characters)</option>
                            <option value="standard">Standard (8+ chars, mixed case)</option>
                            <option value="strong">Strong (12+ chars, symbols)</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">Require MFA</h5>
                            <p className="text-sm text-gray-600">Force multi-factor authentication</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Access Control</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Default User Role</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="user">User</option>
                            <option value="contributor">Contributor</option>
                            <option value="manager">Manager</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">IP Allowlist</label>
                          <textarea
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            rows="3"
                            placeholder="Enter IP addresses or ranges, one per line"
                          ></textarea>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">Audit Logging</h5>
                            <p className="text-sm text-gray-600">Log all user actions</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Data Protection</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Encryption</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Data at Rest</span>
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Data in Transit</span>
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Backup</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Daily Backups</span>
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Retention: 30 days</span>
                          <span className="text-xs text-gray-500">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Compliance</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">GDPR</span>
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">SOC 2</span>
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="smtp.example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                          <input
                            type="email"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="noreply@digame.com"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">Enable Email Notifications</h5>
                            <p className="text-sm text-gray-600">Send system notifications via email</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">System Alerts</h4>
                      <div className="space-y-4">
                        {[
                          { name: 'System Errors', description: 'Critical system errors and failures', enabled: true },
                          { name: 'Security Events', description: 'Security-related events and breaches', enabled: true },
                          { name: 'Performance Issues', description: 'Performance degradation alerts', enabled: false },
                          { name: 'User Activities', description: 'Important user activity notifications', enabled: false }
                        ].map((alert, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                            <div>
                              <h5 className="font-medium text-gray-900">{alert.name}</h5>
                              <p className="text-sm text-gray-600">{alert.description}</p>
                            </div>
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 text-blue-600" 
                              defaultChecked={alert.enabled}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">API Configuration</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
                          <input
                            type="url"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="https://api.digame.com/v1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/hour)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="10000"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">API Documentation</h5>
                            <p className="text-sm text-gray-600">Enable public API documentation</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Webhook Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Default Timeout (seconds)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Retries</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="3"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">Require HTTPS</h5>
                            <p className="text-sm text-gray-600">Only allow HTTPS webhook URLs</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Performance</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cache TTL (seconds)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="3600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Users</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="10000"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">Enable Caching</h5>
                            <p className="text-sm text-gray-600">Enable application-level caching</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Logging</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="error">Error</option>
                            <option value="warn">Warning</option>
                            <option value="info">Info</option>
                            <option value="debug">Debug</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Log Retention (days)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="90"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">Structured Logging</h5>
                            <p className="text-sm text-gray-600">Enable JSON structured logging</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-red-900 mb-4">Danger Zone</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-red-900">Reset Platform Settings</h5>
                        <p className="text-sm text-red-700">Reset all settings to default values</p>
                      </div>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                        Reset Settings
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-red-900">Clear All Data</h5>
                        <p className="text-sm text-red-700">Permanently delete all platform data</p>
                      </div>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                        Clear Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => handleSaveSettings(activeTab, {})}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}