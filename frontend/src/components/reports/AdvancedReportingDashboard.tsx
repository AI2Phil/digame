import React, { useState, useEffect } from 'react';
import { apiClient, replaceApiUrl } from '../../lib/api-config';
import {
  BarChart3, TrendingUp, Users, Clock, Database, Zap,
  FileText, Calendar, Share, Download, Settings, AlertCircle,
  CheckCircle, Activity, Eye, Brain, Target, Layers
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useToast } from '../ui/Toast';

interface DashboardData {
  overview: {
    total_reports: number;
    active_reports: number;
    favorite_reports: number;
    total_schedules: number;
    active_schedules: number;
    upcoming_schedules: number;
  };
  data_sources: Record<string, number>;
  recent_activity: Array<{
    action: string;
    count: number;
    avg_execution_time: number;
    report_name: string;
  }>;
  top_reports: Array<{
    id: number;
    name: string;
    report_type: string;
    usage_count: number;
    avg_execution_time: number;
    last_used: string;
  }>;
  reports_by_category: Array<{
    category: string;
    count: number;
    usage_rate: number;
  }>;
  execution_metrics: {
    avg_execution_time: number;
    min_execution_time: number;
    max_execution_time: number;
    avg_data_points: number;
  };
  user_engagement: Array<{
    date: string;
    active_users: number;
    total_actions: number;
    exports: number;
  }>;
  performance_trend: Array<{
    date: string;
    avg_execution_time: number;
    report_runs: number;
    slow_reports: number;
  }>;
  predictive_insights: Array<{
    name: string;
    model_type: string;
    accuracy_score: number;
    next_prediction: number;
    confidence: number;
  }>;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
    action: string;
  }>;
}

const AdvancedReportingDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${replaceApiUrl("")}/api/advanced-reporting/dashboard?timeRange=${selectedTimeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      addToast({
        type: 'error',
        title: 'Error Loading Dashboard',
        message: 'Failed to load reporting dashboard data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatExecutionTime = (time: number) => {
    if (time < 1000) return `${Math.round(time)}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reporting dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Reporting Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive business intelligence and analytics overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.total_reports}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.overview.active_reports} active reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Reports</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.total_schedules}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.overview.upcoming_schedules} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatExecutionTime(dashboardData.execution_metrics.avg_execution_time)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(dashboardData.execution_metrics.avg_data_points)} avg data points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(dashboardData.data_sources).reduce((sum, count) => sum + count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.data_sources.active || 0} active sources
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Top Performing Reports
                </CardTitle>
                <CardDescription>Most frequently used reports in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.top_reports.slice(0, 5).map((report, index) => (
                    <div key={report.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.name}</p>
                          <p className="text-xs text-gray-500">
                            {report.usage_count} uses • {formatExecutionTime(report.avg_execution_time)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {report.report_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reports by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="w-5 h-5 mr-2" />
                  Reports by Category
                </CardTitle>
                <CardDescription>Distribution of reports across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.reports_by_category.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm text-gray-500">{category.count} reports</span>
                      </div>
                      <Progress 
                        value={category.usage_rate * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {(category.usage_rate * 100).toFixed(1)}% usage rate
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Sources Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Data Sources Status
              </CardTitle>
              <CardDescription>Current status of all connected data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dashboardData.data_sources).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    <p className="text-2xl font-bold mt-2">{count}</p>
                    <p className="text-xs text-gray-500">sources</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Execution Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Average</span>
                      <span className="text-sm font-medium">
                        {formatExecutionTime(dashboardData.execution_metrics.avg_execution_time)}
                      </span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Fastest</span>
                      <span className="text-sm font-medium">
                        {formatExecutionTime(dashboardData.execution_metrics.min_execution_time)}
                      </span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Slowest</span>
                      <span className="text-sm font-medium">
                        {formatExecutionTime(dashboardData.execution_metrics.max_execution_time)}
                      </span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.user_engagement.slice(0, 3).map((day, index) => (
                    <div key={day.date} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{day.date}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{day.active_users} users</p>
                        <p className="text-xs text-gray-500">{day.total_actions} actions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.performance_trend.slice(0, 3).map((day, index) => (
                    <div key={day.date} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{day.date}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{day.report_runs} runs</p>
                        <p className="text-xs text-gray-500">
                          {formatExecutionTime(day.avg_execution_time)} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>Intelligent recommendations and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.insights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    <Button variant="outline" size="sm">
                      Take Action
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictive Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Predictive Analytics
              </CardTitle>
              <CardDescription>Machine learning predictions and forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.predictive_insights.map((prediction, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{prediction.name}</h4>
                      <Badge variant="outline">{prediction.model_type}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accuracy</span>
                        <span className="text-sm font-medium">
                          {(prediction.accuracy_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Prediction</span>
                        <span className="text-sm font-medium">
                          {prediction.next_prediction?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Confidence</span>
                        <span className="text-sm font-medium">
                          {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest report actions and usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)} action
                        </p>
                        <p className="text-xs text-gray-500">{activity.report_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.count} times</p>
                      <p className="text-xs text-gray-500">
                        {formatExecutionTime(activity.avg_execution_time)} avg
                      </p>
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

export default AdvancedReportingDashboard;