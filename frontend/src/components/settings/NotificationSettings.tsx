/**
 * Notification Settings Component
 * 
 * User notification preferences management
 */

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Monitor, Save } from 'lucide-react';

interface NotificationSettingsProps {
  onMessage: (message: { type: 'success' | 'error' | 'info'; text: string }) => void;
  onLoading: (loading: boolean) => void;
}

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  desktop_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    system_updates: boolean;
    security_alerts: boolean;
    feature_updates: boolean;
    marketing: boolean;
    workflow_updates: boolean;
    ai_insights: boolean;
    team_activities: boolean;
    reports_ready: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
  };
  frequency: {
    instant: boolean;
    daily_digest: boolean;
    weekly_summary: boolean;
  };
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onMessage, onLoading }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    desktop_notifications: false,
    sms_notifications: false,
    notification_types: {
      system_updates: true,
      security_alerts: true,
      feature_updates: true,
      marketing: false,
      workflow_updates: true,
      ai_insights: true,
      team_activities: true,
      reports_ready: true,
    },
    quiet_hours: {
      enabled: false,
      start_time: '22:00',
      end_time: '08:00',
      timezone: 'America/New_York',
    },
    frequency: {
      instant: true,
      daily_digest: false,
      weekly_summary: true,
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      onLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/notification-preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to load notification preferences' });
    } finally {
      onLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        onMessage({ type: 'success', text: 'Notification preferences saved successfully' });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to save notification preferences' });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (path: string[], value: any) => {
    setPreferences(prev => {
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
          <p className="text-sm text-gray-600">Configure how and when you receive notifications</p>
        </div>
        <button
          onClick={savePreferences}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Delivery Methods */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Delivery Methods</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => updatePreference(['email_notifications'], e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500">Receive push notifications on mobile devices</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.push_notifications}
                onChange={(e) => updatePreference(['push_notifications'], e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Desktop Notifications</p>
                <p className="text-xs text-gray-500">Show browser notifications on desktop</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.desktop_notifications}
                onChange={(e) => updatePreference(['desktop_notifications'], e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Notification Types</h4>
        <div className="space-y-4">
          {Object.entries(preferences.notification_types).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-500">
                  {getNotificationDescription(key)}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updatePreference(['notification_types', key], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Quiet Hours</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Enable Quiet Hours</p>
              <p className="text-xs text-gray-500">Pause non-urgent notifications during specified hours</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.quiet_hours.enabled}
                onChange={(e) => updatePreference(['quiet_hours', 'enabled'], e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {preferences.quiet_hours.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours.start_time}
                  onChange={(e) => updatePreference(['quiet_hours', 'start_time'], e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours.end_time}
                  onChange={(e) => updatePreference(['quiet_hours', 'end_time'], e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Frequency */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Notification Frequency</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Instant Notifications</p>
              <p className="text-xs text-gray-500">Receive notifications immediately when events occur</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.frequency.instant}
                onChange={(e) => updatePreference(['frequency', 'instant'], e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Daily Digest</p>
              <p className="text-xs text-gray-500">Receive a summary of daily activities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.frequency.daily_digest}
                onChange={(e) => updatePreference(['frequency', 'daily_digest'], e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Weekly Summary</p>
              <p className="text-xs text-gray-500">Receive a weekly summary report</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.frequency.weekly_summary}
                onChange={(e) => updatePreference(['frequency', 'weekly_summary'], e.target.checked)}
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

const getNotificationDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    system_updates: 'Important system maintenance and updates',
    security_alerts: 'Security-related notifications and alerts',
    feature_updates: 'New features and product announcements',
    marketing: 'Marketing communications and promotions',
    workflow_updates: 'Workflow completion and status updates',
    ai_insights: 'AI-generated insights and recommendations',
    team_activities: 'Team collaboration and activity updates',
    reports_ready: 'Report generation and availability notifications',
  };
  return descriptions[key] || 'Notification type description';
};

export default NotificationSettings;