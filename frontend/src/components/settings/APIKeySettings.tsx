/**
 * API Key Settings Component
 * 
 * Comprehensive API key management interface for all supported AI providers
 */

import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Trash2, 
  Plus, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  TestTube,
  Shield,
  Info
} from 'lucide-react';

// Types
interface APIKey {
  service: string;
  key: string;
  masked: boolean;
  lastUsed?: string;
  status?: 'active' | 'inactive' | 'error';
}

interface APIKeySettingsProps {
  onMessage: (message: { type: 'success' | 'error' | 'info'; text: string }) => void;
  onLoading: (loading: boolean) => void;
}

interface AIProvider {
  id: string;
  name: string;
  description: string;
  keyFormat: string;
  keyExample: string;
  documentationUrl: string;
  icon: string;
  color: string;
  features: string[];
}

const APIKeySettings: React.FC<APIKeySettingsProps> = ({ onMessage, onLoading }) => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({});
  const [keyStatuses, setKeyStatuses] = useState<Record<string, 'active' | 'inactive' | 'error'>>({});
  const [saving, setSaving] = useState(false);

  // Supported AI providers
  const aiProviders: AIProvider[] = [
    {
      id: 'openai_api_key',
      name: 'OpenAI',
      description: 'GPT models, ChatGPT, DALL-E, and more',
      keyFormat: 'sk-...',
      keyExample: 'sk-1234567890abcdef...',
      documentationUrl: 'https://platform.openai.com/api-keys',
      icon: '🤖',
      color: 'bg-green-50 border-green-200',
      features: ['Writing Assistance', 'Meeting Insights', 'Document Processing', 'Language Learning']
    },
    {
      id: 'anthropic_api_key',
      name: 'Anthropic',
      description: 'Claude AI models for advanced reasoning',
      keyFormat: 'sk-ant-...',
      keyExample: 'sk-ant-api03-1234567890abcdef...',
      documentationUrl: 'https://console.anthropic.com/',
      icon: '🧠',
      color: 'bg-purple-50 border-purple-200',
      features: ['Advanced Analysis', 'Code Review', 'Research Assistance']
    },
    {
      id: 'google_api_key',
      name: 'Google AI',
      description: 'Gemini and other Google AI services',
      keyFormat: 'AIza...',
      keyExample: 'AIzaSyDaGmWKa4JsXZ-HjGw...',
      documentationUrl: 'https://ai.google.dev/',
      icon: '🔍',
      color: 'bg-blue-50 border-blue-200',
      features: ['Search Enhancement', 'Translation', 'Vision AI']
    },
    {
      id: 'azure_openai_api_key',
      name: 'Azure OpenAI',
      description: 'Enterprise OpenAI through Microsoft Azure',
      keyFormat: 'abc123...',
      keyExample: 'abc123def456ghi789...',
      documentationUrl: 'https://azure.microsoft.com/en-us/products/ai-services/openai-service',
      icon: '☁️',
      color: 'bg-indigo-50 border-indigo-200',
      features: ['Enterprise Security', 'Compliance', 'Custom Models']
    },
    {
      id: 'huggingface_api_key',
      name: 'Hugging Face',
      description: 'Open-source AI models and datasets',
      keyFormat: 'hf_...',
      keyExample: 'hf_1234567890abcdef...',
      documentationUrl: 'https://huggingface.co/settings/tokens',
      icon: '🤗',
      color: 'bg-yellow-50 border-yellow-200',
      features: ['Open Source Models', 'Custom Training', 'Model Hub']
    },
    {
      id: 'cohere_api_key',
      name: 'Cohere',
      description: 'Natural language processing and generation',
      keyFormat: 'co-...',
      keyExample: 'co-1234567890abcdef...',
      documentationUrl: 'https://dashboard.cohere.ai/api-keys',
      icon: '💬',
      color: 'bg-orange-50 border-orange-200',
      features: ['Text Generation', 'Embeddings', 'Classification']
    }
  ];

  // Load API keys on component mount
  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      onLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.api_keys || {});
        
        // Set initial statuses
        const statuses: Record<string, 'active' | 'inactive' | 'error'> = {};
        Object.keys(data.api_keys || {}).forEach(key => {
          statuses[key] = 'active'; // Assume active until tested
        });
        setKeyStatuses(statuses);
      } else {
        throw new Error('Failed to load API keys');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to load API keys' });
    } finally {
      onLoading(false);
    }
  };

  const saveAPIKeys = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ api_keys: apiKeys })
      });

      if (response.ok) {
        onMessage({ type: 'success', text: 'API keys saved successfully' });
      } else {
        throw new Error('Failed to save API keys');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to save API keys' });
    } finally {
      setSaving(false);
    }
  };

  const testAPIKey = async (providerId: string) => {
    const key = apiKeys[providerId];
    if (!key) {
      onMessage({ type: 'error', text: 'Please enter an API key first' });
      return;
    }

    try {
      setTestingKeys(prev => ({ ...prev, [providerId]: true }));
      
      // Call the test API endpoint
      const token = localStorage.getItem('token');
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          service: providerId.replace('_api_key', ''),
          api_key: key 
        })
      });

      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setKeyStatuses(prev => ({ ...prev, [providerId]: 'active' }));
        onMessage({ type: 'success', text: `${aiProviders.find(p => p.id === providerId)?.name} API key is working correctly` });
      } else {
        setKeyStatuses(prev => ({ ...prev, [providerId]: 'error' }));
        onMessage({ type: 'error', text: `${aiProviders.find(p => p.id === providerId)?.name} API key test failed: ${result.error || 'Unknown error'}` });
      }
    } catch (error) {
      setKeyStatuses(prev => ({ ...prev, [providerId]: 'error' }));
      onMessage({ type: 'error', text: 'Failed to test API key' });
    } finally {
      setTestingKeys(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const deleteAPIKey = async (providerId: string) => {
    if (!confirm(`Are you sure you want to delete the ${aiProviders.find(p => p.id === providerId)?.name} API key?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/settings/api-keys/${providerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setApiKeys(prev => {
          const updated = { ...prev };
          delete updated[providerId];
          return updated;
        });
        setKeyStatuses(prev => {
          const updated = { ...prev };
          delete updated[providerId];
          return updated;
        });
        onMessage({ type: 'success', text: 'API key deleted successfully' });
      } else {
        throw new Error('Failed to delete API key');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to delete API key' });
    }
  };

  const toggleKeyVisibility = (providerId: string) => {
    setVisibleKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const updateAPIKey = (providerId: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [providerId]: value }));
    // Reset status when key changes
    if (keyStatuses[providerId]) {
      setKeyStatuses(prev => ({ ...prev, [providerId]: 'inactive' }));
    }
  };

  const maskAPIKey = (key: string) => {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const getStatusIcon = (status: 'active' | 'inactive' | 'error' | undefined) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">API Key Management</h3>
          <p className="text-sm text-gray-600">
            Configure your AI service API keys to enable advanced features
          </p>
        </div>
        <button
          onClick={saveAPIKeys}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Keys'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Secure API Key Storage</p>
            <p>Your API keys are encrypted and stored securely. They are only used to make requests to the respective AI services on your behalf.</p>
          </div>
        </div>
      </div>

      {/* API Key Cards */}
      <div className="space-y-6">
        {aiProviders.map((provider) => {
          const hasKey = !!apiKeys[provider.id];
          const isVisible = visibleKeys[provider.id];
          const isTesting = testingKeys[provider.id];
          const status = keyStatuses[provider.id];

          return (
            <div key={provider.id} className={`border rounded-lg p-6 ${provider.color}`}>
              {/* Provider Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{provider.name}</h4>
                    <p className="text-sm text-gray-600">{provider.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {hasKey && getStatusIcon(status)}
                  <a
                    href={provider.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">ENABLED FEATURES:</p>
                <div className="flex flex-wrap gap-2">
                  {provider.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-700 border"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        value={apiKeys[provider.id] || ''}
                        onChange={(e) => updateAPIKey(provider.id, e.target.value)}
                        placeholder={provider.keyExample}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      {hasKey && (
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(provider.id)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    {hasKey && (
                      <>
                        <button
                          onClick={() => testAPIKey(provider.id)}
                          disabled={isTesting}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <TestTube className="w-4 h-4 mr-1" />
                          {isTesting ? 'Testing...' : 'Test'}
                        </button>
                        <button
                          onClick={() => deleteAPIKey(provider.id)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Key Format Help */}
                <div className="text-xs text-gray-500">
                  <p>Expected format: <code className="bg-gray-100 px-1 rounded">{provider.keyFormat}</code></p>
                  {hasKey && !isVisible && (
                    <p className="mt-1">Current key: <code className="bg-gray-100 px-1 rounded">{maskAPIKey(apiKeys[provider.id])}</code></p>
                  )}
                </div>

                {/* Status Message */}
                {status === 'active' && (
                  <div className="flex items-center text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    API key is working correctly
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    API key test failed - please check your key
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Security & Privacy</p>
            <ul className="space-y-1 text-xs">
              <li>• API keys are encrypted using industry-standard encryption</li>
              <li>• Keys are only transmitted over secure HTTPS connections</li>
              <li>• We never store or log the actual content of your API requests</li>
              <li>• You can revoke access at any time by deleting your keys</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeySettings;