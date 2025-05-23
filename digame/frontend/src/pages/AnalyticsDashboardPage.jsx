import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import Avatar from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { InteractiveChart } from '../components/dashboard/InteractiveChart';
import { ProductivityChart } from '../components/dashboard/ProductivityChart';
import { ActivityBreakdown } from '../components/dashboard/ActivityBreakdown';
import { ProductivityMetricCard } from '../components/dashboard/ProductivityMetricCard';

const AnalyticsDashboardPage = () => {
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?period=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProductivityScore = () => {
    if (!analytics.productivity) return 0;
    return Math.round(analytics.productivity.score || 0);
  };

  const getProductivityTrend = () => {
    if (!analytics.productivity?.trend) return 0;
    return analytics.productivity.trend;
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Overview</h2>
        <div className="flex space-x-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' }
          ].map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductivityMetricCard
          title="Productivity Score"
          value={getProductivityScore()}
          unit="%"
          trend={getProductivityTrend()}
          description="Overall productivity rating"
        />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Time</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(analytics.totalActiveTime || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{formatDuration(analytics.activeTimeIncrease || 0)} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Sessions</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.focusSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg {formatDuration(analytics.avgFocusTime || 0)} per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distractions</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.distractions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.distractionTrend > 0 ? '+' : ''}{analytics.distractionTrend || 0}% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trend</CardTitle>
            <CardDescription>Your productivity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductivityChart 
              data={analytics.productivityTrend || []}
              timeRange={timeRange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Breakdown</CardTitle>
            <CardDescription>How you spend your time</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityBreakdown 
              data={analytics.activityBreakdown || []}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Detailed view of your daily activities</CardDescription>
        </CardHeader>
        <CardContent>
          <InteractiveChart 
            data={analytics.activityTimeline || []}
            type="timeline"
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );

  const InsightsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI Insights & Recommendations</h2>
      
      {/* Productivity Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Insights</CardTitle>
          <CardDescription>AI-powered analysis of your work patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.insights?.productivity?.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">{insight.title}</h4>
                  <p className="text-sm text-blue-700">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-sm text-blue-600 mt-1">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </p>
                  )}
                </div>
              </div>
            )) || (
              <p className="text-gray-500">No productivity insights available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Detection</CardTitle>
          <CardDescription>Unusual patterns in your work behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.anomalies?.map((anomaly, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-900">{anomaly.type}</h4>
                  <p className="text-sm text-yellow-700">{anomaly.description}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant="warning" className="mr-2">
                      Severity: {anomaly.severity}
                    </Badge>
                    <span className="text-xs text-yellow-600">
                      {new Date(anomaly.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-gray-500">No anomalies detected in the selected period.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Goals Progress</CardTitle>
          <CardDescription>Track your professional development goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.goals?.map((goal, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{goal.title}</h4>
                  <Badge variant={goal.status === 'completed' ? 'success' : 'secondary'}>
                    {goal.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                <div className="flex items-center space-x-2">
                  <Progress value={goal.progress || 0} className="flex-1" />
                  <span className="text-sm text-gray-600">{goal.progress || 0}%</span>
                </div>
              </div>
            )) || (
              <p className="text-gray-500">No goals set yet. Complete your onboarding to set goals.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Reports</h2>
        <Button>
          Export Report
        </Button>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>Your performance summary for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.weeklyStats?.totalHours || 0}h
              </div>
              <p className="text-sm text-gray-600">Total Active Hours</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analytics.weeklyStats?.productiveHours || 0}h
              </div>
              <p className="text-sm text-gray-600">Productive Hours</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {analytics.weeklyStats?.averageScore || 0}%
              </div>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
          <CardDescription>Comprehensive performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Most Productive Day</h4>
                <p className="text-lg font-semibold">
                  {analytics.detailedMetrics?.mostProductiveDay || 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Peak Hours</h4>
                <p className="text-lg font-semibold">
                  {analytics.detailedMetrics?.peakHours || 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Top Application</h4>
                <p className="text-lg font-semibold">
                  {analytics.detailedMetrics?.topApplication || 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Focus Streak</h4>
                <p className="text-lg font-semibold">
                  {analytics.detailedMetrics?.focusStreak || 0} days
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab /> },
    { id: 'insights', label: 'AI Insights', content: <InsightsTab /> },
    { id: 'reports', label: 'Reports', content: <ReportsTab /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Monitor your performance and productivity insights
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="success">
                  Score: {getProductivityScore()}%
                </Badge>
                <Button onClick={fetchAnalytics}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;