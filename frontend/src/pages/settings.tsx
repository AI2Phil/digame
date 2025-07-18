/**
 * User Settings Page
 * Route: /settings
 *
 * Comprehensive user settings management including API keys, preferences, and account settings
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Settings as SettingsIcon,
  Key,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

// Import components
import APIKeySettings from '../components/settings/APIKeySettings';
import UserProfileSettings from '../components/settings/UserProfileSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';

// Types
interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<{
    onMessage: (message: { type: 'success' | 'error' | 'info'; text: string }) => void;
    onLoading: (loading: boolean) => void;
  }>;
  description: string;
}

interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('api-keys');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Settings tabs configuration
  const settingsTabs: SettingsTab[] = [
    {
      id: 'api-keys',
      label: 'API Keys',
      icon: <Key className="w-5 h-5" />,
      component: APIKeySettings,
      description: 'Manage your AI service API keys',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      component: UserProfileSettings,
      description: 'Update your profile information',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      component: NotificationSettings,
      description: 'Configure notification preferences',
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
      component: SecuritySettings,
      description: 'Security and privacy settings',
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette className="w-5 h-5" />,
      component: AppearanceSettings,
      description: 'Customize your interface',
    },
  ];

  // Get active tab from URL or default to api-keys
  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === 'string' && settingsTabs.find(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [router.query]);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/settings?tab=${tabId}`, undefined, { shallow: true });
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const activeTabConfig = settingsTabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component || APIKeySettings;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`border-l-4 p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-400'
              : message.type === 'error'
                ? 'bg-red-50 border-red-400'
                : 'bg-blue-50 border-blue-400'
          }`}
        >
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            ) : message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-400 mr-2" />
            )}
            <p
              className={`text-sm ${
                message.type === 'success'
                  ? 'text-green-700'
                  : message.type === 'error'
                    ? 'text-red-700'
                    : 'text-blue-700'
              }`}
            >
              {message.text}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border">
              <div className="p-4">
                <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Settings
                </h2>
              </div>
              <div className="space-y-1">
                {settingsTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-none border-r-2 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    <div>
                      <div>{tab.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </nav>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  Test API Connections
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  Export Settings
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1">
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tab Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3">
                  {activeTabConfig?.icon}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{activeTabConfig?.label}</h2>
                    <p className="text-sm text-gray-600">{activeTabConfig?.description}</p>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                ) : (
                  <ActiveComponent onMessage={setMessage} onLoading={setLoading} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
