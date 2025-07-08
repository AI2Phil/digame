import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Edit, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';

const ApiKeyManagementSection = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const toast = useToastHelpers();

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setApiKeys([
        {
          id: 'key_001',
          name: 'OpenAI GPT-4 API',
          service: 'openai',
          key: 'sk-proj-abc123...xyz789',
          status: 'active',
          created_at: '2024-01-15T10:30:00Z',
          last_used: '2024-01-20T14:22:00Z',
          usage_count: 1247,
          rate_limit: '3000/min'
        },
        {
          id: 'key_002',
          name: 'Anthropic Claude API',
          service: 'anthropic',
          key: 'sk-ant-api03-abc123...xyz789',
          status: 'active',
          created_at: '2024-01-10T09:15:00Z',
          last_used: '2024-01-19T16:45:00Z',
          usage_count: 892,
          rate_limit: '1000/min'
        },
        {
          id: 'key_003',
          name: 'Google Gemini API',
          service: 'google',
          key: 'AIzaSyAbc123...xyz789',
          status: 'inactive',
          created_at: '2024-01-05T11:20:00Z',
          last_used: '2024-01-12T08:30:00Z',
          usage_count: 234,
          rate_limit: '60/min'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getServiceIcon = (service) => {
    const iconProps = { className: "h-5 w-5" };
    switch (service) {
      case 'openai':
        return <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">O</div>;
      case 'anthropic':
        return <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>;
      case 'google':
        return <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>;
      default:
        return <Key {...iconProps} />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      expired: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    
    const variant = variants[status] || variants.inactive;
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  const copyToClipboard = async (text, keyName) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`API key for ${keyName} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const maskApiKey = (key) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  const handleDeleteKey = (keyId, keyName) => {
    if (window.confirm(`Are you sure you want to delete the API key for ${keyName}?`)) {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success(`API key for ${keyName} deleted successfully`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading API keys...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Key Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your third-party AI service API keys and access tokens
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add API Key</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold">{apiKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-bold">{new Set(apiKeys.map(k => k.service)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ExternalLink className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold">{apiKeys.reduce((sum, k) => sum + k.usage_count, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Keys</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No API keys configured</p>
              <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                Add Your First API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getServiceIcon(apiKey.service)}
                      <div>
                        <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(apiKey.status)}
                          <span className="text-sm text-gray-500">
                            Created {new Date(apiKey.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key, apiKey.name)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Edit functionality */}}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteKey(apiKey.id, apiKey.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">API Key:</span>
                      <div className="font-mono mt-1">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Usage:</span>
                      <div className="mt-1">
                        {apiKey.usage_count.toLocaleString()} requests
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Rate Limit:</span>
                      <div className="mt-1">{apiKey.rate_limit}</div>
                    </div>
                  </div>
                  
                  {apiKey.last_used && (
                    <div className="mt-2 text-sm text-gray-500">
                      Last used: {new Date(apiKey.last_used).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Form Modal (simplified for now) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                <Input placeholder="e.g., OpenAI GPT-4" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <Input type="password" placeholder="Enter your API key" />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowCreateForm(false);
                  toast.success('API key added successfully');
                }} className="flex-1">
                  Add Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManagementSection;