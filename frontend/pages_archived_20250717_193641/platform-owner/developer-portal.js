import { useState, useEffect } from 'react';
import Layout from '../../src/components/Layout';
import { 
  Code, 
  Users, 
  BookOpen, 
  Zap, 
  TrendingUp, 
  Download, 
  Star, 
  GitBranch, 
  Package, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Search, 
  Filter, 
  Plus,
  Settings,
  BarChart3,
  PieChart,
  Globe,
  Shield,
  Cpu,
  Database
} from 'lucide-react';

export default function DeveloperPortal() {
  const [loading, setLoading] = useState(true);
  const [portalData, setPortalData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setPortalData({
        overview: {
          totalDevelopers: 2847,
          activeProjects: 156,
          apiCalls: 1250000,
          documentationViews: 45672,
          averageRating: 4.7,
          supportTickets: 23
        },
        topAPIs: [
          {
            name: 'User Authentication API',
            version: 'v2.1',
            calls: 450000,
            developers: 234,
            rating: 4.8,
            status: 'stable',
            uptime: 99.9
          },
          {
            name: 'Payment Processing API',
            version: 'v1.5',
            calls: 320000,
            developers: 189,
            rating: 4.6,
            status: 'stable',
            uptime: 99.7
          },
          {
            name: 'Data Analytics API',
            version: 'v3.0',
            calls: 280000,
            developers: 156,
            rating: 4.9,
            status: 'beta',
            uptime: 98.5
          },
          {
            name: 'Notification Service API',
            version: 'v1.2',
            calls: 200000,
            developers: 145,
            rating: 4.5,
            status: 'stable',
            uptime: 99.8
          }
        ],
        recentActivity: [
          {
            id: 1,
            type: 'api_release',
            title: 'New API Version Released',
            description: 'Payment Processing API v1.5 with enhanced security features',
            timestamp: '2 hours ago',
            user: 'API Team',
            impact: 'high'
          },
          {
            id: 2,
            type: 'documentation',
            title: 'Documentation Updated',
            description: 'Added new code examples for User Authentication API',
            timestamp: '4 hours ago',
            user: 'docs@company.com',
            impact: 'medium'
          },
          {
            id: 3,
            type: 'developer_onboard',
            title: 'New Developer Registered',
            description: '15 new developers joined the platform today',
            timestamp: '6 hours ago',
            user: 'System',
            impact: 'low'
          },
          {
            id: 4,
            type: 'support_ticket',
            title: 'Support Ticket Resolved',
            description: 'Rate limiting issue resolved for Analytics API',
            timestamp: '8 hours ago',
            user: 'Support Team',
            impact: 'medium'
          }
        ],
        sdkDownloads: [
          { name: 'JavaScript SDK', downloads: 12500, trend: '+15.2%' },
          { name: 'Python SDK', downloads: 8900, trend: '+8.7%' },
          { name: 'Java SDK', downloads: 6700, trend: '+12.1%' },
          { name: 'PHP SDK', downloads: 4300, trend: '+5.4%' },
          { name: 'Ruby SDK', downloads: 2100, trend: '+3.2%' }
        ],
        supportMetrics: {
          averageResponseTime: '2.3 hours',
          resolutionRate: 94.5,
          satisfactionScore: 4.6,
          openTickets: 23,
          resolvedToday: 18
        },
        communityStats: {
          forumPosts: 1250,
          codeExamples: 340,
          tutorials: 89,
          contributors: 156
        }
      });
      setLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'stable': return 'text-green-600 bg-green-50';
      case 'beta': return 'text-yellow-600 bg-yellow-50';
      case 'deprecated': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'api_release': return <Package className="w-4 h-4" />;
      case 'documentation': return <BookOpen className="w-4 h-4" />;
      case 'developer_onboard': return <Users className="w-4 h-4" />;
      case 'support_ticket': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <span>Platform Owner</span>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">Developer Portal Management</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Code className="w-8 h-8 text-blue-600 mr-3" />
                  Developer Portal Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Developer ecosystem management and analytics
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add API
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
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
                  <p className="text-sm font-medium text-gray-600">Total Developers</p>
                  <p className="text-2xl font-bold text-gray-900">{portalData.overview.totalDevelopers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% this month
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{portalData.overview.activeProjects}</p>
                </div>
                <GitBranch className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.3% growth
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{(portalData.overview.apiCalls / 1000000).toFixed(1)}M</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.7% this week
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documentation Views</p>
                  <p className="text-2xl font-bold text-gray-900">{portalData.overview.documentationViews.toLocaleString()}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +22.1% increase
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{portalData.overview.averageRating}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Star className="w-4 h-4 mr-1" />
                Excellent rating
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Support Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{portalData.overview.supportTickets}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-red-600">
                <Clock className="w-4 h-4 mr-1" />
                2.3h avg response
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Top APIs */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-2" />
                  Top Performing APIs
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {portalData.topAPIs.map((api, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{api.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(api.status)}`}>
                            {api.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>v{api.version}</span>
                          <span>{api.calls.toLocaleString()} calls</span>
                          <span>{api.developers} developers</span>
                          <span className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            {api.rating}
                          </span>
                          <span className="text-green-600">{api.uptime}% uptime</span>
                        </div>
                      </div>
                      <button className="ml-4 text-gray-400 hover:text-gray-600">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SDK Downloads */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Download className="w-5 h-5 text-blue-600 mr-2" />
                  SDK Downloads
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {portalData.sdkDownloads.map((sdk, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sdk.name}</p>
                        <p className="text-xs text-gray-500">{sdk.downloads.toLocaleString()} downloads</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        sdk.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {sdk.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Support Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 text-blue-600 mr-2" />
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {portalData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getImpactColor(activity.impact)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <span>{activity.timestamp}</span>
                          <span>•</span>
                          <span>{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Support Metrics */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 text-blue-600 mr-2" />
                  Support Metrics
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{portalData.supportMetrics.averageResponseTime}</p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{portalData.supportMetrics.resolutionRate}%</p>
                    <p className="text-sm text-gray-600">Resolution Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{portalData.supportMetrics.satisfactionScore}</p>
                    <p className="text-sm text-gray-600">Satisfaction Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{portalData.supportMetrics.openTickets}</p>
                    <p className="text-sm text-gray-600">Open Tickets</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Resolved Today</span>
                    <span className="font-medium text-green-600">{portalData.supportMetrics.resolvedToday}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                Developer Community
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{portalData.communityStats.forumPosts.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Forum Posts</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                    <Code className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{portalData.communityStats.codeExamples}</p>
                  <p className="text-sm text-gray-600">Code Examples</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{portalData.communityStats.tutorials}</p>
                  <p className="text-sm text-gray-600">Tutorials</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{portalData.communityStats.contributors}</p>
                  <p className="text-sm text-gray-600">Contributors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Advanced Developer Portal Features
                </h3>
                <p className="text-blue-700 mt-1">
                  Enhanced developer onboarding, API versioning management, automated testing tools, and developer success scoring coming soon.
                </p>
              </div>
              <div className="flex space-x-2">
                <Cpu className="w-8 h-8 text-blue-600" />
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}