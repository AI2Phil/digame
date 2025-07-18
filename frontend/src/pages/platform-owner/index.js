import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { 
  Crown, 
  BarChart3, 
  Settings, 
  Users, 
  Shield, 
  Globe,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Package,
  Code,
  Link,
  Store,
  FileText,
  Eye,
  Target,
  Cpu,
  Monitor,
  ArrowRight
} from 'lucide-react';

// Access control hook
const usePlatformOwnerAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Simulate access control check
    const checkAccess = async () => {
      try {
        // In a real application, this would be an API call to verify user permissions
        const mockUser = {
          role: 'platform_owner', // Could be: 'platform_owner', 'admin', 'user', etc.
          permissions: ['platform_management', 'system_administration', 'analytics_access']
        };

        // Check if user has platform owner role or admin privileges
        const hasPermission = mockUser.role === 'platform_owner' || 
                             mockUser.role === 'admin' ||
                             mockUser.permissions.includes('platform_management');

        setUserRole(mockUser.role);
        setHasAccess(hasPermission);
      } catch (error) {
        console.error('Access control check failed:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return { hasAccess, loading, userRole };
};

export default function PlatformOwnerDashboard() {
  const router = useRouter();
  const { hasAccess, loading, userRole } = usePlatformOwnerAccess();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (hasAccess) {
      // Load dashboard data
      setTimeout(() => {
        setDashboardData({
          overview: {
            totalUsers: 125847,
            activeUsers: 89234,
            systemHealth: 98.7,
            revenue: 2450000,
            apiCalls: 15600000,
            uptime: 99.9
          },
          quickActions: [
            {
              title: 'Platform Performance',
              description: 'Monitor system performance and user satisfaction',
              icon: BarChart3,
              path: '/platform-owner/performance-overview',
              color: 'blue'
            },
            {
              title: 'System Orchestration',
              description: 'Manage global system operations and scaling',
              icon: Settings,
              path: '/platform-owner/system-orchestration',
              color: 'green'
            },
            {
              title: 'User Journey Analytics',
              description: 'Analyze user behavior and conversion patterns',
              icon: Users,
              path: '/platform-owner/user-journey-analytics',
              color: 'purple'
            },
            {
              title: 'Compliance Dashboard',
              description: 'Monitor regulatory compliance and security',
              icon: Shield,
              path: '/platform-owner/compliance-dashboard',
              color: 'red'
            }
          ],
          recentAlerts: [
            {
              id: 1,
              type: 'warning',
              title: 'High API Usage Detected',
              description: 'API calls increased by 45% in the last hour',
              timestamp: '5 minutes ago'
            },
            {
              id: 2,
              type: 'success',
              title: 'System Update Completed',
              description: 'Platform infrastructure update deployed successfully',
              timestamp: '2 hours ago'
            },
            {
              id: 3,
              type: 'info',
              title: 'New Integration Added',
              description: 'Salesforce integration configured and active',
              timestamp: '4 hours ago'
            }
          ]
        });
      }, 1000);
    }
  }, [hasAccess]);

  // Access control loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying access permissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Access denied state
  if (!hasAccess) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-600 mb-6">
                You don't have permission to access the Platform Owner dashboard. 
                This area is restricted to platform administrators and owners only.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Current Role:</strong> {userRole || 'Unknown'}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Required Role:</strong> Platform Owner or Admin
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Main dashboard content
  return (
    <Layout
      isDemoMode={false}
      currentUser={{
        name: 'Platform Owner',
        role: 'platform_owner',
        is_platform_owner: true,
        subscription_tier: 'enterprise',
        tenant_id: 1,
        tenant_name: 'Platform Owner',
        permissions: ['platform_management', 'system_administration', 'analytics_access']
      }}
      onLogout={() => router.push('/')}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Crown className="w-8 h-8 text-yellow-600 mr-3" />
                  Platform Owner Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive platform management and strategic oversight
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  System Healthy
                </div>
                <div className="text-sm text-gray-600">
                  Role: <span className="font-medium text-blue-600">{userRole}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.overview.totalUsers.toLocaleString() || '---'}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% growth
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.overview.activeUsers.toLocaleString() || '---'}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                71% active rate
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.overview.systemHealth || '---'}%
                  </p>
                </div>
                <Monitor className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Excellent
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${dashboardData?.overview.revenue ? (dashboardData.overview.revenue / 1000000).toFixed(1) + 'M' : '---'}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +18.3% this month
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Calls</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.overview.apiCalls ? (dashboardData.overview.apiCalls / 1000000).toFixed(1) + 'M' : '---'}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +25.7% today
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.overview.uptime || '---'}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Excellent
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardData?.quickActions.map((action, index) => {
                const IconComponent = action.icon;
                const colorClasses = {
                  blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
                  green: 'bg-green-100 text-green-600 hover:bg-green-200',
                  purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
                  red: 'bg-red-100 text-red-600 hover:bg-red-200'
                };

                return (
                  <div
                    key={index}
                    onClick={() => router.push(action.path)}
                    className="bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[action.color]}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                    <div className="flex items-center text-sm text-blue-600 font-medium">
                      Access Dashboard
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                Recent System Alerts
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData?.recentAlerts.map((alert) => {
                  const alertColors = {
                    warning: 'text-yellow-600 bg-yellow-50',
                    success: 'text-green-600 bg-green-50',
                    info: 'text-blue-600 bg-blue-50',
                    error: 'text-red-600 bg-red-50'
                  };

                  const alertIcons = {
                    warning: AlertTriangle,
                    success: CheckCircle,
                    info: Activity,
                    error: AlertTriangle
                  };

                  const AlertIcon = alertIcons[alert.type];

                  return (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${alertColors[alert.type]}`}>
                        <AlertIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{alert.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Platform Owner Features Grid */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Platform Owner Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Strategic Business Intelligence */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
                  Strategic Business Intelligence
                </h4>
                <div className="space-y-2 text-sm">
                  <button onClick={() => router.push('/platform-owner/performance-overview')} className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors">
                    Platform Performance Dashboard
                  </button>
                  <button onClick={() => router.push('/platform-owner/competitive-intelligence')} className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors">
                    Competitive Intelligence Hub
                  </button>
                  <button onClick={() => router.push('/platform-owner/roi-analytics')} className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors">
                    Platform ROI Analytics
                  </button>
                  <button onClick={() => router.push('/platform-owner/strategic-planning')} className="block w-full text-left text-gray-600 hover:text-blue-600 transition-colors">
                    Strategic Planning Dashboard
                  </button>
                </div>
              </div>

              {/* Advanced Operations Management */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Settings className="w-4 h-4 text-green-600 mr-2" />
                  Advanced Operations Management
                </h4>
                <div className="space-y-2 text-sm">
                  <button onClick={() => router.push('/platform-owner/system-orchestration')} className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors">
                    Global System Orchestration
                  </button>
                  <button onClick={() => router.push('/platform-owner/incident-management')} className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors">
                    Incident Command Center
                  </button>
                  <button onClick={() => router.push('/platform-owner/capacity-planning')} className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors">
                    Capacity Planning Center
                  </button>
                  <button onClick={() => router.push('/platform-owner/feature-flags')} className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors">
                    Feature Flag Management
                  </button>
                </div>
              </div>

              {/* Advanced Analytics & Intelligence */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Eye className="w-4 h-4 text-purple-600 mr-2" />
                  Advanced Analytics & Intelligence
                </h4>
                <div className="space-y-2 text-sm">
                  <button onClick={() => router.push('/platform-owner/user-journey-analytics')} className="block w-full text-left text-gray-600 hover:text-purple-600 transition-colors">
                    User Journey Intelligence
                  </button>
                  <button onClick={() => router.push('/platform-owner/health-scoring')} className="block w-full text-left text-gray-600 hover:text-purple-600 transition-colors">
                    Platform Health Scoring
                  </button>
                  <button onClick={() => router.push('/platform-owner/ai-model-observatory')} className="block w-full text-left text-gray-600 hover:text-purple-600 transition-colors">
                    AI Model Observatory
                  </button>
                  <button onClick={() => router.push('/platform-owner/data-quality')} className="block w-full text-left text-gray-600 hover:text-purple-600 transition-colors">
                    Data Quality Command Center
                  </button>
                </div>
              </div>

              {/* Governance & Compliance */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Shield className="w-4 h-4 text-red-600 mr-2" />
                  Governance & Compliance
                </h4>
                <div className="space-y-2 text-sm">
                  <button onClick={() => router.push('/platform-owner/compliance-dashboard')} className="block w-full text-left text-gray-600 hover:text-red-600 transition-colors">
                    Compliance Dashboard
                  </button>
                  <button onClick={() => router.push('/platform-owner/risk-management')} className="block w-full text-left text-gray-600 hover:text-red-600 transition-colors">
                    Risk Management Center
                  </button>
                  <button onClick={() => router.push('/platform-owner/audit-analytics')} className="block w-full text-left text-gray-600 hover:text-red-600 transition-colors">
                    Audit Trail Analytics
                  </button>
                </div>
              </div>

              {/* Developer & Partner Ecosystem */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Globe className="w-4 h-4 text-yellow-600 mr-2" />
                  Developer & Partner Ecosystem
                </h4>
                <div className="space-y-2 text-sm">
                  <button onClick={() => router.push('/platform-owner/developer-portal')} className="block w-full text-left text-gray-600 hover:text-yellow-600 transition-colors">
                    Developer Portal Management
                  </button>
                  <button onClick={() => router.push('/platform-owner/partner-integrations')} className="block w-full text-left text-gray-600 hover:text-yellow-600 transition-colors">
                    Partner Integration Hub
                  </button>
                  <button onClick={() => router.push('/platform-owner/marketplace-management')} className="block w-full text-left text-gray-600 hover:text-yellow-600 transition-colors">
                    Marketplace Management
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}