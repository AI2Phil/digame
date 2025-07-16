import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import Alert, { AlertDescription } from '../ui/Alert';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  Zap,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';
import { digitalTwinApi } from '../../services/digitalTwinApi';
// Import the actual panel components
import { TwinInteractionPanel } from './TwinInteractionPanel';
import { TwinInsightsPanel } from './TwinInsightsPanel';
import { TwinPredictionsPanel } from './TwinPredictionsPanel';
import { TwinPatternsPanel } from './TwinPatternsPanel';
import { TwinWorkspace } from './TwinWorkspace';
import { TwinSimulation } from './TwinSimulation';

// Create a predictions panel component for Phase 1B features
const TwinPredictionsEngine: React.FC<{twinId: string}> = ({twinId}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Productivity Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            AI-powered productivity forecasting for the next 7 days
          </p>
          <Button className="w-full" variant="outline">
            Generate Productivity Forecast
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
            Task Completion Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Predict task completion patterns and deadlines
          </p>
          <Button className="w-full" variant="outline">
            Forecast Task Completion
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Energy Level Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Predict optimal work periods based on energy patterns
          </p>
          <Button className="w-full" variant="outline">
            Predict Energy Levels
          </Button>
        </CardContent>
      </Card>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Comprehensive Intelligence Insights</CardTitle>
        <CardDescription>
          Advanced AI analysis combining all prediction models for actionable recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Phase 1B: Core Intelligence Features</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Advanced Pattern Recognition with ML algorithms</li>
              <li>• Multi-model Prediction Engine (Productivity, Tasks, Energy)</li>
              <li>• Comprehensive Intelligence API with real-time insights</li>
              <li>• Behavioral analysis with confidence scoring</li>
            </ul>
          </div>
          <Button className="w-full">
            Generate Comprehensive Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface TwinStatus {
  twin_id: string;
  name: string;
  status: string;
  learning_progress: number;
  accuracy_score: number;
  model_version: string;
  last_training: string | null;
  created_at: string;
  statistics: {
    pattern_count: number;
    interaction_count: number;
    learning_count: number;
    recent_interactions: number;
    recent_patterns: number;
  };
}

interface TwinHealth {
  health_score: number;
  health_status: string;
  twin_id: string;
  last_updated: string;
}

// Enhanced fallback data for when API is unavailable
const getEnhancedFallbackTwinStatus = (): TwinStatus => ({
  twin_id: 'demo_twin_001',
  name: 'ProductivityTwin_Demo',
  status: 'active',
  learning_progress: 78.5,
  accuracy_score: 85.2,
  model_version: 'v2.1.0',
  last_training: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  statistics: {
    pattern_count: 47,
    interaction_count: 234,
    learning_count: 156,
    recent_interactions: 12,
    recent_patterns: 8
  }
});

const getEnhancedFallbackTwinHealth = (): TwinHealth => ({
  health_score: 0.89,
  health_status: 'excellent',
  twin_id: 'demo_twin_001',
  last_updated: new Date().toISOString()
});

export const DigitalTwinDashboard: React.FC = () => {
  const [twinStatus, setTwinStatus] = useState<TwinStatus | null>(null);
  const [twinHealth, setTwinHealth] = useState<TwinHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const toast = useToastHelpers();

  const loadTwinStatus = useCallback(async () => {
    try {
      setLoading(true);
      setUsingFallbackData(false);
      const response = await digitalTwinApi.getTwinStatus();
      
      if (response.success && response.data) {
        setTwinStatus(response.data);
        // Load health data if twin exists
        loadTwinHealth();
      } else {
        setTwinStatus(null);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setTwinStatus(null);
      } else {
        // Use enhanced fallback data when API is unavailable
        console.warn('Digital Twin API unavailable, using enhanced fallback data:', error);
        setTwinStatus(getEnhancedFallbackTwinStatus());
        setTwinHealth(getEnhancedFallbackTwinHealth());
        setUsingFallbackData(true);
        toast.info("Using demo data - Digital Twin API currently unavailable");
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTwinStatus();
  }, [loadTwinStatus]);

  const loadTwinHealth = async () => {
    try {
      const response = await digitalTwinApi.getTwinHealth();
      if (response.success && response.data) {
        setTwinHealth(response.data);
      }
    } catch (error) {
      console.warn('Failed to load twin health, using fallback data:', error);
      // Fallback data is already set in loadTwinStatus when API is unavailable
      if (!usingFallbackData) {
        setTwinHealth(getEnhancedFallbackTwinHealth());
      }
    }
  };

  const initializeTwin = async () => {
    try {
      setInitializing(true);
      const response = await digitalTwinApi.initializeTwin({
        name: `ProductivityTwin_${Date.now()}`
      });

      if (response.success) {
        toast.success("Digital twin initialized successfully!");
        await loadTwinStatus();
      } else {
        toast.error(response.message || "Failed to initialize digital twin");
      }
    } catch (error) {
      toast.error("Failed to initialize digital twin");
    } finally {
      setInitializing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'learning': return 'bg-blue-500';
      case 'initializing': return 'bg-yellow-500';
      case 'paused': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading digital twin...</span>
      </div>
    );
  }

  if (!twinStatus) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <CardTitle className="text-2xl">Initialize Your Digital Twin</CardTitle>
            <CardDescription>
              Create your personal productivity twin to start learning from your work patterns
              and provide intelligent insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Pattern Recognition</h3>
                  <p className="text-sm text-gray-600">Learn from your work habits</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Predictions</h3>
                  <p className="text-sm text-gray-600">Forecast productivity trends</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold">Interactions</h3>
                  <p className="text-sm text-gray-600">Get personalized recommendations</p>
                </div>
              </div>
              <Button 
                onClick={initializeTwin} 
                disabled={initializing}
                size="lg"
                className="w-full md:w-auto"
              >
                {initializing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Initialize Digital Twin
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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
            Digital Twin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and interact with your productivity twin
          </p>
        </div>
        <Button onClick={loadTwinStatus} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Fallback Data Notification */}
      {usingFallbackData && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> Displaying enhanced sample data as the Digital Twin API is currently unavailable.
            All features are functional with realistic demo data patterns.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(twinStatus.status)}`} />
                  <span className="capitalize font-semibold">{twinStatus.status}</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Progress</p>
                <div className="mt-1">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">{twinStatus.learning_progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={twinStatus.learning_progress} className="mt-1" />
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy Score</p>
                <div className="mt-1">
                  <span className="text-2xl font-bold">{twinStatus.accuracy_score.toFixed(1)}%</span>
                  <Progress value={twinStatus.accuracy_score} className="mt-1" />
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Status</p>
                <div className="mt-1">
                  {twinHealth ? (
                    <>
                      <span className={`text-lg font-bold capitalize ${getHealthStatusColor(twinHealth.health_status)}`}>
                        {twinHealth.health_status}
                      </span>
                      <div className="text-sm text-gray-500">
                        Score: {(twinHealth.health_score * 100).toFixed(0)}%
                      </div>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-400">Loading...</span>
                  )}
                </div>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discovered Patterns</p>
                <span className="text-2xl font-bold">{twinStatus.statistics.pattern_count}</span>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                <span className="text-2xl font-bold">{twinStatus.statistics.interaction_count}</span>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Entries</p>
                <span className="text-2xl font-bold">{twinStatus.statistics.learning_count}</span>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interact">Interact</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Access your twin's key features and start optimizing your productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('workspace')}
                >
                  <MessageSquare className="h-6 w-6 text-purple-500" />
                  <span className="text-sm font-medium">Chat with Twin</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('simulation')}
                >
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium">Run Simulation</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('predictions')}
                >
                  <TrendingUp className="h-6 w-6 text-green-500" />
                  <span className="text-sm font-medium">AI Predictions</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('patterns')}
                >
                  <Target className="h-6 w-6 text-orange-500" />
                  <span className="text-sm font-medium">Pattern Analysis</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('insights')}
                >
                  <Brain className="h-6 w-6 text-indigo-500" />
                  <span className="text-sm font-medium">Intelligence</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setActiveTab('interact')}
                >
                  <Activity className="h-6 w-6 text-cyan-500" />
                  <span className="text-sm font-medium">Interact</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Twin Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{twinStatus.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model Version:</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">{twinStatus.model_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(twinStatus.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Training:</span>
                  <span className="font-medium">
                    {twinStatus.last_training
                      ? new Date(twinStatus.last_training).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recent Interactions:</span>
                  <span className="font-medium">{twinStatus.statistics.recent_interactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recent Patterns:</span>
                  <span className="font-medium">{twinStatus.statistics.recent_patterns}</span>
                </div>
                <div className="pt-2">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2" />
                      <p className="text-sm text-blue-800">
                        Your twin is actively learning from your work patterns.
                        The more you interact, the better insights it can provide.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Digital Twin Platform Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Digital Twin Platform Features
              </CardTitle>
              <CardDescription>
                Comprehensive AI-powered capabilities across all implementation phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-semibold">Phase 1A: Core Intelligence</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Advanced pattern recognition and behavioral analysis with machine learning algorithms.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('patterns')}
                    className="w-full"
                  >
                    Analyze Patterns
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold">Phase 1B: Prediction Engine</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Multi-model predictions for productivity, tasks, and energy levels with confidence scoring.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('predictions')}
                    className="w-full"
                  >
                    View Predictions
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
                    <h3 className="font-semibold">Phase 1C: User Experience</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Natural conversation interface and advanced simulation capabilities for optimization.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('workspace')}
                    className="w-full"
                  >
                    Try Workspace
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500 mr-2" />
                  <h3 className="font-semibold">Advanced Simulations</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Run sophisticated scenarios with schedule optimization, workload analysis, and energy management.
                </p>
                <Button
                  size="sm"
                  onClick={() => setActiveTab('simulation')}
                  className="w-full"
                >
                  Run Advanced Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interact">
          <TwinInteractionPanel twinId={twinStatus.twin_id} />
        </TabsContent>

        <TabsContent value="workspace">
          <TwinWorkspace twinId={twinStatus.twin_id} />
        </TabsContent>

        <TabsContent value="simulation">
          <TwinSimulation twinId={twinStatus.twin_id} />
        </TabsContent>

        <TabsContent value="predictions">
          <TwinPredictionsEngine twinId={twinStatus.twin_id} />
        </TabsContent>

        <TabsContent value="insights">
          <TwinInsightsPanel twinId={twinStatus.twin_id} />
        </TabsContent>

        <TabsContent value="patterns">
          <TwinPatternsPanel twinId={twinStatus.twin_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};