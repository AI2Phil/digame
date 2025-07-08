import React, { useState, useEffect } from 'react';
import {
  UserCheck, TrendingUp, Clock, Target,
  BarChart3, Users, CheckCircle, XCircle,
  Calendar, Filter, Download, RefreshCw,
  ArrowUp, ArrowDown, Minus, Star, Users2, BarChartHorizontalBig,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { useToast } from '../ui/Toast';

const OnboardingAnalyticsSection = () => {
  // Toast hook for notifications
  const { toast } = useToast();
  
  // State management for database-driven data
  const [onboardingMetrics, setOnboardingMetrics] = useState({});
  const [onboardingSteps, setOnboardingSteps] = useState([]);
  const [recentCompletions, setRecentCompletions] = useState([]);
  const [userSegments, setUserSegments] = useState({});
  const [satisfactionDistribution, setSatisfactionDistribution] = useState([]);
  const [avgSatisfaction, setAvgSatisfaction] = useState(0);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Fetch onboarding analytics data from backend
  const fetchOnboardingAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8001/api/admin/onboarding/analytics/detailed?time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || result;
      
      setOnboardingMetrics(data.onboardingMetrics || {});
      setOnboardingSteps(data.onboardingSteps || []);
      setRecentCompletions(data.recentCompletions || []);
      setUserSegments(data.userSegments || {});
      setSatisfactionDistribution(data.satisfactionDistribution || []);
      setAvgSatisfaction(data.avgSatisfaction || 0);
      setInsights(data.insights || []);
      
    } catch (err) {
      console.error('Error fetching onboarding analytics:', err);
      setError(err.message);
      // Fallback to enhanced sample data
      generateEnhancedSampleData();
      // Show notification that fallback data is being used
      toast.warning('API Unavailable', 'Using sample data - onboarding analytics endpoints not accessible');
    } finally {
      setLoading(false);
    }
  };

  // Generate enhanced sample data as fallback
  const generateEnhancedSampleData = () => {
    // Generate realistic onboarding metrics
    const totalUsers = Math.round(Math.random() * 1000 + 2000); // 2k-3k
    const completionRate = Math.round((Math.random() * 10 + 78) * 10) / 10; // 78-88%
    const completedOnboarding = Math.round(totalUsers * (completionRate / 100));
    const inProgress = Math.round(totalUsers * (Math.random() * 0.07 + 0.08)); // 8-15%
    const abandoned = totalUsers - completedOnboarding - inProgress;
    const avgCompletionMinutes = Math.round(Math.random() * 10 + 8); // 8-18 min
    
    const enhancedOnboardingMetrics = {
      totalUsers,
      completedOnboarding,
      inProgress,
      abandoned,
      completionRate,
      avgCompletionTime: `${avgCompletionMinutes}m ${Math.round(Math.random() * 50 + 10)}s`,
      dropOffRate: Math.round((100 - completionRate) * 10) / 10
    };
    
    setOnboardingMetrics(enhancedOnboardingMetrics);

    // Generate realistic onboarding steps with funnel pattern
    const stepNames = ['Welcome', 'Profile Setup', 'Preferences', 'Goals Setting', 'Feature Tour', 'Completion'];
    const enhancedSteps = stepNames.map((stepName, index) => {
      const baseCompletion = totalUsers - (index * Math.round(Math.random() * 50 + 30));
      const dropOff = Math.round(Math.random() * 30 + 10);
      const completed = Math.max(baseCompletion - dropOff, completedOnboarding);
      const completionRate = Math.round((completed / totalUsers) * 1000) / 10;
      
      return {
        step: stepName,
        completed,
        dropOff,
        completionRate,
        avgTime: index === 0 ? `${Math.round(Math.random() * 30 + 30)}s` :
                 index === stepNames.length - 1 ? `${Math.round(Math.random() * 25 + 20)}s` :
                 `${Math.round(Math.random() * 3 + 1)}m ${Math.round(Math.random() * 50 + 10)}s`
      };
    });
    
    setOnboardingSteps(enhancedSteps);

    // Generate recent completions
    const domains = ['example.com', 'company.com', 'startup.io', 'tech.com', 'business.net'];
    const enhancedRecentCompletions = Array.from({ length: 8 }, (_, i) => {
      const completionTime = new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000); // Last 2 hours
      const durationMinutes = Math.round(Math.random() * 15 + 6);
      const durationSeconds = Math.round(Math.random() * 50 + 10);
      
      return {
        user: `user${Math.round(Math.random() * 900 + 100)}@${domains[Math.floor(Math.random() * domains.length)]}`,
        completedAt: completionTime.toISOString(),
        duration: `${durationMinutes}m ${durationSeconds}s`,
        stepsCompleted: Math.random() > 0.2 ? 6 : 5, // 80% complete all steps
        satisfaction: Math.random() > 0.7 ? 5 : Math.random() > 0.4 ? 4 : 3 // Weighted toward higher satisfaction
      };
    });
    
    setRecentCompletions(enhancedRecentCompletions);

    // Generate user segments
    const enhancedUserSegments = {
      fastCompleters: Math.round(Math.random() * 10 + 30), // 30-40%
      averageCompleters: Math.round(Math.random() * 10 + 45), // 45-55%
      slowCompleters: Math.round(Math.random() * 10 + 10) // 10-20%
    };
    
    setUserSegments(enhancedUserSegments);

    // Generate satisfaction distribution
    const enhancedSatisfactionDistribution = [
      { rating: 5, percentage: Math.round(Math.random() * 10 + 40), color: "green" },
      { rating: 4, percentage: Math.round(Math.random() * 10 + 30), color: "lime" },
      { rating: 3, percentage: Math.round(Math.random() * 10 + 10), color: "yellow" },
      { rating: 2, percentage: Math.round(Math.random() * 3 + 2), color: "orange" },
      { rating: 1, percentage: Math.round(Math.random() * 2 + 1), color: "red" }
    ];
    
    setSatisfactionDistribution(enhancedSatisfactionDistribution);

    // Calculate average satisfaction
    const avgSat = enhancedSatisfactionDistribution.reduce((sum, item) =>
      sum + (item.rating * item.percentage), 0) / 100;
    setAvgSatisfaction(Math.round(avgSat * 10) / 10);

    // Generate insights
    const enhancedInsights = [
      {
        type: "success",
        title: "Strong Performance",
        message: `${completionRate}% completion rate is above industry average. Users who complete the welcome step have a ${enhancedSteps[0]?.completionRate || 99}% chance of finishing the entire onboarding.`
      },
      {
        type: "warning",
        title: "Improvement Opportunity",
        message: `Profile Setup step has the highest drop-off rate (${100 - (enhancedSteps[1]?.completionRate || 94)}%). Consider simplifying this step or making some fields optional.`
      },
      {
        type: "info",
        title: "Optimization Suggestion",
        message: "Users taking longer than 15 minutes show lower satisfaction scores. Consider adding progress indicators and time estimates for each step."
      }
    ];
    
    setInsights(enhancedInsights);
  };

  // Initial data fetch
  useEffect(() => {
    fetchOnboardingAnalytics();
  }, [timeRange]);

  // Refresh data function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOnboardingAnalytics();
    setRefreshing(false);
    toast.success('Data Refreshed', 'Onboarding analytics data has been updated');
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Onboarding Analytics</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Use the fetched data or fallback to safe defaults
  const stats = {
    totalUsers: onboardingMetrics.totalUsers || 0,
    completedOnboarding: onboardingMetrics.completedOnboarding || 0,
    inProgress: onboardingMetrics.inProgress || 0,
    abandoned: onboardingMetrics.abandoned || 0,
    completionRate: onboardingMetrics.completionRate || 0,
    avgCompletionTime: onboardingMetrics.avgCompletionTime || 'N/A',
    dropOffRate: onboardingMetrics.dropOffRate || 0
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
              <CardDescription className="dark:text-gray-400">
                Track user onboarding completion rates and identify improvement opportunities.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
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
      <Tabs defaultValue="overview" className="space-y-6 dark:text-gray-300">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 dark:bg-gray-800">
          <TabsTrigger value="overview" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="funnel" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Step Analysis</TabsTrigger>
          <TabsTrigger value="users" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">User Journey</TabsTrigger>
          <TabsTrigger value="insights" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
          <UserJourneyAnalysis userSegments={userSegments} satisfactionDistribution={satisfactionDistribution} avgSatisfaction={avgSatisfaction} />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <OnboardingInsights insights={insights} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
    green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
    red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
  };

  const getTrendIcon = (trendValue) => {
    if (trendValue > 0) return <ArrowUp className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />;
    if (trendValue < 0) return <ArrowDown className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />;
    return <Minus className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />;
  };

  const getTrendColor = (trendValue) => {
    if (trendValue > 0) return 'text-green-600 dark:text-green-400';
    if (trendValue < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const trendValue = parseFloat(trend);


  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(trendValue)}
              <span className={`text-xs sm:text-sm ${getTrendColor(trendValue)}`}>
                {Math.abs(trendValue)}% from last period
              </span>
            </div>
          </div>
          <div className={`p-2.5 sm:p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Completion Overview Card
const CompletionOverviewCard = ({ stats }) => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 dark:text-gray-100">
        <Target className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Completion Overview
      </CardTitle>
      <CardDescription className="dark:text-gray-400">Summary of user onboarding status.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm dark:text-gray-300">
          <span>Completed Onboarding</span>
          <span>{stats.completedOnboarding.toLocaleString()} / {stats.totalUsers.toLocaleString()} users</span>
        </div>
        <Progress value={stats.completionRate} className="h-2 bg-green-500" />
         <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{stats.completionRate}% Completion Rate</p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center pt-2">
        <div>
          <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedOnboarding.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.abandoned.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Abandoned</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Completion Trend Card
const CompletionTrendCard = () => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 dark:text-gray-100">
        <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Completion Trend
      </CardTitle>
      <CardDescription className="dark:text-gray-400">Onboarding completion rate over time.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-60 sm:h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Trend chart visualization placeholder</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Integrate with a charting library here.</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Recent Completions Card
const RecentCompletionsCard = ({ completions }) => (
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 dark:text-gray-100">
        <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        Recent Completions
      </CardTitle>
      <CardDescription className="dark:text-gray-400">Users who recently finished onboarding.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {completions.map((completion, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600 hover:shadow-sm">
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{completion.user}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed in {completion.duration} • {completion.stepsCompleted}/6 steps
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      i < completion.satisfaction ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
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
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="dark:text-gray-100">Onboarding Funnel Analysis</CardTitle>
      <CardDescription className="dark:text-gray-400">Step-by-step completion and drop-off rates.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-200">{index + 1}. {step.step}</span>
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <span className="dark:text-gray-300">{step.completed.toLocaleString()} users</span>
                <Badge variant={step.completionRate > 95 ? 'success' : 'warning'} className="text-xs px-1.5 py-0.5">
                  {step.completionRate}%
                </Badge>
              </div>
            </div>
            <Progress value={step.completionRate} className={`h-2 ${step.completionRate > 95 ? 'bg-green-500' : step.completionRate > 80 ? 'bg-blue-500' : 'bg-yellow-500'}`} />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
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
  <Card className="dark:bg-gray-800 dark:border-gray-700">
    <CardHeader>
      <CardTitle className="dark:text-gray-100">Step Performance Details</CardTitle>
      <CardDescription className="dark:text-gray-400">In-depth metrics for each onboarding step.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="dark:bg-gray-700/50">
            <TableRow className="dark:border-gray-600">
              <TableHead className="p-2 sm:p-3 font-medium dark:text-gray-300">Step</TableHead>
              <TableHead className="p-2 sm:p-3 font-medium dark:text-gray-300 text-right">Completed</TableHead>
              <TableHead className="p-2 sm:p-3 font-medium dark:text-gray-300 text-right">Drop-off</TableHead>
              <TableHead className="p-2 sm:p-3 font-medium dark:text-gray-300 text-right">Rate (%)</TableHead>
              <TableHead className="p-2 sm:p-3 font-medium dark:text-gray-300">Avg. Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step, index) => (
              <TableRow key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 text-xs sm:text-sm">
                <TableCell className="p-2 sm:p-3 font-medium dark:text-gray-200">{step.step}</TableCell>
                <TableCell className="p-2 sm:p-3 text-right dark:text-gray-300">{step.completed.toLocaleString()}</TableCell>
                <TableCell className="p-2 sm:p-3 text-right text-red-600 dark:text-red-400">{step.dropOff}</TableCell>
                <TableCell className="p-2 sm:p-3 text-right">
                  <Badge variant={step.completionRate > 95 ? 'success' : step.completionRate > 80 ? 'default': 'warning'} className="text-xs">
                    {step.completionRate}
                  </Badge>
                </TableCell>
                <TableCell className="p-2 sm:p-3 dark:text-gray-300">{step.avgTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

// User Journey Analysis Component
const UserJourneyAnalysis = ({ userSegments, satisfactionDistribution, avgSatisfaction }) => {
  // Use fetched data or fallback to defaults
  const segments = [
    {
      label: "Fast Completers (<10min)",
      value: userSegments?.fastCompleters || 34,
      color: "green"
    },
    {
      label: "Average Completers (10-20min)",
      value: userSegments?.averageCompleters || 52,
      color: "blue"
    },
    {
      label: "Slow Completers (>20min)",
      value: userSegments?.slowCompleters || 14,
      color: "yellow"
    },
  ];

  // Use fetched satisfaction data or fallback
  const satisfactionData = satisfactionDistribution && satisfactionDistribution.length > 0
    ? satisfactionDistribution
    : [
        { rating: 5, percentage: 45, color: "green" },
        { rating: 4, percentage: 35, color: "lime" },
        { rating: 3, percentage: 15, color: "yellow" },
        { rating: 2, percentage: 3, color: "orange" },
        { rating: 1, percentage: 2, color: "red" },
      ];

  const displayAvgSatisfaction = avgSatisfaction || 4.2;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Users2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            User Segments by Completion Time
          </CardTitle>
          <CardDescription className="dark:text-gray-400">How quickly different user groups complete onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {segments.map(segment => (
            <div key={segment.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{segment.label}</span>
                <span className="font-semibold dark:text-white">{segment.value}%</span>
              </div>
              <Progress value={segment.value} className={`h-2 bg-${segment.color}-500`} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <BarChartHorizontalBig className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            Post-Onboarding Satisfaction
          </CardTitle>
          <CardDescription className="dark:text-gray-400">User satisfaction scores after completing onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {displayAvgSatisfaction} <span className="text-2xl">/ 5</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average satisfaction score</p>
          </div>
          <div className="space-y-1.5">
            {satisfactionData.map(item => (
              <div key={item.rating} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-gray-600 dark:text-gray-400">{item.rating}★</span>
                <Progress value={item.percentage} className={`h-2 bg-${item.color}-500`} />
                <span className="w-8 text-gray-500 dark:text-gray-400">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Onboarding Insights Component
const OnboardingInsights = ({ insights }) => {
  const getInsightStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/30',
          border: 'border-green-200 dark:border-green-700',
          title: 'text-green-800 dark:text-green-300',
          text: 'text-green-700 dark:text-green-400',
          icon: '✅'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/30',
          border: 'border-yellow-200 dark:border-yellow-700',
          title: 'text-yellow-800 dark:text-yellow-300',
          text: 'text-yellow-700 dark:text-yellow-400',
          icon: '⚠️'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/30',
          border: 'border-blue-200 dark:border-blue-700',
          title: 'text-blue-800 dark:text-blue-300',
          text: 'text-blue-700 dark:text-blue-400',
          icon: '💡'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/30',
          border: 'border-gray-200 dark:border-gray-700',
          title: 'text-gray-800 dark:text-gray-300',
          text: 'text-gray-700 dark:text-gray-400',
          icon: 'ℹ️'
        };
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Lightbulb className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            Key Insights & Recommendations
          </CardTitle>
          <CardDescription className="dark:text-gray-400">Actionable suggestions based on onboarding data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights && insights.length > 0 ? (
            insights.map((insight, index) => {
              const styles = getInsightStyles(insight.type);
              return (
                <div key={index} className={`p-3 sm:p-4 ${styles.bg} border ${styles.border} rounded-lg`}>
                  <h4 className={`font-medium ${styles.title} mb-1 text-sm`}>
                    {styles.icon} {insight.title}
                  </h4>
                  <p className={`text-xs sm:text-sm ${styles.text}`}>
                    {insight.message}
                  </p>
                </div>
              );
            })
          ) : (
            // Fallback insights if no data available
            <>
              <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-1 text-sm">✅ Strong Performance</h4>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">
                  Onboarding completion rate is performing well. Users who complete the welcome step
                  have a high chance of finishing the entire onboarding process.
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1 text-sm">⚠️ Improvement Opportunity</h4>
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400">
                  Monitor step-by-step completion rates to identify potential bottlenecks
                  in the onboarding process.
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1 text-sm">💡 Optimization Suggestion</h4>
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                  Consider adding progress indicators and time estimates to improve
                  user experience during onboarding.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingAnalyticsSection;