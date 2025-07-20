import React, { useState, useEffect } from 'react';
import { apiClient, replaceApiUrl } from '../../lib/api-config';

  Users,
  Activity,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Cpu,
  HardDrive,
  Zap,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';

interface DashboardData {
  overview: {
    total_users: number;
    active_users_today: number;
    new_users_this_week: number;
    total_digital_twins: number;
    active_digital_twins: number;
    api_requests_today: number;
    system_health: string;
  };
  intelligence_metrics: {
    patterns_analyzed_today: number;
    predictions_generated_today: number;
    model_accuracy: {
      productivity: number;
      task_completion: number;
      energy_prediction: number;
    };
    average_confidence_score: number;
  };
  system_metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    response_time_avg: number;
    error_rate: number;
  };
  recent_activities: Array<{
    timestamp: string;
    type: string;
    description: string;
  }>;
}

const PlatformDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<'database' | 'enhanced_fallback' | 'error'>('database');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Try to get backend service info first
      let backendUrl = 'http://localhost:8000';
      try {
        const serviceResponse = await fetch('${replaceApiUrl("/service-info")}');
        if (serviceResponse.ok) {
          const serviceInfo = await serviceResponse.json();
          backendUrl = serviceInfo.url || `http://localhost:${serviceInfo.port}`;
        }
      } catch (serviceError) {
        console.log('Using default backend URL');
      }

      const response = await fetch(`${backendUrl}/platform-owner/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.dashboard_data) {
          setDashboardData(data.dashboard_data);
          setDataSource(data.data_source || 'database');
          setLastUpdated(new Date());
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Use enhanced fallback data when API fails
      const fallbackData = generateEnhancedFallbackData();
      setDashboardData(fallbackData);
      setDataSource('enhanced_fallback');
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const generateEnhancedFallbackData = (): DashboardData => {
    const now = new Date();
    const variance = (base: number, range: number) => base + (Math.random() - 0.5) * range;
    
    return {
      overview: {
        total_users: Math.floor(variance(1250, 200)),
        active_users_today: Math.floor(variance(89, 30)),
        new_users_this_week: Math.floor(variance(23, 10)),
        total_digital_twins: Math.floor(variance(456, 80)),
        active_digital_twins: Math.floor(variance(234, 50)),
        api_requests_today: Math.floor(variance(12847, 3000)),
        system_health: Math.random() > 0.8 ? 'warning' : 'healthy'
      },
      intelligence_metrics: {
        patterns_analyzed_today: Math.floor(variance(156, 40)),
        predictions_generated_today: Math.floor(variance(89, 25)),
        model_accuracy: {
          productivity: Number(variance(0.85, 0.1).toFixed(2)),
          task_completion: Number(variance(0.78, 0.1).toFixed(2)),
          energy_prediction: Number(variance(0.82, 0.1).toFixed(2))
        },
        average_confidence_score: Number(variance(0.79, 0.1).toFixed(2))
      },
      system_metrics: {
        cpu_usage: Number(variance(45.2, 20).toFixed(1)),
        memory_usage: Number(variance(67.8, 20).toFixed(1)),
        disk_usage: Number(variance(34.1, 15).toFixed(1)),
        response_time_avg: Math.floor(variance(245, 100)),
        error_rate: Number(Math.max(0, variance(0.02, 0.03)).toFixed(3))
      },
      recent_activities: [
        {
          timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
          type: 'user_registration',
          description: `New user registered: user_${Math.floor(Math.random() * 9000) + 1000}`
        },
        {
          timestamp: new Date(now.getTime() - 12 * 60000).toISOString(),
          type: 'pattern_analysis',
          description: `Pattern analysis completed for ${Math.floor(variance(25, 20))} digital twins`
        },
        {
          timestamp: new Date(now.getTime() - 18 * 60000).toISOString(),
          type: 'prediction_generated',
          description: `Generated ${Math.floor(variance(40, 30))} productivity predictions`
        },
        {
          timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
          type: 'system_optimization',
          description: 'System performance optimization completed'
        },
        {
          timestamp: new Date(now.getTime() - 32 * 60000).toISOString(),
          type: 'digital_twin_created',
          description: `Digital twin created for user_${Math.floor(Math.random() * 9000) + 1000}`
        }
      ]
    };
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading platform dashboard...</span>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Unavailable</h3>
          <p className="text-gray-600 mb-4">Unable to load dashboard data</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getDataSourceIcon = () => {
    switch (dataSource) {
      case 'database':
        return <Database className="w-4 h-4 text-green-600" />;
      case 'enhanced_fallback':
        return <Wifi className="w-4 h-4 text-yellow-600" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-600" />;
    }
  };

  const getDataSourceText = () => {
    switch (dataSource) {
      case 'database':
        return 'Live Data';
      case 'enhanced_fallback':
        return 'Enhanced Demo Data';
      default:
        return 'Offline Mode';
    }
  };

  const getDataSourceColor = () => {
    switch (dataSource) {
      case 'database':
        return 'bg-green-100 text-green-800';
      case 'enhanced_fallback':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="text-gray-600">Real-time platform metrics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Data Source Indicator */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getDataSourceColor()}`}>
            {getDataSourceIcon()}
            <span>{getDataSourceText()}</span>
          </div>
          
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && dataSource === 'enhanced_fallback' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Using Enhanced Demo Data</h3>
              <p className="text-sm text-yellow-700 mt-1">
                API connection failed: {error}. Displaying realistic demo data with live variations.
              </p>
            </div>
          </div>
        </div>
      )}

      {dataSource === 'database' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Live Database Connection</h3>
              <p className="text-sm text-green-700 mt-1">
                Dashboard is displaying real-time data from the platform database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.overview.total_users)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">+{dashboardData.overview.new_users_this_week}</span>
            <span className="text-gray-500 ml-1">this week</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.overview.active_users_today)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              {formatPercentage((dashboardData.overview.active_users_today / dashboardData.overview.total_users) * 100)} of total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Digital Twins</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.overview.total_digital_twins)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-purple-600">{dashboardData.overview.active_digital_twins}</span>
            <span className="text-gray-500 ml-1">active</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">API Requests</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.overview.api_requests_today)}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">today</span>
          </div>
        </div>
      </div>

      {/* System Health & Intelligence Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(dashboardData.overview.system_health)}`}>
              {dashboardData.overview.system_health}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Cpu className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">CPU Usage</span>
              </div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(dashboardData.system_metrics.cpu_usage)}`}
                    style={{ width: `${dashboardData.system_metrics.cpu_usage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{formatPercentage(dashboardData.system_metrics.cpu_usage)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Memory Usage</span>
              </div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(dashboardData.system_metrics.memory_usage)}`}
                    style={{ width: `${dashboardData.system_metrics.memory_usage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{formatPercentage(dashboardData.system_metrics.memory_usage)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <HardDrive className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Disk Usage</span>
              </div>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(dashboardData.system_metrics.disk_usage)}`}
                    style={{ width: `${dashboardData.system_metrics.disk_usage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{formatPercentage(dashboardData.system_metrics.disk_usage)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="text-sm font-medium">{dashboardData.system_metrics.response_time_avg}ms</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-sm font-medium">{formatPercentage(dashboardData.system_metrics.error_rate)}</span>
            </div>
          </div>
        </div>

        {/* Intelligence Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Intelligence Metrics</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Patterns Analyzed Today</span>
              <span className="text-lg font-semibold text-blue-600">{dashboardData.intelligence_metrics.patterns_analyzed_today}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Predictions Generated</span>
              <span className="text-lg font-semibold text-green-600">{dashboardData.intelligence_metrics.predictions_generated_today}</span>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Model Accuracy</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Productivity</span>
                  <span className="text-sm font-medium">{formatPercentage(dashboardData.intelligence_metrics.model_accuracy.productivity * 100)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Task Completion</span>
                  <span className="text-sm font-medium">{formatPercentage(dashboardData.intelligence_metrics.model_accuracy.task_completion * 100)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Energy Prediction</span>
                  <span className="text-sm font-medium">{formatPercentage(dashboardData.intelligence_metrics.model_accuracy.energy_prediction * 100)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Confidence Score</span>
                <span className="text-lg font-semibold text-purple-600">{formatPercentage(dashboardData.intelligence_metrics.average_confidence_score * 100)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {dashboardData.recent_activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {activity.type === 'user_registration' && <Users className="w-4 h-4 text-blue-600" />}
                {activity.type === 'pattern_analysis' && <Brain className="w-4 h-4 text-purple-600" />}
                {activity.type === 'prediction_generated' && <TrendingUp className="w-4 h-4 text-green-600" />}
                {!['user_registration', 'pattern_analysis', 'prediction_generated'].includes(activity.type) && 
                  <Activity className="w-4 h-4 text-gray-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;