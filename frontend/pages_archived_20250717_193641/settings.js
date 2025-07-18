import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../components/PageHeader';

const SettingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [userTier, setUserTier] = useState('Individual Pro');
  const [settings, setSettings] = useState({
    general: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      theme: 'light',
      autoSave: true,
      confirmActions: true
    },
    notifications: {
      email: {
        enabled: true,
        frequency: 'immediate',
        types: {
          security: true,
          updates: true,
          marketing: false,
          digest: true,
          mentions: true,
          assignments: true
        }
      },
      push: {
        enabled: true,
        types: {
          messages: true,
          updates: false,
          reminders: true,
          mentions: true
        }
      },
      inApp: {
        enabled: true,
        sound: true,
        desktop: true
      }
    },
    privacy: {
      profileVisibility: 'team',
      activityTracking: true,
      dataCollection: false,
      thirdPartySharing: false,
      searchIndexing: true,
      publicProfile: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginNotifications: true,
      deviceTracking: true,
      ipWhitelist: [],
      passwordExpiry: 90,
      requireStrongPassword: true
    },
    integrations: {
      allowedDomains: [],
      apiAccess: false,
      webhookUrls: [],
      ssoEnabled: false,
      dataSync: true
    },
    billing: {
      autoRenew: true,
      invoiceEmail: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      paymentMethod: 'card'
    },
    advanced: {
      debugMode: false,
      betaFeatures: false,
      analyticsOptOut: false,
      dataRetention: 365,
      exportFormat: 'json',
      backupFrequency: 'weekly'
    }
  });

  const tierFeatures = {
    'Free': {
      maxIntegrations: 2,
      apiAccess: false,
      ssoEnabled: false,
      advancedSecurity: false,
      customDomains: false,
      prioritySupport: false,
      dataRetentionDays: 30,
      teamFeatures: false
    },
    'Individual Pro': {
      maxIntegrations: 10,
      apiAccess: true,
      ssoEnabled: false,
      advancedSecurity: true,
      customDomains: false,
      prioritySupport: true,
      dataRetentionDays: 365,
      teamFeatures: false
    },
    'Team': {
      maxIntegrations: 25,
      apiAccess: true,
      ssoEnabled: true,
      advancedSecurity: true,
      customDomains: true,
      prioritySupport: true,
      dataRetentionDays: 730,
      teamFeatures: true
    },
    'Enterprise': {
      maxIntegrations: -1, // unlimited
      apiAccess: true,
      ssoEnabled: true,
      advancedSecurity: true,
      customDomains: true,
      prioritySupport: true,
      dataRetentionDays: -1, // unlimited
      teamFeatures: true
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchUserTier();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data.settings }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTier = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      const data = await response.json();
      setUserTier(data.profile?.subscription?.tier || 'Free');
    } catch (error) {
      console.error('Error fetching user tier:', error);
    }
  };

  const updateSettings = async (section, data) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data })
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [section]: { ...prev[section], ...data }
        }));
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const isFeatureAvailable = (feature) => {
    const currentTierFeatures = tierFeatures[userTier] || tierFeatures['Free'];
    return currentTierFeatures[feature];
  };

  const renderUpgradePrompt = (feature, description) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <div className="flex items-start">
        <div className="text-yellow-600 mr-3">🔒</div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-yellow-800 mb-1">
            {feature} - Upgrade Required
          </h4>
          <p className="text-sm text-yellow-700 mb-3">{description}</p>
          <button
            onClick={() => router.push('/billing/upgrade')}
            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={settings.general.language}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, language: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, timezone: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, dateFormat: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD MMM YYYY">DD MMM YYYY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
            <select
              value={settings.general.timeFormat}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, timeFormat: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="12h">12 Hour</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <select
              value={settings.general.theme}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, theme: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Auto-save changes</label>
            <input
              type="checkbox"
              checked={settings.general.autoSave}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, autoSave: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Confirm destructive actions</label>
            <input
              type="checkbox"
              checked={settings.general.confirmActions}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, confirmActions: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => updateSettings('general', settings.general)}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        
        {/* Basic Security */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
              <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, twoFactorAuth: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Login notifications</label>
            <input
              type="checkbox"
              checked={settings.security.loginNotifications}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, loginNotifications: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Advanced Security - Tier Restricted */}
        {isFeatureAvailable('advancedSecurity') ? (
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Advanced Security</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Device tracking</label>
                <input
                  type="checkbox"
                  checked={settings.security.deviceTracking}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, deviceTracking: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Password expiry (days)</label>
                <select
                  value={settings.security.passwordExpiry}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, passwordExpiry: parseInt(e.target.value) }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>1 year</option>
                  <option value={0}>Never</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
                <div className="space-y-2">
                  {settings.security.ipWhitelist.map((ip, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={ip}
                        onChange={(e) => {
                          const newList = [...settings.security.ipWhitelist];
                          newList[index] = e.target.value;
                          setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, ipWhitelist: newList }
                          }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="192.168.1.1"
                      />
                      <button
                        onClick={() => {
                          const newList = settings.security.ipWhitelist.filter((_, i) => i !== index);
                          setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, ipWhitelist: newList }
                          }));
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, ipWhitelist: [...prev.security.ipWhitelist, ''] }
                    }))}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Add IP Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          renderUpgradePrompt(
            'Advanced Security',
            'Get advanced security features including device tracking, IP whitelisting, and password policies.'
          )
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => updateSettings('security', settings.security)}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Settings</h3>
        
        {/* Basic Integrations */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Data synchronization</label>
            <input
              type="checkbox"
              checked={settings.integrations.dataSync}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                integrations: { ...prev.integrations, dataSync: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Integration Limit: {tierFeatures[userTier]?.maxIntegrations === -1 ? 'Unlimited' : tierFeatures[userTier]?.maxIntegrations || 0}
            </label>
            <div className="text-sm text-gray-500">
              Current tier allows {tierFeatures[userTier]?.maxIntegrations === -1 ? 'unlimited' : tierFeatures[userTier]?.maxIntegrations || 0} active integrations
            </div>
          </div>
        </div>

        {/* API Access - Tier Restricted */}
        {isFeatureAvailable('apiAccess') ? (
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">API Access</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Enable API access</label>
                <input
                  type="checkbox"
                  checked={settings.integrations.apiAccess}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, apiAccess: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URLs</label>
                <div className="space-y-2">
                  {settings.integrations.webhookUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...settings.integrations.webhookUrls];
                          newUrls[index] = e.target.value;
                          setSettings(prev => ({
                            ...prev,
                            integrations: { ...prev.integrations, webhookUrls: newUrls }
                          }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://your-webhook-url.com"
                      />
                      <button
                        onClick={() => {
                          const newUrls = settings.integrations.webhookUrls.filter((_, i) => i !== index);
                          setSettings(prev => ({
                            ...prev,
                            integrations: { ...prev.integrations, webhookUrls: newUrls }
                          }));
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      integrations: { ...prev.integrations, webhookUrls: [...prev.integrations.webhookUrls, ''] }
                    }))}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Add Webhook URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          renderUpgradePrompt(
            'API Access',
            'Unlock API access and webhook capabilities to integrate with external systems.'
          )
        )}

        {/* SSO - Tier Restricted */}
        {isFeatureAvailable('ssoEnabled') ? (
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Single Sign-On (SSO)</h4>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable SSO</label>
                <p className="text-xs text-gray-500">Allow users to sign in with corporate credentials</p>
              </div>
              <input
                type="checkbox"
                checked={settings.integrations.ssoEnabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  integrations: { ...prev.integrations, ssoEnabled: e.target.checked }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        ) : (
          renderUpgradePrompt(
            'Single Sign-On',
            'Enable SSO to allow seamless authentication with your corporate identity provider.'
          )
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => updateSettings('integrations', settings.integrations)}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Integration Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Debug mode</label>
              <p className="text-xs text-gray-500">Enable detailed logging for troubleshooting</p>
            </div>
            <input
              type="checkbox"
              checked={settings.advanced.debugMode}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                advanced: { ...prev.advanced, debugMode: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Beta features</label>
              <p className="text-xs text-gray-500">Access experimental features before general release</p>
            </div>
            <input
              type="checkbox"
              checked={settings.advanced.betaFeatures}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                advanced: { ...prev.advanced, betaFeatures: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Data retention (days)</label>
            <select
              value={settings.advanced.dataRetention}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                advanced: { ...prev.advanced, dataRetention: parseInt(e.target.value) }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={tierFeatures[userTier]?.dataRetentionDays !== -1 && settings.advanced.dataRetention > tierFeatures[userTier]?.dataRetentionDays}
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
              {tierFeatures[userTier]?.dataRetentionDays === -1 && (
                <>
                  <option value={730}>2 years</option>
                  <option value={-1}>Unlimited</option>
                </>
              )}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Export format</label>
            <select
              value={settings.advanced.exportFormat}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                advanced: { ...prev.advanced, exportFormat: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
              <option value="xlsx">Excel</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Backup frequency</label>
            <select
              value={settings.advanced.backupFrequency}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                advanced: { ...prev.advanced, backupFrequency: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => updateSettings('advanced', settings.advanced)}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Advanced Settings'}
          </button>
        </div>
      </div>

      {/* Tier Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Current Plan: {userTier}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Plan Features</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Integrations: {tierFeatures[userTier]?.maxIntegrations === -1 ? 'Unlimited' : tierFeatures[userTier]?.maxIntegrations}</li>
              <li>• API Access: {tierFeatures[userTier]?.apiAccess ? 'Yes' : 'No'}</li>
              <li>• SSO: {tierFeatures[userTier]?.ssoEnabled ? 'Yes' : 'No'}</li>
              <li>• Advanced Security: {tierFeatures[userTier]?.advancedSecurity ? 'Yes' : 'No'}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Support & Retention</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Priority Support: {tierFeatures[userTier]?.prioritySupport ? 'Yes' : 'No'}</li>
              <li>• Data Retention: {tierFeatures[userTier]?.dataRetentionDays === -1 ? 'Unlimited' : `${tierFeatures[userTier]?.dataRetentionDays} days`}</li>
              <li>• Team Features: {tierFeatures[userTier]?.teamFeatures ? 'Yes' : 'No'}</li>
              <li>• Custom Domains: {tierFeatures[userTier]?.customDomains ? 'Yes' : 'No'}</li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push('/billing/upgrade')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Settings"
        subtitle="Configure your account preferences and platform settings"
        breadcrumbs={[
          { label: 'Core Platform', href: '/dashboard' },
          { label: 'Settings', href: '/settings' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Tier Badge */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">⚙️</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
                <p className="text-sm text-gray-600">Current Plan: <span className="font-medium text-blue-600">{userTier}</span></p>
              </div>
            </div>
            <button
              onClick={() => router.push('/billing')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Manage Billing
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: 'General', icon: '⚙️' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'privacy', label: 'Privacy', icon: '🔒' },
              { id: 'security', label: 'Security', icon: '🛡️' },
              { id: 'integrations', label: 'Integrations', icon: '🔗' },
              { id: 'billing', label: 'Billing', icon: '💳' },
              { id: 'advanced', label: 'Advanced', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'integrations' && renderIntegrationsTab()}
          {activeTab === 'advanced' && renderAdvancedTab()}
          
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
              <p className="text-gray-600 mb-4">
                For detailed notification settings, please visit the dedicated{' '}
                <button
                  onClick={() => router.push('/notifications')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Notifications page
                </button>
                .
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Email notifications</label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.email.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        email: { ...prev.notifications.email, enabled: e.target.checked }
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Push notifications</label>
                  <input
                    type="checkbox"
                    checked={settings.notifications.push.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        push: { ...prev.notifications.push, enabled: e.target.checked }
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Profile visibility</label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: e.target.value }
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="team">Team Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Activity tracking</label>
                  <input
                    type="checkbox"
                    checked={settings.privacy.activityTracking}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, activityTracking: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Data collection for analytics</label>
                  <input
                    type="checkbox"
                    checked={settings.privacy.dataCollection}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, dataCollection: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Third-party data sharing</label>
                  <input
                    type="checkbox"
                    checked={settings.privacy.thirdPartySharing}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, thirdPartySharing: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => updateSettings('privacy', settings.privacy)}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Privacy Settings'}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'billing' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Settings</h3>
              <p className="text-gray-600 mb-4">
                For detailed billing management, please visit the dedicated{' '}
                <button
                  onClick={() => router.push('/billing')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Billing page
                </button>
                .
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Auto-renewal</label>
                  <input
                    type="checkbox"
                    checked={settings.billing.autoRenew}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      billing: { ...prev.billing, autoRenew: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice email</label>
                  <input
                    type="email"
                    value={settings.billing.invoiceEmail}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      billing: { ...prev.billing, invoiceEmail: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="billing@company.com"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => updateSettings('billing', settings.billing)}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Billing Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;