import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import {
  TrendingUp,
  Brain,
  Activity,
  Clock,
  Target,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Database,
  Wifi,
  WifiOff,
  Users,
  Zap,
  Calendar
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';
import { digitalTwinApi } from '../../services/digitalTwinApi';

interface DigitalTwin {
  id: string;
  name: string;
  status: string;
  learning_progress: number;
  accuracy_score: number;
  model_version?: string;
  last_training_at?: string;
  created_at: string;
  updated_at: string;
}

interface TwinOverviewProps {
  twinId?: string;
  twin?: DigitalTwin;
  onRefresh?: () => Promise<void>;
}

interface Pattern {
  id: string;
  type: string;
  confidence: number;
  discovered_at: string;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  confidence: number;
  priority: string;
}

export const TwinOverview: React.FC<TwinOverviewProps> = ({
  twinId = 'default',
  twin: propTwin,
  onRefresh
}) => {
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const toast = useToastHelpers();

  useEffect(() => {
    fetchTwinOverview();
  }, [twinId]);

  const fetchTwinOverview = async () => {
    setLoading(true);
    
    // If twin data is passed as prop, use it directly
    if (propTwin) {
      setTwin(propTwin);
      try {
        // Still try to fetch insights from database
        const insightsResponse = await digitalTwinApi.getTwinInsights();
        if (insightsResponse.success) {
          setInsights(insightsResponse.data);
          setPatterns(insightsResponse.data.discovered_patterns || []);
          setRecommendations(insightsResponse.data.recommendations || []);
          setUsingFallbackData(false);
          toast.success('Twin overview loaded with live insights');
        } else {
          throw new Error('Failed to load insights');
        }
      } catch (error) {
        console.warn('Failed to load insights from database:', error);
        // Use fallback insights but keep the passed twin data
        const fallbackData = generateFallbackOverview();
        setInsights(fallbackData.insights);
        setPatterns(fallbackData.patterns);
        setRecommendations(fallbackData.recommendations);
        setUsingFallbackData(true);
        toast.info('Using demonstration insights - database unavailable');
      }
      setLoading(false);
      
      // Call onRefresh if provided
      if (onRefresh) {
        try {
          await onRefresh();
        } catch (error) {
          console.warn('onRefresh callback failed:', error);
        }
      }
      return;
    }

    try {
      // Try to fetch twin status and insights from database first
      const [statusResponse, insightsResponse] = await Promise.all([
        digitalTwinApi.getTwinStatus(),
        digitalTwinApi.getTwinInsights()
      ]);

      if (statusResponse.success && insightsResponse.success) {
        // Map TwinStatus to DigitalTwin interface
        const twinData: DigitalTwin = {
          id: statusResponse.data.twin_id,
          name: statusResponse.data.name,
          status: statusResponse.data.status,
          learning_progress: statusResponse.data.learning_progress,
          accuracy_score: statusResponse.data.accuracy_score,
          model_version: statusResponse.data.model_version,
          last_training_at: statusResponse.data.last_training,
          created_at: statusResponse.data.created_at,
          updated_at: new Date().toISOString()
        };
        
        setTwin(twinData);
        setInsights(insightsResponse.data);
        setPatterns(insightsResponse.data.discovered_patterns || []);
        setRecommendations(insightsResponse.data.recommendations || []);
        setUsingFallbackData(false);
        toast.success('Twin overview loaded from database');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.warn('Failed to load twin overview from database:', error);
    }

    // Fallback to comprehensive mock data
    const fallbackData = generateFallbackOverview();
    setTwin(fallbackData.twin);
    setInsights(fallbackData.insights);
    setPatterns(fallbackData.patterns);
    setRecommendations(fallbackData.recommendations);
    setUsingFallbackData(true);
    toast.info('Using demonstration data - database unavailable');
    setLoading(false);
  };

  const generateFallbackOverview = () => {
    const now = new Date();
    return {
      twin: {
        id: 'twin_demo_001',
        name: 'Personal Digital Twin',
        status: 'active',
        learning_progress: 78.5,
        accuracy_score: 85.2,
        model_version: 'v2.1.3',
        last_training_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
      },
      insights: {
        twin_status: {
          id: 'twin_demo_001',
          name: 'Personal Digital Twin',
          status: 'active',
          learning_progress: 78.5,
          accuracy_score: 85.2,
          model_version: 'v2.1.3',
          last_training: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          health_score: 92.3
        },
        statistics: {
          pattern_count: 47,
          interaction_count: 234,
          learning_count: 156,
          recent_interactions: 23,
          recent_patterns: 8
        }
      },
      patterns: [
        {
          id: 'pattern_001',
          type: 'morning_productivity',
          confidence: 92.5,
          discovered_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'pattern_002',
          type: 'afternoon_focus',
          confidence: 87.3,
          discovered_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'pattern_003',
          type: 'task_completion',
          confidence: 94.1,
          discovered_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'pattern_004',
          type: 'energy_management',
          confidence: 89.7,
          discovered_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'pattern_005',
          type: 'collaboration_style',
          confidence: 91.2,
          discovered_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      recommendations: [
        {
          type: 'productivity_optimization',
          title: 'Optimize Morning Routine',
          description: 'Your productivity peaks between 9-11 AM. Schedule your most important tasks during this window for maximum efficiency.',
          confidence: 92.5,
          priority: 'high'
        },
        {
          type: 'energy_management',
          title: 'Strategic Break Scheduling',
          description: 'Take 15-minute breaks every 90 minutes to maintain energy levels throughout the day.',
          confidence: 87.8,
          priority: 'medium'
        },
        {
          type: 'task_prioritization',
          title: 'Focus Session Enhancement',
          description: 'Implement 2-hour focused work blocks with minimal interruptions to improve task completion rates.',
          confidence: 89.3,
          priority: 'high'
        },
        {
          type: 'collaboration_improvement',
          title: 'Meeting Optimization',
          description: 'Limit meetings to 4 per day and schedule them during non-peak productivity hours.',
          confidence: 84.6,
          priority: 'medium'
        },
        {
          type: 'wellness_integration',
          title: 'Mindfulness Integration',
          description: 'Incorporate 5-minute mindfulness sessions between tasks to improve focus and reduce stress.',
          confidence: 91.7,
          priority: 'low'
        }
      ]
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'morning_productivity': return <Clock className="h-4 w-4" />;
      case 'afternoon_focus': return <Target className="h-4 w-4" />;
      case 'task_completion': return <Activity className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading twin overview...</span>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Unable to load twin overview</p>
          <Button onClick={fetchTwinOverview} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Brain className="h-8 w-8 mr-3 text-blue-500" />
            Twin Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of your digital twin's learning and insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Data Source Indicator */}
          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            usingFallbackData
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {usingFallbackData ? (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Demo Data
              </>
            ) : (
              <>
                <Database className="h-3 w-3 mr-1" />
                Live Database
              </>
            )}
          </div>
          <Button onClick={fetchTwinOverview} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Twin Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Progress</p>
                <p className="text-2xl font-bold text-blue-600">{twin.learning_progress}%</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={twin.learning_progress} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy Score</p>
                <p className="text-2xl font-bold text-green-600">{twin.accuracy_score}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={twin.accuracy_score} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Patterns Found</p>
                <p className="text-2xl font-bold text-purple-600">{patterns.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {patterns.filter(p => p.confidence > 90).length} high confidence
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recommendations</p>
                <p className="text-2xl font-bold text-orange-600">{recommendations.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {recommendations.filter(r => r.priority === 'high').length} high priority
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Twin Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Twin Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <Badge
                className={`${
                  twin.status === 'active' ? 'bg-green-100 text-green-800' :
                  twin.status === 'learning' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}
                icon={undefined}
                onRemove={undefined}
              >
                {twin.status.charAt(0).toUpperCase() + twin.status.slice(1)}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">Current operational status</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Model Version</h4>
              <p className="text-lg font-mono text-gray-700">{twin.model_version || 'v1.0.0'}</p>
              <p className="text-sm text-gray-500 mt-1">Latest model version</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Last Training</h4>
              <p className="text-sm text-gray-700">
                {twin.last_training_at ? new Date(twin.last_training_at).toLocaleString() : 'Never'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Most recent learning session</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discovered Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Discovered Patterns</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patterns.length > 0 ? (
            <div className="space-y-3">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getPatternIcon(pattern.type)}
                    <div>
                      <div className="font-medium capitalize">
                        {pattern.type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Discovered {new Date(pattern.discovered_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      pattern.confidence > 90 ? 'bg-green-100 text-green-800' :
                      pattern.confidence > 75 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                    icon={undefined}
                    onRemove={undefined}
                  >
                    {Math.round(pattern.confidence)}% confidence
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No patterns discovered yet</p>
              <p className="text-sm">Keep using the platform to help your twin learn your habits</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>AI Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge
                      className={getPriorityColor(rec.priority)}
                      icon={undefined}
                      onRemove={undefined}
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {Math.round(rec.confidence)}% confidence
                    </span>
                    <Button variant="outline" size="sm">
                      Apply Recommendation
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recommendations available yet</p>
              <p className="text-sm">Your twin is still learning your patterns</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwinOverview;