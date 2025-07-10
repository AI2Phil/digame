import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Brain, TrendingUp, Target, Zap, Calendar, AlertTriangle, CheckCircle, BarChart3, LineChart, Settings, Download } from 'lucide-react';

export default function PredictiveAnalyticsEngine() {
  const [predictions, setPredictions] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [activeTab, setActiveTab] = useState('predictions');

  useEffect(() => {
    fetchPredictiveData();
  }, []);

  const fetchPredictiveData = async () => {
    try {
      const response = await fetch('/api/reports/predictive', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setPredictions(result.data.predictions);
        setModels(result.data.models);
      } else {
        const mockData = getMockPredictiveData();
        setPredictions(mockData.predictions);
        setModels(mockData.models);
      }
    } catch (error) {
      console.error('Error fetching predictive data:', error);
      const mockData = getMockPredictiveData();
      setPredictions(mockData.predictions);
      setModels(mockData.models);
    } finally {
      setLoading(false);
    }
  };

  const getMockPredictiveData = () => ({
    predictions: [
      {
        id: 1,
        title: 'User Growth Forecast',
        description: 'Predicted user registration trends for next 6 months',
        model: 'Linear Regression',
        accuracy: 94.2,
        confidence: 87,
        timeframe: '6 months',
        category: 'growth',
        status: 'active',
        lastUpdated: '2024-01-05T10:30:00Z',
        predictions: [
          { period: 'Jan 2024', predicted: 1250, actual: 1198, confidence: 92 },
          { period: 'Feb 2024', predicted: 1380, actual: null, confidence: 89 },
          { period: 'Mar 2024', predicted: 1520, actual: null, confidence: 85 },
          { period: 'Apr 2024', predicted: 1680, actual: null, confidence: 82 },
          { period: 'May 2024', predicted: 1850, actual: null, confidence: 78 },
          { period: 'Jun 2024', predicted: 2040, actual: null, confidence: 75 }
        ]
      },
      {
        id: 2,
        title: 'Revenue Projection',
        description: 'Monthly revenue forecasting based on historical data',
        model: 'ARIMA',
        accuracy: 91.8,
        confidence: 83,
        timeframe: '12 months',
        category: 'revenue',
        status: 'active',
        lastUpdated: '2024-01-05T09:15:00Z',
        predictions: [
          { period: 'Jan 2024', predicted: 125000, actual: 118500, confidence: 88 },
          { period: 'Feb 2024', predicted: 132000, actual: null, confidence: 85 },
          { period: 'Mar 2024', predicted: 145000, actual: null, confidence: 82 },
          { period: 'Apr 2024', predicted: 158000, actual: null, confidence: 79 },
          { period: 'May 2024', predicted: 172000, actual: null, confidence: 76 },
          { period: 'Jun 2024', predicted: 189000, actual: null, confidence: 73 }
        ]
      },
      {
        id: 3,
        title: 'Churn Risk Analysis',
        description: 'Customer churn probability and risk assessment',
        model: 'Random Forest',
        accuracy: 88.5,
        confidence: 91,
        timeframe: '3 months',
        category: 'retention',
        status: 'active',
        lastUpdated: '2024-01-05T08:45:00Z',
        predictions: [
          { period: 'High Risk', predicted: 156, actual: null, confidence: 94 },
          { period: 'Medium Risk', predicted: 289, actual: null, confidence: 89 },
          { period: 'Low Risk', predicted: 1847, actual: null, confidence: 96 }
        ]
      },
      {
        id: 4,
        title: 'System Load Prediction',
        description: 'Server load and resource utilization forecasting',
        model: 'Neural Network',
        accuracy: 96.3,
        confidence: 89,
        timeframe: '24 hours',
        category: 'performance',
        status: 'training',
        lastUpdated: '2024-01-05T07:20:00Z',
        predictions: [
          { period: '00:00-06:00', predicted: 45, actual: null, confidence: 92 },
          { period: '06:00-12:00', predicted: 78, actual: null, confidence: 89 },
          { period: '12:00-18:00', predicted: 92, actual: null, confidence: 87 },
          { period: '18:00-24:00', predicted: 67, actual: null, confidence: 90 }
        ]
      }
    ],
    models: [
      {
        id: 1,
        name: 'User Growth Model',
        type: 'Linear Regression',
        accuracy: 94.2,
        status: 'active',
        lastTrained: '2024-01-05T10:30:00Z',
        dataPoints: 2847,
        features: ['historical_growth', 'marketing_spend', 'seasonality', 'product_releases']
      },
      {
        id: 2,
        name: 'Revenue Forecasting Model',
        type: 'ARIMA',
        accuracy: 91.8,
        status: 'active',
        lastTrained: '2024-01-05T09:15:00Z',
        dataPoints: 1456,
        features: ['monthly_revenue', 'customer_count', 'pricing_changes', 'market_trends']
      },
      {
        id: 3,
        name: 'Churn Prediction Model',
        type: 'Random Forest',
        accuracy: 88.5,
        status: 'active',
        lastTrained: '2024-01-05T08:45:00Z',
        dataPoints: 5623,
        features: ['usage_frequency', 'support_tickets', 'payment_history', 'feature_adoption']
      },
      {
        id: 4,
        name: 'Performance Prediction Model',
        type: 'Neural Network',
        accuracy: 96.3,
        status: 'training',
        lastTrained: '2024-01-05T07:20:00Z',
        dataPoints: 8934,
        features: ['cpu_usage', 'memory_usage', 'network_io', 'disk_io', 'user_load']
      }
    ]
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'training': return 'text-blue-600 bg-blue-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'growth': 'bg-green-100 text-green-600',
      'revenue': 'bg-blue-100 text-blue-600',
      'retention': 'bg-purple-100 text-purple-600',
      'performance': 'bg-orange-100 text-orange-600'
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 95) return 'text-green-600';
    if (accuracy >= 90) return 'text-blue-600';
    if (accuracy >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const exportPrediction = (prediction, format) => {
    console.log(`Exporting ${prediction.title} as ${format}`);
    alert(`Exporting "${prediction.title}" as ${format.toUpperCase()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Predictive Analytics Engine - Digame</title>
        <meta name="description" content="AI-powered predictive analytics and forecasting" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/reports" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Reports</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics Engine</h1>
              <p className="text-gray-600">AI-powered predictive analytics and forecasting</p>
            </div>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Predictions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {predictions.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(predictions.reduce((sum, p) => sum + p.accuracy, 0) / predictions.length).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ML Models</p>
                  <p className="text-2xl font-bold text-gray-900">{models.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Points</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(models.reduce((sum, m) => sum + m.dataPoints, 0))}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'predictions', label: 'Predictions', icon: <Target className="w-4 h-4" /> },
                  { id: 'models', label: 'ML Models', icon: <Brain className="w-4 h-4" /> },
                  { id: 'insights', label: 'Insights', icon: <TrendingUp className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Predictions Tab */}
              {activeTab === 'predictions' && (
                <div className="space-y-6">
                  {predictions.map((prediction) => (
                    <div key={prediction.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{prediction.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{prediction.description}</p>
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(prediction.category)}`}>
                              {prediction.category}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prediction.status)}`}>
                              {prediction.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              Model: {prediction.model}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => exportPrediction(prediction, 'csv')}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getAccuracyColor(prediction.accuracy)}`}>
                            {prediction.accuracy}%
                          </div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{prediction.confidence}%</div>
                          <div className="text-sm text-gray-600">Confidence</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{prediction.timeframe}</div>
                          <div className="text-sm text-gray-600">Timeframe</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Prediction Data</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {prediction.predictions.slice(0, 6).map((item, index) => (
                            <div key={index} className="bg-white rounded p-3">
                              <div className="text-sm font-medium text-gray-900">{item.period}</div>
                              <div className="text-lg font-bold text-blue-600">
                                {typeof item.predicted === 'number' ? formatNumber(item.predicted) : item.predicted}
                              </div>
                              {item.actual && (
                                <div className="text-sm text-gray-600">
                                  Actual: {formatNumber(item.actual)}
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                Confidence: {item.confidence}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 text-xs text-gray-500">
                        Last updated: {formatTimeAgo(prediction.lastUpdated)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Models Tab */}
              {activeTab === 'models' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {models.map((model) => (
                    <div key={model.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">Type: {model.type}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(model.status)}`}>
                          {model.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getAccuracyColor(model.accuracy)}`}>
                            {model.accuracy}%
                          </div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {formatNumber(model.dataPoints)}
                          </div>
                          <div className="text-sm text-gray-600">Data Points</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {model.features.map((feature, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Last trained: {formatTimeAgo(model.lastTrained)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">High Confidence Predictions</h3>
                      </div>
                      <p className="text-blue-800 text-sm mb-3">
                        3 out of 4 active predictions show confidence levels above 85%, indicating reliable forecasting.
                      </p>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• User Growth: 87% confidence</li>
                        <li>• Churn Risk: 91% confidence</li>
                        <li>• System Load: 89% confidence</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-900">Model Performance Alert</h3>
                      </div>
                      <p className="text-yellow-800 text-sm mb-3">
                        Revenue projection model accuracy has decreased by 2.3% this month. Consider retraining with recent data.
                      </p>
                      <button className="text-yellow-700 text-sm font-medium hover:text-yellow-800">
                        View Details →
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Key Insights</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">Growth Trajectory</h4>
                          <p className="text-gray-600 text-sm">
                            User growth predictions indicate a 45% increase over the next 6 months, driven by recent product improvements.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">Revenue Optimization</h4>
                          <p className="text-gray-600 text-sm">
                            Revenue forecasting suggests optimal pricing adjustments could increase monthly revenue by 12-15%.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">Model Recommendations</h4>
                          <p className="text-gray-600 text-sm">
                            Consider implementing ensemble methods to improve prediction accuracy by combining multiple models.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}