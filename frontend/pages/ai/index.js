import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Brain, Bot, TrendingUp, Zap, BarChart3, Cpu, ArrowLeft, Sparkles, Target, Activity } from 'lucide-react';

export default function AIHub() {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      const response = await fetch('/api/ai', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAiData(result.data);
      } else {
        // Fallback to mock data if API fails
        setAiData(getMockData());
      }
    } catch (error) {
      console.error('Error fetching AI data:', error);
      // Fallback to mock data
      setAiData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    statistics: {
      totalModels: 12,
      activeAutomations: 8,
      predictionAccuracy: 94.2,
      processingTime: 1.8
    },
    recentActivity: [
      {
        type: 'automation_completed',
        title: 'Workflow Automation',
        description: 'AI-powered task automation completed successfully',
        timestamp: '2024-01-05T10:30:00Z',
        status: 'success'
      },
      {
        type: 'prediction_generated',
        title: 'Predictive Analysis',
        description: 'Generated quarterly performance predictions',
        timestamp: '2024-01-05T09:15:00Z',
        status: 'success'
      },
      {
        type: 'model_trained',
        title: 'Model Training',
        description: 'Customer behavior model training completed',
        timestamp: '2024-01-05T08:45:00Z',
        status: 'success'
      }
    ]
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const aiFeatures = [
    {
      title: 'AI-Powered Automation',
      description: 'Intelligent workflow automation with machine learning',
      icon: <Bot className="w-6 h-6" />,
      path: '/ai/ai-automation',
      color: 'purple',
      features: ['Smart Triggers', 'Adaptive Learning', 'Auto-optimization']
    },
    {
      title: 'Predictive Modeling',
      description: 'Advanced analytics and forecasting capabilities',
      icon: <TrendingUp className="w-6 h-6" />,
      path: '/ai/predictive-modeling',
      color: 'blue',
      features: ['Trend Analysis', 'Risk Assessment', 'Performance Forecasting']
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
    };
    return colors[color] || colors.purple;
  };

  return (
    <>
      <Head>
        <title>AI Hub - Digame</title>
        <meta name="description" content="Advanced AI-powered features and intelligent automation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Return to Dashboard Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/dashboard" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Return to Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Hub</h1>
                <p className="text-gray-600">Intelligent automation and predictive analytics platform</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI POWERED
                </span>
              </div>
            </div>
          </div>

          {/* AI Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Models</p>
                  <p className="text-2xl font-bold text-gray-900">{aiData?.statistics?.totalModels || 12}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Cpu className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-purple-600">
                  <Activity className="w-4 h-4 mr-1" />
                  Active & Learning
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Automations</p>
                  <p className="text-2xl font-bold text-gray-900">{aiData?.statistics?.activeAutomations || 8}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-blue-600">
                  <Zap className="w-4 h-4 mr-1" />
                  Running Now
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prediction Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">{aiData?.statistics?.predictionAccuracy || 94.2}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  High Precision
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                  <p className="text-2xl font-bold text-gray-900">{aiData?.statistics?.processingTime || 1.8}s</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-orange-600">
                  <Zap className="w-4 h-4 mr-1" />
                  Lightning Fast
                </div>
              </div>
            </div>
          </div>

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {aiFeatures.map((feature, index) => (
              <Link key={index} href={feature.path}>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${getColorClasses(feature.color)}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  <div className="space-y-1">
                    {feature.features.map((featureItem, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-xs text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {featureItem}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent AI Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Activity</h3>
            <div className="space-y-3">
              {aiData?.recentActivity?.length > 0 ? (
                aiData.recentActivity.map((activity, index) => {
                  const getActivityIcon = (type) => {
                    if (type.includes('automation')) return <Bot className="w-4 h-4 text-purple-600" />;
                    if (type.includes('prediction')) return <TrendingUp className="w-4 h-4 text-blue-600" />;
                    if (type.includes('model')) return <Cpu className="w-4 h-4 text-green-600" />;
                    return <Brain className="w-4 h-4 text-gray-600" />;
                  };

                  const getActivityColor = (type) => {
                    if (type.includes('automation')) return 'bg-purple-100';
                    if (type.includes('prediction')) return 'bg-blue-100';
                    if (type.includes('model')) return 'bg-green-100';
                    return 'bg-gray-100';
                  };

                  const formatTimeAgo = (timestamp) => {
                    const now = new Date();
                    const activityTime = new Date(timestamp);
                    const diffMs = now - activityTime;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    
                    if (diffMins < 60) return `${diffMins} min ago`;
                    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    return activityTime.toLocaleDateString();
                  };

                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback to static data
                <>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Workflow Automation</div>
                      <div className="text-sm text-gray-600">AI-powered task automation completed successfully</div>
                    </div>
                    <div className="text-xs text-gray-500">2 min ago</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Predictive Analysis</div>
                      <div className="text-sm text-gray-600">Generated quarterly performance predictions</div>
                    </div>
                    <div className="text-xs text-gray-500">15 min ago</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Model Training</div>
                      <div className="text-sm text-gray-600">Customer behavior model training completed</div>
                    </div>
                    <div className="text-xs text-gray-500">1 hour ago</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}