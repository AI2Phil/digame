import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { Progress } from '../../components/ui/Progress';
import {
  TrendingUp,
  Target,
  Users,
  Calendar,
  Clock,
  Star,
  Award,
  BookOpen,
  Briefcase,
  MapPin,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Settings,
  Edit,
  Eye,
  Share2,
  Download,
  Upload,
  RefreshCw,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Zap,
  Lightbulb,
  Brain,
  Compass,
  Route,
  Flag,
  Mountain,
  Rocket,
  Globe,
  Building,
  GraduationCap,
} from 'lucide-react';

const CareerModeling: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('current');
  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [timeHorizon, setTimeHorizon] = useState('5y');

  useEffect(() => {
    fetchCareerData();
  }, []);

  const fetchCareerData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/career/modeling', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCareerData(data);
      }
    } catch (error) {
      console.error('Error fetching career data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockCareerData = {
    currentProfile: {
      title: 'Senior Software Engineer',
      level: 'Senior',
      department: 'Engineering',
      company: 'TechCorp',
      experience: '5 years',
      salary: '$95,000',
      location: 'San Francisco, CA',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
      strengths: ['Problem Solving', 'Team Leadership', 'Technical Architecture'],
      areas: ['Public Speaking', 'Product Management', 'Data Science'],
      satisfaction: 4.2,
      marketValue: '$85,000 - $110,000',
    },
    careerPaths: [
      {
        id: 1,
        title: 'Technical Lead',
        category: 'Technical Leadership',
        timeline: '1-2 years',
        probability: 85,
        salaryRange: '$110,000 - $140,000',
        requirements: [
          'Advanced system design skills',
          'Team mentoring experience',
          'Architecture decision making',
          'Cross-functional collaboration',
        ],
        skills: ['System Design', 'Leadership', 'Mentoring', 'Architecture'],
        companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
        growth: '+25%',
        difficulty: 'Medium',
        satisfaction: 4.5,
        description:
          'Lead technical initiatives and mentor junior developers while maintaining hands-on coding responsibilities.',
      },
      {
        id: 2,
        title: 'Engineering Manager',
        category: 'People Management',
        timeline: '2-3 years',
        probability: 70,
        salaryRange: '$120,000 - $160,000',
        requirements: [
          'People management experience',
          'Project planning skills',
          'Budget management',
          'Strategic thinking',
        ],
        skills: ['Management', 'Strategy', 'Communication', 'Planning'],
        companies: ['Stripe', 'Airbnb', 'Uber', 'Netflix'],
        growth: '+35%',
        difficulty: 'High',
        satisfaction: 4.3,
        description:
          'Manage engineering teams, drive product delivery, and contribute to technical strategy.',
      },
      {
        id: 3,
        title: 'Principal Engineer',
        category: 'Technical Excellence',
        timeline: '3-5 years',
        probability: 60,
        salaryRange: '$150,000 - $200,000',
        requirements: [
          'Deep technical expertise',
          'Industry recognition',
          'Innovation track record',
          'Thought leadership',
        ],
        skills: ['Advanced Architecture', 'Innovation', 'Research', 'Thought Leadership'],
        companies: ['Apple', 'Tesla', 'SpaceX', 'OpenAI'],
        growth: '+65%',
        difficulty: 'Very High',
        satisfaction: 4.7,
        description:
          'Drive technical innovation and architectural decisions across multiple teams and products.',
      },
      {
        id: 4,
        title: 'Product Manager',
        category: 'Product Strategy',
        timeline: '2-4 years',
        probability: 45,
        salaryRange: '$105,000 - $145,000',
        requirements: [
          'Product strategy experience',
          'Market analysis skills',
          'User research background',
          'Cross-functional leadership',
        ],
        skills: ['Product Strategy', 'Market Analysis', 'User Research', 'Leadership'],
        companies: ['Salesforce', 'Adobe', 'Slack', 'Zoom'],
        growth: '+20%',
        difficulty: 'High',
        satisfaction: 4.1,
        description:
          'Define product strategy, work with engineering teams, and drive product success metrics.',
      },
      {
        id: 5,
        title: 'Solutions Architect',
        category: 'Technical Consulting',
        timeline: '1-3 years',
        probability: 75,
        salaryRange: '$100,000 - $135,000',
        requirements: [
          'Client-facing experience',
          'Solution design skills',
          'Communication abilities',
          'Industry knowledge',
        ],
        skills: ['Solution Design', 'Client Relations', 'Consulting', 'Communication'],
        companies: ['AWS', 'Microsoft', 'IBM', 'Accenture'],
        growth: '+15%',
        difficulty: 'Medium',
        satisfaction: 4.0,
        description: 'Design technical solutions for clients and guide implementation strategies.',
      },
      {
        id: 6,
        title: 'Startup CTO',
        category: 'Entrepreneurship',
        timeline: '3-7 years',
        probability: 25,
        salaryRange: '$80,000 - $200,000+',
        requirements: [
          'Full-stack expertise',
          'Business acumen',
          'Risk tolerance',
          'Leadership experience',
        ],
        skills: ['Full-Stack Development', 'Business Strategy', 'Leadership', 'Innovation'],
        companies: ['Early-stage startups', 'Y Combinator', 'Techstars', 'Self-founded'],
        growth: 'Variable',
        difficulty: 'Very High',
        satisfaction: 4.8,
        description:
          'Lead technology strategy and development for early-stage companies with high growth potential.',
      },
    ],
    milestones: [
      {
        id: 1,
        title: 'Complete System Design Course',
        category: 'Technical Skills',
        deadline: '2024-03-01',
        progress: 65,
        importance: 'High',
        relatedPaths: ['Technical Lead', 'Principal Engineer'],
        estimatedTime: '40 hours',
        status: 'In Progress',
      },
      {
        id: 2,
        title: 'Lead Cross-Team Project',
        category: 'Leadership',
        deadline: '2024-06-01',
        progress: 30,
        importance: 'High',
        relatedPaths: ['Technical Lead', 'Engineering Manager'],
        estimatedTime: '3 months',
        status: 'Planning',
      },
      {
        id: 3,
        title: 'Obtain AWS Certification',
        category: 'Certifications',
        deadline: '2024-04-15',
        progress: 80,
        importance: 'Medium',
        relatedPaths: ['Solutions Architect', 'Principal Engineer'],
        estimatedTime: '60 hours',
        status: 'In Progress',
      },
      {
        id: 4,
        title: 'Mentor Junior Developers',
        category: 'Leadership',
        deadline: '2024-12-31',
        progress: 45,
        importance: 'High',
        relatedPaths: ['Technical Lead', 'Engineering Manager'],
        estimatedTime: 'Ongoing',
        status: 'In Progress',
      },
    ],
    insights: {
      marketTrends: [
        {
          trend: 'AI/ML Integration',
          impact: 'High',
          relevance: 85,
          description: 'Growing demand for engineers with AI/ML experience across all roles',
        },
        {
          trend: 'Remote Work Adoption',
          impact: 'Medium',
          relevance: 70,
          description: 'Increased opportunities for remote positions and global companies',
        },
        {
          trend: 'Cloud-Native Development',
          impact: 'High',
          relevance: 90,
          description: 'Strong demand for cloud architecture and containerization skills',
        },
        {
          trend: 'DevOps Integration',
          impact: 'Medium',
          relevance: 75,
          description: 'Expectation for developers to understand deployment and operations',
        },
      ],
      recommendations: [
        {
          type: 'Skill Development',
          priority: 'High',
          action: 'Learn Machine Learning fundamentals',
          impact: 'Increases opportunities in all technical paths by 40%',
          timeframe: '3-6 months',
        },
        {
          type: 'Experience',
          priority: 'High',
          action: 'Take on leadership responsibilities',
          impact: 'Essential for management and senior technical roles',
          timeframe: '6-12 months',
        },
        {
          type: 'Networking',
          priority: 'Medium',
          action: 'Attend industry conferences and meetups',
          impact: 'Improves visibility and career opportunities',
          timeframe: 'Ongoing',
        },
        {
          type: 'Certification',
          priority: 'Medium',
          action: 'Complete cloud architecture certification',
          impact: 'Validates expertise for senior roles',
          timeframe: '2-3 months',
        },
      ],
    },
    analytics: {
      pathComparison: {
        technical: { satisfaction: 4.5, growth: 45, difficulty: 3.5 },
        management: { satisfaction: 4.2, growth: 35, difficulty: 4.0 },
        product: { satisfaction: 4.1, growth: 25, difficulty: 3.8 },
        consulting: { satisfaction: 4.0, growth: 20, difficulty: 3.2 },
      },
      industryBenchmarks: {
        averageSalary: '$92,000',
        topPercentile: '$145,000',
        experienceMultiplier: 1.15,
        locationPremium: 1.25,
      },
    },
  };

  const currentData = careerData || mockCareerData;

  const getDifficultyColor = difficulty => {
    switch (difficulty) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Very High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePathSelection = path => {
    setSelectedPath(path);
  };

  const handleCreatePlan = async pathId => {
    try {
      const response = await fetch('/api/career/modeling/create-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ pathId, timeHorizon }),
      });

      if (response.ok) {
        // Handle success
        router.push('/career/learning');
      }
    } catch (error) {
      console.error('Error creating career plan:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Career Path Modeling"
        subtitle="AI-powered career progression planning and opportunity analysis"
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'current'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Briefcase className="h-4 w-4 inline mr-2" />
          Current Profile
        </button>
        <button
          onClick={() => setActiveTab('paths')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'paths'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Route className="h-4 w-4 inline mr-2" />
          Career Paths
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'milestones'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Flag className="h-4 w-4 inline mr-2" />
          Milestones
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="h-4 w-4 inline mr-2" />
          AI Insights
        </button>
      </div>

      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Current Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Current Career Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{currentData.currentProfile.title}</h3>
                    <p className="text-gray-600">{currentData.currentProfile.company}</p>
                    <p className="text-sm text-gray-500">{currentData.currentProfile.location}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {currentData.currentProfile.level}
                      </div>
                      <div className="text-xs text-gray-600">Level</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {currentData.currentProfile.experience}
                      </div>
                      <div className="text-xs text-gray-600">Experience</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Compensation</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {currentData.currentProfile.salary}
                    </div>
                    <div className="text-sm text-gray-600">
                      Market Range: {currentData.currentProfile.marketValue}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Satisfaction</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= currentData.currentProfile.satisfaction
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {currentData.currentProfile.satisfaction}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Top Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentData.currentProfile.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Strengths</h4>
                    <div className="flex flex-wrap gap-1">
                      {currentData.currentProfile.strengths.map((strength, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentData.currentProfile.areas.map((area, index) => (
                  <div key={index} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800">{area}</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Developing this skill could unlock new career opportunities
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'paths' && (
        <div className="space-y-6">
          {/* Career Paths Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentData.careerPaths.map(path => (
              <Card
                key={path.id}
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedPath?.id === path.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handlePathSelection(path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <p className="text-sm text-gray-600">{path.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getDifficultyColor(path.difficulty)}>
                        {path.difficulty}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">{path.timeline}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Probability and Salary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Success Probability</div>
                      <div className="flex items-center gap-2">
                        <Progress value={path.probability} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{path.probability}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Salary Growth</div>
                      <div className="text-lg font-bold text-green-600">{path.growth}</div>
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <div className="text-sm text-gray-600">Salary Range</div>
                    <div className="text-lg font-bold text-blue-600">{path.salaryRange}</div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700">{path.description}</p>

                  {/* Key Requirements */}
                  <div>
                    <div className="text-sm font-medium mb-2">Key Requirements</div>
                    <div className="space-y-1">
                      {path.requirements.slice(0, 3).map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{req}</span>
                        </div>
                      ))}
                      {path.requirements.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{path.requirements.length - 3} more requirements
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Companies */}
                  <div>
                    <div className="text-sm font-medium mb-2">Top Companies</div>
                    <div className="flex flex-wrap gap-1">
                      {path.companies.slice(0, 3).map((company, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {company}
                        </Badge>
                      ))}
                      {path.companies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{path.companies.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm"
                      className="flex-1"
                      onClick={(e) => {  
                        e.stopPropagation();
                        handleCreatePlan(path.id);
                        }} disabled={false}
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Create Plan
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {}} disabled={false}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-4">
          {currentData.milestones.map(milestone => (
            <Card key={milestone.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div>
                      <h4 className="font-medium text-lg">{milestone.title}</h4>
                      <p className="text-sm text-gray-600">{milestone.category}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Progress</div>
                        <div className="flex items-center gap-2">
                          <Progress value={milestone.progress} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{milestone.progress}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Deadline</div>
                        <div className="text-sm font-medium">
                          {new Date(milestone.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Time Investment</div>
                        <div className="text-sm font-medium">{milestone.estimatedTime}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Related Career Paths</div>
                      <div className="flex flex-wrap gap-1">
                        {milestone.relatedPaths.map((path, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {path}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getPriorityColor(milestone.importance)}>
                      {milestone.importance}
                    </Badge>
                    <Badge className={getStatusColor(milestone.status)}>{milestone.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => {}} disabled={false}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Trends & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentData.insights.marketTrends.map((trend, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{trend.trend}</h4>
                      <Badge variant={trend.impact === 'High' ? 'destructive' : 'secondary'}>
                        {trend.impact} Impact
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-600">Relevance to You:</div>
                        <Progress value={trend.relevance} className="h-2 w-20" />
                        <span className="text-xs">{trend.relevance}%</span>
                      </div>
                      <p className="text-sm text-gray-700">{trend.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.insights.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <h4 className="font-medium">{rec.action}</h4>
                          <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rec.type}</p>
                        <p className="text-sm text-gray-700">{rec.impact}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>Timeline: {rec.timeframe}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {}} disabled={false}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Career Path Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Path Comparison</h4>
                  <div className="space-y-4">
                    {Object.entries(currentData.analytics.pathComparison).map(([path, metrics]) => (
                      <div key={path} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium capitalize">{path}</span>
                          <span className="text-sm text-gray-600">
                            Score: {(metrics as any).satisfaction}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-gray-600">Satisfaction</div>
                            <Progress value={((metrics as any).satisfaction / 5) * 100} className="h-1" />
                          </div>
                          <div>
                            <div className="text-gray-600">Growth</div>
                            <Progress value={(metrics as any).growth} className="h-1" />
                          </div>
                          <div>
                            <div className="text-gray-600">Difficulty</div>
                            <Progress value={((metrics as any).difficulty / 5) * 100} className="h-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Industry Benchmarks</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {currentData.analytics.industryBenchmarks.averageSalary}
                        </div>
                        <div className="text-xs text-gray-600">Industry Average</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {currentData.analytics.industryBenchmarks.topPercentile}
                        </div>
                        <div className="text-xs text-gray-600">Top 10%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-lg font-bold text-purple-600">
                          {currentData.analytics.industryBenchmarks.experienceMultiplier}x
                        </div>
                        <div className="text-xs text-gray-600">Experience Multiplier</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <div className="text-lg font-bold text-orange-600">
                          {currentData.analytics.industryBenchmarks.locationPremium}x
                        </div>
                        <div className="text-xs text-gray-600">Location Premium</div>
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

export default CareerModeling;
