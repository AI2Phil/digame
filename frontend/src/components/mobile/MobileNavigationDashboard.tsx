import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Menu, X, Home, Shield, BarChart3, Zap, 
  Building2, Users, UserPlus, Webhook, Monitor,
  Bell, Search, Settings, LogOut, ChevronRight,
  Activity, AlertTriangle, CheckCircle, Clock,
  MessageSquare, Target, Briefcase, Globe
} from 'lucide-react';

interface MobileNavItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'error' | 'info';
  description: string;
  path: string;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

export const MobileNavigationDashboard: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'notifications' | 'search'>('dashboard');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMobileData();
  }, []);

  const fetchMobileData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/mobile/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load mobile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems: MobileNavItem[] = [
    {
      id: 'overview',
      title: 'Dashboard',
      icon: Home,
      description: 'Platform overview and quick stats',
      path: '/dashboard'
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      badge: '3',
      badgeVariant: 'warning',
      description: 'Threat monitoring and MFA setup',
      path: '/dashboard/security'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      badge: '+15%',
      badgeVariant: 'success',
      description: 'Revenue insights and predictions',
      path: '/dashboard/analytics'
    },
    {
      id: 'workflows',
      title: 'Workflows',
      icon: Zap,
      badge: '23',
      badgeVariant: 'info',
      description: 'Automation and process management',
      path: '/dashboard/workflows'
    },
    {
      id: 'platform',
      title: 'Platform',
      icon: Building2,
      description: 'Multi-tenant management',
      path: '/dashboard/platform'
    },
    {
      id: 'social',
      title: 'Social',
      icon: MessageSquare,
      badge: '5',
      badgeVariant: 'info',
      description: 'Collaboration and mentorship',
      path: '/dashboard/social'
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      icon: UserPlus,
      description: 'User setup and goal setting',
      path: '/dashboard/onboarding'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: Webhook,
      badge: '12',
      badgeVariant: 'success',
      description: 'Third-party connections',
      path: '/dashboard/integrations'
    },
    {
      id: 'performance',
      title: 'Performance',
      icon: Monitor,
      badge: '99.9%',
      badgeVariant: 'success',
      description: 'System health monitoring',
      path: '/dashboard/performance'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'new-workflow',
      title: 'New Workflow',
      icon: Zap,
      color: 'bg-purple-500',
      action: () => console.log('Create workflow')
    },
    {
      id: 'security-scan',
      title: 'Security Scan',
      icon: Shield,
      color: 'bg-green-500',
      action: () => console.log('Run security scan')
    },
    {
      id: 'add-integration',
      title: 'Add Integration',
      icon: Webhook,
      color: 'bg-blue-500',
      action: () => console.log('Add integration')
    },
    {
      id: 'view-analytics',
      title: 'View Reports',
      icon: BarChart3,
      color: 'bg-orange-500',
      action: () => console.log('View analytics')
    }
  ];

  const handleNotificationRead = async (notificationId: string) => {
    try {
      await fetch(`/api/mobile/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return X;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const renderDashboardSection = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-center">{action.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                onClick={() => window.location.href = item.path}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant || 'info'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">All Systems Operational</span>
              </div>
              <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                Healthy
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Uptime:</span>
                <span className="ml-2 font-medium">99.9%</span>
              </div>
              <div>
                <span className="text-gray-600">Response:</span>
                <span className="ml-2 font-medium">45ms</span>
              </div>
              <div>
                <span className="text-gray-600">Users:</span>
                <span className="ml-2 font-medium">1,247</span>
              </div>
              <div>
                <span className="text-gray-600">Alerts:</span>
                <span className="ml-2 font-medium">0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <Button size="sm" variant="outline">
          Mark All Read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            return (
              <Card 
                key={notification.id} 
                className={`cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
                onClick={() => handleNotificationRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <IconComponent className={`h-5 w-5 mt-0.5 ${getNotificationColor(notification.type)}`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <span className="text-xs text-gray-500">{notification.timestamp}</span>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSearchSection = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features, data, or help..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {searchQuery ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Search results for "{searchQuery}" would appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['Security threats', 'Revenue analytics', 'Workflow templates', 'System health'].map((term) => (
                <Button
                  key={term}
                  size="sm"
                  variant="outline"
                  onClick={() => setSearchQuery(term)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {[
                { icon: Shield, text: 'Security scan completed', time: '2m ago' },
                { icon: Zap, text: 'Workflow executed', time: '15m ago' },
                { icon: Users, text: 'New user onboarded', time: '1h ago' }
              ].map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700 flex-1">{activity.text}</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Digame</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Button>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          <Button
            variant={activeSection === 'dashboard' ? 'primary' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-12"
            onClick={() => setActiveSection('dashboard')}
          >
            <Home className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
          </Button>
          
          <Button
            variant={activeSection === 'notifications' ? 'primary' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-12 relative"
            onClick={() => setActiveSection('notifications')}
          >
            <Bell className="h-4 w-4" />
            <span className="text-xs">Alerts</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </Button>
          
          <Button
            variant={activeSection === 'search' ? 'primary' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-12"
            onClick={() => setActiveSection('search')}
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Search</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-col gap-1 h-12"
            onClick={() => console.log('Profile')}
          >
            <Users className="h-4 w-4" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-20">
        {activeSection === 'dashboard' && renderDashboardSection()}
        {activeSection === 'notifications' && renderNotificationsSection()}
        {activeSection === 'search' && renderSearchSection()}
      </div>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button size="sm" variant="outline" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      window.location.href = item.path;
                      setIsMenuOpen(false);
                    }}
                  >
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{item.title}</span>
                    {item.badge && (
                      <Badge 
                        variant={item.badgeVariant || 'info'} 
                        size="xs"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <Button variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};