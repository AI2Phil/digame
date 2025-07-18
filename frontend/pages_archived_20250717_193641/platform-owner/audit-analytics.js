import { useState, useEffect } from 'react';
import Layout from '../../src/components/Layout';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Database, 
  FileText, 
  Activity, 
  TrendingUp,
  Eye,
  Lock,
  Settings,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

export default function AuditAnalytics() {
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setAuditData({
        summary: {
          totalEvents: 45672,
          criticalEvents: 23,
          warningEvents: 156,
          infoEvents: 45493,
          complianceScore: 98.7
        },
        recentEvents: [
          {
            id: 1,
            timestamp: '2024-01-15 14:32:15',
            user: 'admin@company.com',
            action: 'User Role Modified',
            resource: 'User Management',
            severity: 'medium',
            details: 'Modified permissions for user john.doe@company.com'
          },
          {
            id: 2,
            timestamp: '2024-01-15 14:28:42',
            user: 'system',
            action: 'Data Export',
            resource: 'Customer Database',
            severity: 'high',
            details: 'Large dataset exported (10,000+ records)'
          },
          {
            id: 3,
            timestamp: '2024-01-15 14:15:33',
            user: 'jane.smith@company.com',
            action: 'Configuration Change',
            resource: 'Security Settings',
            severity: 'high',
            details: 'Modified password policy requirements'
          },
          {
            id: 4,
            timestamp: '2024-01-15 14:02:18',
            user: 'api-service',
            action: 'API Access',
            resource: 'Payment Gateway',
            severity: 'low',
            details: 'Successful payment processing API call'
          },
          {
            id: 5,
            timestamp: '2024-01-15 13:45:27',
            user: 'backup-system',
            action: 'Data Backup',
            resource: 'Database Cluster',
            severity: 'low',
            details: 'Automated daily backup completed successfully'
          }
        ],
        categories: [
          { name: 'Authentication', count: 12543, trend: '+5.2%' },
          { name: 'Data Access', count: 8921, trend: '+2.1%' },
          { name: 'Configuration', count: 3456, trend: '-1.3%' },
          { name: 'System Events', count: 15234, trend: '+8.7%' },
          { name: 'User Management', count: 5518, trend: '+3.4%' }
        ],
        complianceMetrics: [
          { framework: 'GDPR', score: 99.2, status: 'compliant' },
          { framework: 'SOC 2', score: 98.8, status: 'compliant' },
          { framework: 'HIPAA', score: 97.5, status: 'compliant' },
          { framework: 'ISO 27001', score: 99.1, status: 'compliant' }
        ]
      });
      setLoading(false);
    }, 1500);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
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
                  <span className="text-gray-900 font-medium">Audit Trail Analytics</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Shield className="w-8 h-8 text-blue-600 mr-3" />
                  Audit Trail Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  Advanced audit log analysis and compliance insights
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                <Calendar className="w-5 h-5 text-gray-400" />
                <select 
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="auth">Authentication</option>
                  <option value="data">Data Access</option>
                  <option value="config">Configuration</option>
                  <option value="system">System Events</option>
                </select>
              </div>
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search audit logs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{auditData.summary.totalEvents.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% from last period
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Events</p>
                  <p className="text-2xl font-bold text-red-600">{auditData.summary.criticalEvents}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-red-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2 from yesterday
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Warning Events</p>
                  <p className="text-2xl font-bold text-yellow-600">{auditData.summary.warningEvents}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-yellow-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                -5.2% from last week
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Info Events</p>
                  <p className="text-2xl font-bold text-green-600">{auditData.summary.infoEvents.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.7% growth
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                  <p className="text-2xl font-bold text-green-600">{auditData.summary.complianceScore}%</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Excellent rating
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Events */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  Recent Audit Events
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {auditData.recentEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                        {getSeverityIcon(event.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{event.action}</p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {event.user}
                          </span>
                          <span className="flex items-center">
                            <Database className="w-3 h-3 mr-1" />
                            {event.resource}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.timestamp}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Event Categories */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="w-5 h-5 text-blue-600 mr-2" />
                  Event Categories
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {auditData.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.count.toLocaleString()} events</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          category.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {category.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Metrics */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Lock className="w-5 h-5 text-blue-600 mr-2" />
                Compliance Framework Status
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {auditData.complianceMetrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray={`${metric.score}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-900">{metric.score}%</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">{metric.framework}</h4>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {metric.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Advanced Analytics Features
                </h3>
                <p className="text-blue-700 mt-1">
                  Enhanced audit analytics with AI-powered insights, anomaly detection, and predictive compliance monitoring coming soon.
                </p>
              </div>
              <div className="flex space-x-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <LineChart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}