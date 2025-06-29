import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Target,
  Clock,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { digitalTwinApi, TwinInsights } from '../../services/digitalTwinApi';

interface TwinInsightsPanelProps {
  twinId: string;
}

// Note: useToast hook would need to be implemented or use a simple alert for now
const useToast = () => ({
  toast: ({ title, description, variant }: any) => {
    console.log(`${variant === 'destructive' ? 'Error' : 'Info'}: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  }
});

export const TwinInsightsPanel: React.FC<TwinInsightsPanelProps> = ({ twinId }) => {
  const [insights, setInsights] = useState<TwinInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInsights();
  }, [twinId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const response = await digitalTwinApi.getTwinInsights();
      
      if (response.success && response.data) {
        setInsights(response.data);
      } else {
        throw new Error(response.message || 'Failed to load insights');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load twin insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    try {
      setRefreshing(true);
      await loadInsights();
      toast({
        title: "Success",
        description: "Insights refreshed successfully",
      });
    } catch (error) {
      // Error already handled in loadInsights
    } finally {
      setRefreshing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'productivity_optimization': return <TrendingUp className="h-4 w-4" />;
      case 'focus_improvement': return <Target className="h-4 w-4" />;
      case 'energy_management': return <Zap className="h-4 w-4" />;
      case 'time_management': return <Clock className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin mr-2" />
            <span>Loading insights...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No insights available</p>
            <Button onClick={loadInsights}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-blue-500" />
            Twin Insights
          </h2>
          <p className="text-gray-600 mt-1">
            Generated on {new Date(insights.insights_generated_at).toLocaleString()}
          </p>
        </div>
        <Button 
          onClick={refreshInsights} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Twin Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {insights.twin_status.learning_progress.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Learning Progress</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {insights.twin_status.accuracy_score.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy Score</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(insights.twin_status.health_score * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Health Score</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl font-bold capitalize ${
                insights.twin_status.status === 'active' ? 'text-green-600' : 
                insights.twin_status.status === 'learning' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {insights.twin_status.status}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No recommendations available yet.</p>
              <p className="text-sm mt-2">Your twin needs more data to generate personalized recommendations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.recommendations.map((recommendation, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg ${getPriorityColor(recommendation.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getRecommendationIcon(recommendation.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 bg-white rounded border">
                            {recommendation.priority.toUpperCase()}
                          </span>
                          <span className="text-xs px-2 py-1 bg-white rounded border">
                            {Math.round(recommendation.confidence * 100)}% confident
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{recommendation.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discovered Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Discovered Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.discovered_patterns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No patterns discovered yet.</p>
              <p className="text-sm mt-2">Your twin is still learning from your behavior patterns.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.discovered_patterns.slice(0, 5).map((pattern, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Pattern #{index + 1}</span>
                    <span className="text-xs text-gray-500">
                      Discovered recently
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Pattern analysis data available
                  </p>
                </div>
              ))}
              {insights.discovered_patterns.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-gray-500">
                    +{insights.discovered_patterns.length - 5} more patterns
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Recent Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.recent_predictions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No recent predictions.</p>
              <p className="text-sm mt-2">Generate predictions to see them here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.recent_predictions.slice(0, 3).map((prediction, index) => (
                <div key={index} className="p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Prediction #{index + 1}</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Prediction data available
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => {
                // This would trigger a new prediction generation
                toast({
                  title: "Info",
                  description: "Prediction generation would be triggered here",
                });
              }}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Generate New Predictions</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => {
                // This would trigger pattern analysis
                toast({
                  title: "Info",
                  description: "Pattern analysis would be triggered here",
                });
              }}
            >
              <Target className="h-6 w-6" />
              <span>Analyze Patterns</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};