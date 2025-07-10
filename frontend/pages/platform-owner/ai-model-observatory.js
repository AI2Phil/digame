import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Microscope, Brain, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function AIModelObservatory() {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading AI model data
    setTimeout(() => {
      setModelData({
        totalModels: 23,
        activeModels: 18,
        averageAccuracy: 94.2,
        modelsInTraining: 3,
        biasDetections: 2,
        performanceAlerts: 1
      });
      setLoading(false);
    }, 1000);
  }, []);

  const aiModels = [
    {
      id: 'user-behavior-predictor',
      name: 'User Behavior Predictor',
      type: 'Classification',
      status: 'Production',
      accuracy: 96.8,
      lastTrained: '2025-01-08',
      version: 'v2.3.1',
      predictions: 125000,
      biasScore: 0.12,
      driftStatus: 'Stable',
      owner: 'AI Team'
    },
    {
      id: 'content-recommendation',
      name: 'Content Recommendation Engine',
      type: 'Recommendation',
      status: 'Production',
      accuracy: 92.4,
      lastTrained: '2025-01-05',
      version: 'v1.8.2',
      predictions: 89000,
      biasScore: 0.08,
      driftStatus: 'Stable',
      owner: 'ML Team'
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection Model',
      type: 'Anomaly Detection',
      status: 'Production',
      accuracy: 98.1,
      lastTrained: '2025-01-09',
      version: 'v3.1.0',
      predictions: 45000,
      biasScore: 0.15,
      driftStatus: 'Warning',
      owner: 'Security Team'
    },
    {
      id: 'sentiment-analysis',
      name: 'Sentiment Analysis',
      type: 'NLP',
      status: 'Training',
      accuracy: 89.7,
      lastTrained: '2025-01-10',
      version: 'v1.5.0-beta',
      predictions: 0,
      biasScore: 0.22,
      driftStatus: 'Training',
      owner: 'NLP Team'
    }
  ];

  const performanceMetrics = [
    {
      metric: 'Prediction Accuracy',
      value: 94.2,
      trend: 'up',
      change: '+2.1%',
      target: 95.0,
      status: 'Good'
    },
    {
      metric: 'Model Latency',
      value: 45,
      trend: 'down',
      change: '-8ms',
      target: 50,
      status: 'Excellent',
      unit: 'ms'
    },
    {
      metric: 'Throughput',
      value: 2450,
      trend: 'up',
      change: '+12%',
      target: 2000,
      status: 'Excellent',
      unit: 'req/sec'
    },
    {
      metric: 'Error Rate',
      value: 0.08,
      trend: 'down',
      change: '-0.02%',
      target: 0.1,
      status: 'Excellent',
      unit: '%'
    }
  ];

  const biasAnalysis = [
    {
      model: 'User Behavior Predictor',
      biasType: 'Demographic',
      severity: 'Low',
      score: 0.12,
      description: 'Minor bias detected in age group predictions',
      recommendation: 'Increase training data diversity for 18-25 age group',
      status: 'Monitoring'
    },
    {
      model: 'Sentiment Analysis',
      biasType: 'Cultural',
      severity: 'Medium',
      score: 0.22,
      description: 'Cultural bias in sentiment classification for non-English content',
      recommendation: 'Expand multilingual training dataset',
      status: 'Action Required'
    }
  ];

  const modelAlerts = [
    {
      model: 'Fraud Detection Model',
      type: 'Performance Drift',
      severity: 'Medium',
      message: 'Accuracy decreased by 3% over the last 7 days',
      timestamp: '1 hour ago',
      recommendation: 'Review recent data patterns and consider retraining'
    },
    {
      model: 'Content Recommendation Engine',
      type: 'Data Quality',
      severity: 'Low',
      message: 'Increased null values in feature inputs',
      timestamp: '3 hours ago',
      recommendation: 'Investigate data pipeline for missing values'
    }
  ];

  const trainingJobs = [
    {
      id: 'job-2025-001',
      model: 'Sentiment Analysis v1.5.0',
      status: 'Running',
      progress: 68,
      startTime: '2025-01-10 08:00:00',
      estimatedCompletion: '2025-01-10 14:30:00',
      datasetSize: '2.3M samples',
      currentEpoch: 34,
      totalEpochs: 50
    },
    {
      id: 'job-2025-002',
      model: 'Image Classification v2.1.0',
      status: 'Queued',
      progress: 0,
      startTime: 'Pending',
      estimatedCompletion: 'TBD',
      datasetSize: '1.8M samples',
      currentEpoch: 0,
      totalEpochs: 100
    },
    {
      id: 'job-2025-003',
      model: 'User Behavior Predictor v2.4.0',
      status: 'Completed',
      progress: 100,
      startTime: '2025-01-09 10:00:00',
      estimatedCompletion: '2025-01-09 16:45:00',
      datasetSize: '5.1M samples',
      currentEpoch: 75,
      totalEpochs: 75
    }
  ];

  const modelOptimizations = [
    {
      optimization: 'Hyperparameter Tuning',
      model: 'Content Recommendation Engine',
      potentialImprovement: '+2.3% accuracy',
      effort: 'Medium',
      priority: 'High'
    },
    {
      optimization: 'Feature Engineering',
      model: 'Fraud Detection Model',
      potentialImprovement: '+1.8% accuracy',
      effort: 'High',
      priority: 'Medium'
    },
    {
      optimization: 'Model Compression',
      model: 'User Behavior Predictor',
      potentialImprovement: '-15ms latency',
      effort: 'Low',
      priority: 'Medium'
    },
    {
      optimization: 'Data Augmentation',
      model: 'Sentiment Analysis',
      potentialImprovement: '+3.1% accuracy',
      effort: 'Medium',
      priority: 'High'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Platform Owner</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400">/</span>
                    <span className="ml-4 text-sm font-medium text-gray-900">AI Model Observatory</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <Microscope className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Model Observatory</h1>
                <p className="text-gray-600 mt-1">Centralized AI model performance monitoring, accuracy tracking, bias detection, and optimization</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key AI Model Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Models Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Brain className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total AI Models</p>
                      <p className="text-2xl font-bold text-gray-900">{modelData.totalModels}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <Brain className="w-4 h-4 mr-1" />
                      <span>Across all environments</span>
                    </div>
                  </div>
                </div>

                {/* Active Models Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Models</p>
                      <p className="text-2xl font-bold text-gray-900">{modelData.activeModels}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Currently serving predictions</span>
                    </div>
                  </div>
                </div>

                {/* Average Accuracy Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Accuracy</p>
                      <p className="text-2xl font-bold text-gray-900">{modelData.averageAccuracy}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Above industry benchmark</span>
                    </div>
                  </div>
                </div>

                {/* Models in Training Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Zap className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Models in Training</p>
                      <p className="text-2xl font-bold text-gray-900">{modelData.modelsInTraining}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-orange-600">
                      <Zap className="w-4 h-4 mr-1" />
                      <span>Active training jobs</span>
                    </div>
                  </div>
                </div>

                {/* Bias Detections Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Bias Detections</p>
                      <p className="text-2xl font-bold text-gray-900">{modelData.biasDetections}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-yellow-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span>Require attention</span>
                    </div>
                  </div>
                </div>

                {/* Performance Alerts Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Performance Alerts</p>
                      <p className="text-2xl font-bold text-gray-900">{modelData.performanceAlerts}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span>Active alerts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Models Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">AI Models Overview</h2>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Deploy New Model
                  </button>
                </div>
                <div className="space-y-4">
                  {aiModels.map((model) => (
                    <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Brain className="w-6 h-6 text-purple-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{model.name}</h3>
                            <p className="text-sm text-gray-600">{model.type} • {model.version}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            model.status === 'Production' 
                              ? 'bg-green-100 text-green-800' 
                              : model.status === 'Training'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {model.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            model.driftStatus === 'Stable' 
                              ? 'bg-green-100 text-green-800' 
                              : model.driftStatus === 'Warning'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {model.driftStatus}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Accuracy</p>
                          <p className="text-lg font-bold text-purple-600">{model.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Predictions</p>
                          <p className="font-medium text-gray-900">{model.predictions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bias Score</p>
                          <p className={`font-medium ${
                            model.biasScore < 0.1 ? 'text-green-600' :
                            model.biasScore < 0.2 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {model.biasScore.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Trained</p>
                          <p className="font-medium text-gray-900">{model.lastTrained}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Owner</p>
                          <p className="font-medium text-gray-900">{model.owner}</p>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                            Monitor
                          </button>
                          <button className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200">
                            Retrain
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Platform-wide Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">{metric.metric}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          metric.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                          metric.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {metric.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.value}{metric.unit || '%'}
                        </span>
                        <div className={`flex items-center text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`w-4 h-4 mr-1 ${
                            metric.trend === 'down' ? 'transform rotate-180' : ''
                          }`} />
                          <span>{metric.change}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Target: {metric.target}{metric.unit || '%'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bias Analysis */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Bias Detection & Analysis</h2>
                <div className="space-y-4">
                  {biasAnalysis.map((bias, index) => (
                    <div key={index} className={`border-l-4 p-4 rounded-lg ${
                      bias.severity === 'High' ? 'border-red-500 bg-red-50' :
                      bias.severity === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <AlertTriangle className={`w-5 h-5 mr-3 mt-0.5 ${
                            bias.severity === 'High' ? 'text-red-600' :
                            bias.severity === 'Medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <div>
                            <h3 className="font-medium text-gray-900">{bias.model}</h3>
                            <p className="text-sm text-gray-600 mt-1">{bias.description}</p>
                            <p className="text-sm text-gray-700 mt-1 font-medium">Recommendation: {bias.recommendation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            bias.severity === 'High' ? 'bg-red-100 text-red-800' :
                            bias.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {bias.severity} • {bias.biasType}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">Score: {bias.score.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Jobs */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Active Training Jobs</h2>
                <div className="space-y-4">
                  {trainingJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{job.model}</h3>
                          <p className="text-sm text-gray-600">Job ID: {job.id}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          job.status === 'Running' 
                            ? 'bg-blue-100 text-blue-800' 
                            : job.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{job.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Dataset Size</p>
                          <p className="font-medium text-gray-900">{job.datasetSize}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Epoch</p>
                          <p className="font-medium text-gray-900">{job.currentEpoch}/{job.totalEpochs}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Started</p>
                          <p className="font-medium text-gray-900">{job.startTime}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Est. Completion</p>
                          <p className="font-medium text-gray-900">{job.estimatedCompletion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Optimization Recommendations */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Optimization Recommendations</h2>
                <div className="space-y-4">
                  {modelOptimizations.map((optimization, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Zap className="w-6 h-6 text-orange-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{optimization.optimization}</h3>
                          <p className="text-sm text-gray-600">Model: {optimization.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Improvement</p>
                          <p className="font-medium text-green-600">{optimization.potentialImprovement}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Effort</p>
                          <p className="font-medium text-gray-900">{optimization.effort}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          optimization.priority === 'High' ? 'bg-red-100 text-red-800' :
                          optimization.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {optimization.priority}
                        </span>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow p-6 border-2 border-dashed border-purple-200">
                <div className="text-center">
                  <Microscope className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced AI Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">Automated model optimization, intelligent bias correction, predictive performance monitoring, and self-improving AI systems coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Backend Integration In Progress
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}