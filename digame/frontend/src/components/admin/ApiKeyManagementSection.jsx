import React, { useState } from 'react';
import { 
  Key, Plus, Search, Eye, EyeOff, Copy, 
  Trash2, Edit, Calendar, Activity, 
  AlertTriangle, CheckCircle, Clock,
  Download, Filter, MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Toast } from '../ui/Toast';

const ApiKeyManagementSection = ({ apiKeys, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState(new Set());

  const handleToggleKeyVisibility = (keyId) => {
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

  const handleCopyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      Toast.success('API key copied to clipboard');
    } catch (error) {
      Toast.error('Failed to copy API key');
    }
  };

  const handleDeleteKey = async (keyId) => {
    try {
      await apiService.deleteAdminApiKey(keyId);
      Toast.success('API key deleted successfully');
      onRefresh();
    } catch (error) {
      Toast.error('Failed to delete API key');
    }
  };

  const handleBulkAction = async (action) => {
    try {
      await Promise.all(
        selectedKeys.map(keyId => 
          action === 'delete' 
            ? apiService.deleteAdminApiKey(keyId)
            : apiService.updateAdminApiKey(keyId, { status: action })
        )
      );
      setSelectedKeys([]);
      Toast.success(`Bulk ${action} completed successfully`);
      onRefresh();
    } catch (error) {
      Toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || key.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      expired: { variant: 'destructive', label: 'Expired' },
      revoked: { variant: 'destructive', label: 'Revoked' }
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUsageBadge = (usage) => {
    if (usage > 80) return <Badge variant="destructive">High</Badge>;
    if (usage > 50) return <Badge variant="warning">Medium</Badge>;
    return <Badge variant="success">Low</Badge>;
  };

  const maskApiKey = (key) => {
    if (!key) return '';
    return `${key.substring(0, 8)}${'*'.repeat(24)}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Key Management
              </CardTitle>
              <CardDescription>
                Monitor and manage API keys across all users and services
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search API keys by name or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedKeys.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedKeys.length} key(s) selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredKeys.map((apiKey) => (
          <ApiKeyCard
            key={apiKey.id}
            apiKey={apiKey}
            isVisible={visibleKeys.has(apiKey.id)}
            onToggleVisibility={() => handleToggleKeyVisibility(apiKey.id)}
            onCopy={() => handleCopyKey(apiKey.key)}
            onEdit={() => {
              setSelectedKey(apiKey);
              setShowKeyDialog(true);
            }}
            onDelete={() => handleDeleteKey(apiKey.id)}
            isSelected={selectedKeys.includes(apiKey.id)}
            onSelect={(selected) => {
              setSelectedKeys(prev => 
                selected 
                  ? [...prev, apiKey.id]
                  : prev.filter(id => id !== apiKey.id)
              );
            }}
          />
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold">{apiKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold">
                  {apiKeys.filter(k => k.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold">
                  {apiKeys.filter(k => k.expiresIn && k.expiresIn < 7).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">
                  {apiKeys.reduce((sum, k) => sum + (k.requestCount || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for system or user access
            </DialogDescription>
          </DialogHeader>
          <CreateApiKeyForm onClose={() => setShowCreateDialog(false)} onRefresh={onRefresh} />
        </DialogContent>
      </Dialog>

      {/* Edit API Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>
              Modify API key settings and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <EditApiKeyForm 
              apiKey={selectedKey}
              onClose={() => setShowKeyDialog(false)} 
              onRefresh={onRefresh} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// API Key Card Component
const ApiKeyCard = ({ 
  apiKey, 
  isVisible, 
  onToggleVisibility, 
  onCopy, 
  onEdit, 
  onDelete,
  isSelected,
  onSelect
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      expired: { variant: 'destructive', label: 'Expired' },
      revoked: { variant: 'destructive', label: 'Revoked' }
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const maskApiKey = (key) => {
    if (!key) return '';
    return `${key.substring(0, 8)}${'*'.repeat(24)}${key.substring(key.length - 4)}`;
  };

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded border-gray-300"
            />
            <div>
              <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
              <p className="text-sm text-gray-500">{apiKey.user?.email}</p>
            </div>
          </div>
          {getStatusBadge(apiKey.status)}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">API Key</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 text-sm bg-gray-100 p-2 rounded font-mono">
                {isVisible ? apiKey.key : maskApiKey(apiKey.key)}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={onToggleVisibility}
              >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCopy}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created</span>
              <p className="font-medium">
                {new Date(apiKey.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Last Used</span>
              <p className="font-medium">
                {apiKey.last_used 
                  ? new Date(apiKey.last_used).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Requests</span>
              <p className="font-medium">{(apiKey.requestCount || 0).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Usage</span>
              <div className="flex items-center gap-2">
                <Badge variant={apiKey.usage > 80 ? 'destructive' : 'success'}>
                  {apiKey.usage || 0}%
                </Badge>
              </div>
            </div>
          </div>

          {apiKey.expiresAt && (
            <div>
              <span className="text-gray-500 text-sm">Expires</span>
              <p className="font-medium text-sm">
                {new Date(apiKey.expiresAt).toLocaleDateString()}
                {apiKey.expiresIn && apiKey.expiresIn < 7 && (
                  <span className="text-red-500 ml-2">({apiKey.expiresIn} days)</span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Create API Key Form Component
const CreateApiKeyForm = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    expiresIn: '30',
    userId: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createAdminApiKey(formData);
      Toast.success('API key created successfully');
      onRefresh();
      onClose();
    } catch (error) {
      Toast.error('Failed to create API key');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Key Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter API key name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Expires In (days)</label>
        <select
          value={formData.expiresIn}
          onChange={(e) => setFormData(prev => ({ ...prev, expiresIn: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="365">1 year</option>
          <option value="">Never expires</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create API Key
        </Button>
      </div>
    </form>
  );
};

// Edit API Key Form Component
const EditApiKeyForm = ({ apiKey, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: apiKey.name || '',
    description: apiKey.description || '',
    status: apiKey.status || 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateAdminApiKey(apiKey.id, formData);
      Toast.success('API key updated successfully');
      onRefresh();
      onClose();
    } catch (error) {
      Toast.error('Failed to update API key');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Key Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter API key name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Update API Key
        </Button>
      </div>
    </form>
  );
};

export default ApiKeyManagementSection;