import React, { useState } from 'react';
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, Filter, 
  Search, Settings, Archive, Star, Clock, AlertCircle,
  Info, CheckCircle, XCircle, Zap, Calendar, Users,
  TrendingUp, Target, Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Separator } from '../components/ui/Separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/DropdownMenu';
import { Checkbox } from '../components/ui/Checkbox';
import { Switch } from '../components/ui/Switch';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../components/ui/ContextMenu';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'goal',
      title: 'Goal Completed!',
      message: 'You\'ve successfully completed your daily productivity goal of 8 hours.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      starred: true,
      priority: 'high',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Break Reminder',
      message: 'You\'ve been working for 2 hours. Time to take a 15-minute break!',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      read: false,
      starred: false,
      priority: 'medium',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'New Achievement Unlocked',
      message: 'Congratulations! You\'ve earned the "Focus Master" badge for maintaining focus for 4+ hours.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      starred: false,
      priority: 'low',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: '4',
      type: 'team',
      title: 'Team Update',
      message: 'Sarah Johnson shared a new productivity report with your team.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      read: true,
      starred: false,
      priority: 'medium',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: '5',
      type: 'system',
      title: 'Weekly Report Ready',
      message: 'Your weekly productivity report is now available for download.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true,
      starred: false,
      priority: 'low',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: '6',
      type: 'alert',
      title: 'Low Productivity Alert',
      message: 'Your productivity score has dropped below your target. Consider reviewing your goals.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      starred: false,
      priority: 'high',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]);

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const starredCount = notifications.filter(n => n.starred).length;

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'unread' && !notification.read) ||
                       (filterRead === 'read' && notification.read);
    return matchesSearch && matchesType && matchesRead;
  });

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleMarkAsUnread = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: false } : n
    ));
  };

  const handleToggleStar = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, starred: !n.starred } : n
    ));
  };

  const handleDelete = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'markRead':
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, read: true } : n
        ));
        break;
      case 'markUnread':
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, read: false } : n
        ));
        break;
      case 'delete':
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
        break;
      case 'star':
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, starred: true } : n
        ));
        break;
    }
    setSelectedNotifications([]);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your productivity insights</p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-2 py-1">
                {unreadCount} unread
              </Badge>
            )}
            {starredCount > 0 && (
              <Badge variant="secondary" className="px-2 py-1">
                {starredCount} starred
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedNotifications.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions ({selectedNotifications.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction('markRead')}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('markUnread')}>
                  <Bell className="mr-2 h-4 w-4" />
                  Mark as Unread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('star')}>
                  <Star className="mr-2 h-4 w-4" />
                  Add to Starred
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filter by Type */}
            <div className="w-full md:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <option value="all">All Types</option>
                <option value="goal">Goals</option>
                <option value="reminder">Reminders</option>
                <option value="achievement">Achievements</option>
                <option value="team">Team</option>
                <option value="system">System</option>
                <option value="alert">Alerts</option>
              </Select>
            </div>
            
            {/* Filter by Read Status */}
            <div className="w-full md:w-48">
              <Select value={filterRead} onValueChange={setFilterRead}>
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </Select>
            </div>
            
            {/* Select All */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label className="text-sm">Select All</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">All Notifications</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* All Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' || filterRead !== 'all' 
                      ? 'Try adjusting your filters or search terms'
                      : 'You\'re all caught up! No new notifications.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = notification.icon;
              const isSelected = selectedNotifications.includes(notification.id);
              
              return (
                <ContextMenu key={notification.id}>
                  <ContextMenuTrigger>
                    <Card className={`transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedNotifications([...selectedNotifications, notification.id]);
                              } else {
                                setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                              }
                            }}
                          />
                          
                          <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                            <IconComponent className={`h-5 w-5 ${notification.color}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                  {notification.starred && (
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  )}
                                  {getPriorityBadge(notification.priority)}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span>{formatTimestamp(notification.timestamp)}</span>
                                  <span className="capitalize">{notification.type}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStar(notification.id)}
                                >
                                  <Star className={`h-4 w-4 ${notification.starred ? 'text-yellow-500 fill-current' : ''}`} />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => notification.read ? handleMarkAsUnread(notification.id) : handleMarkAsRead(notification.id)}
                                >
                                  {notification.read ? <BellOff className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(notification.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ContextMenuTrigger>
                  
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => notification.read ? handleMarkAsUnread(notification.id) : handleMarkAsRead(notification.id)}>
                      {notification.read ? <BellOff className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                      Mark as {notification.read ? 'Unread' : 'Read'}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleToggleStar(notification.id)}>
                      <Star className="mr-2 h-4 w-4" />
                      {notification.starred ? 'Remove from' : 'Add to'} Starred
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleDelete(notification.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })
          )}
        </TabsContent>

        {/* Starred Notifications */}
        <TabsContent value="starred" className="space-y-4">
          {notifications.filter(n => n.starred).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No starred notifications</h3>
                  <p className="text-muted-foreground">
                    Star important notifications to find them easily later.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            notifications.filter(n => n.starred).map((notification) => {
              const IconComponent = notification.icon;
              
              return (
                <Card key={notification.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${notification.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">{notification.title}</h3>
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStar(notification.id)}
                          >
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="font-medium">Notification Channels</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">Play sound for new notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.soundEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Quiet Hours */}
              <div className="space-y-4">
                <h4 className="font-medium">Quiet Hours</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Quiet Hours</Label>
                    <p className="text-sm text-muted-foreground">Disable notifications during specified hours</p>
                  </div>
                  <Switch
                    checked={notificationSettings.quietHours}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, quietHours: checked }))
                    }
                  />
                </div>
                
                {notificationSettings.quietHours && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={notificationSettings.quietStart}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({ ...prev, quietStart: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={notificationSettings.quietEnd}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({ ...prev, quietEnd: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Notification Categories */}
              <div className="space-y-4">
                <h4 className="font-medium">Notification Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'goals', label: 'Goal Achievements', icon: Target },
                    { key: 'reminders', label: 'Break Reminders', icon: Clock },
                    { key: 'achievements', label: 'Achievements', icon: Star },
                    { key: 'team', label: 'Team Updates', icon: Users },
                    { key: 'system', label: 'System Notifications', icon: Settings },
                    { key: 'alerts', label: 'Performance Alerts', icon: AlertCircle }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Label>{label}</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;