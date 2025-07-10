import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Plus, Search, Filter, Star, Share2, Bell, Video, Globe } from 'lucide-react';

export default function NetworkingEvents() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
    date: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list or calendar

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/social/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setEvents(result.data);
      } else {
        setEvents(getMockEvents());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const getMockEvents = () => [
    {
      id: 1,
      title: 'Tech Leaders Summit 2024',
      description: 'Join industry leaders for insights on emerging technologies and digital transformation strategies.',
      date: '2024-02-15T09:00:00Z',
      endDate: '2024-02-15T17:00:00Z',
      location: 'San Francisco Convention Center',
      type: 'conference',
      format: 'in-person',
      organizer: 'TechCorp Events',
      attendees: 247,
      maxAttendees: 500,
      price: 299,
      currency: 'USD',
      tags: ['technology', 'leadership', 'innovation'],
      image: '/events/tech-summit.jpg',
      featured: true,
      registered: false
    },
    {
      id: 2,
      title: 'Remote Work Best Practices Workshop',
      description: 'Learn effective strategies for managing remote teams and maintaining productivity in distributed work environments.',
      date: '2024-02-08T14:00:00Z',
      endDate: '2024-02-08T16:00:00Z',
      location: 'Virtual Event',
      type: 'workshop',
      format: 'virtual',
      organizer: 'Remote Work Institute',
      attendees: 89,
      maxAttendees: 100,
      price: 0,
      currency: 'USD',
      tags: ['remote-work', 'management', 'productivity'],
      image: '/events/remote-workshop.jpg',
      featured: false,
      registered: true
    },
    {
      id: 3,
      title: 'AI & Machine Learning Meetup',
      description: 'Monthly meetup for AI enthusiasts to share projects, discuss latest developments, and network with peers.',
      date: '2024-02-12T18:30:00Z',
      endDate: '2024-02-12T21:00:00Z',
      location: 'Innovation Hub, Austin',
      type: 'meetup',
      format: 'in-person',
      organizer: 'Austin AI Community',
      attendees: 67,
      maxAttendees: 80,
      price: 0,
      currency: 'USD',
      tags: ['ai', 'machine-learning', 'networking'],
      image: '/events/ai-meetup.jpg',
      featured: false,
      registered: false
    },
    {
      id: 4,
      title: 'Product Management Masterclass',
      description: 'Comprehensive workshop covering product strategy, user research, and agile methodologies.',
      date: '2024-02-20T10:00:00Z',
      endDate: '2024-02-20T16:00:00Z',
      location: 'New York Business Center',
      type: 'workshop',
      format: 'hybrid',
      organizer: 'Product Excellence Academy',
      attendees: 156,
      maxAttendees: 200,
      price: 199,
      currency: 'USD',
      tags: ['product-management', 'strategy', 'agile'],
      image: '/events/pm-masterclass.jpg',
      featured: true,
      registered: false
    },
    {
      id: 5,
      title: 'Startup Pitch Night',
      description: 'Watch promising startups pitch their ideas to investors and industry experts.',
      date: '2024-02-10T19:00:00Z',
      endDate: '2024-02-10T22:00:00Z',
      location: 'Seattle Startup Hub',
      type: 'networking',
      format: 'in-person',
      organizer: 'Seattle Entrepreneurs Network',
      attendees: 134,
      maxAttendees: 150,
      price: 25,
      currency: 'USD',
      tags: ['startups', 'investing', 'entrepreneurship'],
      image: '/events/pitch-night.jpg',
      featured: false,
      registered: true
    },
    {
      id: 6,
      title: 'Women in Tech Panel Discussion',
      description: 'Inspiring panel discussion featuring successful women leaders in technology sharing their journeys and insights.',
      date: '2024-02-18T15:00:00Z',
      endDate: '2024-02-18T17:00:00Z',
      location: 'Virtual Event',
      type: 'panel',
      format: 'virtual',
      organizer: 'Women Tech Leaders',
      attendees: 298,
      maxAttendees: 500,
      price: 0,
      currency: 'USD',
      tags: ['diversity', 'leadership', 'career-development'],
      image: '/events/women-tech.jpg',
      featured: true,
      registered: false
    }
  ];

  const getEventTypeColor = (type) => {
    const colors = {
      'conference': 'bg-blue-100 text-blue-600',
      'workshop': 'bg-green-100 text-green-600',
      'meetup': 'bg-purple-100 text-purple-600',
      'networking': 'bg-orange-100 text-orange-600',
      'panel': 'bg-red-100 text-red-600'
    };
    return colors[type] || colors.meetup;
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'virtual': return <Video className="w-4 h-4" />;
      case 'hybrid': return <Globe className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const registerForEvent = (eventId) => {
    console.log(`Registering for event ${eventId}`);
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, registered: true, attendees: event.attendees + 1 }
        : event
    ));
    alert('Successfully registered for event!');
  };

  const shareEvent = (event) => {
    const shareUrl = `${window.location.origin}/social/events/${event.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Event link copied to clipboard!');
  };

  const setReminder = (eventId) => {
    console.log(`Setting reminder for event ${eventId}`);
    alert('Reminder set! You\'ll be notified before the event starts.');
  };

  const filteredEvents = events.filter(event => {
    if (filters.type !== 'all' && event.type !== filters.type) return false;
    if (filters.format !== 'all' && event.format !== filters.format) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
        <title>Networking Events - Social - Digame</title>
        <meta name="description" content="Discover and join professional networking events" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/social" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Social Hub</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Networking Events</h1>
                <p className="text-gray-600">Discover and join professional networking events</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Calendar className="w-4 h-4" />
                <span>My Events</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </button>
            </div>
          </div>

          {/* Event Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.registered).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Free Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.price === 0).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Virtual Events</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.format === 'virtual').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Video className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="conference">Conferences</option>
                  <option value="workshop">Workshops</option>
                  <option value="meetup">Meetups</option>
                  <option value="networking">Networking</option>
                  <option value="panel">Panels</option>
                </select>
                <select
                  value={filters.format}
                  onChange={(e) => setFilters({...filters, format: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Formats</option>
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <Filter className="w-4 h-4" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${event.featured ? 'ring-2 ring-blue-200' : ''}`}>
                {/* Event Image */}
                <div className="relative">
                  <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                  {event.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                  {event.registered && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-full">
                        Registered
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      {getFormatIcon(event.format)}
                      <span>{event.format}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(event.date)} - {formatTime(event.endDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees}/{event.maxAttendees} attendees</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-gray-900">
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {event.organizer}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {event.registered ? (
                      <button className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                        Registered
                      </button>
                    ) : (
                      <button 
                        onClick={() => registerForEvent(event.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Register
                      </button>
                    )}
                    <button 
                      onClick={() => setReminder(event.id)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => shareEvent(event)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}