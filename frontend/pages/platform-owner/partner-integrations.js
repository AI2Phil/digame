import { useState, useEffect } from 'react';
import Layout from '../../src/components/Layout';
import { 
  Link, 
  Users, 
  Globe, 
  Zap, 
  TrendingUp, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Settings, 
  ExternalLink, 
  Search, 
  Filter, 
  Plus,
  Shield,
  Database,
  Cpu,
  BarChart3,
  PieChart,
  RefreshCw,
  Key,
  Webhook,
  GitBranch,
  Package,
  Monitor,
  AlertCircle
} from 'lucide-react';

export default function PartnerIntegrations() {
  const [loading, setLoading] = useState(true);
  const [integrationData, setIntegrationData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setIntegrationData({
        overview: {
          totalPartners: 127,
          activeIntegrations: 89,
          dataVolume: 2.4, // TB
          apiCalls: 850000,
          uptime: 99.7,
          errorRate: 0.3
        },
        partners: [
          {
            id: 1,
            name: 'Salesforce',
            category: 'CRM',
            status: 'active',
            integration: 'REST API',
            dataVolume: 450000,
            lastSync: '2 minutes ago',
            uptime: 99.9,
            errorRate: 0.1,
            version: 'v2.1',
            endpoints: 12
          },
          {
            id: 2,
            name: 'Stripe',
            category: 'Payment',
            status: 'active',
            integration: 'Webhook',
            dataVolume: 320000,
            lastSync: '5 minutes ago',
            uptime: 99.8,
            errorRate: 0.2,
            version: 'v1.5',
            endpoints: 8
          },
          {
            id: 3,
            name: 'HubSpot',
            category: 'Marketing',
            status: 'active',
            integration: 'GraphQL',
            dataVolume: 280000,
            lastSync: '1 minute ago',
            uptime: 99.6,
            errorRate: 0.4,
            version: 'v3.0',
            endpoints: 15
          },
          {
            id: 4,
            name: 'Slack',
            category: 'Communication',
            status: 'warning',
            integration: 'REST API',
            dataVolume: 150000,
            lastSync: '15 minutes ago',
            uptime: 98.5,
            errorRate: 1.2,
            version: 'v1.8',
            endpoints: 6
          },
          {
            id: 5,
            name: 'Zendesk',
            category: 'Support',
            status: 'active',
            integration: 'REST API',
            dataVolume: 95000,
            lastSync: '3 minutes ago',
            uptime: 99.4,
            errorRate: 0.6,
            version: 'v2.0',
            endpoints: 10
          },
          {
            id: 6,
            name: 'Mailchimp',
            category: 'Marketing',
            status: 'maintenance',
            integration: 'REST API',
            dataVolume: 75000,
            lastSync: '2 hours ago',
            uptime: 97.2,
            errorRate: 2.1,
            version: 'v1.3',
            endpoints: 7
          }
        ],
        recentActivity: [
          {
            id: 1,
            type: 'integration_added',
            title: 'New Integration Added',
            description: 'Successfully connected to HubSpot Marketing API',
            timestamp: '1 hour ago',
            partner: 'HubSpot',
            severity: 'info'
          },
          {
            id: 2,
            type: 'sync_completed',
            title: 'Data Sync Completed',
            description: 'Salesforce CRM data synchronized successfully',
            timestamp: '2 hours ago',
            partner: 'Salesforce',
            severity: 'success'
          },
          {
            id: 3,
            type: 'error_detected',
            title: 'Integration Error',
            description: 'Rate limit exceeded for Slack API calls',
            timestamp: '3 hours ago',
            partner: 'Slack',
            severity: 'warning'
          },
          {
            id: 4,
            type: 'maintenance_started',
            title: 'Maintenance Mode',
            description: 'Mailchimp integration under scheduled maintenance',
            timestamp: '4 hours ago',
            partner: 'Mailchimp',
            severity: 'info'
          }
        ],
        categoryStats: [
          { name: 'CRM', count: 23, volume: 1200000, status: 'healthy' },
          { name: 'Payment', count: 15, volume: 890000, status: 'healthy' },
          { name: 'Marketing', count: 18, volume: 650000, status: 'warning' },
          { name: 'Communication', count: 12, volume: 420000, status: 'healthy' },
          { name: 'Support', count: 8, volume: 280000, status: 'healthy' },
          { name: 'Analytics', count: 13, volume: 340000, status: 'healthy' }
        ],
        performanceMetrics: {
          averageResponseTime: 245, // ms
          successRate: 99.7,
          dataAccuracy: 98.9,
          syncFrequency: '15 minutes',
          totalEndpoints: 156
        }
      });
      setLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'maintenance': return 'text-blue-600 bg-blue-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'integration_added': return <Plus className="w-4 h-4" />;
      case 'sync_completed': return <RefreshCw className="w-4 h-4" />;
      case 'error_detected': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance_started': return <Settings className="w-4 h-4" />;
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
                  <span className="text-gray-900 font-medium">Partner Integration Hub</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Link className="w-8 h-8 text-blue-600 mr-3" />
                  Partner Integration Hub
                </h1>
                <p className="text-gray-600 mt-1">
                  Third-party integration management and monitoring
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Integration
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
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="CRM">CRM</option>
                  <option value="Payment">Payment</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Communication">Communication</option>
                  <option value="Support">Support</option>
                  <option value="Analytics">Analytics</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-gray-400" />
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="warning">Warning</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Partners</p>
                  <p className="text-2xl font-bold text-gray-900">{integrationData.overview.totalPartners}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8 this month
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                  <p className="text-2xl font-bold text-gray-900">{integrationData.overview.activeIntegrations}</p>
                </div>
                <Link className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                {((integrationData.overview.activeIntegrations / integrationData.overview.totalPartners) * 100).toFixed(1)}% active
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Volume</p>
                  <p className="text-2xl font-bold text-gray-900">{integrationData.overview.dataVolume}TB</p>
                </div>
                <Database className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.2% growth
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{(integrationData.overview.apiCalls / 1000).toFixed(0)}K</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +22.1% today
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{integrationData.overview.uptime}%</p>
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
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{integrationData.overview.errorRate}%</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                -0.2% improvement
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Partner Integrations */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 text-blue-600 mr-2" />
                  Partner Integrations
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {integrationData.partners.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-medium text-gray-900">{partner.name}</h4>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                              {partner.category}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(partner.status)}`}>
                              {getStatusIcon(partner.status)}
                              <span className="ml-1">{partner.status}</span>
                            </span>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Integration:</span> {partner.integration}
                          </div>
                          <div>
                            <span className="font-medium">Data Volume:</span> {partner.dataVolume.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Last Sync:</span> {partner.lastSync}
                          </div>
                          <div>
                            <span className="font-medium">Uptime:</span> <span className="text-green-600">{partner.uptime}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>Version {partner.version} • {partner.endpoints} endpoints</span>
                          <span className={`font-medium ${partner.errorRate < 0.5 ? 'text-green-600' : partner.errorRate < 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {partner.errorRate}% error rate
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
                  {integrationData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <span>{activity.timestamp}</span>
                          <span>•</span>
                          <span>{activity.partner}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="w-5 h-5 text-blue-600 mr-2" />
                  Integration Categories
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {integrationData.categoryStats.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          category.status === 'healthy' ? 'bg-green-500' : 
                          category.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.count} integrations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{(category.volume / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-500">data points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                  Performance Metrics
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{integrationData.performanceMetrics.averageResponseTime}ms</p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{integrationData.performanceMetrics.successRate}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{integrationData.performanceMetrics.dataAccuracy}%</p>
                    <p className="text-sm text-gray-600">Data Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{integrationData.performanceMetrics.totalEndpoints}</p>
                    <p className="text-sm text-gray-600">Total Endpoints</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sync Frequency</span>
                    <span className="font-medium text-blue-600">{integrationData.performanceMetrics.syncFrequency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Advanced Integration Features
                </h3>
                <p className="text-blue-700 mt-1">
                  Enhanced partner onboarding, automated testing, real-time monitoring, and intelligent error recovery coming soon.
                </p>
              </div>
              <div className="flex space-x-2">
                <Webhook className="w-8 h-8 text-blue-600" />
                <Key className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}