import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, TrendingUp, AlertTriangle, Target, Zap, Eye, 
  Calendar, BarChart3, LineChart, Activity, Users, DollarSign,
  ArrowUp, ArrowDown, Minus, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { useToast } from './ui/Toast';
import DataVisualizationEngine from './DataVisualizationEngine';
import enhancedApiService from '../services/enhancedApiService';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Bar
} from 'recharts';

const PredictiveAnalyticsEngine = ({ 
  dataSource = 'comprehensive',
  timeHorizon = '30d',
  confidenceThreshold = 0.7,
  onPredictionUpdate,
  className = ''
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState({});
  const [scenarios, setScenarios] = useState([]);
  const [riskFactors, setRiskFactors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [modelPerformance, setModelPerformance] = useState({});
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    loadPredictiveAnalytics();
    setupRealTimeUpdates();
  }, [dataSource, timeHorizon]);

  const loadPredictiveAnalytics = async () => {
    setLoading(true);
    try {
      const [
        predictionsData,
        scenariosData,
        risksData,
        recommendationsData,
        performanceData,
        forecastsData
      ] = await Promise.all([
        enhancedApiService.getPredictiveInsights({ dataSource, timeHorizon }),
        enhancedApiService.getScenarioAnalysis({ timeHorizon }),
        enhancedApiService.getRiskAnalysis(),
        enhancedApiService.getAIRecommendations(),
        enhancedApiService.getModelPerformance(),
        enhancedApiService.getForecastData({ timeHorizon })
      ]);

      setPredictions(predictionsData || generateMockPredictions());
      setScenarios(scenariosData || generateMockScenarios());
      setRiskFactors(risksData || generateMockRiskFactors());
      setRecommendations(recommendationsData || generateMockRecommendations());
      setModelPerformance(performanceData || generateMockModelPerformance());
      setForecastData(forecastsData || generateMockForecastData());

      onPredictionUpdate?.(predictionsData);
    } catch (error) {
      console.error('Failed to load predictive analytics:', error);
      toast.error('Failed to load predictive analytics');
      // Load mock data as fallback
      setPredictions(generateMockPredictions());
      setScenarios(generateMockScenarios());
      setRiskFactors(generateMockRiskFactors());
      setRecommendations(generateMockRecommendations());
      setModelPerformance(generateMockModelPerformance());
      setForecastData(generateMockForecastData());
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      try {
        const updatedPredictions = await enhancedApiService.getRealTimePredictions();
        setPredictions(prev => ({ ...prev, ...updatedPredictions }));
      } catch (error) {
        console.error('Failed to update predictions:', error);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  };

  // Mock data generators
  const generateMockPredictions = () => ({
    revenue: {
      current: 234567,
      predicted: 287450,
      confidence: 0.87,
      trend: 'up',
      change: 22.5,
      factors: ['Seasonal trends', 'New feature adoption', 'Market expansion']
    },
    users: {
      current: 12847,
      predicted: 15620,
      confidence: 0.82,
      trend: 'up',
      change: 21.6,
      factors: ['Marketing campaigns', 'Product improvements', 'Referral program']
    },
    churn: {
      current: 3.4,
      predicted: 2.8,
      confidence: 0.75,
      trend: 'down',
      change: -17.6,
      factors: ['Improved onboarding', 'Better support', 'Feature enhancements']
    },
    performance: {
      current: 245,
      predicted: 198,
      confidence: 0.91,
      trend: 'down',
      change: -19.2,
      factors: ['Infrastructure upgrades', 'Code optimization', 'CDN improvements']
    }
  });

  const generateMockScenarios = () => [
    {
      id: 1,
      name: 'Optimistic Growth',
      probability: 0.25,
      revenue: 320000,
      users: 18500,
      description: 'Strong market conditions and successful product launches'
    },
    {
      id: 2,
      name: 'Expected Growth',
      probability: 0.50,
      revenue: 287450,
      users: 15620,
      description: 'Normal market conditions with steady growth'
    },
    {
      id: 3,
      name: 'Conservative Growth',
      probability: 0.20,
      revenue: 245000,
      users: 13200,
      description: 'Challenging market conditions but stable performance'
    },
    {
      id: 4,
      name: 'Pessimistic Scenario',
      probability: 0.05,
      revenue: 198000,
      users: 11800,
      description: 'Economic downturn or significant market disruption'
    }
  ];

  const generateMockRiskFactors = () => [
    {
      id: 1,
      name: 'Market Competition',
      impact: 'high',
      probability: 0.65,
      description: 'Increased competition from new market entrants',
      mitigation: 'Enhance product differentiation and customer loyalty programs'
    },
    {
      id: 2,
      name: 'Economic Downturn',
      impact: 'medium',
      probability: 0.35,
      description: 'Potential economic recession affecting customer spending',
      mitigation: 'Diversify revenue streams and focus on essential features'
    },
    {
      id: 3,
      name: 'Technical Debt',
      impact: 'medium',
      probability: 0.45,
      description: 'Accumulated technical debt slowing development',
      mitigation: 'Allocate dedicated time for refactoring and modernization'
    },
    {
      id: 4,
      name: 'Key Personnel Loss',
      impact: 'high',
      probability: 0.25,
      description: 'Risk of losing critical team members',
      mitigation: 'Improve retention strategies and knowledge documentation'
    }
  ];

  const generateMockRecommendations = () => [
    {
      id: 1,
      type: 'growth',
      priority: 'high',
      title: 'Accelerate Mobile App Development',
      description: 'Mobile users show 40% higher engagement. Prioritize mobile features.',
      impact: 'Revenue increase of 15-20%',
      effort: 'Medium',
      timeline: '3-4 months'
    },
    {
      id: 2,
      type: 'retention',
      priority: 'high',
      title: 'Implement Advanced Onboarding',
      description: 'Users completing advanced onboarding have 60% lower churn.',
      impact: 'Churn reduction of 25%',
      effort: 'Low',
      timeline: '4-6 weeks'
    },
    {
      id: 3,
      type: 'optimization',
      priority: 'medium',
      title: 'Optimize API Performance',
      description: 'Response time improvements correlate with user satisfaction.',
      impact: 'User satisfaction +12%',
      effort: 'Medium',
      timeline: '6-8 weeks'
    },
    {
      id: 4,
      type: 'expansion',
      priority: 'medium',
      title: 'Target Enterprise Segment',
      description: 'Enterprise customers show highest LTV potential.',
      impact: 'Revenue increase of 30%',
      effort: 'High',
      timeline: '6-12 months'
    }
  ];

  const generateMockModelPerformance = () => ({
    accuracy: 0.87,
    precision: 0.84,
    recall: 0.89,
    f1Score: 0.86,
    lastTrained: '2025-01-05T10:30:00Z',
    dataPoints: 125000,
    features: 45,
    models: [
      { name: 'Revenue Prediction', accuracy: 0.91, type: 'Random Forest' },
      { name: 'User Growth', accuracy: 0.85, type: 'LSTM Neural Network' },
      { name: 'Churn Prediction', accuracy: 0.88, type: 'Gradient Boosting' },
      { name: 'Performance Forecast', accuracy: 0.83, type: 'Linear Regression' }
    ]
  });

  const generateMockForecastData = () => [
    { period: 'Week 1', revenue: 58000, users: 13200, churn: 3.2, performance: 235 },
    { period: 'Week 2', revenue: 62000, users: 13800, churn: 3.0, performance: 225 },
    { period: 'Week 3', revenue: 65000, users: 14400, churn: 2.9, performance: 215 },
    { period: 'Week 4', revenue: 68000, users: 15000, churn: 2.8, performance: 205 },
    { period: 'Week 5', revenue: 71000, users: 15600, churn: 2.7, performance: 198 },
    { period: 'Week 6', revenue: 74000, users: 16200, churn: 2.6, performance: 192 }
  ];

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
            <p className="text-gray-600">AI-powered insights and forecasting</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></div>
            Live Predictions
          </Badge>
        </div>
      </div>

      {/* Key Predictions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PredictionCard
          title="Revenue Forecast"
          current={predictions.revenue?.current}
          predicted={predictions.revenue?.predicted}
          confidence={predictions.revenue?.confidence}
          trend={predictions.revenue?.trend}
          change={predictions.revenue?.change}
          icon={DollarSign}
          format="currency"
        />
        <PredictionCard
          title="User Growth"
          current={predictions.users?.current}
          predicted={predictions.users?.predicted}
          confidence={predictions.users?.confidence}
          trend={predictions.users?.trend}
          change={predictions.users?.change}
          icon={Users}
          format="number"
        />
        <PredictionCard
          title="Churn Rate"
          current={predictions.churn?.current}
          predicted={predictions.churn?.predicted}
          confidence={predictions.churn?.confidence}
          trend={predictions.churn?.trend}
          change={predictions.churn?.change}
          icon={TrendingUp}
          format="percentage"
        />
        <PredictionCard
          title="Performance"
          current={predictions.performance?.current}
          predicted={predictions.performance?.predicted}
          confidence={predictions.performance?.confidence}
          trend={predictions.performance?.trend}
          change={predictions.performance?.change}
          icon={Activity}
          format="duration"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Confidence</CardTitle>
                <CardDescription>Model confidence levels across different metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(predictions).map(([key, data]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{key}</span>
                      <div className="flex items-center gap-3">
                        <Progress value={data.confidence * 100} className="w-24" />
                        <Badge className={getConfidenceColor(data.confidence)}>
                          {getConfidenceBadge(data.confidence)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>AI model accuracy and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(modelPerformance.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Overall Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {modelPerformance.dataPoints?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Training Data Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {modelPerformance.features}
                    </div>
                    <div className="text-sm text-gray-500">Features</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {modelPerformance.models?.length}
                    </div>
                    <div className="text-sm text-gray-500">Active Models</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Metric Forecast</CardTitle>
              <CardDescription>6-week forecast across key business metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <DataVisualizationEngine
                  data={forecastData}
                  chartType="composed"
                  title="Business Metrics Forecast"
                  description="Predicted trends for the next 6 weeks"
                  interactive={true}
                  exportable={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map(scenario => (
              <Card key={scenario.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {scenario.name}
                    <Badge variant="outline">
                      {(scenario.probability * 100).toFixed(0)}% likely
                    </Badge>
                  </CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-semibold">${scenario.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Users:</span>
                      <span className="font-semibold">{scenario.users.toLocaleString()}</span>
                    </div>
                    <Progress value={scenario.probability * 100} className="mt-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="space-y-4">
            {riskFactors.map(risk => (
              <Card key={risk.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{risk.name}</h3>
                        <Badge className={getRiskColor(risk.impact)}>
                          {risk.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {(risk.probability * 100).toFixed(0)}% probability
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{risk.description}</p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Mitigation Strategy:</h4>
                        <p className="text-blue-800 text-sm">{risk.mitigation}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      {risk.impact === 'high' ? (
                        <XCircle className="w-8 h-8 text-red-500" />
                      ) : risk.impact === 'medium' ? (
                        <AlertTriangle className="w-8 h-8 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      )}
                    </div>
                  </div>
                  <Progress value={risk.probability * 100} className="mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map(rec => (
              <Card key={rec.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{rec.title}</h3>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline">{rec.type}</Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{rec.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-1">Expected Impact</h4>
                          <p className="text-green-800 text-sm">{rec.impact}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Effort Required</h4>
                          <p className="text-blue-800 text-sm">{rec.effort}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-1">Timeline</h4>
                          <p className="text-purple-800 text-sm">{rec.timeline}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Target className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Prediction Card Component
const PredictionCard = ({ 
  title, 
  current, 
  predicted, 
  confidence, 
  trend, 
  change, 
  icon: Icon, 
  format = 'number' 
}) => {
  const formatValue = (value) => {
    if (!value) return 'N/A';
    
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      case 'duration':
        return `${value}ms`;
      default:
        return value.toLocaleString();
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <Badge className={getConfidenceColor(confidence)}>
            {confidence ? `${(confidence * 100).toFixed(0)}%` : 'N/A'}
          </Badge>
        </div>
        
        <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Current:</span>
            <span className="font-semibold">{formatValue(current)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Predicted:</span>
            <span className="font-semibold text-blue-600">{formatValue(predicted)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Change:</span>
            <div className="flex items-center gap-1">
              {getTrendIcon(trend)}
              <span className={`font-semibold ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change ? `${Math.abs(change).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveAnalyticsEngine;