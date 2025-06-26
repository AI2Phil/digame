import React, { useState, useEffect } from 'react';
import {
  Settings, Key, Bell, Shield, Palette,
  Globe, Eye, EyeOff, Copy, Plus, Trash2,
  Lock, Unlock, Smartphone, Mail, Monitor,
  User, Database, Zap, Moon, Sun, Laptop,
  Download, Upload, RefreshCw, AlertCircle,
  CheckCircle, Clock, Activity, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Progress } from '../ui/Progress';
import { useToast } from '../ui/Toast';
import apiService from '../../services/apiService';

const SettingsManagementSection = ({ apiKeys, setApiKeys }) => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('api-keys');
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      desktop: false,
      goalReminders: true,
      achievementAlerts: true,
      weeklyReports: true,
      socialNotifications: true,
      marketingEmails: false,
      securityAlerts: true,
      frequency: 'immediate'
    },
    privacy: {
      profileVisibility: 'public',
      showAchievements: true,
      showGoals: false,
      allowMessages: true,
      showActivity: true,
      dataSharing: false,
      analyticsOptOut: false,
      searchable: true,
      showOnlineStatus: true
    },
    appearance: {
      theme: 'auto',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      compactMode: false,
      animations: true,
      fontSize: 'medium'
    },
    account: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginNotifications: true,
      dataRetention: 365,
      autoBackup: true
    }
  });

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Apply theme changes immediately
  useEffect(() => {
    if (preferences.appearance.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.appearance.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto mode - follow system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [preferences.appearance.theme]);

  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const handleCreateApiKey = async () => {
    try {
      const newKey = await apiService.createApiKey(newKeyData);
      setApiKeys([...apiKeys, newKey]);
      setNewKeyData({ name: '', description: '', permissions: [] });
      setShowCreateKeyDialog(false);
      toast.success('API key created successfully');
    } catch (error) {
      toast.error('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (keyName) => {
    try {
      await apiService.deleteApiKey(keyName);
      setApiKeys(apiKeys.filter(key => key.name !== keyName));
      toast.success('API key deleted successfully');
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const handleCopyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success('API key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const handlePreferenceUpdate = async (category, key, value) => {
    const updatedPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [key]: value
      }
    };
    setPreferences(updatedPreferences);
    
    try {
      await apiService.updateUserPreferences(updatedPreferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const maskApiKey = (key) => {
    if (!key) return '';
    return `${key.substring(0, 8)}${'*'.repeat(24)}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Settings & Preferences
          </CardTitle>
          <CardDescription>
            Manage your account settings, API keys, and preferences
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <EnhancedApiKeysSection
            apiKeys={apiKeys}
            visibleKeys={visibleKeys}
            onCreateKey={() => setShowCreateKeyDialog(true)}
            onDeleteKey={handleDeleteApiKey}
            onCopyKey={handleCopyKey}
            onToggleVisibility={toggleKeyVisibility}
            maskApiKey={maskApiKey}
            isDarkMode={isDarkMode}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <EnhancedNotificationSettings
            preferences={preferences.notifications}
            onUpdate={(key, value) => handlePreferenceUpdate('notifications', key, value)}
            isDarkMode={isDarkMode}
          />
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <EnhancedPrivacySettings
            preferences={preferences.privacy}
            onUpdate={(key, value) => handlePreferenceUpdate('privacy', key, value)}
            isDarkMode={isDarkMode}
          />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <EnhancedAppearanceSettings
            preferences={preferences.appearance}
            onUpdate={(key, value) => handlePreferenceUpdate('appearance', key, value)}
            isDarkMode={isDarkMode}
          />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <AccountSecuritySettings
            preferences={preferences.account}
            onUpdate={(key, value) => handlePreferenceUpdate('account', key, value)}
            isDarkMode={isDarkMode}
          />
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateKeyDialog} onOpenChange={setShowCreateKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for accessing your account programmatically
            </DialogDescription>
          </DialogHeader>
          <CreateApiKeyForm
            keyData={newKeyData}
            setKeyData={setNewKeyData}
            onSave={handleCreateApiKey}
            onCancel={() => setShowCreateKeyDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// API Keys Section Component
const ApiKeysSection = ({ 
  apiKeys, 
  visibleKeys, 
  onCreateKey, 
  onDeleteKey, 
  onCopyKey, 
  onToggleVisibility,
  maskApiKey 
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys Management
          </CardTitle>
          <CardDescription>
            Manage your API keys for programmatic access
          </CardDescription>
        </div>
        <Button onClick={onCreateKey}>
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {apiKeys.length === 0 ? (
        <div className="text-center py-8">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys</h3>
          <p className="text-gray-600 mb-4">
            Create your first API key to access your account programmatically
          </p>
          <Button onClick={onCreateKey}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First API Key
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                  <p className="text-sm text-gray-600">{apiKey.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteKey(apiKey.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-gray-100 p-2 rounded font-mono">
                  {visibleKeys.has(index) ? apiKey.key : maskApiKey(apiKey.key)}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleVisibility(index)}
                >
                  {visibleKeys.has(index) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCopyKey(apiKey.key)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Created: {new Date(apiKey.created_at).toLocaleDateString()}
                {apiKey.last_used && (
                  <span className="ml-4">
                    Last used: {new Date(apiKey.last_used).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

// Notification Settings Component
const NotificationSettings = ({ preferences, onUpdate }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Notification Preferences
      </CardTitle>
      <CardDescription>
        Choose how you want to be notified about important events
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium">Notification Channels</h4>
        <div className="space-y-3">
          <SettingToggle
            icon={Mail}
            label="Email Notifications"
            description="Receive notifications via email"
            checked={preferences.email}
            onChange={(checked) => onUpdate('email', checked)}
          />
          <SettingToggle
            icon={Smartphone}
            label="Push Notifications"
            description="Receive push notifications on your devices"
            checked={preferences.push}
            onChange={(checked) => onUpdate('push', checked)}
          />
          <SettingToggle
            icon={Monitor}
            label="Desktop Notifications"
            description="Show notifications on your desktop"
            checked={preferences.desktop}
            onChange={(checked) => onUpdate('desktop', checked)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Notification Types</h4>
        <div className="space-y-3">
          <SettingToggle
            icon={Bell}
            label="Goal Reminders"
            description="Get reminded about your goals and deadlines"
            checked={preferences.goalReminders}
            onChange={(checked) => onUpdate('goalReminders', checked)}
          />
          <SettingToggle
            icon={Bell}
            label="Achievement Alerts"
            description="Be notified when you earn new achievements"
            checked={preferences.achievementAlerts}
            onChange={(checked) => onUpdate('achievementAlerts', checked)}
          />
          <SettingToggle
            icon={Bell}
            label="Weekly Reports"
            description="Receive weekly progress reports"
            checked={preferences.weeklyReports}
            onChange={(checked) => onUpdate('weeklyReports', checked)}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Privacy Settings Component
const PrivacySettings = ({ preferences, onUpdate }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Privacy Settings
      </CardTitle>
      <CardDescription>
        Control who can see your information and interact with you
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Profile Visibility</label>
          <select
            value={preferences.profileVisibility}
            onChange={(e) => onUpdate('profileVisibility', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="public">Public - Anyone can view</option>
            <option value="private">Private - Only you can view</option>
            <option value="connections">Connections - Only your connections</option>
          </select>
        </div>

        <SettingToggle
          icon={Shield}
          label="Show Achievements"
          description="Display your achievements on your profile"
          checked={preferences.showAchievements}
          onChange={(checked) => onUpdate('showAchievements', checked)}
        />
        
        <SettingToggle
          icon={Shield}
          label="Show Goals"
          description="Display your goals on your profile"
          checked={preferences.showGoals}
          onChange={(checked) => onUpdate('showGoals', checked)}
        />
        
        <SettingToggle
          icon={Shield}
          label="Allow Messages"
          description="Allow other users to send you messages"
          checked={preferences.allowMessages}
          onChange={(checked) => onUpdate('allowMessages', checked)}
        />
      </div>
    </CardContent>
  </Card>
);

// Appearance Settings Component
const AppearanceSettings = ({ preferences, onUpdate }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Palette className="w-5 h-5" />
        Appearance & Localization
      </CardTitle>
      <CardDescription>
        Customize how the application looks and behaves
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <select
            value={preferences.theme}
            onChange={(e) => onUpdate('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={preferences.language}
            onChange={(e) => onUpdate('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => onUpdate('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date Format</label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => onUpdate('dateFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Enhanced Setting Toggle Component with Dark Mode Support
const EnhancedSettingToggle = ({ icon: Icon, label, description, checked, onChange, isDarkMode }) => (
  <div className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:shadow-sm ${
    isDarkMode
      ? 'bg-gray-750 border-gray-600 hover:border-gray-500'
      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${
        isDarkMode ? 'bg-gray-700' : 'bg-white'
      }`}>
        <Icon className={`w-5 h-5 ${
          checked
            ? 'text-blue-500'
            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
      </div>
      <div>
        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className={`w-12 h-6 rounded-full peer transition-all duration-200 ${
        checked
          ? 'bg-blue-600'
          : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
      } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
    </label>
  </div>
);

// Enhanced Notification Settings Component
const EnhancedNotificationSettings = ({ preferences, onUpdate, isDarkMode }) => (
  <div className="space-y-6">
    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Bell className="w-5 h-5" />
          Notification Channels
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EnhancedSettingToggle
          icon={Mail}
          label="Email Notifications"
          description="Receive notifications via email with detailed summaries"
          checked={preferences.email}
          onChange={(checked) => onUpdate('email', checked)}
          isDarkMode={isDarkMode}
        />
        <EnhancedSettingToggle
          icon={Smartphone}
          label="Push Notifications"
          description="Get instant push notifications on your mobile devices"
          checked={preferences.push}
          onChange={(checked) => onUpdate('push', checked)}
          isDarkMode={isDarkMode}
        />
        <EnhancedSettingToggle
          icon={Monitor}
          label="Desktop Notifications"
          description="Show system notifications on your desktop computer"
          checked={preferences.desktop}
          onChange={(checked) => onUpdate('desktop', checked)}
          isDarkMode={isDarkMode}
        />
      </CardContent>
    </Card>

    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Zap className="w-5 h-5" />
          Notification Types
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Control which events trigger notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EnhancedSettingToggle
          icon={AlertCircle}
          label="Goal Reminders"
          description="Get reminded about upcoming deadlines and milestones"
          checked={preferences.goalReminders}
          onChange={(checked) => onUpdate('goalReminders', checked)}
          isDarkMode={isDarkMode}
        />
        <EnhancedSettingToggle
          icon={CheckCircle}
          label="Achievement Alerts"
          description="Be notified immediately when you earn new achievements"
          checked={preferences.achievementAlerts}
          onChange={(checked) => onUpdate('achievementAlerts', checked)}
          isDarkMode={isDarkMode}
        />
        <EnhancedSettingToggle
          icon={BarChart3}
          label="Weekly Reports"
          description="Receive comprehensive weekly progress reports"
          checked={preferences.weeklyReports}
          onChange={(checked) => onUpdate('weeklyReports', checked)}
          isDarkMode={isDarkMode}
        />
        <EnhancedSettingToggle
          icon={Globe}
          label="Social Notifications"
          description="Get notified about social interactions and connections"
          checked={preferences.socialNotifications}
          onChange={(checked) => onUpdate('socialNotifications', checked)}
          isDarkMode={isDarkMode}
        />
        <EnhancedSettingToggle
          icon={Shield}
          label="Security Alerts"
          description="Important security notifications and login alerts"
          checked={preferences.securityAlerts}
          onChange={(checked) => onUpdate('securityAlerts', checked)}
          isDarkMode={isDarkMode}
        />
      </CardContent>
    </Card>

    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Clock className="w-5 h-5" />
          Notification Frequency
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Control how often you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Notification Frequency
          </label>
          <select
            value={preferences.frequency}
            onChange={(e) => onUpdate('frequency', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            }`}
          >
            <option value="immediate">Immediate - As they happen</option>
            <option value="hourly">Hourly - Batched every hour</option>
            <option value="daily">Daily - Once per day summary</option>
            <option value="weekly">Weekly - Weekly digest only</option>
          </select>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Setting Toggle Component (Legacy)
// Enhanced Privacy Settings Component
const EnhancedPrivacySettings = ({ preferences, onUpdate, isDarkMode }) => (
  <div className="space-y-6">
    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Shield className="w-5 h-5" />
          Profile Visibility
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Control who can see your profile and information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Profile Visibility Level
          </label>
          <select
            value={preferences.profileVisibility}
            onChange={(e) => onUpdate('profileVisibility', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            }`}
          >
            <option value="public">🌍 Public - Anyone can view your profile</option>
            <option value="private">🔒 Private - Only you can view your profile</option>
            <option value="connections">👥 Connections - Only your connections can view</option>
            <option value="limited">👁️ Limited - Basic info only for non-connections</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EnhancedSettingToggle
            icon={CheckCircle}
            label="Show Achievements"
            description="Display your achievements publicly"
            checked={preferences.showAchievements}
            onChange={(checked) => onUpdate('showAchievements', checked)}
            isDarkMode={isDarkMode}
          />
          <EnhancedSettingToggle
            icon={AlertCircle}
            label="Show Goals"
            description="Display your goals on your profile"
            checked={preferences.showGoals}
            onChange={(checked) => onUpdate('showGoals', checked)}
            isDarkMode={isDarkMode}
          />
          <EnhancedSettingToggle
            icon={Activity}
            label="Show Activity"
            description="Display your recent activity"
            checked={preferences.showActivity}
            onChange={(checked) => onUpdate('showActivity', checked)}
            isDarkMode={isDarkMode}
          />
          <EnhancedSettingToggle
            icon={Globe}
            label="Show Online Status"
            description="Let others see when you're online"
            checked={preferences.showOnlineStatus}
            onChange={(checked) => onUpdate('showOnlineStatus', checked)}
            isDarkMode={isDarkMode}
          />
        </div>
      </CardContent>
    </Card>

    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Lock className="w-5 h-5" />
          Communication & Interaction
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Control how others can interact with you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EnhancedSettingToggle
          icon={Mail}
          label="Allow Messages"
          description="Allow other users to send you direct messages"
          checked={preferences.allowMessages}
          onChange={(checked) => onUpdate('allowMessages', checked)}
          isDarkMode={isDarkMode}
        />
        <EnhancedSettingToggle
          icon={Globe}
          label="Searchable Profile"
          description="Allow your profile to appear in search results"
          checked={preferences.searchable}
          onChange={(checked) => onUpdate('searchable', checked)}
          isDarkMode={isDarkMode}
        />
      </CardContent>
    </Card>

    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Database className="w-5 h-5" />
          Data & Analytics
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Control how your data is used and shared
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EnhancedSettingToggle
          icon={BarChart3}
          label="Analytics Opt-out"
          description="Opt out of anonymous usage analytics"
          checked={preferences.analyticsOptOut}
          onChange={(checked) => onUpdate('analyticsOptOut', checked)}
          isDarkMode={isDarkMode}
        />
        <EnhancedSettingToggle
          icon={Globe}
          label="Data Sharing"
          description="Allow anonymized data sharing for research"
          checked={preferences.dataSharing}
          onChange={(checked) => onUpdate('dataSharing', checked)}
          isDarkMode={isDarkMode}
        />
      </CardContent>
    </Card>
  </div>
);

// Enhanced Appearance Settings Component
const EnhancedAppearanceSettings = ({ preferences, onUpdate, isDarkMode }) => (
  <div className="space-y-6">
    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Palette className="w-5 h-5" />
          Theme & Visual Settings
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Customize the visual appearance of the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Theme Preference
            </label>
            <div className="space-y-2">
              {[
                { value: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean and bright interface' },
                { value: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Easy on the eyes' },
                { value: 'auto', label: 'Auto (System)', icon: Laptop, desc: 'Follow system preference' }
              ].map(({ value, label, icon: Icon, desc }) => (
                <label 
                  key={value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    preferences.theme === value
                      ? isDarkMode 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-blue-500 bg-blue-50'
                      : isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={value}
                    checked={preferences.theme === value}
                    onChange={(e) => onUpdate('theme', e.target.value)}
                    className="sr-only"
                  />
                  <Icon className={`w-5 h-5 mr-3 ${
                    preferences.theme === value 
                      ? 'text-blue-500' 
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <div>
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {label}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Font Size
            </label>
            <select
              value={preferences.fontSize}
              onChange={(e) => onUpdate('fontSize', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              <option value="small">Small - Compact text</option>
              <option value="medium">Medium - Standard size</option>
              <option value="large">Large - Easy to read</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EnhancedSettingToggle
            icon={Zap}
            label="Animations"
            description="Enable smooth animations and transitions"
            checked={preferences.animations}
            onChange={(checked) => onUpdate('animations', checked)}
            isDarkMode={isDarkMode}
          />
          <EnhancedSettingToggle
            icon={Monitor}
            label="Compact Mode"
            description="Use a more compact layout to fit more content"
            checked={preferences.compactMode}
            onChange={(checked) => onUpdate('compactMode', checked)}
            isDarkMode={isDarkMode}
          />
        </div>
      </CardContent>
    </Card>

    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Globe className="w-5 h-5" />
          Localization Settings
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Configure language, timezone, and regional preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => onUpdate('language', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="pt">🇵🇹 Português</option>
              <option value="it">🇮🇹 Italiano</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => onUpdate('timezone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              <option value="UTC">UTC - Coordinated Universal Time</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => onUpdate('dateFormat', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (European Format)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
              <option value="DD MMM YYYY">DD MMM YYYY (e.g., 15 Jan 2024)</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Time Format
            </label>
            <select
              value={preferences.timeFormat}
              onChange={(e) => onUpdate('timeFormat', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              <option value="12h">12-hour (e.g., 2:30 PM)</option>
              <option value="24h">24-hour (e.g., 14:30)</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Account Security Settings Component
const AccountSecuritySettings = ({ preferences, onUpdate, isDarkMode }) => (
  <div className="space-y-6">
    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Lock className="w-5 h-5" />
          Security Settings
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Manage your account security and authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Session Timeout (minutes)
            </label>
            <select
              value={preferences.sessionTimeout}
              onChange={(e) => onUpdate('sessionTimeout', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
              <option value={0}>Never timeout</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Data Retention (days)
            </label>
            <select
              value={preferences.dataRetention}
              onChange={(e) => onUpdate('dataRetention', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
              <option value={730}>2 years</option>
              <option value={-1}>Keep forever</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EnhancedSettingToggle
            icon={Shield}
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            checked={preferences.twoFactorEnabled}
            onChange={(checked) => onUpdate('twoFactorEnabled', checked)}
            isDarkMode={isDarkMode}
          />
          <EnhancedSettingToggle
            icon={Bell}
            label="Login Notifications"
            description="Get notified when someone logs into your account"
            checked={preferences.loginNotifications}
            onChange={(checked) => onUpdate('loginNotifications', checked)}
            isDarkMode={isDarkMode}
          />
          <EnhancedSettingToggle
            icon={Download}
            label="Auto Backup"
            description="Automatically backup your data regularly"
            checked={preferences.autoBackup}
            onChange={(checked) => onUpdate('autoBackup', checked)}
            isDarkMode={isDarkMode}
          />
        </div>
      </CardContent>
    </Card>

    <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Database className="w-5 h-5" />
          Data Management
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Export, import, and manage your account data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className={`flex items-center gap-2 ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button 
            variant="outline"
            className={`flex items-center gap-2 ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import Data
          </Button>
          <Button 
            variant="outline"
            className={`flex items-center gap-2 ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Sync Data
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
const SettingToggle = ({ icon: Icon, label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-500" />
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);

// Enhanced API Keys Section Component
const EnhancedApiKeysSection = ({
  apiKeys,
  visibleKeys,
  onCreateKey,
  onDeleteKey,
  onCopyKey,
  onToggleVisibility,
  maskApiKey,
  isDarkMode
}) => (
  <Card className={`transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Key className="w-5 h-5" />
            API Keys Management
          </CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Manage your API keys for programmatic access with advanced security features
          </CardDescription>
        </div>
        <Button
          onClick={onCreateKey}
          className={`transition-all duration-200 ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {apiKeys.length === 0 ? (
        <div className="text-center py-12">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <Key className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No API keys created yet
          </h3>
          <p className={`mb-6 max-w-md mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Create your first API key to access your account programmatically.
            Keys are encrypted and can be configured with specific permissions.
          </p>
          <Button
            onClick={onCreateKey}
            className={`transition-all duration-200 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First API Key
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                isDarkMode
                  ? 'bg-gray-750 border-gray-600 hover:border-gray-500'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {apiKey.name}
                    </h4>
                    <Badge
                      variant="success"
                      className={`text-xs ${
                        isDarkMode
                          ? 'bg-green-900 text-green-300 border-green-700'
                          : 'bg-green-100 text-green-800 border-green-200'
                      }`}
                    >
                      <Activity className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {apiKey.description || 'No description provided'}
                  </p>
                  <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created: {new Date(apiKey.created_at).toLocaleDateString()}
                      </span>
                      {apiKey.last_used && (
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          Last used: {new Date(apiKey.last_used).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteKey(apiKey.name)}
                  className="ml-4 transition-all duration-200 hover:scale-105"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <code className={`flex-1 text-sm p-3 rounded font-mono transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 border border-gray-600'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  {visibleKeys.has(index) ? apiKey.key : maskApiKey(apiKey.key)}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleVisibility(index)}
                  className={`transition-all duration-200 ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {visibleKeys.has(index) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCopyKey(apiKey.key)}
                  className={`transition-all duration-200 ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

// Create API Key Form Component
const CreateApiKeyForm = ({ keyData, setKeyData, onSave, onCancel }) => (
  <div className="space-y-4">
    <Input
      value={keyData.name}
      onChange={(e) => setKeyData(prev => ({ ...prev, name: e.target.value }))}
      placeholder="API Key Name"
    />
    <Input
      value={keyData.description}
      onChange={(e) => setKeyData(prev => ({ ...prev, description: e.target.value }))}
      placeholder="Description (optional)"
    />
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave}>
        Create API Key
      </Button>
    </div>
  </div>
);

export default SettingsManagementSection;