import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
  Smartphone, Wifi, WifiOff, Download, Upload, RefreshCw as Sync,
  Bell, Settings, Globe, Monitor, Tablet, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle, Info,
  Battery, Signal, HardDrive, Eye, Play, Pause,
  Share, Star, Heart, Bookmark, Search, Filter,
import {
  BarChart3, PieChart, TrendingUp, Activity, Zap
} from 'lucide-react';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  serviceWorkerStatus: 'active' | 'installing' | 'waiting' | 'redundant' | 'none';
  cacheStatus: 'updated' | 'outdated' | 'empty';
  lastSync: string;
  offlineCapabilities: string[];
  installPromptAvailable: boolean;
}

interface OfflineData {
  id: string;
  type: 'dashboard' | 'report' | 'user_data' | 'settings' | 'cache';
  name: string;
  size: number;
  lastUpdated: string;
  status: 'synced' | 'pending' | 'conflict' | 'error';
  priority: 'high' | 'medium' | 'low';
}

interface NotificationSettings {
  id: string;
  type: 'push' | 'badge' | 'sound' | 'vibration';
  name: string;
  description: string;
  enabled: boolean;
  categories: string[];
}

interface PWAMetrics {
  installRate: number;
  engagementScore: number;
  offlineUsage: number;
  pushNotificationClickRate: number;
  averageSessionDuration: number;
  returnVisitRate: number;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenSize: string;
  connectionType: string;
  batteryLevel?: number;
  isCharging?: boolean;
}

export const PWADashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'offline' | 'notifications' | 'install' | 'metrics'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pwaStatus, setPwaStatus] = useState<PWAStatus | null>(null);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings[]>([]);
  const [pwaMetrics, setPwaMetrics] = useState<PWAMetrics | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  // Mock data - replace with actual API calls and PWA APIs
  useEffect(() => {
    const fetchPWAData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls and PWA status checks
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check PWA status
        setPwaStatus({
          isInstalled: 'standalone' in window.navigator || window.matchMedia('(display-mode: standalone)').matches,
          isOnline: navigator.onLine,
          serviceWorkerStatus: 'serviceWorker' in navigator ? 'active' : 'none',
          cacheStatus: 'updated',
          lastSync: new Date(Date.now() - 300000).toISOString(),
          offlineCapabilities: ['Dashboard View', 'Reports', 'User Settings', 'Basic Analytics'],
          installPromptAvailable: true
        });

        // Device information
        setDeviceInfo({
          type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
          os: navigator.platform,
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other',
          screenSize: `${window.screen.width}x${window.screen.height}`,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown',
          batteryLevel: 85,
          isCharging: false
        });

        setOfflineData([
          {
            id: '1',
            type: 'dashboard',
            name: 'Main Dashboard Data',
            size: 2.4,
            lastUpdated: new Date(Date.now() - 300000).toISOString(),
            status: 'synced',
            priority: 'high'
          },
          {
            id: '2',
            type: 'report',
            name: 'Analytics Reports',
            size: 5.7,
            lastUpdated: new Date(Date.now() - 600000).toISOString(),
            status: 'pending',
            priority: 'medium'
          },
          {
            id: '3',
            type: 'user_data',
            name: 'User Preferences',
            size: 0.3,
            lastUpdated: new Date(Date.now() - 900000).toISOString(),
            status: 'synced',
            priority: 'high'
          },
          {
            id: '4',
            type: 'cache',
            name: 'Static Assets',
            size: 12.1,
            lastUpdated: new Date(Date.now() - 1800000).toISOString(),
            status: 'synced',
            priority: 'low'
          },
          {
            id: '5',
            type: 'settings',
            name: 'App Configuration',
            size: 0.1,
            lastUpdated: new Date(Date.now() - 3600000).toISOString(),
            status: 'conflict',
            priority: 'medium'
          }
        ]);

        setNotificationSettings([
          {
            id: '1',
            type: 'push',
            name: 'Push Notifications',
            description: 'Receive notifications even when the app is closed',
            enabled: true,
            categories: ['alerts', 'updates', 'reminders']
          },
          {
            id: '2',
            type: 'badge',
            name: 'App Badge',
            description: 'Show notification count on app icon',
            enabled: true,
            categories: ['unread_count', 'pending_tasks']
          },
          {
            id: '3',
            type: 'sound',
            name: 'Sound Alerts',
            description: 'Play sound for important notifications',
            enabled: false,
            categories: ['critical_alerts', 'system_warnings']
          },
          {
            id: '4',
            type: 'vibration',
            name: 'Vibration',
            description: 'Vibrate device for notifications',
            enabled: true,
            categories: ['urgent_alerts', 'reminders']
          }
        ]);

        setPwaMetrics({
          installRate: 23.5,
          engagementScore: 87.2,
          offlineUsage: 15.8,
          pushNotificationClickRate: 12.4,
          averageSessionDuration: 8.5,
          returnVisitRate: 68.9
        });

        setError(null);
      } catch (err) {
        setError('Failed to load PWA data');
        console.error('Error fetching PWA data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPWAData();

    // Listen for online/offline events
    const handleOnline = () => {
      setPwaStatus(prev => prev ? { ...prev, isOnline: true } : null);
    };
    
    const handleOffline = () => {
      setPwaStatus(prev => prev ? { ...prev, isOnline: false } : null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': case 'active': case 'updated': return 'text-green-600 bg-green-100';
      case 'pending': case 'installing': case 'waiting': return 'text-yellow-600 bg-yellow-100';
      case 'conflict': case 'error': case 'redundant': return 'text-red-600 bg-red-100';
      case 'outdated': case 'empty': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': case 'active': case 'updated': return CheckCircle;
      case 'pending': case 'installing': case 'waiting': return Clock;
      case 'conflict': case 'error': case 'redundant': return XCircle;
      case 'outdated': case 'empty': return AlertTriangle;
      default: return Info;
    }
  };

  const handleInstallPWA = async () => {
    try {
      // This would trigger the PWA install prompt
      console.log('Installing PWA...');
      // In a real implementation, you'd use the beforeinstallprompt event
    } catch (err) {
      console.error('Error installing PWA:', err);
    }
  };

  const handleSyncData = async (dataId?: string) => {
    try {
      console.log('Syncing data...', dataId);
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (dataId) {
        setOfflineData(prev => prev.map(item => 
          item.id === dataId ? { ...item, status: 'synced', lastUpdated: new Date().toISOString() } : item
        ));
      } else {
        setOfflineData(prev => prev.map(item => ({ 
          ...item, 
          status: 'synced', 
          lastUpdated: new Date().toISOString() 
        })));
      }
    } catch (err) {
      console.error('Error syncing data:', err);
    }
  };

  const handleNotificationToggle = (settingId: string) => {
    setNotificationSettings(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* PWA Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PWA Status</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pwaStatus?.isInstalled ? 'Installed' : 'Web App'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connection</p>
                <p className="text-2xl font-bold text-green-600">
                  {pwaStatus?.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                {pwaStatus?.isOnline ? (
                  <Wifi className="h-6 w-6 text-green-600" />
                ) : (
                  <WifiOff className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Worker</p>
                <p className="text-2xl font-bold text-purple-600">
                  {pwaStatus?.serviceWorkerStatus || 'None'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Status</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pwaStatus?.cacheStatus || 'Unknown'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <HardDrive className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Information */}
      {deviceInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Device Type</p>
                <p className="font-medium text-gray-900">{deviceInfo.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Operating System</p>
                <p className="font-medium text-gray-900">{deviceInfo.os}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Browser</p>
                <p className="font-medium text-gray-900">{deviceInfo.browser}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Screen Size</p>
                <p className="font-medium text-gray-900">{deviceInfo.screenSize}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Connection</p>
                <p className="font-medium text-gray-900">{deviceInfo.connectionType}</p>
              </div>
              {deviceInfo.batteryLevel && (
                <div>
                  <p className="text-sm text-gray-600">Battery</p>
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{deviceInfo.batteryLevel}%</span>
                    {deviceInfo.isCharging && <Zap className="h-3 w-3 text-green-600" />}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PWA Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            Offline Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pwaStatus?.offlineCapabilities.map((capability, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-900">{capability}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          className="h-16 flex flex-col items-center justify-center gap-2"
          onClick={handleInstallPWA}
          disabled={pwaStatus?.isInstalled || !pwaStatus?.installPromptAvailable}
        >
          <Download className="h-5 w-5" />
          <span className="text-sm">Install App</span>
        </Button>
        
        <Button 
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
          onClick={() => handleSyncData()}
        >
          <Sync className="h-5 w-5" />
          <span className="text-sm">Sync All Data</span>
        </Button>
        
        <Button 
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Bell className="h-5 w-5" />
          <span className="text-sm">Test Notification</span>
        </Button>
        
        <Button 
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          <span className="text-sm">Update Cache</span>
        </Button>
      </div>
    </div>
  );

  const renderOfflineTab = () => (
    <div className="space-y-6">
      {/* Offline Data Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Offline Data Management</h3>
        <div className="flex items-center gap-3">
          <Badge 
            variant={pwaStatus?.isOnline ? 'success' : 'error'} 
            size="sm"
            icon={null}
            onRemove={() => {}}
          >
            {pwaStatus?.isOnline ? 'Online' : 'Offline'}
          </Badge>
          <Button size="sm" onClick={() => handleSyncData()}>
            <Sync className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      {/* Offline Data List */}
      <div className="space-y-3">
        {offlineData.map((data) => {
          const StatusIcon = getStatusIcon(data.status);
          return (
            <Card key={data.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(data.status).split(' ')[0]}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{data.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Size: {data.size} MB</span>
                        <span>Type: {data.type.replace('_', ' ')}</span>
                        <span>Updated: {new Date(data.lastUpdated).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={data.priority === 'high' ? 'error' : data.priority === 'medium' ? 'warning' : 'secondary'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {data.priority}
                    </Badge>
                    <Badge 
                      variant={data.status === 'synced' ? 'success' : data.status === 'pending' ? 'warning' : 'error'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {data.status}
                    </Badge>
                    {data.status !== 'synced' && (
                      <Button size="sm" variant="outline" onClick={() => handleSyncData(data.id)}>
                        <Sync className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Offline Data</span>
              <span className="font-medium">{offlineData.reduce((sum, item) => sum + item.size, 0).toFixed(1)} MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="text-sm text-gray-500">
              45% of available offline storage used
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Notifications Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <Button size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Test Notification
        </Button>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4">
        {notificationSettings.map((setting) => (
          <Card key={setting.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{setting.name}</h4>
                    <Badge 
                      variant={setting.enabled ? 'success' : 'secondary'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {setting.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {setting.categories.map((category) => (
                      <Badge key={category} variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {category.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={setting.enabled ? 'primary' : 'outline'}
                  onClick={() => handleNotificationToggle(setting.id)}
                >
                  {setting.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notification Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Browser Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Notification Permission</h4>
                <p className="text-sm text-gray-600">Allow the app to send notifications</p>
              </div>
              <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                Granted
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Background Sync</h4>
                <p className="text-sm text-gray-600">Sync data when the app is closed</p>
              </div>
              <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                Supported
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Push Messaging</h4>
                <p className="text-sm text-gray-600">Receive push notifications from server</p>
              </div>
              <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInstallTab = () => (
    <div className="space-y-6">
      {/* Installation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            PWA Installation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            {pwaStatus?.isInstalled ? (
              <div>
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">App Installed</h3>
                <p className="text-gray-600 mb-4">
                  The Digame app is installed and ready to use offline
                </p>
                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share App
                </Button>
              </div>
            ) : (
              <div>
                <Smartphone className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Install Digame App</h3>
                <p className="text-gray-600 mb-4">
                  Install the app for a better experience with offline access and notifications
                </p>
                <Button 
                  onClick={handleInstallPWA}
                  disabled={!pwaStatus?.installPromptAvailable}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Installation Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>App Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <WifiOff className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Offline Access</h4>
                <p className="text-sm text-gray-600">Use core features without internet connection</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Bell className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Get notified of important updates</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Faster Loading</h4>
                <p className="text-sm text-gray-600">Instant app startup and navigation</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Smartphone className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Native Feel</h4>
                <p className="text-sm text-gray-600">App-like experience on your device</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Installation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Chrome (Desktop)</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Click the install icon in the address bar</li>
                <li>Click "Install" in the popup dialog</li>
                <li>The app will be added to your desktop and start menu</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Safari (iOS)</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Tap the share button in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Chrome (Android)</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Tap the menu button (three dots)</li>
                <li>Select "Add to Home screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      {/* PWA Metrics Overview */}
      {pwaMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Install Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{pwaMetrics.installRate}%</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                  <p className="text-2xl font-bold text-green-600">{pwaMetrics.engagementScore}%</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offline Usage</p>
                  <p className="text-2xl font-bold text-purple-600">{pwaMetrics.offlineUsage}%</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <WifiOff className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Push Click Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{pwaMetrics.pushNotificationClickRate}%</p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Session</p>
                  <p className="text-2xl font-bold text-teal-600">{pwaMetrics.averageSessionDuration}m</p>
                </div>
                <div className="p-3 rounded-full bg-teal-100">
                  <Clock className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Return Rate</p>
                  <p className="text-2xl font-bold text-indigo-600">{pwaMetrics.returnVisitRate}%</p>
                </div>
                <div className="p-3 rounded-full bg-indigo-100">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Installation Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Prompt Shown</span>
                <span className="font-medium">1,247 users</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Clicked Install</span>
                <span className="font-medium">456 users (36.6%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '36.6%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed Install</span>
                <span className="font-medium">293 users (23.5%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '23.5%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Offline Mode</span>
                <span className="font-medium">15.8% of sessions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Push Notifications</span>
                <span className="font-medium">67.3% enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Background Sync</span>
                <span className="font-medium">89.1% active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Home Screen Icon</span>
                <span className="font-medium">78.4% usage</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">2.3s</div>
              <div className="text-sm text-gray-600">Faster Load Time</div>
              <div className="text-xs text-gray-500">vs web version</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">45%</div>
              <div className="text-sm text-gray-600">Less Data Usage</div>
              <div className="text-xs text-gray-500">with caching</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">92%</div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
              <div className="text-xs text-gray-500">app experience</div>
            </div>
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
          <p className="text-gray-600">Loading PWA data...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading PWA Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Progressive Web App</h1>
            <p className="text-gray-600">App-like experience with offline capabilities</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Smartphone },
                { id: 'offline', label: 'Offline Data', icon: WifiOff },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'install', label: 'Installation', icon: Download },
                { id: 'metrics', label: 'Metrics', icon: BarChart3 },
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
          {activeTab === 'offline' && renderOfflineTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'install' && renderInstallTab()}
          {activeTab === 'metrics' && renderMetricsTab()}
        </div>
      </div>
    </div>
  );
};