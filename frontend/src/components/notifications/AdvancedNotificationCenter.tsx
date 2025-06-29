import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Bell, BellRing, Mail, MessageSquare, AlertTriangle, Info,
  CheckCircle, Clock, Settings, Filter, Search, Archive,
  Trash2, MoreHorizontal, Users, Globe, Smartphone,
  Calendar, TrendingUp, BarChart3, Eye, EyeOff
} from 'lucide-react';

interface NotificationMetrics {
  total_notifications: number;
  unread_count: number;
  critical_alerts: number;
  delivery_rate: number;
  engagement_rate: number;
  channels: {
    email: number;
    sms: number;
    push: number;
    in_app: number;
    webhook: number;
  };
  categories: {
    security: number;
    system: number;
    business: number;
    social: number;
    updates: number;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'security' | 'system' | 'business' | 'social' | 'updates';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'archived';
  timestamp: string;
  sender: string;
  channels: string[];
  actions?: {
    label: string;
    action: string;
  }[];
  metadata?: {
    source?: string;
    tags?: string[];
    related_entities?: string[];
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  trigger: string;
  channels: string[];
  enabled: boolean;
  recipients: number;
  last_sent: string;
  success_rate: number;
}

interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  priority: string;
  channels: string[];
  recipients: string[];
  enabled: boolean;
  created_date: string;
  last_triggered: string;
}

export const AdvancedNotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'templates' | 'rules' | 'analytics' | 'settings'>('inbox');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [metrics, setMetrics] = useState<NotificationMetrics>({
    total_notifications: 1247,
    unread_count: 23,
    critical_alerts: 3,
    delivery_rate: 98.5,
    engagement_rate: 67.2,
    channels: {
      email: 456,
      sms: 123,
      push: 234,
      in_app: 389,
      webhook: 45
    },
    categories: {
      security: 89,
      system: 234,
      business: 456,
      social: 123,
      updates: 345
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Critical Security Alert',
      message: 'Multiple failed login attempts detected from suspicious IP address',
      category: 'security',
      priority: 'critical',
      status: 'unread',
      timestamp: '2024-02-28T10:30:00Z',
      sender: 'Security System',
      channels: ['email', 'sms', 'push'],
      actions: [
        { label: 'Block IP', action: 'block_ip' },
        { label: 'Investigate', action: 'investigate' }
      ],
      metadata: {
        source: 'threat_detection',
        tags: ['security', 'authentication', 'suspicious_activity'],
        related_entities: ['user:john.doe', 'ip:192.168.1.100']
      }
    },
    {
      id: '2',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance window for database upgrades on March 1st, 2024',
      category: 'system',
      priority: 'medium',
      status: 'unread',
      timestamp: '2024-02-28T09:15:00Z',
      sender: 'System Administrator',
      channels: ['email', 'in_app'],
      actions: [
        { label: 'View Details', action: 'view_details' },
        { label: 'Reschedule', action: 'reschedule' }
      ]
    },
    {
      id: '3',
      title: 'Revenue Milestone Achieved',
      message: 'Monthly recurring revenue has exceeded $100K target',
      category: 'business',
      priority: 'high',
      status: 'read',
      timestamp: '2024-02-28T08:45:00Z',
      sender: 'Analytics Engine',
      channels: ['email', 'push'],
      actions: [
        { label: 'View Report', action: 'view_report' },
        { label: 'Share', action: 'share' }
      ]
    },
    {
      id: '4',
      title: 'New Team Member Joined',
      message: 'Sarah Johnson has joined the Engineering team',
      category: 'social',
      priority: 'low',
      status: 'read',
      timestamp: '2024-02-28T08:00:00Z',
      sender: 'HR System',
      channels: ['in_app'],
      actions: [
        { label: 'Welcome', action: 'send_welcome' },
        { label: 'View Profile', action: 'view_profile' }
      ]
    },
    {
      id: '5',
      title: 'Platform Update Available',
      message: 'Version 2.1.0 is now available with new features and security improvements',
      category: 'updates',
      priority: 'medium',
      status: 'unread',
      timestamp: '2024-02-28T07:30:00Z',
      sender: 'Update Service',
      channels: ['email', 'in_app'],
      actions: [
        { label: 'Update Now', action: 'update' },
        { label: 'Release Notes', action: 'release_notes' }
      ]
    }
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Security Alert Template',
      category: 'Security',
      trigger: 'security_event',
      channels: ['email', 'sms', 'push'],
      enabled: true,
      recipients: 12,
      last_sent: '2024-02-28T10:30:00Z',
      success_rate: 98.5
    },
    {
      id: '2',
      name: 'System Maintenance Notice',
      category: 'System',
      trigger: 'maintenance_scheduled',
      channels: ['email', 'in_app'],
      enabled: true,
      recipients: 156,
      last_sent: '2024-02-28T09:15:00Z',
      success_rate: 99.2
    },
    {
      id: '3',
      name: 'Welcome New User',
      category: 'Onboarding',
      trigger: 'user_created',
      channels: ['email', 'in_app'],
      enabled: true,
      recipients: 23,
      last_sent: '2024-02-28T08:00:00Z',
      success_rate: 97.8
    }
  ]);

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Critical Security Events',
      condition: 'security_score < 50 OR failed_logins > 5',
      priority: 'critical',
      channels: ['email', 'sms', 'push'],
      recipients: ['security-team@company.com', 'admin@company.com'],
      enabled: true,
      created_date: '2024-01-15',
      last_triggered: '2024-02-28T10:30:00Z'
    },
    {
      id: '2',
      name: 'System Performance Alerts',
      condition: 'cpu_usage > 80% OR memory_usage > 90%',
      priority: 'high',
      channels: ['email', 'webhook'],
      recipients: ['devops-team@company.com'],
      enabled: true,
      created_date: '2024-01-20',
      last_triggered: '2024-02-27T15:45:00Z'
    },
    {
      id: '3',
      name: 'Business Milestone Notifications',
      condition: 'revenue_growth > 10% OR new_customers > 50',
      priority: 'medium',
      channels: ['email', 'in_app'],
      recipients: ['leadership@company.com', 'sales@company.com'],
      enabled: true,
      created_date: '2024-02-01',
      last_triggered: '2024-02-28T08:45:00Z'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time notifications
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: 'New System Alert',
        message: 'System performance metrics updated',
        category: 'system',
        priority: 'low',
        status: 'unread',
        timestamp: new Date().toISOString(),
        sender: 'Monitoring System',
        channels: ['in_app']
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      setMetrics(prev => ({
        ...prev,
        unread_count: prev.unread_count + 1,
        total_notifications: prev.total_notifications + 1
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'read' as const }
          : notification
      )
    );
    setMetrics(prev => ({
      ...prev,
      unread_count: Math.max(0, prev.unread_count - 1)
    }));
  };

  const handleArchive = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'archived' as const }
          : notification
      )
    );
  };

  const handleDelete = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const handleToggleTemplate = (templateId: string) => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? { ...template, enabled: !template.enabled }
          : template
      )
    );
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(rule =>
        rule.id === ruleId
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return AlertTriangle;
      case 'system': return Settings;
      case 'business': return TrendingUp;
      case 'social': return Users;
      case 'updates': return Info;
      default: return Bell;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const renderInbox = () => (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.total_notifications}</p>
              </div>
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{metrics.unread_count}</p>
              </div>
              <BellRing className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.critical_alerts}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">{metrics.delivery_rate}%</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.engagement_rate}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="security">Security</option>
          <option value="system">System</option>
          <option value="business">Business</option>
          <option value="social">Social</option>
          <option value="updates">Updates</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const CategoryIcon = getCategoryIcon(notification.category);
          return (
            <Card key={notification.id} className={`${notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${notification.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h3>
                        <Badge 
                          variant={notification.priority === 'critical' ? 'error' : notification.priority === 'high' ? 'warning' : 'default'}
                          size="sm"
                          icon={null}
                          onRemove={() => {}}
                        >
                          {notification.priority}
                        </Badge>
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-gray-600">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{notification.sender}</span>
                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          {notification.channels.map((channel, index) => (
                            <Badge key={index} variant="default" size="sm" icon={null} onRemove={() => {}}>
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {notification.actions && (
                        <div className="flex items-center gap-2 pt-2">
                          {notification.actions.map((action, index) => (
                            <Button key={index} variant="outline" size="sm">
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {notification.status === 'unread' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(notification.id)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notification Templates</h2>
        <Button>
          <Bell className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{template.name}</h3>
                    <Badge 
                      variant={template.enabled ? 'success' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {template.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <span className="text-sm text-gray-500">{template.category}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Trigger: {template.trigger}</span>
                    <span>Recipients: {template.recipients}</span>
                    <span>Success Rate: {template.success_rate}%</span>
                    <span>Last Sent: {new Date(template.last_sent).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Channels:</span>
                    {template.channels.map((channel, index) => (
                      <Badge key={index} variant="default" size="sm" icon={null} onRemove={() => {}}>
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleTemplate(template.id)}
                  >
                    {template.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notification Rules</h2>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{rule.name}</h3>
                    <Badge 
                      variant={rule.enabled ? 'success' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge 
                      variant={rule.priority === 'critical' ? 'error' : rule.priority === 'high' ? 'warning' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {rule.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                    {rule.condition}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Created: {new Date(rule.created_date).toLocaleDateString()}</span>
                    <span>Last Triggered: {new Date(rule.last_triggered).toLocaleDateString()}</span>
                    <span>Recipients: {rule.recipients.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Channels:</span>
                    {rule.channels.map((channel, index) => (
                      <Badge key={index} variant="default" size="sm" icon={null} onRemove={() => {}}>
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRule(rule.id)}
                  >
                    {rule.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Notification Center</h1>
          <p className="text-gray-600">Comprehensive notification management and delivery system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLoading(!loading)}>
            <Bell className={`h-4 w-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'inbox', label: 'Inbox', icon: Bell },
            { id: 'templates', label: 'Templates', icon: Mail },
            { id: 'rules', label: 'Rules', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'inbox' && metrics.unread_count > 0 && (
                  <Badge variant="error" size="sm" icon={null} onRemove={() => {}}>
                    {metrics.unread_count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'inbox' && renderInbox()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'rules' && renderRules()}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Analytics</h3>
            <p className="text-gray-600">Advanced analytics and reporting interface coming soon</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Settings</h3>
            <p className="text-gray-600">Global notification configuration interface coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedNotificationCenter;