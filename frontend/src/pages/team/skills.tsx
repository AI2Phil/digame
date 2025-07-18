import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/navigation/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { Progress } from '../../components/ui/Progress';
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Star,
  Award,
  BookOpen,
  Zap,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Settings,
  Edit,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Calendar,
  Lightbulb,
  Code,
  Palette,
  MessageSquare,
  Shield,
  Globe,
  Database,
  Smartphone,
  Monitor,
  Headphones,
  Camera,
  Briefcase,
  Heart,
  Coffee,
  Gamepad2,
  Music,
  Plane,
  Car,
  Home,
  TreePine,
} from 'lucide-react';

const TeamSkills: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const fetchSkillsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team/skills', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSkillsData(data);
      }
    } catch (error) {
      console.error('Error fetching skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockSkillsData = {
    overview: {
      totalSkills: 156,
      teamMembers: 12,
      skillCategories: 8,
      averageSkillLevel: 3.4,
      topSkills: 25,
      skillGaps: 8,
      learningPaths: 15,
      completedTraining: 89,
    },
    categories: [
      {
        id: 'technical',
        name: 'Technical Skills',
        icon: <Code className="h-5 w-5" />,
        color: 'blue',
        skillCount: 45,
        avgLevel: 3.6,
        topSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      },
      {
        id: 'design',
        name: 'Design Skills',
        icon: <Palette className="h-5 w-5" />,
        color: 'purple',
        skillCount: 18,
        avgLevel: 3.2,
        topSkills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
      },
      {
        id: 'communication',
        name: 'Communication',
        icon: <MessageSquare className="h-5 w-5" />,
        color: 'green',
        skillCount: 12,
        avgLevel: 3.8,
        topSkills: ['Public Speaking', 'Writing', 'Presentation', 'Negotiation'],
      },
      {
        id: 'leadership',
        name: 'Leadership',
        icon: <Users className="h-5 w-5" />,
        color: 'orange',
        skillCount: 15,
        avgLevel: 3.1,
        topSkills: ['Team Management', 'Strategic Planning', 'Decision Making'],
      },
      {
        id: 'project-management',
        name: 'Project Management',
        icon: <Target className="h-5 w-5" />,
        color: 'red',
        skillCount: 10,
        avgLevel: 3.5,
        topSkills: ['Agile', 'Scrum', 'Risk Management', 'Resource Planning'],
      },
      {
        id: 'data-analysis',
        name: 'Data Analysis',
        icon: <BarChart3 className="h-5 w-5" />,
        color: 'indigo',
        skillCount: 8,
        avgLevel: 2.9,
        topSkills: ['Excel', 'SQL', 'Tableau', 'Statistics'],
      },
    ],
    teamSkills: [
      {
        id: 1,
        name: 'Sarah Johnson',
        avatar: 'SJ',
        role: 'Team Lead',
        department: 'Engineering',
        totalSkills: 28,
        topSkills: [
          { name: 'Leadership', level: 5, category: 'leadership' },
          { name: 'Project Management', level: 5, category: 'project-management' },
          { name: 'Strategic Planning', level: 4, category: 'leadership' },
          { name: 'Team Building', level: 5, category: 'leadership' },
          { name: 'JavaScript', level: 4, category: 'technical' },
        ],
        skillGaps: ['Data Analysis', 'Machine Learning'],
        learningGoals: ['Advanced Analytics', 'AI/ML Fundamentals'],
        lastUpdated: '2024-01-15',
      },
      {
        id: 2,
        name: 'Mike Chen',
        avatar: 'MC',
        role: 'Senior Developer',
        department: 'Engineering',
        totalSkills: 32,
        topSkills: [
          { name: 'JavaScript', level: 5, category: 'technical' },
          { name: 'React', level: 5, category: 'technical' },
          { name: 'Node.js', level: 5, category: 'technical' },
          { name: 'System Design', level: 4, category: 'technical' },
          { name: 'Code Review', level: 4, category: 'technical' },
        ],
        skillGaps: ['Leadership', 'Public Speaking'],
        learningGoals: ['Technical Leadership', 'Mentoring'],
        lastUpdated: '2024-01-14',
      },
      {
        id: 3,
        name: 'Lisa Brown',
        avatar: 'LB',
        role: 'UX Designer',
        department: 'Design',
        totalSkills: 24,
        topSkills: [
          { name: 'UI/UX Design', level: 5, category: 'design' },
          { name: 'Figma', level: 5, category: 'design' },
          { name: 'User Research', level: 4, category: 'design' },
          { name: 'Prototyping', level: 4, category: 'design' },
          { name: 'Design Systems', level: 4, category: 'design' },
        ],
        skillGaps: ['Frontend Development', 'Data Visualization'],
        learningGoals: ['React Basics', 'D3.js'],
        lastUpdated: '2024-01-13',
      },
      {
        id: 4,
        name: 'David Wilson',
        avatar: 'DW',
        role: 'QA Engineer',
        department: 'Quality Assurance',
        totalSkills: 20,
        topSkills: [
          { name: 'Test Automation', level: 4, category: 'technical' },
          { name: 'Quality Assurance', level: 5, category: 'technical' },
          { name: 'Selenium', level: 4, category: 'technical' },
          { name: 'API Testing', level: 4, category: 'technical' },
          { name: 'Bug Tracking', level: 5, category: 'technical' },
        ],
        skillGaps: ['Performance Testing', 'Security Testing'],
        learningGoals: ['Load Testing', 'Penetration Testing'],
        lastUpdated: '2024-01-12',
      },
    ],
    skillMatrix: [
      {
        skill: 'JavaScript',
        category: 'technical',
        teamLevel: 4.2,
        required: 4,
        gap: -0.2,
        members: [
          { name: 'Sarah Johnson', level: 4 },
          { name: 'Mike Chen', level: 5 },
          { name: 'Alex Rodriguez', level: 3 },
          { name: 'Tom Wilson', level: 4 },
        ],
      },
      {
        skill: 'React',
        category: 'technical',
        teamLevel: 3.8,
        required: 4,
        gap: 0.2,
        members: [
          { name: 'Mike Chen', level: 5 },
          { name: 'Alex Rodriguez', level: 3 },
          { name: 'Tom Wilson', level: 4 },
          { name: 'Emma Garcia', level: 3 },
        ],
      },
      {
        skill: 'Leadership',
        category: 'leadership',
        teamLevel: 2.8,
        required: 3,
        gap: 0.2,
        members: [
          { name: 'Sarah Johnson', level: 5 },
          { name: 'Mike Chen', level: 2 },
          { name: 'Lisa Brown', level: 3 },
          { name: 'David Wilson', level: 2 },
        ],
      },
      {
        skill: 'UI/UX Design',
        category: 'design',
        teamLevel: 3.5,
        required: 3,
        gap: -0.5,
        members: [
          { name: 'Lisa Brown', level: 5 },
          { name: 'Tom Wilson', level: 4 },
          { name: 'Emma Garcia', level: 2 },
        ],
      },
    ],
    learningPaths: [
      {
        id: 1,
        title: 'Frontend Development Mastery',
        description: 'Complete path to become a frontend expert',
        duration: '6 months',
        difficulty: 'Intermediate',
        skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Testing'],
        enrolled: 5,
        completed: 2,
        rating: 4.7,
        category: 'technical',
      },
      {
        id: 2,
        title: 'Leadership Excellence',
        description: 'Develop essential leadership and management skills',
        duration: '4 months',
        difficulty: 'Advanced',
        skills: ['Team Management', 'Strategic Thinking', 'Communication', 'Decision Making'],
        enrolled: 3,
        completed: 1,
        rating: 4.9,
        category: 'leadership',
      },
      {
        id: 3,
        title: 'Data-Driven Design',
        description: 'Learn to use data and analytics in design decisions',
        duration: '3 months',
        difficulty: 'Intermediate',
        skills: ['Analytics', 'A/B Testing', 'User Research', 'Data Visualization'],
        enrolled: 4,
        completed: 2,
        rating: 4.5,
        category: 'design',
      },
    ],
    recommendations: [
      {
        id: 1,
        type: 'skill_gap',
        title: 'Address React Skills Gap',
        description: 'Team needs stronger React skills to meet project requirements',
        priority: 'high',
        affectedMembers: 3,
        suggestedAction: 'Enroll in React training program',
        timeline: '2 weeks',
      },
      {
        id: 2,
        type: 'learning_opportunity',
        title: 'Leadership Development',
        description: 'Several team members show potential for leadership roles',
        priority: 'medium',
        affectedMembers: 2,
        suggestedAction: 'Start leadership mentorship program',
        timeline: '1 month',
      },
      {
        id: 3,
        type: 'skill_sharing',
        title: 'Design System Knowledge Sharing',
        description: 'Lisa can share design system expertise with the team',
        priority: 'low',
        affectedMembers: 5,
        suggestedAction: 'Organize design system workshop',
        timeline: '1 week',
      },
    ],
  };

  const currentData = skillsData || mockSkillsData;

  const getCategoryColor = color => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      indigo: 'bg-indigo-100 text-indigo-800',
    };
    return colors[color] || 'bg-gray-100 text-gray-800';
  };

  const getSkillLevelColor = level => {
    if (level >= 4.5) return 'text-green-600';
    if (level >= 3.5) return 'text-blue-600';
    if (level >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGapColor = gap => {
    if (gap > 0) return 'text-red-600';
    if (gap < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSkills = currentData.teamSkills.filter(
    member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Team Skills"
        subtitle="Track, develop, and optimize team capabilities and expertise"
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
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'team'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Team Skills
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'matrix'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PieChart className="h-4 w-4 inline mr-2" />
          Skill Matrix
        </button>
        <button
          onClick={() => setActiveTab('learning')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'learning'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Learning Paths
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lightbulb className="h-4 w-4 inline mr-2" />
          Recommendations
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
                    <p className="text-sm font-medium text-gray-600">Total Skills</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentData.overview.totalSkills}
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-green-600">
                      {currentData.overview.teamMembers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Skill Level</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {currentData.overview.averageSkillLevel}/5
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Skill Gaps</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {currentData.overview.skillGaps}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skill Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentData.categories.map(category => (
                  <div
                    key={category.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded ${getCategoryColor(category.color)}`}>
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.skillCount} skills</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Level</span>
                        <span className={`font-medium ${getSkillLevelColor(category.avgLevel)}`}>
                          {category.avgLevel}/5
                        </span>
                      </div>
                      <Progress value={(category.avgLevel / 5) * 100} className="h-2" />
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Top Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {category.topSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {category.topSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.topSkills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {currentData.categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSkills.map(member => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12" fallback={member.avatar} />
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-xs text-gray-500">{member.department}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-lg font-bold text-blue-600">{member.totalSkills}</div>
                      <div className="text-xs text-gray-600">Total Skills</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {member.topSkills.length}
                      </div>
                      <div className="text-xs text-gray-600">Top Skills</div>
                    </div>
                  </div>

                  {/* Top Skills */}
                  <div>
                    <p className="text-sm font-medium mb-2">Top Skills</p>
                    <div className="space-y-2">
                      {member.topSkills.slice(0, 3).map((skill, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= skill.level
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">{skill.level}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skill Gaps */}
                  {member.skillGaps.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Skill Gaps</p>
                      <div className="flex flex-wrap gap-1">
                        {member.skillGaps.map((gap, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {gap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Goals */}
                  {member.learningGoals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Learning Goals</p>
                      <div className="flex flex-wrap gap-1">
                        {member.learningGoals.map((goal, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => {}} disabled={false}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => {}} disabled={false}>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Skills
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Last updated: {new Date(member.lastUpdated).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Skill Matrix</CardTitle>
              <p className="text-sm text-gray-600">
                Compare team skills against requirements and identify gaps
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.skillMatrix.map((skill, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{skill.skill}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {skill.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Team:</span>
                          <span className={`font-medium ${getSkillLevelColor(skill.teamLevel)}`}>
                            {skill.teamLevel}/5
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Required:</span>
                          <span className="font-medium">{skill.required}/5</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Gap:</span>
                          <span className={`font-medium ${getGapColor(skill.gap)}`}>
                            {skill.gap > 0 ? '+' : ''}
                            {skill.gap}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Team Level</span>
                        <span>{skill.teamLevel}/5</span>
                      </div>
                      <Progress value={(skill.teamLevel / 5) * 100} className="h-2" />
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Team Members</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {skill.members.map((member, memberIndex) => (
                          <div
                            key={memberIndex}
                            className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                          >
                            <span>{member.name}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`h-2 w-2 ${
                                    star <= member.level
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'learning' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.learningPaths.map(path => (
            <Card key={path.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{path.description}</p>
                  </div>
                  <Badge variant="outline">{path.difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {path.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    {path.rating}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Skills Covered</p>
                  <div className="flex flex-wrap gap-1">
                    {path.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="text-lg font-bold text-blue-600">{path.enrolled}</div>
                    <div className="text-xs text-gray-600">Enrolled</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-lg font-bold text-green-600">{path.completed}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                </div>

                <Button className="w-full" onClick={() => {}} disabled={false}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {currentData.recommendations.map(rec => (
            <Card key={rec.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-lg">{rec.title}</h4>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {rec.affectedMembers} members affected
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {rec.timeline}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-800">Suggested Action:</p>
                      <p className="text-sm text-blue-700">{rec.suggestedAction}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {}} disabled={false}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Implement
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {}} disabled={false}>
                      <Eye className="h-4 w-4" />
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

export default TeamSkills;
