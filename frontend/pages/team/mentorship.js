import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../src/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar';
import { Progress } from '../../src/components/ui/progress';
import { 
  Users, 
  GraduationCap, 
  Target, 
  Calendar, 
  Clock,
  Star,
  Award,
  BookOpen,
  MessageSquare,
  Video,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Settings,
  Send,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Heart,
  ThumbsUp,
  Eye,
  Download,
  Share2,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  Lightbulb,
  Zap,
  Globe,
  Shield
} from 'lucide-react';

const TeamMentorship = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [mentorshipData, setMentorshipData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showMentorModal, setShowMentorModal] = useState(false);

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const fetchMentorshipData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team/mentorship', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMentorshipData(data);
      }
    } catch (error) {
      console.error('Error fetching mentorship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockMentorshipData = {
    overview: {
      totalMentors: 8,
      totalMentees: 15,
      activePairings: 12,
      completedSessions: 89,
      averageRating: 4.7,
      successRate: 92.3,
      totalHours: 156,
      programSatisfaction: 4.6
    },
    mentors: [
      {
        id: 1,
        name: 'Sarah Johnson',
        avatar: 'SJ',
        role: 'Senior Team Lead',
        department: 'Engineering',
        experience: '8 years',
        expertise: ['Leadership', 'Project Management', 'Career Development', 'Team Building'],
        rating: 4.9,
        totalMentees: 5,
        activeMentees: 3,
        completedSessions: 24,
        availability: 'Available',
        bio: 'Passionate about developing the next generation of tech leaders. I focus on strategic thinking, team dynamics, and career progression.',
        achievements: ['Top Mentor 2023', 'Leadership Excellence', 'Team Builder'],
        languages: ['English', 'Spanish'],
        timezone: 'PST',
        preferredMeetingStyle: 'Video calls',
        contact: {
          email: 'sarah.johnson@company.com',
          slack: '@sarah.johnson'
        }
      },
      {
        id: 2,
        name: 'Mike Chen',
        avatar: 'MC',
        role: 'Principal Engineer',
        department: 'Engineering',
        experience: '10 years',
        expertise: ['Technical Architecture', 'System Design', 'Code Review', 'Best Practices'],
        rating: 4.8,
        totalMentees: 4,
        activeMentees: 2,
        completedSessions: 18,
        availability: 'Limited',
        bio: 'Helping engineers grow their technical skills and architectural thinking. I love solving complex problems and sharing knowledge.',
        achievements: ['Technical Excellence', 'Innovation Award', 'Code Quality Champion'],
        languages: ['English', 'Mandarin'],
        timezone: 'PST',
        preferredMeetingStyle: 'In-person + Video',
        contact: {
          email: 'mike.chen@company.com',
          slack: '@mike.chen'
        }
      },
      {
        id: 3,
        name: 'Lisa Brown',
        avatar: 'LB',
        role: 'Senior UX Designer',
        department: 'Design',
        experience: '6 years',
        expertise: ['User Experience', 'Design Systems', 'User Research', 'Prototyping'],
        rating: 4.7,
        totalMentees: 3,
        activeMentees: 2,
        completedSessions: 15,
        availability: 'Available',
        bio: 'Dedicated to helping designers create meaningful user experiences. I focus on design thinking, user empathy, and creative problem-solving.',
        achievements: ['Design Innovation', 'User Advocate', 'Creative Excellence'],
        languages: ['English', 'French'],
        timezone: 'EST',
        preferredMeetingStyle: 'Video calls',
        contact: {
          email: 'lisa.brown@company.com',
          slack: '@lisa.brown'
        }
      }
    ],
    mentees: [
      {
        id: 1,
        name: 'Alex Rodriguez',
        avatar: 'AR',
        role: 'Junior Developer',
        department: 'Engineering',
        mentor: 'Mike Chen',
        startDate: '2024-01-15',
        goals: ['Learn system design', 'Improve coding skills', 'Understand architecture patterns'],
        progress: 75,
        sessionsCompleted: 8,
        nextSession: '2024-01-20',
        status: 'Active',
        satisfaction: 4.8
      },
      {
        id: 2,
        name: 'Emma Garcia',
        avatar: 'EG',
        role: 'Marketing Coordinator',
        department: 'Marketing',
        mentor: 'Sarah Johnson',
        startDate: '2024-01-10',
        goals: ['Develop leadership skills', 'Project management', 'Strategic thinking'],
        progress: 60,
        sessionsCompleted: 6,
        nextSession: '2024-01-18',
        status: 'Active',
        satisfaction: 4.9
      },
      {
        id: 3,
        name: 'Tom Wilson',
        avatar: 'TW',
        role: 'UX Designer',
        department: 'Design',
        mentor: 'Lisa Brown',
        startDate: '2023-12-01',
        goals: ['Master design systems', 'User research skills', 'Portfolio development'],
        progress: 90,
        sessionsCompleted: 12,
        nextSession: '2024-01-22',
        status: 'Completing',
        satisfaction: 4.7
      }
    ],
    sessions: [
      {
        id: 1,
        mentor: 'Sarah Johnson',
        mentee: 'Emma Garcia',
        date: '2024-01-15',
        time: '2:00 PM',
        duration: 60,
        type: 'Video Call',
        topic: 'Leadership Development',
        status: 'Completed',
        rating: 5,
        notes: 'Great discussion about team dynamics and leadership styles. Emma showed excellent progress.',
        nextActions: ['Read "The First 90 Days"', 'Practice delegation techniques', 'Observe team meetings']
      },
      {
        id: 2,
        mentor: 'Mike Chen',
        mentee: 'Alex Rodriguez',
        date: '2024-01-16',
        time: '10:00 AM',
        duration: 90,
        type: 'In-Person',
        topic: 'System Architecture Review',
        status: 'Completed',
        rating: 5,
        notes: 'Reviewed microservices architecture. Alex demonstrated good understanding of design patterns.',
        nextActions: ['Design a small system', 'Study database optimization', 'Review code examples']
      },
      {
        id: 3,
        mentor: 'Lisa Brown',
        mentee: 'Tom Wilson',
        date: '2024-01-18',
        time: '3:00 PM',
        duration: 60,
        type: 'Video Call',
        topic: 'Portfolio Review',
        status: 'Scheduled',
        rating: null,
        notes: null,
        nextActions: []
      }
    ],
    programs: [
      {
        id: 1,
        name: 'Technical Leadership Track',
        description: 'Develop technical leadership skills for senior engineers',
        duration: '6 months',
        participants: 8,
        mentors: 3,
        status: 'Active',
        startDate: '2024-01-01',
        completionRate: 85,
        topics: ['Technical Strategy', 'Team Leadership', 'Architecture Decisions', 'Mentoring Others']
      },
      {
        id: 2,
        name: 'New Graduate Program',
        description: 'Onboarding and skill development for new graduates',
        duration: '3 months',
        participants: 5,
        mentors: 4,
        status: 'Active',
        startDate: '2024-01-15',
        completionRate: 60,
        topics: ['Professional Skills', 'Technical Foundations', 'Company Culture', 'Career Planning']
      }
    ],
    resources: [
      {
        id: 1,
        title: 'Mentorship Best Practices Guide',
        type: 'PDF',
        category: 'Guidelines',
        downloads: 45,
        rating: 4.8,
        description: 'Comprehensive guide for effective mentoring relationships'
      },
      {
        id: 2,
        title: 'Goal Setting Template',
        type: 'Template',
        category: 'Tools',
        downloads: 32,
        rating: 4.6,
        description: 'Structured template for setting and tracking mentorship goals'
      }
    ]
  };

  const currentData = mentorshipData || mockMentorshipData;

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completing': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestMentorship = async (mentorId) => {
    try {
      const response = await fetch('/api/team/mentorship/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ mentorId })
      });

      if (response.ok) {
        fetchMentorshipData();
      }
    } catch (error) {
      console.error('Error requesting mentorship:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Team Mentorship"
        subtitle="Connect, learn, and grow through mentorship relationships"
        icon={<GraduationCap className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Team', href: '/team' },
          { label: 'Mentorship', href: '/team/mentorship' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Become a Mentor
            </Button>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Find a Mentor
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'mentors'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Mentors
        </button>
        <button
          onClick={() => setActiveTab('mentees')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'mentees'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <GraduationCap className="h-4 w-4 inline mr-2" />
          Mentees
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'sessions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'programs'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Programs
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'resources'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Resources
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Mentors</p>
                    <p className="text-2xl font-bold text-blue-600">{currentData.overview.totalMentors}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.overview.totalMentees}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Pairings</p>
                    <p className="text-2xl font-bold text-purple-600">{currentData.overview.activePairings}</p>
                  </div>
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-orange-600">{currentData.overview.successRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                    <p className="text-2xl font-bold">{currentData.overview.completedSessions}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">{currentData.overview.averageRating}/5</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-blue-600">{currentData.overview.totalHours}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.overview.programSatisfaction}/5</p>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'mentors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.mentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{mentor.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{mentor.name}</CardTitle>
                      <p className="text-sm text-gray-600">{mentor.role}</p>
                      <p className="text-xs text-gray-500">{mentor.department}</p>
                    </div>
                  </div>
                  <Badge className={getAvailabilityColor(mentor.availability)}>
                    {mentor.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rating and Experience */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{mentor.rating}</span>
                    <span className="text-sm text-gray-600">({mentor.completedSessions} sessions)</span>
                  </div>
                  <span className="text-sm text-gray-600">{mentor.experience}</span>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-700 line-clamp-3">{mentor.bio}</p>

                {/* Expertise */}
                <div>
                  <p className="text-sm font-medium mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mentor.expertise.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-lg font-bold text-blue-600">{mentor.activeMentees}</div>
                    <div className="text-xs text-gray-600">Active Mentees</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-lg font-bold text-green-600">{mentor.totalMentees}</div>
                    <div className="text-xs text-gray-600">Total Mentees</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleRequestMentorship(mentor.id)}
                    disabled={mentor.availability === 'Unavailable'}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Request Mentorship
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'mentees' && (
        <div className="space-y-4">
          {currentData.mentees.map((mentee) => (
            <Card key={mentee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{mentee.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-lg">{mentee.name}</h4>
                        <p className="text-sm text-gray-600">{mentee.role} • {mentee.department}</p>
                        <p className="text-xs text-gray-500">Mentored by {mentee.mentor}</p>
                      </div>
                      
                      {/* Goals */}
                      <div>
                        <p className="text-sm font-medium mb-1">Goals</p>
                        <div className="flex flex-wrap gap-1">
                          {mentee.goals.map((goal, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <Badge className={getStatusColor(mentee.status)}>
                      {mentee.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm">{mentee.satisfaction}</span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{mentee.progress}%</span>
                  </div>
                  <Progress value={mentee.progress} className="h-2" />
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{mentee.sessionsCompleted}</div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Started</div>
                    <div className="text-xs text-gray-500">{new Date(mentee.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Next Session</div>
                    <div className="text-xs text-gray-500">{new Date(mentee.nextSession).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {currentData.sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-lg">{session.topic}</h4>
                      <p className="text-sm text-gray-600">
                        {session.mentor} → {session.mentee}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.time} ({session.duration} min)
                      </div>
                      <div className="flex items-center gap-1">
                        {session.type === 'Video Call' ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        {session.type}
                      </div>
                    </div>

                    {session.notes && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">{session.notes}</p>
                      </div>
                    )}

                    {session.nextActions && session.nextActions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Next Actions</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {session.nextActions.map((action, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right space-y-2">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    {session.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm">{session.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="space-y-4">
          {currentData.programs.map((program) => (
            <Card key={program.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-lg">{program.name}</h4>
                      <p className="text-sm text-gray-600">{program.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {program.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {program.participants} participants
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {program.mentors} mentors
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Topics Covered</p>
                      <div className="flex flex-wrap gap-1">
                        {program.topics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span className="font-medium">{program.completionRate}%</span>
                      </div>
                      <Progress value={program.completionRate} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <Badge className={getStatusColor(program.status)}>
                      {program.status}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Started: {new Date(program.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentData.resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-lg">{resource.title}</h4>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                    <Badge variant="outline">{resource.type}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-gray-400" />
                        {resource.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        {resource.rating}
                      </div>
                    </div>
                    <Badge variant="secondary">{resource.category}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMentorship;