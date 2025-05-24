import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, MessageCircle, Target, Award, TrendingUp, 
  Network, Brain, Handshake, BookOpen, Calendar, MapPin,
  Search, Filter, Star, Heart, Share2, Eye, Clock,
  Building, Briefcase, GraduationCap, Coffee, Video,
  BarChart3, PieChart, Activity, Zap, Globe, Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Toast } from '../components/ui/Toast';
import socialService from '../services/socialService';
import apiService from '../services/apiService';

const EnhancedSocialCollaborationDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({});
  const [peerMatches, setPeerMatches] = useState([]);
  const [mentorshipPrograms, setMentorshipPrograms] = useState([]);
  const [collaborationProjects, setCollaborationProjects] = useState([]);
  const [teamAnalytics, setTeamAnalytics] = useState({});
  const [industryConnections, setIndustryConnections] = useState([]);
  const [skillBasedMatches, setSkillBasedMatches] = useState([]);

  useEffect(() => {
    loadSocialCollaborationData();
  }, []);

  const loadSocialCollaborationData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      
      const [
        profile,
        matches,
        mentorship,
        projects,
        analytics,
        industry,
        skillMatches
      ] = await Promise.all([
        socialService.getUserProfile(userId),
        socialService.findPeerMatches({ userId, limit: 10 }),
        socialService.getMentorshipPrograms(userId),
        socialService.getCollaborationProjects(userId),
        socialService.getTeamAnalytics(userId),
        socialService.getIndustryConnections(userId),
        socialService.getSkillBasedMatches(userId)
      ]);

      setUserProfile(profile || {});
      setPeerMatches(matches || []);
      setMentorshipPrograms(mentorship || []);
      setCollaborationProjects(projects || []);
      setTeamAnalytics(analytics || {});
      setIndustryConnections(industry || []);
      setSkillBasedMatches(skillMatches || []);

    } catch (error) {
      console.error('Failed to load social collaboration data:', error);
      Toast.error('Failed to load social collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPeer = async (peerId) => {
    try {
      await socialService.sendConnectionRequest(peerId);
      Toast.success('Connection request sent successfully');
      loadSocialCollaborationData();
    } catch (error) {
      Toast.error('Failed to send connection request');
    }
  };

  const handleJoinProject = async (projectId) => {
    try {
      await socialService.joinCollaborationProject(projectId);
      Toast.success('Successfully joined collaboration project');
      loadSocialCollaborationData();
    } catch (error) {
      Toast.error('Failed to join project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading enhanced social collaboration features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced Social Collaboration</h1>
              <p className="text-gray-600">Advanced peer matching, networking, and team collaboration platform</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <SocialMetricCard
              title="Network Size"
              value={userProfile.networkSize || 247}
              icon={Network}
              color="blue"
              trend="+12 this week"
            />
            <SocialMetricCard
              title="Skill Matches"
              value={skillBasedMatches.length || 18}
              icon={Brain}
              color="purple"
              trend="95% compatibility"
            />
            <SocialMetricCard
              title="Active Projects"
              value={collaborationProjects.filter(p => p.status === 'active').length || 3}
              icon={Target}
              color="green"
              trend="2 new invites"
            />
            <SocialMetricCard
              title="Mentorship"
              value={mentorshipPrograms.length || 2}
              icon={GraduationCap}
              color="orange"
              trend="1 mentor, 1 mentee"
            />
            <SocialMetricCard
              title="Industry Rank"
              value={`Top ${userProfile.industryRank || 15}%`}
              icon={Award}
              color="emerald"
              trend="Rising"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="peer-matching">Peer Matching</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="teams">Team Analytics</TabsTrigger>
            <TabsTrigger value="industry">Industry</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <SocialOverviewSection 
              userProfile={userProfile}
              peerMatches={peerMatches}
              projects={collaborationProjects}
              mentorship={mentorshipPrograms}
              teamAnalytics={teamAnalytics}
            />
          </TabsContent>

          {/* Peer Matching Tab */}
          <TabsContent value="peer-matching" className="space-y-6">
            <PeerMatchingSection 
              peerMatches={peerMatches}
              skillMatches={skillBasedMatches}
              onConnect={handleConnectPeer}
            />
          </TabsContent>

          {/* Mentorship Tab */}
          <TabsContent value="mentorship" className="space-y-6">
            <MentorshipSection 
              mentorshipPrograms={mentorshipPrograms}
            />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <CollaborationProjectsSection 
              projects={collaborationProjects}
              onJoinProject={handleJoinProject}
            />
          </TabsContent>

          {/* Team Analytics Tab */}
          <TabsContent value="teams" className="space-y-6">
            <TeamAnalyticsSection 
              teamAnalytics={teamAnalytics}
            />
          </TabsContent>

          {/* Industry Tab */}
          <TabsContent value="industry" className="space-y-6">
            <IndustryNetworkingSection 
              industryConnections={industryConnections}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Social Metric Card Component
const SocialMetricCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100',
    emerald: 'text-emerald-600 bg-emerald-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Social Overview Section Component
const SocialOverviewSection = ({ userProfile, peerMatches, projects, mentorship, teamAnalytics }) => (
  <div className="space-y-6">
    {/* Professional Profile Summary */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Professional Profile & Network Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">{userProfile.initials || 'JD'}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{userProfile.name || 'John Doe'}</h3>
                <p className="text-gray-600">{userProfile.title || 'Senior Software Engineer'}</p>
                <p className="text-sm text-gray-500">{userProfile.company || 'Tech Innovation Corp'}</p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="secondary">{userProfile.experience || '5+ years'}</Badge>
                  <Badge variant="secondary">{userProfile.location || 'San Francisco, CA'}</Badge>
                  <Badge variant="secondary">{userProfile.industry || 'Technology'}</Badge>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-medium mb-3">Core Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {(userProfile.skills || ['React', 'Node.js', 'Python', 'Machine Learning', 'Team Leadership']).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-4">Network Statistics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Direct Connections</span>
                <span className="font-semibold">{userProfile.directConnections || 247}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">2nd Degree Network</span>
                <span className="font-semibold">{userProfile.secondDegreeNetwork || '12.5K'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Industry Influence</span>
                <span className="font-semibold">{userProfile.industryInfluence || '8.7/10'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Collaboration Score</span>
                <span className="font-semibold">{userProfile.collaborationScore || '94%'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Quick Actions & Recommendations */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecommendedConnectionsCard peerMatches={peerMatches.slice(0, 3)} />
      <ActiveCollaborationsCard projects={projects.filter(p => p.status === 'active').slice(0, 3)} />
    </div>

    {/* Network Growth & Engagement */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <NetworkGrowthCard userProfile={userProfile} />
      <MentorshipOverviewCard mentorship={mentorship} />
      <TeamPerformanceCard teamAnalytics={teamAnalytics} />
    </div>
  </div>
);

// Peer Matching Section Component
const PeerMatchingSection = ({ peerMatches, skillMatches, onConnect }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Advanced Skill-Based Peer Matching
        </CardTitle>
        <CardDescription>
          AI-powered matching based on skills, goals, experience, and collaboration preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Matching Algorithm Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Brain className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">AI Compatibility</p>
              <p className="text-2xl font-bold text-blue-600">94%</p>
              <p className="text-xs text-gray-500">Average match score</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold">Goal Alignment</p>
              <p className="text-2xl font-bold text-green-600">87%</p>
              <p className="text-xs text-gray-500">Shared objectives</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Handshake className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">92%</p>
              <p className="text-xs text-gray-500">Successful connections</p>
            </div>
          </div>

          {/* Top Skill-Based Matches */}
          <div>
            <h4 className="font-medium mb-4">Top Skill-Based Matches</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillMatches.slice(0, 6).map((match, index) => (
                <PeerMatchCard key={index} match={match} onConnect={onConnect} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Helper Components
const PeerMatchCard = ({ match, onConnect }) => (
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-white font-bold">{match.initials || 'AB'}</span>
      </div>
      <div className="flex-1">
        <h5 className="font-medium">{match.name || 'Alex Brown'}</h5>
        <p className="text-sm text-gray-600">{match.title || 'Product Manager'}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="success" className="text-xs">
            {match.compatibilityScore || 94}% match
          </Badge>
          <Badge variant="outline" className="text-xs">
            {match.sharedSkills || 5} shared skills
          </Badge>
        </div>
        <Button 
          size="sm" 
          className="mt-3"
          onClick={() => onConnect(match.id)}
        >
          Connect
        </Button>
      </div>
    </div>
  </div>
);

const RecommendedConnectionsCard = ({ peerMatches }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recommended Connections</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {peerMatches.map((match, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">{match.initials || 'AB'}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{match.name || 'Alex Brown'}</p>
              <p className="text-xs text-gray-500">{match.title || 'Product Manager'}</p>
            </div>
            <Badge variant="success" className="text-xs">
              {match.compatibilityScore || 94}%
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ActiveCollaborationsCard = ({ projects }) => (
  <Card>
    <CardHeader>
      <CardTitle>Active Collaborations</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {projects.map((project, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{project.name || 'AI Research Project'}</p>
              <p className="text-xs text-gray-500">{project.team || '5 members'}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {project.progress || 67}%
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Enhanced Mentorship Section Component
const MentorshipSection = ({ mentorshipPrograms }) => {
  const [activePrograms, setActivePrograms] = useState(mentorshipPrograms || []);
  const [availablePrograms, setAvailablePrograms] = useState([
    {
      id: 1,
      title: "Senior Developer Mentorship",
      type: "mentor",
      description: "Guide junior developers in advanced programming concepts",
      duration: "6 months",
      commitment: "2 hours/week",
      participants: 3,
      skills: ["React", "Node.js", "System Design"],
      status: "active"
    },
    {
      id: 2,
      title: "AI/ML Learning Circle",
      type: "peer",
      description: "Collaborative learning group for machine learning enthusiasts",
      duration: "3 months",
      commitment: "3 hours/week",
      participants: 8,
      skills: ["Python", "TensorFlow", "Data Science"],
      status: "recruiting"
    },
    {
      id: 3,
      title: "Leadership Development Program",
      type: "mentee",
      description: "Learn leadership skills from experienced tech leaders",
      duration: "4 months",
      commitment: "1.5 hours/week",
      participants: 12,
      skills: ["Leadership", "Team Management", "Strategy"],
      status: "available"
    }
  ]);

  const handleJoinProgram = async (programId) => {
    try {
      await socialService.joinMentorshipProgram(programId);
      Toast.success('Successfully joined mentorship program');
      // Update local state
      const program = availablePrograms.find(p => p.id === programId);
      if (program) {
        setActivePrograms([...activePrograms, { ...program, status: 'joined' }]);
      }
    } catch (error) {
      Toast.error('Failed to join mentorship program');
    }
  };

  return (
    <div className="space-y-6">
      {/* Mentorship Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Mentorship Programs & Opportunities
          </CardTitle>
          <CardDescription>
            Connect with mentors, become a mentor, or join peer learning groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">As Mentor</p>
              <p className="text-2xl font-bold text-blue-600">2</p>
              <p className="text-xs text-gray-500">Active mentees</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold">As Mentee</p>
              <p className="text-2xl font-bold text-green-600">1</p>
              <p className="text-xs text-gray-500">Current mentor</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold">Peer Groups</p>
              <p className="text-2xl font-bold text-purple-600">3</p>
              <p className="text-xs text-gray-500">Learning circles</p>
            </div>
          </div>

          {/* Active Programs */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Your Active Programs</h4>
            <div className="space-y-3">
              {activePrograms.map((program, index) => (
                <MentorshipProgramCard key={index} program={program} isActive={true} />
              ))}
            </div>
          </div>

          {/* Available Programs */}
          <div>
            <h4 className="font-medium mb-3">Available Programs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePrograms.map((program, index) => (
                <MentorshipProgramCard
                  key={index}
                  program={program}
                  onJoin={() => handleJoinProgram(program.id)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Collaboration Projects Section
const CollaborationProjectsSection = ({ projects, onJoinProject }) => {
  const [activeProjects, setActiveProjects] = useState(projects || []);
  const [availableProjects, setAvailableProjects] = useState([
    {
      id: 1,
      name: "Open Source AI Assistant",
      description: "Building an intelligent coding assistant for developers",
      category: "Open Source",
      skills: ["Python", "NLP", "React"],
      team: 8,
      progress: 65,
      duration: "4 months",
      commitment: "10 hours/week",
      difficulty: "Advanced",
      status: "recruiting"
    },
    {
      id: 2,
      name: "Sustainability Tracker App",
      description: "Mobile app to track and gamify sustainable living practices",
      category: "Social Impact",
      skills: ["React Native", "Node.js", "MongoDB"],
      team: 5,
      progress: 30,
      duration: "3 months",
      commitment: "6 hours/week",
      difficulty: "Intermediate",
      status: "starting"
    },
    {
      id: 3,
      name: "Blockchain Learning Platform",
      description: "Educational platform for blockchain and cryptocurrency concepts",
      category: "Education",
      skills: ["Solidity", "Web3", "React"],
      team: 6,
      progress: 80,
      duration: "2 months",
      commitment: "8 hours/week",
      difficulty: "Advanced",
      status: "active"
    }
  ]);

  const [projectFilters, setProjectFilters] = useState({
    category: 'all',
    difficulty: 'all',
    commitment: 'all'
  });

  const filteredProjects = availableProjects.filter(project => {
    return (projectFilters.category === 'all' || project.category === projectFilters.category) &&
           (projectFilters.difficulty === 'all' || project.difficulty === projectFilters.difficulty);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Collaboration Project Matching
          </CardTitle>
          <CardDescription>
            Find and join projects that match your skills and interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Project Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="ml-2 border rounded px-3 py-1"
                value={projectFilters.category}
                onChange={(e) => setProjectFilters({...projectFilters, category: e.target.value})}
              >
                <option value="all">All Categories</option>
                <option value="Open Source">Open Source</option>
                <option value="Social Impact">Social Impact</option>
                <option value="Education">Education</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <select
                className="ml-2 border rounded px-3 py-1"
                value={projectFilters.difficulty}
                onChange={(e) => setProjectFilters({...projectFilters, difficulty: e.target.value})}
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project, index) => (
              <CollaborationProjectCard
                key={index}
                project={project}
                onJoin={() => onJoinProject(project.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Team Analytics Section
const TeamAnalyticsSection = ({ teamAnalytics }) => {
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  
  const teamData = teamAnalytics || {
    teams: [
      { id: 1, name: "Frontend Development", members: 8, efficiency: 92, projects: 3 },
      { id: 2, name: "AI Research Group", members: 5, efficiency: 87, projects: 2 },
      { id: 3, name: "Mobile Development", members: 6, efficiency: 89, projects: 4 }
    ],
    collaborationMetrics: {
      totalCollaborations: 156,
      successfulProjects: 23,
      averageTeamSize: 6.3,
      crossTeamProjects: 8
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Team Collaboration Analytics
          </CardTitle>
          <CardDescription>
            Shared dashboards and team performance insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Analytics Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <select
                className="border rounded px-3 py-2"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="all">All Teams</option>
                {teamData.teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select
                className="border rounded px-3 py-2"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>

          {/* Team Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Active Teams</p>
              <p className="text-2xl font-bold text-blue-600">{teamData.teams.length}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold">Projects</p>
              <p className="text-2xl font-bold text-green-600">{teamData.collaborationMetrics.successfulProjects}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold">Collaborations</p>
              <p className="text-2xl font-bold text-purple-600">{teamData.collaborationMetrics.totalCollaborations}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="font-semibold">Avg Team Size</p>
              <p className="text-2xl font-bold text-orange-600">{teamData.collaborationMetrics.averageTeamSize}</p>
            </div>
          </div>

          {/* Team Performance Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Team Performance Breakdown</h4>
            {teamData.teams.map((team, index) => (
              <TeamPerformanceRow key={index} team={team} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Industry Networking Section
const IndustryNetworkingSection = ({ industryConnections }) => {
  const [selectedIndustry, setSelectedIndustry] = useState('technology');
  const [networkingEvents, setNetworkingEvents] = useState([
    {
      id: 1,
      title: "Tech Leaders Summit 2025",
      date: "2025-06-15",
      type: "Conference",
      industry: "Technology",
      attendees: 500,
      location: "San Francisco, CA",
      virtual: false
    },
    {
      id: 2,
      title: "AI Innovation Meetup",
      date: "2025-06-01",
      type: "Meetup",
      industry: "Technology",
      attendees: 150,
      location: "Virtual",
      virtual: true
    },
    {
      id: 3,
      title: "Startup Founders Circle",
      date: "2025-05-28",
      type: "Networking",
      industry: "Entrepreneurship",
      attendees: 75,
      location: "New York, NY",
      virtual: false
    }
  ]);

  const industryStats = {
    technology: {
      connections: 247,
      influencers: 12,
      companies: 45,
      events: 8
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Industry Community Building
          </CardTitle>
          <CardDescription>
            Professional networking and industry community engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Industry Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium">Industry Focus</label>
            <select
              className="ml-2 border rounded px-3 py-2"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
            </select>
          </div>

          {/* Industry Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Network className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Connections</p>
              <p className="text-2xl font-bold text-blue-600">{industryStats[selectedIndustry]?.connections || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Star className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold">Influencers</p>
              <p className="text-2xl font-bold text-green-600">{industryStats[selectedIndustry]?.influencers || 0}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Building className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold">Companies</p>
              <p className="text-2xl font-bold text-purple-600">{industryStats[selectedIndustry]?.companies || 0}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="font-semibold">Events</p>
              <p className="text-2xl font-bold text-orange-600">{industryStats[selectedIndustry]?.events || 0}</p>
            </div>
          </div>

          {/* Networking Events */}
          <div>
            <h4 className="font-medium mb-4">Upcoming Networking Events</h4>
            <div className="space-y-4">
              {networkingEvents.map((event, index) => (
                <NetworkingEventCard key={index} event={event} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const NetworkGrowthCard = ({ userProfile }) => (
  <Card>
    <CardHeader>
      <CardTitle>Network Growth</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 mb-2">
          +{userProfile.weeklyGrowth || 12}
        </div>
        <p className="text-sm text-gray-600">New connections this week</p>
        <Progress value={75} className="mt-3" />
        <p className="text-xs text-gray-500 mt-2">75% of monthly goal</p>
      </div>
    </CardContent>
  </Card>
);

const MentorshipOverviewCard = ({ mentorship }) => (
  <Card>
    <CardHeader>
      <CardTitle>Mentorship Impact</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm">Active Programs</span>
          <span className="font-semibold">{mentorship.length || 2}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Hours This Month</span>
          <span className="font-semibold">12h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Impact Score</span>
          <span className="font-semibold">9.2/10</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TeamPerformanceCard = ({ teamAnalytics }) => (
  <Card>
    <CardHeader>
      <CardTitle>Team Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm">Team Efficiency</span>
          <span className="font-semibold">{teamAnalytics.efficiency || 87}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Collaboration Score</span>
          <span className="font-semibold">{teamAnalytics.collaborationScore || 94}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Project Success Rate</span>
          <span className="font-semibold">{teamAnalytics.successRate || 92}%</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Helper Components for Enhanced Sections

const MentorshipProgramCard = ({ program, isActive, onJoin }) => (
  <div className={`p-4 border rounded-lg ${isActive ? 'bg-blue-50 border-blue-200' : 'hover:shadow-md'} transition-shadow`}>
    <div className="flex justify-between items-start mb-3">
      <div>
        <h5 className="font-medium">{program.title}</h5>
        <p className="text-sm text-gray-600">{program.description}</p>
      </div>
      <Badge variant={program.type === 'mentor' ? 'success' : program.type === 'mentee' ? 'warning' : 'secondary'}>
        {program.type}
      </Badge>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-3">
      <div>
        <p className="text-xs text-gray-500">Duration</p>
        <p className="text-sm font-medium">{program.duration}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Commitment</p>
        <p className="text-sm font-medium">{program.commitment}</p>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-1 mb-3">
      {program.skills.map((skill, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {skill}
        </Badge>
      ))}
    </div>
    
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{program.participants} participants</span>
      {!isActive && onJoin && (
        <Button size="sm" onClick={onJoin}>
          Join Program
        </Button>
      )}
      {isActive && (
        <Badge variant="success">Active</Badge>
      )}
    </div>
  </div>
);

const CollaborationProjectCard = ({ project, onJoin }) => (
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h5 className="font-medium">{project.name}</h5>
        <p className="text-sm text-gray-600">{project.description}</p>
      </div>
      <Badge variant="outline">{project.category}</Badge>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-3">
      <div>
        <p className="text-xs text-gray-500">Team Size</p>
        <p className="text-sm font-medium">{project.team} members</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Duration</p>
        <p className="text-sm font-medium">{project.duration}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Commitment</p>
        <p className="text-sm font-medium">{project.commitment}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Difficulty</p>
        <Badge variant={project.difficulty === 'Advanced' ? 'destructive' : project.difficulty === 'Intermediate' ? 'warning' : 'success'} className="text-xs">
          {project.difficulty}
        </Badge>
      </div>
    </div>
    
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        <span>{project.progress}%</span>
      </div>
      <Progress value={project.progress} className="h-2" />
    </div>
    
    <div className="flex flex-wrap gap-1 mb-3">
      {project.skills.map((skill, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {skill}
        </Badge>
      ))}
    </div>
    
    <div className="flex justify-between items-center">
      <Badge variant={project.status === 'recruiting' ? 'success' : project.status === 'active' ? 'warning' : 'secondary'}>
        {project.status}
      </Badge>
      <Button size="sm" onClick={onJoin}>
        Join Project
      </Button>
    </div>
  </div>
);

const TeamPerformanceRow = ({ team }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex justify-between items-center mb-3">
      <div>
        <h5 className="font-medium">{team.name}</h5>
        <p className="text-sm text-gray-600">{team.members} members • {team.projects} active projects</p>
      </div>
      <Badge variant="success">{team.efficiency}% efficiency</Badge>
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-xs text-gray-500">Team Efficiency</p>
        <Progress value={team.efficiency} className="mt-1" />
      </div>
      <div>
        <p className="text-xs text-gray-500">Collaboration Score</p>
        <Progress value={85} className="mt-1" />
      </div>
      <div>
        <p className="text-xs text-gray-500">Project Success</p>
        <Progress value={92} className="mt-1" />
      </div>
    </div>
  </div>
);

const NetworkingEventCard = ({ event }) => (
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h5 className="font-medium">{event.title}</h5>
        <p className="text-sm text-gray-600">{event.type} • {event.industry}</p>
      </div>
      <Badge variant={event.virtual ? 'secondary' : 'outline'}>
        {event.virtual ? 'Virtual' : 'In-Person'}
      </Badge>
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
    </div>
    
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{event.attendees} attendees</span>
      <Button size="sm">
        Register
      </Button>
    </div>
  </div>
);

export default EnhancedSocialCollaborationDashboard;