import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Toast } from '../ui/Toast';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Activity,
  Brain,
  RefreshCw,
  Calendar,
  Zap
} from 'lucide-react';
import { digitalTwinApi } from '../../services/digitalTwinApi';

interface DigitalTwin {
  id: string;
  name: string;
  status: string;
  learning_progress: number;
  accuracy_score: number;
}

interface TwinAnalyticsProps {
  twinId: string;
  twin: DigitalTwin;
}

interface AnalyticsData {
  patterns: any[];
  statistics: any;
  recent_activity: any;
}

export const TwinAnalytics: React.FC<TwinAnalyticsProps> = ({ twinId, twin }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // days
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [twinId, timeRange]);

  const generateFallbackData = () => {
    const timeRangeNum = parseInt(timeRange);
    const basePatterns = Math.max(3, Math.floor(timeRangeNum / 2));
    const baseInteractions = Math.max(10, timeRangeNum * 2);
    
    return {
      patterns: [
        {
          id: 'pattern_1',
          pattern_type: 'morning_productivity',
          confidence_score: 85 + Math.random() * 10,
          frequency_score: 75 + Math.random() * 15,
          impact_score: 80 + Math.random() * 15,
          discovered_at: new Date(Date.now() - Math.random() * timeRangeNum * 24 * 60 * 60 * 1000).toISOString(),
          validated_at: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * timeRangeNum * 12 * 60 * 60 * 1000).toISOString() : null
        },
        {
          id: 'pattern_2',
          pattern_type: 'afternoon_focus',
          confidence_score: 70 + Math.random() * 20,
          frequency_score: 65 + Math.random() * 20,
          impact_score: 75 + Math.random() * 20,
          discovered_at: new Date(Date.now() - Math.random() * timeRangeNum * 24 * 60 * 60 * 1000).toISOString(),
          validated_at: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * timeRangeNum * 12 * 60 * 60 * 1000).toISOString() : null
        },
        {
          id: 'pattern_3',
          pattern_type: 'task_completion',
          confidence_score: 90 + Math.random() * 8,
          frequency_score: 85 + Math.random() * 10,
          impact_score: 88 + Math.random() * 10,
          discovered_at: new Date(Date.now() - Math.random() * timeRangeNum * 24 * 60 * 60 * 1000).toISOString(),
          validated_at: new Date(Date.now() - Math.random() * timeRangeNum * 6 * 60 * 60 * 1000).toISOString()
        }
      ].slice(0, basePatterns),
      statistics: {
        patterns_discovered: basePatterns,
        total_interactions: baseInteractions,
        processing_rate: 85 + Math.random() * 12,
        learning_efficiency: twin.learning_progress || 65 + Math.random() * 25,
        accuracy_improvement: twin.accuracy_score || 75 + Math.random() * 20,
        data_points_processed: baseInteractions + Math.floor(Math.random() * 50),
        model_confidence: 80 + Math.random() * 15
      },
      recent_activity: {
        new_patterns: Math.floor(Math.random() * 3) + 1,
        interactions: Math.floor(baseInteractions * 0.3) + Math.floor(Math.random() * 10),
        learning_sessions: Math.floor(Math.random() * 8) + 2,
        insights_generated: Math.floor(Math.random() * 5) + 3
      }
    };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timeRangeNum = parseInt(timeRange);
      
      // Fetch analytics statistics and patterns in parallel
      const [statsResponse, patternsResponse] = await Promise.all([
        digitalTwinApi.getTwinAnalyticsStatistics(timeRangeNum),
        digitalTwinApi.getTwinAnalyticsPatterns(undefined, timeRangeNum, 20)
      ]);

      if (statsResponse.success && patternsResponse.success) {
        setAnalytics({
          patterns: patternsResponse.data?.patterns || [],
          statistics: statsResponse.data?.statistics || {},
          recent_activity: statsResponse.data?.recent_activity || {}
        });
      } else {
        // Use fallback data if API calls fail
        const fallbackData = generateFallbackData();
        setAnalytics(fallbackData);
        setError('Using sample data - API connection unavailable');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use fallback data on error
      const fallbackData = generateFallbackData();
      setAnalytics(fallbackData);
      setError('Using sample data - API connection failed');
    } finally {
      setLoading(false);
    }
  };

  const getPatternTypeColor = (type: string) => {
    switch (type) {
      case 'morning_productivity': return 'bg-blue-100 text-blue-800';
      case 'afternoon_focus': return 'bg-green-100 text-green-800';
      case 'task_completion': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatternTypeLabel = (type: string) => {
    switch (type) {
      case 'morning_productivity': return 'Morning Productivity';
      case 'afternoon_focus': return 'Afternoon Focus';
      case 'task_completion': return 'Task Completion';
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Toast */}
      {error && (
        <Toast
          id="analytics-error"
          type="warning"
          title="Analytics Notice"
          message={error}
          onClose={() => setError(null)}
          action={null}
        />
      )}

      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Insights from your digital twin's learning</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Learning Progress</p>
                <p className="text-2xl font-bold">{twin.learning_progress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accuracy Score</p>
                <p className="text-2xl font-bold">{twin.accuracy_score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Patterns Found</p>
                <p className="text-2xl font-bold">{analytics?.statistics?.patterns_discovered || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold">{analytics?.statistics?.total_interactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pattern Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Discovered Patterns</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.patterns && analytics.patterns.length > 0 ? (
            <div className="space-y-4">
              {analytics.patterns.map((pattern: any, index: number) => (
                <div key={pattern.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={getPatternTypeColor(pattern.pattern_type)}
                        icon={undefined}
                        onRemove={undefined}
                      >
                        {getPatternTypeLabel(pattern.pattern_type)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Discovered {new Date(pattern.discovered_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Confidence</div>
                      <div className="font-semibold">{Math.round(pattern.confidence_score || 0)}%</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Frequency:</span>
                      <span className="ml-1 font-medium">{Math.round(pattern.frequency_score || 0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Impact:</span>
                      <span className="ml-1 font-medium">{Math.round(pattern.impact_score || 0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-1 font-medium">
                        {pattern.validated_at ? 'Validated' : 'Learning'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No patterns discovered yet</p>
              <p className="text-sm">Your twin needs more data to identify patterns</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Patterns (Last {timeRange} days)</span>
                <span className="font-semibold">{analytics?.recent_activity?.new_patterns || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Interactions</span>
                <span className="font-semibold">{analytics?.recent_activity?.interactions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing Rate</span>
                <span className="font-semibold">{Math.round(analytics?.statistics?.processing_rate || 0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Data Processing</span>
                  <span>{Math.round(analytics?.statistics?.processing_rate || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${analytics?.statistics?.processing_rate || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Learning Efficiency</span>
                  <span>{twin.learning_progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${twin.learning_progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Prediction Accuracy</span>
                  <span>{twin.accuracy_score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${twin.accuracy_score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwinAnalytics;