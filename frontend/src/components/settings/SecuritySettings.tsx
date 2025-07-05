/**
 * Security Settings Component
 * 
 * User security and privacy settings management
 */

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, Eye, EyeOff, Save, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

interface SecuritySettingsProps {
  onMessage: (message: { type: 'success' | 'error' | 'info'; text: string }) => void;
  onLoading: (loading: boolean) => void;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout: number;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  data_export_notifications: boolean;
  password_requirements: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
  };
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'team_only';
    activity_tracking: boolean;
    analytics_participation: boolean;
    marketing_communications: boolean;
  };
  active_sessions: Array<{
    id: string;
    device: string;
    location: string;
    last_active: string;
    current: boolean;
  }>;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onMessage, onLoading }) => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      onLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/security-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error('Failed to load security settings');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to load security settings' });
    } finally {
      onLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/security-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        onMessage({ type: 'success', text: 'Security settings updated successfully' });
      } else {
        throw new Error('Failed to save security settings');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to save security settings' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      onMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        })
      });

      if (response.ok) {
        onMessage({ type: 'success', text: 'Password changed successfully' });
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        setShowPasswordForm(false);
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to change password');
      }
    } catch (error) {
      onMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change password' });
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onMessage({ type: 'success', text: 'Session terminated successfully' });
        loadSecuritySettings(); // Reload to update session list
      } else {
        throw new Error('Failed to terminate session');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to terminate session' });
    }
  };

  const enable2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/enable-2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        onMessage({ type: 'info', text: 'Please scan the QR code with your authenticator app' });
        // Handle 2FA setup flow
      } else {
        throw new Error('Failed to enable 2FA');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to enable two-factor authentication' });
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading security settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Security & Privacy</h3>
          <p className="text-sm text-gray-600">Manage your account security and privacy preferences</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <div>
              <h4 className="text-md font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {settings.two_factor_enabled ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
            <span className={`text-sm font-medium ${settings.two_factor_enabled ? 'text-green-700' : 'text-yellow-700'}`}>
              {settings.two_factor_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        {!settings.two_factor_enabled && (
          <button
            onClick={enable2FA}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Enable 2FA
          </button>
        )}
      </div>

      {/* Password Management */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <div>
              <h4 className="text-md font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-600">Change your account password</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Key className="w-4 h-4 mr-2" />
            Change Password
          </button>
        </div>

        {showPasswordForm && (
          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={changePassword}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Update Password
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Alerts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Security Alerts</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Login Notifications</p>
              <p className="text-xs text-gray-500">Get notified when someone logs into your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.login_notifications}
                onChange={(e) => setSettings({ ...settings, login_notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Suspicious Activity Alerts</p>
              <p className="text-xs text-gray-500">Get alerted about unusual account activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.suspicious_activity_alerts}
                onChange={(e) => setSettings({ ...settings, suspicious_activity_alerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Active Sessions</h4>
        <div className="space-y-3">
          {settings.active_sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {session.device} {session.current && <span className="text-green-600">(Current)</span>}
                </p>
                <p className="text-xs text-gray-500">{session.location}</p>
                <p className="text-xs text-gray-500">Last active: {new Date(session.last_active).toLocaleString()}</p>
              </div>
              {!session.current && (
                <button
                  onClick={() => terminateSession(session.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Terminate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Privacy Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
            <select
              value={settings.privacy_settings.profile_visibility}
              onChange={(e) => setSettings({
                ...settings,
                privacy_settings: {
                  ...settings.privacy_settings,
                  profile_visibility: e.target.value as 'public' | 'private' | 'team_only'
                }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="public">Public</option>
              <option value="team_only">Team Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Activity Tracking</p>
              <p className="text-xs text-gray-500">Allow tracking of your activity for analytics</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy_settings.activity_tracking}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy_settings: { ...settings.privacy_settings, activity_tracking: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;