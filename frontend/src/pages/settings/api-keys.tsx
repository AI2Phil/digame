import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Key, Save, Trash2, AlertCircle } from 'lucide-react';

interface ApiKey {
  [key: string]: string;
}

interface ApiKeyData {
  user_id: number;
  api_keys: ApiKey;
  created_at: string;
  updated_at: string;
}

export default function SettingsApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newKeys, setNewKeys] = useState<ApiKey>({
    openai: '',
    anthropic: '',
    google: ''
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/user-settings/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: ApiKeyData = await response.json();
        setApiKeys(data.api_keys || {});
        setNewKeys({
          openai: data.api_keys?.openai || '',
          anthropic: data.api_keys?.anthropic || '',
          google: data.api_keys?.google || ''
        });
      } else {
        throw new Error('Failed to load API keys');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (keyName: string, keyValue: string) => {
    if (!keyValue.trim()) {
      setError('API key cannot be empty');
      return;
    }

    try {
      setSaving(keyName);
      setError(null);
      const token = localStorage.getItem('token');
      
      const updatedKeys = { ...apiKeys, [keyName]: keyValue };
      
      const response = await fetch('http://localhost:8000/api/user-settings/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ api_keys: updatedKeys })
      });

      if (response.ok) {
        const data: ApiKeyData = await response.json();
        setApiKeys(data.api_keys);
        setSuccess(`${keyName} API key saved successfully`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to save API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSaving(null);
    }
  };

  const deleteApiKey = async (keyName: string) => {
    try {
      setSaving(keyName);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8000/api/user-settings/api-keys/${keyName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: ApiKeyData = await response.json();
        setApiKeys(data.api_keys);
        setNewKeys(prev => ({ ...prev, [keyName]: '' }));
        setSuccess(`${keyName} API key deleted successfully`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to delete API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setSaving(null);
    }
  };

  const handleKeyChange = (keyName: string, value: string) => {
    setNewKeys(prev => ({ ...prev, [keyName]: value }));
  };

  const getKeyStatus = (keyName: string) => {
    return apiKeys[keyName] ? 'Configured' : 'Not configured';
  };

  const getStatusColor = (keyName: string) => {
    return apiKeys[keyName] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>API Keys - Settings - Digame</title>
        <meta name="description" content="Manage your third-party AI service API keys" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/settings"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center space-x-3">
                  <Key className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your third-party AI service API keys to power your AI features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-green-800">{success}</span>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  AI Service API Keys
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Configure your API keys for various AI services to enable advanced features.
                </p>
              </div>

              {/* API Keys Management */}
              <div className="space-y-6">
                {/* OpenAI */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">OpenAI</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          GPT models and embeddings
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor('openai')}`}>
                      {getKeyStatus('openai')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="sk-..."
                        value={newKeys.openai}
                        onChange={(e) => handleKeyChange('openai', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveApiKey('openai', newKeys.openai)}
                        disabled={saving === 'openai'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saving === 'openai' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Save API Key</span>
                      </button>
                      {apiKeys.openai && (
                        <button
                          onClick={() => deleteApiKey('openai')}
                          disabled={saving === 'openai'}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Anthropic */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Anthropic</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Claude models</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor('anthropic')}`}>
                      {getKeyStatus('anthropic')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="sk-ant-..."
                        value={newKeys.anthropic}
                        onChange={(e) => handleKeyChange('anthropic', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveApiKey('anthropic', newKeys.anthropic)}
                        disabled={saving === 'anthropic'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saving === 'anthropic' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Save API Key</span>
                      </button>
                      {apiKeys.anthropic && (
                        <button
                          onClick={() => deleteApiKey('anthropic')}
                          disabled={saving === 'anthropic'}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Google AI */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Google AI</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gemini models</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor('google')}`}>
                      {getKeyStatus('google')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="AIza..."
                        value={newKeys.google}
                        onChange={(e) => handleKeyChange('google', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveApiKey('google', newKeys.google)}
                        disabled={saving === 'google'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saving === 'google' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Save API Key</span>
                      </button>
                      {apiKeys.google && (
                        <button
                          onClick={() => deleteApiKey('google')}
                          disabled={saving === 'google'}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5">🔒</div>
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Security Notice
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Your API keys are encrypted and stored securely. They are only used to make
                      requests to the respective AI services on your behalf. Never share your API
                      keys with others.
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Information */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5">💡</div>
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      How to get API Keys
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>
                        • <strong>OpenAI:</strong> Visit platform.openai.com and create an API key
                      </li>
                      <li>
                        • <strong>Anthropic:</strong> Sign up at console.anthropic.com
                      </li>
                      <li>
                        • <strong>Google AI:</strong> Get your key from ai.google.dev
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
