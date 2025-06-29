import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Settings, Save, RotateCcw, Download, Upload, 
  Shield, Database, Globe, Mail, Bell, Key,
  Users, Building2, Zap, Activity, Clock,
  CheckCircle, XCircle, AlertTriangle, Eye,
  EyeOff, Copy, Edit, Trash2, Plus, Search,
  Filter, RefreshCw, Play, Pause, Monitor,
  Lock, Unlock, Server, HardDrive, Wifi
} from 'lucide-react';

interface SystemConfig {
  id: string;
  category: string;
  name: string;
  description: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'password';
  required: boolean;
  sensitive: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  last_modified: string;
  modified_by: string;
  restart_required: boolean;
}

interface ConfigCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  config_count: number;
  last_updated: string;
}

interface ConfigBackup {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  config_count: number;
  file_size: number;
  status: 'active' | 'archived';
}

interface SystemStatus {
  uptime: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  pending_restarts: string[];
  last_backup: string;
  configuration_health: 'healthy' | 'warning' | 'critical';
}

export const SystemConfigurationDashboard: React.FC = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [categories, setCategories] = useState<ConfigCategory[]>([]);
  const [backups, setBackups] = useState<ConfigBackup[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'backups' | 'monitoring'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [editingConfig, setEditingConfig] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigurationData();
  }, []);

  const fetchConfigurationData = async () => {
    try {
      setLoading(true);
      
      const [configsRes, categoriesRes, backupsRes, statusRes] = await Promise.all([
        fetch('/api/system/configuration', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/system/configuration/categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/system/configuration/backups', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/system/status', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (configsRes.ok) {
        const data = await configsRes.json();
        setConfigs(data.configurations || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }

      if (backupsRes.ok) {
        const data = await backupsRes.json();
        setBackups(data.backups || []);
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setSystemStatus(data);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration data');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = async (configId: string, value: any) => {
    try {
      const response = await fetch(`/api/system/configuration/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ value })
      });

      if (response.ok) {
        await fetchConfigurationData();
        setPendingChanges(prev => {
          const updated = { ...prev };
          delete updated[configId];
          return updated;
        });
        setEditingConfig(null);
      }
    } catch (err) {
      console.error('Failed to update configuration:', err);
    }
  };

  const handleCreateBackup = async (name: string, description: string) => {
    try {
      const response = await fetch('/api/system/configuration/backups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, description })
      });

      if (response.ok) {
        await fetchConfigurationData();
      }
    } catch (err) {
      console.error('Failed to create backup:', err);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current configuration.')) {
      return;
    }

    try {
      const response = await fetch(`/api/system/configuration/backups/${backupId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchConfigurationData();
        alert('Configuration restored successfully. System restart may be required.');
      }
    } catch (err) {
      console.error('Failed to restore backup:', err);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'security': return Shield;
      case 'database': return Database;
      case 'network': return Globe;
      case 'email': return Mail;
      case 'notifications': return Bell;
      case 'authentication': return Key;
      case 'users': return Users;
      case 'platform': return Building2;
      case 'performance': return Zap;
      case 'monitoring': return Activity;
      case 'system': return Server;
      default: return Settings;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatValue = (config: SystemConfig) => {
    if (config.sensitive && !showSensitive[config.id]) {
      return '••••••••••••••••';
    }

    switch (config.type) {
      case 'boolean':
        return config.value ? 'Enabled' : 'Disabled';
      case 'array':
        return Array.isArray(config.value) ? config.value.join(', ') : '';
      case 'object':
        return JSON.stringify(config.value, null, 2);
      default:
        return String(config.value);
    }
  };

  const filteredConfigs = configs.filter(config => {
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    const matchesSearch = config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* System Status */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 relative">
                  <div className="w-full h-full rounded-full bg-gray-200">
                    <div 
                      className={`w-full h-full rounded-full ${systemStatus.cpu_usage > 80 ? 'bg-red-500' : systemStatus.cpu_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ 
                        background: `conic-gradient(${systemStatus.cpu_usage > 80 ? '#ef4444' : systemStatus.cpu_usage > 60 ? '#eab308' : '#22c55e'} ${systemStatus.cpu_usage * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <Monitor className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">CPU Usage</p>
                <p className="text-lg font-bold text-gray-900">{systemStatus.cpu_usage}%</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 relative">
                  <div className="w-full h-full rounded-full bg-gray-200">
                    <div 
                      className={`w-full h-full rounded-full ${systemStatus.memory_usage > 80 ? 'bg-red-500' : systemStatus.memory_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ 
                        background: `conic-gradient(${systemStatus.memory_usage > 80 ? '#ef4444' : systemStatus.memory_usage > 60 ? '#eab308' : '#22c55e'} ${systemStatus.memory_usage * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <HardDrive className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">Memory Usage</p>
                <p className="text-lg font-bold text-gray-900">{systemStatus.memory_usage}%</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wifi className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Active Connections</p>
                <p className="text-lg font-bold text-gray-900">{systemStatus.active_connections}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Uptime</p>
                <p className="text-lg font-bold text-gray-900">{Math.floor(systemStatus.uptime / 3600)}h</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Configuration Health</h4>
                <p className="text-sm text-gray-600">Overall system configuration status</p>
              </div>
              <Badge 
                variant={systemStatus.configuration_health === 'healthy' ? 'success' : systemStatus.configuration_health === 'warning' ? 'warning' : 'error'} 
                size="sm"
                icon={null}
                onRemove={() => {}}
              >
                {systemStatus.configuration_health}
              </Badge>
            </div>

            {systemStatus.pending_restarts.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Restart Required</h4>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  The following services require restart to apply configuration changes:
                </p>
                <div className="flex flex-wrap gap-1">
                  {systemStatus.pending_restarts.map((service) => (
                    <Badge key={service} variant="warning" size="xs" icon={null} onRemove={() => {}}>
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuration Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.id);
              return (
                <div
                  key={category.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setActiveTab('configuration');
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{category.config_count} settings</span>
                    <span className="text-gray-600">Updated {new Date(category.last_updated).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Configuration Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configs.slice(0, 5).map((config) => (
              <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{config.name}</h4>
                  <p className="text-sm text-gray-600">Modified by {config.modified_by}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{new Date(config.last_modified).toLocaleDateString()}</p>
                  {config.restart_required && (
                    <Badge variant="warning" size="xs" icon={null} onRemove={() => {}}>
                      Restart Required
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConfigurationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search configurations..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <Button onClick={() => handleCreateBackup('Manual Backup', 'Manual configuration backup')}>
            <Save className="h-4 w-4 mr-2" />
            Backup
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredConfigs.map((config) => (
          <Card key={config.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{config.name}</h4>
                    {config.required && (
                      <Badge variant="error" size="xs" icon={null} onRemove={() => {}}>
                        Required
                      </Badge>
                    )}
                    {config.sensitive && (
                      <Badge variant="warning" size="xs" icon={null} onRemove={() => {}}>
                        Sensitive
                      </Badge>
                    )}
                    {config.restart_required && (
                      <Badge variant="info" size="xs" icon={null} onRemove={() => {}}>
                        Restart Required
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {editingConfig === config.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        {config.type === 'boolean' ? (
                          <select
                            value={pendingChanges[config.id] !== undefined ? String(pendingChanges[config.id]) : String(config.value)}
                            onChange={(e) => setPendingChanges({...pendingChanges, [config.id]: e.target.value === 'true'})}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                          </select>
                        ) : config.validation?.options ? (
                          <select
                            value={pendingChanges[config.id] !== undefined ? pendingChanges[config.id] : config.value}
                            onChange={(e) => setPendingChanges({...pendingChanges, [config.id]: e.target.value})}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            {config.validation.options.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={config.type === 'password' ? 'password' : config.type === 'number' ? 'number' : 'text'}
                            value={pendingChanges[config.id] !== undefined ? pendingChanges[config.id] : config.value}
                            onChange={(e) => setPendingChanges({...pendingChanges, [config.id]: config.type === 'number' ? Number(e.target.value) : e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        )}
                        <Button 
                          size="sm" 
                          onClick={() => handleConfigUpdate(config.id, pendingChanges[config.id] !== undefined ? pendingChanges[config.id] : config.value)}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingConfig(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                          {formatValue(config)}
                        </code>
                        {config.sensitive && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowSensitive({...showSensitive, [config.id]: !showSensitive[config.id]})}
                          >
                            {showSensitive[config.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(String(config.value))}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium capitalize">{config.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-medium capitalize">{config.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Modified:</span>
                      <span className="ml-2 font-medium">{new Date(config.last_modified).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Modified By:</span>
                      <span className="ml-2 font-medium">{config.modified_by}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingConfig(editingConfig === config.id ? null : config.id)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {editingConfig === config.id ? 'Cancel' : 'Edit'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBackupsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Configuration Backups</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => handleCreateBackup('Manual Backup', 'Manual configuration backup')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {backups.map((backup) => (
          <Card key={backup.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{backup.name}</h4>
                    <Badge 
                      variant={backup.status === 'active' ? 'success' : 'outline'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {backup.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{backup.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">{new Date(backup.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created By:</span>
                      <span className="ml-2 font-medium">{backup.created_by}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Configurations:</span>
                      <span className="ml-2 font-medium">{backup.config_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-2 font-medium">{(backup.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRestoreBackup(backup.id)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuration Monitoring</h3>
      
      {/* Configuration Drift Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Drift Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">No Configuration Drift Detected</h4>
                  <p className="text-sm text-green-700">All configurations match expected values</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-3 w-3 mr-1" />
                Check Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configs.slice(0, 10).map((config, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <div>
                    <h4 className="font-medium text-gray-900">{config.name} updated</h4>
                    <p className="text-sm text-gray-600">Modified by {config.modified_by}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{new Date(config.last_modified).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Configuration</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchConfigurationData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">System Configuration</h1>
            <p className="text-gray-600">Manage system settings, backups, and monitoring</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Monitor },
                { id: 'configuration', label: 'Configuration', icon: Settings },
                { id: 'backups', label: 'Backups', icon: Save },
                { id: 'monitoring', label: 'Monitoring', icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'configuration' && renderConfigurationTab()}
          {activeTab === 'backups' && renderBackupsTab()}
          {activeTab === 'monitoring' && renderMonitoringTab()}
        </div>
      </div>
    </div>
  );
};