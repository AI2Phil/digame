import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  BarChart3, TrendingUp, Users, Activity, Clock, Globe,
  Smartphone, Monitor, Zap, Database, Server, Wifi,
  Eye, Download, RefreshCw, Filter, Calendar, Settings,
  ArrowUp, ArrowDown, Minus, AlertTriangle, CheckCircle
} from 'lucide-react';

interface PlatformMetrics {
  usage: {
    total_users: number;
    active_users_today: number;
    active_users_week: number;
    active_users_month: number;
    session_duration_avg: number;
    page_views_today: number;
    bounce_rate: number;
    retention_rate: number;
  };
  performance: {
    avg_response_time: number;
    uptime_percentage: number;
    error_rate: number;
    throughput_rps: number;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_io: number;
  };
  features: {
    most_used: Array<{ name: string; usage_count: number; growth: number }>;
    least_used: Array<{ name: string; usage_count: number; growth: number }>;
    new_features: Array<{ name: string; adoption_rate: number; release_date: string }>;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geography: {
    top_countries: Array<{ country: string; users: number; percentage: number }>;
    top_cities: Array<{ city: string; users: number; percentage: number }>;
  };
}

interface UsagePattern {
  id: string;
  pattern_name: string;
  description: string;
  frequency: string;
  impact: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
  affected_users: number;
}

interface OptimizationInsight {
  id: string;
  category: 'performance' | 'usage' | 'feature' | 'user_experience';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  potential_impact: string;
  implementation_effort: 'low' | 'medium' | 'high';
  estimated_improvement: string;
  action_items: string[];
}

interface FeatureAnalytics {
  feature_name: string;
  total_usage: number;
  unique_users: number;
  avg_session_time: number;
  completion_rate: number;
  error_rate: number;
  user_satisfaction: number;
  growth_rate: number;
  last_updated: string;
}

export const PlatformAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'performance' | 'features' | 'insights' | 'optimization'>('overview');
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  const [metrics, setMetrics] = useState<PlatformMetrics>({
    usage: {
      total_users: 12847,
      active_users_today: 3421,
      active_users_week: 8934,
      active_users_month: 11256,
      session_duration_avg: 24.5,
      page_views_today: 45678,
      bounce_rate: 23.4,
      retention_rate: 78.9
    },
    performance: {
      avg_response_time: 245,
      uptime_percentage: 99.97,
      error_rate: 0.12,
      throughput_rps: 1247,
      cpu_usage: 67.3,
      memory_usage: 72.1,
      disk_usage: 45.8,
      network_io: 234.5
    },
    features: {
      most_used: [
        { name: 'Dashboard Overview', usage_count: 15420, growth: 12.3 },
        { name: 'Analytics Reports', usage_count: 12890, growth: 8.7 },
        { name: 'User Management', usage_count: 9876, growth: 15.2 },
        { name: 'Security Monitoring', usage_count: 8765, growth: 22.1 },
        { name: 'Workflow Automation', usage_count: 7654, growth: 18.9 }
      ],
      least_used: [
        { name: 'Advanced Exports', usage_count: 234, growth: -5.2 },
        { name: 'API Testing', usage_count: 456, growth: 2.1 },
        { name: 'Custom Reports', usage_count: 567, growth: -1.8 }
      ],
      new_features: [
        { name: 'Real-time Collaboration', adoption_rate: 34.2, release_date: '2024-02-15' },
        { name: 'Advanced Search', adoption_rate: 28.7, release_date: '2024-02-20' },
        { name: 'PWA Features', adoption_rate: 19.3, release_date: '2024-02-25' }
      ]
    },
    devices: {
      desktop: 68.4,
      mobile: 23.7,
      tablet: 7.9
    },
    geography: {
      top_countries: [
        { country: 'United States', users: 4521, percentage: 35.2 },
        { country: 'United Kingdom', users: 2134, percentage: 16.6 },
        { country: 'Germany', users: 1876, percentage: 14.6 },
        { country: 'Canada', users: 1234, percentage: 9.6 },
        { country: 'Australia', users: 987, percentage: 7.7 }
      ],
      top_cities: [
        { city: 'New York', users: 1234, percentage: 9.6 },
        { city: 'London', users: 1098, percentage: 8.5 },
        { city: 'San Francisco', users: 987, percentage: 7.7 },
        { city: 'Toronto', users: 876, percentage: 6.8 },
        { city: 'Berlin', users: 765, percentage: 6.0 }
      ]
    }
  });

  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([
    {
      id: '1',
      pattern_name: 'Peak Usage Hours',
      description: 'Highest activity between 9 AM - 11 AM and 2 PM - 4 PM EST',
      frequency: 'Daily',
      impact: 'high',
      trend: 'stable',
      recommendation: 'Schedule maintenance outside peak hours',
      affected_users: 8934
    },
    {
      id: '2',
      pattern_name: 'Mobile Usage Growth',
      description: 'Mobile usage increasing by 15% month-over-month',
      frequency: 'Monthly',
      impact: 'medium',
      trend: 'increasing',
      recommendation: 'Optimize mobile experience and add mobile-specific features',
      affected_users: 3045
    },
    {
      id: '3',
      pattern_name: 'Feature Abandonment',
      description: 'Users dropping off during complex workflow setup',
      frequency: 'Weekly',
      impact: 'medium',
      trend: 'increasing',
      recommendation: 'Simplify onboarding flow and add guided tutorials',
      affected_users: 1234
    }
  ]);

