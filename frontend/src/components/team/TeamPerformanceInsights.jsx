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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Switch } from '../ui/Switch';
import {
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Brain,
  Zap,
  MessageSquare,
  Calendar,
  Clock,
  Target,
  Award,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Lightbulb,
  Rocket,
  Network,
  Activity,
  Globe,
  Shield,
  Heart,
  ThumbsUp,
  Coffee,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Video,
  Mic,
  Bell,
  FileText,
  Folder,
  Archive,
  Bookmark,
  Flag,
  Hash,
  Link,
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
  MoreVertical,
  PieChart,
  LineChart,
  Gauge,
  Monitor,
  Smartphone,
  Tablet,
  Headphones,
  Camera,
  Navigation,
  MapPin,
  Home,
  Building,
  Car,
  Plane,
  Ship,
  Truck,
  Bike,
  Walk
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
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Treemap
} from 'recharts';

const TeamPerformanceInsights = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');
  const [performanceData, setPerformanceData] = useState([]);
  const [predictiveInsights, setPredictiveInsights] = useState([]);
  const [teamComparisons, setTeamComparisons] = useState([]);
  const [kpiMetrics, setKpiMetrics] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock performance data
  const teamPerformanceData = [
    {
      team: 'Product Development',
      members: 12,
      productivity: 94.2,
      velocity: 89.3,
      quality: 91.7,
      satisfaction: 4.6,
      retention: 96.8,
      innovation: 85.7,
      collaboration: 87.6,
      growth: 12.4,
      burnout_risk: 15.2,
      skill_development: 88.9,
      goal_achievement: 92.1,
      customer_impact: 89.4
    },
    {
      team: 'Data Science',
      members: 8,
      productivity: 91.8,
      velocity: 92.7,
      quality: 95.3,
      satisfaction: 4.8,
      retention: 98.2,
      innovation: 94.1,
      collaboration: 94.2,
      growth: 18.7,
      burnout_risk: 8.3,
      skill_development: 96.3,
      goal_achievement: 94.8,
      customer_impact: 91.2
    },
    {
      team: 'Marketing',
      members: 15,
      productivity: 88.4,
      velocity: 76.8,
      quality: 82.1,
      satisfaction: 4.2,
      retention: 89.3,
      innovation: 73.2,
      collaboration: 82.1,
      growth: 8.9,
      burnout_risk: 28.7,
      skill_development: 79.4,
      goal_achievement: 85.6,
      customer_impact: 94.7
    },
    {
      team: 'Customer Success',
      members: 10,
      productivity: 96.1,
      velocity: 94.5,
      quality: 93.8,
      satisfaction: 4.7,
      retention: 97.4,
      innovation: 79.3,
      collaboration: 89.7,
      growth: 14.2,
      burnout_risk: 12.1,
      skill_development: 88.6,
      goal_achievement: 96.3,
      customer_impact: 98.1
    },
    {
      team: 'Design',
      members: 6,
      productivity: 89.7,
      velocity: 87.2,
      quality: 94.6,
      satisfaction: 4.5,
      retention: 94.1,
      innovation: 91.6,
      collaboration: 91.4,
      growth: 16.3,
      burnout_risk: 18.9,
      skill_development: 85.1,
      goal_achievement: 88.7,
      customer_impact: 87.9
    }
  ];

  const performanceTrends = [
    { name: 'Jan', productivity: 85, quality: 82, satisfaction: 4.1, velocity: 78 },
    { name: 'Feb', productivity: 87, quality: 84, satisfaction: 4.2, velocity: 81 },
    { name: 'Mar', productivity: 89, quality: 86, satisfaction: 4.3, velocity: 84 },
    { name: 'Apr', productivity: 91, quality: 88, satisfaction: 4.4, velocity: 87 },
    { name: 'May', productivity: 93, quality: 90, satisfaction: 4.5, velocity: 89 },
    { name: 'Jun', productivity: 92, quality: 91, satisfaction: 4.6, velocity: 91 },
    { name: 'Jul', productivity: 94, quality: 93, satisfaction: 4.7, velocity: 93 }
  ];

  const predictiveAnalytics = [
    {
      metric: 'Team Productivity',
      current: 92.4,
      predicted_30d: 94.8,
      predicted_90d: 96.2,
      confidence: 0.91,
      trend: 'increasing',
      factors: ['Improved tooling', 'Better collaboration', 'Skill development'],
      risk_factors: ['Potential burnout', 'Resource constraints'],
      recommendations: [
        'Continue current productivity initiatives',
        'Monitor workload distribution',
        'Invest in automation tools'
      ]
    },
    {
      metric: 'Team Satisfaction',
      current: 4.6,
      predicted_30d: 4.7,
      predicted_90d: 4.8,
      confidence: 0.87,
      trend: 'stable',
      factors: ['Work-life balance', 'Career growth', 'Team culture'],
      risk_factors: ['Market uncertainty', 'Workload increases'],
      recommendations: [
        'Maintain current satisfaction initiatives',
        'Focus on career development',
        'Regular team building activities'
      ]
    },
    {
      metric: 'Innovation Index',
      current: 84.7,
      predicted_30d: 87.2,
      predicted_90d: 89.8,
      confidence: 0.83,
      trend: 'increasing',
      factors: ['Innovation time allocation', 'Cross-team collaboration', 'Learning culture'],
      risk_factors: ['Time constraints', 'Delivery pressure'],
      recommendations: [
        'Allocate dedicated innovation time',
        'Create innovation challenges',
        'Share best practices across teams'
      ]
    },
    {
      metric: 'Retention Rate',
      current: 95.2,
      predicted_30d: 94.8,
      predicted_90d: 94.1,
      confidence: 0.89,
      trend: 'slightly_decreasing',
      factors: ['Compensation', 'Growth opportunities', 'Work environment'],
      risk_factors: ['Market competition', 'Remote work challenges'],
      recommendations: [
        'Review compensation packages',
        'Enhance career development programs',
        'Improve remote work experience'
      ]
    }
  ];

  const kpiData = [
    {
      category: 'Productivity',
      metrics: [
        { name: 'Tasks Completed', value: 1247, target: 1200, unit: 'tasks', trend: 'up' },
        { name: 'Story Points', value: 892, target: 850, unit: 'points', trend: 'up' },
        { name: 'Code Quality Score', value: 94.2, target: 90, unit: '%', trend: 'up' },
        { name: 'Bug Rate', value: 2.1, target: 3.0, unit: '%', trend: 'down' }
      ]
    },
    {
      category: 'Collaboration',
      metrics: [
        { name: 'Cross-team Projects', value: 23, target: 20, unit: 'projects', trend: 'up' },
        { name: 'Knowledge Sharing', value: 87.6, target: 85, unit: '%', trend: 'up' },
        { name: 'Meeting Efficiency', value: 81.4, target: 80, unit: '%', trend: 'up' },
        { name: 'Response Time', value: 2.3, target: 3.0, unit: 'hours', trend: 'down' }
      ]
    },
    {
      category: 'Growth',
      metrics: [
        { name: 'Skill Certifications', value: 34, target: 30, unit: 'certs', trend: 'up' },
        { name: 'Internal Promotions', value: 8, target: 6, unit: 'people', trend: 'up' },
        { name: 'Training Hours', value: 156, target: 120, unit: 'hours', trend: 'up' },
        { name: 'Mentorship Pairs', value: 18, target: 15, unit: 'pairs', trend: 'up' }
      ]
    },
    {
      category: 'Innovation',
      metrics: [
        { name: 'Innovation Projects', value: 12, target: 10, unit: 'projects', trend: 'up' },
        { name: 'Patent Applications', value: 3, target: 2, unit: 'patents', trend: 'up' },
        { name: 'Hackathon Participation', value: 78, target: 70, unit: '%', trend: 'up' },
        { name: 'Idea Implementation', value: 67, target: 60, unit: '%', trend: 'up' }
      ]
    }
  ];

  const teamComparisonData = [
    { team: 'Product Dev', productivity: 94, quality: 92, satisfaction: 4.6, innovation: 86 },
    { team: 'Data Science', productivity: 92, quality: 95, satisfaction: 4.8, innovation: 94 },
    { team: 'Marketing', productivity: 88, quality: 82, satisfaction: 4.2, innovation: 73 },
    { team: 'Customer Success', productivity: 96, quality: 94, satisfaction: 4.7, innovation: 79 },
    { team: 'Design', productivity: 90, quality: 95, satisfaction: 4.5, innovation: 92 }
  ];

  const skillGapAnalysis = [
    { skill: 'Machine Learning', current: 65, required: 85, gap: 20, priority: 'High' },
    { skill: 'Cloud Architecture', current: 78, required: 90, gap: 12, priority: 'Medium' },
    { skill: 'Data Visualization', current: 82, required: 88, gap: 6, priority: 'Low' },
    { skill: 'API Design', current: 71, required: 85, gap: 14, priority: 'Medium' },
    { skill: 'DevOps', current: 69, required: 80, gap: 11, priority: 'Medium' },
    { skill: 'UX Research', current: 74, required: 85, gap: 11, priority: 'Medium' }
  ];

  useEffect(() => {
    setPerformanceData(teamPerformanceData);
    setPredictiveInsights(predictiveAnalytics);
    setTeamComparisons(teamComparisonData);
    setKpiMetrics(kpiData);
    loadInsightsData();
  }, []);

  const loadInsightsData = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const generateInsights = useCallback(() => {
    setIsAnalyzing(true);
    // Simulate AI insight generation
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  }, []);

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Productivity</p>
                <p className="text-2xl font-bold">92.4%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold">91.5%</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Satisfaction</p>
                <p className="text-2xl font-bold">4.6/5.0</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold">95.2%</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Matrix</CardTitle>
          <CardDescription>Comprehensive performance metrics across all teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Team</th>
                  <th className="text-center p-2">Members</th>
                  <th className="text-center p-2">Productivity</th>
                  <th className="text-center p-2">Quality</th>
                  <th className="text-center p-2">Satisfaction</th>
                  <th className="text-center p-2">Innovation</th>
                  <th className="text-center p-2">Retention</th>
                  <th className="text-center p-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((team, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{team.team}</td>
                    <td className="text-center p-2">{team.members}</td>
                    <td className="text-center p-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span>{team.productivity}%</span>
                        <div className={`w-2 h-2 rounded-full ${
                          team.productivity >= 90 ? 'bg-green-500' : 
                          team.productivity >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span>{team.quality}%</span>
                        <div className={`w-2 h-2 rounded-full ${
                          team.quality >= 90 ? 'bg-green-500' : 
                          team.quality >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span>{team.satisfaction}/5</span>
                        <div className={`w-2 h-2 rounded-full ${
                          team.satisfaction >= 4.5 ? 'bg-green-500' : 
                          team.satisfaction >= 4.0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span>{team.innovation}%</span>
                        <div className={`w-2 h-2 rounded-full ${
                          team.innovation >= 85 ? 'bg-green-500' : 
                          team.innovation >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span>{team.retention}%</span>
                        <div className={`w-2 h-2 rounded-full ${
                          team.retention >= 95 ? 'bg-green-500' : 
                          team.retention >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </td>
                    <td className="text-center p-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span>+{team.growth}%</span>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Monthly performance metrics across key areas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="productivity" stroke="#3b82f6" name="Productivity %" />
              <Line yAxisId="left" type="monotone" dataKey="quality" stroke="#10b981" name="Quality %" />
              <Line yAxisId="left" type="monotone" dataKey="velocity" stroke="#8b5cf6" name="Velocity %" />
              <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#f59e0b" name="Satisfaction" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderPredictiveTab = () => (
    <div className="space-y-6">
      {/* Predictive Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Predictions Generated</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">87.5%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Alerts</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Opportunities</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <Rocket className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Predictive Performance Analytics</CardTitle>
          <CardDescription>AI-powered predictions for team performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {predictiveInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      insight.trend === 'increasing' ? 'bg-green-500' :
                      insight.trend === 'decreasing' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <h3 className="font-medium">{insight.metric}</h3>
                    <Badge variant="outline" className="text-xs">
                      {(insight.confidence * 100).toFixed(1)}% confidence
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {insight.trend === 'increasing' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : insight.trend === 'decreasing' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-medium text-lg">{insight.current}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">30-Day Prediction</p>
                    <p className="font-medium text-lg text-blue-600">{insight.predicted_30d}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">90-Day Prediction</p>
                    <p className="font-medium text-lg text-purple-600">{insight.predicted_90d}%</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Contributing Factors:</h4>
                    <div className="flex flex-wrap gap-1">
                      {insight.factors.map(factor => (
                        <Badge key={factor} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Risk Factors:</h4>
                    <div className="flex flex-wrap gap-1">
                      {insight.risk_factors.map(risk => (
                        <Badge key={risk} variant="destructive" className="text-xs">
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                      Recommendations:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {insight.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                          <span>{rec}</span>
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
    </div>
  );

  const renderKpiTab = () => (
    <div className="space-y-6">
      {/* KPI Categories */}
      {kpiMetrics.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <CardTitle>{category.category} KPIs</CardTitle>
            <CardDescription>Key performance indicators for {category.category.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.metrics.map((metric, metricIndex) => (
                <div key={metricIndex} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{metric.name}</h3>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Target: {metric.target}</span>
                      <Badge variant={
                        (metric.trend === 'up' && metric.value >= metric.target) ||
                        (metric.trend === 'down' && metric.value <= metric.target)
                          ? 'default' : 'secondary'
                      }>
                        {metric.trend === 'up' && metric.value >= metric.target ? 'On Track' :
                         metric.trend === 'down' && metric.value <= metric.target ? 'On Track' : 'Needs Attention'}
                      </Badge>
                    </div>
                    <Progress 
                      value={metric.trend === 'up' ? 
                        Math.min((metric.value / metric.target) * 100, 100) :
                        Math.min(((metric.target - metric.value) / metric.target) * 100, 100)
                      } 
                      className="h-2" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Team Comparison Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Comparison</CardTitle>
          <CardDescription>Multi-dimensional comparison across all teams</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={teamComparisonData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="team" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Productivity" dataKey="productivity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Quality" dataKey="quality" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Satisfaction" dataKey="satisfaction" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Radar name="Innovation" dataKey="innovation" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderBenchmarksTab = () => (
    <div className="space-y-6">
      {/* Benchmark Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Above Benchmark</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Benchmark</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Below Benchmark</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry Rank</p>
                <p className="text-2xl font-bold">Top 15%</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
          <CardDescription>Current skill levels vs required competencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillGapAnalysis.map((skill, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{skill.skill}</h3>
                    <Badge variant={skill.priority === 'High' ? 'destructive' :
                                   skill.priority === 'Medium' ? 'secondary' : 'default'}>
                      {skill.priority} Priority
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Gap: {skill.gap} points
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current Level</span>
                    <span className="font-medium">{skill.current}%</span>
                  </div>
                  <Progress value={skill.current} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Required Level</span>
                    <span className="font-medium">{skill.required}%</span>
                  </div>
                  <Progress value={skill.required} className="h-2 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Benchmarks</CardTitle>
          <CardDescription>Performance comparison against industry standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { metric: 'Team Productivity', our: 92.4, industry: 78.2, percentile: 85 },
              { metric: 'Code Quality', our: 91.5, industry: 82.7, percentile: 78 },
              { metric: 'Employee Satisfaction', our: 4.6, industry: 3.8, percentile: 92 },
              { metric: 'Innovation Index', our: 84.7, industry: 71.3, percentile: 81 },
              { metric: 'Retention Rate', our: 95.2, industry: 87.4, percentile: 89 },
              { metric: 'Time to Market', our: 87.3, industry: 74.6, percentile: 76 }
            ].map((benchmark, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{benchmark.metric}</span>
                  <Badge variant={benchmark.percentile >= 80 ? 'default' :
                                 benchmark.percentile >= 60 ? 'secondary' : 'destructive'}>
                    {benchmark.percentile}th percentile
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-right">
                    <p className="font-medium">{benchmark.our}%</p>
                    <p className="text-muted-foreground">Our Score</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{benchmark.industry}%</p>
                    <p className="text-muted-foreground">Industry Avg</p>
                  </div>
                  <div className="w-20">
                    <Progress value={(benchmark.our / benchmark.industry) * 100} />
                  </div>
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
        <h1 className="text-3xl font-bold">Team Performance Insights</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive team analytics with predictive capabilities
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {performanceData.map(team => (
                  <SelectItem key={team.team} value={team.team}>
                    {team.team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={generateInsights} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
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
          <TabsTrigger value="performance">Performance Overview</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          {renderPerformanceTab()}
        </TabsContent>

        <TabsContent value="predictive">
          {renderPredictiveTab()}
        </TabsContent>

        <TabsContent value="kpi">
          {renderKpiTab()}
        </TabsContent>

        <TabsContent value="benchmarks">
          {renderBenchmarksTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

