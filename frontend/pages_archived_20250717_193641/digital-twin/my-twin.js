import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Bot, Brain, Activity, Target, Zap, Settings, Eye, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function MyDigitalTwin() {
  const [twinData, setTwinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Fetch digital twin data from backend
  useEffect(() => {
    fetchTwinData();
  }, []);

  const fetchTwinData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/digital-twin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setTwinData(result.data);
        setChatHistory(result.data.chat_history || []);
        setError(null);
      } else {
        // Fallback to mock data if backend is unavailable
        setTwinData(getMockData());
        setChatHistory(getMockChatHistory());
        setError('Using demo data - backend unavailable');
      }
    } catch (error) {
      console.error('Error fetching digital twin data:', error);
      setTwinData(getMockData());
      setChatHistory(getMockChatHistory());
      setError('Using demo data - backend unavailable');
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    metrics: {
      twin_accuracy: 94,
      data_points: 1247,
      goals_progress: { completed: 8, total: 10 },
      performance_score: 87.3,
      performance_change: 12
    },
    insights: [
      {
        type: 'productivity',
        title: 'Productivity Peak',
        message: 'Your most productive hours are 9-11 AM. Consider scheduling important tasks during this window.',
        priority: 'high',
        category: 'performance'
      },
      {
        type: 'learning',
        title: 'Learning Opportunity',
        message: 'Based on your goals, I recommend focusing on data analysis skills this month.',
        priority: 'medium',
        category: 'development'
      },
      {
        type: 'goals',
        title: 'Goal Adjustment',
        message: "You're ahead of schedule on your Q1 objectives. Consider setting more ambitious targets.",
        priority: 'low',
        category: 'planning'
      }
    ],
    configuration: {
      observation_mode: 'active',
      ai_processing: 'enabled',
      goal_alignment: 'optimized'
    }
  });

  const getMockChatHistory = () => [
    {
      type: 'bot',
      message: "Hello! I've analyzed your recent work patterns. Would you like insights on optimizing your productivity?",
      timestamp: new Date().toISOString()
    },
    {
      type: 'user',
      message: 'Yes, show me the insights',
      timestamp: new Date(Date.now() - 60000).toISOString()
    }
  ];

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      type: 'user',
      message: chatMessage,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      const response = await fetch('/api/digital-twin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        },
        body: JSON.stringify({ message: chatMessage })
      });

      if (response.ok) {
        const result = await response.json();
        const botMessage = {
          type: 'bot',
          message: result.data.response,
          timestamp: result.data.timestamp
        };
        setChatHistory(prev => [...prev, botMessage]);
      } else {
        // Fallback response
        const botMessage = {
          type: 'bot',
          message: "I'm here to help you optimize your professional development. You can ask me about productivity patterns, skill recommendations, or goal setting.",
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'productivity': return 'bg-green-50 border-green-200';
      case 'learning': return 'bg-blue-50 border-blue-200';
      case 'goals': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'learning': return <Brain className="w-3 h-3 text-blue-600" />;
      case 'goals': return <Target className="w-3 h-3 text-purple-600" />;
      default: return <Activity className="w-3 h-3 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading your digital twin...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Digital Twin - Digame</title>
        <meta name="description" content="Your personal AI-powered digital twin dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="My Digital Twin"
          subtitle="Your AI-powered professional development companion"
          icon={<Bot className="w-6 h-6 text-blue-600" />}
          badge="CORE PLATFORM"
        />
        <div className="container mx-auto px-4 py-8">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Twin Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {twinData?.metrics.twin_accuracy >= 90 ? 'Excellent' :
                   twinData?.metrics.twin_accuracy >= 75 ? 'Good' : 'Learning'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{twinData?.metrics.twin_accuracy || 94}%</h3>
              <p className="text-gray-600 text-sm">Twin Accuracy</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-blue-600 font-medium">Learning</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{twinData?.metrics.data_points?.toLocaleString() || '1,247'}</h3>
              <p className="text-gray-600 text-sm">Data Points</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-purple-600 font-medium">On Track</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {twinData?.metrics.goals_progress?.completed || 8}/{twinData?.metrics.goals_progress?.total || 10}
              </h3>
              <p className="text-gray-600 text-sm">Goals Progress</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <span className={`text-sm font-medium ${
                  (twinData?.metrics.performance_change || 12) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(twinData?.metrics.performance_change || 12) >= 0 ? '+' : ''}{twinData?.metrics.performance_change || 12}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{twinData?.metrics.performance_score || 87.3}</h3>
              <p className="text-gray-600 text-sm">Performance Score</p>
            </div>
          </div>

          {/* Twin Interaction Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Chat with Your Twin</h3>
              <div className="bg-gray-50 rounded-lg p-4 h-64 mb-4 overflow-y-auto">
                <div className="space-y-3">
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex items-start space-x-2 ${message.type === 'user' ? 'justify-end' : ''}`}>
                      {message.type === 'bot' && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <div className={`rounded-lg p-3 max-w-xs ${
                        message.type === 'bot' ? 'bg-blue-100' : 'bg-gray-200'
                      }`}>
                        <p className={`text-sm ${
                          message.type === 'bot' ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {message.message}
                        </p>
                      </div>
                      {message.type === 'user' && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs">👤</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask your digital twin..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Send
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Twin Insights</h3>
              <div className="space-y-4">
                {twinData?.insights?.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        insight.type === 'productivity' ? 'bg-green-100' :
                        insight.type === 'learning' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <span className={`font-medium ${
                        insight.type === 'productivity' ? 'text-green-900' :
                        insight.type === 'learning' ? 'text-blue-900' : 'text-purple-900'
                      }`}>
                        {insight.title}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      insight.type === 'productivity' ? 'text-green-800' :
                      insight.type === 'learning' ? 'text-blue-800' : 'text-purple-800'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                )) || (
                  // Fallback insights if no data
                  <>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="font-medium text-green-900">Productivity Peak</span>
                      </div>
                      <p className="text-sm text-green-800">Your most productive hours are 9-11 AM. Consider scheduling important tasks during this window.</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Brain className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="font-medium text-blue-900">Learning Opportunity</span>
                      </div>
                      <p className="text-sm text-blue-800">Based on your goals, I recommend focusing on data analysis skills this month.</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <Target className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="font-medium text-purple-900">Goal Adjustment</span>
                      </div>
                      <p className="text-sm text-purple-800">You're ahead of schedule on your Q1 objectives. Consider setting more ambitious targets.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Twin Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Twin Configuration</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Observation Mode</h4>
                <p className="text-sm text-gray-600">Continuously learning from your behavior patterns</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">AI Processing</h4>
                <p className="text-sm text-gray-600">Advanced algorithms analyzing your professional data</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Goal Alignment</h4>
                <p className="text-sm text-gray-600">Recommendations aligned with your objectives</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}