  const [optimizationInsights, setOptimizationInsights] = useState<OptimizationInsight[]>([
    {
      id: '1',
      category: 'performance',
      title: 'Database Query Optimization',
      description: 'Several dashboard queries taking >2 seconds during peak hours',
      priority: 'high',
      potential_impact: '40% faster dashboard load times',
      implementation_effort: 'medium',
      estimated_improvement: '2.4s → 1.4s average response time',
      action_items: [
        'Add database indexes for frequently queried fields',
        'Implement query result caching',
        'Optimize N+1 query patterns'
      ]
    },
    {
      id: '2',
      category: 'user_experience',
      title: 'Mobile Navigation Enhancement',
      description: 'Mobile users have 35% higher bounce rate on complex pages',
      priority: 'medium',
      potential_impact: '25% reduction in mobile bounce rate',
      implementation_effort: 'high',
      estimated_improvement: '23.4% → 17.5% bounce rate',
      action_items: [
        'Redesign mobile navigation patterns',
        'Implement progressive disclosure',
        'Add touch-friendly interactions'
      ]
    },
    {
      id: '3',
      category: 'feature',
      title: 'Advanced Export Adoption',
      description: 'Low adoption rate for advanced export features (1.8% of users)',
      priority: 'low',
      potential_impact: 'Increased user engagement and data utilization',
      implementation_effort: 'low',
      estimated_improvement: '1.8% → 8.5% feature adoption',
      action_items: [
        'Add export feature discovery prompts',
        'Create tutorial videos',
        'Integrate export suggestions in workflows'
      ]
    }
  ]);

