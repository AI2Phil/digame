import React, { useState, useEffect, useCallback } from 'react';
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
  refreshInterval = 30000
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

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API calls for performance data
      const mockMetrics: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          value: 2.34,
          unit: 's',
          status: 'warning',
          trend: 'up',
          change: 12.5,
          threshold: { warning: 2.0, critical: 3.0 }
        },
        {
          name: 'First Contentful Paint',
          value: 1.2,
          unit: 's',
          status: 'good',
          trend: 'down',
          change: -8.3,
          threshold: { warning: 1.8, critical: 2.5 }
        },
        {
          name: 'Time to Interactive',
          value: 3.1,
          unit: 's',
          status: 'critical',
          trend: 'up',
          change: 15.7,
          threshold: { warning: 2.5, critical: 3.0 }
        },
        {
          name: 'Cumulative Layout Shift',
          value: 0.08,
          unit: '',
          status: 'good',
          trend: 'stable',
          change: 0.2,
          threshold: { warning: 0.1, critical: 0.25 }
        },
        {
          name: 'API Response Time',
          value: 245,
          unit: 'ms',
          status: 'good',
          trend: 'down',
          change: -5.2,
          threshold: { warning: 300, critical: 500 }
        },
        {
          name: 'Database Query Time',
          value: 89,
          unit: 'ms',
          status: 'good',
          trend: 'stable',
          change: 1.1,
          threshold: { warning: 100, critical: 200 }
        },
        {
          name: 'Error Rate',
          value: 0.12,
          unit: '%',
          status: 'good',
          trend: 'down',
          change: -23.4,
          threshold: { warning: 0.5, critical: 1.0 }
        },
        {
          name: 'Bundle Size',
          value: 1.67,
          unit: 'MB',
          status: 'warning',
          trend: 'up',
          change: 8.9,
          threshold: { warning: 1.5, critical: 2.0 }
        }
      ];

      const mockSystemHealth: SystemHealth = {
        cpu: 45.2,
        memory: 67.8,
        disk: 23.4,
        network: 12.1,
        uptime: 99.97,
        activeConnections: 247,
        responseTime: 234,
        errorRate: 0.12
      };

      const mockAlerts: PerformanceAlert[] = [
        {
          id: '1',
          type: 'performance',
          severity: 'high',
          title: 'High Time to Interactive',
          description: 'TTI has increased by 15.7% in the last hour, affecting user experience',
          timestamp: new Date(Date.now() - 300000),
          component: 'Frontend',
          resolved: false,
          actions: [
            'Analyze bundle size and optimize',
            'Check for blocking resources',
            'Review third-party scripts'
          ]
        },
        {
          id: '2',
          type: 'resource',
          severity: 'medium',
          title: 'Memory Usage Above Threshold',
          description: 'Server memory usage is at 67.8%, approaching warning threshold',
          timestamp: new Date(Date.now() - 600000),
          component: 'Backend',
          resolved: false,
          actions: [
            'Monitor memory leaks',
            'Optimize caching strategy',
            'Consider scaling resources'
          ]
        },
        {
          id: '3',
          type: 'performance',
          severity: 'medium',
          title: 'Bundle Size Increase',
          description: 'Application bundle size has grown by 8.9% this week',
          timestamp: new Date(Date.now() - 1800000),
          component: 'Build System',
          resolved: false,
          actions: [
            'Run bundle analyzer',
            'Remove unused dependencies',
            'Implement code splitting'
          ]
        },
        {
          id: '4',
          type: 'error',
          severity: 'low',
          title: 'API Error Rate Decreased',
          description: 'Error rate has improved by 23.4% due to recent optimizations',
          timestamp: new Date(Date.now() - 3600000),
          component: 'API',
          resolved: true,
          actions: []
        }
      ];

      const mockOptimizations: PerformanceOptimization[] = [
        {
          id: '1',
          category: 'frontend',
          title: 'Implement Code Splitting',
          description: 'Split application code by routes to reduce initial bundle size',
          impact: 'high',
          effort: 'medium',
          estimatedImprovement: '30-40% faster initial load',
          status: 'pending',
          implementation: [
            'Configure React.lazy for route components',
            'Set up Suspense boundaries',
            'Optimize webpack splitChunks'
          ]
        },
        {
          id: '2',
          category: 'database',
          title: 'Add Database Indexes',
          description: 'Create indexes for frequently queried columns',
          impact: 'high',
          effort: 'low',
          estimatedImprovement: '50-70% faster queries',
          status: 'in_progress',
          implementation: [
            'Analyze slow query log',
            'Create composite indexes',
            'Monitor query performance'
          ]
        },
        {
          id: '3',
          category: 'backend',
          title: 'Implement Response Caching',
          description: 'Cache API responses to reduce server load',
          impact: 'medium',
          effort: 'medium',
          estimatedImprovement: '25-35% faster API responses',
          status: 'completed',
          implementation: [
            'Set up Redis cache',
            'Implement cache invalidation',
            'Add cache headers'
          ]
        },
        {
          id: '4',
          category: 'infrastructure',
          title: 'Enable CDN for Static Assets',
          description: 'Use CDN to serve static assets globally',
          impact: 'medium',
          effort: 'low',
          estimatedImprovement: '20-30% faster asset loading',
          status: 'pending',
          implementation: [
            'Configure CDN service',
            'Update asset URLs',
            'Set up cache policies'
          ]
        }
      ];

      setMetrics(mockMetrics);
      setSystemHealth(mockSystemHealth);
      setAlerts(mockAlerts);
      setOptimizations(mockOptimizations);
    } catch (err) {
      setError('Failed to fetch performance data');
      console.error('Performance monitoring error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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