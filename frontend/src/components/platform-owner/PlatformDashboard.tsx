import React, { useState, useEffect } from 'react';
import {
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
  Zap
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

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/platform-owner/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.dashboard_data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <p>Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="text-gray-600">Real-time platform metrics and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

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