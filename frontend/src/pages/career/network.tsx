import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Users,
  MessageCircle,
  Calendar,
  MapPin,
  Briefcase,
  Star,
  UserPlus,
  Send,
  Filter,
  Search,
  Globe,
  Building,
  GraduationCap,
  Award,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  Share2,
  MoreHorizontal,
  CheckCircle,
  X,
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

const Avatar = ({ src, alt, size = 'default', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Users className="h-1/2 w-1/2 text-gray-400" />
      )}
    </div>
  );
};

const CareerNetwork: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('connections');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockData = {
    overview: {
      totalConnections: 847,
      newRequests: 12,
      mutualConnections: 156,
      networkGrowth: 23,
      profileViews: 89,
      messagesSent: 34,
    },
    connections: [
      {
        id: 1,
        name: 'Sarah Johnson',
        title: 'Senior Frontend Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 23,
        connectionDate: '2024-01-15',
        status: 'connected',
        skills: ['React', 'TypeScript', 'Node.js'],
        lastActivity: '2 hours ago',
        canMessage: true,
      },
      {
        id: 2,
        name: 'Michael Chen',
        title: 'Data Science Manager',
        company: 'DataFlow Inc',
        location: 'New York, NY',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 45,
        connectionDate: '2024-02-20',
        status: 'connected',
        skills: ['Python', 'Machine Learning', 'SQL'],
        lastActivity: '1 day ago',
        canMessage: true,
      },
      {
        id: 3,
        name: 'Emily Rodriguez',
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'Austin, TX',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 12,
        connectionDate: null,
        status: 'pending',
        skills: ['Product Strategy', 'Agile', 'Analytics'],
        lastActivity: '3 days ago',
        canMessage: false,
      },
    ],
    events: [
      {
        id: 1,
        title: 'Tech Leaders Networking Mixer',
        date: '2024-03-15',
        time: '6:00 PM - 9:00 PM',
        location: 'Downtown Convention Center',
        type: 'In-person',
        attendees: 156,
        price: 'Free',
        organizer: 'Tech Community SF',
        description: 'Connect with fellow tech professionals and industry leaders',
        tags: ['Networking', 'Technology', 'Leadership'],
        registered: false,
      },
      {
        id: 2,
        title: 'AI & Machine Learning Summit',
        date: '2024-03-22',
        time: '9:00 AM - 5:00 PM',
        location: 'Virtual Event',
        type: 'Virtual',
        attendees: 2500,
        price: '$99',
        organizer: 'AI Institute',
        description: 'Latest trends and innovations in artificial intelligence',
        tags: ['AI', 'Machine Learning', 'Innovation'],
        registered: true,
      },
      {
        id: 3,
        title: 'Women in Tech Breakfast',
        date: '2024-03-18',
        time: '8:00 AM - 10:00 AM',
        location: 'Tech Hub Coworking',
        type: 'In-person',
        attendees: 45,
        price: 'Free',
        organizer: 'Women in Tech Network',
        description: 'Monthly breakfast meetup for women in technology',
        tags: ['Women in Tech', 'Networking', 'Career'],
        registered: false,
      },
    ],
    mentorship: [
      {
        id: 1,
        name: 'Dr. James Wilson',
        title: 'VP of Engineering',
        company: 'MegaTech Corp',
        avatar: '/api/placeholder/40/40',
        expertise: ['Technical Leadership', 'System Architecture', 'Team Management'],
        experience: '15+ years',
        rating: 4.9,
        sessions: 127,
        price: '$150/hour',
        availability: 'Available',
        bio: 'Experienced engineering leader with expertise in scaling teams and systems',
      },
      {
        id: 2,
        name: 'Lisa Park',
        title: 'Senior Product Manager',
        company: 'InnovateCo',
        avatar: '/api/placeholder/40/40',
        expertise: ['Product Strategy', 'User Research', 'Go-to-Market'],
        experience: '10+ years',
        rating: 4.8,
        sessions: 89,
        price: '$120/hour',
        availability: 'Busy',
        bio: 'Product leader specializing in B2B SaaS and user-centered design',
      },
    ],
    recommendations: [
      {
        id: 1,
        type: 'connection',
        name: 'Alex Thompson',
        title: 'DevOps Engineer',
        company: 'CloudTech',
        reason: "Works at companies you're interested in",
        mutualConnections: 8,
        avatar: '/api/placeholder/40/40',
      },
      {
        id: 2,
        type: 'event',
        title: 'React Developer Meetup',
        date: '2024-03-20',
        reason: 'Based on your skills and interests',
        attendees: 78,
      },
      {
        id: 3,
        type: 'mentor',
        name: 'Rachel Kim',
        title: 'Engineering Director',
        reason: 'Matches your career goals',
        rating: 4.9,
      },
    ],
    analytics: {
      profileViews: {
        thisWeek: 23,
        lastWeek: 18,
        growth: 27.8,
      },
      connectionGrowth: {
        thisMonth: 15,
        lastMonth: 12,
        growth: 25.0,
      },
      networkReach: 12500,
      industryRanking: 'Top 15%',
    },
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCurrentData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleConnect = userId => {
    console.log('Connecting to user:', userId);
  };

  const handleMessage = userId => {
    console.log('Messaging user:', userId);
  };

  const handleRegisterEvent = eventId => {
    console.log('Registering for event:', eventId);
  };

  const handleBookMentor = mentorId => {
    console.log('Booking mentor:', mentorId);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suggested':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = type => {
    switch (type) {
      case 'Virtual':
        return 'bg-blue-100 text-blue-800';
      case 'In-person':
        return 'bg-green-100 text-green-800';
      case 'Hybrid':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Professional Network</h1>
            <p className="text-gray-600 mt-2">
              Build meaningful connections and advance your career
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Find Connections
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentData.overview.totalConnections}
            </div>
            <div className="text-sm text-gray-600">Connections</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentData.overview.newRequests}
            </div>
            <div className="text-sm text-gray-600">New Requests</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {currentData.overview.mutualConnections}
            </div>
            <div className="text-sm text-gray-600">Mutual</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {currentData.overview.networkGrowth}%
            </div>
            <div className="text-sm text-gray-600">Growth</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {currentData.overview.profileViews}
            </div>
            <div className="text-sm text-gray-600">Profile Views</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {currentData.overview.messagesSent}
            </div>
            <div className="text-sm text-gray-600">Messages</div>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'connections', label: 'My Network', icon: Users },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'mentorship', label: 'Mentorship', icon: GraduationCap },
            { id: 'recommendations', label: 'Suggestions', icon: Star },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      {(activeTab === 'connections' || activeTab === 'events') && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={
                activeTab === 'connections' ? 'Search connections...' : 'Search events...'
              }
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={e => setSelectedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {activeTab === 'connections' ? (
              <>
                <option value="all">All Connections</option>
                <option value="recent">Recent</option>
                <option value="mutual">Mutual Connections</option>
                <option value="company">Same Company</option>
              </>
            ) : (
              <>
                <option value="all">All Events</option>
                <option value="virtual">Virtual</option>
                <option value="in-person">In-person</option>
                <option value="free">Free</option>
              </>
            )}
          </select>
        </div>
      )}

      {/* Content */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          {currentData.connections.map(connection => (
            <Card key={connection.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar src={connection.avatar} alt={connection.name} size="lg" />

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{connection.name}</h3>
                        <p className="text-sm text-gray-600">{connection.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Building className="h-4 w-4" />
                          <span>{connection.company}</span>
                          <MapPin className="h-4 w-4 ml-2" />
                          <span>{connection.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <Badge className={getStatusColor(connection.status)}>
                          {connection.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{connection.mutualConnections} mutual connections</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Active {connection.lastActivity}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {connection.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {connection.status === 'connected' ? (
                      <>
                        <Button size="sm" onClick={() => handleMessage(connection.id)}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </>
                    ) : connection.status === 'pending' ? (
                      <Button size="sm" variant="outline" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Pending
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleConnect(connection.id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          {currentData.events.map(event => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-600">by {event.organizer}</p>
                    </div>

                    <p className="text-sm text-gray-700">{event.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                      <Badge variant="outline">{event.price}</Badge>
                      {event.registered && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Registered
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {event.registered ? (
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Registered
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleRegisterEvent(event.id)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Register
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'mentorship' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentData.mentorship.map(mentor => (
            <Card key={mentor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar src={mentor.avatar} alt={mentor.name} size="lg" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{mentor.name}</h3>
                      <p className="text-sm text-gray-600">{mentor.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Building className="h-4 w-4" />
                        <span>{mentor.company}</span>
                      </div>
                    </div>
                    <Badge
                      className={
                        mentor.availability === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {mentor.availability}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700">{mentor.bio}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Experience</div>
                      <div className="font-medium">{mentor.experience}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Sessions</div>
                      <div className="font-medium">{mentor.sessions}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Rating</div>
                      <div className="font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" />
                        {mentor.rating}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Rate</div>
                      <div className="font-medium text-blue-600">{mentor.price}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Expertise</div>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleBookMentor(mentor.id)}
                      disabled={mentor.availability !== 'Available'}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {currentData.recommendations.map(rec => (
            <Card key={rec.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {rec.type === 'connection' && (
                      <>
                        <Avatar src={rec.avatar} alt={rec.name} size="lg" />
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">{rec.name}</h3>
                            <p className="text-sm text-gray-600">
                              {rec.title} at {rec.company}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700">{rec.reason}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span>{rec.mutualConnections} mutual connections</span>
                          </div>
                        </div>
                      </>
                    )}

                    {rec.type === 'event' && (
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{rec.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(rec.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{rec.reason}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>{rec.attendees} attendees</span>
                        </div>
                      </div>
                    )}

                    {rec.type === 'mentor' && (
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{rec.name}</h3>
                          <p className="text-sm text-gray-600">{rec.title}</p>
                        </div>
                        <p className="text-sm text-gray-700">{rec.reason}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{rec.rating} rating</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {rec.type === 'connection' && (
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                    {rec.type === 'event' && (
                      <Button size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Register
                      </Button>
                    )}
                    {rec.type === 'mentor' && (
                      <Button size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Profile Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Profile Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {currentData.analytics.profileViews.thisWeek}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">This Week</div>
                  <div className="text-xs text-green-600 mt-2">
                    +{currentData.analytics.profileViews.growth}% from last week
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">New Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {currentData.analytics.connectionGrowth.thisMonth}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">This Month</div>
                  <div className="text-xs text-green-600 mt-2">
                    +{currentData.analytics.connectionGrowth.growth}% from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Network Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {currentData.analytics.networkReach.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Reach</div>
                  <div className="text-xs text-blue-600 mt-2">
                    {currentData.analytics.industryRanking} in industry
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Network Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-gray-600">
                  Network growth visualization would be displayed here
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">23%</div>
                    <div className="text-gray-600">Monthly Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">156</div>
                    <div className="text-gray-600">Quality Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">89</div>
                    <div className="text-gray-600">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">34</div>
                    <div className="text-gray-600">Messages Sent</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Industry Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Top Industries in Your Network</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Technology</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: '65%' }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">65%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Finance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: '20%' }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">20%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Healthcare</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: '15%' }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">15%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Geographic Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">San Francisco Bay Area</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: '45%' }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New York</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: '25%' }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Austin</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: '15%' }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Other</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: '15%' }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CareerNetwork;
