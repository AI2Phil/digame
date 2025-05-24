import React, { useState } from 'react';
import { 
  UserCheck, TrendingUp, Clock, Target, 
  BarChart3, Users, CheckCircle, XCircle,
  Calendar, Filter, Download, RefreshCw,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

const OnboardingAnalyticsSection = ({ onboardingStats }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Mock data for demonstration
  const stats = {
    totalUsers: onboardingStats.totalUsers || 1234,
    completedOnboarding: onboardingStats.completedOnboarding || 987,
    inProgress: onboardingStats.inProgress || 156,
    abandoned: onboardingStats.abandoned || 91,
    completionRate: onboardingStats.completionRate || 80,
    avgCompletionTime: onboardingStats.avgCompletionTime || '12m 34s',
    dropOffRate: onboardingStats.dropOffRate || 7.4,
    ...onboardingStats
  };

  const onboardingSteps = [
    { 
      step: 'Welcome', 
      completed: 1234, 
      dropOff: 12, 
      completionRate: 99.0,
      avgTime: '45s'
    },
    { 
      step: 'Profile Setup', 
      completed: 1156, 
      dropOff: 66, 
      completionRate: 94.3,
      avgTime: '2m 15s'
    },
    { 
      step: 'Preferences', 
      completed: 1089, 
      dropOff: 67, 
      completionRate: 94.2,
      avgTime: '1m 45s'
    },
    { 
      step: 'Goals Setting', 
      completed: 1034, 
      dropOff: 55, 
      completionRate: 94.9,
      avgTime: '3m 20s'
    },
    { 
      step: 'Feature Tour', 
      completed: 998, 
      dropOff: 36, 
      completionRate: 96.5,
      avgTime: '4m 10s'
    },
    { 
      step: 'Completion', 
      completed: 987, 
      dropOff: 11, 
      completionRate: 98.9,
      avgTime: '30s'
    }
  ];

  const recentCompletions = [
    {
      user: 'john.doe@example.com',
      completedAt: '2025-05-23 19:15:32',
      duration: '8m 45s',
      stepsCompleted: 6,
      satisfaction: 5
    },
    {
      user: 'jane.smith@company.com',
      completedAt: '2025-05-23 19:10:15',
      duration: '12m 20s',
      stepsCompleted: 6,
      satisfaction: 4
    },
    {
      user: 'mike.wilson@startup.io',
      completedAt: '2025-05-23 19:05:42',
      duration: '15m 10s',
      stepsCompleted: 5,
      satisfaction: 3
    },
    {
      user: 'sarah.johnson@tech.com',
      completedAt: '2025-05-23 19:00:18',
      duration: '9m 30s',
      stepsCompleted: 6,
      satisfaction: 5
    }
  ];

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Onboarding Analytics
              </CardTitle>
              <CardDescription>
                Track user onboarding completion rates and identify improvement opportunities
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.totalUsers}
          trend={12}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          trend={5.2}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Avg. Time"
          value={stats.avgCompletionTime}
          trend={-8.5}
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Drop-off Rate"
          value={`${stats.dropOffRate}%`}
          trend={-2.1}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Step Analysis</TabsTrigger>
          <TabsTrigger value="users">User Journey</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompletionOverviewCard stats={stats} />
            <CompletionTrendCard />
          </div>
          <RecentCompletionsCard completions={recentCompletions} />
        </TabsContent>

        {/* Step Analysis Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <OnboardingFunnelCard steps={onboardingSteps} />
          <StepPerformanceCard steps={onboardingSteps} />
        </TabsContent>

        {/* User Journey Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserJourneyAnalysis />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <OnboardingInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100'
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(trend)}
              <span className={`text-sm ${getTrendColor(trend)}`}>
                {Math.abs(trend)}% from last period
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Completion Overview Card
const CompletionOverviewCard = ({ stats }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5" />
        Completion Overview
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Completed</span>
          <span>{stats.completedOnboarding} users</span>
        </div>
        <Progress value={stats.completionRate} className="h-2" />
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">{stats.completedOnboarding}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-600">{stats.abandoned}</p>
          <p className="text-xs text-gray-500">Abandoned</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Completion Trend Card
const CompletionTrendCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Completion Trend
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Trend chart visualization</p>
          <p className="text-sm text-gray-400">Chart integration needed</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Recent Completions Card
const RecentCompletionsCard = ({ completions }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Recent Completions
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {completions.map((completion, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">{completion.user}</p>
              <p className="text-xs text-gray-500">
                Completed in {completion.duration} • {completion.stepsCompleted}/6 steps
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < completion.satisfaction ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(completion.completedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Onboarding Funnel Card
const OnboardingFunnelCard = ({ steps }) => (
  <Card>
    <CardHeader>
      <CardTitle>Onboarding Funnel Analysis</CardTitle>
      <CardDescription>Step-by-step completion and drop-off rates</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{step.step}</span>
              <div className="flex items-center gap-4 text-sm">
                <span>{step.completed} users</span>
                <Badge variant={step.completionRate > 95 ? 'success' : 'warning'}>
                  {step.completionRate}%
                </Badge>
              </div>
            </div>
            <Progress value={step.completionRate} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Avg. time: {step.avgTime}</span>
              <span>Drop-off: {step.dropOff} users</span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Step Performance Card
const StepPerformanceCard = ({ steps }) => (
  <Card>
    <CardHeader>
      <CardTitle>Step Performance Details</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Step</th>
              <th className="text-left p-3 font-medium">Completed</th>
              <th className="text-left p-3 font-medium">Drop-off</th>
              <th className="text-left p-3 font-medium">Rate</th>
              <th className="text-left p-3 font-medium">Avg. Time</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{step.step}</td>
                <td className="p-3">{step.completed}</td>
                <td className="p-3 text-red-600">{step.dropOff}</td>
                <td className="p-3">
                  <Badge variant={step.completionRate > 95 ? 'success' : 'warning'}>
                    {step.completionRate}%
                  </Badge>
                </td>
                <td className="p-3">{step.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

// User Journey Analysis Component
const UserJourneyAnalysis = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>User Segments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Fast Completers (&lt;10min)</span>
            <span className="font-bold">34%</span>
          </div>
          <Progress value={34} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Average Completers (10-20min)</span>
            <span className="font-bold">52%</span>
          </div>
          <Progress value={52} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Slow Completers (&gt;20min)</span>
            <span className="font-bold">14%</span>
          </div>
          <Progress value={14} className="h-2" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Satisfaction Scores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">4.2/5</div>
          <p className="text-sm text-gray-500">Average satisfaction</p>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center gap-2">
              <span className="w-4 text-sm">{rating}★</span>
              <Progress value={rating === 5 ? 45 : rating === 4 ? 35 : rating === 3 ? 15 : rating === 2 ? 3 : 2} className="h-2" />
              <span className="text-sm text-gray-500 w-8">
                {rating === 5 ? '45%' : rating === 4 ? '35%' : rating === 3 ? '15%' : rating === 2 ? '3%' : '2%'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Onboarding Insights Component
const OnboardingInsights = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Key Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">✅ Strong Performance</h4>
          <p className="text-sm text-green-700">
            80% completion rate is above industry average. Users who complete the welcome step 
            have a 99% chance of finishing the entire onboarding.
          </p>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Improvement Opportunity</h4>
          <p className="text-sm text-yellow-700">
            Profile Setup step has the highest drop-off rate (5.7%). Consider simplifying 
            this step or making some fields optional.
          </p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Optimization Suggestion</h4>
          <p className="text-sm text-blue-700">
            Users taking longer than 15 minutes show lower satisfaction scores. Consider 
            adding progress indicators and time estimates for each step.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default OnboardingAnalyticsSection;