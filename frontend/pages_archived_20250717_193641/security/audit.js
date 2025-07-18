import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Settings,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Key,
  Lock,
  Unlock,
  RefreshCw,
  BarChart3,
  TrendingUp,
  MapPin,
  Wifi
} from 'lucide-react';

// UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = "", size = "default", variant = "default", onClick, disabled }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8"
  };
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  
  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = "", variant = "default" }) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 bg-white text-gray-700",
    destructive: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const AuditLogs = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockData = {
    overview: {
      totalLogs: 45672,
      todayLogs: 1234,
      criticalEvents: 8,
      warningEvents: 156,
      infoEvents: 1070,
      retentionPeriod: 365,
      storageUsed: "2.4 GB"
    },
    logs: [
      {
        id: 1,
        timestamp: "2024-03-15T10:30:15.123Z",
        category: "Authentication",
        severity: "warning",
        event: "Failed Login Attempt",
        user: "john.doe@company.com",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: "San Francisco, CA",
        details: "Multiple failed login attempts detected",
        source: "Web Application",
        sessionId: "sess_abc123def456",
        riskScore: 75
      },
      {
        id: 2,
        timestamp: "2024-03-15T10:25:42.456Z",
        category: "Access Control",
        severity: "critical",
        event: "Unauthorized Access Attempt",
        user: "jane.smith@company.com",
        ipAddress: "203.0.113.45",
        userAgent: "curl/7.68.0",
        location: "Unknown",
        details: "Attempted to access admin panel without proper permissions",
        source: "API",
        sessionId: "sess_xyz789ghi012",
        riskScore: 95
      },
      {
        id: 3,
        timestamp: "2024-03-15T10:20:18.789Z",
        category: "Data Access",
        severity: "info",
        event: "Data Export",
        user: "admin@company.com",
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        location: "New York, NY",
        details: "User exported customer data report",
        source: "Dashboard",
        sessionId: "sess_mno345pqr678",
        riskScore: 25
      },
      {
        id: 4,
        timestamp: "2024-03-15T10:15:33.012Z",
        category: "System",
        severity: "warning",
        event: "Configuration Change",
        user: "system",
        ipAddress: "127.0.0.1",
        userAgent: "System Process",
        location: "Server",
        details: "Security policy updated: MFA enforcement enabled",
        source: "System",
        sessionId: "sess_system001",
        riskScore: 40
      },
      {
        id: 5,
        timestamp: "2024-03-15T10:10:07.345Z",
        category: "Authentication",
        severity: "info",
        event: "Successful Login",
        user: "alice.johnson@company.com",
        ipAddress: "192.168.1.75",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
        location: "Austin, TX",
        details: "User logged in successfully with MFA",
        source: "Mobile App",
        sessionId: "sess_stu901vwx234",
        riskScore: 10
      }
    ],
    categories: [
      { name: "Authentication", count: 15420, percentage: 33.8 },
      { name: "Access Control", count: 12340, percentage: 27.0 },
      { name: "Data Access", count: 8950, percentage: 19.6 },
      { name: "System", count: 5670, percentage: 12.4 },
      { name: "API", count: 2340, percentage: 5.1 },
      { name: "Other", count: 952, percentage: 2.1 }
    ],
    analytics: {
      timeDistribution: {
        "00-06": 234,
        "06-12": 1890,
        "12-18": 2340,
        "18-24": 1456
      },
      topUsers: [
        { user: "admin@company.com", events: 456 },
        { user: "john.doe@company.com", events: 234 },
        { user: "jane.smith@company.com", events: 189 },
        { user: "alice.johnson@company.com", events: 156 },
        { user: "bob.wilson@company.com", events: 134 }
      ],
      topIPs: [
        { ip: "192.168.1.100", events: 567, location: "San Francisco, CA" },
        { ip: "10.0.0.50", events: 234, location: "New York, NY" },
        { ip: "203.0.113.45", events: 189, location: "Unknown" },
        { ip: "192.168.1.75", events: 156, location: "Austin, TX" }
      ],
      riskDistribution: {
        low: 3456,
        medium: 1234,
        high: 567,
        critical: 89
      }
    },
    alerts: [
      {
        id: 1,
        title: "Suspicious Login Pattern",
        description: "Multiple failed login attempts from different locations",
        severity: "high",
        count: 15,
        lastOccurrence: "2024-03-15T10:30:00Z",
        status: "active"
      },
      {
        id: 2,
        title: "Unusual Data Access",
        description: "Large volume of data accessed outside business hours",
        severity: "medium",
        count: 8,
        lastOccurrence: "2024-03-15T02:15:00Z",
        status: "investigating"
      },
      {
        id: 3,
        title: "API Rate Limit Exceeded",
        description: "API calls exceeding normal usage patterns",
        severity: "low",
        count: 23,
        lastOccurrence: "2024-03-15T09:45:00Z",
        status: "resolved"
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCurrentData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleExportLogs = () => {
    console.log('Exporting audit logs');
  };

  const handleRefreshLogs = () => {
    console.log('Refreshing audit logs');
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleViewDetails = (logId) => {
    console.log('Viewing log details:', logId);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Authentication': return <Key className="h-4 w-4" />;
      case 'Access Control': return <Shield className="h-4 w-4" />;
      case 'Data Access': return <Database className="h-4 w-4" />;
      case 'System': return <Settings className="h-4 w-4" />;
      case 'API': return <Globe className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs & Monitoring</h1>
            <p className="text-gray-600 mt-2">Track and monitor all system activities and security events</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleRefreshLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Audit Overview */}
        <div className="mt-6">
          <Card className="bg-blue-50 border-blue-200 border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Audit Logging Active</h2>
                    <p className="text-gray-600">
                      {currentData.overview.todayLogs} events logged today | {currentData.overview.retentionPeriod} days retention
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">{(currentData.overview.totalLogs / 1000).toFixed(1)}K</div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{currentData.overview.todayLogs}</div>
          <div className="text-sm text-gray-600">Today's Events</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{currentData.overview.criticalEvents}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{currentData.overview.warningEvents}</div>
          <div className="text-sm text-gray-600">Warnings</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{currentData.overview.infoEvents}</div>
          <div className="text-sm text-gray-600">Info</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{currentData.overview.retentionPeriod}</div>
          <div className="text-sm text-gray-600">Days Retention</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">{currentData.overview.storageUsed}</div>
          <div className="text-sm text-gray-600">Storage Used</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'logs', label: 'Audit Logs', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle },
            { id: 'settings', label: 'Log Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
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

      {/* Filters */}
      {activeTab === 'logs' && (
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Authentication">Authentication</option>
            <option value="Access Control">Access Control</option>
            <option value="Data Access">Data Access</option>
            <option value="System">System</option>
            <option value="API">API</option>
          </select>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      )}

      {/* Content */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {currentData.logs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex flex-col items-center gap-2">
                      {getSeverityIcon(log.severity)}
                      {getCategoryIcon(log.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{log.event}</h4>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Badge variant="outline">
                          {log.category}
                        </Badge>
                        <Badge className={getRiskColor(log.riskScore)}>
                          Risk: {log.riskScore}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{log.details}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{log.user}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{log.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{log.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-400">
                        Source: {log.source} | Session: {log.sessionId}
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(log.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Event Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Event Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category.name)}
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{category.count.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">({category.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Users and IPs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Top Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.analytics.topUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{user.user}</span>
                      <span className="text-sm text-gray-600">{user.events} events</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Source IPs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.analytics.topIPs.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{ip.ip}</div>
                        <div className="text-xs text-gray-500">{ip.location}</div>
                      </div>
                      <span className="text-sm text-gray-600">{ip.events} events</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentData.analytics.riskDistribution.low}</div>
                  <div className="text-sm text-gray-600">Low Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{currentData.analytics.riskDistribution.medium}</div>
                  <div className="text-sm text-gray-600">Medium Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentData.analytics.riskDistribution.high}</div>
                  <div className="text-sm text-gray-600">High Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{currentData.analytics.riskDistribution.critical}</div>
                  <div className="text-sm text-gray-600">Critical Risk</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {currentData.alerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{alert.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Occurrences: {alert.count}</span>
                        <span>Last seen: {new Date(alert.lastOccurrence).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Investigate
                    </Button>
                    <Button size="sm">
                      Resolve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Log Retention Period</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                      <option value="365" selected>365 Days</option>
                      <option value="1095">3 Years</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Log Level</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="all">All Events</option>
                      <option value="warning">Warning & Above</option>
                      <option value="critical">Critical Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Storage Location</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="local">Local Storage</option>
                      <option value="s3">Amazon S3</option>
                      <option value="azure">Azure Blob</option>
                      <option value="gcp">Google Cloud Storage</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium">Enable Real-time Monitoring</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium">Log User Agent Information</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium">Include Geolocation Data</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={false}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium">Enable SIEM Integration</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium">Automatic Threat Detection</label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex gap-4">
                  <Button>
                    Save Configuration
                  </Button>
                  <Button variant="outline">
                    Test Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Failed Login Threshold</label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of failed attempts before alert</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Unusual Access Pattern Detection</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Alert Recipients</label>
                  <textarea
                    placeholder="admin@company.com, security@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Export & Backup Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Export Format</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                      <option value="xml">XML</option>
                      <option value="syslog">Syslog</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Backup Frequency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium">Compress Exports</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium">Encrypt Backups</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={false}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium">Auto-delete Old Exports</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;