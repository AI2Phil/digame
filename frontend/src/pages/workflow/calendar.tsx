import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Video,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Repeat,
  AlertCircle,
  CheckCircle,
  Edit3,
  Trash2,
  ExternalLink,
  Download,
  Share2,
  MoreHorizontal,
} from 'lucide-react';

// UI Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({
  children,
  className = '',
  size = 'default',
  variant = 'default',
  onClick,
  disabled,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
  };
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = '', variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 bg-white text-gray-700',
    destructive: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const WorkflowCalendar = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockData = {
    overview: {
      todayEvents: 8,
      thisWeekEvents: 23,
      upcomingDeadlines: 5,
      conflictingMeetings: 2,
      freeTimeToday: '3.5 hours',
      utilizationRate: 78,
    },
    events: [
      {
        id: 1,
        title: 'Sprint Planning Meeting',
        description: 'Plan tasks for the upcoming 2-week sprint',
        startTime: '2024-03-15T09:00:00',
        endTime: '2024-03-15T10:30:00',
        type: 'meeting',
        location: 'Conference Room A',
        attendees: ['Alex Johnson', 'Sarah Chen', 'Mike Rodriguez'],
        organizer: 'Emily Davis',
        status: 'confirmed',
        priority: 'high',
        recurring: true,
        reminders: ['15 minutes', '1 hour'],
        meetingLink: 'https://zoom.us/j/123456789',
        project: 'Product Development',
      },
      {
        id: 2,
        title: 'Code Review Session',
        description: 'Review pull requests and discuss implementation',
        startTime: '2024-03-15T14:00:00',
        endTime: '2024-03-15T15:00:00',
        type: 'work_block',
        location: 'Virtual',
        attendees: ['Alex Johnson', 'Tom Wilson'],
        organizer: 'Alex Johnson',
        status: 'confirmed',
        priority: 'medium',
        recurring: false,
        reminders: ['10 minutes'],
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
        project: 'Backend API',
      },
      {
        id: 3,
        title: 'Client Presentation',
        description: 'Present Q1 progress and roadmap to stakeholders',
        startTime: '2024-03-15T16:00:00',
        endTime: '2024-03-15T17:00:00',
        type: 'presentation',
        location: 'Main Conference Room',
        attendees: ['Leadership Team', 'Client Representatives'],
        organizer: 'Sarah Chen',
        status: 'tentative',
        priority: 'high',
        recurring: false,
        reminders: ['30 minutes', '1 hour', '1 day'],
        project: 'Client Project Alpha',
      },
      {
        id: 4,
        title: 'Focus Time: Development',
        description: 'Dedicated time for feature implementation',
        startTime: '2024-03-15T10:30:00',
        endTime: '2024-03-15T12:00:00',
        type: 'focus_time',
        location: 'Desk',
        attendees: ['Alex Johnson'],
        organizer: 'Alex Johnson',
        status: 'confirmed',
        priority: 'medium',
        recurring: true,
        reminders: ['5 minutes'],
        project: 'Feature Development',
      },
    ],
    integrations: [
      {
        id: 1,
        name: 'Google Calendar',
        type: 'calendar',
        status: 'connected',
        lastSync: '2024-03-15T08:30:00',
        eventsCount: 156,
        icon: 'google',
      },
      {
        id: 2,
        name: 'Microsoft Outlook',
        type: 'calendar',
        status: 'connected',
        lastSync: '2024-03-15T08:25:00',
        eventsCount: 89,
        icon: 'microsoft',
      },
      {
        id: 3,
        name: 'Zoom',
        type: 'video_conferencing',
        status: 'connected',
        lastSync: '2024-03-15T08:00:00',
        meetingsCount: 45,
        icon: 'zoom',
      },
      {
        id: 4,
        name: 'Slack',
        type: 'communication',
        status: 'connected',
        lastSync: '2024-03-15T08:35:00',
        notificationsCount: 23,
        icon: 'slack',
      },
    ],
    analytics: {
      timeDistribution: {
        meetings: 45,
        focusTime: 30,
        breaks: 15,
        administrative: 10,
      },
      productivityMetrics: {
        averageMeetingLength: '47 minutes',
        focusTimeBlocks: 12,
        meetingFreeHours: 4.5,
        utilizationRate: 78,
      },
      weeklyTrends: {
        totalHours: 42,
        meetingHours: 18.5,
        focusHours: 16.5,
        efficiency: 85,
      },
    },
    suggestions: [
      {
        id: 1,
        type: 'schedule_optimization',
        title: 'Consolidate Similar Meetings',
        description: 'You have 3 separate code review sessions this week. Consider combining them.',
        impact: 'Save 1.5 hours',
        confidence: 85,
      },
      {
        id: 2,
        type: 'focus_time',
        title: 'Add Focus Time Block',
        description: 'Your calendar shows no dedicated focus time on Thursday.',
        impact: 'Improve productivity',
        confidence: 92,
      },
      {
        id: 3,
        type: 'meeting_preparation',
        title: 'Prepare for Client Presentation',
        description: 'High-priority meeting in 2 hours with no preparation time scheduled.',
        impact: 'Reduce stress',
        confidence: 95,
      },
    ],
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCurrentData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEventAction = (eventId, action) => {
    console.log(`${action} event:`, eventId);
  };

  const handleCreateEvent = () => {
    console.log('Creating new event');
  };

  const handleViewChange = view => {
    setActiveView(view);
  };

  const handleDateNavigation = direction => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getEventTypeColor = type => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'work_block':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'presentation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'focus_time':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'tentative':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = dateString => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar & Scheduling</h1>
            <p className="text-gray-600 mt-2">Manage your time and optimize your schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Calendar Settings
            </Button>
            <Button onClick={handleCreateEvent}>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentData.overview.todayEvents}
            </div>
            <div className="text-sm text-gray-600">Today's Events</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {currentData.overview.thisWeekEvents}
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentData.overview.upcomingDeadlines}
            </div>
            <div className="text-sm text-gray-600">Deadlines</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {currentData.overview.conflictingMeetings}
            </div>
            <div className="text-sm text-gray-600">Conflicts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {currentData.overview.freeTimeToday}
            </div>
            <div className="text-sm text-gray-600">Free Time</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {currentData.overview.utilizationRate}%
            </div>
            <div className="text-sm text-gray-600">Utilization</div>
          </Card>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => handleDateNavigation('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button size="sm" variant="ghost" onClick={() => handleDateNavigation('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {['day', 'week', 'month'].map(view => (
              <Button
                key={view}
                size="sm"
                variant={activeView === view ? 'default' : 'outline'}
                onClick={() => handleViewChange(view)}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {activeView === 'day' && 'Daily Schedule'}
                {activeView === 'week' && 'Weekly View'}
                {activeView === 'month' && 'Monthly Overview'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeView === 'day' && (
                <div className="space-y-2">
                  {currentData.events
                    .filter(
                      event =>
                        new Date(event.startTime).toDateString() === selectedDate.toDateString()
                    )
                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                    .map(event => (
                      <div
                        key={event.id}
                        className={`p-4 rounded-lg border-l-4 ${getEventTypeColor(event.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{event.title}</h4>
                              <Badge className={getPriorityColor(event.priority)}>
                                {event.priority}
                              </Badge>
                              <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </span>
                                <span>({formatDuration(event.startTime, event.endTime)})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{event.attendees.length} attendees</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-4">
                            {event.meetingLink && (
                              <Button size="sm" variant="ghost">
                                <Video className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEventAction(event.id, 'edit')}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {activeView === 'week' && (
                <div className="text-center text-gray-500 py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Weekly calendar view would be displayed here</p>
                  <p className="text-sm mt-2">Interactive week grid with time slots and events</p>
                </div>
              )}

              {activeView === 'month' && (
                <div className="text-center text-gray-500 py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Monthly calendar view would be displayed here</p>
                  <p className="text-sm mt-2">Full month grid with event indicators</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Smart Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.suggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm text-blue-900">{suggestion.title}</h5>
                        <p className="text-xs text-blue-700 mt-1">{suggestion.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-blue-600">{suggestion.impact}</span>
                          <Button size="sm" className="h-6 text-xs">
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connected Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.integrations.map(integration => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{integration.name}</div>
                        <div className="text-xs text-gray-500">
                          Last sync: {new Date(integration.lastSync).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        integration.status === 'connected'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {integration.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Focus Time
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Find Meeting Time
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Reminder
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Calendar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Time Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Meetings</span>
                    <span>{currentData.analytics.timeDistribution.meetings}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${currentData.analytics.timeDistribution.meetings}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Focus Time</span>
                    <span>{currentData.analytics.timeDistribution.focusTime}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${currentData.analytics.timeDistribution.focusTime}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Breaks</span>
                    <span>{currentData.analytics.timeDistribution.breaks}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${currentData.analytics.timeDistribution.breaks}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Administrative</span>
                    <span>{currentData.analytics.timeDistribution.administrative}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${currentData.analytics.timeDistribution.administrative}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCalendar;
