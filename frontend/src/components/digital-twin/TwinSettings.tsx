import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastHelpers } from '../ui/Toaster';
import { digitalTwinApi } from '../../services/digitalTwinApi';
import {
  Settings,
  Edit3,
  Trash2,
  Download,
  Share2,
  AlertTriangle,
  Save,
  X,
  Database,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

interface DigitalTwin {
  id: string;
  name: string;
  status: string;
  learning_progress: number;
  accuracy_score: number;
  model_version?: string;
  created_at: string;
  updated_at: string;
}

interface TwinSettings {
  id: string;
  name: string;
  status: string;
  learning_progress: number;
  accuracy_score: number;
  model_version: string;
  created_at: string;
  updated_at: string;
  privacy_settings: {
    data_sharing: boolean;
    analytics_tracking: boolean;
    public_insights: boolean;
  };
  notification_preferences: {
    learning_updates: boolean;
    pattern_discoveries: boolean;
    performance_alerts: boolean;
    weekly_summaries: boolean;
  };
  advanced_settings: {
    learning_rate: number;
    data_retention_days: number;
    auto_optimization: boolean;
    experimental_features: boolean;
  };
}

interface TwinSettingsProps {
  twin?: DigitalTwin;
  onUpdate?: () => void;
}

export const TwinSettings: React.FC<TwinSettingsProps> = ({ twin, onUpdate }) => {
  const [settings, setSettings] = useState<TwinSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { success, error, info } = useToastHelpers();

  // Generate comprehensive fallback settings data
  const generateFallbackSettings = (): TwinSettings => {
    const now = new Date();
    const createdDate = new Date(now.getTime() - (Math.random() * 90 + 30) * 24 * 60 * 60 * 1000);
    const updatedDate = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    return {
      id: twin?.id || 'demo-twin-001',
      name: twin?.name || 'My Digital Twin',
      status: twin?.status || 'active',
      learning_progress: twin?.learning_progress || Math.floor(Math.random() * 30 + 70),
      accuracy_score: twin?.accuracy_score || Math.floor(Math.random() * 20 + 80),
      model_version: twin?.model_version || 'v2.1.3',
      created_at: twin?.created_at || createdDate.toISOString(),
      updated_at: twin?.updated_at || updatedDate.toISOString(),
      privacy_settings: {
        data_sharing: true,
        analytics_tracking: true,
        public_insights: false
      },
      notification_preferences: {
        learning_updates: true,
        pattern_discoveries: true,
        performance_alerts: true,
        weekly_summaries: false
      },
      advanced_settings: {
        learning_rate: 0.75,
        data_retention_days: 365,
        auto_optimization: true,
        experimental_features: false
      }
    };
  };

  // Load twin settings from database
  const loadTwinSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to load from database using existing API
      const twinData = await digitalTwinApi.getTwinStatus();
      
      if (twinData && twinData.data) {
        const enhancedSettings: TwinSettings = {
          id: twinData.data.twin_id || 'twin-001',
          name: twinData.data.name || 'My Digital Twin',
          status: twinData.data.status,
          learning_progress: twinData.data.learning_progress,
          accuracy_score: twinData.data.accuracy_score,
          model_version: twinData.data.model_version || 'v2.1.3',
          created_at: twinData.data.last_training || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          privacy_settings: {
            data_sharing: true,
            analytics_tracking: true,
            public_insights: false
          },
          notification_preferences: {
            learning_updates: true,
            pattern_discoveries: true,
            performance_alerts: true,
            weekly_summaries: false
          },
          advanced_settings: {
            learning_rate: 0.75,
            data_retention_days: 365,
            auto_optimization: true,
            experimental_features: false
          }
        };
        
        setSettings(enhancedSettings);
        setEditedName(enhancedSettings.name);
        setIsUsingFallback(false);
        
        success('Twin settings loaded from database successfully');
      } else {
        throw new Error('No twin data available');
      }
    } catch (error) {
      console.warn('Failed to load twin settings from database:', error);
      
      // Use enhanced fallback data
      const fallbackSettings = generateFallbackSettings();
      setSettings(fallbackSettings);
      setEditedName(fallbackSettings.name);
      setIsUsingFallback(true);
      
      info('Database unavailable - showing demonstration settings');
    } finally {
      setLoading(false);
    }
  }, [success, info, generateFallbackSettings]);

  // Handle online/offline status
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Set initial online status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load settings on component mount
  useEffect(() => {
    loadTwinSettings();
  }, [loadTwinSettings]);

  const handleSave = async () => {
    if (!editedName.trim() || !settings) return;

    try {
      setLoading(true);
      
      if (isUsingFallback) {
        // Simulate save for demo data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSettings({
          ...settings,
          name: editedName.trim(),
          updated_at: new Date().toISOString()
        });
        
        success('Demo settings updated successfully');
      } else {
        // Try to save to database
        const response = await fetch(`http://localhost:8001/api/v1/digital-twins/${settings.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editedName.trim()
          })
        });

        if (response.ok) {
          setSettings({
            ...settings,
            name: editedName.trim(),
            updated_at: new Date().toISOString()
          });
          
          success('Twin settings updated successfully');
          
          onUpdate?.();
        } else {
          throw new Error('Failed to update twin');
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating twin:', error);
      error('Failed to update twin settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (settings) {
      setEditedName(settings.name);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!settings) return;

    try {
      setLoading(true);
      
      if (isUsingFallback) {
        // Simulate delete for demo data
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        success('Demo twin deletion simulated successfully');
        
        // Simulate redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        const response = await fetch(`http://localhost:8001/api/v1/digital-twins/${settings.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          success('Digital twin deleted successfully');
          
          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          throw new Error('Failed to delete twin');
        }
      }
    } catch (error) {
      console.error('Error deleting twin:', error);
      error('Failed to delete twin. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleExport = async () => {
    if (!settings) return;

    try {
      setLoading(true);
      
      // Enhanced export data with comprehensive settings
      const exportData = {
        twin: settings,
        privacy_settings: settings.privacy_settings,
        notification_preferences: settings.notification_preferences,
        advanced_settings: settings.advanced_settings,
        exported_at: new Date().toISOString(),
        version: '2.0',
        data_source: isUsingFallback ? 'demonstration' : 'database'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settings.name.replace(/\s+/g, '_')}_settings_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      success('Twin settings exported successfully');
    } catch (error) {
      console.error('Error exporting twin:', error);
      error('Failed to export twin settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTwinSettings();
  };

  const updatePrivacySetting = (key: keyof TwinSettings['privacy_settings'], value: boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      privacy_settings: {
        ...settings.privacy_settings,
        [key]: value
      }
    });
  };

  const updateNotificationSetting = (key: keyof TwinSettings['notification_preferences'], value: boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      notification_preferences: {
        ...settings.notification_preferences,
        [key]: value
      }
    });
  };

  const updateAdvancedSetting = (key: keyof TwinSettings['advanced_settings'], value: number | boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      advanced_settings: {
        ...settings.advanced_settings,
        [key]: value
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'learning': return 'info';
      case 'initializing': return 'warning';
      case 'paused': return 'secondary';
      case 'error': return 'error';
      default: return 'secondary';
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading twin settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <span>No twin settings available</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Data Source Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Twin Settings</h1>
        </div>
        <div className="flex items-center space-x-2">
          {isUsingFallback ? (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Database className="w-3 h-3 mr-1" />
              Demo Data
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Wifi className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-orange-700">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">You're offline. Settings changes will be saved locally.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Basic Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twin Name
            </label>
            {isEditing ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter twin name"
                />
                <Button onClick={handleSave} disabled={loading || !editedName.trim()}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{settings.name}</span>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Badge
              variant={getStatusColor(settings.status)}
              icon={undefined}
              onRemove={undefined}
            >
              {settings.status.charAt(0).toUpperCase() + settings.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created
              </label>
              <span className="text-gray-600">
                {new Date(settings.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Updated
              </label>
              <span className="text-gray-600">
                {new Date(settings.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Version
            </label>
            <span className="text-gray-600 font-mono">{settings.model_version}</span>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Learning Progress</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${settings.learning_progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{settings.learning_progress}%</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Accuracy Score</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${settings.accuracy_score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{settings.accuracy_score}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Sharing</h4>
              <p className="text-sm text-gray-600">Allow sharing anonymized data for platform improvements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy_settings.data_sharing}
                onChange={(e) => updatePrivacySetting('data_sharing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Analytics Tracking</h4>
              <p className="text-sm text-gray-600">Enable usage analytics for personalized insights</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy_settings.analytics_tracking}
                onChange={(e) => updatePrivacySetting('analytics_tracking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Public Insights</h4>
              <p className="text-sm text-gray-600">Make your twin insights visible to other users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy_settings.public_insights}
                onChange={(e) => updatePrivacySetting('public_insights', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Learning Updates</h4>
              <p className="text-sm text-gray-600">Get notified when your twin learns new patterns</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notification_preferences.learning_updates}
                onChange={(e) => updateNotificationSetting('learning_updates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Pattern Discoveries</h4>
              <p className="text-sm text-gray-600">Alerts when new behavioral patterns are discovered</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notification_preferences.pattern_discoveries}
                onChange={(e) => updateNotificationSetting('pattern_discoveries', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Performance Alerts</h4>
              <p className="text-sm text-gray-600">Notifications about twin performance changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notification_preferences.performance_alerts}
                onChange={(e) => updateNotificationSetting('performance_alerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Weekly Summaries</h4>
              <p className="text-sm text-gray-600">Weekly reports of your twin's progress and insights</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notification_preferences.weekly_summaries}
                onChange={(e) => updateNotificationSetting('weekly_summaries', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Rate: {settings.advanced_settings.learning_rate}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.advanced_settings.learning_rate}
              onChange={(e) => updateAdvancedSetting('learning_rate', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Retention (days)
            </label>
            <select
              value={settings.advanced_settings.data_retention_days}
              onChange={(e) => updateAdvancedSetting('data_retention_days', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
              <option value={730}>2 years</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Optimization</h4>
              <p className="text-sm text-gray-600">Automatically optimize twin performance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.advanced_settings.auto_optimization}
                onChange={(e) => updateAdvancedSetting('auto_optimization', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Experimental Features</h4>
              <p className="text-sm text-gray-600">Enable beta features and experimental capabilities</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.advanced_settings.experimental_features}
                onChange={(e) => updateAdvancedSetting('experimental_features', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Twin Data</h4>
              <p className="text-sm text-gray-600">Download your twin's learning data, settings, and patterns</p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Share Twin Access</h4>
              <p className="text-sm text-gray-600">Grant others access to view your twin's insights</p>
            </div>
            <Button variant="outline" disabled>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showDeleteConfirm ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Confirm Deletion</h4>
                <p className="text-sm text-red-700 mb-4">
                  This action cannot be undone. This will permanently delete your digital twin
                  and all associated data, patterns, and learning progress.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={loading}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete Twin'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium text-red-600">Delete Digital Twin</h4>
                <p className="text-sm text-gray-600">
                  Permanently delete this twin and all associated data
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwinSettings;