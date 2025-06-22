import React, { useState, useEffect } from 'react';
import { 
  Bell, BellRing, X, Check, Settings, 
  Trophy, Target, AlertTriangle, Users,
  Clock, Filter, MoreHorizontal, Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Toast } from '../ui/Toast';
import { Switch } from '../ui/Switch'; // Added import
import { Label } from '../ui/Label';   // Added import
import notificationService from '../../services/notificationService';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState({ total: 0, unread: 0, byType: {} });

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      updateStats();
    }

    // Subscribe to notification events
    const unsubscribers = [
      notificationService.on('notificationAdded', handleNotificationAdded),
      notificationService.on('notificationRead', handleNotificationRead),
      notificationService.on('notificationsCleared', handleNotificationsCleared)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isOpen, filter]);

  const loadNotifications = () => {
    const filterOptions = filter === 'unread' ? { unreadOnly: true } : 
                         filter !== 'all' ? { type: filter } : {};
    
    const notifs = notificationService.getNotifications(filterOptions);
    setNotifications(notifs);
  };

  const updateStats = () => {
    const newStats = notificationService.getStats();
    setStats(newStats);
  };

  const handleNotificationAdded = (notification) => {
    loadNotifications();
    updateStats();
  };

  const handleNotificationRead = (notification) => {
    loadNotifications();
    updateStats();
  };

  const handleNotificationsCleared = () => {
    loadNotifications();
    updateStats();
  };

  const handleMarkAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        notificationService.markAsRead(notification.id);
      }
    });
    Toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    notificationService.clearAll();
    Toast.success('All notifications cleared');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Handle specific notification actions
    switch (notification.type) {
      case 'achievement':
        // Navigate to achievements page
        window.location.href = '/profile?tab=achievements';
        break;
      case 'goal_progress':
        // Navigate to goals page
        window.location.href = '/profile?tab=goals';
        break;
      case 'system_alert':
        // Navigate to admin dashboard
        window.location.href = '/admin';
        break;
      default:
        break;
    }
    
    onClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement': return Trophy;
      case 'goal_progress': return Target;
      case 'system_alert': return AlertTriangle;
      case 'user_activity': return Users;
      default: return Bell;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'critical') return 'text-red-600 bg-red-100';
    if (priority === 'high') return 'text-orange-600 bg-orange-100';
    
    switch (type) {
      case 'achievement': return 'text-yellow-600 bg-yellow-100';
      case 'goal_progress': return 'text-blue-600 bg-blue-100';
      case 'system_alert': return 'text-red-600 bg-red-100';
      case 'user_activity': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filterOptions = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'unread', label: 'Unread', count: stats.unread },
    { value: 'achievement', label: 'Achievements', count: stats.byType.achievement || 0 },
    { value: 'goal_progress', label: 'Goals', count: stats.byType.goal_progress || 0 },
    { value: 'system_alert', label: 'Alerts', count: stats.byType.system_alert || 0 }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-end">
      <div className="bg-white w-96 h-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {stats.unread > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.unread}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread ({stats.unread})
              </TabsTrigger>
              <TabsTrigger value="achievement" className="text-xs">
                <Trophy className="w-3 h-3" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={stats.unread === 0}
              >
                <Check className="w-3 h-3 mr-1" />
                Mark All Read
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAll}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  getIcon={getNotificationIcon}
                  getColor={getNotificationColor}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
          )}
        </div>

        {/* Settings Dialog */}
        <NotificationSettingsDialog
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  onClick, 
  onMarkAsRead, 
  getIcon, 
  getColor, 
  formatTimeAgo 
}) => {
  const Icon = getIcon(notification.type);
  const colorClasses = getColor(notification.type, notification.priority);

  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${colorClasses}`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.timestamp)}
              </span>
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead();
                  }}
                  className="p-1 h-auto"
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          
          <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
            {notification.message}
          </p>
          
          {notification.priority === 'critical' && (
            <Badge variant="destructive" className="mt-2 text-xs">
              Critical
            </Badge>
          )}
          
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {notification.actions.slice(0, 2).map((action) => (
                <Button
                  key={action.id}
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle action
                  }}
                  className="text-xs"
                >
                  {action.icon} {action.title}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Notification Settings Dialog Component
const NotificationSettingsDialog = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreferences(notificationService.preferences);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await notificationService.updatePreferences(preferences);
      onClose();
    } catch (error) {
      Toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Customize how you receive notifications
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Notification Types</h4>
            
            <SettingToggle
              label="Achievement Notifications"
              description="Get notified when you unlock achievements"
              checked={preferences.achievements}
              onChange={() => handleToggle('achievements')}
            />
            
            <SettingToggle
              label="Goal Progress Updates"
              description="Receive updates on your goal progress"
              checked={preferences.goalProgress}
              onChange={() => handleToggle('goalProgress')}
            />
            
            <SettingToggle
              label="System Alerts"
              description="Important system notifications and alerts"
              checked={preferences.systemAlerts}
              onChange={() => handleToggle('systemAlerts')}
            />
            
            <SettingToggle
              label="Social Activity"
              description="Notifications about connections and social activity"
              checked={preferences.socialActivity}
              onChange={() => handleToggle('socialActivity')}
            />
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Delivery Methods</h4>
            
            <SettingToggle
              label="Desktop Notifications"
              description="Show notifications on your desktop"
              checked={preferences.desktop}
              onChange={() => handleToggle('desktop')}
            />
            
            <SettingToggle
              label="Sound Alerts"
              description="Play sounds for notifications"
              checked={preferences.sound}
              onChange={() => handleToggle('sound')}
            />
            
            <SettingToggle
              label="Push Notifications"
              description="Receive push notifications on mobile"
              checked={preferences.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
            
            <SettingToggle
              label="Email Digest"
              description="Weekly email summary of your activity"
              checked={preferences.emailDigest}
              onChange={() => handleToggle('emailDigest')}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Setting Toggle Component
const SettingToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <div>
      <Label className="font-medium text-sm">{label}</Label>
      {description && <p className="text-xs text-gray-600">{description}</p>}
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onChange} // The handler passed (handleToggle) doesn't take an arg, it flips state.
                                 // If handleToggle needed the new state, it would be:
                                 // onCheckedChange={(newState) => onChange(newState)}
    />
  </div>
);

export default NotificationCenter;