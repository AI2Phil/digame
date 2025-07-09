import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastHelpers } from '../ui/Toaster';
import {
  FileText, Eye, Download, Filter, Search, Calendar,
  User, Shield, AlertTriangle, CheckCircle, Clock,
  BarChart3, TrendingUp, Activity, Database, Globe,
  Smartphone, Monitor, Server, Lock, Key, Settings,
  RefreshCw
} from 'lucide-react';

const AuditTrailAnalytics = () => {
  const toast = useToastHelpers();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  // State for audit data
  const [auditOverview, setAuditOverview] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [systemEvents, setSystemEvents] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);

  useEffect(() => {
    fetchAuditData();
  }, [dateRange]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);

      const [overviewResponse, logsResponse, activityResponse, eventsResponse, securityResponse] = await Promise.all([
        fetch(`http://localhost:8001/api/security/audit-trail/overview?range=${dateRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`http://localhost:8001/api/security/audit-trail/logs?range=${dateRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`http://localhost:8001/api/security/audit-trail/user-activity?range=${dateRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`http://localhost:8001/api/security/audit-trail/system-events?range=${dateRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`http://localhost:8001/api/security/audit-trail/security-events?range=${dateRange}`, {
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

      if (activityResponse.ok) {
        const data = await activityResponse.json();
        setUserActivity(data.data || data);
        hasRealData = true;
      }

      if (eventsResponse.ok) {
        const data = await eventsResponse.json();
        setSystemEvents(data.data || data);
        hasRealData = true;
      }

      if (securityResponse.ok) {
        const data = await securityResponse.json();
        setSecurityEvents(data.data || data);
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
      total_events: 15420,
      user_actions: 12340,
      system_events: 2180,
      security_events: 900,
      failed_logins: 45,
      successful_logins: 1890,
      data_access_events: 3450,
      configuration_changes: 234,
      policy_violations: 12,
      compliance_events: 567,
      top_users: [
        { user: 'john.doe@company.com', events: 1234, risk_score: 'low' },
        { user: 'jane.smith@company.com', events: 987, risk_score: 'medium' },
        { user: 'admin@company.com', events: 756, risk_score: 'high' }
      ],
      event_trends: {
        login_attempts: [120, 135, 98, 156, 143, 167, 189],
        data_access: [450, 523, 398, 612, 567, 634, 589],
        config_changes: [12, 8, 15, 23, 19, 31, 27]
      }
    };

    // Enhanced sample audit logs
    const sampleAuditLogs = [
      {
        id: 1,
        timestamp: '2024-03-08T14:30:25Z',
        event_type: 'user_login',
        user: 'john.doe@company.com',
        action: 'Successful login',
        resource: 'Authentication System',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'New York, NY',
        risk_level: 'low',
        details: 'Standard login with MFA verification'
      },
      {
        id: 2,
        timestamp: '2024-03-08T14:25:12Z',
        event_type: 'data_access',
        user: 'jane.smith@company.com',
        action: 'Accessed customer database',
        resource: 'Customer Database',
        ip_address: '192.168.1.105',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        location: 'San Francisco, CA',
        risk_level: 'medium',
        details: 'Accessed 150 customer records for analytics report'
      },
      {
        id: 3,
        timestamp: '2024-03-08T14:20:45Z',
        event_type: 'config_change',
        user: 'admin@company.com',
        action: 'Modified security policy',
        resource: 'Security Configuration',
        ip_address: '192.168.1.10',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Chicago, IL',
        risk_level: 'high',
        details: 'Updated password complexity requirements'
      },
      {
        id: 4,
        timestamp: '2024-03-08T14:15:33Z',
        event_type: 'failed_login',
        user: 'unknown@external.com',
        action: 'Failed login attempt',
        resource: 'Authentication System',
        ip_address: '203.0.113.45',
        user_agent: 'curl/7.68.0',
        location: 'Unknown',
        risk_level: 'high',
        details: 'Multiple failed login attempts detected'
      },
      {
        id: 5,
        timestamp: '2024-03-08T14:10:18Z',
        event_type: 'data_export',
        user: 'mike.wilson@company.com',
        action: 'Exported financial report',
        resource: 'Financial System',
        ip_address: '192.168.1.120',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Boston, MA',
        risk_level: 'medium',
        details: 'Exported Q1 financial summary report'
      }
    ];

    // Enhanced sample user activity
    const sampleUserActivity = [
      {
        user: 'john.doe@company.com',
        role: 'Senior Developer',
        department: 'Engineering',
        total_events: 1234,
        login_events: 45,
        data_access_events: 890,
        config_changes: 12,
        last_activity: '2024-03-08T14:30:25Z',
        risk_score: 'low',
        unusual_activity: false,
        locations: ['New York, NY', 'Remote'],
        devices: ['Windows Desktop', 'MacBook Pro']
      },
      {
        user: 'jane.smith@company.com',
        role: 'Data Analyst',
        department: 'Analytics',
        total_events: 987,
        login_events: 38,
        data_access_events: 756,
        config_changes: 3,
        last_activity: '2024-03-08T14:25:12Z',
        risk_score: 'medium',
        unusual_activity: true,
        locations: ['San Francisco, CA'],
        devices: ['MacBook Air', 'iPhone']
      },
      {
        user: 'admin@company.com',
        role: 'System Administrator',
        department: 'IT',
        total_events: 756,
        login_events: 28,
        data_access_events: 234,
        config_changes: 89,
        last_activity: '2024-03-08T14:20:45Z',
        risk_score: 'high',
        unusual_activity: false,
        locations: ['Chicago, IL'],
        devices: ['Windows Workstation']
      }
    ];

    // Enhanced sample security events
    const sampleSecurityEvents = [
      {
        id: 1,
        timestamp: '2024-03-08T14:15:33Z',
        event_type: 'suspicious_login',
        severity: 'high',
        source: 'Authentication System',
        description: 'Multiple failed login attempts from unknown IP',
        ip_address: '203.0.113.45',
        user_agent: 'curl/7.68.0',
        location: 'Unknown',
        status: 'investigating',
        assigned_to: 'Security Team',
        mitigation_actions: ['IP blocked', 'User notified', 'Monitoring increased']
      },
      {
        id: 2,
        timestamp: '2024-03-08T13:45:22Z',
        event_type: 'privilege_escalation',
        severity: 'critical',
        source: 'Access Control System',
        description: 'Unauthorized privilege escalation attempt detected',
        ip_address: '192.168.1.150',
        user_agent: 'Mozilla/5.0 (Linux; Android 10)',
        location: 'Internal Network',
        status: 'resolved',
        assigned_to: 'Security Team',
        mitigation_actions: ['Access revoked', 'Account suspended', 'Investigation completed']
      },
      {
        id: 3,
        timestamp: '2024-03-08T12:30:15Z',
        event_type: 'data_exfiltration',
        severity: 'medium',
        source: 'Data Loss Prevention',
        description: 'Large data download detected outside business hours',
        ip_address: '192.168.1.200',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: 'Remote VPN',
        status: 'monitoring',
        assigned_to: 'Compliance Team',
        mitigation_actions: ['User contacted', 'Download logged', 'Manager notified']
      }
    ];

    setAuditOverview(sampleOverview);
    setAuditLogs(sampleAuditLogs);
    setUserActivity(sampleUserActivity);
    setSecurityEvents(sampleSecurityEvents);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'user_login': return 'text-green-600 bg-green-100';
      case 'failed_login': return 'text-red-600 bg-red-100';
      case 'data_access': return 'text-blue-600 bg-blue-100';
      case 'config_change': return 'text-orange-600 bg-orange-100';
      case 'data_export': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || log.event_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Actions</p>
                <p className="text-2xl font-bold text-green-600">{auditOverview?.user_actions?.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-red-600">{auditOverview?.security_events?.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Policy Violations</p>
                <p className="text-2xl font-bold text-orange-600">{auditOverview?.policy_violations}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users and Event Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Top Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditOverview?.top_users?.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.user}</p>
                    <p className="text-sm text-gray-600">{user.events} events</p>
                  </div>
                  <Badge
                    variant={user.risk_score === 'low' ? 'success' : user.risk_score === 'medium' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {user.risk_score} risk
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Event Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-medium">Login Events</span>
                </div>
                <span className="text-lg font-semibold">{auditOverview?.successful_logins?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-medium">Data Access</span>
                </div>
                <span className="text-lg font-semibold">{auditOverview?.data_access_events?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="font-medium">Config Changes</span>
                </div>
                <span className="text-lg font-semibold">{auditOverview?.configuration_changes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="font-medium">Failed Logins</span>
                </div>
                <span className="text-lg font-semibold">{auditOverview?.failed_logins}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Events</option>
            <option value="user_login">Login Events</option>
            <option value="data_access">Data Access</option>
            <option value="config_change">Config Changes</option>
            <option value="failed_login">Failed Logins</option>
            <option value="data_export">Data Export</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="default"
                        size="sm"
                        className={getEventTypeColor(log.event_type)}
                        icon={null}
                        onRemove={() => {}}
                      >
                        {log.event_type.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={log.risk_level === 'low' ? 'success' : log.risk_level === 'medium' ? 'warning' : 'error'}
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {log.risk_level}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
      <div className="grid grid-cols-1 gap-4">
        {userActivity.map((user, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.user}</h3>
                  <p className="text-gray-600">{user.role} - {user.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={user.risk_score === 'low' ? 'success' : user.risk_score === 'medium' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {user.risk_score} risk
                  </Badge>
                  {user.unusual_activity && (
                    <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                      Unusual Activity
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Activity Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Events:</span>
                      <span className="font-medium">{user.total_events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logins:</span>
                      <span className="font-medium">{user.login_events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Access:</span>
                      <span className="font-medium">{user.data_access_events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Config Changes:</span>
                      <span className="font-medium">{user.config_changes}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Locations</h4>
                  <div className="space-y-1">
                    {user.locations.map((location, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Globe className="h-3 w-3 text-gray-400" />
                        <span>{location}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Devices</h4>
                  <div className="space-y-1">
                    {user.devices.map((device, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {device.includes('iPhone') || device.includes('Android') ? (
                          <Smartphone className="h-3 w-3 text-gray-400" />
                        ) : (
                          <Monitor className="h-3 w-3 text-gray-400" />
                        )}
                        <span>{device}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Last Activity</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(user.last_activity).toLocaleString()}
                  </p>
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

  const renderSecurityEvents = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {securityEvents.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={event.severity === 'low' ? 'success' : event.severity === 'medium' ? 'warning' : 'error'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {event.severity} severity
                    </Badge>
                    <Badge
                      variant={event.status === 'resolved' ? 'success' : event.status === 'investigating' ? 'warning' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.event_type.replace('_', ' ')}</h3>
                  <p className="text-gray-600">{event.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                  <p className="text-sm font-medium text-gray-700">{event.source}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Network Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>IP Address:</span>
                      <span className="font-medium">{event.ip_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{event.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Agent:</span>
                      <span className="font-medium text-xs">{event.user_agent.substring(0, 30)}...</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Assignment</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Assigned To:</span>
                      <span className="font-medium">{event.assigned_to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium">{event.status}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mitigation Actions</h4>
                  <div className="space-y-1">
                    {event.mitigation_actions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail Analytics</h1>
          <p className="text-gray-600">Comprehensive audit logging and security event monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          {usingFallbackData && (
            <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
              Sample Data
            </Badge>
          )}
          <Button onClick={fetchAuditData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'logs', label: 'Audit Logs', icon: FileText },
            { id: 'activity', label: 'User Activity', icon: User },
            { id: 'security', label: 'Security Events', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'logs' && renderAuditLogs()}
        {activeTab === 'activity' && renderUserActivity()}
        {activeTab === 'security' && renderSecurityEvents()}
      </div>
    </div>
  );
};

export default AuditTrailAnalytics;