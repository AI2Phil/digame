import React, { useState, useEffect } from 'react';
import { 
  Network, Users, Building, MapPin, Calendar, Star,
  MessageCircle, UserPlus, Eye, TrendingUp, Globe,
  Briefcase, GraduationCap, Award, Coffee, Video,
  Search, Filter, ArrowRight, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Input } from '../ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const ProfessionalNetworkingTools = ({ userProfile, onConnectionRequest, onEventRegister }) => {
  const [activeTab, setActiveTab] = useState('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilters, setNetworkFilters] = useState({
    industry: 'all',
    location: 'all',
    experience: 'all',
    company: 'all'
  });

  const [networkingOpportunities, setNetworkingOpportunities] = useState([
    {
      id: 1,
      type: 'industry_leader',
      name: 'Sarah Johnson',
      title: 'VP of Engineering at TechCorp',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      connections: 2847,
      mutualConnections: 12,
      recentActivity: 'Posted about AI trends',
      compatibility: 94,
      reason: 'Same industry, complementary skills'
    },
    {
      id: 2,
      type: 'peer',
      name: 'Michael Chen',
      title: 'Senior Software Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      connections: 456,
      mutualConnections: 8,
      recentActivity: 'Shared article on React best practices',
      compatibility: 89,
      reason: 'Similar role and interests'
    },
    {
      id: 3,
      type: 'mentor',
      name: 'Dr. Emily Rodriguez',
      title: 'CTO & Co-founder',
      company: 'AI Innovations',
      location: 'New York, NY',
      connections: 1234,
      mutualConnections: 5,
      recentActivity: 'Speaking at Tech Conference 2025',
      compatibility: 92,
      reason: 'Potential mentor in AI/ML'
    }
  ]);

  const [networkingEvents, setNetworkingEvents] = useState([
    {
      id: 1,
      title: 'Tech Leaders Summit 2025',
      type: 'Conference',
      date: '2025-06-15',
      location: 'San Francisco, CA',
      attendees: 500,
      industry: 'Technology',
      price: '$299',
      virtual: false,
      speakers: ['Sarah Johnson', 'Mark Thompson', 'Lisa Wang'],
      topics: ['AI/ML', 'Leadership', 'Innovation'],
      networkingScore: 95
    },
    {
      id: 2,
      title: 'AI Innovation Meetup',
      type: 'Meetup',
      date: '2025-06-01',
      location: 'Virtual',
      attendees: 150,
      industry: 'Technology',
      price: 'Free',
      virtual: true,
      speakers: ['Dr. Emily Rodriguez'],
      topics: ['Machine Learning', 'Neural Networks'],
      networkingScore: 87
    },
    {
      id: 3,
      title: 'Startup Founders Circle',
      type: 'Networking',
      date: '2025-05-28',
      location: 'New York, NY',
      attendees: 75,
      industry: 'Entrepreneurship',
      price: '$50',
      virtual: false,
      speakers: [],
      topics: ['Fundraising', 'Product Development', 'Team Building'],
      networkingScore: 82
    }
  ]);

  const [networkAnalytics, setNetworkAnalytics] = useState({
    totalConnections: 247,
    industryInfluence: 8.7,
    networkGrowth: 12,
    engagementRate: 23,
    reachability: 12500,
    networkStrength: 89
  });

  const handleConnectionRequest = async (personId) => {
    try {
      await onConnectionRequest(personId);
      // Update local state to reflect sent request
      setNetworkingOpportunities(prev => 
        prev.map(person => 
          person.id === personId 
            ? { ...person, requestSent: true }
            : person
        )
      );
    } catch (error) {
      console.error('Failed to send connection request:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Professional Network Overview
          </CardTitle>
          <CardDescription>
            Your professional network analytics and growth insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="text-sm font-medium">Connections</p>
              <p className="text-lg font-bold text-blue-600">{networkAnalytics.totalConnections}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <p className="text-sm font-medium">Influence</p>
              <p className="text-lg font-bold text-green-600">{networkAnalytics.industryInfluence}/10</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <UserPlus className="w-6 h-6 mx-auto mb-1 text-purple-600" />
              <p className="text-sm font-medium">Growth</p>
              <p className="text-lg font-bold text-purple-600">+{networkAnalytics.networkGrowth}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <MessageCircle className="w-6 h-6 mx-auto mb-1 text-orange-600" />
              <p className="text-sm font-medium">Engagement</p>
              <p className="text-lg font-bold text-orange-600">{networkAnalytics.engagementRate}%</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <Globe className="w-6 h-6 mx-auto mb-1 text-red-600" />
              <p className="text-sm font-medium">Reach</p>
              <p className="text-lg font-bold text-red-600">{networkAnalytics.reachability.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Award className="w-6 h-6 mx-auto mb-1 text-gray-600" />
              <p className="text-sm font-medium">Strength</p>
              <p className="text-lg font-bold text-gray-600">{networkAnalytics.networkStrength}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Networking Tools Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connections">Smart Connections</TabsTrigger>
          <TabsTrigger value="events">Networking Events</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="insights">Network Insights</TabsTrigger>
        </TabsList>

        {/* Smart Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Connection Recommendations</CardTitle>
              <CardDescription>
                Discover high-value connections based on your goals and interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search professionals by name, company, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>

              {/* Connection Recommendations */}
              <div className="space-y-4">
                {networkingOpportunities.map((person, index) => (
                  <ConnectionRecommendationCard 
                    key={index} 
                    person={person} 
                    onConnect={() => handleConnectionRequest(person.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Networking Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Strategic Networking Events</CardTitle>
              <CardDescription>
                Events curated based on your professional goals and network gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkingEvents.map((event, index) => (
                  <NetworkingEventCard 
                    key={index} 
                    event={event} 
                    onRegister={() => onEventRegister(event.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communities Tab */}
        <TabsContent value="communities" className="space-y-6">
          <ProfessionalCommunitiesSection />
        </TabsContent>

        {/* Network Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <NetworkInsightsSection networkAnalytics={networkAnalytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ConnectionRecommendationCard = ({ person, onConnect }) => (
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">{person.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div>
          <h5 className="font-medium">{person.name}</h5>
          <p className="text-sm text-gray-600">{person.title}</p>
          <p className="text-sm text-gray-500">{person.company} • {person.location}</p>
        </div>
      </div>
      <Badge variant="success" className="text-xs">
        {person.compatibility}% match
      </Badge>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-500" />
        <span className="text-sm">{person.connections} connections</span>
      </div>
      <div className="flex items-center gap-2">
        <Network className="w-4 h-4 text-gray-500" />
        <span className="text-sm">{person.mutualConnections} mutual</span>
      </div>
    </div>

    <div className="mb-3">
      <p className="text-sm text-gray-600 mb-1">Recent: {person.recentActivity}</p>
      <p className="text-sm text-blue-600">{person.reason}</p>
    </div>

    <div className="flex gap-2">
      <Button size="sm" onClick={onConnect} disabled={person.requestSent}>
        {person.requestSent ? 'Request Sent' : 'Connect'}
      </Button>
      <Button size="sm" variant="outline">
        <Eye className="w-4 h-4 mr-1" />
        View Profile
      </Button>
      <Button size="sm" variant="outline">
        <MessageCircle className="w-4 h-4 mr-1" />
        Message
      </Button>
    </div>
  </div>
);

const NetworkingEventCard = ({ event, onRegister }) => (
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h5 className="font-medium">{event.title}</h5>
        <p className="text-sm text-gray-600">{event.type} • {event.industry}</p>
      </div>
      <div className="text-right">
        <Badge variant="outline">{event.price}</Badge>
        <p className="text-xs text-gray-500 mt-1">Score: {event.networkingScore}%</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-sm">{event.location}</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-500" />
        <span className="text-sm">{event.attendees} attendees</span>
      </div>
      <div className="flex items-center gap-2">
        {event.virtual ? <Video className="w-4 h-4 text-gray-500" /> : <Building className="w-4 h-4 text-gray-500" />}
        <span className="text-sm">{event.virtual ? 'Virtual' : 'In-Person'}</span>
      </div>
    </div>

    <div className="mb-3">
      <p className="text-sm text-gray-600 mb-2">Topics:</p>
      <div className="flex flex-wrap gap-1">
        {event.topics.map((topic, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {topic}
          </Badge>
        ))}
      </div>
    </div>

    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-500">
        {event.speakers.length > 0 && `Speakers: ${event.speakers.slice(0, 2).join(', ')}${event.speakers.length > 2 ? '...' : ''}`}
      </div>
      <Button size="sm" onClick={onRegister}>
        Register
      </Button>
    </div>
  </div>
);

const ProfessionalCommunitiesSection = () => (
  <Card>
    <CardHeader>
      <CardTitle>Professional Communities</CardTitle>
      <CardDescription>
        Join industry communities and professional groups
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Professional communities feature coming soon...</p>
      </div>
    </CardContent>
  </Card>
);

const NetworkInsightsSection = ({ networkAnalytics }) => (
  <Card>
    <CardHeader>
      <CardTitle>Network Growth Insights</CardTitle>
      <CardDescription>
        Analytics and recommendations for network expansion
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Network Strength Analysis</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Industry Coverage</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Geographic Diversity</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Seniority Balance</span>
                <span>82%</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Growth Recommendations</h4>
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Connect with more senior leaders</p>
              <p className="text-xs text-blue-600">Expand your reach to C-level executives in your industry</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">Join AI/ML communities</p>
              <p className="text-xs text-green-600">Your interest in AI shows potential for valuable connections</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Attend more virtual events</p>
              <p className="text-xs text-purple-600">Expand globally through virtual networking opportunities</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProfessionalNetworkingTools;