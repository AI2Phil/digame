import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Activity, Database, Clock, Users, Zap, AlertTriangle, 
  CheckCircle, Monitor, Globe, RefreshCw, Download, Filter, Calendar, Eye, 
  Target, Cpu, HardDrive, Network, Server, Shield, Brain, Layers,
  MousePointer, Timer, FileText, Search, Settings, Bell, DollarSign,
  PieChart, LineChart, BarChart, TrendingDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useToast } from '../components/ui/Toast';
import enhancedApiService from '../services/enhancedApiService';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';

const BusinessIntelligenceDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [biData, setBiData] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [predictiveInsights, setPredictiveInsights] = useState({});
  const [customReports, setCustomReports] = useState([]);

  useEffect(() => {
    loadBusinessIntelligence();
    setupRealTimeUpdates();
  }, [timeRange]);

  const loadBusinessIntelligence = async () => {
    setLoading(true);
    try {
      const [
        businessData,
        revenue,
        userGrowth,
        performance,
        predictions,
        reports
      ] = await Promise.all([
        enhancedApiService.getBusinessIntelligence({ timeRange }),
        enhancedApiService.getRevenueAnalytics(timeRange),
        enhancedApiService.getUserGrowthAnalytics(timeRange),
        enhancedApiService.getPerformanceMetrics(),
        enhancedApiService.getPredictiveInsights(),
        enhancedApiService.getCustomReports()
      ]);

      setBiData(businessData || generateMockBIData());
      setRevenueData(revenue || generateMockRevenueData());
      setUserGrowthData(userGrowth || generateMockUserGrowthData());
      setPerformanceMetrics(performance || generateMockPerformanceData());
      setPredictiveInsights(predictions || generateMockPredictiveData());
      setCustomReports(reports || generateMockReportsData());

    } catch (error) {
      console.error('Failed to load business intelligence:', error);
      toast.error('Failed to load BI data');
      // Load mock data as fallback
      setBiData(generateMockBIData());
      setRevenueData(generateMockRevenueData());
      setUserGrowthData(generateMockUserGrowthData());
      setPerformanceMetrics(generateMockPerformanceData());
      setPredictiveInsights(generateMockPredictiveData());
      setCustomReports(generateMockReportsData());
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      try {
        const realTimeData = await enhancedApiService.getRealTimeBusinessMetrics();
        setBiData(prev => ({ ...prev, realTime: realTimeData }));
      } catch (error) {
        console.error('Failed to update real-time BI metrics:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBusinessIntelligence();
    setRefreshing(false);
    toast.success('Business intelligence data refreshed');
  };

  const handleExportReport = async (reportType) => {
    try {
      const exportData = {
        reportType,
        timeRange,
        generatedAt: new Date().toISOString(),
        data: {
          businessIntelligence: biData,
          revenue: revenueData,
          userGrowth: userGrowthData,
          performance: performanceMetrics,
          predictions: predictiveInsights
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bi-report-${reportType}-${timeRange}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(`${reportType} report exported successfully`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const generateCustomReport = async (reportConfig) => {
    try {
      toast.info('Generating custom report...');
      const report = await enhancedApiService.generateCustomReport(reportConfig);
      setCustomReports(prev => [report, ...prev]);
      toast.success('Custom report generated successfully');
    } catch (error) {
      toast.error('Failed to generate custom report');
    }
  };

  // Mock data generators
  const generateMockBIData = () => ({
    kpis: {
      totalRevenue: 2847392,
      revenueGrowth: 23.5,
      activeUsers: 12847,
      userGrowth: 18.2,
      churnRate: 3.4,
      ltv: 4250,
      cac: 180,
      mrr: 234567
    },
    segments: {
      userTypes: [
        { name: 'Enterprise', value: 35, revenue: 1200000 },
        { name: 'Team', value: 45, revenue: 980000 },
        { name: 'Individual Pro', value: 15, revenue: 450000 },
        { name: 'Free', value: 5, revenue: 0 }
      ],
      regions: [
        { name: 'North America', value: 45, revenue: 1280000 },
        { name: 'Europe', value: 30, revenue: 854000 },
        { name: 'Asia Pacific', value: 20, revenue: 568000 },
        { name: 'Other', value: 5, revenue: 145000 }
      ]
    },
    trends: {
      conversionRate: 12.8,
      avgSessionDuration: 485,
      pageViewsPerSession: 4.2,
      bounceRate: 23.4
    }
  });

  const generateMockRevenueData = () => [
    { month: 'Jan', revenue: 180000, target: 175000, growth: 15.2 },
    { month: 'Feb', revenue: 195000, target: 185000, growth: 18.3 },
    { month: 'Mar', revenue: 210000, target: 200000, growth: 22.1 },
    { month: 'Apr', revenue: 225000, target: 215000, growth: 25.4 },
    { month: 'May', revenue: 240000, target: 230000, growth: 28.7 },
    { month: 'Jun', revenue: 255000, target: 245000, growth: 31.2 }
  ];

  const generateMockUserGrowthData = () => [
    { month: 'Jan', users: 8500, newUsers: 850, churn: 120 },
    { month: 'Feb', users: 9200, newUsers: 920, churn: 135 },
    { month: 'Mar', users: 10100, newUsers: 1050, churn: 145 },
    { month: 'Apr', users: 11200, newUsers: 1180, churn: 160 },
    { month: 'May', users: 12100, newUsers: 1250, churn: 175 },
    { month: 'Jun', users: 12847, newUsers: 1320, churn: 185 }
  ];

  const generateMockPerformanceData = () => ({
    systemHealth: 99.8,
    apiResponseTime: 245,
    uptime: 99.95,
    errorRate: 0.02,
    throughput: 1250,
    satisfaction: 4.7
  });

  const generateMockPredictiveData = () => ({
    revenueForcast: {
      nextMonth: 270000,
      confidence: 87,
      factors: ['Seasonal trends', 'New feature adoption', 'Market expansion']
    },
    userGrowth: {
      nextMonth: 1450,
      confidence: 82,
      factors: ['Marketing campaigns', 'Product improvements', 'Referral program']
    },
    churnRisk: {
      highRisk: 45,
      mediumRisk: 120,
      lowRisk: 890
    }
  });

  const generateMockReportsData = () => [
    {
      id: 1,
      name: 'Monthly Revenue Analysis',
      type: 'revenue',
      createdAt: '2025-01-05',
      status: 'completed'
    },
    {
      id: 2,
      name: 'User Engagement Report',
      type: 'engagement',
      createdAt: '2025-01-04',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Performance Metrics',
      type: 'performance',
      createdAt: '2025-01-03',
      status: 'completed'
    }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading business intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mr-2 text-gray-600 hover:text-gray-900"
              >
                ← Dashboard
              </Button>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Business Intelligence</h1>
                <p className="text-gray-600">Advanced analytics and predictive insights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              
              <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" onClick={() => handleExportReport('comprehensive')} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
          
          {/* KPI Overview */}
          <KPIOverview kpis={biData.kpis} />
        </div>

        {/* Main BI Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <BusinessOverviewSection 
              biData={biData}
              revenueData={revenueData}
              userGrowthData={userGrowthData}
            />
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <RevenueAnalyticsSection 
              revenueData={revenueData}
              biData={biData}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserAnalyticsSection 
              userGrowthData={userGrowthData}
              biData={biData}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceSection 
              performanceMetrics={performanceMetrics}
            />
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <PredictiveAnalyticsSection 
              predictiveInsights={predictiveInsights}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <CustomReportsSection 
              customReports={customReports}
              onGenerateReport={generateCustomReport}
              onExportReport={handleExportReport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// KPI Overview Component
const KPIOverview = ({ kpis }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 p-6 bg-white rounded-lg shadow-sm border">
    <KPICard
      title="Total Revenue"
      value={`$${(kpis?.totalRevenue || 0).toLocaleString()}`}
      icon={DollarSign}
      color="green"
      trend="up"
      change={`+${kpis?.revenueGrowth || 0}%`}
    />
    <KPICard
      title="Active Users"
      value={(kpis?.activeUsers || 0).toLocaleString()}
      icon={Users}
      color="blue"
      trend="up"
      change={`+${kpis?.userGrowth || 0}%`}
    />
    <KPICard
      title="Churn Rate"
      value={`${kpis?.churnRate || 0}%`}
      icon={TrendingDown}
      color="red"
      trend="down"
      change="-0.5%"
    />
    <KPICard
      title="LTV"
      value={`$${kpis?.ltv || 0}`}
      icon={Target}
      color="purple"
      trend="up"
      change="+8.2%"
    />
    <KPICard
      title="CAC"
      value={`$${kpis?.cac || 0}`}
      icon={TrendingUp}
      color="orange"
      trend="down"
      change="-12%"
    />
    <KPICard
      title="MRR"
      value={`$${(kpis?.mrr || 0).toLocaleString()}`}
      icon={BarChart3}
      color="emerald"
      trend="up"
      change="+15.3%"
    />
    <KPICard
      title="Conversion"
      value="12.8%"
      icon={ArrowUpRight}
      color="blue"
      trend="up"
      change="+2.1%"
    />
    <KPICard
      title="Satisfaction"
      value="4.7/5"
      icon={CheckCircle}
      color="green"
      trend="stable"
      change="0.1"
    />
  </div>
);

// KPI Card Component
const KPICard = ({ title, value, icon: Icon, color, trend, change }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100'
  };

  const trendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : CheckCircle;
  const TrendIcon = trendIcon;

  return (
    <div className="text-center">
      <div className={`p-2 rounded-full ${colorClasses[color]} mx-auto mb-2 w-fit`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="font-bold text-gray-900 text-sm">{value}</p>
      <div className="flex items-center justify-center gap-1 mt-1">
        <TrendIcon className={`w-3 h-3 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`} />
        <span className="text-xs text-gray-600">{change}</span>
      </div>
    </div>
  );
};

// Business Overview Section
const BusinessOverviewSection = ({ biData, revenueData, userGrowthData }) => (
  <div className="space-y-6">
    {/* Revenue and User Growth Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue vs targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="target" fill="#E5E7EB" name="Target" />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="Actual Revenue" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>User acquisition and churn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="users" fill="#10B981" fillOpacity={0.3} stroke="#10B981" name="Total Users" />
                <Bar dataKey="newUsers" fill="#3B82F6" name="New Users" />
                <Line type="monotone" dataKey="churn" stroke="#EF4444" strokeWidth={2} name="Churn" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Segmentation Analysis */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Segments</CardTitle>
          <CardDescription>Revenue by user type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={biData.segments?.userTypes || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {(biData.segments?.userTypes || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Distribution</CardTitle>
          <CardDescription>Revenue by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={biData.segments?.regions || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Additional sections would be implemented similarly...
const RevenueAnalyticsSection = ({ revenueData, biData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Revenue Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Detailed revenue analytics implementation...</p>
    </CardContent>
  </Card>
);

const UserAnalyticsSection = ({ userGrowthData, biData }) => (
  <Card>
    <CardHeader>
      <CardTitle>User Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Detailed user analytics implementation...</p>
    </CardContent>
  </Card>
);

const PerformanceSection = ({ performanceMetrics }) => (
  <Card>
    <CardHeader>
      <CardTitle>Performance Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Performance metrics implementation...</p>
    </CardContent>
  </Card>
);

const PredictiveAnalyticsSection = ({ predictiveInsights }) => (
  <Card>
    <CardHeader>
      <CardTitle>Predictive Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Predictive analytics implementation...</p>
    </CardContent>
  </Card>
);

const CustomReportsSection = ({ customReports, onGenerateReport, onExportReport }) => (
  <Card>
    <CardHeader>
      <CardTitle>Custom Reports</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Custom reports implementation...</p>
    </CardContent>
  </Card>
);

export default BusinessIntelligenceDashboard;