import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Bot,
  FileText,
  Mic,
  Mail,
  Video,
  MessageSquare,
  Smartphone,
  GraduationCap,
  Wrench,
  ArrowLeft,
} from 'lucide-react';

const AIToolsHub: React.FC = () => {
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAIToolsData();
  }, []);

  const fetchAIToolsData = async () => {
    try {
      const response = await fetch('/ai-tools', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || 'demo-token'}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAiData(result.data);
      } else {
        // Fallback to mock data if API fails
        setAiData(getMockData());
      }
    } catch (error) {
      console.error('Error fetching AI tools data:', error);
      // Fallback to mock data
      setAiData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    statistics: {
      totalRequests: 1247,
      successRate: 89,
      avgResponseTime: 2.3,
      timeSavedHours: 6.8,
    },
    toolUsage: [
      {
        tool_category: 'Writing Assistance',
        usage_count: 342,
        last_used: '2024-01-05T10:30:00Z',
      },
      { tool_category: 'Voice Processing', usage_count: 198, last_used: '2024-01-05T09:15:00Z' },
      {
        tool_category: 'Document Processing',
        usage_count: 156,
        last_used: '2024-01-05T08:45:00Z',
      },
    ],
    recentActivity: [
      {
        event_type: 'ai_document_processed',
        metadata: { tool_name: 'Document Processing', action: 'extract_data' },
        created_at: '2024-01-05T10:28:00Z',
      },
      {
        event_type: 'ai_voice_transcribed',
        metadata: { tool_name: 'Voice Processing', action: 'transcribe' },
        created_at: '2024-01-05T10:13:00Z',
      },
      {
        event_type: 'ai_email_analyzed',
        metadata: { tool_name: 'Email Analysis', action: 'categorize' },
        created_at: '2024-01-05T09:58:00Z',
      },
    ],
    availableTools: 8,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const aiTools = [
    {
      title: 'Writing Assistance',
      description: 'AI-powered content creation and editing tools',
      icon: <FileText className="w-6 h-6" />,
      path: '/ai-tools/writing',
      color: 'blue',
      features: ['Content Generation', 'Grammar Check', 'Style Enhancement'],
    },
    {
      title: 'Communication Style',
      description: 'Communication style analysis and optimization',
      icon: <MessageSquare className="w-6 h-6" />,
      path: '/ai-tools/communication',
      color: 'indigo',
      features: ['Style Analysis', 'Tone Detection', 'Communication Tips'],
    },
    {
      title: 'Language Learning',
      description: 'AI-powered language learning and translation',
      icon: <GraduationCap className="w-6 h-6" />,
      path: '/ai-tools/language',
      color: 'yellow',
      features: ['Language Translation', 'Learning Paths', 'Practice Sessions'],
    },
    {
      title: 'NLP Enhancement',
      description: 'Advanced natural language processing and text analysis',
      icon: <Bot className="w-6 h-6" />,
      path: '/ai-tools/nlp',
      color: 'purple',
      features: ['Text Analysis', 'Entity Recognition', 'Sentiment Analysis'],
    },
    {
      title: 'Voice Processing',
      description: 'Speech-to-text and voice command processing',
      icon: <Mic className="w-6 h-6" />,
      path: '/ai-tools/voice',
      color: 'green',
      features: ['Speech Recognition', 'Voice Commands', 'Audio Analysis'],
    },
    {
      title: 'Document Processing',
      description: 'Automated document analysis and extraction',
      icon: <FileText className="w-6 h-6" />,
      path: '/ai-tools/documents',
      color: 'orange',
      features: ['OCR Processing', 'Data Extraction', 'Document Classification'],
    },
    {
      title: 'Email Analysis',
      description: 'Smart email categorization and response suggestions',
      icon: <Mail className="w-6 h-6" />,
      path: '/ai-tools/email',
      color: 'red',
      features: ['Smart Categorization', 'Response Suggestions', 'Priority Detection'],
    },
    {
      title: 'Meeting Insights',
      description: 'Automated meeting transcription and action items',
      icon: <Video className="w-6 h-6" />,
      path: '/ai-tools/meetings',
      color: 'pink',
      features: ['Auto Transcription', 'Action Items', 'Meeting Summary'],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
      red: 'bg-red-100 text-red-600 hover:bg-red-200',
      indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
      pink: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
      yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      <Head>
        <title>AI Tools Hub - Digame</title>
        <meta
          name="description"
          content="Comprehensive AI-powered tools and automation features"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Return to Dashboard Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Return to Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Tools Hub</h1>
                <p className="text-gray-600">
                  Powerful AI-driven tools to enhance your productivity
                </p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Wrench className="w-3 h-3 mr-1" />
                  {aiData?.availableTools || 8} TOOLS AVAILABLE
                </span>
              </div>
            </div>
          </div>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {aiTools.map((tool, index) => (
              <Link key={index} href={tool.path}>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${getColorClasses(tool.color)}`}
                  >
                    {tool.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                  <div className="space-y-1">
                    {tool.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-xs text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI Tools Usage This Month
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {aiData?.statistics?.totalRequests?.toLocaleString() || '1,247'}
                </div>
                <div className="text-gray-600 text-sm">Total AI Requests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {aiData?.statistics?.successRate || 89}%
                </div>
                <div className="text-gray-600 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {aiData?.statistics?.avgResponseTime || 2.3}s
                </div>
                <div className="text-gray-600 text-sm">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {aiData?.statistics?.timeSavedHours || 6.8}h
                </div>
                <div className="text-gray-600 text-sm">Time Saved</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Activity</h3>
            <div className="space-y-3">
              {aiData?.recentActivity?.length > 0 ? (
                aiData.recentActivity.map((activity: any, index: number) => {
                  const getActivityIcon = (eventType: string) => {
                    if (eventType.includes('document'))
                      return <FileText className="w-4 h-4 text-blue-600" />;
                    if (eventType.includes('voice'))
                      return <Mic className="w-4 h-4 text-green-600" />;
                    if (eventType.includes('email'))
                      return <Mail className="w-4 h-4 text-purple-600" />;
                    if (eventType.includes('meeting'))
                      return <Video className="w-4 h-4 text-red-600" />;
                    if (eventType.includes('writing'))
                      return <FileText className="w-4 h-4 text-blue-600" />;
                    return <Bot className="w-4 h-4 text-gray-600" />;
                  };

                  const getActivityColor = (eventType: string) => {
                    if (eventType.includes('document')) return 'bg-blue-100';
                    if (eventType.includes('voice')) return 'bg-green-100';
                    if (eventType.includes('email')) return 'bg-purple-100';
                    if (eventType.includes('meeting')) return 'bg-red-100';
                    if (eventType.includes('writing')) return 'bg-blue-100';
                    return 'bg-gray-100';
                  };

                  const formatTimeAgo = (timestamp: string) => {
                    const now = new Date();
                    const activityTime = new Date(timestamp);
                    const diffMs = now.getTime() - activityTime.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);

                    if (diffMins < 60) return `${diffMins} min ago`;
                    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    return activityTime.toLocaleDateString();
                  };

                  const getActivityDescription = (activity: any) => {
                    const toolName = activity.metadata?.tool_name || 'AI Tool';
                    const action = activity.metadata?.action || 'processed';

                    if (activity.event_type.includes('document')) {
                      return `${toolName} ${action === 'extract_data' ? 'extracted key information from document' : 'processed document'}`;
                    }
                    if (activity.event_type.includes('voice')) {
                      return `${toolName} ${action === 'transcribe' ? 'transcribed voice note' : 'processed voice input'}`;
                    }
                    if (activity.event_type.includes('email')) {
                      return `${toolName} ${action === 'categorize' ? 'categorized emails and suggested responses' : 'analyzed email'}`;
                    }
                    return `${toolName} completed ${action}`;
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-8 h-8 ${getActivityColor(activity.event_type)} rounded-full flex items-center justify-center`}
                      >
                        {getActivityIcon(activity.event_type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {activity.metadata?.tool_name || 'AI Tool'} Activity
                        </div>
                        <div className="text-sm text-gray-600">
                          {getActivityDescription(activity)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimeAgo(activity.created_at)}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback to static data if no real activity
                <>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Document processed</div>
                      <div className="text-sm text-gray-600">
                        Extracted key information from quarterly report
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">2 min ago</div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Mic className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Voice note transcribed</div>
                      <div className="text-sm text-gray-600">Meeting notes converted to text</div>
                    </div>
                    <div className="text-xs text-gray-500">15 min ago</div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Email analysis complete</div>
                      <div className="text-sm text-gray-600">
                        Categorized 23 emails and suggested responses
                      </div>
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
};

export default AIToolsHub;
