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
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Database,
  Globe,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
  Brain,
  Eye,
  Target,
  Lightbulb,
  Cpu,
  Network,
  Layers,
  GitBranch,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Star,
  Heart,
  Bookmark,
  MousePointer,
  Navigation,
  Smartphone,
  Monitor,
  Tablet,
  Watch,
  Headphones
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Sankey
} from 'recharts';

const AdvancedBehavioralAnalysis = () => {
  const [activeTab, setActiveTab] = useState('patterns');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedUser, setSelectedUser] = useState('all');
  const [analysisMode, setAnalysisMode] = useState('realtime');
  const [behaviorData, setBehaviorData] = useState({});
  const [patternAnalysis, setPatternAnalysis] = useState({});
  const [userSegmentData, setUserSegmentData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock behavioral data
  const userBehaviorPatterns = [
    {
      pattern: 'Morning Productivity Peak',
      description: 'Users show highest engagement between 9-11 AM',
      frequency: 87.3,
      confidence: 0.94,
      impact: 'High',
      users: 2340,
      trend: 'increasing',
      category: 'temporal'
    },
    {
      pattern: 'Feature Discovery Sequence',
      description: 'New users follow predictable feature adoption path',
      frequency: 76.8,
      confidence: 0.89,
      impact: 'High',
      users: 1890,
      trend: 'stable',
      category: 'navigation'
    },
    {
      pattern: 'Mobile-First Behavior',
      description: 'Younger users prefer mobile interface for quick tasks',
      frequency: 82.1,
      confidence: 0.91,
      impact: 'Medium',
      users: 3120,
      trend: 'increasing',
      category: 'device'
    },
    {
      pattern: 'Collaborative Work Sessions',
      description: 'Team features used in concentrated bursts',
      frequency: 64.5,
      confidence: 0.86,
      impact: 'Medium',
      users: 1560,
      trend: 'increasing',
      category: 'collaboration'
    },
    {
      pattern: 'Weekend Learning Preference',
      description: 'Educational content consumed primarily on weekends',
      frequency: 71.2,
      confidence: 0.88,
      impact: 'Medium',
      users: 2780,
      trend: 'stable',
      category: 'temporal'
    }
  ];

  const userSegments = [
    {
      id: 'power-users',
      name: 'Power Users',
      size: 1247,
      percentage: 15.2,
      characteristics: ['High engagement', 'Feature explorers', 'Early adopters'],
      avgSessionTime: 45,
      retentionRate: 94.5,
      color: '#3B82F6'
    },
    {
      id: 'casual-users',
      name: 'Casual Users',
      size: 3890,
      percentage: 47.3,
      characteristics: ['Moderate usage', 'Core features', 'Consistent patterns'],
      avgSessionTime: 18,
      retentionRate: 78.2,
      color: '#10B981'
    },
    {
      id: 'new-users',
      name: 'New Users',
      size: 1560,
      percentage: 19.0,
      characteristics: ['Learning phase', 'Guided flows', 'High support needs'],
      avgSessionTime: 12,
      retentionRate: 65.8,
      color: '#F59E0B'
    },
    {
      id: 'at-risk',
      name: 'At-Risk Users',
      size: 890,
      percentage: 10.8,
      characteristics: ['Declining usage', 'Error encounters', 'Support tickets'],
      avgSessionTime: 8,
      retentionRate: 42.1,
      color: '#EF4444'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Users',
      size: 634,
      percentage: 7.7,
      characteristics: ['Team features', 'Advanced workflows', 'Integration heavy'],
      avgSessionTime: 62,
      retentionRate: 96.8,
      color: '#8B5CF6'
    }
  ];

  const behaviorAnomalies = [
    {
      id: 'unusual-spike',
      type: 'Usage Spike',
      description: 'Unexpected 340% increase in API calls from mobile app',
      severity: 'medium',
      timestamp: '2025-01-07T14:30:00Z',
      affectedUsers: 1247,
      confidence: 0.87,
      status: 'investigating'
    },
    {
      id: 'feature-abandonment',
      type: 'Feature Abandonment',
      description: 'Sharp drop in new feature adoption after onboarding',
      severity: 'high',
      timestamp: '2025-01-07T10:15:00Z',
      affectedUsers: 567,
      confidence: 0.92,
      status: 'confirmed'
    },
    {
      id: 'session-duration',
      type: 'Session Duration',
      description: 'Average session time decreased by 25% for power users',
      severity: 'medium',
      timestamp: '2025-01-07T08:45:00Z',
      affectedUsers: 234,
      confidence: 0.89,
      status: 'resolved'
    },
    {
      id: 'error-pattern',
      type: 'Error Pattern',
      description: 'Recurring authentication errors in specific user cohort',
      severity: 'high',
      timestamp: '2025-01-06T16:20:00Z',
      affectedUsers: 89,
      confidence: 0.95,
      status: 'investigating'
    }
  ];

  const engagementMetrics = [
    { name: 'Mon', engagement: 78, sessions: 1240, duration: 28 },
    { name: 'Tue', engagement: 82, sessions: 1340, duration: 32 },
    { name: 'Wed', engagement: 85, sessions: 1420, duration: 35 },
    { name: 'Thu', engagement: 88, sessions: 1580, duration: 38 },
    { name: 'Fri', engagement: 92, sessions: 1720, duration: 42 },
    { name: 'Sat', engagement: 76, sessions: 890, duration: 25 },
    { name: 'Sun', engagement: 74, sessions: 780, duration: 22 }
  ];

  const featureUsageFlow = [
    { step: 'Login', users: 10000, dropoff: 0 },
    { step: 'Dashboard', users: 9850, dropoff: 1.5 },
    { step: 'Core Feature', users: 8920, dropoff: 9.4 },
    { step: 'Advanced Feature', users: 6780, dropoff: 24.0 },
    { step: 'Integration', users: 4560, dropoff: 32.7 },
    { step: 'Collaboration', users: 3240, dropoff: 28.9 }
  ];

  const deviceBehaviorData = [
    { device: 'Desktop', usage: 45.2, engagement: 92, avgSession: 38 },
    { device: 'Mobile', usage: 38.7, engagement: 76, avgSession: 18 },
    { device: 'Tablet', usage: 16.1, engagement: 84, avgSession: 28 }
  ];

  useEffect(() => {
    loadBehaviorData();
    loadPatternAnalysis();
    loadUserSegments();
    loadAnomalies();
    loadPredictions();
    
    // Set up real-time updates
    const interval = setInterval(loadBehaviorData, 30000);
    return () => clearInterval(interval);
  }, [timeRange, selectedUser, analysisMode]);

  const loadBehaviorData = async () => {
    setBehaviorData({
      totalUsers: 8221,
      activeUsers: 6547,
      avgSessionDuration: 32.5,
      engagementScore: 84.2,
      retentionRate: 78.9,
      featureAdoption: 67.3,
      satisfactionScore: 4.6,
      churnRisk: 12.8
    });
  };

  const loadPatternAnalysis = async () => {
    setPatternAnalysis({
      identifiedPatterns: userBehaviorPatterns.length,
      avgConfidence: 0.896,
      highImpactPatterns: userBehaviorPatterns.filter(p => p.impact === 'High').length,
      trendingPatterns: userBehaviorPatterns.filter(p => p.trend === 'increasing').length
    });
  };

  const loadUserSegments = async () => {
    setUserSegmentData(userSegments);
  };

  const loadAnomalies = async () => {
    setAnomalies(behaviorAnomalies);
  };

  const loadPredictions = async () => {
    setPredictions({
      churnPrediction: {
        nextWeek: 156,
        confidence: 0.87,
        trend: 'decreasing'
      },
      engagementForecast: {
        nextMonth: 86.4,
        confidence: 0.91,
        trend: 'increasing'
      },
      featureAdoption: {
        newFeature: 72.3,
        confidence: 0.84,
        timeline: '2 weeks'
      }
    });
  };

  const runBehaviorAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    await loadBehaviorData();
    await loadPatternAnalysis();
    setIsAnalyzing(false);
  }, []);

  const renderPatternsTab = () => (
    <div className="space-y-6">
      {/* Pattern Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Identified Patterns</p>
                <p className="text-2xl font-bold">{patternAnalysis.identifiedPatterns}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{(patternAnalysis.avgConfidence * 100).toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Impact</p>
                <p className="text-2xl font-bold">{patternAnalysis.highImpactPatterns}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trending</p>
                <p className="text-2xl font-bold">{patternAnalysis.trendingPatterns}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Behavior Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Identified Behavior Patterns</CardTitle>
          <CardDescription>AI-powered analysis of user behavior patterns and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userBehaviorPatterns.map((pattern, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      pattern.impact === 'High' ? 'bg-red-500' :
                      pattern.impact === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <h3 className="font-medium">{pattern.pattern}</h3>
                    <Badge variant={pattern.category === 'temporal' ? 'default' :
                                   pattern.category === 'navigation' ? 'secondary' :
                                   pattern.category === 'device' ? 'outline' : 'destructive'}>
                      {pattern.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pattern.trend === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : pattern.trend === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 bg-gray-400 rounded-full" />
                    )}
                    <span className="text-sm font-medium">{pattern.frequency}%</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Confidence</p>
                    <p className="font-medium">{(pattern.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Impact</p>
                    <p className="font-medium">{pattern.impact}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Affected Users</p>
                    <p className="font-medium">{pattern.users.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trend</p>
                    <p className="font-medium capitalize">{pattern.trend}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Engagement Patterns</CardTitle>
          <CardDescription>User engagement and session patterns throughout the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={engagementMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="sessions" fill="#3b82f6" name="Sessions" />
              <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#10b981" name="Engagement %" />
              <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#f59e0b" name="Avg Duration (min)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderSegmentsTab = () => (
    <div className="space-y-6">
      {/* Segment Overview */}
      <Card>
        <CardHeader>
          <CardTitle>User Segmentation Analysis</CardTitle>
          <CardDescription>AI-powered user segmentation based on behavior patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {userSegmentData.map(segment => (
              <div key={segment.id} className="border rounded-lg p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: segment.color + '20' }}>
                  <Users className="h-8 w-8" style={{ color: segment.color }} />
                </div>
                <h3 className="font-medium mb-2">{segment.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="font-bold text-lg">{segment.size.toLocaleString()}</div>
                  <div className="text-muted-foreground">{segment.percentage}% of users</div>
                  <div className="text-muted-foreground">{segment.avgSessionTime}min avg</div>
                  <div className="text-green-600">{segment.retentionRate}% retention</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Segment Distribution</CardTitle>
            <CardDescription>User distribution across behavioral segments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userSegmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="size"
                >
                  {userSegmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segment Performance</CardTitle>
            <CardDescription>Retention rates and session times by segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userSegmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="retentionRate" fill="#10b981" name="Retention Rate %" />
                <Bar yAxisId="right" dataKey="avgSessionTime" fill="#3b82f6" name="Avg Session (min)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Characteristics</CardTitle>
          <CardDescription>Detailed characteristics and behaviors of each user segment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userSegmentData.map(segment => (
              <div key={segment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }} />
                    <h3 className="font-medium">{segment.name}</h3>
                    <Badge variant="outline">{segment.size.toLocaleString()} users</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{segment.percentage}% of total</div>
                    <div className="text-sm text-muted-foreground">{segment.retentionRate}% retention</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {segment.characteristics.map((char, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnomaliesTab = () => (
    <div className="space-y-6">
      {/* Anomaly Detection Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Anomalies</p>
                <p className="text-2xl font-bold">{anomalies.filter(a => a.status !== 'resolved').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Severity</p>
                <p className="text-2xl font-bold">{anomalies.filter(a => a.severity === 'high').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Affected Users</p>
                <p className="text-2xl font-bold">{anomalies.reduce((sum, a) => sum + a.affectedUsers, 0).toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{(anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length * 100).toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly List */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Anomalies</CardTitle>
          <CardDescription>AI-powered anomaly detection in user behavior patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      anomaly.severity === 'high' ? 'bg-red-500' :
                      anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <h3 className="font-medium">{anomaly.type}</h3>
                    <Badge variant={anomaly.status === 'confirmed' ? 'destructive' :
                                   anomaly.status === 'investigating' ? 'secondary' : 'default'}>
                      {anomaly.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{(anomaly.confidence * 100).toFixed(1)}% confidence</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{anomaly.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">
                      Affected Users: <span className="font-medium">{anomaly.affectedUsers.toLocaleString()}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Severity: <span className={`font-medium ${
                        anomaly.severity === 'high' ? 'text-red-600' :
                        anomaly.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>{anomaly.severity}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Investigate
                    </Button>
                    {anomaly.status === 'investigating' && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Usage Flow */}
      <Card>
        <CardHeader>
          <CardTitle>User Journey Analysis</CardTitle>
          <CardDescription>Feature adoption flow and drop-off points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureUsageFlow.map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-8 text-center">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{step.step}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
                        {step.users.toLocaleString()} users
                      </span>
                      {step.dropoff > 0 && (
                        <span className="text-sm text-red-600">
                          -{step.dropoff}% drop-off
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress value={(step.users / featureUsageFlow[0].users) * 100} className="h-2" />
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
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Score</p>
                <p className="text-2xl font-bold">{behaviorData.engagementScore}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% from last week
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold">{behaviorData.retentionRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% improvement
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Feature Adoption</p>
                <p className="text-2xl font-bold">{behaviorData.featureAdoption}%</p>
                <p className="text-xs text-yellow-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -1.3% this week
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Churn Risk</p>
                <p className="text-2xl font-bold">{behaviorData.churnRisk}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -0.8% reduction
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Insights</CardTitle>
          <CardDescription>AI-powered predictions and forecasts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <h3 className="font-medium">Churn Prediction</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{predictions.churnPrediction?.nextWeek}</div>
                <div className="text-sm text-muted-foreground">users at risk next week</div>
                <div className="text-xs text-green-600">
                  {(predictions.churnPrediction?.confidence * 100).toFixed(1)}% confidence
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">Engagement Forecast</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{predictions.engagementForecast?.nextMonth}%</div>
                <div className="text-sm text-muted-foreground">predicted engagement next month</div>
                <div className="text-xs text-green-600">
                  {(predictions.engagementForecast?.confidence * 100).toFixed(1)}% confidence
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="h-5 w-5 text-purple-500" />
                <h3 className="font-medium">Feature Adoption</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{predictions.featureAdoption?.newFeature}%</div>
                <div className="text-sm text-muted-foreground">predicted adoption rate</div>
                <div className="text-xs text-green-600">
                  {(predictions.featureAdoption?.confidence * 100).toFixed(1)}% confidence
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Behavior Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Device Behavior Analysis</CardTitle>
          <CardDescription>User behavior patterns across different devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deviceBehaviorData.map((device, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {device.device === 'Desktop' ? (
                    <Monitor className="h-8 w-8 text-blue-500" />
                  ) : device.device === 'Mobile' ? (
                    <Smartphone className="h-8 w-8 text-green-500" />
                  ) : (
                    <Tablet className="h-8 w-8 text-purple-500" />
                  )}
                  <div>
                    <h3 className="font-medium">{device.device}</h3>
                    <p className="text-sm text-muted-foreground">{device.usage}% usage share</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{device.engagement}%</div>
                    <div className="text-muted-foreground">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{device.avgSession}min</div>
                    <div className="text-muted-foreground">Avg Session</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Recommendations</CardTitle>
          <CardDescription>Actionable insights based on behavioral analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: 'Engagement',
                title: 'Optimize Mobile Experience',
                description: 'Mobile users show 40% lower engagement. Consider mobile-first design improvements.',
                impact: 'High',
                effort: 'Medium',
                priority: 'high'
              },
              {
                type: 'Retention',
                title: 'Improve Onboarding Flow',
                description: 'New users drop off at 24% rate during feature discovery. Simplify onboarding.',
                impact: 'High',
                effort: 'Low',
                priority: 'high'
              },
              {
                type: 'Feature Adoption',
                title: 'Promote Advanced Features',
                description: 'Power users are underutilizing advanced features. Add feature discovery prompts.',
                impact: 'Medium',
                effort: 'Low',
                priority: 'medium'
              },
              {
                type: 'Performance',
                title: 'Reduce Load Times',
                description: 'Users with slower load times show 15% higher churn risk.',
                impact: 'Medium',
                effort: 'High',
                priority: 'medium'
              }
            ].map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-500' :
                      rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <Badge variant="outline" className="text-xs">
                      {rec.type}
                    </Badge>
                    <h3 className="font-medium">{rec.title}</h3>
                  </div>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                    {rec.priority} priority
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">
                      Impact: <span className="font-medium text-green-600">{rec.impact}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Effort: <span className="font-medium text-blue-600">{rec.effort}</span>
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Implement
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Advanced Behavioral Analysis</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered user behavior pattern recognition and analysis
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select user segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="power-users">Power Users</SelectItem>
                <SelectItem value="casual-users">Casual Users</SelectItem>
                <SelectItem value="new-users">New Users</SelectItem>
                <SelectItem value="at-risk">At-Risk Users</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={analysisMode} onValueChange={setAnalysisMode}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Analysis mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="batch">Batch Analysis</SelectItem>
                <SelectItem value="predictive">Predictive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={runBehaviorAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">Behavior Patterns</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns">
          {renderPatternsTab()}
        </TabsContent>

        <TabsContent value="segments">
          {renderSegmentsTab()}
        </TabsContent>

        <TabsContent value="anomalies">
          {renderAnomaliesTab()}
        </TabsContent>

        <TabsContent value="insights">
          {renderInsightsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

