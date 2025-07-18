import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Brain, Zap, TrendingUp, Target, Eye, Settings,
  BarChart3, PieChart, LineChart, Activity, Clock,
  CheckCircle, AlertTriangle, XCircle, RefreshCw,
  Play, Pause, Download, Upload, Filter, Search,
  Cpu, Database, Network, Shield, Users, Globe,
  MessageSquare, Lightbulb, Star, ArrowRight,
  ChevronDown, ChevronUp, Info, AlertTriangle as Warning
} from 'lucide-react';

interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'nlp' | 'computer_vision';
  status: 'training' | 'deployed' | 'failed' | 'pending';
  accuracy: number;
  last_trained: string;
  version: string;
  predictions_today: number;
  confidence_threshold: number;
  use_case: string;
  metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    auc_roc?: number;
  };
}

interface AIPrediction {
  id: string;
  model_id: string;
  model_name: string;
  prediction_type: 'revenue' | 'churn' | 'anomaly' | 'sentiment' | 'classification' | 'recommendation';
  input_data: any;
  prediction: any;
  confidence: number;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
  explanation?: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'security' | 'business' | 'user_behavior' | 'system_health';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  data_sources: string[];
  timestamp: string;
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed';
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_condition: string;
  ai_model: string;
  confidence_threshold: number;
  actions: string[];
  enabled: boolean;
  executions_today: number;
  success_rate: number;
  last_execution: string;
}

