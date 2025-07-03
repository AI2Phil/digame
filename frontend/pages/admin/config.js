import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Cog6ToothIcon, 
  ServerIcon, 
  DatabaseIcon, 
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  KeyIcon,
  CloudIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

export default function AdminConfig() {
  const router = useRouter();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('system');
  const [saveStatus, setSaveStatus] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const response = await fetch('/api/admin/config');
      const data = await response.json();
      setConfig(data.data || {});
    } catch (error) {
      console.error('Error fetching configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (section, data) => {
    try {
      setSaveStatus('saving');
      const response = await fetch(`/api/admin/config/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
        fetchConfiguration();
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('error');
    }
  };

  const handleResetConfig = async (section) => {
    if (confirm(`Are you sure you want to reset ${section} configuration to defaults?`)) {
      try {
        const response = await fetch(`/api/admin/config/${section}/reset`, {
          method: 'POST'
        });
        
        if (response.ok) {
          fetchConfiguration();
        }
      } catch (error) {
        console.error('Error resetting configuration:', error);
      }
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
                <Cog6ToothIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
                  <p className="text-sm text-gray-600">Manage system-wide configuration settings</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {saveStatus && (
                  <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    saveStatus === 'success' ? 'bg-green-100 text-green-800' :
                    saveStatus === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {saveStatus === 'success' ? 'Configuration saved' :
                     saveStatus === 'error' ? 'Save failed' :
                     'Saving...'}
                  </div>
                )}
                <button 
                  onClick={fetchConfiguration}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'system', name: 'System', icon: ServerIcon },
                { id: 'database', name: 'Database', icon: DatabaseIcon },
                { id: 'security', name: 'Security', icon: ShieldCheckIcon },
                { id: 'notifications', name: 'Notifications', icon: BellIcon },
                { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
                { id: 'storage', name: 'Storage', icon: CloudIcon }
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
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Application Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue={config.appName || "Digame Platform"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="production">Production</option>
                            <option value="staging">Staging</option>
                            <option value="development">Development</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Debug Mode</label>
                          <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-700">Enable debug logging</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Performance Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Request Size (MB)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Request Timeout (seconds)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Worker Processes</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {showAdvanced && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="text-md font-medium text-yellow-900 mb-4">Advanced System Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-yellow-800 mb-2">Memory Limit (MB)</label>
                        <input
                          type="number"
                          className="w-full border border-yellow-300 rounded-md px-3 py-2"
                          defaultValue="512"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-yellow-800 mb-2">CPU Limit (%)</label>
                        <input
                          type="number"
                          className="w-full border border-yellow-300 rounded-md px-3 py-2"
                          defaultValue="80"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Database Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Connection Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Database Host</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="localhost"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Database Port</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="5432"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Database Name</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="digame_prod"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Pool Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Connections</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Min Connections</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Connection Timeout (ms)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="5000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Backup Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        defaultValue="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Location</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="local">Local Storage</option>
                        <option value="s3">Amazon S3</option>
                        <option value="gcs">Google Cloud Storage</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Authentication</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Session Duration (hours)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="8"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="5"
                          />
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
                      <h4 className="text-md font-medium text-gray-900 mb-4">Password Policy</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="8"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" defaultChecked />
                            <span className="text-sm text-gray-700">Require uppercase letters</span>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" defaultChecked />
                            <span className="text-sm text-gray-700">Require lowercase letters</span>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" defaultChecked />
                            <span className="text-sm text-gray-700">Require numbers</span>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-700">Require special characters</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Encryption Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Algorithm</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="aes-256">AES-256</option>
                        <option value="aes-128">AES-128</option>
                        <option value="chacha20">ChaCha20</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Key Rotation (days)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        defaultValue="90"
                      />
                    </div>
                    <div className="flex items-center justify-center">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <KeyIcon className="h-4 w-4 mr-2" />
                        Rotate Keys
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Email Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="smtp.example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="587"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                          <input
                            type="email"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="noreply@example.com"
                          />
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" defaultChecked />
                          <span className="text-sm text-gray-700">Use TLS encryption</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Push Notifications</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Service Provider</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="firebase">Firebase Cloud Messaging</option>
                            <option value="apns">Apple Push Notification Service</option>
                            <option value="custom">Custom Provider</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                          <input
                            type="password"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Enter API key"
                          />
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" defaultChecked />
                          <span className="text-sm text-gray-700">Enable push notifications</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Notification Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'System Alerts', description: 'Critical system notifications', enabled: true },
                      { name: 'Security Events', description: 'Security-related notifications', enabled: true },
                      { name: 'User Activities', description: 'User action notifications', enabled: false },
                      { name: 'Performance Alerts', description: 'Performance issue notifications', enabled: true },
                      { name: 'Backup Status', description: 'Backup completion notifications', enabled: false },
                      { name: 'Maintenance Windows', description: 'Scheduled maintenance notifications', enabled: true }
                    ].map((notification, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{notification.name}</h5>
                          <p className="text-sm text-gray-600">{notification.description}</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-blue-600" 
                          defaultChecked={notification.enabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">API Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">API Version</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="v1">Version 1.0</option>
                            <option value="v2">Version 2.0</option>
                            <option value="v3">Version 3.0 (Beta)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/hour)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="10000"
                          />
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" defaultChecked />
                          <span className="text-sm text-gray-700">Enable API documentation</span>
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
                        <div className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" defaultChecked />
                          <span className="text-sm text-gray-700">Require HTTPS for webhooks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">File Storage</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Storage Provider</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="local">Local Storage</option>
                            <option value="s3">Amazon S3</option>
                            <option value="gcs">Google Cloud Storage</option>
                            <option value="azure">Azure Blob Storage</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="jpg,png,pdf,doc,docx"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Cache Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cache Provider</label>
                          <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                            <option value="redis">Redis</option>
                            <option value="memcached">Memcached</option>
                            <option value="memory">In-Memory</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cache TTL (seconds)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="3600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Cache Size (MB)</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            defaultValue="512"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Cleanup Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Temp File Cleanup (hours)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        defaultValue="24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Log Retention (days)</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        defaultValue="90"
                      />
                    </div>
                    <div className="flex items-center justify-center">
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                        Run Cleanup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => handleResetConfig(activeTab)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset to Defaults
            </button>
            <button
              onClick={() => handleSaveConfig(activeTab, {})}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}