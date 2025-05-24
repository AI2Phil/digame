import React, { useState } from 'react';
import { 
  Settings, Key, Bell, Shield, Palette, 
  Globe, Eye, EyeOff, Copy, Plus, Trash2,
  Lock, Unlock, Smartphone, Mail, Monitor
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Toast } from '../ui/Toast';
import apiService from '../../services/apiService';

const SettingsManagementSection = ({ apiKeys, setApiKeys }) => {
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      desktop: false,
      goalReminders: true,
      achievementAlerts: true,
      weeklyReports: true
    },
    privacy: {
      profileVisibility: 'public',
      showAchievements: true,
      showGoals: false,
      allowMessages: true
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    }
  });

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
      Toast.success('API key created successfully');
    } catch (error) {
      Toast.error('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (keyName) => {
    try {
      await apiService.deleteApiKey(keyName);
      setApiKeys(apiKeys.filter(key => key.name !== keyName));
      Toast.success('API key deleted successfully');
    } catch (error) {
      Toast.error('Failed to delete API key');
    }
  };

  const handleCopyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      Toast.success('API key copied to clipboard');
    } catch (error) {
      Toast.error('Failed to copy API key');
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
      Toast.success('Preferences updated successfully');
    } catch (error) {
      Toast.error('Failed to update preferences');
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

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <ApiKeysSection
            apiKeys={apiKeys}
            visibleKeys={visibleKeys}
            onCreateKey={() => setShowCreateKeyDialog(true)}
            onDeleteKey={handleDeleteApiKey}
            onCopyKey={handleCopyKey}
            onToggleVisibility={toggleKeyVisibility}
            maskApiKey={maskApiKey}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings
            preferences={preferences.notifications}
            onUpdate={(key, value) => handlePreferenceUpdate('notifications', key, value)}
          />
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <PrivacySettings
            preferences={preferences.privacy}
            onUpdate={(key, value) => handlePreferenceUpdate('privacy', key, value)}
          />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <AppearanceSettings
            preferences={preferences.appearance}
            onUpdate={(key, value) => handlePreferenceUpdate('appearance', key, value)}
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

// Setting Toggle Component
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