import React, { useState, useEffect } from 'react';
import { apiClient, replaceApiUrl } from '../../lib/api-config';

import {
  Brain,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Zap,
  Target,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Activity,
  Clock,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface IntelligenceMetrics {
  patterns_analyzed_today: number;
  predictions_generated_today: number;
  model_accuracy: {
    productivity: number;
    task_completion: number;
    energy_prediction: number;
  };
  average_confidence_score: number;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  response_time_avg: number;
  error_rate: number;
}

interface RecentActivity {
  timestamp: string;
  type: string;
  description: string;
}

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
  intelligence_metrics: IntelligenceMetrics;
  system_metrics: SystemMetrics;
  recent_activities: RecentActivity[];
}

const IntelligenceInsights: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Try multiple possible token keys for better compatibility
      const token = sessionStorage.getItem('accessToken') ||
                   sessionStorage.getItem('token') ||
                   localStorage.getItem('accessToken') ||
                   localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('${replaceApiUrl("")}/platform-owner/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.dashboard_data);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUsageColor = (usage: number, threshold: number = 80) => {
    if (usage >= threshold) return 'text-red-600';
    if (usage >= threshold * 0.7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (value: number, baseline: number = 0) => {
    if (value > baseline) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (value < baseline) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading intelligence insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Failed to Load Intelligence Insights</p>
          <p className="text-sm mb-4">{error}</p>
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

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">
          <Brain className="w-12 h-12 mx-auto mb-4" />
          <p>No intelligence data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-blue-600" />
              Intelligence Insights
            </h1>
            <p className="text-gray-600">Real-time analytics and intelligence metrics for the platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* System Health Status */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(dashboardData.overview.system_health)}`}>
          <Activity className="w-4 h-4 mr-2" />
          System Health: {dashboardData.overview.system_health.charAt(0).toUpperCase() + dashboardData.overview.system_health.slice(1)}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(dashboardData.overview.active_users_today)}</p>
              <p className="text-xs text-gray-500">of {formatNumber(dashboardData.overview.total_users)} total</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Digital Twins</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(dashboardData.overview.active_digital_twins)}</p>
              <p className="text-xs text-gray-500">of {formatNumber(dashboardData.overview.total_digital_twins)} total</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">API Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(dashboardData.overview.api_requests_today)}</p>
              <p className="text-xs text-gray-500">today</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">New Users</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.overview.new_users_this_week}</p>
              <p className="text-xs text-gray-500">this week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Intelligence Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Patterns Analyzed Today</span>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {dashboardData.intelligence_metrics.patterns_analyzed_today}
                </span>
                {getTrendIcon(dashboardData.intelligence_metrics.patterns_analyzed_today, 100)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Predictions Generated</span>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {dashboardData.intelligence_metrics.predictions_generated_today}
                </span>
                {getTrendIcon(dashboardData.intelligence_metrics.predictions_generated_today, 50)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Confidence</span>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {(dashboardData.intelligence_metrics.average_confidence_score * 100).toFixed(1)}%
                </span>
                {getTrendIcon(dashboardData.intelligence_metrics.average_confidence_score, 0.75)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            Model Accuracy
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Productivity Model</span>
                <span className="text-sm font-semibold text-gray-900">
                  {(dashboardData.intelligence_metrics.model_accuracy.productivity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData.intelligence_metrics.model_accuracy.productivity * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Task Completion Model</span>
                <span className="text-sm font-semibold text-gray-900">
                  {(dashboardData.intelligence_metrics.model_accuracy.task_completion * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData.intelligence_metrics.model_accuracy.task_completion * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Energy Prediction Model</span>
                <span className="text-sm font-semibold text-gray-900">
                  {(dashboardData.intelligence_metrics.model_accuracy.energy_prediction * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData.intelligence_metrics.model_accuracy.energy_prediction * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            System Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <div className="flex items-center">
                <span className={`text-lg font-semibold mr-2 ${getUsageColor(dashboardData.system_metrics.cpu_usage)}`}>
                  {dashboardData.system_metrics.cpu_usage.toFixed(1)}%
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${dashboardData.system_metrics.cpu_usage >= 80 ? 'bg-red-500' : dashboardData.system_metrics.cpu_usage >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(dashboardData.system_metrics.cpu_usage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <div className="flex items-center">
                <span className={`text-lg font-semibold mr-2 ${getUsageColor(dashboardData.system_metrics.memory_usage)}`}>
                  {dashboardData.system_metrics.memory_usage.toFixed(1)}%
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${dashboardData.system_metrics.memory_usage >= 80 ? 'bg-red-500' : dashboardData.system_metrics.memory_usage >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(dashboardData.system_metrics.memory_usage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Disk Usage</span>
              <div className="flex items-center">
                <span className={`text-lg font-semibold mr-2 ${getUsageColor(dashboardData.system_metrics.disk_usage)}`}>
                  {dashboardData.system_metrics.disk_usage.toFixed(1)}%
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${dashboardData.system_metrics.disk_usage >= 80 ? 'bg-red-500' : dashboardData.system_metrics.disk_usage >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(dashboardData.system_metrics.disk_usage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <div className="flex items-center">
                <span className={`text-lg font-semibold mr-2 ${dashboardData.system_metrics.response_time_avg > 500 ? 'text-red-600' : dashboardData.system_metrics.response_time_avg > 200 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {dashboardData.system_metrics.response_time_avg}ms
                </span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <div className="flex items-center">
                <span className={`text-lg font-semibold mr-2 ${dashboardData.system_metrics.error_rate > 0.05 ? 'text-red-600' : dashboardData.system_metrics.error_rate > 0.02 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {(dashboardData.system_metrics.error_rate * 100).toFixed(2)}%
                </span>
                {dashboardData.system_metrics.error_rate === 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Recent Activities
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData.recent_activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {activity.type === 'user_registration' && <Users className="w-4 h-4 text-blue-500 mt-0.5" />}
                  {activity.type === 'pattern_analysis' && <Brain className="w-4 h-4 text-purple-500 mt-0.5" />}
                  {activity.type === 'prediction_generated' && <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />}
                  {activity.type === 'system_optimization' && <Activity className="w-4 h-4 text-green-500 mt-0.5" />}
                  {activity.type === 'digital_twin_created' && <Brain className="w-4 h-4 text-indigo-500 mt-0.5" />}
                  {activity.type === 'intelligence_update' && <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5" />}
                  {activity.type === 'api_milestone' && <BarChart3 className="w-4 h-4 text-cyan-500 mt-0.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intelligence Insights Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-blue-600" />
          Intelligence Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {((dashboardData.intelligence_metrics.model_accuracy.productivity + 
                 dashboardData.intelligence_metrics.model_accuracy.task_completion + 
                 dashboardData.intelligence_metrics.model_accuracy.energy_prediction) / 3 * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Average Model Accuracy</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {dashboardData.intelligence_metrics.patterns_analyzed_today + dashboardData.intelligence_metrics.predictions_generated_today}
            </div>
            <div className="text-sm text-gray-600">Total AI Operations Today</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {dashboardData.overview.active_digital_twins}
            </div>
            <div className="text-sm text-gray-600">Active Digital Twins</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
          <p className="text-sm text-gray-700">
            <strong>Platform Status:</strong> The intelligence system is operating at optimal performance with 
            {' '}{(dashboardData.intelligence_metrics.average_confidence_score * 100).toFixed(1)}% average confidence. 
            All AI models are actively learning and improving prediction accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceInsights;