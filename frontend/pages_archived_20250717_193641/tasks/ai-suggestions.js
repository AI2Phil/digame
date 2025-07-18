import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Input } from '../../src/components/ui/Input';
import { Textarea } from '../../src/components/ui/Textarea';
import { Progress } from '../../src/components/ui/Progress';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  Clock, 
  CheckCircle, 
  Plus, 
  Star,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Zap,
  Filter,
  Search,
  BarChart3,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Bookmark
} from 'lucide-react';

const AITaskSuggestions = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAISuggestions();
  }, [filter]);

  const fetchAISuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/ai-suggestions?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptSuggestion = async (suggestionId) => {
    try {
      const response = await fetch(`/api/tasks/ai-suggestions/${suggestionId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchAISuggestions(); // Refresh suggestions
      }
    } catch (error) {
      console.error('Error accepting suggestion:', error);
    }
  };

  const mockSuggestions = [
    {
      id: 1,
      type: 'task_creation',
      title: 'Review Q1 Performance Metrics',
      description: 'Based on your calendar, you have a performance review meeting next week. Consider creating a task to prepare the Q1 metrics analysis.',
      priority: 'high',
      estimatedTime: 120,
      confidence: 0.92,
      reasoning: 'Detected upcoming meeting in calendar and historical pattern of preparation tasks',
      category: 'productivity',
      suggestedDueDate: '2024-01-15',
      tags: ['review', 'metrics', 'Q1'],
      relatedTasks: ['Prepare presentation slides', 'Gather team feedback'],
      aiInsight: 'Users who prepare for performance reviews 3 days in advance report 40% higher satisfaction scores'
    },
    {
      id: 2,
      type: 'task_optimization',
      title: 'Batch Email Responses',
      description: 'You typically respond to emails throughout the day. Batching responses into 2-3 focused sessions could save 45 minutes daily.',
      priority: 'medium',
      estimatedTime: 30,
      confidence: 0.87,
      reasoning: 'Analysis of your email patterns shows frequent context switching',
      category: 'efficiency',
      suggestedDueDate: '2024-01-12',
      tags: ['email', 'batching', 'productivity'],
      relatedTasks: ['Set email schedule', 'Configure notifications'],
      aiInsight: 'Email batching reduces cognitive load and improves focus by 35%'
    },
    {
      id: 3,
      type: 'deadline_optimization',
      title: 'Move Project Deadline Forward',
      description: 'Your "Website Redesign" project could be completed 3 days earlier based on current progress velocity.',
      priority: 'low',
      estimatedTime: 15,
      confidence: 0.78,
      reasoning: 'Progress tracking indicates faster than expected completion rate',
      category: 'planning',
      suggestedDueDate: '2024-01-18',
      tags: ['deadline', 'project', 'optimization'],
      relatedTasks: ['Update project timeline', 'Notify stakeholders'],
      aiInsight: 'Early project completion allows for better quality review and reduces stress'
    },
    {
      id: 4,
      type: 'skill_development',
      title: 'Learn Advanced Analytics',
      description: 'Based on your recent tasks, learning advanced analytics could help automate 60% of your data analysis work.',
      priority: 'medium',
      estimatedTime: 300,
      confidence: 0.85,
      reasoning: 'Frequent manual data analysis tasks detected in your workflow',
      category: 'learning',
      suggestedDueDate: '2024-02-01',
      tags: ['learning', 'analytics', 'automation'],
      relatedTasks: ['Find online course', 'Schedule learning time', 'Practice with real data'],
      aiInsight: 'Professionals with advanced analytics skills report 50% faster decision-making'
    },
    {
      id: 5,
      type: 'collaboration',
      title: 'Schedule Team Sync',
      description: 'Your team hasn\'t had a sync meeting in 2 weeks. Consider scheduling a brief check-in to maintain alignment.',
      priority: 'medium',
      estimatedTime: 60,
      confidence: 0.81,
      reasoning: 'Team communication patterns suggest need for regular synchronization',
      category: 'teamwork',
      suggestedDueDate: '2024-01-13',
      tags: ['team', 'sync', 'communication'],
      relatedTasks: ['Prepare agenda', 'Send calendar invite', 'Gather updates'],
      aiInsight: 'Regular team syncs improve project success rate by 25%'
    }
  ];

  const currentSuggestions = suggestions.length > 0 ? suggestions : mockSuggestions;

  const filteredSuggestions = currentSuggestions.filter(suggestion => {
    const matchesFilter = filter === 'all' || suggestion.category === filter;
    const matchesSearch = suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task_creation': return <Plus className="h-4 w-4" />;
      case 'task_optimization': return <Zap className="h-4 w-4" />;
      case 'deadline_optimization': return <Clock className="h-4 w-4" />;
      case 'skill_development': return <Target className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const suggestionCategories = [
    { value: 'all', label: 'All Suggestions' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'planning', label: 'Planning' },
    { value: 'learning', label: 'Learning' },
    { value: 'teamwork', label: 'Teamwork' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="AI Task Suggestions"
        subtitle="Intelligent recommendations to optimize your productivity and workflow"
        icon={<Brain className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Tasks', href: '/tasks' },
          { label: 'AI Suggestions', href: '/tasks/ai-suggestions' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Favorites
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Suggestion
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'suggestions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lightbulb className="h-4 w-4 inline mr-2" />
          Suggestions
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Insights
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          History
        </button>
      </div>

      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search suggestions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {suggestionCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Suggestions Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Suggestions</p>
                    <p className="text-2xl font-bold">{filteredSuggestions.length}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredSuggestions.filter(s => s.priority === 'high').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(filteredSuggestions.reduce((acc, s) => acc + s.confidence, 0) / filteredSuggestions.length * 100).toFixed(0)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Savings</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(filteredSuggestions.reduce((acc, s) => acc + (s.estimatedTime || 0), 0) / 60)}h
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions List */}
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium">{suggestion.title}</h3>
                          <Badge variant={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(suggestion.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{suggestion.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Estimated Time:</span>
                            <p className="font-medium">{suggestion.estimatedTime} minutes</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Category:</span>
                            <p className="font-medium capitalize">{suggestion.category}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Due Date:</span>
                            <p className="font-medium">{suggestion.suggestedDueDate}</p>
                          </div>
                        </div>

                        {/* AI Insight */}
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <div className="flex items-start gap-2">
                            <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">AI Insight</p>
                              <p className="text-sm text-blue-700">{suggestion.aiInsight}</p>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {suggestion.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Related Tasks */}
                        {suggestion.relatedTasks.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Related Tasks:</p>
                            <div className="space-y-1">
                              {suggestion.relatedTasks.map((task, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                  <ArrowRight className="h-3 w-3" />
                                  <span>{task}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reasoning */}
                        <div className="text-xs text-gray-500 mb-4">
                          <strong>AI Reasoning:</strong> {suggestion.reasoning}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acceptSuggestion(suggestion.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* AI Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Suggestions Accepted</p>
                    <p className="text-2xl font-bold text-green-600">87%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold text-blue-600">24h</p>
                    <p className="text-xs text-gray-500">this month</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Productivity Boost</p>
                    <p className="text-2xl font-bold text-purple-600">+32%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                    <p className="text-2xl font-bold text-orange-600">94%</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestion Categories Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Suggestion Categories Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestionCategories.slice(1).map((category) => {
                  const categoryData = {
                    productivity: { accepted: 92, total: 15, avgTime: 45 },
                    efficiency: { accepted: 85, total: 12, avgTime: 30 },
                    planning: { accepted: 78, total: 8, avgTime: 60 },
                    learning: { accepted: 67, total: 5, avgTime: 180 },
                    teamwork: { accepted: 89, total: 10, avgTime: 90 }
                  };
                  
                  const data = categoryData[category.value] || { accepted: 0, total: 0, avgTime: 0 };
                  const acceptanceRate = data.total > 0 ? (data.accepted / data.total) * 100 : 0;
                  
                  return (
                    <div key={category.value} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{category.label}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">{acceptanceRate.toFixed(0)}%</span>
                          <span className="text-xs text-gray-500 ml-2">({data.total} suggestions)</span>
                        </div>
                      </div>
                      <Progress value={acceptanceRate} className="h-2" />
                      <div className="text-xs text-gray-500">
                        Avg time saved: {data.avgTime} minutes per suggestion
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Suggestion History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Schedule team retrospective', action: 'Accepted', date: '2 hours ago', impact: '+15 min saved' },
                { title: 'Optimize email workflow', action: 'Accepted', date: '1 day ago', impact: '+45 min saved' },
                { title: 'Learn new project management tool', action: 'Dismissed', date: '3 days ago', impact: 'N/A' },
                { title: 'Batch similar tasks together', action: 'Accepted', date: '1 week ago', impact: '+30 min saved' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.action === 'Accepted' ? 'default' : 'secondary'}>
                      {item.action}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">{item.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AITaskSuggestions;