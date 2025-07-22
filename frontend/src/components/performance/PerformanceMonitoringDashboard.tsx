import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, replaceApiUrl } from '../../lib/api-config';

import {
  Activity,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Eye,
  Database,
  Package,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  BarChart3,
  PieChart,
  LineChart,
  Bell,
  Filter
} from 'lucide-react';
import { useToastHelpers } from '../ui/Toaster';
import UserExperienceTracking from './UserExperienceTracking';
import QueryOptimization from './QueryOptimization';
import BundleAnalyzer from './BundleAnalyzer';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
  threshold: {
    warning: number;
    critical: number;
  };
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
}

interface PerformanceAlert {
  id: string;
  type: 'performance' | 'error' | 'resource' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  component: string;
  resolved: boolean;
  actions: string[];
}

interface PerformanceOptimization {
  id: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: string;
  status: 'pending' | 'in_progress' | 'completed';
  implementation: string[];
}

interface PerformanceMonitoringDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const PerformanceMonitoringDashboard: React.FC<PerformanceMonitoringDashboardProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes instead of 30 seconds
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'ux' | 'queries' | 'bundle' | 'alerts'>('overview');
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [alertFilter, setAlertFilter] = useState<string>('all');
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const { success, error: showError, warning, info } = useToastHelpers();

  // Fetch performance data from database-driven API
  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallbackData(false);

      // Try multiple possible token keys for better compatibility
      const token = sessionStorage.getItem('accessToken') ||
                   sessionStorage.getItem('token') ||
                   localStorage.getItem('accessToken') ||
                   localStorage.getItem('token');

      if (!token) {
        console.log('No authentication token found, using fallback data');
        setUsingFallbackData(true);
        // Don't throw error, just use fallback data
      } else {
        // Fetch comprehensive performance monitoring data from database-driven API
        const response = await fetch(`${replaceApiUrl("")}/api/performance/monitoring-dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics(data.metrics || []);
          setSystemHealth(data.systemHealth || null);
          setAlerts(data.alerts || []);
          setOptimizations(data.optimizations || []);
          success('Performance monitoring data loaded successfully');
          return; // Exit early on success
        } else if (response.status === 429) {
          console.log('Rate limited, using fallback data');
          setUsingFallbackData(true);
        } else {
          console.log(`API error ${response.status}, using fallback data`);
          setUsingFallbackData(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch performance monitoring data:', err);
      setUsingFallbackData(true);
      warning(`Using sample data: ${err.message}`);
      
      // Enhanced fallback data with realistic Digame platform performance patterns
      const fallbackMetrics: PerformanceMetric[] = [
        {
          name: 'Digital Twin Load Time',
          value: 1.89,
          unit: 's',
          status: 'good',
          trend: 'down',
          change: -12.3,
          threshold: { warning: 2.0, critical: 3.0 }
        },
        {
          name: 'Analytics Dashboard FCP',
          value: 1.45,
          unit: 's',
          status: 'good',
          trend: 'stable',
          change: -2.1,
          threshold: { warning: 1.8, critical: 2.5 }
        },
        {
          name: 'Platform TTI',
          value: 2.67,
          unit: 's',
          status: 'warning',
          trend: 'up',
          change: 8.4,
          threshold: { warning: 2.5, critical: 3.5 }
        },
        {
          name: 'Layout Stability (CLS)',
          value: 0.045,
          unit: '',
          status: 'good',
          trend: 'down',
          change: -15.6,
          threshold: { warning: 0.1, critical: 0.25 }
        },
        {
          name: 'API Response Time',
          value: 189,
          unit: 'ms',
          status: 'good',
          trend: 'down',
          change: -8.7,
          threshold: { warning: 300, critical: 500 }
        },
        {
          name: 'Database Query Time',
          value: 67,
          unit: 'ms',
          status: 'good',
          trend: 'stable',
          change: 2.3,
          threshold: { warning: 100, critical: 200 }
        },
        {
          name: 'Platform Error Rate',
          value: 0.08,
          unit: '%',
          status: 'good',
          trend: 'down',
          change: -34.2,
          threshold: { warning: 0.5, critical: 1.0 }
        },
        {
          name: 'Bundle Size',
          value: 2.23,
          unit: 'MB',
          status: 'warning',
          trend: 'up',
          change: 15.6,
          threshold: { warning: 2.0, critical: 3.0 }
        }
      ];

      const fallbackSystemHealth: SystemHealth = {
        cpu: 34.7,
        memory: 58.2,
        disk: 19.8,
        network: 8.4,
        uptime: 99.94,
        activeConnections: 342,
        responseTime: 189,
        errorRate: 0.08
      };

      const fallbackAlerts: PerformanceAlert[] = [
        {
          id: 'alert_001',
          type: 'performance',
          severity: 'medium',
          title: 'Digital Twin Component Loading Slower',
          description: 'Digital twin dashboard components are taking 8.4% longer to become interactive, potentially affecting user experience',
          timestamp: new Date(Date.now() - 420000),
          component: 'Digital Twin Frontend',
          resolved: false,
          actions: [
            'Analyze digital twin component bundle size',
            'Implement lazy loading for AI/ML features',
            'Optimize TensorFlow.js loading strategy',
            'Review third-party chart library usage'
          ]
        },
        {
          id: 'alert_002',
          type: 'resource',
          severity: 'medium',
          title: 'Bundle Size Growth Detected',
          description: 'Application bundle size has increased by 15.6% over the past week, approaching warning threshold',
          timestamp: new Date(Date.now() - 1800000),
          component: 'Build System',
          resolved: false,
          actions: [
            'Run comprehensive bundle analysis',
            'Remove unused dependencies and imports',
            'Implement advanced code splitting strategies',
            'Optimize vendor chunk splitting'
          ]
        },
        {
          id: 'alert_003',
          type: 'performance',
          severity: 'low',
          title: 'Analytics Dashboard Performance Improved',
          description: 'Recent optimizations have reduced analytics dashboard error rate by 34.2%',
          timestamp: new Date(Date.now() - 3600000),
          component: 'Analytics API',
          resolved: true,
          actions: []
        },
        {
          id: 'alert_004',
          type: 'performance',
          severity: 'low',
          title: 'Database Query Optimization Success',
          description: 'New indexes have improved query performance, maintaining stable response times',
          timestamp: new Date(Date.now() - 7200000),
          component: 'Database Layer',
          resolved: true,
          actions: []
        }
      ];

      const fallbackOptimizations: PerformanceOptimization[] = [
        {
          id: 'opt_001',
          category: 'frontend',
          title: 'Implement Advanced Code Splitting for Digital Twin Features',
          description: 'Split digital twin components by functionality and implement smart lazy loading for AI/ML features',
          impact: 'high',
          effort: 'medium',
          estimatedImprovement: '35-45% faster initial load for non-AI users',
          status: 'pending',
          implementation: [
            'Configure React.lazy for digital twin dashboard components',
            'Implement Suspense boundaries with intelligent loading states',
            'Split AI/ML libraries into separate chunks',
            'Optimize TensorFlow.js loading with dynamic imports'
          ]
        },
        {
          id: 'opt_002',
          category: 'database',
          title: 'Optimize Analytics Query Performance',
          description: 'Create specialized indexes for analytics queries and implement query result caching',
          impact: 'high',
          effort: 'low',
          estimatedImprovement: '60-75% faster analytics dashboard loading',
          status: 'in_progress',
          implementation: [
            'Analyze slow analytics queries',
            'Create composite indexes for time-series data',
            'Implement Redis caching for frequent analytics queries',
            'Optimize aggregation queries with materialized views'
          ]
        },
        {
          id: 'opt_003',
          category: 'backend',
          title: 'Enhance API Response Caching Strategy',
          description: 'Implement intelligent caching for platform APIs with cache invalidation strategies',
          impact: 'medium',
          effort: 'medium',
          estimatedImprovement: '30-40% faster API responses',
          status: 'completed',
          implementation: [
            'Set up Redis cache cluster',
            'Implement cache invalidation for real-time data',
            'Add cache headers for static content',
            'Optimize cache key strategies'
          ]
        },
        {
          id: 'opt_004',
          category: 'infrastructure',
          title: 'Deploy CDN for Platform Assets',
          description: 'Use CDN to serve static assets globally and implement asset optimization',
          impact: 'medium',
          effort: 'low',
          estimatedImprovement: '25-35% faster asset loading globally',
          status: 'pending',
          implementation: [
            'Configure CDN service for static assets',
            'Implement asset versioning and cache busting',
            'Optimize image formats and compression',
            'Set up geographic distribution policies'
          ]
        },
        {
          id: 'opt_005',
          category: 'frontend',
          title: 'Optimize Performance Monitoring Components',
          description: 'Implement lazy loading and optimize performance monitoring dashboard components',
          impact: 'medium',
          effort: 'low',
          estimatedImprovement: '20-30% faster performance dashboard loading',
          status: 'pending',
          implementation: [
            'Lazy load performance monitoring widgets',
            'Implement intersection observer for below-fold components',
            'Optimize chart library loading',
            'Use web workers for performance calculations'
          ]
        }
      ];

      setMetrics(fallbackMetrics);
      setSystemHealth(fallbackSystemHealth);
      setAlerts(fallbackAlerts);
      setOptimizations(fallbackOptimizations);
      setError(`Failed to load performance monitoring data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [success, warning]);

  useEffect(() => {
    fetchPerformanceData();

    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPerformanceData, autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-green-500" />;
      default:
        return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (alertFilter === 'all') return true;
    if (alertFilter === 'unresolved') return !alert.resolved;
    return alert.severity === alertFilter;
  });

  const formatValue = (metric: PerformanceMetric) => {
    if (metric.name === 'Cumulative Layout Shift') {
      return metric.value.toFixed(3);
    }
    return metric.value.toFixed(metric.unit === 'ms' ? 0 : 2);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Monitoring Dashboard</h1>
              <p className="text-gray-600">Real-time performance metrics and optimization insights</p>
              {usingFallbackData && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                  Demo Data
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Auto-optimize:</span>
              <button
                onClick={() => setAutoOptimize(!autoOptimize)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoOptimize ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoOptimize ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={fetchPerformanceData}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'ux', label: 'User Experience', icon: <Eye className="w-4 h-4" /> },
              { id: 'queries', label: 'Query Optimization', icon: <Database className="w-4 h-4" /> },
              { id: 'bundle', label: 'Bundle Analysis', icon: <Package className="w-4 h-4" /> },
              { id: 'alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(metric.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-xs ${metric.trend === 'up' ? 'text-red-500' : metric.trend === 'down' ? 'text-green-500' : 'text-gray-500'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatValue(metric)}{metric.unit}
                </div>
                <div className="text-sm text-gray-600">{metric.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Warning: {metric.threshold.warning}{metric.unit} | Critical: {metric.threshold.critical}{metric.unit}
                </div>
              </div>
            ))}
          </div>

          {/* System Health */}
          {systemHealth && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{systemHealth.cpu.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">CPU Usage</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Monitor className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{systemHealth.memory.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Memory Usage</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <HardDrive className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{systemHealth.disk.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Disk Usage</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Wifi className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{systemHealth.uptime.toFixed(2)}%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Optimization Recommendations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
            <div className="space-y-4">
              {optimizations.slice(0, 3).map((opt) => (
                <div key={opt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(opt.impact)}`}>
                          {opt.impact} impact
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(opt.status)}`}>
                          {opt.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">{opt.category}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{opt.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{opt.description}</p>
                      <p className="text-sm text-green-600 font-medium">
                        Expected improvement: {opt.estimatedImprovement}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Experience Tab */}
      {selectedView === 'ux' && (
        <UserExperienceTracking className="w-full" />
      )}

      {/* Query Optimization Tab */}
      {selectedView === 'queries' && (
        <QueryOptimization className="w-full" />
      )}

      {/* Bundle Analysis Tab */}
      {selectedView === 'bundle' && (
        <BundleAnalyzer className="w-full" />
      )}

      {/* Alerts Tab */}
      {selectedView === 'alerts' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Alerts</h3>
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={alertFilter}
                onChange={(e) => setAlertFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Alerts</option>
                <option value="unresolved">Unresolved</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-4 ${alert.resolved ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {alert.type}
                      </span>
                      <span className="text-xs text-gray-500">{alert.component}</span>
                      {alert.resolved && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Resolved
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>

                {alert.actions.length > 0 && !alert.resolved && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-900 mb-2">Recommended Actions:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {alert.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitoringDashboard;