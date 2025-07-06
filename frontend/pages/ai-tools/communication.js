import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Textarea } from '../../src/components/ui/Textarea';
import { Input } from '../../src/components/ui/Input';
import { Progress } from '../../src/components/ui/Progress';
import { 
  MessageSquare, 
  Send, 
  Users, 
  TrendingUp, 
  Brain, 
  Target, 
  Heart,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Globe,
  Mic,
  Type,
  Smartphone,
  Mail,
  Video,
  Slack
} from 'lucide-react';

const CommunicationAnalysis = () => {
  const router = useRouter();
  const [communicationData, setCommunicationData] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');
  const [communicationType, setCommunicationType] = useState('text');
  const [communicationHistory, setCommunicationHistory] = useState([]);

  useEffect(() => {
    fetchCommunicationHistory();
  }, []);

  const fetchCommunicationHistory = async () => {
    try {
      const response = await fetch('/api/ai-tools/communication/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommunicationHistory(data.communications || []);
      }
    } catch (error) {
      console.error('Error fetching communication history:', error);
    }
  };

  const analyzeCommunication = async () => {
    if (!communicationData.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/ai-tools/communication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: communicationData,
          type: communicationType,
          action: 'analyze'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error analyzing communication:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateResponse = async (style = 'professional') => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-tools/communication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: communicationData,
          style,
          action: 'generate_response'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Handle generated response
        console.log('Generated response:', data.response);
      }
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockAnalysis = {
    overview: {
      wordCount: 247,
      sentenceCount: 18,
      avgWordsPerSentence: 13.7,
      readingTime: 1.2,
      complexity: 'Medium'
    },
    sentiment: {
      overall: 'Positive',
      score: 0.72,
      confidence: 0.89,
      emotions: {
        joy: 0.45,
        trust: 0.38,
        anticipation: 0.32,
        surprise: 0.15,
        fear: 0.08,
        sadness: 0.05,
        disgust: 0.02,
        anger: 0.01
      }
    },
    tone: {
      primary: 'Professional',
      secondary: 'Friendly',
      formality: 'Formal',
      confidence: 0.82,
      assertiveness: 0.65,
      empathy: 0.78
    },
    communicationStyle: {
      directness: 7.5,
      clarity: 8.2,
      persuasiveness: 6.8,
      engagement: 7.9,
      inclusivity: 8.5
    },
    keyInsights: {
      mainTopics: [
        { topic: 'Project Progress', relevance: 0.92 },
        { topic: 'Team Collaboration', relevance: 0.78 },
        { topic: 'Timeline Discussion', relevance: 0.65 }
      ],
      communicationPatterns: [
        'Uses inclusive language',
        'Provides clear action items',
        'Maintains professional tone',
        'Shows empathy and understanding'
      ],
      improvementAreas: [
        'Could be more concise',
        'Add more specific examples',
        'Consider cultural sensitivity'
      ]
    },
    effectiveness: {
      clarity: 8.2,
      impact: 7.5,
      engagement: 7.9,
      persuasion: 6.8,
      overall: 7.6
    },
    recommendations: [
      'Consider shortening sentences for better readability',
      'Add more concrete examples to support your points',
      'Use more active voice to increase impact',
      'Include a clear call-to-action at the end'
    ]
  };

  const mockHistory = [
    {
      id: 1,
      type: 'email',
      subject: 'Project Update',
      recipient: 'team@company.com',
      sentiment: 'Positive',
      effectiveness: 8.2,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'slack',
      subject: 'Quick Question',
      recipient: '#general',
      sentiment: 'Neutral',
      effectiveness: 7.5,
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'presentation',
      subject: 'Q4 Review',
      recipient: 'Leadership Team',
      sentiment: 'Professional',
      effectiveness: 9.1,
      timestamp: '3 days ago'
    }
  ];

  const communicationTypes = [
    { value: 'text', label: 'Text/Chat', icon: <Type className="h-4 w-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'presentation', label: 'Presentation', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'social', label: 'Social Media', icon: <Globe className="h-4 w-4" /> },
    { value: 'meeting', label: 'Meeting Notes', icon: <Video className="h-4 w-4" /> }
  ];

  const responseStyles = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'concise', label: 'Concise', description: 'Brief and to the point' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive and thorough' },
    { value: 'empathetic', label: 'Empathetic', description: 'Understanding and supportive' }
  ];

  const currentAnalysis = analysis || mockAnalysis;
  const currentHistory = communicationHistory.length > 0 ? communicationHistory : mockHistory;

  const getEffectivenessColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Communication Analysis"
        subtitle="AI-powered communication style analysis and optimization"
        icon={<MessageSquare className="h-8 w-8" />}
        breadcrumb={[
          { label: 'AI Tools', href: '/ai-tools' },
          { label: 'Communication', href: '/ai-tools/communication' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCommunicationHistory}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('analyze')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analyze'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Brain className="h-4 w-4 inline mr-2" />
          Analyze Communication
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'generate'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Send className="h-4 w-4 inline mr-2" />
          Generate Response
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Communication History
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Insights
        </button>
      </div>

      {activeTab === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Communication Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={communicationType}
                    onChange={(e) => setCommunicationType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {communicationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <Input placeholder="Subject/Title (optional)" />
                </div>
                
                <Textarea
                  placeholder="Paste your communication content here for analysis..."
                  value={communicationData}
                  onChange={(e) => setCommunicationData(e.target.value)}
                  rows={15}
                  className="min-h-[400px]"
                />
                
                <div className="flex gap-2">
                  <Button onClick={analyzeCommunication} disabled={loading || !communicationData.trim()}>
                    {loading ? 'Analyzing...' : 'Analyze Communication'}
                  </Button>
                  <Button variant="outline" onClick={() => setCommunicationData('')}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Communication Overview */}
            {communicationData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Communication Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{currentAnalysis.overview.wordCount}</div>
                      <div className="text-sm text-gray-600">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{currentAnalysis.overview.sentenceCount}</div>
                      <div className="text-sm text-gray-600">Sentences</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{currentAnalysis.overview.avgWordsPerSentence}</div>
                      <div className="text-sm text-gray-600">Avg Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{currentAnalysis.overview.readingTime}m</div>
                      <div className="text-sm text-gray-600">Read Time</div>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary">{currentAnalysis.overview.complexity}</Badge>
                      <div className="text-sm text-gray-600">Complexity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {communicationData && (
              <>
                {/* Sentiment Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Sentiment & Emotion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <Badge variant="default" className="mb-2">
                        {currentAnalysis.sentiment.overall}
                      </Badge>
                      <div className="text-2xl font-bold">{(currentAnalysis.sentiment.score * 10).toFixed(1)}/10</div>
                      <div className="text-sm text-gray-600">{(currentAnalysis.sentiment.confidence * 100).toFixed(0)}% confidence</div>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(currentAnalysis.sentiment.emotions)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 4)
                        .map(([emotion, score]) => (
                          <div key={emotion} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{emotion}</span>
                              <span>{(score * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={score * 100} className="h-2" />
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Communication Style */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Communication Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {Object.entries(currentAnalysis.communicationStyle).map(([style, score]) => (
                        <div key={style} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{style}</span>
                            <span className={getEffectivenessColor(score)}>{score}/10</span>
                          </div>
                          <Progress value={score * 10} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Effectiveness Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Effectiveness
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{currentAnalysis.effectiveness.overall}</div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(currentAnalysis.effectiveness)
                        .filter(([key]) => key !== 'overall')
                        .map(([metric, score]) => (
                          <div key={metric} className="flex justify-between text-sm">
                            <span className="capitalize">{metric}</span>
                            <span className={getEffectivenessColor(score)}>{score}/10</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Response Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter the message you want to respond to..."
                value={communicationData}
                onChange={(e) => setCommunicationData(e.target.value)}
                rows={6}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {responseStyles.map((style) => (
                  <Button
                    key={style.value}
                    variant="outline"
                    onClick={() => generateResponse(style.value)}
                    disabled={loading || !communicationData.trim()}
                    className="h-auto p-4 text-left"
                  >
                    <div>
                      <div className="font-medium">{style.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Communication History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentHistory.map((comm) => (
                <div key={comm.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{comm.type}</Badge>
                      <h4 className="font-medium">{comm.subject}</h4>
                    </div>
                    <p className="text-sm text-gray-600">To: {comm.recipient}</p>
                    <p className="text-xs text-gray-500">{comm.timestamp}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getSentimentColor(comm.sentiment)}`}>
                        {comm.sentiment}
                      </div>
                      <div className="text-xs text-gray-500">Sentiment</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getEffectivenessColor(comm.effectiveness)}`}>
                        {comm.effectiveness}/10
                      </div>
                      <div className="text-xs text-gray-500">Effectiveness</div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Key Insights */}
          {communicationData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Communication Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.keyInsights.communicationPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{pattern}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Improvement Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.keyInsights.improvementAreas.map((area, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations */}
          {communicationData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded">
                      <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Communications Analyzed</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Effectiveness</p>
                    <p className="text-2xl font-bold text-green-600">7.8</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Positive Sentiment</p>
                    <p className="text-2xl font-bold text-purple-600">68%</p>
                  </div>
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold text-orange-600">92%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationAnalysis;