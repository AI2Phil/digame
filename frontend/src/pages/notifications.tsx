import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Bell,
  Check,
  Trash2,
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Clock,
} from 'lucide-react';

const NotificationsPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    weeklyDigest: true,
    instantAlerts: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings');
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data.settings }));
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const markAsRead = async notificationIds => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      setNotifications(prev =>
        prev.map(notif => (notificationIds.includes(notif.id) ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const deleteNotifications = async notificationIds => {
    try {
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      setNotifications(prev => prev.filter(notif => !notificationIds.includes(notif.id)));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const updateSettings = async newSettings => {
    try {
      await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
      });

      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const handleSelectAll = () => {
    const filteredNotifications = getFilteredNotifications();
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = notificationId => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'important':
        return notifications.filter(n => n.priority === 'high' || n.priority === 'urgent');
      case 'system':
        return notifications.filter(n => n.category === 'system');
      case 'team':
        return notifications.filter(n => n.category === 'team');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type, category) => {
    switch (type || category) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'system':
        return <SettingsIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (priority, read) => {
    if (read) return 'bg-gray-50 border-gray-200';

    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string | number | Date) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Notifications - Digame</title>
        <meta
          name="description"
          content={`Manage your notifications and preferences${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center space-x-3">
                <Bell className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-600">
                    Manage your notifications and preferences
                    {unreadCount > 0 ? ` (${unreadCount} unread)` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Bell className="w-8 h-8 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Bell className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Important</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      notifications.filter(n => n.priority === 'high' || n.priority === 'urgent')
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <SettingsIcon className="w-8 h-8 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">System</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {notifications.filter(n => n.category === 'system').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Notifications Panel */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {[
                      { id: 'all', label: 'All', count: notifications.length },
                      { id: 'unread', label: 'Unread', count: unreadCount },
                      {
                        id: 'important',
                        label: 'Important',
                        count: notifications.filter(
                          n => n.priority === 'high' || n.priority === 'urgent'
                        ).length,
                      },
                      {
                        id: 'system',
                        label: 'System',
                        count: notifications.filter(n => n.category === 'system').length,
                      },
                      {
                        id: 'team',
                        label: 'Team',
                        count: notifications.filter(n => n.category === 'team').length,
                      },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span
                            className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                              activeTab === tab.id
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Bulk Actions */}
                {filteredNotifications.length > 0 && (
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.length === filteredNotifications.length}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {selectedNotifications.length > 0
                              ? `${selectedNotifications.length} selected`
                              : 'Select all'}
                          </span>
                        </label>
                      </div>

                      {selectedNotifications.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => markAsRead(selectedNotifications)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 inline-flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark as Read</span>
                          </button>
                          <button
                            onClick={() => deleteNotifications(selectedNotifications)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 inline-flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notifications List */}
                <div className="divide-y divide-gray-200">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                      <p className="text-gray-500">
                        {activeTab === 'all'
                          ? "You're all caught up! No notifications to show."
                          : `No ${activeTab} notifications at the moment.`}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.priority, notification.read)}`}
                      >
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />

                          <div className="mt-1">
                            {getNotificationIcon(notification.type, notification.category)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4
                                className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}
                              >
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {notification.priority === 'urgent' && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    Urgent
                                  </span>
                                )}
                                {notification.priority === 'high' && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                    High
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTimeAgo(notification.timestamp)}</span>
                                </span>
                              </div>
                            </div>

                            <p
                              className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'} mb-2`}
                            >
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-xs text-gray-500">
                                  {notification.category}
                                </span>
                                {notification.actionUrl && (
                                  <button
                                    onClick={() => router.push(notification.actionUrl)}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                    {notification.actionText || 'View'}
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead([notification.id])}
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                  >
                                    Mark as read
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotifications([notification.id])}
                                  className="text-xs text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={e =>
                        updateSettings({
                          ...settings,
                          emailNotifications: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={e =>
                        updateSettings({
                          ...settings,
                          pushNotifications: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      In-App Notifications
                    </label>
                    <input
                      type="checkbox"
                      checked={settings.inAppNotifications}
                      onChange={e =>
                        updateSettings({
                          ...settings,
                          inAppNotifications: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Weekly Digest</label>
                    <input
                      type="checkbox"
                      checked={settings.weeklyDigest}
                      onChange={e =>
                        updateSettings({
                          ...settings,
                          weeklyDigest: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <hr className="my-4" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Quiet Hours</label>
                      <input
                        type="checkbox"
                        checked={settings.quietHours.enabled}
                        onChange={e =>
                          updateSettings({
                            ...settings,
                            quietHours: {
                              ...settings.quietHours,
                              enabled: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    {settings.quietHours.enabled && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={settings.quietHours.start}
                            onChange={e =>
                              updateSettings({
                                ...settings,
                                quietHours: {
                                  ...settings.quietHours,
                                  start: e.target.value,
                                },
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">End Time</label>
                          <input
                            type="time"
                            value={settings.quietHours.end}
                            onChange={e =>
                              updateSettings({
                                ...settings,
                                quietHours: {
                                  ...settings.quietHours,
                                  end: e.target.value,
                                },
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm inline-flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark All as Read</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
