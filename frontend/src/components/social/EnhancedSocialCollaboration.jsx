import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { MessageCircle, Users, Briefcase, Award, UserPlus, Search, Filter } from 'lucide-react';
import PeerMessaging from './PeerMessaging';

const EnhancedSocialCollaboration = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [peerMatches, setPeerMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Project creation form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: '',
    difficulty_level: 'intermediate',
    required_skills: [],
    optional_skills: [],
    max_team_size: 5,
    estimated_duration: '',
    time_commitment: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchPeerMatches();
    fetchConnections();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/social-collaboration/projects/matches', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProjects(data.matches || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchPeerMatches = async () => {
    try {
      const response = await fetch('/api/social-collaboration/peer-matches/enhanced?match_type=skills', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPeerMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching peer matches:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/social-collaboration/connections', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const createProject = async () => {
    try {
      const response = await fetch('/api/social-collaboration/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newProject)
      });
      
      if (response.ok) {
        setShowCreateProject(false);
        setNewProject({
          name: '',
          description: '',
          category: '',
          difficulty_level: 'intermediate',
          required_skills: [],
          optional_skills: [],
          max_team_size: 5,
          estimated_duration: '',
          time_commitment: ''
        });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const sendConnectionRequest = async (recipientId) => {
    try {
      const response = await fetch('/api/social-collaboration/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          message: 'I would like to connect with you for collaboration opportunities.'
        })
      });
      
      if (response.ok) {
        fetchPeerMatches();
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const applyToProject = async (projectId) => {
    try {
      const response = await fetch(`/api/social-collaboration/projects/${projectId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: 'I am interested in contributing to this project.',
          proposed_role: 'Contributor',
          relevant_skills: []
        })
      });
      
      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error applying to project:', error);
    }
  };

  const endorseSkill = async (userId, skillName) => {
    try {
      const response = await fetch('/api/social-collaboration/skills/endorse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          endorsed_user_id: userId,
          skill_name: skillName,
          proficiency_level: 'intermediate',
          comment: `Great ${skillName} skills!`
        })
      });
      
      if (response.ok) {
        fetchPeerMatches();
      }
    } catch (error) {
      console.error('Error endorsing skill:', error);
    }
  };

  const openMessaging = (peer) => {
    setSelectedPeer(peer);
    setShowMessaging(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPeers = peerMatches.filter(peer => {
    return peer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           peer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Enhanced Social Collaboration</h1>
        <div className="flex gap-2">
          <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
            <DialogTrigger asChild>
              <Button>
                <Briefcase className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Collaboration Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                />
                <Textarea
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select value={newProject.category} onValueChange={(value) => setNewProject({...newProject, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="mobile-app">Mobile App</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="ai-ml">AI/ML</SelectItem>
                      <SelectItem value="blockchain">Blockchain</SelectItem>
                      <SelectItem value="game-development">Game Development</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newProject.difficulty_level} onValueChange={(value) => setNewProject({...newProject, difficulty_level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Estimated Duration (e.g., 3 months)"
                    value={newProject.estimated_duration}
                    onChange={(e) => setNewProject({...newProject, estimated_duration: e.target.value})}
                  />
                  <Input
                    placeholder="Time Commitment (e.g., 10 hours/week)"
                    value={newProject.time_commitment}
                    onChange={(e) => setNewProject({...newProject, time_commitment: e.target.value})}
                  />
                </div>
                <Button onClick={createProject} className="w-full">Create Project</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search projects, peers, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="web-development">Web Development</SelectItem>
            <SelectItem value="mobile-app">Mobile App</SelectItem>
            <SelectItem value="data-science">Data Science</SelectItem>
            <SelectItem value="ai-ml">AI/ML</SelectItem>
            <SelectItem value="blockchain">Blockchain</SelectItem>
            <SelectItem value="game-development">Game Development</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">
            <Briefcase className="w-4 h-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="peers">
            <Users className="w-4 h-4 mr-2" />
            Find Peers
          </TabsTrigger>
          <TabsTrigger value="connections">
            <MessageCircle className="w-4 h-4 mr-2" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="endorsements">
            <Award className="w-4 h-4 mr-2" />
            Endorsements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant="outline">{project.difficulty_level}</Badge>
                  </div>
                  <Badge variant="secondary">{project.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {project.required_skills?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Team: {project.current_team_size || 1}/{project.max_team_size}</span>
                      <span>Match: {project.match_score}%</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => applyToProject(project.id)} 
                    className="w-full mt-4"
                    size="sm"
                  >
                    Apply to Join
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="peers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPeers.map((peer) => (
              <Card key={peer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={peer.avatar_url} />
                      <AvatarFallback>{peer.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{peer.name}</CardTitle>
                      <p className="text-sm text-gray-600">{peer.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {peer.skills?.slice(0, 4).map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:bg-blue-50"
                            onClick={() => endorseSkill(peer.id, skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Match: {peer.compatibility_score}%</span>
                      <span>{peer.mutual_connections || 0} mutual</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => sendConnectionRequest(peer.id)} 
                        size="sm" 
                        className="flex-1"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Connect
                      </Button>
                      <Button 
                        onClick={() => openMessaging(peer)} 
                        size="sm" 
                        variant="outline"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={connection.avatar_url} />
                      <AvatarFallback>{connection.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{connection.name}</CardTitle>
                      <p className="text-sm text-gray-600">{connection.title}</p>
                    </div>
                  </div>
                  <Badge variant={connection.status === 'accepted' ? 'default' : 'secondary'}>
                    {connection.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {connection.shared_skills?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      onClick={() => openMessaging(connection)} 
                      className="w-full"
                      size="sm"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="endorsements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Endorsements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Endorse your connections' skills to build credibility and strengthen professional relationships.
                Click on skill badges in the peer profiles to endorse them.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Peer Messaging Dialog */}
      <Dialog open={showMessaging} onOpenChange={setShowMessaging}>
        <DialogContent className="max-w-4xl h-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPeer ? `Chat with ${selectedPeer.name}` : 'Peer Messaging'}
            </DialogTitle>
          </DialogHeader>
          {selectedPeer && (
            <PeerMessaging
              peerId={selectedPeer.id}
              peerName={selectedPeer.name}
              peerAvatar={selectedPeer.avatar_url}
              onClose={() => setShowMessaging(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSocialCollaboration;