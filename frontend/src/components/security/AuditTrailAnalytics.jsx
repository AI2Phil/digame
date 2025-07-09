import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastHelpers } from '../ui/Toaster';
import {
  Search, Filter, Download, Calendar, Clock, User, 
  Activity, AlertTriangle, CheckCircle, Eye, BarChart3,
  TrendingUp, Database, Shield, Globe, Smartphone
} from 'lucide-react';

const AuditTrailAnalytics = () => {
  const toast = useToastHelpers();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // State for audit data
  const [auditOverview, setAuditOverview] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditMetrics, setAuditMetrics] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [systemEvents, setSystemEvents] = useState([]);
  const [complianceEvents, setComplianceEvents] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchAuditData();
  }, [dateRange, selectedUser, selectedEventType, selectedSeverity]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        date_range: dateRange,
        user_id: selectedUser !== 'all' ? selectedUser : '',
        event_type: selectedEventType !== 'all' ? selectedEventType : '',
        severity: selectedSeverity !== 'all' ? selectedSeverity : '',
        search: searchTerm
      });

      const [overviewResponse, logsResponse, metricsResponse, activityResponse] = await Promise.all([
        fetch(`http://localhost:8001/api/security/audit/overview?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`http://localhost:8001/api/security/audit/logs?${params}&limit=50`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`http://localhost:8001/api/security/audit/metrics?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`http://localhost:8001/api/security/audit/user-activity?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      let hasRealData = false;

      if (overviewResponse.ok) {
        const data = await overviewResponse.json();
        setAuditOverview(data.data || data);
        hasRealData = true;
      }

      if (logsResponse.ok) {
        const data = await logsResponse.json();
        setAuditLogs(data.data || data);
        hasRealData = true;
      }

      if (metricsResponse.ok) {
        const data = await metricsResponse.json();
        setAuditMetrics(data.data || data);
        hasRealData = true;
      }

      if (activityResponse.ok) {
        const data = await activityResponse.json();
        setUserActivity(data.data || data);
        hasRealData = true;
      }

      if (!hasRealData) {
        loadFallbackData();
        setUsingFallbackData(true);
        toast.info('Using sample audit data - API endpoints unavailable');
      } else {
        setUsingFallbackData(false);
      }

    } catch (error) {
      console.error('Failed to load audit data:', error);
      loadFallbackData();
      setUsingFallbackData(true);
      toast.error('Failed to load audit data - using sample data');
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Enhanced sample audit overview
    const sampleOverview = {
      total_events: 15847,
      events_today: 342,
      critical_events: 23,
      failed_logins: 156,
      successful_logins: 2847,
      data_access_events: 1234,
      configuration_changes: 89,
      policy_violations: 12,
      unique_users: 234,
      unique_ips: 156,
      event_trend: 8.5,
      top_event_types: [
        { type: 'login', count: 2847 },
        { type: 'data_access', count: 1234 },
        { type: 'logout', count: 2756 },
        { type: 'failed_login', count: 156 },
        { type: 'configuration_change', count: 89 }
      ]
    };

    // Enhanced sample audit logs
    const sampleLogs = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        user_id: 1,
        user_email: 'admin@company.com',
        event_type: 'configuration_change',
        event_category: 'system',
        severity: 'high',
        description: 'Security policy updated: Password complexity requirements',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        resource_accessed: '/admin/security/policies',
        action_taken: 'UPDATE',
        result: 'success',
        session_id: 'sess_abc123',
        metadata: {
          policy_id: 'pwd_policy_001',
          changes: ['min_length: 8 -> 12', 'require_special: true']
        }
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        user_id: 2,
        user_email: 'john.doe@company.com',
        event_type: 'data_access',
        event_category: 'data_access',
        severity: 'medium',
        description: 'Accessed sensitive customer data',
        ip_address: '192.168.1.45',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        resource_accessed: '/api/customers/sensitive',
        action_taken: 'READ',
        result: 'success',
        session_id: 'sess_def456',
        metadata: {
          records_accessed: 25,
          data_classification: 'confidential'
        }
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        user_id: null,
        user_email: 'unknown',
        event_type: 'failed_login',
        event_category: 'authentication',
        severity: 'high',
        description: 'Multiple failed login attempts detected',
        ip_address: '203.0.113.42',
        user_agent: 'curl/7.68.0',
        resource_accessed: '/auth/login',
        action_taken: 'LOGIN_ATTEMPT',
        result: 'failure',
        session_id: null,
        metadata: {
          attempt_count: 5,
          blocked: true,
          threat_detected: true
        }
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        user_id: 3,
        user_email: 'sarah.johnson@company.com',
        event_type: 'mfa_setup',
        event_category: 'authentication',
        severity: 'medium',
        description: 'Multi-factor authentication configured',
        ip_address: '192.168.1.78',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        resource_accessed: '/security/mfa/setup',
        action_taken: 'CREATE',
        result: 'success',
        session_id: 'sess_ghi789',
        metadata: {
          mfa_method: 'totp',
          device_registered: true
        }
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        user_id: 1,
        user_email: 'admin@company.com',
        event_type: 'user_permission_change',
        event_category: 'authorization',
        severity: 'critical',
        description: 'User permissions elevated to admin level',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        resource_accessed: '/admin/users/permissions',
        action_taken: 'UPDATE',
        result: 'success',
        session_id: 'sess_jkl012',
        metadata: {
          target_user: 'mike.wilson@company.com',
          old_role: 'user',
          new_role: 'admin',
          approval_required: true
        }
      }
    ];

    // Enhanced sample metrics
    const sampleMetrics = {
      hourly_distribution: [
        { hour: 0, count: 45 }, { hour: 1, count: 23 }, { hour: 2, count: 12 },
        { hour: 3, count: 8 }, { hour: 4, count: 15 }, { hour: 5, count: 34 },
        { hour: 6, count: 67 }, { hour: 7, count: 123 }, { hour: 8, count: 234 },
        { hour: 9, count: 345 }, { hour: 10, count: 298 }, { hour: 11, count: 267 },
        { hour: 12, count: 234 }, { hour: 13, count: 278 }, { hour: 14, count: 312 },
        { hour: 15, count: 289 }, { hour: 16, count: 245 }, { hour: 17, count: 198 },
        { hour: 18, count: 156 }, { hour: 19, count: 123 }, { hour: 20, count: 89 },
        { hour: 21, count: 67 }, { hour: 22, count: 45 }, { hour: 23, count: 34 }
      ],
      daily_trends: [
        { date: '2024-03-01', events: 1234, critical: 5 },
        { date: '2024-03-02', events: 1456, critical: 3 },
        { date: '2024-03-03', events: 1123, critical: 8 },
        { date: '2024-03-04', events: 1678, critical: 2 },
        { date: '2024-03-05', events: 1345, critical: 6 },
        { date: '2024-03-06', events: 1567, critical: 4 },
        { date: '2024-03-07', events: 1789, critical: 7 }
      ],
      severity_distribution: {
        critical: 23,
        high: 156,
        medium: 1234,
        low: 2847,
        info: 11587
      },
      top_users: [
        { user: 'admin@company.com', events: 234, risk_score: 85 },
        { user: 'john.doe@company.com', events: 189, risk_score: 45 },
        { user: 'sarah.johnson@company.com', events: 156, risk_score: 32 },
        { user: 'mike.wilson@company.com', events: 134, risk_score: 67 },
        { user: 'jane.smith@company.com', events: 123, risk_score: 28 }
      ],
      geographic_distribution: [
        { country: 'United States', count: 8945 },
        { country: 'Canada', count: 2341 },
        { country: 'United Kingdom', count: 1876 },
        { country: 'Germany', count: 1234 },
        { country: 'France', count: 987 }
      ]
    };

    // Enhanced sample user activity
    const sampleUserActivity = [
      {
        user_id: 1,
        user_email: 'admin@company.com',
        total_events: 234,
        login_count: 45,
        failed_login_count: 2,
        data_access_count: 89,
        config_changes: 23,
        last_activity: new Date(Date.now() - 300000).toISOString(),
        risk_score: 85,
        unusual_activity: true,
        locations: ['New York, US', 'London, UK'],
        devices: ['Windows Desktop', 'iPhone']
      },
      {
        user_id: 2,
        user_email: 'john.doe@company.com',
        total_events: 189,
        login_count: 34,
        failed_login_count: 1,
        data_access_count: 67,
        config_changes: 0,
        last_activity: new Date(Date.now() - 900000).toISOString(),
        risk_score: 45,
        unusual_activity: false,
        locations: ['San Francisco, US'],
        devices: ['MacBook Pro']
      }
    ];

    setAuditOverview(sampleOverview);
    setAuditLogs(sampleLogs);
    setAuditMetrics(sampleMetrics);
    setUserActivity(sampleUserActivity);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'info': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'login': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'logout': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'failed_login': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'data_access': return <Database className="h-4 w-4 text-purple-600" />;
      case 'configuration_change': return <Shield className="h-4 w-4 text-orange-600" />;
      case 'mfa_setup': return <Shield className="h-4 w-4 text-green-600" />;
      case 'user_permission_change': return <User className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
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
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-blue-600">{auditOverview?.total_events?.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{auditOverview?.event_trend}% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">{auditOverview?.critical_events}</p>
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
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-orange-600">{auditOverview?.failed_logins}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-green-600">{auditOverview?.unique_users}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Top Event Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditOverview?.top_event_types?.map((eventType, index) => (
                <div key={eventType.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventTypeIcon(eventType.type)}
                    <span className="font-medium capitalize">{eventType.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(eventType.count / Math.max(...auditOverview.top_event_types.map(t => t.count))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{eventType.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditMetrics?.geographic_distribution?.slice(0, 5).map((location) => (
                <div key={location.country} className="flex items-center justify-between">
                  <span className="font-medium">{location.country}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${(location.count / Math.max(...auditMetrics.geographic_distribution.map(l => l.count))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{location.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Severity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Event Severity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {auditMetrics?.severity_distribution && Object.entries(auditMetrics.severity_distribution).map(([severity, count]) => (
              <div key={severity} className="text-center">
                <div className={`text-2xl font-bold ${
                  severity === 'critical' ? 'text-red-600' :
                  severity === 'high' ? 'text-orange-600' :
                  severity === 'medium' ? 'text-yellow-600' :
                  severity === 'low' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">{severity}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Event Types</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="failed_login">Failed Login</option>
              <option value="data_access">Data Access</option>
              <option value="configuration_change">Config Change</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <Button onClick={fetchAuditData}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Audit Trail ({auditLogs.length} events)
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Timestamp</th>
                  <th className="text-left p-4 font-medium text-gray-900">User</th>
                  <th className="text-left p-4 font-medium text-gray-900">Event</th>
                  <th className="text-left p-4 font-medium text-gray-900">Severity</th>
                  <th className="text-left p-4 font-medium text-gray-900">IP Address</th>
                  <th className="text-left p-4 font-medium text-gray-900">Result</th>
                  <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{log.user_email || 'System'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(log.event_type)}
                        <div>
                          <div className="text-sm font-medium capitalize">{log.event_type.replace('_', ' ')}</div>
                          <div className="text-xs text-gray-500">{log.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={log.severity === 'critical' ? 'error' : log.severity === 'high' ? 'warning' : 'default'}
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {log.severity}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono">{log.ip_address}</span>
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={log.result === 'success' ? 'success' : 'error'}
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {log.result}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserActivity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Activity Analysis</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {userActivity.map((user) => (
          <Card key={user.user_id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.user_email}</h3>
                  <p className="text-sm text-gray-600">Last activity: {new Date(user.last_activity).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={user.risk_score >= 70 ? 'error' : user.risk_score >= 40 ? 'warning' : 'success'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    Risk: {user.risk_score}
                  </Badge>
                  {user.unusual_activity && (
                    <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                      Unusual Activity
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{user.total_events}</div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user.login_count}</div>
                  <div className="text-sm text-gray-600">Logins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{user.failed_login_count}</div>
                  <div className="text-sm text-gray-600">Failed Logins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.data_access_count}</div>
                  <div className="text-sm text-gray-600">Data Access</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Locations</h4>
                  <div className="space-y-1">
                    {user.locations.map((location, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span>{location}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Devices</h4>
                  <div className="space-y-1">
                    {user.devices.map((device, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Smartphone className="h-4 w-4 text-gray-400" />
                        <span>{device}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Hourly Activity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditMetrics?.hourly_distribution?.map((hour) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-12">{hour.hour}:00</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(hour.count / Math.max(...auditMetrics.hourly_distribution.map(h => h.count))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{hour.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Users by Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Top Users by Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditMetrics?.top_users?.map((user, index) => (
                <div key={user.user} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{user.user}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{user.events} events</span>
                    <Badge
                      variant={user.risk_score >= 70 ? 'error' : user.risk_score >= 40 ? 'warning' : 'success'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {user.risk_score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Daily Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditMetrics?.daily_trends?.map((day) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{new Date(day.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{day.events.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{day.critical}</div>
                    <div className="text-xs text-gray-600">Critical</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Audit Trail Analytics
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive audit log analysis and user activity monitoring</p>
          {usingFallbackData && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
              ⚠️ Using sample data - API endpoints unavailable
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAuditData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'logs', label: 'Audit Logs', icon: Database },
            { id: 'users', label: 'User Activity', icon: User },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
        {activeTab === 'logs' && renderAuditLogs()}
        {activeTab === 'users' && renderUserActivity()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default AuditTrailAnalytics;