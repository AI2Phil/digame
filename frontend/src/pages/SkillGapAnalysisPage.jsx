import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Brain, TrendingUp, Target, Users, BookOpen, Award,
  AlertTriangle, CheckCircle, Home, Download, Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Progress } from '../components/ui/Progress';
import { Chart } from '../components/ui/Chart';

const SkillGapAnalysisPage = ({ isDemoMode = false, onLogout }) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Use prop if provided, otherwise fallback to localStorage (client-side only)
  const isDemo = isDemoMode || (typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true');

  const handleHomeClick = () => {
    router.push(isDemo ? '/dashboard' : '/');
  };

  // Mock skill categories and gaps
  const skillCategories = [
    { id: 'technical', name: 'Technical Skills', color: '#3b82f6' },
    { id: 'soft', name: 'Soft Skills', color: '#10b981' },
    { id: 'leadership', name: 'Leadership', color: '#8b5cf6' },
    { id: 'domain', name: 'Domain Knowledge', color: '#f59e0b' }
  ];

  // Mock team skill assessment data
  const teamSkillOverview = {
    totalSkills: 24,
    criticalGaps: 5,
    improvingSkills: 8,
    strongSkills: 11,
    averageSkillLevel: 72
  };

  // Mock skill gap data by category
  const skillGapData = [
    { category: 'Technical', current: 75, target: 90, gap: 15 },
    { category: 'Soft Skills', current: 82, target: 85, gap: 3 },
    { category: 'Leadership', current: 65, target: 80, gap: 15 },
    { category: 'Domain', current: 78, target: 85, gap: 7 }
  ];

  // Mock individual skill assessments
  const skillAssessments = [
    {
      id: 1,
      skill: 'React Development',
      category: 'technical',
      currentLevel: 85,
      targetLevel: 90,
      gap: 5,
      priority: 'medium',
      teamMembers: [
        { name: 'Sarah Johnson', level: 90, avatar: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=SJ' },
        { name: 'Michael Chen', level: 95, avatar: 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=MC' },
        { name: 'Lisa Wang', level: 70, avatar: 'https://via.placeholder.com/32x32/EF4444/FFFFFF?text=LW' }
      ],
      recommendedActions: ['Advanced React patterns workshop', 'Code review sessions']
    },
    {
      id: 2,
      skill: 'Project Management',
      category: 'leadership',
      currentLevel: 60,
      targetLevel: 80,
      gap: 20,
      priority: 'high',
      teamMembers: [
        { name: 'Emily Rodriguez', level: 85, avatar: 'https://via.placeholder.com/32x32/8B5CF6/FFFFFF?text=ER' },
        { name: 'Sarah Johnson', level: 70, avatar: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=SJ' },
        { name: 'David Kim', level: 25, avatar: 'https://via.placeholder.com/32x32/F59E0B/FFFFFF?text=DK' }
      ],
      recommendedActions: ['PMP certification', 'Agile methodology training']
    },
    {
      id: 3,
      skill: 'Communication',
      category: 'soft',
      currentLevel: 78,
      targetLevel: 85,
      gap: 7,
      priority: 'medium',
      teamMembers: [
        { name: 'Emily Rodriguez', level: 90, avatar: 'https://via.placeholder.com/32x32/8B5CF6/FFFFFF?text=ER' },
        { name: 'Michael Chen', level: 80, avatar: 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=MC' },
        { name: 'David Kim', level: 65, avatar: 'https://via.placeholder.com/32x32/F59E0B/FFFFFF?text=DK' }
      ],
      recommendedActions: ['Public speaking workshop', 'Cross-team collaboration']
    },
    {
      id: 4,
      skill: 'Cloud Architecture',
      category: 'technical',
      currentLevel: 45,
      targetLevel: 75,
      gap: 30,
      priority: 'high',
      teamMembers: [
        { name: 'Michael Chen', level: 60, avatar: 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=MC' },
        { name: 'Lisa Wang', level: 40, avatar: 'https://via.placeholder.com/32x32/EF4444/FFFFFF?text=LW' },
        { name: 'Sarah Johnson', level: 35, avatar: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=SJ' }
      ],
      recommendedActions: ['AWS certification', 'Cloud architecture bootcamp']
    },
    {
      id: 5,
      skill: 'UX Design',
      category: 'domain',
      currentLevel: 70,
      targetLevel: 80,
      gap: 10,
      priority: 'low',
      teamMembers: [
        { name: 'David Kim', level: 85, avatar: 'https://via.placeholder.com/32x32/F59E0B/FFFFFF?text=DK' },
        { name: 'Emily Rodriguez', level: 65, avatar: 'https://via.placeholder.com/32x32/8B5CF6/FFFFFF?text=ER' },
        { name: 'Sarah Johnson', level: 60, avatar: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=SJ' }
      ],
      recommendedActions: ['Design thinking workshop', 'User research training']
    }
  ];

  // Mock learning recommendations
  const learningRecommendations = [
    {
      id: 1,
      title: 'Cloud Architecture Fundamentals',
      provider: 'AWS Training',
      duration: '40 hours',
      priority: 'high',
      skillsAddressed: ['Cloud Architecture', 'DevOps'],
      estimatedImpact: 85
    },
    {
      id: 2,
      title: 'Advanced Project Management',
      provider: 'PMI',
      duration: '60 hours',
      priority: 'high',
      skillsAddressed: ['Project Management', 'Leadership'],
      estimatedImpact: 75
    },
    {
      id: 3,
      title: 'React Advanced Patterns',
      provider: 'Frontend Masters',
      duration: '20 hours',
      priority: 'medium',
      skillsAddressed: ['React Development', 'JavaScript'],
      estimatedImpact: 60
    }
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getGapSeverity = (gap) => {
    if (gap >= 20) return { color: 'text-red-600', icon: AlertTriangle, severity: 'Critical' };
    if (gap >= 10) return { color: 'text-yellow-600', icon: AlertTriangle, severity: 'Moderate' };
    return { color: 'text-green-600', icon: CheckCircle, severity: 'Minor' };
  };

  const filteredSkills = selectedCategory === 'all' 
    ? skillAssessments 
    : skillAssessments.filter(skill => skill.category === selectedCategory);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
          <p className="text-muted-foreground">Identify and address team skill gaps</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleHomeClick}>
            <Home className="mr-2 h-4 w-4" />
            {isDemo ? 'Back to Dashboard' : 'Home'}
          </Button>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Analysis
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                <p className="text-2xl font-bold">{teamSkillOverview.totalSkills}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Gaps</p>
                <p className="text-2xl font-bold text-red-600">{teamSkillOverview.criticalGaps}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Improving</p>
                <p className="text-2xl font-bold text-yellow-600">{teamSkillOverview.improvingSkills}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Strong Skills</p>
                <p className="text-2xl font-bold text-green-600">{teamSkillOverview.strongSkills}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Level</p>
                <p className="text-2xl font-bold">{teamSkillOverview.averageSkillLevel}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Skill Gap Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Overview</CardTitle>
            <CardDescription>
              Current vs target skill levels by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              data={skillGapData.map(d => d.current)}
              secondaryData={skillGapData.map(d => d.target)}
              labels={skillGapData.map(d => d.category)}
              height={320}
              lineColor="#3b82f6"
              secondaryLineColor="#10b981"
            />
          </CardContent>
        </Card>

        {/* Learning Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Training</CardTitle>
            <CardDescription>
              Prioritized learning opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learningRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{recommendation.title}</h4>
                    {getPriorityBadge(recommendation.priority)}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{recommendation.provider}</span> • {recommendation.duration}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">
                      <span className="font-medium">Skills:</span> {recommendation.skillsAddressed.join(', ')}
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {recommendation.estimatedImpact}% impact
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Start Learning
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Skill Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detailed Skill Analysis</CardTitle>
              <CardDescription>
                Individual skill assessments and team member proficiency
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="all">All Categories</option>
                {skillCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredSkills.map((skill) => {
              const gapInfo = getGapSeverity(skill.gap);
              const GapIcon = gapInfo.icon;
              
              return (
                <div key={skill.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{skill.skill}</h3>
                      <Badge variant="outline">
                        {skillCategories.find(c => c.id === skill.category)?.name}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-1 ${gapInfo.color}`}>
                        <GapIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{gapInfo.severity} Gap</span>
                      </div>
                      {getPriorityBadge(skill.priority)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Current Level</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={skill.currentLevel} className="flex-1" />
                        <span className="text-sm font-medium">{skill.currentLevel}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Target Level</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={skill.targetLevel} className="flex-1" />
                        <span className="text-sm font-medium">{skill.targetLevel}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Gap</div>
                      <div className={`text-lg font-bold ${gapInfo.color}`}>
                        {skill.gap} points
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Team Member Proficiency</div>
                    <div className="flex items-center space-x-4">
                      {skill.teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={isDemo ? member.avatar : '/api/placeholder/32/32'} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{member.name}</div>
                            <div className="text-xs text-gray-600">{member.level}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Recommended Actions</div>
                    <div className="flex flex-wrap gap-2">
                      {skill.recommendedActions.map((action, index) => (
                        <Badge key={index} variant="outline">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillGapAnalysisPage;