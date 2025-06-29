import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Activity, AlertTriangle, CheckCircle, XCircle, Clock,
  TrendingUp, TrendingDown, Zap, Shield, Database,
  Server, Wifi, HardDrive, Cpu, MemoryStick, Globe,
  Bell, Settings, Filter, RefreshCw, Download,
  Eye, Play, Pause, BarChart3, LineChart, PieChart,
  AlertCircle, Info, AlertTriangle as Warning, Minus, Plus, Search
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'system' | 'security' | 'performance' | 'application' | 'network';
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  affected_services: string[];
  metrics?: {
    current_value: number;
    threshold: number;
    unit: string;
  };
}

interface SystemMetric {
  id: string;
  name: string;
  category: 'infrastructure' | 'application' | 'business';
  current_value: number;
  previous_value: number;
  threshold_warning: number;
  threshold_critical: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  last_updated: string;
}

interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  notification_channels: string[];
  cooldown_period: number;
}

interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  response_time: number;
  error_rate: number;
  last_check: string;
  dependencies: string[];
  endpoints: {
    url: string;
    status: number;
    response_time: number;
  }[];
}

export const AdvancedMonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'metrics' | 'services' | 'rules'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'healthy' | 'degraded' | 'down'>('all');

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [rules, setRules] = useState<MonitoringRule[]>([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAlerts([
          {
            id: '1',
            title: 'High CPU Usage',
            description: 'CPU usage has exceeded 85% for the past 5 minutes',
            severity: 'high',
            category: 'system',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            status: 'active',
            source: 'web-server-01',
            affected_services: ['web-api', 'user-service'],
            metrics: { current_value: 87.5, threshold: 85, unit: '%' }
          },
          {
            id: '2',
            title: 'Database Connection Pool Exhausted',
            description: 'All database connections are in use',
            severity: 'critical',
            category: 'application',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            status: 'acknowledged',
            source: 'database-cluster',
            affected_services: ['user-service', 'order-service', 'payment-service']
          },
          {
            id: '3',
            title: 'SSL Certificate Expiring Soon',
            description: 'SSL certificate for api.digame.com expires in 7 days',
            severity: 'medium',
            category: 'security',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'active',
            source: 'certificate-monitor',
            affected_services: ['web-api']
          },
          {
            id: '4',
            title: 'Disk Space Low',
            description: 'Available disk space is below 15%',
            severity: 'high',
            category: 'system',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            status: 'active',
            source: 'storage-server-02',
            affected_services: ['file-service', 'backup-service'],
            metrics: { current_value: 12.3, threshold: 15, unit: '%' }
          }
        ]);

        setMetrics([
          {
            id: '1',
            name: 'CPU Usage',
            category: 'infrastructure',
            current_value: 67.5,
            previous_value: 62.1,
            threshold_warning: 75,
            threshold_critical: 90,
            unit: '%',
            trend: 'up',
            status: 'healthy',
            last_updated: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Memory Usage',
            category: 'infrastructure',
            current_value: 78.2,
            previous_value: 75.8,
            threshold_warning: 80,
            threshold_critical: 95,
            unit: '%',
            trend: 'up',
            status: 'warning',
            last_updated: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Response Time',
            category: 'application',
            current_value: 245,
            previous_value: 198,
            threshold_warning: 500,
            threshold_critical: 1000,
            unit: 'ms',
            trend: 'up',
            status: 'healthy',
            last_updated: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Error Rate',
            category: 'application',
            current_value: 0.8,
            previous_value: 1.2,
            threshold_warning: 2,
            threshold_critical: 5,
            unit: '%',
            trend: 'down',
            status: 'healthy',
            last_updated: new Date().toISOString()
          },
          {
            id: '5',
            name: 'Active Users',
            category: 'business',
            current_value: 1247,
            previous_value: 1189,
            threshold_warning: 2000,
            threshold_critical: 2500,
            unit: 'users',
            trend: 'up',
            status: 'healthy',
            last_updated: new Date().toISOString()
          },
          {
            id: '6',
            name: 'Database Connections',
            category: 'infrastructure',
            current_value: 45,
            previous_value: 38,
            threshold_warning: 80,
            threshold_critical: 95,
            unit: 'connections',
            trend: 'up',
            status: 'healthy',
            last_updated: new Date().toISOString()
          }
        ]);

        setServices([
          {
            id: '1',
            name: 'Web API',
            status: 'healthy',
            uptime: 99.97,
            response_time: 245,
            error_rate: 0.8,
            last_check: new Date().toISOString(),
            dependencies: ['database', 'redis', 'auth-service'],
            endpoints: [
              { url: '/api/health', status: 200, response_time: 45 },
              { url: '/api/users', status: 200, response_time: 123 },
              { url: '/api/orders', status: 200, response_time: 189 }
            ]
          },
          {
            id: '2',
            name: 'User Service',
            status: 'degraded',
            uptime: 98.5,
            response_time: 567,
            error_rate: 2.1,
            last_check: new Date().toISOString(),
            dependencies: ['database', 'auth-service'],
            endpoints: [
              { url: '/users/health', status: 200, response_time: 234 },
              { url: '/users/profile', status: 500, response_time: 1200 }
            ]
          },
          {
            id: '3',
            name: 'Payment Service',
            status: 'healthy',
            uptime: 99.99,
            response_time: 156,
            error_rate: 0.1,
            last_check: new Date().toISOString(),
            dependencies: ['database', 'external-payment-gateway'],
            endpoints: [
              { url: '/payments/health', status: 200, response_time: 67 },
              { url: '/payments/process', status: 200, response_time: 234 }
            ]
          },
          {
            id: '4',
            name: 'Notification Service',
            status: 'down',
            uptime: 95.2,
            response_time: 0,
            error_rate: 100,
            last_check: new Date().toISOString(),
            dependencies: ['redis', 'email-service', 'sms-service'],
            endpoints: [
              { url: '/notifications/health', status: 503, response_time: 0 }
            ]
          }
        ]);

        setRules([
          {
            id: '1',
            name: 'High CPU Usage',
            description: 'Alert when CPU usage exceeds threshold',
            metric: 'cpu_usage',
            condition: 'greater_than',
            threshold: 85,
            severity: 'high',
            enabled: true,
            notification_channels: ['email', 'slack', 'pagerduty'],
            cooldown_period: 300
          },
          {
            id: '2',
            name: 'Low Disk Space',
            description: 'Alert when disk space falls below threshold',
            metric: 'disk_usage',
            condition: 'less_than',
            threshold: 15,
            severity: 'critical',
            enabled: true,
            notification_channels: ['email', 'slack', 'pagerduty'],
            cooldown_period: 600
          },
          {
            id: '3',
            name: 'High Error Rate',
            description: 'Alert when application error rate is too high',
            metric: 'error_rate',
            condition: 'greater_than',
            threshold: 5,
            severity: 'high',
            enabled: true,
            notification_channels: ['email', 'slack'],
            cooldown_period: 180
          }
        ]);

        setError(null);
      } catch (err) {
        setError('Failed to load monitoring data');
        console.error('Error fetching monitoring data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoringData();

    // Set up auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMonitoringData, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'info': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'degraded': return 'text-orange-600 bg-orange-100';
      case 'down': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return Warning;
      case 'low': return Info;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return Warning;
      case 'critical': return XCircle;
      case 'degraded': return AlertTriangle;
      case 'down': return XCircle;
      case 'maintenance': return Settings;
      default: return Minus;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const handleAlertAction = async (alertId: string, action: 'acknowledge' | 'resolve') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: action === 'acknowledge' ? 'acknowledged' : 'resolved' }
          : alert
      ));
    } catch (err) {
      console.error('Error updating alert:', err);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (alertFilter === 'all') return true;
    return alert.severity === alertFilter;
  });

  const filteredServices = services.filter(service => {
    if (serviceFilter === 'all') return true;
    return service.status === serviceFilter;
  });

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.status === 'active').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Up</p>
                <p className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.status === 'healthy').length}/{services.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-blue-600">245ms</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-green-600">99.97%</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Critical Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.filter(a => a.severity === 'critical' && a.status === 'active').map((alert) => {
              const SeverityIcon = getSeverityIcon(alert.severity);
              return (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                  <div className="flex items-center gap-3">
                    <SeverityIcon className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()} • {alert.source}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="error" size="sm" icon={null} onRemove={() => {}}>
                      {alert.severity}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleAlertAction(alert.id, 'acknowledge')}>
                      Acknowledge
                    </Button>
                  </div>
                </div>
              );
            })}
            {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No critical alerts</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.filter(m => m.category === 'infrastructure').map((metric) => {
                const TrendIcon = getTrendIcon(metric.trend);
                const StatusIcon = getStatusIcon(metric.status);
                return (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status).split(' ')[0]}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        <p className="text-sm text-gray-600">
                          {metric.current_value}{metric.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendIcon className={`h-4 w-4 ${metric.trend === 'up' ? 'text-red-500' : 'text-green-500'}`} />
                      <Badge 
                        variant={metric.status === 'healthy' ? 'success' : metric.status === 'warning' ? 'warning' : 'error'} 
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.filter(m => m.category === 'application').map((metric) => {
                const TrendIcon = getTrendIcon(metric.trend);
                const StatusIcon = getStatusIcon(metric.status);
                return (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status).split(' ')[0]}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        <p className="text-sm text-gray-600">
                          {metric.current_value}{metric.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendIcon className={`h-4 w-4 ${metric.trend === 'up' ? 'text-red-500' : 'text-green-500'}`} />
                      <Badge 
                        variant={metric.status === 'healthy' ? 'success' : metric.status === 'warning' ? 'warning' : 'error'} 
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-6">
      {/* Alert Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by severity:</span>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
              <Button
                key={severity}
                size="sm"
                variant={alertFilter === severity ? 'primary' : 'outline'}
                onClick={() => setAlertFilter(severity as any)}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const SeverityIcon = getSeverityIcon(alert.severity);
          return (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <SeverityIcon className={`h-5 w-5 mt-0.5 ${getSeverityColor(alert.severity).split(' ')[0]}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <Badge 
                          variant={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'} 
                          size="sm"
                          icon={null}
                          onRemove={() => {}}
                        >
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                          {alert.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        <span>Source: {alert.source}</span>
                        <span>Services: {alert.affected_services.join(', ')}</span>
                      </div>
                      {alert.metrics && (
                        <div className="mt-2 text-xs text-gray-600">
                          Current: {alert.metrics.current_value}{alert.metrics.unit} | 
                          Threshold: {alert.metrics.threshold}{alert.metrics.unit}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={alert.status === 'active' ? 'error' : alert.status === 'acknowledged' ? 'warning' : 'success'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {alert.status}
                    </Badge>
                    {alert.status === 'active' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleAlertAction(alert.id, 'acknowledge')}>
                          Acknowledge
                        </Button>
                        <Button size="sm" onClick={() => handleAlertAction(alert.id, 'resolve')}>
                          Resolve
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      {/* Metrics Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['infrastructure', 'application', 'business'].map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category} Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.filter(m => m.category === category).map((metric) => {
                  const TrendIcon = getTrendIcon(metric.trend);
                  const StatusIcon = getStatusIcon(metric.status);
                  const progressPercentage = Math.min((metric.current_value / metric.threshold_critical) * 100, 100);
                  
                  return (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status).split(' ')[0]}`} />
                          <span className="font-medium text-gray-900">{metric.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendIcon className={`h-4 w-4 ${metric.trend === 'up' ? 'text-red-500' : 'text-green-500'}`} />
                          <span className="text-sm font-medium">
                            {metric.current_value}{metric.unit}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.status === 'healthy' ? 'bg-green-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Warning: {metric.threshold_warning}{metric.unit}</span>
                        <span>Critical: {metric.threshold_critical}{metric.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Metrics trends chart</p>
              <p className="text-sm text-gray-500">Real-time metrics visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderServicesTab = () => (
    <div className="space-y-6">
      {/* Service Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'healthy', 'degraded', 'down'].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={serviceFilter === status ? 'primary' : 'outline'}
                onClick={() => setServiceFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <Button size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service) => {
          const StatusIcon = getStatusIcon(service.status);
          return (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(service.status).split(' ')[0]}`} />
                    {service.name}
                  </CardTitle>
                  <Badge
                    variant={service.status === 'healthy' ? 'success' : service.status === 'degraded' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {service.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Uptime:</span>
                    <span className="ml-2 font-medium">{service.uptime}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Response:</span>
                    <span className="ml-2 font-medium">{service.response_time}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Error Rate:</span>
                    <span className="ml-2 font-medium">{service.error_rate}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                  <div className="flex flex-wrap gap-1">
                    {service.dependencies.map((dep) => (
                      <Badge key={dep} variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Endpoints</h4>
                  <div className="space-y-2">
                    {service.endpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-gray-600">{endpoint.url}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={endpoint.status === 200 ? 'success' : 'error'}
                            size="xs"
                            icon={null}
                            onRemove={() => {}}
                          >
                            {endpoint.status}
                          </Badge>
                          <span className="text-gray-500">{endpoint.response_time}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderRulesTab = () => (
    <div className="space-y-6">
      {/* Rules Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Monitoring Rules</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <Badge
                      variant={rule.severity === 'critical' ? 'error' : rule.severity === 'high' ? 'warning' : 'info'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {rule.severity}
                    </Badge>
                    <Badge
                      variant={rule.enabled ? 'success' : 'secondary'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                  <div className="text-xs text-gray-500">
                    <span>Metric: {rule.metric} {rule.condition.replace('_', ' ')} {rule.threshold}</span>
                    <span className="ml-4">Cooldown: {rule.cooldown_period}s</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rule.notification_channels.map((channel) => (
                      <Badge key={channel} variant="outline" size="xs" icon={null} onRemove={() => {}}>
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    {rule.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Monitoring Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Advanced Monitoring</h1>
              <p className="text-gray-600">Real-time system monitoring and alerting</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Auto-refresh:</span>
                <Button
                  size="sm"
                  variant={autoRefresh ? 'primary' : 'outline'}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                  <option value={900}>15m</option>
                </select>
              </div>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
                { id: 'metrics', label: 'Metrics', icon: BarChart3 },
                { id: 'services', label: 'Services', icon: Server },
                { id: 'rules', label: 'Rules', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'metrics' && renderMetricsTab()}
          {activeTab === 'services' && renderServicesTab()}
          {activeTab === 'rules' && renderRulesTab()}
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedAlert.title}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedAlert.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Severity</h4>
                  <Badge
                    variant={selectedAlert.severity === 'critical' ? 'error' : selectedAlert.severity === 'high' ? 'warning' : 'info'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                  <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                    {selectedAlert.category}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Source</h4>
                  <p className="text-gray-600">{selectedAlert.source}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Timestamp</h4>
                  <p className="text-gray-600">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Affected Services</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAlert.affected_services.map((service) => (
                    <Badge key={service} variant="outline" size="sm" icon={null} onRemove={() => {}}>
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedAlert.metrics && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Metrics</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">
                      Current Value: <span className="font-medium">{selectedAlert.metrics.current_value}{selectedAlert.metrics.unit}</span>
                    </p>
                    <p className="text-sm">
                      Threshold: <span className="font-medium">{selectedAlert.metrics.threshold}{selectedAlert.metrics.unit}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
                {selectedAlert.status === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleAlertAction(selectedAlert.id, 'acknowledge');
                        setSelectedAlert(null);
                      }}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      onClick={() => {
                        handleAlertAction(selectedAlert.id, 'resolve');
                        setSelectedAlert(null);
                      }}
                    >
                      Resolve
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};