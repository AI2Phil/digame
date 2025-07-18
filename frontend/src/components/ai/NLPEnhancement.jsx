import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import { useToast } from '../ui/Toast';
import {
  MessageSquare,
  Brain,
  Languages,
  Mic,
  Volume2,
  FileText,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Globe,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Target,
  Eye,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  Sparkles,
  Wand2,
  Bot,
  Cpu,
  Database,
  Network,
  Layers,
  GitBranch,
  LineChart,
  BarChart,
  Gauge,
  Monitor,
  Smartphone,
  Tablet,
  Headphones,
  Navigation,
  MousePointer,
  Calendar,
  Mail,
  Bell,
  Shield,
  Lock,
  Key,
  UserCheck,
  UserX,
  AlertCircle,
  Info,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Award,
  Trophy,
  Medal,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  ExternalLink,
  Share,
  Copy,
  Edit,
  Trash,
  Plus,
  Minus,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  MoreVertical
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

const NLPEnhancement = () => {
  const [activeTab, setActiveTab] = useState('conversation');
  const [selectedModel, setSelectedModel] = useState('all');
  const [analysisType, setAnalysisType] = useState('all');
  const [conversations, setConversations] = useState([]);
  const [textAnalysis, setTextAnalysis] = useState([]);
  const [languageModels, setLanguageModels] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [performance, setPerformance] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const { toast } = useToast();

  // Mock conversation data
  const conversationData = [
    {
      id: 'conv-001',
      user: 'Sarah Johnson',
      type: 'customer-support',
      status: 'resolved',
      sentiment: 'positive',
      confidence: 0.94,
      language: 'English',
      duration: '12m 34s',
      messages: 18,
      satisfaction: 4.8,
      topics: ['billing', 'account-upgrade', 'features'],
      aiInsights: [
        'Customer expressed satisfaction with new features',
        'Billing concern resolved quickly',
        'High likelihood of account upgrade'
      ],
      timestamp: '2025-01-07T10:30:00Z'
    },
    {
      id: 'conv-002',
      user: 'Miguel Rodriguez',
      type: 'technical-support',
      status: 'in-progress',
      sentiment: 'neutral',
      confidence: 0.87,
      language: 'Spanish',
      duration: '8m 15s',
      messages: 12,
      satisfaction: 3.5,
      topics: ['integration', 'api-issues', 'documentation'],
      aiInsights: [
        'Technical complexity requires escalation',
        'Customer needs detailed documentation',
        'API integration challenges identified'
      ],
      timestamp: '2025-01-07T10:15:00Z'
    },
    {
      id: 'conv-003',
      user: 'Emma Chen',
      type: 'sales-inquiry',
      status: 'qualified',
      sentiment: 'positive',
      confidence: 0.91,
      language: 'English',
      duration: '15m 42s',
      messages: 24,
      satisfaction: 4.6,
      topics: ['enterprise-features', 'pricing', 'implementation'],
      aiInsights: [
        'High-value prospect with enterprise needs',
        'Budget confirmed for Q1 implementation',
        'Decision maker identified'
      ],
      timestamp: '2025-01-07T09:45:00Z'
    },
    {
      id: 'conv-004',
      user: 'David Kim',
      type: 'feedback',
      status: 'analyzed',
      sentiment: 'negative',
      confidence: 0.89,
      language: 'English',
      duration: '6m 28s',
      messages: 8,
      satisfaction: 2.1,
      topics: ['performance-issues', 'user-experience', 'bugs'],
      aiInsights: [
        'Performance concerns need immediate attention',
        'UX improvements suggested',
        'Bug reports require investigation'
      ],
      timestamp: '2025-01-07T09:20:00Z'
    }
  ];

  const nlpModels = [
    {
      id: 'sentiment-analyzer',
      name: 'Advanced Sentiment Analyzer',
      type: 'sentiment-analysis',
      accuracy: 94.2,
      language: 'Multi-language',
      status: 'active',
      processedToday: 1247,
      avgProcessingTime: 0.3,
      capabilities: ['Emotion Detection', 'Intensity Scoring', 'Context Awareness'],
      lastUpdated: '2025-01-05T00:00:00Z'
    },
    {
      id: 'topic-extractor',
      name: 'Topic Extraction Engine',
      type: 'topic-modeling',
      accuracy: 91.7,
      language: 'Multi-language',
      status: 'active',
      processedToday: 892,
      avgProcessingTime: 0.8,
      capabilities: ['Keyword Extraction', 'Theme Identification', 'Category Classification'],
      lastUpdated: '2025-01-04T00:00:00Z'
    },
    {
      id: 'intent-classifier',
      name: 'Intent Classification Model',
      type: 'intent-recognition',
      accuracy: 89.6,
      language: 'English',
      status: 'active',
      processedToday: 567,
      avgProcessingTime: 0.5,
      capabilities: ['Intent Prediction', 'Confidence Scoring', 'Multi-intent Support'],
      lastUpdated: '2025-01-03T00:00:00Z'
    },
    {
      id: 'language-detector',
      name: 'Language Detection System',
      type: 'language-detection',
      accuracy: 98.1,
      language: '95+ Languages',
      status: 'active',
      processedToday: 2134,
      avgProcessingTime: 0.1,
      capabilities: ['Language Identification', 'Dialect Recognition', 'Script Detection'],
      lastUpdated: '2025-01-02T00:00:00Z'
    },
    {
      id: 'text-summarizer',
      name: 'Intelligent Text Summarizer',
      type: 'summarization',
      accuracy: 87.3,
      language: 'Multi-language',
      status: 'beta',
      processedToday: 234,
      avgProcessingTime: 2.1,
      capabilities: ['Extractive Summary', 'Abstractive Summary', 'Key Points Extraction'],
      lastUpdated: '2025-01-01T00:00:00Z'
    }
  ];

  const sentimentTrends = [
    { name: 'Mon', positive: 65, neutral: 25, negative: 10, total: 1240 },
    { name: 'Tue', positive: 68, neutral: 22, negative: 10, total: 1340 },
    { name: 'Wed', positive: 62, neutral: 28, negative: 10, total: 1420 },
    { name: 'Thu', positive: 70, neutral: 20, negative: 10, total: 1580 },
    { name: 'Fri', positive: 72, neutral: 18, negative: 10, total: 1720 },
    { name: 'Sat', positive: 58, neutral: 32, negative: 10, total: 890 },
    { name: 'Sun', positive: 60, neutral: 30, negative: 10, total: 780 }
  ];

  const topicDistribution = [
    { name: 'Customer Support', value: 35, color: '#3b82f6' },
    { name: 'Product Feedback', value: 25, color: '#10b981' },
    { name: 'Sales Inquiries', value: 20, color: '#f59e0b' },
    { name: 'Technical Issues', value: 15, color: '#ef4444' },
    { name: 'Feature Requests', value: 5, color: '#8b5cf6' }
  ];

  const languageUsage = [
    { language: 'English', conversations: 1247, percentage: 62.4, sentiment: 0.72 },
    { language: 'Spanish', conversations: 456, percentage: 22.8, sentiment: 0.68 },
    { language: 'French', conversations: 189, percentage: 9.5, sentiment: 0.74 },
    { language: 'German', conversations: 78, percentage: 3.9, sentiment: 0.71 },
    { language: 'Other', conversations: 28, percentage: 1.4, sentiment: 0.69 }
  ];

  const textAnalysisResults = [
    {
      id: 'analysis-001',
      text: 'I absolutely love the new dashboard features! The analytics are incredibly detailed and the user interface is so intuitive. This has made our workflow so much more efficient.',
      sentiment: 'positive',
      confidence: 0.96,
      emotions: {
        joy: 0.85,
        trust: 0.78,
        anticipation: 0.65,
        surprise: 0.42
      },
      topics: ['dashboard', 'analytics', 'user-interface', 'workflow'],
      intent: 'positive-feedback',
      language: 'English',
      keyPhrases: ['dashboard features', 'incredibly detailed', 'user interface', 'more efficient'],
      entities: ['dashboard', 'analytics', 'workflow'],
      timestamp: '2025-01-07T10:30:00Z'
    },
    {
      id: 'analysis-002',
      text: 'The system has been running slowly lately and I\'m experiencing frequent timeouts. This is affecting our productivity and causing frustration among the team.',
      sentiment: 'negative',
      confidence: 0.91,
      emotions: {
        anger: 0.72,
        frustration: 0.89,
        disappointment: 0.67,
        concern: 0.78
      },
      topics: ['performance', 'system-issues', 'productivity', 'team-impact'],
      intent: 'complaint',
      language: 'English',
      keyPhrases: ['running slowly', 'frequent timeouts', 'affecting productivity', 'causing frustration'],
      entities: ['system', 'timeouts', 'productivity', 'team'],
      timestamp: '2025-01-07T10:25:00Z'
    }
  ];

  const loadFallbackData = useCallback(() => {
    setConversations(conversationData);
    setLanguageModels(nlpModels);
    setTextAnalysis(textAnalysisResults);
    setSentimentData(sentimentTrends);
    setPerformance({
      totalConversations: 8927,
      averageSentiment: 0.72,
      languagesSupported: 95,
      processingAccuracy: 92.4,
      avgResponseTime: 0.8,
      modelsActive: 5,
      dailyProcessing: 12847
    });
  }, [conversationData, nlpModels, textAnalysisResults, sentimentTrends]);

  const loadNLPData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from database first
      const [conversationsRes, modelsRes, analysisRes, sentimentRes, performanceRes] = await Promise.all([
        fetch('http://localhost:8001/api/ai/nlp/conversations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('http://localhost:8001/api/ai/nlp/models', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('http://localhost:8001/api/ai/nlp/text-analysis', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('http://localhost:8001/api/ai/nlp/sentiment-trends', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('http://localhost:8001/api/ai/nlp/performance', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (conversationsRes.ok && modelsRes.ok && analysisRes.ok && sentimentRes.ok && performanceRes.ok) {
        const [conversationsData, modelsData, analysisData, sentimentData, performanceData] = await Promise.all([
          conversationsRes.json(),
          modelsRes.json(),
          analysisRes.json(),
          sentimentRes.json(),
          performanceRes.json()
        ]);

        setConversations(conversationsData.data || conversationsData);
        setLanguageModels(modelsData.data || modelsData);
        setTextAnalysis(analysisData.data || analysisData);
        setSentimentData(sentimentData.data || sentimentData);
        setPerformance(performanceData.data || performanceData);
        setUsingFallbackData(false);
      } else {
        throw new Error('Failed to load NLP data from database');
      }
    } catch (error) {
      console.warn('Failed to load NLP data from database, using fallback data:', error);
      loadFallbackData();
      setUsingFallbackData(true);
      toast({
        title: 'Using Demo Data',
        description: 'Database unavailable - showing sample NLP data',
        variant: 'warning'
      });
    } finally {
      setLoading(false);
    }
  }, [toast, loadFallbackData]);

  useEffect(() => {
    loadNLPData();
  }, [loadNLPData]);

  const processText = useCallback(async (text) => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter text to analyze',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('http://localhost:8001/api/ai/nlp/analyze-text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          analysis_type: analysisType,
          model: selectedModel
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Add the new analysis to the existing results
        setTextAnalysis(prev => [result.data, ...prev.slice(0, 9)]); // Keep last 10 results
        toast({
          title: 'Analysis Complete',
          description: 'Text analysis completed successfully',
          variant: 'success'
        });
      } else {
        throw new Error('Failed to analyze text');
      }
    } catch (error) {
      console.error('Text analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze text - using demo mode',
        variant: 'warning'
      });
      
      // Simulate analysis result for demo
      const mockResult = {
        id: `analysis-${Date.now()}`,
        text: text,
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        confidence: 0.85 + Math.random() * 0.15,
        emotions: {
          joy: Math.random() * 0.8,
          trust: Math.random() * 0.8,
          anticipation: Math.random() * 0.6,
          surprise: Math.random() * 0.4
        },
        topics: ['analysis', 'demo', 'nlp'],
        intent: 'analysis-request',
        language: 'English',
        keyPhrases: text.split(' ').slice(0, 3),
        entities: ['text', 'analysis'],
        timestamp: new Date().toISOString()
      };
      
      setTextAnalysis(prev => [mockResult, ...prev.slice(0, 9)]);
    } finally {
      setIsProcessing(false);
    }
  }, [analysisType, selectedModel, toast]);

  const handleRefresh = async () => {
    await loadNLPData();
  };

  const renderConversationTab = () => (
    <div className="space-y-6">
      {/* Conversation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                <p className="text-2xl font-bold">{performance.totalConversations?.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Sentiment</p>
                <p className="text-2xl font-bold">{(performance.averageSentiment * 100)?.toFixed(1)}%</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Languages</p>
                <p className="text-2xl font-bold">{performance.languagesSupported}</p>
              </div>
              <Languages className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{performance.processingAccuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Latest conversation analysis with AI insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversations.map(conversation => (
              <div key={conversation.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      conversation.sentiment === 'positive' ? 'bg-green-500' :
                      conversation.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <h3 className="font-medium">{conversation.user}</h3>
                    <Badge variant={conversation.type === 'customer-support' ? 'default' :
                                   conversation.type === 'sales-inquiry' ? 'secondary' :
                                   conversation.type === 'technical-support' ? 'outline' : 'destructive'}>
                      {conversation.type.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Languages className="h-3 w-3 mr-1" />
                      {conversation.language}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={conversation.status === 'resolved' ? 'default' : 'secondary'}>
                      {conversation.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{conversation.duration}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Messages</p>
                    <p className="font-medium">{conversation.messages}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sentiment</p>
                    <p className="font-medium capitalize">{conversation.sentiment} ({(conversation.confidence * 100).toFixed(1)}%)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Satisfaction</p>
                    <p className="font-medium">{conversation.satisfaction}/5.0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Topics</p>
                    <p className="font-medium">{conversation.topics.length} identified</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Topics:</h4>
                    <div className="flex flex-wrap gap-1">
                      {conversation.topics.map(topic => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <Brain className="h-4 w-4 mr-1 text-purple-500" />
                      AI Insights:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {conversation.aiInsights.map((insight, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends</CardTitle>
          <CardDescription>Daily sentiment analysis across all conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderTextAnalysisTab = () => (
    <div className="space-y-6">
      {/* Text Input for Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Text Analysis</CardTitle>
          <CardDescription>Analyze text for sentiment, topics, and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea 
              placeholder="Enter text to analyze..."
              className="min-h-[100px]"
            />
            <div className="flex items-center space-x-4">
              <Button onClick={() => {
                const textArea = document.querySelector('textarea');
                if (textArea) processText(textArea.value);
              }} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Text
                  </>
                )}
              </Button>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Analysis</SelectItem>
                  <SelectItem value="sentiment">Sentiment Only</SelectItem>
                  <SelectItem value="topics">Topics Only</SelectItem>
                  <SelectItem value="entities">Entities Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Recent text analysis with detailed insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {textAnalysis.map(analysis => (
              <div key={analysis.id} className="border rounded-lg p-4">
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm">{analysis.text}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-red-500" />
                        Sentiment Analysis
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overall Sentiment:</span>
                          <Badge variant={analysis.sentiment === 'positive' ? 'default' : 
                                         analysis.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                            {analysis.sentiment} ({(analysis.confidence * 100).toFixed(1)}%)
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(analysis.emotions).map(([emotion, score]) => (
                            <div key={emotion} className="flex items-center justify-between text-sm">
                              <span className="capitalize">{emotion}:</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={score * 100} className="w-20 h-2" />
                                <span>{(score * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-blue-500" />
                        Topics & Entities
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium">Topics:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analysis.topics.map(topic => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Key Phrases:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analysis.keyPhrases.map(phrase => (
                              <Badge key={phrase} variant="secondary" className="text-xs">
                                {phrase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Intent:</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {analysis.intent}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Topic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Distribution</CardTitle>
          <CardDescription>Most common topics across all analyzed text</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={topicDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topicDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderLanguageModelsTab = () => (
    <div className="space-y-6">
      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Models</p>
                <p className="text-2xl font-bold">{performance.modelsActive}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Processing</p>
                <p className="text-2xl font-bold">{performance.dailyProcessing?.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{performance.avgResponseTime}s</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Accuracy</p>
                <p className="text-2xl font-bold">{performance.processingAccuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Models */}
      <Card>
        <CardHeader>
          <CardTitle>NLP Models</CardTitle>
          <CardDescription>Natural language processing models and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {languageModels.map(model => (
              <div key={model.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      model.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <h3 className="font-medium">{model.name}</h3>
                    <Badge variant={model.type === 'sentiment-analysis' ? 'default' :
                                   model.type === 'topic-modeling' ? 'secondary' :
                                   model.type === 'intent-recognition' ? 'outline' : 'destructive'}>
                      {model.type.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {model.language}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                      {model.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Accuracy</p>
                    <p className="font-medium">{model.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Processed Today</p>
                    <p className="font-medium">{model.processedToday.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Time</p>
                    <p className="font-medium">{model.avgProcessingTime}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(model.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Capabilities:</h4>
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map(capability => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Language Usage Statistics</CardTitle>
          <CardDescription>Conversation distribution across different languages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {languageUsage.map(lang => (
              <div key={lang.language} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <Languages className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{lang.language}</p>
                    <p className="text-sm text-muted-foreground">{lang.conversations.toLocaleString()} conversations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{lang.percentage}%</p>
                    <p className="text-xs text-muted-foreground">of total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{(lang.sentiment * 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">avg sentiment</p>
                  </div>
                  <Progress value={lang.percentage} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Insights Generated</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actionable Items</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                <p className="text-2xl font-bold">91.2%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key AI Insights</CardTitle>
          <CardDescription>Most important insights from recent NLP analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: 'Customer Satisfaction',
                insight: 'Customer satisfaction has increased by 23% over the past month, primarily driven by improved response times and feature updates.',
                confidence: 0.94,
                impact: 'High',
                actionItems: ['Continue current support strategy', 'Expand feature development', 'Monitor satisfaction metrics'],
                trend: 'up'
              },
              {
                type: 'Product Feedback',
                insight: 'Users frequently mention integration challenges, with 67% of negative feedback related to API documentation and setup complexity.',
                confidence: 0.89,
                impact: 'Medium',
                actionItems: ['Improve API documentation', 'Create setup tutorials', 'Simplify integration process'],
                trend: 'down'
              },
              {
                type: 'Feature Requests',
                insight: 'Mobile app features are the most requested enhancement, mentioned in 45% of feature request conversations.',
                confidence: 0.92,
                impact: 'High',
                actionItems: ['Prioritize mobile development', 'Conduct mobile user research', 'Plan mobile feature roadmap'],
                trend: 'up'
              },
              {
                type: 'Support Efficiency',
                insight: 'AI-powered ticket routing has reduced resolution time by 34% and improved customer satisfaction scores.',
                confidence: 0.96,
                impact: 'High',
                actionItems: ['Expand AI routing capabilities', 'Train support team on AI tools', 'Monitor performance metrics'],
                trend: 'up'
              }
            ].map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      insight.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <h3 className="font-medium">{insight.type}</h3>
                    <Badge variant={insight.impact === 'High' ? 'default' : 'secondary'}>
                      {insight.impact} Impact
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {(insight.confidence * 100).toFixed(1)}% confidence
                    </Badge>
                    {insight.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{insight.insight}</p>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {insight.actionItems.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis Summary</CardTitle>
          <CardDescription>Overall sentiment trends and patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Sentiment Distribution</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smile className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Positive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={68} className="w-20" />
                    <span className="text-sm font-medium">68%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Meh className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Neutral</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={22} className="w-20" />
                    <span className="text-sm font-medium">22%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Frown className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Negative</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={10} className="w-20" />
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Top Emotions Detected</h4>
              <div className="space-y-2">
                {[
                  { emotion: 'Satisfaction', percentage: 34, color: 'text-green-600' },
                  { emotion: 'Excitement', percentage: 28, color: 'text-blue-600' },
                  { emotion: 'Frustration', percentage: 18, color: 'text-red-600' },
                  { emotion: 'Curiosity', percentage: 12, color: 'text-purple-600' },
                  { emotion: 'Concern', percentage: 8, color: 'text-yellow-600' }
                ].map((emotion, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className={emotion.color}>{emotion.emotion}</span>
                    <span className="font-medium">{emotion.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-muted-foreground">Loading NLP Enhancement data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">NLP Enhancement</h1>
            <p className="text-muted-foreground mt-2">
              Natural language processing and conversation management
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {usingFallbackData && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Demo Data
              </Badge>
            )}
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {languageModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Analysis type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Analysis</SelectItem>
                <SelectItem value="sentiment">Sentiment</SelectItem>
                <SelectItem value="topics">Topics</SelectItem>
                <SelectItem value="intent">Intent</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => processText('')}>
              <Brain className="h-4 w-4 mr-2" />
              Run Analysis
            </Button>
            
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversation">Conversations</TabsTrigger>
          <TabsTrigger value="analysis">Text Analysis</TabsTrigger>
          <TabsTrigger value="models">Language Models</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="conversation">
          {renderConversationTab()}
        </TabsContent>

        <TabsContent value="analysis">
          {renderTextAnalysisTab()}
        </TabsContent>

        <TabsContent value="models">
          {renderLanguageModelsTab()}
        </TabsContent>

        <TabsContent value="insights">
          {renderInsightsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NLPEnhancement;

