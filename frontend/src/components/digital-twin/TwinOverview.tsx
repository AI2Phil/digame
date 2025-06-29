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
  RefreshCw
} from 'lucide-react';

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
  twin: DigitalTwin;
  onRefresh: () => void;
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

export const TwinOverview: React.FC<TwinOverviewProps> = ({ twin, onRefresh }) => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [twin.id]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/digital-twins/${twin.id}/insights`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data);
        setPatterns(data.discovered_patterns || []);
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
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
        <span className="ml-2">Loading insights...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Progress Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span>Learning Progress</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Learning</span>
                <span>{twin.learning_progress}%</span>
              </div>
              <Progress value={twin.learning_progress} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Accuracy Score</span>
                <span>{twin.accuracy_score}%</span>
              </div>
              <Progress value={twin.accuracy_score} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{patterns.length}</div>
                <div className="text-sm text-gray-600">Patterns Discovered</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{recommendations.length}</div>
                <div className="text-sm text-gray-600">Recommendations</div>
              </div>
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
                <div key={pattern.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getPatternIcon(pattern.type)}
                    <div>
                      <div className="font-medium capitalize">
                        {pattern.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Discovered {new Date(pattern.discovered_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
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

      {/* Recommendations */}
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
                  <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {Math.round(rec.confidence)}% confidence
                    </span>
                    <Button variant="outline" size="sm">
                      Apply
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