import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, MessageCircle, Target, 
  Award, Handshake, Globe, TrendingUp,
  Star, Clock, MapPin, Zap, Heart,
  BookOpen, Coffee, Lightbulb, Network
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import { Toast } from '../components/ui/Toast';
import socialService from '../services/socialService';
import apiService from '../services/apiService';

const SocialCollaborationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [peerMatches, setPeerMatches] = useState([]);
  const [mentorshipMatches, setMentorshipMatches] = useState({});
  const [collaborationProjects, setCollaborationProjects] = useState([]);
  const [networkData, setNetworkData] = useState({});
  const [communityData, setCommunityData] = useState({});

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      
      // Initialize social service
      await socialService.initialize(userId);

      // Load all social collaboration data
      const [
        peerMatchData,
        mentorshipData,
        projectData,
        networkInfo,
        communityInfo
      ] = await Promise.all([
        socialService.generatePeerMatches(),
        socialService.generateMentorshipMatches(),
        socialService.matchCollaborationProjects(),
        socialService.buildProfessionalNetwork(),
        socialService.buildIndustryCommunities()
      ]);

      setPeerMatches(peerMatchData.peerMatches);
      setMentorshipMatches(mentorshipData);
      setCollaborationProjects(projectData.projectMatches);
      setNetworkData(networkInfo);
      setCommunityData(communityInfo);

    } catch (error) {
      console.error('Failed to load social collaboration data:', error);
      Toast.error('Failed to load social collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWithPeer = async (peerId) => {
    try {
      await apiService.sendConnectionRequest(peerId);
      Toast.success('Connection request sent!');
      loadSocialData(); // Refresh data
    } catch (error) {
      Toast.error('Failed to send connection request');
    }
  };

  const handleJoinProject = async (projectId) => {
    try {
      await apiService.joinCollaborationProject(projectId);
      Toast.success('Successfully joined project!');
      loadSocialData(); // Refresh data
    } catch (error) {
      Toast.error('Failed to join project');
    }
  };

  const handleStartMentorship = async (mentorId, type) => {
    try {
      await apiService.requestMentorship(mentorId, type);
      Toast.success('Mentorship request sent!');
      loadSocialData(); // Refresh data
    } catch (error) {
      Toast.error('Failed to send mentorship request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Building your social collaboration network...</p>
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
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Social Collaboration</h1>
              <p className="text-gray-600">Connect, learn, and grow with your professional community</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SocialMetricCard
              title="Peer Matches"
              value={peerMatches.length}
              icon={Users}
              color="blue"
              trend="New matches available"
            />
            <SocialMetricCard
              title="Active Connections"
              value={networkData.industryConnections?.length || 0}
              icon={Network}
              color="green"
              trend="Growing network"
            />
            <SocialMetricCard
              title="Collaboration Projects"
              value={collaborationProjects.length}
              icon={Target}
              color="purple"
              trend="Projects available"
            />
            <SocialMetricCard
              title="Community Groups"
              value={communityData.relevantCommunities?.length || 0}
              icon={Globe}
              color="orange"
              trend="Active communities"
            />
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="peer-matching">Peer Matching</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <SocialOverviewSection 
              peerMatches={peerMatches.slice(0, 3)}
              mentorshipMatches={mentorshipMatches}
              projects={collaborationProjects.slice(0, 3)}
              onConnectPeer={handleConnectWithPeer}
              onJoinProject={handleJoinProject}
            />
          </TabsContent>

          {/* Peer Matching Tab */}
          <TabsContent value="peer-matching" className="space-y-6">
            <PeerMatchingSection 
              peerMatches={peerMatches}
              onConnect={handleConnectWithPeer}
            />
          </TabsContent>

          {/* Mentorship Tab */}
          <TabsContent value="mentorship" className="space-y-6">
            <MentorshipSection 
              mentorshipData={mentorshipMatches}
              onStartMentorship={handleStartMentorship}
            />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <CollaborationProjectsSection 
              projects={collaborationProjects}
              onJoinProject={handleJoinProject}
            />
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <CommunitiesSection 
              communityData={communityData}
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
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
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
const SocialOverviewSection = ({ peerMatches, mentorshipMatches, projects, onConnectPeer, onJoinProject }) => (
  <div className="space-y-6">
    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="flex items-center gap-2 h-auto p-4">
            <UserPlus className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Find Peers</div>
              <div className="text-xs opacity-75">Discover learning partners</div>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
            <Handshake className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Find Mentor</div>
              <div className="text-xs opacity-75">Get expert guidance</div>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
            <Target className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Join Project</div>
              <div className="text-xs opacity-75">Collaborate on projects</div>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
            <Globe className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Join Community</div>
              <div className="text-xs opacity-75">Connect with industry</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Top Peer Matches */}
    <Card>
      <CardHeader>
        <CardTitle>Top Peer Matches</CardTitle>
        <CardDescription>Professionals with complementary skills and shared goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {peerMatches.map((match, index) => (
            <PeerMatchCard 
              key={index} 
              match={match} 
              onConnect={() => onConnectPeer(match.id)}
              compact={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Featured Projects */}
    <Card>
      <CardHeader>
        <CardTitle>Featured Collaboration Projects</CardTitle>
        <CardDescription>Join projects that match your skills and interests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <ProjectCard 
              key={index} 
              project={project} 
              onJoin={() => onJoinProject(project.id)}
              compact={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Peer Matching Section Component
const PeerMatchingSection = ({ peerMatches, onConnect }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Skill-Based Peer Matching
        </CardTitle>
        <CardDescription>
          Connect with professionals who complement your skills and share your learning goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {peerMatches.map((match, index) => (
            <PeerMatchCard 
              key={index} 
              match={match} 
              onConnect={() => onConnect(match.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Peer Match Card Component
const PeerMatchCard = ({ match, onConnect, compact = false }) => (
  <Card className={`hover:shadow-md transition-shadow ${compact ? 'bg-gray-50' : 'bg-white'}`}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
          <img src={match.avatar || '/default-avatar.png'} alt={match.name} />
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{match.name}</h4>
            <Badge variant="success">
              {Math.round(match.overallScore * 100)}% match
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">{match.role} at {match.company}</p>
          <p className="text-sm text-gray-700 mb-3">{match.matchReason}</p>
          
          {!compact && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{match.location}</span>
                <Clock className="w-4 h-4 text-gray-500 ml-2" />
                <span>{match.timezone}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {match.sharedSkills?.slice(0, 3).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button size="sm" onClick={onConnect}>
          <UserPlus className="w-4 h-4 mr-2" />
          Connect
        </Button>
        {!compact && (
          <Button size="sm" variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Mentorship Section Component
const MentorshipSection = ({ mentorshipData, onStartMentorship }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Find Mentors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Find Mentors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentorshipData.mentorMatches?.slice(0, 3).map((mentor, index) => (
              <MentorCard 
                key={index} 
                mentor={mentor} 
                onStart={() => onStartMentorship(mentor.id, 'mentee')}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Become a Mentor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Become a Mentor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentorshipData.menteeMatches?.slice(0, 3).map((mentee, index) => (
              <MenteeCard 
                key={index} 
                mentee={mentee} 
                onStart={() => onStartMentorship(mentee.id, 'mentor')}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Mentorship Programs */}
    <Card>
      <CardHeader>
        <CardTitle>Structured Mentorship Programs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mentorshipData.mentorshipPrograms?.map((program, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{program.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{program.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{program.duration}</Badge>
                <Button size="sm">Join Program</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Mentor Card Component
const MentorCard = ({ mentor, onStart }) => (
  <Card>
    <CardContent className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <img src={mentor.avatar || '/default-avatar.png'} alt={mentor.name} />
        </Avatar>
        <div>
          <h5 className="font-medium">{mentor.name}</h5>
          <p className="text-sm text-gray-600">{mentor.expertise}</p>
        </div>
      </div>
      <Button size="sm" onClick={onStart}>
        Request
      </Button>
    </CardContent>
  </Card>
);

// Mentee Card Component
const MenteeCard = ({ mentee, onStart }) => (
  <Card>
    <CardContent className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <img src={mentee.avatar || '/default-avatar.png'} alt={mentee.name} />
        </Avatar>
        <div>
          <h5 className="font-medium">{mentee.name}</h5>
          <p className="text-sm text-gray-600">Seeking guidance in {mentee.learningArea}</p>
        </div>
      </div>
      <Button size="sm" onClick={onStart}>
        Mentor
      </Button>
    </CardContent>
  </Card>
);

// Collaboration Projects Section Component
const CollaborationProjectsSection = ({ projects, onJoinProject }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Collaboration Projects
        </CardTitle>
        <CardDescription>
          Join projects that match your skills and help you learn new ones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard 
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

// Project Card Component
const ProjectCard = ({ project, onJoin, compact = false }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
        <p className="text-sm text-gray-600">{project.description}</p>
      </div>
      <Badge variant={project.urgency === 'high' ? 'destructive' : 'secondary'}>
        {project.urgency}
      </Badge>
    </div>
    
    {!compact && (
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{project.teamSize} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{project.duration}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {project.requiredSkills?.slice(0, 3).map((skill, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    )}
    
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <Badge variant="success" className="text-xs">
          {project.matchScore}% match
        </Badge>
      </div>
      <Button size="sm" onClick={onJoin}>
        Join Project
      </Button>
    </div>
    </CardContent>
  </Card>
);

// Communities Section Component
const CommunitiesSection = ({ communityData }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Industry Communities
        </CardTitle>
        <CardDescription>
          Connect with professionals in your industry and related fields
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communityData.relevantCommunities?.map((community, index) => (
            <CommunityCard key={index} community={community} />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Community Card Component
const CommunityCard = ({ community }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-medium">{community.name}</h4>
          <p className="text-sm text-gray-600">{community.memberCount} members</p>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{community.description}</p>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">
          {community.activity} activity
        </Badge>
        <Button size="sm">Join Community</Button>
      </div>
    </CardContent>
  </Card>
);

export default SocialCollaborationDashboard;