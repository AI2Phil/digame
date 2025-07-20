import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Users, MessageCircle, Target, TrendingUp, Star,
  Search, Filter, Plus, UserPlus, Award, Clock,
  BookOpen, Lightbulb, Network, Heart, Share2,
  Calendar, MapPin, Briefcase, GraduationCap,
  CheckCircle, AlertCircle, Eye, Settings
} from 'lucide-react';

interface PeerMatch {
  id: string;
  user_id: string;
  name: string;
  avatar?: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  goals: string[];
  match_score: number;
  compatibility_factors: string[];
  mutual_connections: number;
  last_active: string;
  is_available_for_mentoring: boolean;
  is_seeking_mentorship: boolean;
}

interface MentorshipProgram {
  id: string;
  title: string;
  description: string;
  mentor_id: string;
  mentor_name: string;
  mentor_avatar?: string;
  category: string;
  duration_weeks: number;
  max_participants: number;
  current_participants: number;
  start_date: string;
  skills_covered: string[];
  requirements: string[];
  rating: number;
  reviews_count: number;
  status: 'open' | 'full' | 'in_progress' | 'completed';
}

interface LearningPartner {
  id: string;
  partner_id: string;
  name: string;
  avatar?: string;
  shared_goals: string[];
  collaboration_type: 'study_buddy' | 'project_partner' | 'accountability_partner';
  match_date: string;
  sessions_completed: number;
  next_session?: string;
  progress_sync: number;
  status: 'active' | 'paused' | 'completed';
}

interface TeamInsight {
  team_id: string;
  team_name: string;
  member_count: number;
  collaboration_score: number;
  communication_frequency: number;
  goal_alignment: number;
  knowledge_sharing_index: number;
  recent_activities: Array<{
    type: string;
    description: string;
    timestamp: string;
    participants: string[];
  }>;
  recommendations: string[];
}

interface SocialMetrics {
  total_connections: number;
  active_mentorships: number;
  learning_partnerships: number;
  knowledge_shared: number;
  collaboration_score: number;
  network_growth_rate: number;
  engagement_level: 'low' | 'medium' | 'high';
  top_skills_shared: Array<{ skill: string; count: number }>;
  recent_achievements: Array<{
    type: string;
    title: string;
    date: string;
  }>;
}

