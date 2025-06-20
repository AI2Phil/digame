import React, { useState } from 'react';
import { 
  Key, Plus, Search, Eye, EyeOff, Copy, 
  Trash2, Edit, Calendar, Activity, 
  AlertTriangle, CheckCircle, Clock, Server, UserCircle,
  Download, Filter, MoreHorizontal, Settings2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/Dialog';
// import { Toast } from '../ui/Toast'; // Assuming global toast
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Progress } from '../ui/Progress';
import { Checkbox } from '../ui/Checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Label } from '../ui/Label';


// Mock API service - replace with actual API calls
const apiService = {
  createAdminApiKey: async (data) => {
    console.log('Creating API Key:', data);
    return { id: `new_${Date.now()}`, ...data, key: `sk_live_mock_${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString(), last_used: null, requestCount: 0, usage: 0, user: { email: 'temp@example.com'} };
  },
  updateAdminApiKey: async (keyId, data) => {
    console.log('Updating API Key:', keyId, data);
    return { id: keyId, ...data };
  },
  deleteAdminApiKey: async (keyId) => {
    console.log('Deleting API Key:', keyId);
    return {};
  },
};


const ApiKeyManagementSection = ({ apiKeys, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // Ensure onRefresh is a function to prevent errors if not passed
  const handleRefresh = onRefresh || (() => console.log("Refresh triggered but no handler provided."));
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-auto text-xs sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
              {/* <Button variant="outline" size="sm" className="hidden sm:flex dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                <Filter className="w-3.5 h-3.5 mr-1.5" /> Filters
              </Button> */}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedKeys.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedKeys.length} key(s) selected
              </span>
              <div className="flex gap-2 ml-0 sm:ml-auto mt-2 sm:mt-0">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => handleBulkAction('active')}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Activate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => handleBulkAction('inactive')}
                >
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Deactivate
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys Grid */}
      {filteredKeys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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
      ) : (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-10 text-center text-gray-500 dark:text-gray-400">
            <Key className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-semibold mb-1">No API Keys Found</h3>
            <p className="text-sm">Try adjusting your search or filter criteria, or create a new API key.</p>
          </CardContent>
        </Card>
      )}


      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-6">
        {[
          { title: 'Total Keys', value: apiKeys.length, icon: Key, color: 'blue' },
          { title: 'Active Keys', value: apiKeys.filter(k => k.status === 'active').length, icon: CheckCircle, color: 'green' },
          { title: 'Expiring Soon (<7d)', value: apiKeys.filter(k => k.expiresAt && (new Date(k.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 7 && (new Date(k.expiresAt).getTime() - Date.now()) > 0).length, icon: AlertTriangle, color: 'yellow' },
          { title: 'Total Requests', value: apiKeys.reduce((sum, k) => sum + (k.requestCount || 0), 0).toLocaleString(), icon: Activity, color: 'purple' },
        ].map(stat => {
          const StatIcon = stat.icon;
          return (
            <Card key={stat.title} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                    <StatIcon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-xl sm:text-2xl font-bold dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[480px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Create New API Key</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Generate a new API key for system or user access. Configure its name, permissions, and expiration.
            </DialogDescription>
          </DialogHeader>
          <CreateApiKeyForm
            onClose={() => setShowCreateDialog(false)}
            onRefresh={handleRefresh}
          />
        </DialogContent>
      </Dialog>

      {/* Edit API Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="sm:max-w-[480px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Edit API Key</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Modify API key settings such as name, description, and status.
            </DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <EditApiKeyForm 
              apiKey={selectedKey}
              onClose={() => setShowKeyDialog(false)} 
              onRefresh={handleRefresh}
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
      active: { variant: 'success', label: 'Active', className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      inactive: { variant: 'secondary', label: 'Inactive', className: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
      expired: { variant: 'destructive', label: 'Expired', className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
      revoked: { variant: 'destructive', label: 'Revoked', className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" }
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return <Badge variant="outline" className={`border ${config.className}`}>{config.label}</Badge>;
  };

  const maskApiKey = (key) => {
    if (!key) return 'No key available';
    return `${key.substring(0, 8)}${'•'.repeat(16)}${key.substring(key.length - 4)}`;
  };

  const getUsageProgressColor = (usage) => {
    if (usage > 80) return "bg-red-500";
    if (usage > 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className={`transition-all dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'border-transparent'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
             <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                id={`select-key-${apiKey.id}`}
                aria-label={`Select API key ${apiKey.name}`}
                className="mt-1 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
             />
            <div>
              <CardTitle className="text-md sm:text-lg font-semibold dark:text-gray-100">{apiKey.name}</CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={apiKey.user?.avatar} />
                  <AvatarFallback className="text-[8px] bg-gray-200 dark:bg-gray-600 dark:text-gray-300">
                    {apiKey.user?.email?.charAt(0).toUpperCase() || <UserCircle size={10}/>}
                  </AvatarFallback>
                </Avatar>
                {apiKey.user?.email || 'N/A'}
              </div>
            </div>
          </div>
          {getStatusBadge(apiKey.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-6 space-y-3">
        <div className="space-y-1">
          <Label htmlFor={`api-key-value-${apiKey.id}`} className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">API Key</Label>
          <div className="flex items-center gap-2 mt-0.5">
            <Input
              id={`api-key-value-${apiKey.id}`}
              type="text"
              readOnly
              value={isVisible ? apiKey.key : maskApiKey(apiKey.key)}
              className="flex-1 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono h-8 border-gray-300 dark:border-gray-600"
            />
            <Button size="icon_sm" variant="outline" onClick={onToggleVisibility} aria-label={isVisible ? "Hide API key" : "Show API key"} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Button size="icon_sm" variant="outline" onClick={onCopy} aria-label="Copy API key" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <p className="font-medium dark:text-gray-200">{new Date(apiKey.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Last Used:</span>
            <p className="font-medium dark:text-gray-200">{apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString() : 'Never'}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Requests:</span>
            <p className="font-medium dark:text-gray-200">{(apiKey.requestCount || 0).toLocaleString()}</p>
          </div>
          {apiKey.expiresAt && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Expires:</span>
              <p className={`font-medium dark:text-gray-200 ${new Date(apiKey.expiresAt) < new Date() ? 'text-red-500 dark:text-red-400' : ''}`}>
                {new Date(apiKey.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Usage</span>
            <span className={`text-xs font-semibold ${getUsageProgressColor(apiKey.usage || 0).replace('bg-', 'text-')}`}>{apiKey.usage || 0}%</span>
          </div>
          <Progress value={apiKey.usage || 0} className={`h-1.5 ${getUsageProgressColor(apiKey.usage || 0)}`} />
        </div>


        <div className="flex items-center gap-2 mt-4 pt-3 border-t dark:border-gray-700">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1 text-xs sm:text-sm dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
            <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
          <Button size="sm" variant="destructive_outline" onClick={onDelete} className="flex-1 text-xs sm:text-sm">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
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
    // permissions: [], // Add permissions/scopes selection if needed
    expiresInDays: '30', // Default to 30 days
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Construct payload, potentially converting expiresInDays to an ISO date
      const payload = { ...formData };
      if (payload.expiresInDays && payload.expiresInDays !== 'never') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(payload.expiresInDays, 10));
        payload.expiresAt = expiryDate.toISOString();
      } else {
        payload.expiresAt = null; // Explicitly null for never expires
      }
      delete payload.expiresInDays; // Remove temporary field

      await apiService.createAdminApiKey(payload);
      // Toast.success('API key created successfully'); // Assuming global toast
      console.log('API key created successfully (Toast placeholder)');
      if(onRefresh) onRefresh();
      onClose();
    } catch (error) {
      // Toast.error('Failed to create API key');
      console.error('Failed to create API key (Toast placeholder)', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div>
        <Label htmlFor="create-key-name" className="block text-sm font-medium mb-1 dark:text-gray-300">Key Name</Label>
        <Input
          id="create-key-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Mobile App Production Key"
          required
          className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        />
      </div>
      <div>
        <Label htmlFor="create-key-description" className="block text-sm font-medium mb-1 dark:text-gray-300">Description (Optional)</Label>
        <Input
          id="create-key-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Briefly describe what this key is for"
          className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        />
      </div>
      <div>
        <Label htmlFor="create-key-expires" className="block text-sm font-medium mb-1 dark:text-gray-300">Expires In</Label>
        <Select
          value={formData.expiresInDays}
          onValueChange={(value) => setFormData(prev => ({ ...prev, expiresInDays: value }))}
          id="create-key-expires"
        >
          <SelectTrigger className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            <SelectValue placeholder="Select expiration" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
            <SelectItem value="never">Never expires</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Add Permissions/Scopes section here if needed */}
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
          Create API Key
        </Button>
      </DialogFooter>
    </form>
  );
};

// Edit API Key Form Component
const EditApiKeyForm = ({ apiKey, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: apiKey.name || '',
    description: apiKey.description || '',
    status: apiKey.status || 'active',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateAdminApiKey(apiKey.id, formData);
      // Toast.success('API key updated successfully');
      console.log('API key updated successfully (Toast placeholder)');
      if(onRefresh) onRefresh();
      onClose();
    } catch (error) {
      // Toast.error('Failed to update API key');
      console.error('Failed to update API key (Toast placeholder)', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div>
        <Label htmlFor="edit-key-name" className="block text-sm font-medium mb-1 dark:text-gray-300">Key Name</Label>
        <Input
          id="edit-key-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter API key name"
          required
          className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        />
      </div>
      <div>
        <Label htmlFor="edit-key-description" className="block text-sm font-medium mb-1 dark:text-gray-300">Description (Optional)</Label>
        <Input
          id="edit-key-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter description"
          className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        />
      </div>
      <div>
        <Label htmlFor="edit-key-status" className="block text-sm font-medium mb-1 dark:text-gray-300">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          id="edit-key-status"
        >
          <SelectTrigger className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600">
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            {/* Expired is usually system-set, not user-set */}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
          Update API Key
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ApiKeyManagementSection;