  const [featureAnalytics, setFeatureAnalytics] = useState<FeatureAnalytics[]>([
    {
      feature_name: 'Dashboard Overview',
      total_usage: 15420,
      unique_users: 8934,
      avg_session_time: 4.2,
      completion_rate: 94.5,
      error_rate: 0.8,
      user_satisfaction: 4.6,
      growth_rate: 12.3,
      last_updated: '2024-02-28'
    },
    {
      feature_name: 'Analytics Reports',
      total_usage: 12890,
      unique_users: 6745,
      avg_session_time: 8.7,
      completion_rate: 87.2,
      error_rate: 1.2,
      user_satisfaction: 4.4,
      growth_rate: 8.7,
      last_updated: '2024-02-28'
    },
    {
      feature_name: 'Security Monitoring',
      total_usage: 8765,
      unique_users: 3421,
      avg_session_time: 6.3,
      completion_rate: 91.8,
      error_rate: 0.5,
      user_satisfaction: 4.7,
      growth_rate: 22.1,
      last_updated: '2024-02-28'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setMetrics(prev => ({
        ...prev,
        usage: {
          ...prev.usage,
          active_users_today: prev.usage.active_users_today + Math.floor(Math.random() * 10),
          page_views_today: prev.usage.page_views_today + Math.floor(Math.random() * 50)
        },
        performance: {
          ...prev.performance,
          avg_response_time: prev.performance.avg_response_time + (Math.random() - 0.5) * 20,
          throughput_rps: prev.performance.throughput_rps + Math.floor((Math.random() - 0.5) * 100)
        }
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.usage.total_users.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  +12.3% from last month
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-green-600">{metrics.usage.active_users_today.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  +8.7% from yesterday
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.usage.session_duration_avg}m</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  +5.2% from last week
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{metrics.performance.uptime_percentage}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Excellent
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Server className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device & Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              Device Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.devices).map(([device, percentage]) => (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {device === 'desktop' && <Monitor className="h-4 w-4 text-gray-600" />}
                    {device === 'mobile' && <Smartphone className="h-4 w-4 text-gray-600" />}
                    {device === 'tablet' && <Monitor className="h-4 w-4 text-gray-600" />}
                    <span className="capitalize font-medium">{device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.geography.top_countries.slice(0, 5).map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{country.users.toLocaleString()}</span>
                    <span className="text-sm font-semibold">{country.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsagePatterns = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {usagePatterns.map((pattern) => (
          <Card key={pattern.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{pattern.pattern_name}</h3>
                    <Badge 
                      variant={pattern.impact === 'high' ? 'error' : pattern.impact === 'medium' ? 'warning' : 'success'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {pattern.impact} impact
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(pattern.trend)}
                      <span className="text-sm text-gray-600">{pattern.trend}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{pattern.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>Frequency: {pattern.frequency}</span>
                    <span>Affected Users: {pattern.affected_users.toLocaleString()}</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Recommendation:</strong> {pattern.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderOptimizationInsights = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {optimizationInsights.map((insight) => (
          <Card key={insight.id}>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <Badge 
                        variant={insight.priority === 'critical' ? 'error' : insight.priority === 'high' ? 'warning' : 'default'}
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {insight.priority}
                      </Badge>
                      <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                        {insight.category}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{insight.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-green-800">Potential Impact</p>
                    <p className="text-green-700">{insight.potential_impact}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="font-medium text-yellow-800">Implementation Effort</p>
                    <p className="text-yellow-700 capitalize">{insight.implementation_effort}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-800">Expected Improvement</p>
                    <p className="text-blue-700">{insight.estimated_improvement}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-2">Action Items:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {insight.action_items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFeatureAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {featureAnalytics.map((feature) => (
          <Card key={feature.feature_name}>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{feature.feature_name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={feature.growth_rate > 10 ? 'success' : feature.growth_rate > 0 ? 'warning' : 'error'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {feature.growth_rate > 0 ? '+' : ''}{feature.growth_rate}% growth
                    </Badge>
                    <span className="text-sm text-gray-500">Updated: {new Date(feature.last_updated).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{feature.total_usage.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Usage</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{feature.unique_users.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Unique Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{feature.avg_session_time}m</p>
                    <p className="text-sm text-gray-600">Avg Session</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{feature.completion_rate}%</p>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className={`text-sm font-semibold ${feature.error_rate < 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {feature.error_rate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">User Satisfaction</span>
                    <span className="text-sm font-semibold text-blue-600">{feature.user_satisfaction}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <span className={`text-sm font-semibold ${feature.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {feature.growth_rate > 0 ? '+' : ''}{feature.growth_rate}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics & Insights</h1>
          <p className="text-gray-600">Advanced analytics for platform usage and optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'usage', label: 'Usage Patterns', icon: TrendingUp },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'features', label: 'Feature Analytics', icon: Activity },
            { id: 'insights', label: 'Usage Insights', icon: Eye },
            { id: 'optimization', label: 'Optimization', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'usage' && renderUsagePatterns()}
        {activeTab === 'performance' && (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Analytics</h3>
            <p className="text-gray-600">Detailed performance metrics and optimization insights coming soon</p>
          </div>
        )}
        {activeTab === 'features' && renderFeatureAnalytics()}
        {activeTab === 'insights' && renderUsagePatterns()}
        {activeTab === 'optimization' && renderOptimizationInsights()}
      </div>
    </div>
  );
};

export default PlatformAnalyticsDashboard;