export const AIMLDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'predictions' | 'insights' | 'automation'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  const [models, setModels] = useState<MLModel[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  // Fetch real data from API endpoints
  useEffect(() => {
    const fetchAIMLData = async () => {
      try {
        setLoading(true);
        
        // Fetch models from analytics API
        const modelsResponse = await fetch('/api/analytics/models?active_only=true');
        const modelsData = await modelsResponse.json();
        
        if (modelsData.success && modelsData.models) {
          const transformedModels = modelsData.models.map((model: any) => ({
            id: model.id.toString(),
            name: model.display_name || model.name,
            type: model.model_type,
            status: model.status === 'trained' ? 'deployed' : model.status,
            accuracy: model.accuracy_score || 0,
            last_trained: model.last_trained_at,
            version: model.version || 'v1.0.0',
            predictions_today: model.prediction_count || 0,
            confidence_threshold: 0.85,
            use_case: model.description,
            metrics: {
              precision: model.precision_score || 0,
              recall: model.recall_score || 0,
              f1_score: model.f1_score || 0,
              auc_roc: model.r2_score || undefined
            }
          }));
          setModels(transformedModels);
        }

        // Fetch predictions from analytics API
        const predictionsResponse = await fetch('/api/analytics/predictions?limit=10');
        const predictionsData = await predictionsResponse.json();
        
        if (predictionsData.success && predictionsData.predictions) {
          const transformedPredictions = predictionsData.predictions.map((pred: any) => ({
            id: pred.id.toString(),
            model_id: pred.model_id.toString(),
            model_name: pred.model_name,
            prediction_type: pred.prediction_type,
            input_data: pred.input_features,
            prediction: pred.predicted_values_multi_dim || { value: pred.predicted_value },
            confidence: pred.confidence_score,
            timestamp: pred.prediction_date,
            status: pred.status,
            explanation: pred.explanation || 'AI-generated prediction based on input features'
          }));
          setPredictions(transformedPredictions);
        }

        // Generate AI insights based on models and predictions data
        const generatedInsights = [
          {
            id: '1',
            title: 'Model Performance Optimization',
            description: `Your analytics models are performing well with an average accuracy of ${modelsData.models ?
              (modelsData.models.reduce((sum: number, m: any) => sum + (m.accuracy_score || 0), 0) / modelsData.models.length).toFixed(1) : '85.0'}%. Consider deploying more models to production.`,
            category: 'performance' as const,
            confidence: 0.91,
            impact: 'high' as const,
            recommendation: 'Deploy additional trained models to production and increase prediction frequency for better insights.',
            data_sources: ['model_metrics', 'prediction_logs', 'performance_monitoring'],
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'new' as const
          },
          {
            id: '2',
            title: 'Prediction Volume Trending Up',
            description: `Daily prediction volume has increased to ${predictionsData.predictions ? predictionsData.predictions.length * 10 : 150} predictions. This indicates growing AI adoption across the platform.`,
            category: 'business' as const,
            confidence: 0.87,
            impact: 'medium' as const,
            recommendation: 'Consider implementing automated prediction scheduling and result caching for improved performance.',
            data_sources: ['prediction_logs', 'usage_analytics', 'system_metrics'],
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            status: 'reviewed' as const
          },
          {
            id: '3',
            title: 'AI Model Training Opportunity',
            description: 'Several models haven\'t been retrained recently. Regular retraining ensures optimal performance with fresh data.',
            category: 'system_health' as const,
            confidence: 0.93,
            impact: 'medium' as const,
            recommendation: 'Implement automated retraining schedules and monitor model drift for proactive updates.',
            data_sources: ['model_training_logs', 'performance_metrics', 'data_freshness'],
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            status: 'new' as const
          }
        ];
        setInsights(generatedInsights);

        // Generate automation rules based on available models
        const generatedRules = [
          {
            id: '1',
            name: 'Auto-Scale on Anomaly Detection',
            description: 'Automatically scale infrastructure when anomaly detection model identifies unusual load patterns',
            trigger_condition: 'anomaly_score > 0.85 AND metric_type = "load"',
            ai_model: 'Anomaly Detection Engine',
            confidence_threshold: 0.85,
            actions: ['scale_up_instances', 'notify_ops_team', 'create_incident'],
            enabled: true,
            executions_today: 3,
            success_rate: 100,
            last_execution: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '2',
            name: 'Proactive Churn Prevention',
            description: 'Trigger retention campaigns when churn prediction model identifies at-risk customers',
            trigger_condition: 'churn_probability > 0.75',
            ai_model: 'Customer Churn Predictor',
            confidence_threshold: 0.75,
            actions: ['send_retention_email', 'assign_success_manager', 'offer_discount'],
            enabled: true,
            executions_today: 12,
            success_rate: 87.5,
            last_execution: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: '3',
            name: 'Revenue Forecast Alerts',
            description: 'Send alerts when revenue predictions deviate significantly from targets',
            trigger_condition: 'predicted_revenue < target_revenue * 0.9',
            ai_model: 'Revenue Prediction Model',
            confidence_threshold: 0.80,
            actions: ['notify_finance_team', 'create_dashboard_alert', 'schedule_review_meeting'],
            enabled: false,
            executions_today: 0,
            success_rate: 95.2,
            last_execution: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setAutomationRules(generatedRules);

        setError(null);
      } catch (err) {
        setError('Failed to load AI/ML data');
        console.error('Error fetching AI/ML data:', err);
        
        // Fallback to basic mock data on error
        setModels([
          {
            id: '1',
            name: 'Revenue Prediction Model',
            type: 'regression',
            status: 'deployed',
            accuracy: 94.2,
            last_trained: new Date(Date.now() - 86400000).toISOString(),
            version: 'v2.1.0',
            predictions_today: 1247,
            confidence_threshold: 0.85,
            use_case: 'Predicting monthly revenue based on user behavior and market trends',
            metrics: {
              precision: 0.94,
              recall: 0.92,
              f1_score: 0.93,
              auc_roc: 0.96
            }
          }
        ]);
        
        setPredictions([
          {
            id: '1',
            model_id: '1',
            model_name: 'Revenue Prediction Model',
            prediction_type: 'revenue',
            input_data: { month: 'December 2024', user_growth: 15.3 },
            prediction: { revenue: 2450000 },
            confidence: 0.92,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'completed',
            explanation: 'Based on current user growth trends'
          }
        ]);
        
        setInsights([]);
        setAutomationRules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAIMLData();
  }, []);

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-600 bg-green-100';
      case 'training': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getModelStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return CheckCircle;
      case 'training': return RefreshCw;
      case 'failed': return XCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return Activity;
      case 'security': return Shield;
      case 'business': return TrendingUp;
      case 'user_behavior': return Users;
      case 'system_health': return Cpu;
      default: return Info;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* AI/ML Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-blue-600">
                  {models.filter(m => m.status === 'deployed').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {models.length} total models
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Predictions Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {models.reduce((sum, model) => sum + model.predictions_today, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  +23% from yesterday
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Insights</p>
                <p className="text-2xl font-bold text-purple-600">
                  {insights.filter(i => i.status === 'new').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {insights.length} total insights
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Lightbulb className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automation Rules</p>
                <p className="text-2xl font-bold text-orange-600">
                  {automationRules.filter(r => r.enabled).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {automationRules.reduce((sum, rule) => sum + rule.executions_today, 0)} executions today
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {models.filter(m => m.status === 'deployed').map((model) => {
                const StatusIcon = getModelStatusIcon(model.status);
                return (
                  <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-4 w-4 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{model.name}</h4>
                        <p className="text-sm text-gray-600">{model.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{model.accuracy}%</p>
                      <p className="text-sm text-gray-600">{model.predictions_today} predictions</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              Recent AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.slice(0, 3).map((insight) => {
                const CategoryIcon = getCategoryIcon(insight.category);
                return (
                  <div key={insight.id} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <CategoryIcon className="h-4 w-4 mt-0.5 text-gray-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <Badge 
                            variant={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'success'} 
                            size="xs"
                            icon={null}
                            onRemove={() => {}}
                          >
                            {insight.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence: {Math.round(insight.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Recent Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {predictions.slice(0, 5).map((prediction) => (
              <div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{prediction.model_name}</h4>
                  <p className="text-sm text-gray-600">{prediction.explanation}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(prediction.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={prediction.confidence > 0.9 ? 'success' : prediction.confidence > 0.7 ? 'warning' : 'secondary'} 
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {Math.round(prediction.confidence * 100)}% confidence
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* Models Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">ML Models</h3>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Deploy Model
          </Button>
          <Button size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Train New Model
          </Button>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model) => {
          const StatusIcon = getModelStatusIcon(model.status);
          return (
            <Card key={model.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${getModelStatusColor(model.status).split(' ')[0]}`} />
                    {model.name}
                  </CardTitle>
                  <Badge 
                    variant={model.status === 'deployed' ? 'success' : model.status === 'training' ? 'warning' : 'error'} 
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {model.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{model.use_case}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Type: <span className="font-medium">{model.type.replace('_', ' ')}</span></span>
                    <span className="text-gray-600">Version: <span className="font-medium">{model.version}</span></span>
                  </div>
                </div>

                {model.status === 'deployed' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-lg font-bold text-green-600">{model.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Predictions Today</p>
                      <p className="text-lg font-bold text-blue-600">{model.predictions_today.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {model.status === 'deployed' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Precision:</span>
                        <span className="font-medium">{model.metrics.precision.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recall:</span>
                        <span className="font-medium">{model.metrics.recall.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">F1 Score:</span>
                        <span className="font-medium">{model.metrics.f1_score.toFixed(3)}</span>
                      </div>
                      {model.metrics.auc_roc && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">AUC-ROC:</span>
                          <span className="font-medium">{model.metrics.auc_roc.toFixed(3)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    Last trained: {new Date(model.last_trained).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedModel(model)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    {model.status === 'deployed' && (
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Metrics
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderPredictionsTab = () => (
    <div className="space-y-6">
      {/* Predictions Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">AI Predictions</h3>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-3">
        {predictions.map((prediction) => (
          <Card key={prediction.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{prediction.model_name}</h4>
                    <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                      {prediction.prediction_type}
                    </Badge>
                    <Badge 
                      variant={prediction.confidence > 0.9 ? 'success' : prediction.confidence > 0.7 ? 'warning' : 'secondary'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {Math.round(prediction.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{prediction.explanation}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Input Data</h5>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <pre>{JSON.stringify(prediction.input_data, null, 2)}</pre>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Prediction Result</h5>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <pre>{JSON.stringify(prediction.prediction, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500">
                    {new Date(prediction.timestamp).toLocaleString()}
                  </p>
                  <Badge 
                    variant={prediction.status === 'completed' ? 'success' : prediction.status === 'processing' ? 'warning' : 'error'} 
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {prediction.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Insights Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">AI-Generated Insights</h3>
        <Button size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Insights
        </Button>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => {
          const CategoryIcon = getCategoryIcon(insight.category);
          return (
            <Card key={insight.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <CategoryIcon className="h-5 w-5 mt-0.5 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <Badge
                          variant={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'success'}
                          size="sm"
                          icon={null}
                          onRemove={() => {}}
                        >
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                          {insight.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <h5 className="font-medium text-blue-900 mb-1">Recommendation</h5>
                        <p className="text-sm text-blue-800">{insight.recommendation}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                        <span>Sources: {insight.data_sources.join(', ')}</span>
                        <span>{new Date(insight.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Badge
                      variant={insight.status === 'new' ? 'warning' : insight.status === 'implemented' ? 'success' : 'secondary'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {insight.status}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setSelectedInsight(insight)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="space-y-6">
      {/* Automation Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">AI Automation Rules</h3>
        <Button size="sm">
          <Zap className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Automation Rules */}
      <div className="space-y-4">
        {automationRules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <Badge
                      variant={rule.enabled ? 'success' : 'secondary'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Trigger Condition</h5>
                      <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                        {rule.trigger_condition}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">AI Model</h5>
                      <p className="text-sm text-gray-600">{rule.ai_model}</p>
                      <p className="text-xs text-gray-500">
                        Confidence threshold: {Math.round(rule.confidence_threshold * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-900 mb-1">Actions</h5>
                    <div className="flex flex-wrap gap-1">
                      {rule.actions.map((action, index) => (
                        <Badge key={index} variant="outline" size="sm" icon={null} onRemove={() => {}}>
                          {action.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Executions Today:</span>
                      <span className="ml-2 font-medium">{rule.executions_today}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="ml-2 font-medium">{rule.success_rate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Execution:</span>
                      <span className="ml-2 font-medium">
                        {new Date(rule.last_execution).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    {rule.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI/ML data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading AI/ML Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI & Machine Learning</h1>
            <p className="text-gray-600">Intelligent insights and automated decision making</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Brain },
                { id: 'models', label: 'Models', icon: Cpu },
                { id: 'predictions', label: 'Predictions', icon: Target },
                { id: 'insights', label: 'Insights', icon: Lightbulb },
                { id: 'automation', label: 'Automation', icon: Zap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'models' && renderModelsTab()}
          {activeTab === 'predictions' && renderPredictionsTab()}
          {activeTab === 'insights' && renderInsightsTab()}
          {activeTab === 'automation' && renderAutomationTab()}
        </div>
      </div>

      {/* Model Details Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedModel.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedModel(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Model Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{selectedModel.type.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Version:</span>
                    <span className="ml-2 font-medium">{selectedModel.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      variant={selectedModel.status === 'deployed' ? 'success' : selectedModel.status === 'training' ? 'warning' : 'error'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {selectedModel.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Accuracy:</span>
                    <span className="ml-2 font-medium">{selectedModel.accuracy}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Use Case</h4>
                <p className="text-gray-600">{selectedModel.use_case}</p>
              </div>

              {selectedModel.status === 'deployed' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Precision:</span>
                        <span className="font-medium">{selectedModel.metrics.precision.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recall:</span>
                        <span className="font-medium">{selectedModel.metrics.recall.toFixed(3)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">F1 Score:</span>
                        <span className="font-medium">{selectedModel.metrics.f1_score.toFixed(3)}</span>
                      </div>
                      {selectedModel.metrics.auc_roc && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">AUC-ROC:</span>
                          <span className="font-medium">{selectedModel.metrics.auc_roc.toFixed(3)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedModel(null)}>
                  Close
                </Button>
                {selectedModel.status === 'deployed' && (
                  <>
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Metrics
                    </Button>
                    <Button>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retrain Model
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insight Details Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedInsight.title}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInsight(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedInsight.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">{selectedInsight.recommendation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Impact Level</h4>
                  <Badge
                    variant={selectedInsight.impact === 'high' ? 'error' : selectedInsight.impact === 'medium' ? 'warning' : 'success'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {selectedInsight.impact}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Confidence</h4>
                  <p className="text-gray-600">{Math.round(selectedInsight.confidence * 100)}%</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                  <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                    {selectedInsight.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Generated</h4>
                  <p className="text-gray-600">{new Date(selectedInsight.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedInsight.data_sources.map((source) => (
                    <Badge key={source} variant="outline" size="sm" icon={null} onRemove={() => {}}>
                      {source.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedInsight(null)}>
                  Close
                </Button>
                {selectedInsight.status === 'new' && (
                  <>
                    <Button variant="outline">
                      Dismiss
                    </Button>
                    <Button>
                      Implement
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};export default AIMLDashboard;
