import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Activity,
  Zap,
  Globe,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const HealthMonitoringDashboard = ({ connections = [] }) => {
  const [healthData, setHealthData] = useState({});
  const [systemMetrics, setSystemMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [connections]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Mock health data - replace with actual API calls
      const mockHealthData = connections.reduce((acc, connection) => {
        const baseHealth = {
          status: connection.health_status || 'healthy',
          response_time: Math.floor(Math.random() * 500) + 100,
          uptime: 99.5 + Math.random() * 0.5,
          error_rate: Math.random() * 2,
          last_check: new Date().toISOString(),
          checks: {
            connectivity: Math.random() > 0.1,
            authentication: Math.random() > 0.05,
            rate_limits: Math.random() > 0.15,
            data_sync: Math.random() > 0.08
          }
        };
        acc[connection.id] = baseHealth;
        return acc;
      }, {});

      const mockSystemMetrics = {
        overall_health: 98.7,
        total_requests: 45672,
        successful_requests: 44891,
        failed_requests: 781,
        avg_response_time: 245,
        peak_response_time: 1250,
        active_connections: connections.filter(c => c.is_active).length,
        total_connections: connections.length,
        webhook_success_rate: 99.2,
        data_sync_success_rate: 97.8
      };

      const mockAlerts = [
        {
          id: 1,
          type: 'warning',
          title: 'High Response Time',
          message: 'GitHub API response time is above normal (850ms avg)',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          connection_id: connections.find(c => c.provider_name === 'GitHub')?.id
        },
        {
          id: 2,
          type: 'info',
          title: 'Rate Limit Approaching',
          message: 'Slack API usage at 80% of rate limit',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          connection_id: connections.find(c => c.provider_name === 'Slack')?.id
        }
      ];

      setHealthData(mockHealthData);
      setSystemMetrics(mockSystemMetrics);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseTimeColor = (responseTime) => {
    if (responseTime < 200) return 'text-green-600';
    if (responseTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUptimeColor = (uptime) => {
    if (uptime >= 99.5) return 'text-green-600';
    if (uptime >= 99.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Health</p>
                <p className="text-2xl font-bold">{systemMetrics.overall_health}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={systemMetrics.overall_health} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className={`text-2xl font-bold ${getResponseTimeColor(systemMetrics.avg_response_time)}`}>
                  {systemMetrics.avg_response_time}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold">
                  {systemMetrics.active_connections}/{systemMetrics.total_connections}
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {((systemMetrics.successful_requests / systemMetrics.total_requests) * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Health Status</CardTitle>
          <CardDescription>Real-time health monitoring for all integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((connection) => {
              const health = healthData[connection.id] || {};
              return (
                <div key={connection.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getHealthIcon(health.status)}
                      <div>
                        <h4 className="font-semibold">{connection.display_name}</h4>
                        <p className="text-sm text-gray-600">{connection.provider_name}</p>
                      </div>
                    </div>
                    <Badge className={getHealthColor(health.status)}>
                      {health.status || 'unknown'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Response Time</p>
                      <p className={`font-semibold ${getResponseTimeColor(health.response_time)}`}>
                        {health.response_time}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className={`font-semibold ${getUptimeColor(health.uptime)}`}>
                        {health.uptime?.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Error Rate</p>
                      <p className="font-semibold text-red-600">
                        {health.error_rate?.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Check</p>
                      <p className="font-semibold text-gray-700">
                        {health.last_check ? formatDate(health.last_check) : 'Never'}
                      </p>
                    </div>
                  </div>

                  {health.checks && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(health.checks).map(([check, status]) => (
                        <div key={check} className="flex items-center space-x-2">
                          {status ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-xs capitalize">{check.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Systems Operational</h3>
              <p className="text-gray-600">No active alerts or issues detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const connection = connections.find(c => c.id === alert.connection_id);
                return (
                  <Alert key={alert.id}>
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(alert.timestamp)}
                          </span>
                        </div>
                        <AlertDescription className="mb-1">
                          {alert.message}
                        </AlertDescription>
                        {connection && (
                          <p className="text-xs text-gray-500">
                            Connection: {connection.display_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>API request statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Requests</span>
                <span className="font-bold">{systemMetrics.total_requests?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Successful</span>
                <span className="font-bold text-green-600">
                  {systemMetrics.successful_requests?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Failed</span>
                <span className="font-bold text-red-600">
                  {systemMetrics.failed_requests?.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm mb-1">
                  <span>Success Rate</span>
                  <span>{((systemMetrics.successful_requests / systemMetrics.total_requests) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(systemMetrics.successful_requests / systemMetrics.total_requests) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Response time and throughput</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg Response Time</span>
                <span className={`font-bold ${getResponseTimeColor(systemMetrics.avg_response_time)}`}>
                  {systemMetrics.avg_response_time}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Peak Response Time</span>
                <span className="font-bold text-red-600">
                  {systemMetrics.peak_response_time}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Webhook Success Rate</span>
                <span className="font-bold text-green-600">
                  {systemMetrics.webhook_success_rate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Data Sync Success Rate</span>
                <span className="font-bold text-green-600">
                  {systemMetrics.data_sync_success_rate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthMonitoringDashboard;