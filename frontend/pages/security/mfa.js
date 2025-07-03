import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Shield,
  Smartphone,
  Key,
  QrCode,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  Download,
  RefreshCw,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  MapPin,
  X
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

const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${value}%` }}
    />
  </div>
);

const MultiFactorAuthentication = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Mock data
  const mockData = {
    overview: {
      mfaEnabled: true,
      totalUsers: 1247,
      mfaEnabledUsers: 1089,
      mfaCoverage: 87.3,
      methodsConfigured: 3,
      lastPolicyUpdate: "2024-03-10T14:30:00",
      securityScore: 92
    },
    methods: [
      {
        id: 1,
        name: "Authenticator App",
        type: "totp",
        icon: Smartphone,
        enabled: true,
        users: 856,
        coverage: 68.7,
        reliability: 99.2,
        description: "Time-based one-time passwords via mobile apps",
        setupComplexity: "Medium",
        userSatisfaction: 4.6
      },
      {
        id: 2,
        name: "SMS Verification",
        type: "sms",
        icon: MessageSquare,
        enabled: true,
        users: 423,
        coverage: 33.9,
        reliability: 94.8,
        description: "Text message verification codes",
        setupComplexity: "Low",
        userSatisfaction: 4.2
      },
      {
        id: 3,
        name: "Email Verification",
        type: "email",
        icon: Mail,
        enabled: true,
        users: 312,
        coverage: 25.0,
        reliability: 97.1,
        description: "Email-based verification codes",
        setupComplexity: "Low",
        userSatisfaction: 4.0
      },
      {
        id: 4,
        name: "Hardware Keys",
        type: "fido2",
        icon: Key,
        enabled: false,
        users: 0,
        coverage: 0,
        reliability: 99.9,
        description: "FIDO2/WebAuthn hardware security keys",
        setupComplexity: "High",
        userSatisfaction: 4.9
      }
    ],
    policies: {
      enforcementLevel: "Required",
      gracePeriod: 7,
      backupMethods: 2,
      sessionTimeout: 24,
      rememberDevice: true,
      rememberDuration: 30,
      allowedMethods: ["totp", "sms", "email"],
      restrictedCountries: ["CN", "RU", "IR"],
      riskBasedAuth: true
    },
    analytics: {
      authenticationAttempts: {
        total: 15420,
        successful: 14987,
        failed: 433,
        successRate: 97.2
      },
      methodUsage: [
        { method: "Authenticator App", percentage: 68.7, trend: "up" },
        { method: "SMS", percentage: 33.9, trend: "stable" },
        { method: "Email", percentage: 25.0, trend: "down" },
        { method: "Hardware Keys", percentage: 0, trend: "none" }
      ],
      securityIncidents: {
        thisMonth: 3,
        lastMonth: 7,
        resolved: 10,
        pending: 0
      },
      userAdoption: {
        newSignups: 89,
        mfaEnabled: 76,
        adoptionRate: 85.4
      }
    },
    backupCodes: [
      "A1B2-C3D4-E5F6",
      "G7H8-I9J0-K1L2",
      "M3N4-O5P6-Q7R8",
      "S9T0-U1V2-W3X4",
      "Y5Z6-A7B8-C9D0",
      "E1F2-G3H4-I5J6",
      "K7L8-M9N0-O1P2",
      "Q3R4-S5T6-U7V8"
    ],
    recentActivity: [
      {
        id: 1,
        user: "john.doe@company.com",
        action: "MFA Setup",
        method: "Authenticator App",
        timestamp: "2024-03-15T10:30:00",
        status: "success",
        location: "San Francisco, CA"
      },
      {
        id: 2,
        user: "jane.smith@company.com",
        action: "Login Attempt",
        method: "SMS",
        timestamp: "2024-03-15T10:15:00",
        status: "failed",
        location: "New York, NY"
      },
      {
        id: 3,
        user: "admin@company.com",
        action: "Policy Update",
        method: "System",
        timestamp: "2024-03-15T09:45:00",
        status: "success",
        location: "System"
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

  const handleMethodToggle = (methodId) => {
    console.log('Toggling MFA method:', methodId);
  };

  const handlePolicyUpdate = () => {
    console.log('Updating MFA policies');
  };

  const handleGenerateBackupCodes = () => {
    console.log('Generating new backup codes');
    setShowBackupCodes(true);
  };

  const handleCopyBackupCodes = () => {
    const codes = currentData.backupCodes.join('\n');
    navigator.clipboard.writeText(codes);
  };

  const getMethodStatusColor = (enabled) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      case 'stable': return <Activity className="h-3 w-3 text-blue-600" />;
      default: return null;
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
            <h1 className="text-3xl font-bold text-gray-900">Multi-Factor Authentication</h1>
            <p className="text-gray-600 mt-2">Secure your platform with advanced authentication methods</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleGenerateBackupCodes}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Backup Codes
            </Button>
            <Button onClick={handlePolicyUpdate}>
              <Settings className="h-4 w-4 mr-2" />
              Update Policies
            </Button>
          </div>
        </div>

        {/* MFA Status Overview */}
        <div className="mt-6">
          <Card className={`${currentData.overview.mfaEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${currentData.overview.mfaEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Shield className={`h-8 w-8 ${currentData.overview.mfaEnabled ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      MFA {currentData.overview.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </h2>
                    <p className="text-gray-600">
                      {currentData.overview.mfaEnabledUsers} of {currentData.overview.totalUsers} users protected ({currentData.overview.mfaCoverage}%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">{currentData.overview.securityScore}</div>
                  <div className="text-sm text-gray-600">Security Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{currentData.overview.mfaEnabledUsers}</div>
          <div className="text-sm text-gray-600">Protected Users</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{currentData.overview.methodsConfigured}</div>
          <div className="text-sm text-gray-600">Active Methods</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{currentData.overview.mfaCoverage}%</div>
          <div className="text-sm text-gray-600">Coverage</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{currentData.analytics.authenticationAttempts.successRate}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{currentData.analytics.securityIncidents.thisMonth}</div>
          <div className="text-sm text-gray-600">Incidents</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">{currentData.analytics.userAdoption.adoptionRate}%</div>
          <div className="text-sm text-gray-600">Adoption</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'methods', label: 'Auth Methods', icon: Key },
            { id: 'policies', label: 'Policies', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'activity', label: 'Activity', icon: Activity }
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

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coverage Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                MFA Coverage Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Coverage</span>
                    <span className="text-sm text-gray-600">{currentData.overview.mfaCoverage}%</span>
                  </div>
                  <Progress value={currentData.overview.mfaCoverage} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{currentData.overview.mfaEnabledUsers}</div>
                    <div className="text-xs text-gray-600">Protected</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{currentData.overview.totalUsers - currentData.overview.mfaEnabledUsers}</div>
                    <div className="text-xs text-gray-600">Unprotected</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Method Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Method Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentData.analytics.methodUsage.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{method.method}</span>
                      {getTrendIcon(method.trend)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${method.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{method.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'methods' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentData.methods.map((method) => {
            const Icon = method.icon;
            return (
              <Card key={method.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      <Badge className={getMethodStatusColor(method.enabled)}>
                        {method.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Users</div>
                        <div className="font-medium">{method.users.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Coverage</div>
                        <div className="font-medium">{method.coverage}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Reliability</div>
                        <div className="font-medium">{method.reliability}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Satisfaction</div>
                        <div className="font-medium flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          {method.userSatisfaction}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {method.setupComplexity} Setup
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button 
                          size="sm" 
                          variant={method.enabled ? "destructive" : "default"}
                          onClick={() => handleMethodToggle(method.id)}
                        >
                          {method.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MFA Enforcement Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Enforcement Level</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="required">Required for All Users</option>
                      <option value="optional">Optional</option>
                      <option value="admin-only">Admin Users Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Grace Period (days)</label>
                    <input 
                      type="number" 
                      value={currentData.policies.gracePeriod}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Required Backup Methods</label>
                    <input 
                      type="number" 
                      value={currentData.policies.backupMethods}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Session Timeout (hours)</label>
                    <input 
                      type="number" 
                      value={currentData.policies.sessionTimeout}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Remember Device Duration (days)</label>
                    <input 
                      type="number" 
                      value={currentData.policies.rememberDuration}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={currentData.policies.riskBasedAuth}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium">Enable Risk-Based Authentication</label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button onClick={handlePolicyUpdate}>
                  Save Policy Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Authentication Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{currentData.analytics.authenticationAttempts.total.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{currentData.analytics.authenticationAttempts.successful.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600">{currentData.analytics.authenticationAttempts.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{currentData.analytics.authenticationAttempts.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Security Incidents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{currentData.analytics.securityIncidents.thisMonth}</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{currentData.analytics.securityIncidents.lastMonth}</div>
                  <div className="text-sm text-gray-600">Last Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentData.analytics.securityIncidents.resolved}</div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{currentData.analytics.securityIncidents.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Adoption */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User Adoption Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentData.analytics.userAdoption.newSignups}</div>
                  <div className="text-sm text-gray-600">New Signups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentData.analytics.userAdoption.mfaEnabled}</div>
                  <div className="text-sm text-gray-600">MFA Enabled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{currentData.analytics.userAdoption.adoptionRate}%</div>
                  <div className="text-sm text-gray-600">Adoption Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          {currentData.recentActivity.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{activity.action}</h4>
                        <p className="text-sm text-gray-600">{activity.user}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Key className="h-4 w-4" />
                        <span>{activity.method}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{activity.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Backup Codes
                <Button size="sm" variant="ghost" onClick={() => setShowBackupCodes(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Save these backup codes in a secure location. Each code can only be used once.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {currentData.backupCodes.map((code, index) => (
                      <div key={index} className="text-center py-1">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleCopyBackupCodes}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Codes
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MultiFactorAuthentication;