export const SocialCollaborationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'peers' | 'mentorship' | 'partners' | 'teams'>('overview');
  const [peerMatches, setPeerMatches] = useState<PeerMatch[]>([]);
  const [mentorshipPrograms, setMentorshipPrograms] = useState<MentorshipProgram[]>([]);
  const [learningPartners, setLearningPartners] = useState<LearningPartner[]>([]);
  const [teamInsights, setTeamInsights] = useState<TeamInsight[]>([]);
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      
      const [metricsRes, peersRes, mentorshipRes, partnersRes, teamsRes] = await Promise.all([
        fetch('/api/social/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/peer-matches', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/mentorship-programs', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/learning-partners', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/social/team-insights', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (peersRes.ok) {
        const peersData = await peersRes.json();
        setPeerMatches(peersData.matches || []);
      }

      if (mentorshipRes.ok) {
        const mentorshipData = await mentorshipRes.json();
        setMentorshipPrograms(mentorshipData.programs || []);
      }

      if (partnersRes.ok) {
        const partnersData = await partnersRes.json();
        setLearningPartners(partnersData.partners || []);
      }

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeamInsights(teamsData.insights || []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load social collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      const response = await fetch('/api/social/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (response.ok) {
        await fetchSocialData();
      }
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  const handleJoinMentorship = async (programId: string) => {
    try {
      const response = await fetch(`/api/social/mentorship/${programId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchSocialData();
      }
    } catch (err) {
      console.error('Failed to join mentorship:', err);
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'open': return 'success';
      case 'in_progress': return 'warning';
      case 'completed': return 'info';
      case 'paused': case 'full': return 'secondary';
      default: return 'default';
    }
  };

  const filteredPeers = peerMatches.filter(peer => {
    const matchesSearch = searchTerm === '' || 
      peer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peer.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = filterSkill === 'all' || peer.skills.includes(filterSkill);
    const matchesLocation = filterLocation === 'all' || peer.location.includes(filterLocation);
    
    return matchesSearch && matchesSkill && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Social Collaboration
          </h1>
          <p className="text-gray-600 mt-1">Connect, learn, and grow with your professional network</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: Users },
            { key: 'peers', label: 'Peer Matching', icon: Network },
            { key: 'mentorship', label: 'Mentorship', icon: GraduationCap },
            { key: 'partners', label: 'Learning Partners', icon: BookOpen },
            { key: 'teams', label: 'Team Insights', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
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

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Network Connections',
                value: metrics.total_connections,
                subtitle: `+${metrics.network_growth_rate}% this month`,
                icon: Users,
                color: 'blue',
              },
              {
                title: 'Active Mentorships',
                value: metrics.active_mentorships,
                subtitle: 'Ongoing programs',
                icon: GraduationCap,
                color: 'green',
              },
              {
                title: 'Learning Partners',
                value: metrics.learning_partnerships,
                subtitle: 'Active collaborations',
                icon: BookOpen,
                color: 'purple',
              },
              {
                title: 'Knowledge Shared',
                value: metrics.knowledge_shared,
                subtitle: 'Sessions this month',
                icon: Lightbulb,
                color: 'orange',
              },
            ].map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                      <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Collaboration Score */}
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-gray-900">Overall Score</span>
                    <span className={`text-2xl font-bold ${getEngagementColor(metrics.engagement_level)}`}>
                      {metrics.collaboration_score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        metrics.collaboration_score >= 80 ? 'bg-green-600' :
                        metrics.collaboration_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${metrics.collaboration_score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Engagement Level: <span className={`font-medium ${getEngagementColor(metrics.engagement_level)}`}>
                      {metrics.engagement_level.charAt(0).toUpperCase() + metrics.engagement_level.slice(1)}
                    </span>
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Skills Shared</h4>
                  <div className="space-y-2">
                    {metrics.top_skills_shared.slice(0, 5).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{skill.skill}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(skill.count / Math.max(...metrics.top_skills_shared.map(s => s.count))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-6 text-right">{skill.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recent_achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">{achievement.title}</p>
                      <p className="text-sm text-gray-600">{achievement.type}</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(achievement.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Peer Matching Tab */}
      {activeTab === 'peers' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, title, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Skills</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="React">React</option>
                  <option value="Leadership">Leadership</option>
                </select>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Locations</option>
                  <option value="Remote">Remote</option>
                  <option value="New York">New York</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="London">London</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Peer Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeers.map((peer) => (
              <Card key={peer.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {peer.avatar ? (
                        <img src={peer.avatar} alt={peer.name} className="w-12 h-12 rounded-full" />
                      ) : (
                        <span className="text-lg font-medium text-gray-600">
                          {peer.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{peer.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{peer.title}</p>
                      <p className="text-xs text-gray-500">{peer.company}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{peer.match_score}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{peer.location}</span>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {peer.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" size="xs" icon={null} onRemove={() => {}}>
                            {skill}
                          </Badge>
                        ))}
                        {peer.skills.length > 3 && (
                          <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                            +{peer.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Compatibility</p>
                      <div className="flex flex-wrap gap-1">
                        {peer.compatibility_factors.slice(0, 2).map((factor, index) => (
                          <Badge key={index} variant="info" size="xs" icon={null} onRemove={() => {}}>
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{peer.mutual_connections} mutual</span>
                        <span>Active {new Date(peer.last_active).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {peer.is_available_for_mentoring && (
                          <Badge variant="success" size="xs" icon={null} onRemove={() => {}}>
                            Mentor
                          </Badge>
                        )}
                        {peer.is_seeking_mentorship && (
                          <Badge variant="warning" size="xs" icon={null} onRemove={() => {}}>
                            Seeking
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => handleConnect(peer.user_id)}>
                        <UserPlus className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mentorship Tab */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {mentorshipPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{program.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{program.description}</p>
                    </div>
                    <Badge 
                      variant={getStatusColor(program.status)} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {program.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {program.mentor_avatar ? (
                        <img src={program.mentor_avatar} alt={program.mentor_name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {program.mentor_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{program.mentor_name}</p>
                      <p className="text-xs text-gray-500">{program.category}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{program.duration_weeks} weeks</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Participants:</span>
                      <span className="font-medium">
                        {program.current_participants}/{program.max_participants}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="font-medium">{program.rating}</span>
                        <span className="text-gray-500">({program.reviews_count})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-1">Skills Covered</p>
                    <div className="flex flex-wrap gap-1">
                      {program.skills_covered.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" size="xs" icon={null} onRemove={() => {}}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Starts {new Date(program.start_date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    {program.status === 'open' && (
                      <Button size="sm" onClick={() => handleJoinMentorship(program.id)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Join Program
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Learning Partners Tab */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {learningPartners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {partner.avatar ? (
                          <img src={partner.avatar} alt={partner.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-lg font-medium text-gray-600">
                            {partner.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{partner.name}</h3>
                        <p className="text-sm text-gray-600">{partner.collaboration_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={getStatusColor(partner.status)} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {partner.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Shared Goals</p>
                      <div className="flex flex-wrap gap-1">
                        {partner.shared_goals.map((goal, index) => (
                          <Badge key={index} variant="info" size="xs" icon={null} onRemove={() => {}}>
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Sessions:</span>
                        <span className="font-medium ml-2">{partner.sessions_completed}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Progress Sync:</span>
                        <span className="font-medium ml-2">{partner.progress_sync}%</span>
                      </div>
                    </div>

                    {partner.next_session && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Next: {new Date(partner.next_session).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                      {partner.status === 'active' && (
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete Session
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Team Insights Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          {teamInsights.map((team) => (
            <Card key={team.team_id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{team.team_name}</span>
                  <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                    {team.member_count} members
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Collaboration Score', value: team.collaboration_score, max: 100, color: 'blue' },
                    { label: 'Communication', value: team.communication_frequency, max: 100, color: 'green' },
                    { label: 'Goal Alignment', value: team.goal_alignment, max: 100, color: 'purple' },
                    { label: 'Knowledge Sharing', value: team.knowledge_sharing_index, max: 100, color: 'orange' },
                  ].map((metric, index) => (
                    <div key={index} className="text-center">
                      <p className="text-sm font-medium text-gray-600 mb-2">{metric.label}</p>
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={`var(--${metric.color}-600)`}
                            strokeWidth="2"
                            strokeDasharray={`${metric.value}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-900">{metric.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recent Activities</h4>
                    <div className="space-y-2">
                      {team.recent_activities.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {activity.participants.length} participants
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {team.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                          <p className="text-sm text-blue-800">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialCollaborationDashboard;