import React, { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings,
  Database,
  Shield,
  Bell,
  Globe
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';

interface PlatformSettings {
  platform_info: {
    name: string;
    version: string;
    environment: string;
    total_users: number;
    active_users_today: number;
    total_digital_twins: number;
    api_requests_today: number;
  };
  intelligence_settings: {
    pattern_recognition_enabled: boolean;
    prediction_engine_enabled: boolean;
    confidence_threshold: number;
    max_prediction_horizon: number;
    auto_model_training: boolean;
  };
  api_settings: {
    rate_limit_enabled: boolean;
    max_requests_per_minute: number;
    authentication_required: boolean;
    cors_enabled: boolean;
  };
  data_settings: {
    data_retention_days: number;
    backup_enabled: boolean;
    encryption_enabled: boolean;
    anonymization_enabled: boolean;
  };
  notification_settings: {
    email_notifications: boolean;
    slack_integration: boolean;
    alert_thresholds: {
      high_error_rate: number;
      low_performance: number;
      high_usage: number;
    };
  };
}

const PlatformSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('intelligence');
  const { success, error, warning, info } = useToastHelpers();

  const tabs = [
    { id: 'intelligence', label: 'Intelligence', icon: <Settings className="w-4 h-4" /> },
    { id: 'api', label: 'API Settings', icon: <Globe className="w-4 h-4" /> },
    { id: 'data', label: 'Data Management', icon: <Database className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Try multiple possible token keys for better compatibility
      const token = sessionStorage.getItem('accessToken') ||
                   sessionStorage.getItem('token') ||
                   localStorage.getItem('accessToken') ||
                   localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8001/platform-owner/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        success('Platform settings loaded successfully');
      } else {
        throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch platform settings:', error);
      
      // Enhanced fallback data with realistic patterns
      const fallbackSettings: PlatformSettings = {
        platform_info: {
          name: "Digame Platform",
          version: "2.1.4",
          environment: "Production",
          total_users: 15847,
          active_users_today: 3421,
          total_digital_twins: 8932,
          api_requests_today: 127543
        },
        intelligence_settings: {
          pattern_recognition_enabled: true,
          prediction_engine_enabled: true,
          confidence_threshold: 0.8,
          max_prediction_horizon: 30,
          auto_model_training: false
        },
        api_settings: {
          rate_limit_enabled: true,
          max_requests_per_minute: 100,
          authentication_required: true,
          cors_enabled: true
        },
        data_settings: {
          data_retention_days: 365,
          backup_enabled: true,
          encryption_enabled: true,
          anonymization_enabled: true
        },
        notification_settings: {
          email_notifications: true,
          slack_integration: false,
          alert_thresholds: {
            high_error_rate: 5.0,
            low_performance: 2.0,
            high_usage: 85.0
          }
        }
      };
      
      setSettings(fallbackSettings);
      warning(`Using sample data: ${error.message}`);
      setMessage({ type: 'error', text: `Failed to load platform settings: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      
      // Try multiple possible token keys for better compatibility
      const token = sessionStorage.getItem('accessToken') ||
                   sessionStorage.getItem('token') ||
                   localStorage.getItem('accessToken') ||
                   localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8001/platform-owner/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const data = await response.json();
        success('Settings saved successfully');
        setMessage({ type: 'success', text: 'Settings saved successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(`Failed to save settings: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to save platform settings:', error);
      error(`Failed to save settings: ${error.message}`);
      setMessage({ type: 'error', text: `Failed to save settings: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path: string[], value: any) => {
    if (!settings) return;

    const newSettings = { ...settings };
    let current: any = newSettings;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Failed to load platform settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-gray-600">Configure platform-wide settings and preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchSettings}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* Platform Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Platform Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Name:</span>
              <span className="ml-2 text-blue-800">{settings.platform_info.name}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Version:</span>
              <span className="ml-2 text-blue-800">{settings.platform_info.version}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Environment:</span>
              <span className="ml-2 text-blue-800">{settings.platform_info.environment}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Total Users:</span>
              <span className="ml-2 text-blue-800">{settings.platform_info.total_users.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Intelligence Settings */}
        {activeTab === 'intelligence' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Intelligence & AI Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Pattern Recognition</label>
                  <p className="text-sm text-gray-500">Enable pattern recognition analysis</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.intelligence_settings.pattern_recognition_enabled}
                  onChange={(e) => updateSetting(['intelligence_settings', 'pattern_recognition_enabled'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Prediction Engine</label>
                  <p className="text-sm text-gray-500">Enable predictive analytics</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.intelligence_settings.prediction_engine_enabled}
                  onChange={(e) => updateSetting(['intelligence_settings', 'prediction_engine_enabled'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Threshold ({settings.intelligence_settings.confidence_threshold})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.intelligence_settings.confidence_threshold}
                  onChange={(e) => updateSetting(['intelligence_settings', 'confidence_threshold'], parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1 (Low)</span>
                  <span>1.0 (High)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Prediction Horizon (days)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={settings.intelligence_settings.max_prediction_horizon}
                  onChange={(e) => updateSetting(['intelligence_settings', 'max_prediction_horizon'], parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Model Training</label>
                  <p className="text-sm text-gray-500">Automatically retrain models with new data</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.intelligence_settings.auto_model_training}
                  onChange={(e) => updateSetting(['intelligence_settings', 'auto_model_training'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* API Settings */}
        {activeTab === 'api' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Rate Limiting</label>
                  <p className="text-sm text-gray-500">Enable API rate limiting</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.api_settings.rate_limit_enabled}
                  onChange={(e) => updateSetting(['api_settings', 'rate_limit_enabled'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Requests per Minute</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={settings.api_settings.max_requests_per_minute}
                  onChange={(e) => updateSetting(['api_settings', 'max_requests_per_minute'], parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Authentication Required</label>
                  <p className="text-sm text-gray-500">Require authentication for API access</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.api_settings.authentication_required}
                  onChange={(e) => updateSetting(['api_settings', 'authentication_required'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">CORS Enabled</label>
                  <p className="text-sm text-gray-500">Enable Cross-Origin Resource Sharing</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.api_settings.cors_enabled}
                  onChange={(e) => updateSetting(['api_settings', 'cors_enabled'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Data Settings */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
                <input
                  type="number"
                  min="30"
                  max="3650"
                  value={settings.data_settings.data_retention_days}
                  onChange={(e) => updateSetting(['data_settings', 'data_retention_days'], parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Backup Enabled</label>
                  <p className="text-sm text-gray-500">Enable automatic data backups</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.data_settings.backup_enabled}
                  onChange={(e) => updateSetting(['data_settings', 'backup_enabled'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Encryption Enabled</label>
                  <p className="text-sm text-gray-500">Enable data encryption at rest</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.data_settings.encryption_enabled}
                  onChange={(e) => updateSetting(['data_settings', 'encryption_enabled'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data Anonymization</label>
                  <p className="text-sm text-gray-500">Enable automatic data anonymization</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.data_settings.anonymization_enabled}
                  onChange={(e) => updateSetting(['data_settings', 'anonymization_enabled'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h3>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Security settings are managed through the dedicated Security module. 
                  Advanced security configurations will be available there.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Send email notifications for alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notification_settings.email_notifications}
                  onChange={(e) => updateSetting(['notification_settings', 'email_notifications'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Slack Integration</label>
                  <p className="text-sm text-gray-500">Send notifications to Slack</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notification_settings.slack_integration}
                  onChange={(e) => updateSetting(['notification_settings', 'slack_integration'], e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Alert Thresholds</h4>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">High Error Rate (%)</label>
                  <input
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={settings.notification_settings.alert_thresholds.high_error_rate}
                    onChange={(e) => updateSetting(['notification_settings', 'alert_thresholds', 'high_error_rate'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Low Performance (seconds)</label>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={settings.notification_settings.alert_thresholds.low_performance}
                    onChange={(e) => updateSetting(['notification_settings', 'alert_thresholds', 'low_performance'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">High Usage (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={settings.notification_settings.alert_thresholds.high_usage}
                    onChange={(e) => updateSetting(['notification_settings', 'alert_thresholds', 'high_usage'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformSettings;