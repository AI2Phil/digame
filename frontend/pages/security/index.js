import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Settings,
  Activity,
  Globe,
  Smartphone,
  Wifi,
  Database,
  Cloud,
  Server,
  Monitor,
  Bell,
  TrendingUp,
  BarChart3,
  Zap,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import NavigationHubFooter from '../../src/components/layout/NavigationHubFooter';

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

const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${value}%` }}
    />
  </div>
);

const SecurityDashboard = () => {
  const router = useRouter();
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockData = {
    overview: {
      securityScore: 87,
      activeThreats: 3,
      resolvedThreats: 156,
      lastScan: "2024-03-15T08:30:00",
      complianceStatus: 94,
      vulnerabilities: {
        critical: 0,
        high: 2,
        medium: 8,
        low: 15
      }
    },
    quickActions: [
      {
        id: 1,
        title: "Run Security Scan",
        description: "Perform comprehensive security assessment",
        icon: Shield,
        action: "scan",
        urgent: false
      },
      {
        id: 2,
        title: "Review Access Logs",
        description: "Check recent authentication attempts",
        icon: Eye,
        action: "logs",
        urgent: true
      },
      {
        id: 3,
        title: "Update Security Policies",
        description: "Review and update security configurations",
        icon: Settings,
        action: "policies",
        urgent: false
      },
      {
        id: 4,
        title: "Generate Compliance Report",
        description: "Create latest compliance documentation",
        icon: FileText,
        action: "report",
        urgent: false
      }
    ],
    recentAlerts: [
      {
        id: 1,
        type: "warning",
        title: "Unusual Login Activity",
        description: "Multiple failed login attempts from unknown IP address",
        timestamp: "2024-03-15T10:15:00",
        severity: "medium",
        status: "investigating"
      },
      {
        id: 2,
        type: "info",
        title: "Security Patch Available",
        description: "Critical security update available for database system",
        timestamp: "2024-03-15T09:30:00",
        severity: "high",
        status: "pending"
      },
      {
        id: 3,
        type: "success",
        title: "Vulnerability Resolved",
        description: "SQL injection vulnerability successfully patched",
        timestamp: "2024-03-15T08:45:00",
        severity: "critical",
        status: "resolved"
      }
    ],
    securityModules: [
      {
        id: 1,
        name: "Multi-Factor Authentication",
        description: "Enhanced login security with 2FA/MFA",
        status: "active",
        coverage: 95,
        lastUpdate: "2024-03-10",
        icon: Key,
        route: "/security/mfa"
      },
      {
        id: 2,
        name: "Access Control",
        description: "Role-based permissions and access management",
        status: "active",
        coverage: 88,
        lastUpdate: "2024-03-12",
        icon: Users,
        route: "/security/access"
      },
      {
        id: 3,
        name: "Audit & Monitoring",
        description: "Comprehensive activity logging and monitoring",
        status: "active",
        coverage: 92,
        lastUpdate: "2024-03-14",
        icon: Activity,
        route: "/security/audit"
      },
      {
        id: 4,
        name: "Compliance Management",
        description: "Regulatory compliance tracking and reporting",
        status: "active",
        coverage: 94,
        lastUpdate: "2024-03-13",
        icon: FileText,
        route: "/security/compliance"
      }
    ],
    threatIntelligence: {
      globalThreats: 1247,
      blockedAttacks: 89,
      suspiciousActivities: 23,
      threatLevel: "moderate"
    },
    systemHealth: [
      {
        component: "Web Application Firewall",
        status: "healthy",
        uptime: 99.9,
        lastCheck: "2024-03-15T10:30:00"
      },
      {
        component: "Intrusion Detection System",
        status: "healthy",
        uptime: 99.8,
        lastCheck: "2024-03-15T10:30:00"
      },
      {
        component: "Endpoint Protection",
        status: "warning",
        uptime: 98.5,
        lastCheck: "2024-03-15T10:30:00"
      },
      {
        component: "Data Encryption",
        status: "healthy",
        uptime: 100,
        lastCheck: "2024-03-15T10:30:00"
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

  const handleQuickAction = (action) => {
    console.log('Executing quick action:', action);
  };

  const handleModuleNavigation = (route) => {
    router.push(route);
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreBg = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
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
    <div className="min-h-screen bg-gray-50">
      {/* Return to Dashboard Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Return to Dashboard</span>
          </Link>
        </div>
      </div>

      <PageHeader
        title="Security & Compliance"
        subtitle="Monitor and manage your organization's security posture"
        icon={<Shield className="w-6 h-6 text-red-600" />}
        badge="SECURITY"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Security Score Section */}
        <div className="mb-8">

        {/* Security Score */}
        <div className="mt-6">
          <Card className={`${getSecurityScoreBg(currentData.overview.securityScore)} border-2`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Overall Security Score</h2>
                  <p className="text-gray-600">Last updated: {new Date(currentData.overview.lastScan).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className={`text-6xl font-bold ${getSecurityScoreColor(currentData.overview.securityScore)}`}>
                    {currentData.overview.securityScore}
                  </div>
                  <div className="text-lg text-gray-600">/ 100</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{currentData.overview.activeThreats}</div>
          <div className="text-sm text-gray-600">Active Threats</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{currentData.overview.resolvedThreats}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{currentData.overview.vulnerabilities.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{currentData.overview.vulnerabilities.high}</div>
          <div className="text-sm text-gray-600">High Risk</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{currentData.overview.vulnerabilities.medium}</div>
          <div className="text-sm text-gray-600">Medium Risk</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{currentData.overview.complianceStatus}%</div>
          <div className="text-sm text-gray-600">Compliance</div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentData.quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => handleQuickAction(action.action)}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.urgent ? 'bg-red-100' : 'bg-blue-100'}`}>
                      <Icon className={`h-5 w-5 ${action.urgent ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-600">{action.description}</div>
                    </div>
                    {action.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentData.recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    <Badge className={getStatusColor(alert.status)}>
                      {alert.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Threat Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Threat Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <Badge className={getThreatLevelColor(currentData.threatIntelligence.threatLevel)} variant="outline">
                  Threat Level: {currentData.threatIntelligence.threatLevel.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">{currentData.threatIntelligence.globalThreats}</div>
                  <div className="text-xs text-gray-600">Global Threats</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{currentData.threatIntelligence.blockedAttacks}</div>
                  <div className="text-xs text-gray-600">Blocked Today</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{currentData.threatIntelligence.suspiciousActivities}</div>
                <div className="text-xs text-gray-600">Suspicious Activities</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Modules */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Security Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentData.securityModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleModuleNavigation(module.route)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge className={module.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {module.status}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{module.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Coverage</span>
                      <span className="font-medium">{module.coverage}%</span>
                    </div>
                    <Progress value={module.coverage} />
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(module.lastUpdate).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentData.systemHealth.map((system, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{system.component}</h4>
                  <div className={`w-3 h-3 rounded-full ${system.status === 'healthy' ? 'bg-green-500' : system.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uptime</span>
                    <span className={`font-medium ${getHealthStatusColor(system.status)}`}>
                      {system.uptime}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last check: {new Date(system.lastCheck).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Navigation Hub Footer */}
      <NavigationHubFooter />
    </div>
  );
};

export default SecurityDashboard;