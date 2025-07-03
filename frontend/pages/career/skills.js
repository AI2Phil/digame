import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../src/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';
import { Progress } from '../../src/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
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
  Users,
  GraduationCap,
  Rocket,
  Flag,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Download,
  Upload,
  Share2,
  RefreshCw
} from 'lucide-react';

const CareerSkills = () => {
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
      const response = await fetch('/api/career/skills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      totalSkills: 45,
      masteredSkills: 12,
      learningSkills: 8,
      plannedSkills: 6,
      averageLevel: 3.4,
      skillScore: 78,
      marketValue: '$95,000',
      growthPotential: '+25%'
    },
    categories: [
      {
        id: 'technical',
        name: 'Technical Skills',
        icon: <Code className="h-5 w-5" />,
        color: 'blue',
        skillCount: 18,
        avgLevel: 3.8,
        marketDemand: 'High',
        growth: '+15%'
      },
      {
        id: 'design',
        name: 'Design Skills',
        icon: <Palette className="h-5 w-5" />,
        color: 'purple',
        skillCount: 8,
        avgLevel: 3.2,
        marketDemand: 'Medium',
        growth: '+8%'
      },
      {
        id: 'communication',
        name: 'Communication',
        icon: <MessageSquare className="h-5 w-5" />,
        color: 'green',
        skillCount: 6,
        avgLevel: 4.1,
        marketDemand: 'High',
        growth: '+12%'
      },
      {
        id: 'leadership',
        name: 'Leadership',
        icon: <Users className="h-5 w-5" />,
        color: 'orange',
        skillCount: 5,
        avgLevel: 2.9,
        marketDemand: 'Very High',
        growth: '+20%'
      },
      {
        id: 'data',
        name: 'Data Analysis',
        icon: <BarChart3 className="h-5 w-5" />,
        color: 'indigo',
        skillCount: 4,
        avgLevel: 2.5,
        marketDemand: 'Very High',
        growth: '+30%'
      },
      {
        id: 'security',
        name: 'Security',
        icon: <Shield className="h-5 w-5" />,
        color: 'red',
        skillCount: 4,
        avgLevel: 2.8,
        marketDemand: 'High',
        growth: '+25%'
      }
    ],
    skills: [
      {
        id: 1,
        name: 'JavaScript',
        category: 'technical',
        level: 5,
        experience: '5 years',
        lastUsed: '2024-01-15',
        marketDemand: 'Very High',
        salaryImpact: '+$15k',
        trend: 'stable',
        certifications: ['JavaScript Developer Certification'],
        projects: 12,
        endorsements: 8,
        learningResources: ['Advanced JavaScript Course', 'ES6+ Masterclass'],
        relatedSkills: ['React', 'Node.js', 'TypeScript'],
        jobMatches: 156,
        description: 'Proficient in modern JavaScript including ES6+, async/await, and functional programming'
      },
      {
        id: 2,
        name: 'React',
        category: 'technical',
        level: 4,
        experience: '3 years',
        lastUsed: '2024-01-14',
        marketDemand: 'Very High',
        salaryImpact: '+$12k',
        trend: 'growing',
        certifications: [],
        projects: 8,
        endorsements: 6,
        learningResources: ['React Hooks Deep Dive', 'Advanced React Patterns'],
        relatedSkills: ['JavaScript', 'Redux', 'Next.js'],
        jobMatches: 142,
        description: 'Experienced with React hooks, context API, and component optimization'
      },
      {
        id: 3,
        name: 'Python',
        category: 'technical',
        level: 3,
        experience: '2 years',
        lastUsed: '2024-01-10',
        marketDemand: 'High',
        salaryImpact: '+$10k',
        trend: 'growing',
        certifications: [],
        projects: 4,
        endorsements: 3,
        learningResources: ['Python for Data Science', 'Django Framework'],
        relatedSkills: ['Data Analysis', 'Machine Learning', 'Django'],
        jobMatches: 98,
        description: 'Comfortable with Python for web development and basic data analysis'
      },
      {
        id: 4,
        name: 'Leadership',
        category: 'leadership',
        level: 3,
        experience: '2 years',
        lastUsed: '2024-01-12',
        marketDemand: 'Very High',
        salaryImpact: '+$20k',
        trend: 'stable',
        certifications: ['Leadership Fundamentals'],
        projects: 3,
        endorsements: 5,
        learningResources: ['Advanced Leadership Course', 'Team Management'],
        relatedSkills: ['Communication', 'Project Management', 'Mentoring'],
        jobMatches: 89,
        description: 'Experience leading small teams and mentoring junior developers'
      },
      {
        id: 5,
        name: 'Data Analysis',
        category: 'data',
        level: 2,
        experience: '1 year',
        lastUsed: '2024-01-08',
        marketDemand: 'Very High',
        salaryImpact: '+$18k',
        trend: 'growing',
        certifications: [],
        projects: 2,
        endorsements: 1,
        learningResources: ['SQL Fundamentals', 'Excel Advanced', 'Tableau Basics'],
        relatedSkills: ['SQL', 'Excel', 'Statistics'],
        jobMatches: 76,
        description: 'Basic data analysis skills with Excel and some SQL experience'
      },
      {
        id: 6,
        name: 'Machine Learning',
        category: 'data',
        level: 1,
        experience: '6 months',
        lastUsed: '2024-01-05',
        marketDemand: 'Very High',
        salaryImpact: '+$25k',
        trend: 'growing',
        certifications: [],
        projects: 1,
        endorsements: 0,
        learningResources: ['ML Fundamentals', 'Python for ML', 'TensorFlow Basics'],
        relatedSkills: ['Python', 'Statistics', 'Data Analysis'],
        jobMatches: 45,
        description: 'Learning machine learning fundamentals and basic algorithms'
      }
    ],
    gaps: [
      {
        id: 1,
        skill: 'Cloud Architecture',
        category: 'technical',
        importance: 'High',
        marketDemand: 'Very High',
        salaryImpact: '+$22k',
        timeToLearn: '6 months',
        difficulty: 'Medium',
        relatedJobs: 89,
        learningPath: ['AWS Fundamentals', 'Cloud Design Patterns', 'Microservices'],
        priority: 1
      },
      {
        id: 2,
        skill: 'Product Management',
        category: 'leadership',
        importance: 'High',
        marketDemand: 'High',
        salaryImpact: '+$18k',
        timeToLearn: '4 months',
        difficulty: 'Medium',
        relatedJobs: 67,
        learningPath: ['Product Strategy', 'User Research', 'Agile Methodologies'],
        priority: 2
      },
      {
        id: 3,
        skill: 'DevOps',
        category: 'technical',
        importance: 'Medium',
        marketDemand: 'High',
        salaryImpact: '+$15k',
        timeToLearn: '5 months',
        difficulty: 'High',
        relatedJobs: 54,
        learningPath: ['Docker', 'Kubernetes', 'CI/CD Pipelines'],
        priority: 3
      }
    ],
    recommendations: [
      {
        id: 1,
        type: 'Skill Development',
        title: 'Focus on Cloud Architecture',
        description: 'High market demand with significant salary impact. Builds on your existing technical skills.',
        action: 'Start Learning',
        timeframe: '6 months',
        impact: 'High',
        difficulty: 'Medium'
      },
      {
        id: 2,
        type: 'Certification',
        title: 'Get AWS Certification',
        description: 'Validates your cloud skills and increases job opportunities by 40%.',
        action: 'Schedule Exam',
        timeframe: '3 months',
        impact: 'High',
        difficulty: 'Medium'
      },
      {
        id: 3,
        type: 'Experience',
        title: 'Lead a Cross-Team Project',
        description: 'Develop leadership skills while applying technical expertise.',
        action: 'Volunteer',
        timeframe: '3-6 months',
        impact: 'Medium',
        difficulty: 'Low'
      }
    ],
    analytics: {
      skillTrends: {
        growing: ['Machine Learning', 'Cloud Architecture', 'DevOps', 'Data Science'],
        stable: ['JavaScript', 'Leadership', 'Communication'],
        declining: ['jQuery', 'Flash', 'Perl']
      },
      marketComparison: {
        yourLevel: 3.4,
        industryAverage: 3.1,
        topPercentile: 4.2,
        targetLevel: 3.8
      },
      salaryProjection: {
        current: '$95,000',
        withGaps: '$118,000',
        topTier: '$145,000',
        timeline: '2 years'
      }
    }
  };

  const currentData = skillsData || mockSkillsData;

  const getSkillLevelColor = (level) => {
    if (level >= 4.5) return 'text-green-600 bg-green-100';
    if (level >= 3.5) return 'text-blue-600 bg-blue-100';
    if (level >= 2.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'growing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDemandColor = (demand) => {
    switch (demand) {
      case 'Very High': return 'bg-green-100 text-green-800';
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority <= 2) return 'bg-red-100 text-red-800';
    if (priority <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[color] || 'bg-gray-100 text-gray-800';
  };

  const filteredSkills = currentData.skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartLearning = async (skillId) => {
    try {
      const response = await fetch(`/api/career/skills/${skillId}/start-learning`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        router.push('/career/learning');
      }
    } catch (error) {
      console.error('Error starting learning:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Skills Development"
        subtitle="Track, develop, and optimize your professional skills"
        icon={<Brain className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Career', href: '/career' },
          { label: 'Skills', href: '/career/skills' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Skills
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
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
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'skills'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="h-4 w-4 inline mr-2" />
          My Skills
        </button>
        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'gaps'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Skill Gaps
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
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PieChart className="h-4 w-4 inline mr-2" />
          Analytics
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
                    <p className="text-2xl font-bold text-blue-600">{currentData.overview.totalSkills}</p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Skill Score</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.overview.skillScore}/100</p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Value</p>
                    <p className="text-2xl font-bold text-purple-600">{currentData.overview.marketValue}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Growth Potential</p>
                    <p className="text-2xl font-bold text-orange-600">{currentData.overview.growthPotential}</p>
                  </div>
                  <Rocket className="h-8 w-8 text-orange-600" />
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
                {currentData.categories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
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
                        <span className="font-medium">{category.avgLevel}/5</span>
                      </div>
                      <Progress value={(category.avgLevel / 5) * 100} className="h-2" />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <Badge className={getDemandColor(category.marketDemand)}>
                        {category.marketDemand}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        {category.growth}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mastered Skills</p>
                    <p className="text-2xl font-bold text-green-600">{currentData.overview.masteredSkills}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Learning</p>
                    <p className="text-2xl font-bold text-blue-600">{currentData.overview.learningSkills}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Planned</p>
                    <p className="text-2xl font-bold text-orange-600">{currentData.overview.plannedSkills}</p>
                  </div>
                  <Flag className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {currentData.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSkills.map((skill) => (
              <Card key={skill.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{skill.name}</CardTitle>
                      <p className="text-sm text-gray-600 capitalize">{skill.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(skill.trend)}
                      <Badge className={getDemandColor(skill.marketDemand)}>
                        {skill.marketDemand}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Skill Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Skill Level</span>
                      <span className="font-medium">{skill.level}/5</span>
                    </div>
                    <Progress value={(skill.level / 5) * 100} className="h-2" />
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= skill.level
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{skill.projects}</div>
                      <div className="text-xs text-gray-600">Projects</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{skill.endorsements}</div>
                      <div className="text-xs text-gray-600">Endorsements</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{skill.jobMatches}</div>
                      <div className="text-xs text-gray-600">Job Matches</div>
                    </div>
                  </div>

                  {/* Experience and Impact */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{skill.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salary Impact:</span>
                      <span className="font-medium text-green-600">{skill.salaryImpact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Used:</span>
                      <span className="font-medium">{new Date(skill.lastUsed).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700">{skill.description}</p>

                  {/* Related Skills */}
                  <div>
                    <p className="text-sm font-medium mb-2">Related Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {skill.relatedSkills.map((related, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {related}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" className="flex-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Improve
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gaps' && (
        <div className="space-y-4">
          {currentData.gaps.map((gap) => (
            <Card key={gap.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-lg">{gap.skill}</h4>
                      <p className="text-sm text-gray-600 capitalize">{gap.category}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Market Demand</div>
                        <Badge className={getDemandColor(gap.marketDemand)}>
                          {gap.marketDemand}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-gray-600">Salary Impact</div>
                        <div className="font-medium text-green-600">{gap.salaryImpact}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Time to Learn</div>
                        <div className="font-medium">{gap.timeToLearn}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Job Matches</div>
                        <div className="font-medium text-blue-600">{gap.relatedJobs}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Learning Path</div>
                      <div className="flex flex-wrap gap-1">
                        {gap.learningPath.map((step, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {step}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getPriorityColor(gap.priority)}>
                      Priority #{gap.priority}
                    </Badge>
                    <Badge variant="outline">
                      {gap.difficulty}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleStartLearning(gap.id)}
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {currentData.recommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">{rec.type}</span>
                      </div>
                      <h4 className="font-medium text-lg">{rec.title}</h4>
                    </div>
                    
                    <p className="text-sm text-gray-700">{rec.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{rec.timeframe}</span>
                      </div>
                      <Badge variant={rec.impact === 'High' ? 'destructive' : 'secondary'}>
                        {rec.impact} Impact
                      </Badge>
                      <Badge variant="outline">
                        {rec.difficulty} Difficulty
                      </Badge>
                    </div>
                  </div>
                  
                  <Button size="sm">
                    {rec.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Market Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentData.analytics.marketComparison.yourLevel}</div>
                  <div className="text-sm text-gray-600">Your Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{currentData.analytics.marketComparison.industryAverage}</div>
                  <div className="text-sm text-gray-600">Industry Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentData.analytics.marketComparison.topPercentile}</div>
                  <div className="text-sm text-gray-600">Top 10%</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentData.analytics.marketComparison.targetLevel}</div>
                  <div className="text-sm text-gray-600">Target Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Skill Market Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-green-600">Growing Skills</h4>
                  <div className="space-y-2">
                    {currentData.analytics.skillTrends.growing.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-blue-600">Stable Skills</h4>
                  <div className="space-y-2">
                    {currentData.analytics.skillTrends.stable.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Activity className="h-3 w-3 text-blue-600" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-red-600">Declining Skills</h4>
                  <div className="space-y-2">
                    {currentData.analytics.skillTrends.declining.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <TrendingDown className="h-3 w-3 text-red-600" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Projection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Salary Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentData.analytics.salaryProjection.current}</div>
                  <div className="text-sm text-gray-600">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentData.analytics.salaryProjection.withGaps}</div>
                  <div className="text-sm text-gray-600">With Skill Gaps Filled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{currentData.analytics.salaryProjection.topTier}</div>
                  <div className="text-sm text-gray-600">Top Tier</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentData.analytics.salaryProjection.timeline}</div>
                  <div className="text-sm text-gray-600">Timeline</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CareerSkills;