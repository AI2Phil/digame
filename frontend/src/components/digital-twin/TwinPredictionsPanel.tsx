import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  TrendingUp, 
  Calendar, 
  Target,
  Zap,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { digitalTwinApi } from '../../services/digitalTwinApi';

interface TwinPredictionsPanelProps {
  twinId: string;
}

interface Prediction {
  id: string;
  type: string;
  data: any;
  confidence: number;
  timeHorizon: number;
  generatedAt: string;
}

// Note: useToast hook would need to be implemented or use a simple alert for now
const useToast = () => ({
  toast: ({ title, description, variant }: any) => {
    console.log(`${variant === 'destructive' ? 'Error' : 'Info'}: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  }
});

export const TwinPredictionsPanel: React.FC<TwinPredictionsPanelProps> = ({ twinId }) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load any existing predictions from localStorage or API
    loadStoredPredictions();
  }, [twinId]);

  const loadStoredPredictions = () => {
    // In a real implementation, this would load from the backend
    const stored = localStorage.getItem(`predictions_${twinId}`);
    if (stored) {
      try {
        setPredictions(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored predictions:', error);
      }
    }
  };

  const storePredictions = (newPredictions: Prediction[]) => {
    localStorage.setItem(`predictions_${twinId}`, JSON.stringify(newPredictions));
    setPredictions(newPredictions);
  };

  const generatePrediction = async (type: 'productivity' | 'tasks' | 'energy' | 'comprehensive', timeHorizon: number = 7) => {
    try {
      setGenerating(type);
      const response = await digitalTwinApi.generatePredictions({
        prediction_type: type,
        time_horizon: timeHorizon
      });

      if (response.success && response.data) {
        const newPrediction: Prediction = {
          id: `pred_${Date.now()}`,
          type,
          data: response.data.predictions,
          confidence: 0.85, // This would come from the API response
          timeHorizon,
          generatedAt: new Date().toISOString()
        };

        const updatedPredictions = [newPrediction, ...predictions.slice(0, 9)]; // Keep last 10
        storePredictions(updatedPredictions);

        toast({
          title: "Success",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} prediction generated successfully`,
        });
      } else {
        throw new Error(response.message || 'Failed to generate prediction');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate prediction",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="h-5 w-5" />;
      case 'tasks': return <Target className="h-5 w-5" />;
      case 'energy': return <Zap className="h-5 w-5" />;
      case 'comprehensive': return <BarChart3 className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getPredictionColor = (type: string) => {
    switch (type) {
      case 'productivity': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'tasks': return 'text-green-600 bg-green-50 border-green-200';
      case 'energy': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'comprehensive': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const predictionTypes = [
    {
      type: 'productivity' as const,
      title: 'Productivity Forecast',
      description: 'Predict your productivity levels for the coming days',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-blue-600'
    },
    {
      type: 'tasks' as const,
      title: 'Task Completion',
      description: 'Forecast task completion rates and patterns',
      icon: <Target className="h-6 w-6" />,
      color: 'text-green-600'
    },
    {
      type: 'energy' as const,
      title: 'Energy Levels',
      description: 'Predict your energy patterns throughout the day',
      icon: <Zap className="h-6 w-6" />,
      color: 'text-yellow-600'
    },
    {
      type: 'comprehensive' as const,
      title: 'Comprehensive Analysis',
      description: 'Generate comprehensive insights across all metrics',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-500" />
          Predictions & Forecasts
        </h2>
        <p className="text-gray-600 mt-1">
          Generate and view predictions based on your behavioral patterns
        </p>
      </div>

      {/* Generate New Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Generate New Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictionTypes.map((predType) => (
              <div key={predType.type} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${predType.color}`}>
                    {predType.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{predType.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{predType.description}</p>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => generatePrediction(predType.type, 7)}
                        disabled={generating === predType.type}
                        className="flex-1"
                      >
                        {generating === predType.type ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            {predType.icon}
                            <span className="ml-2">Generate (7 days)</span>
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generatePrediction(predType.type, 30)}
                        disabled={generating === predType.type}
                      >
                        30 days
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No predictions generated yet</p>
              <p className="text-sm mt-2">Generate your first prediction using the options above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div 
                  key={prediction.id}
                  className={`p-4 border rounded-lg ${getPredictionColor(prediction.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getPredictionIcon(prediction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold capitalize">
                            {prediction.type} Prediction
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                              {Math.round(prediction.confidence * 100)}% confidence
                            </span>
                            <span className="text-xs px-2 py-1 bg-white rounded border">
                              {prediction.timeHorizon} days
                            </span>
                          </div>
                        </div>
                        
                        {/* Prediction Summary */}
                        <div className="bg-white bg-opacity-50 p-3 rounded mb-3">
                          <h4 className="font-medium text-sm mb-2">Prediction Summary:</h4>
                          <div className="text-sm">
                            {prediction.type === 'productivity' && (
                              <div className="space-y-1">
                                <p>• Expected productivity trend: <span className="font-medium">Stable with slight improvement</span></p>
                                <p>• Peak performance hours: <span className="font-medium">9:00 AM - 11:00 AM</span></p>
                                <p>• Recommended focus time: <span className="font-medium">90-minute blocks</span></p>
                              </div>
                            )}
                            {prediction.type === 'tasks' && (
                              <div className="space-y-1">
                                <p>• Expected completion rate: <span className="font-medium">85%</span></p>
                                <p>• Optimal task scheduling: <span className="font-medium">Morning hours</span></p>
                                <p>• Potential bottlenecks: <span className="font-medium">Afternoon meetings</span></p>
                              </div>
                            )}
                            {prediction.type === 'energy' && (
                              <div className="space-y-1">
                                <p>• Energy peak: <span className="font-medium">10:00 AM</span></p>
                                <p>• Energy dip: <span className="font-medium">2:00 PM - 3:00 PM</span></p>
                                <p>• Recovery time: <span className="font-medium">15-minute breaks recommended</span></p>
                              </div>
                            )}
                            {prediction.type === 'comprehensive' && (
                              <div className="space-y-1">
                                <p>• Overall outlook: <span className="font-medium">Positive trend</span></p>
                                <p>• Key recommendations: <span className="font-medium">3 actionable insights</span></p>
                                <p>• Areas for improvement: <span className="font-medium">Time management</span></p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Generated: {formatDate(prediction.generatedAt)}</span>
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Prediction Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {predictions.length}
                </div>
                <div className="text-sm text-gray-600">Total Predictions</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {predictions.filter(p => p.confidence >= 0.8).length}
                </div>
                <div className="text-sm text-gray-600">High Confidence</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(predictions.map(p => p.type)).size}
                </div>
                <div className="text-sm text-gray-600">Prediction Types</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Avg. Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};