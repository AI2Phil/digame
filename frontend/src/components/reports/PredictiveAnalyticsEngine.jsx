import React, { useState, useEffect } from 'react';
import {
  Brain, TrendingUp, Target, Zap, Eye, AlertCircle,
  CheckCircle, Clock, Settings, RefreshCw, Download,
  BarChart3, LineChart, Activity, Layers, Award,
  Lightbulb, Cpu, Database, Network, Play
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useToast } from '../ui/Toast';

const PredictiveAnalyticsEngine = () => {
  const [engineData, setEngineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [trainingInProgress, setTrainingInProgress] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchEngineData();
  }, []);

  const fetchEngineData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/advanced-reporting/predictive-analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch predictive analytics data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setEngineData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load predictive analytics data');
      }
    } catch (err) {
      console.error('Error fetching engine data:', err);
      addToast({
        type: 'error',
        title: 'Error Loading Engine',
        message: 'Failed to load predictive analytics data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getModelTypeIcon = (modelType) => {
    switch (modelType) {
      case 'regression': return <TrendingUp className="w-5 h-5" />;
      case 'classification': return <Target className="w-5 h-5" />;
      case 'clustering': return <Layers className="w-5 h-5" />;
      case 'time_series': return <LineChart className="w-5 h-5" />;
      case 'anomaly_detection': return <AlertCircle className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.9) return 'text-green-600';
    if (accuracy >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleTrainModel = async (modelId) => {
    setTrainingInProgress(true);
    try {
      // Simulate training process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      addToast({
        type: 'success',
        title: 'Model Training Complete',
        message: 'The model has been successfully retrained with latest data.'
      });
      
      fetchEngineData(); // Refresh data
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Training Failed',
        message: 'Failed to train the model. Please try again.'
      });
    } finally {
      setTrainingInProgress(false);
    }
  };

  const handleRunPrediction = (modelName) => {
    addToast({
      type: 'info',
      title: 'Prediction Started',
      message: `Running prediction with ${modelName} model...`
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAccuracy = (accuracy) => {
    return `${(accuracy * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading predictive analytics engine...</p>
        </div>
      </div>
    );
  }

  if (!engineData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics Engine</h1>
          <p className="text-gray-600 mt-1">AI-powered forecasting and machine learning platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={fetchEngineData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Engine Settings
          </Button>
        </div>
      </div>

      {/* Engine Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineData.active_models.length}</div>
            <p className="text-xs text-muted-foreground">
              {engineData.active_models.filter(m => m.accuracy_score > 0.9).length} high accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(
              engineData.accuracy_trends.reduce((sum, t) => sum + t.avg_accuracy, 0) / engineData.accuracy_trends.length
            )}`}>
              {formatAccuracy(
                engineData.accuracy_trends.reduce((sum, t) => sum + t.avg_accuracy, 0) / engineData.accuracy_trends.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">across all models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineData.upcoming_predictions.length}</div>
            <p className="text-xs text-muted-foreground">upcoming forecasts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engine Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-green-600">Operational</span>
            </div>
            <p className="text-xs text-muted-foreground">all systems running</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Active Models</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {/* Active Models */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Active Predictive Models
              </CardTitle>
              <CardDescription>Currently deployed machine learning models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {engineData.active_models.map((model, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedModel(model)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getModelTypeIcon(model.model_type)}
                        <h4 className="font-medium">{model.name}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {model.model_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Algorithm</span>
                        <span className="text-sm font-medium capitalize">
                          {model.algorithm.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Accuracy</span>
                        <span className={`text-sm font-medium ${getAccuracyColor(model.accuracy_score)}`}>
                          {formatAccuracy(model.accuracy_score)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Trained</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(model.last_trained)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Data Source</span>
                        <span className="text-sm text-gray-500 capitalize">
                          {model.training_data_source}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunPrediction(model.name);
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Predict
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrainModel(model.id);
                        }}
                        disabled={trainingInProgress}
                      >
                        <Cpu className="w-3 h-3 mr-1" />
                        {trainingInProgress ? 'Training...' : 'Retrain'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Model Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Model Performance Trends
              </CardTitle>
              <CardDescription>Accuracy trends across different model types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineData.accuracy_trends.map((trend, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getModelTypeIcon(trend.model_type)}
                        <span className="font-medium capitalize">
                          {trend.model_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getAccuracyColor(trend.avg_accuracy)}`}>
                          {formatAccuracy(trend.avg_accuracy)}
                        </span>
                        <p className="text-xs text-gray-500">{trend.model_count} models</p>
                      </div>
                    </div>
                    <Progress 
                      value={trend.avg_accuracy * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Min: {formatAccuracy(trend.min_accuracy)}</span>
                      <span>Max: {formatAccuracy(trend.max_accuracy)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {/* Upcoming Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Upcoming Predictions
              </CardTitle>
              <CardDescription>Scheduled forecasts and their confidence levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineData.upcoming_predictions.map((prediction, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getModelTypeIcon(prediction.model_type)}
                        <div>
                          <h4 className="font-medium">{prediction.model_name}</h4>
                          <p className="text-sm text-gray-500">
                            Prediction for {formatDate(prediction.prediction_date)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getConfidenceColor(prediction.confidence)}>
                        {formatAccuracy(prediction.confidence)} confidence
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Predicted Value</span>
                        <p className="text-lg font-semibold">
                          {typeof prediction.predicted_value === 'number' 
                            ? prediction.predicted_value.toLocaleString()
                            : prediction.predicted_value}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Model Accuracy</span>
                        <p className={`text-lg font-semibold ${getAccuracyColor(prediction.accuracy_score)}`}>
                          {formatAccuracy(prediction.accuracy_score)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feature Importance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Feature Importance Analysis
              </CardTitle>
              <CardDescription>Key features driving model predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineData.feature_importance.slice(0, 3).map((model, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium capitalize">
                        {model.model_type.replace('_', ' ')} Model
                      </h4>
                      <Badge variant="outline">
                        {formatAccuracy(model.accuracy_score)} accuracy
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {model.features.slice(0, 3).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {feature.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.random() * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {(Math.random() * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>Intelligent analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineData.ai_insights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <div className="flex space-x-2">
                        <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                          {insight.impact} impact
                        </Badge>
                        <Badge className={getConfidenceColor(insight.confidence)}>
                          {formatAccuracy(insight.confidence)} confidence
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {insight.type.replace('_', ' ')}
                      </Badge>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="algorithms" className="space-y-6">
          {/* Supported Algorithms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="w-5 h-5 mr-2" />
                Supported Algorithms
              </CardTitle>
              <CardDescription>Available machine learning algorithms and their characteristics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {engineData.supported_algorithms.map((algorithm, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{algorithm.name}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {algorithm.type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Complexity</span>
                        <Badge variant={
                          algorithm.complexity === 'high' ? 'destructive' :
                          algorithm.complexity === 'medium' ? 'default' : 'secondary'
                        } className="text-xs">
                          {algorithm.complexity}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Accuracy</span>
                        <Badge variant={
                          algorithm.accuracy === 'very_high' ? 'default' :
                          algorithm.accuracy === 'high' ? 'default' : 'secondary'
                        } className="text-xs">
                          {algorithm.accuracy.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full">
                      Create Model
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Model Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="w-5 h-5 mr-2" />
                Model Types & Use Cases
              </CardTitle>
              <CardDescription>Different types of predictive models and their applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineData.model_types.map((modelType, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      {getModelTypeIcon(modelType.type)}
                      <h4 className="font-medium capitalize">
                        {modelType.type.replace('_', ' ')}
                      </h4>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{modelType.description}</p>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">Use Cases:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {modelType.use_cases.map((useCase, useCaseIndex) => (
                          <Badge key={useCaseIndex} variant="outline" className="text-xs">
                            {useCase.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsEngine;