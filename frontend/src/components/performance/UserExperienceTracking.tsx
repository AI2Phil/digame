import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Zap, 
  Eye, 
  MousePointer, 
  Smartphone, 
  Monitor, 
  Tablet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'poor';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  duration: number;
  pageViews: number;
  interactions: number;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  bounceRate: number;
  conversionEvents: number;
}

interface PagePerformance {
  path: string;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  visits: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface UserExperienceTrackingProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const UserExperienceTracking: React.FC<UserExperienceTrackingProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [pagePerformance, setPagePerformance] = useState<PagePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');

  // Core Web Vitals tracking
  const trackWebVitals = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetric[] = [
        {
          name: 'First Contentful Paint',
          value: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          unit: 'ms',
          threshold: 1800,
          status: 'good',
          trend: 'stable',
          change: 0
        },
        {
          name: 'Largest Contentful Paint',
          value: navigation.loadEventEnd - navigation.loadEventStart,
          unit: 'ms',
          threshold: 2500,
          status: 'good',
          trend: 'down',
          change: -5.2
        },
        {
          name: 'First Input Delay',
          value: Math.random() * 100,
          unit: 'ms',
          threshold: 100,
          status: 'good',
          trend: 'stable',
          change: 1.3
        },
        {
          name: 'Cumulative Layout Shift',
          value: Math.random() * 0.1,
          unit: '',
          threshold: 0.1,
          status: 'good',
          trend: 'up',
          change: 2.1
        }
      ];

      // Determine status based on thresholds
      metrics.forEach(metric => {
        if (metric.name === 'Cumulative Layout Shift') {
          metric.status = metric.value <= 0.1 ? 'good' : metric.value <= 0.25 ? 'warning' : 'poor';
        } else {
          metric.status = metric.value <= metric.threshold ? 'good' : 
                          metric.value <= metric.threshold * 1.5 ? 'warning' : 'poor';
        }
      });

      setMetrics(metrics);
    }
  }, []);

  // User interaction tracking
  const trackUserInteractions = useCallback(() => {
    const interactions = ['click', 'scroll', 'keydown', 'touchstart'];
    let interactionCount = 0;
    let lastInteractionTime = Date.now();

    const handleInteraction = (event: Event) => {
      interactionCount++;
      lastInteractionTime = Date.now();
      
      // Track specific interaction patterns
      if (event.type === 'click') {
        const target = event.target as HTMLElement;
        console.log('User clicked:', target.tagName, target.className);
      }
    };

    interactions.forEach(interaction => {
      document.addEventListener(interaction, handleInteraction, { passive: true });
    });

    return () => {
      interactions.forEach(interaction => {
        document.removeEventListener(interaction, handleInteraction);
      });
    };
  }, []);

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call for user sessions
      const mockSessions: UserSession[] = [
        {
          id: '1',
          userId: 'user_123',
          startTime: new Date(Date.now() - 3600000),
          duration: 1847,
          pageViews: 8,
          interactions: 45,
          device: 'desktop',
          browser: 'Chrome',
          location: 'San Francisco, CA',
          bounceRate: 0.25,
          conversionEvents: 2
        },
        {
          id: '2',
          userId: 'user_456',
          startTime: new Date(Date.now() - 7200000),
          duration: 892,
          pageViews: 3,
          interactions: 12,
          device: 'mobile',
          browser: 'Safari',
          location: 'New York, NY',
          bounceRate: 0.67,
          conversionEvents: 0
        },
        {
          id: '3',
          userId: 'user_789',
          startTime: new Date(Date.now() - 1800000),
          duration: 2341,
          pageViews: 12,
          interactions: 78,
          device: 'tablet',
          browser: 'Firefox',
          location: 'London, UK',
          bounceRate: 0.17,
          conversionEvents: 3
        }
      ];

      // Simulate API call for page performance
      const mockPagePerformance: PagePerformance[] = [
        {
          path: '/dashboard',
          loadTime: 1234,
          firstContentfulPaint: 892,
          largestContentfulPaint: 1456,
          cumulativeLayoutShift: 0.05,
          firstInputDelay: 23,
          timeToInteractive: 1678,
          visits: 2847,
          bounceRate: 0.23,
          avgSessionDuration: 1892
        },
        {
          path: '/analytics',
          loadTime: 2156,
          firstContentfulPaint: 1234,
          largestContentfulPaint: 2890,
          cumulativeLayoutShift: 0.12,
          firstInputDelay: 45,
          timeToInteractive: 3234,
          visits: 1456,
          bounceRate: 0.34,
          avgSessionDuration: 2341
        },
        {
          path: '/team',
          loadTime: 987,
          firstContentfulPaint: 567,
          largestContentfulPaint: 1123,
          cumulativeLayoutShift: 0.03,
          firstInputDelay: 12,
          timeToInteractive: 1345,
          visits: 3421,
          bounceRate: 0.18,
          avgSessionDuration: 2789
        }
      ];

      setSessions(mockSessions);
      setPagePerformance(mockPagePerformance);
    } catch (err) {
      setError('Failed to fetch performance data');
      console.error('Performance tracking error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange, selectedDevice]);

  useEffect(() => {
    trackWebVitals();
    trackUserInteractions();
    fetchPerformanceData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        trackWebVitals();
        fetchPerformanceData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [trackWebVitals, trackUserInteractions, fetchPerformanceData, autoRefresh, refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatMetricValue = (metric: PerformanceMetric) => {
    if (metric.name === 'Cumulative Layout Shift') {
      return metric.value.toFixed(3);
    }
    return Math.round(metric.value);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">User Experience Tracking</h2>
              <p className="text-sm text-gray-600">Real-time performance and user interaction monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Core Web Vitals */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Core Web Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
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
                  {formatMetricValue(metric)}{metric.unit}
                </div>
                <div className="text-sm text-gray-600">{metric.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Threshold: {metric.threshold}{metric.unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active User Sessions */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Active User Sessions</h3>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.device)}
                      <span className="text-sm font-medium text-gray-900">{session.userId}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.browser} • {session.location}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(session.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{session.pageViews} pages</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MousePointer className="w-4 h-4" />
                      <span>{session.interactions} interactions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>{session.conversionEvents} conversions</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="text-xs text-gray-500">
                    Bounce Rate: {(session.bounceRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Started: {session.startTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page Performance */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Page Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Load Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FCP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LCP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CLS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bounce Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagePerformance.map((page, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {page.path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.loadTime}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.firstContentfulPaint}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.largestContentfulPaint}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.cumulativeLayoutShift.toFixed(3)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.visits.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(page.bounceRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">247</div>
            <div className="text-xs text-blue-700">+12% from yesterday</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Avg Session Duration</span>
            </div>
            <div className="text-2xl font-bold text-green-900">4m 32s</div>
            <div className="text-xs text-green-700">+8% from yesterday</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Conversion Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">3.4%</div>
            <div className="text-xs text-purple-700">+0.3% from yesterday</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserExperienceTracking;