import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Brain,
  MessageSquare,
  Target,
  CheckCircle,
  Eye,
  Rocket,
  Network,
  Star,
  UserPlus,
  MessageCircle,
  Handshake,
  Building,
  Activity,
  Heart,
  ThumbsUp
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell
} from 'recharts';

const SocialFeaturesEnhancement = () => {
  const [activeTab, setActiveTab] = useState('peer-matching');
  const [peerMatches, setPeerMatches] = useState([]);
  const [networkingData, setNetworkingData] = useState([]);
  const [socialMetrics, setSocialMetrics] = useState([]);
  const [collaborationInsights, setCollaborationInsights] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  // Mock peer matching data
  const peerMatchingData = [
    {
      id: 'match-001',
      user: 'Sarah Johnson',
      role: 'Senior Developer',
      department: 'Engineering',
      match_score: 94.2,
      compatibility: 'Excellent',
      shared_skills: ['React', 'Node.js', 'Machine Learning', 'Team Leadership'],
      complementary_skills: ['DevOps', 'System Architecture'],
      common_interests: ['AI/ML', 'Open Source', 'Mentoring'],
      collaboration_potential: 'High',
      suggested_projects: ['AI Dashboard', 'ML Pipeline', 'Code Review System'],
      personality_match: 87.6,
      work_style_compatibility: 91.3,
      communication_style: 'Direct, Collaborative',
      availability: 'High',
      previous_collaborations: 3,
      success_rate: 89.2,
      ai_reasoning: 'Strong technical alignment with complementary leadership skills. High collaboration success rate in previous projects.'
    },
    {
      id: 'match-002',
      user: 'Michael Chen',
      role: 'Data Scientist',
      department: 'Analytics',
      match_score: 91.7,
      compatibility: 'Excellent',
      shared_skills: ['Python', 'Machine Learning', 'Data Analysis', 'Research'],
      complementary_skills: ['Statistics', 'Deep Learning', 'Data Visualization'],
      common_interests: ['Research', 'Innovation', 'Knowledge Sharing'],
      collaboration_potential: 'High',
      suggested_projects: ['Predictive Analytics', 'ML Research', 'Data Pipeline'],
      personality_match: 93.4,
      work_style_compatibility: 88.9,
      communication_style: 'Analytical, Thoughtful',
      availability: 'Medium',
      previous_collaborations: 5,
      success_rate: 94.1,
      ai_reasoning: 'Exceptional personality and technical compatibility. Strong track record of successful research collaborations.'
    },
    {
      id: 'match-003',
      user: 'Emma Rodriguez',
      role: 'UX Designer',
      department: 'Design',
      match_score: 88.3,
      compatibility: 'Very Good',
      shared_skills: ['User Research', 'Design Thinking', 'Prototyping', 'Collaboration'],
      complementary_skills: ['Visual Design', 'Interaction Design', 'Usability Testing'],
      common_interests: ['User Experience', 'Innovation', 'Cross-functional Work'],
      collaboration_potential: 'High',
      suggested_projects: ['User Interface Redesign', 'Design System', 'User Research'],
      personality_match: 85.7,
      work_style_compatibility: 89.8,
      communication_style: 'Creative, Empathetic',
      availability: 'High',
      previous_collaborations: 2,
      success_rate: 92.5,
      ai_reasoning: 'Strong design-development collaboration potential. Complementary skills with high creative synergy.'
    }
  ];

  const networkingOpportunities = [
    {
      id: 'network-001',
      type: 'Industry Expert',
      name: 'Dr. Lisa Wang',
      title: 'AI Research Director',
      company: 'TechCorp',
      expertise: ['Artificial Intelligence', 'Machine Learning', 'Research'],
      connection_strength: 'Second Degree',
      mutual_connections: 3,
      relevance_score: 92.4,
      networking_potential: 'High',
      suggested_approach: 'Introduction through mutual connection',
      common_interests: ['AI Research', 'Innovation', 'Technical Leadership'],
      recent_activity: 'Published paper on ML optimization',
      availability: 'Open to networking',
      ai_recommendation: 'Excellent opportunity for AI research collaboration and knowledge exchange.'
    },
    {
      id: 'network-002',
      type: 'Potential Mentor',
      name: 'James Thompson',
      title: 'VP of Engineering',
      company: 'InnovateTech',
      expertise: ['Engineering Leadership', 'Team Building', 'Technical Strategy'],
      connection_strength: 'Third Degree',
      mutual_connections: 2,
      relevance_score: 89.1,
      networking_potential: 'High',
      suggested_approach: 'Professional introduction via LinkedIn',
      common_interests: ['Leadership Development', 'Technical Excellence', 'Team Growth'],
      recent_activity: 'Speaking at tech conference',
      availability: 'Limited availability',
      ai_recommendation: 'Valuable mentorship opportunity for leadership development and career growth.'
    }
  ];

  const socialMetricsData = [
    { name: 'Mon', connections: 12, interactions: 45, collaborations: 8, satisfaction: 4.2 },
    { name: 'Tue', connections: 15, interactions: 52, collaborations: 11, satisfaction: 4.3 },
    { name: 'Wed', connections: 18, interactions: 48, collaborations: 9, satisfaction: 4.4 },
    { name: 'Thu', connections: 14, interactions: 56, collaborations: 13, satisfaction: 4.5 },
    { name: 'Fri', connections: 16, interactions: 41, collaborations: 7, satisfaction: 4.3 },
    { name: 'Sat', connections: 8, interactions: 23, collaborations: 3, satisfaction: 4.1 },
    { name: 'Sun', connections: 6, interactions: 18, collaborations: 2, satisfaction: 4.0 }
  ];

  const collaborationNetwork = [
    { department: 'Engineering', connections: 45, strength: 'Strong' },
    { department: 'Design', connections: 32, strength: 'Medium' },
    { department: 'Product', connections: 28, strength: 'Medium' },
    { department: 'Marketing', connections: 19, strength: 'Weak' },
    { department: 'Data Science', connections: 38, strength: 'Strong' },
    { department: 'Customer Success', connections: 24, strength: 'Medium' }
  ];

  const socialInsights = [
    {
      type: 'Networking Opportunity',
      insight: 'AI-powered analysis identifies 23 high-value networking opportunities within your extended professional network.',
      confidence: 0.91,
      impact: 'High',
      actionItems: [
        'Connect with 5 industry experts in AI/ML field',
        'Attend virtual networking events in your domain',
        'Engage with thought leaders on professional platforms'
      ],
      trend: 'up',
      metric: '+34% networking potential'
    },
    {
      type: 'Collaboration Gap',
      insight: 'Cross-departmental collaboration is 45% lower than optimal, particularly between Engineering and Marketing teams.',
      confidence: 0.87,
      impact: 'Medium',
      actionItems: [
        'Schedule cross-departmental project sessions',
        'Create shared workspace for collaboration',
        'Implement regular inter-team knowledge sharing'
      ],
      trend: 'down',
      metric: '-12% cross-team projects'
    }
  ];

  useEffect(() => {
    setPeerMatches(peerMatchingData);
    setNetworkingData(networkingOpportunities);
    setSocialMetrics(socialMetricsData);
    setCollaborationInsights(socialInsights);
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
    }, 2000);
  };

  const runPeerMatching = useCallback(async () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setPeerMatches(prev => prev.map(match => ({ 
        ...match, 
        match_score: Math.min(match.match_score + Math.random() * 5, 100) 
      })));
    }, 3000);
  }, []);

  const renderPeerMatchingTab = () => (
    <div className="space-y-6">
      {/* Peer Matching Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Matches</p>
                <p className="text-2xl font-bold">{peerMatches.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Match Score</p>
                <p className="text-2xl font-bold">90.0%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Collaborations</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Handshake className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">91.1%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Peer Matches */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Peer Matching</CardTitle>
          <CardDescription>Advanced algorithms match you with compatible colleagues for collaboration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {peerMatches.map(match => (
              <div key={match.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{match.user}</h3>
                      <p className="text-sm text-muted-foreground">{match.role} • {match.department}</p>
                    </div>
                    <Badge variant={match.compatibility === 'Excellent' ? 'default' : 'secondary'}>
                      {match.compatibility}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {match.match_score.toFixed(1)}% match
                    </Badge>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Personality Match</p>
                    <p className="font-medium">{match.personality_match}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Work Style</p>
                    <p className="font-medium">{match.work_style_compatibility}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Availability</p>
                    <p className="font-medium">{match.availability}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{match.success_rate}%</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Shared Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {match.shared_skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Complementary Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {match.complementary_skills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Suggested Projects:</h4>
                    <div className="flex flex-wrap gap-1">
                      {match.suggested_projects.map(project => (
                        <Badge key={project} variant="default" className="text-xs">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <Brain className="h-4 w-4 mr-1 text-purple-500" />
                      AI Analysis:
                    </h4>
                    <p className="text-sm text-muted-foreground">{match.ai_reasoning}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span>Communication: {match.communication_style}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Start Collaboration
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNetworkingTab = () => (
    <div className="space-y-6">
      {/* Networking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Size</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <Network className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Connections</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Networking Score</p>
                <p className="text-2xl font-bold">87.3</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Opportunities</p>
                <p className="text-2xl font-bold">{networkingData.length}</p>
              </div>
              <Rocket className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Networking Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Networking Opportunities</CardTitle>
          <CardDescription>AI-identified networking opportunities based on your goals and interests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {networkingData.map(opportunity => (
              <div key={opportunity.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Network className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{opportunity.name}</h3>
                      <p className="text-sm text-muted-foreground">{opportunity.title} • {opportunity.company}</p>
                    </div>
                    <Badge variant={opportunity.type === 'Industry Expert' ? 'default' : 
                                   opportunity.type === 'Potential Mentor' ? 'secondary' : 'outline'}>
                      {opportunity.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {opportunity.relevance_score.toFixed(1)}% relevance
                    </Badge>
                    <Badge variant={opportunity.networking_potential === 'High' ? 'default' : 'secondary'}>
                      {opportunity.networking_potential}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Connection</p>
                    <p className="font-medium">{opportunity.connection_strength}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mutual Connections</p>
                    <p className="font-medium">{opportunity.mutual_connections}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Availability</p>
                    <p className="font-medium">{opportunity.availability}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Recent Activity</p>
                    <p className="font-medium text-xs">{opportunity.recent_activity}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Expertise:</h4>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.expertise.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Common Interests:</h4>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.common_interests.map(interest => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <Brain className="h-4 w-4 mr-1 text-purple-500" />
                      AI Recommendation:
                    </h4>
                    <p className="text-sm text-muted-foreground">{opportunity.ai_recommendation}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm">
                      <span className="font-medium">Suggested Approach:</span> {opportunity.suggested_approach}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Network */}
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Network</CardTitle>
          <CardDescription>Cross-departmental collaboration strength and opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborationNetwork.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{dept.department}</span>
                  <Badge variant={dept.strength === 'Strong' ? 'default' : 
                                 dept.strength === 'Medium' ? 'secondary' : 'destructive'}>
                    {dept.strength}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">{dept.connections} connections</span>
                  <Progress value={(dept.connections / 50) * 100} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSocialMetricsTab = () => (
    <div className="space-y-6">
      {/* Social Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Interactions</p>
                <p className="text-2xl font-bold">283</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Connections</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction Score</p>
                <p className="text-2xl font-bold">4.3</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Social Activity Trends</CardTitle>
          <CardDescription>Weekly social engagement and collaboration metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={socialMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="connections" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="interactions" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="collaborations" stroke="#ffc658" strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                <p className="text-2xl font-bold">{collaborationInsights.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Impact</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">90.5%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Action Items</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Social Insights</CardTitle>
          <CardDescription>Advanced analytics and recommendations for social collaboration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborationInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{insight.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(insight.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={insight.impact === 'High' ? 'default' : 'secondary'}>
                      {insight.impact} Impact
                    </Badge>
                    <Badge variant={insight.trend === 'up' ? 'default' : 'destructive'}>
                      {insight.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {insight.metric}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm mb-3">{insight.insight}</p>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {insight.actionItems.map((action, actionIndex) => (
                      <li key={actionIndex} className="text-sm text-muted-foreground flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Features Enhancement</h1>
          <p className="text-muted-foreground">
            Advanced peer matching algorithms and networking tools for enhanced collaboration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={runPeerMatching} disabled={isMatching}>
            {isMatching ? (
              <Activity className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {isMatching ? 'Matching...' : 'Run AI Matching'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="peer-matching">Peer Matching</TabsTrigger>
          <TabsTrigger value="networking">Networking</TabsTrigger>
          <TabsTrigger value="social-metrics">Social Metrics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="peer-matching" className="space-y-4">
          {renderPeerMatchingTab()}
        </TabsContent>

        <TabsContent value="networking" className="space-y-4">
          {renderNetworkingTab()}
        </TabsContent>

        <TabsContent value="social-metrics" className="space-y-4">
          {renderSocialMetricsTab()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {renderInsightsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

