import { useState, useEffect } from 'react';
import Layout from '../../src/components/Layout';
import { 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star, 
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
  BarChart3,
  PieChart,
  Eye,
  Edit,
  Trash2,
  Award,
  Globe,
  Zap,
  Heart,
  MessageSquare,
  Calendar,
  Target
} from 'lucide-react';

export default function MarketplaceManagement() {
  const [loading, setLoading] = useState(true);
  const [marketplaceData, setMarketplaceData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setMarketplaceData({
        overview: {
          totalApps: 1247,
          activeApps: 892,
          totalRevenue: 2450000,
          monthlyGrowth: 18.5,
          averageRating: 4.3,
          totalDownloads: 5670000
        },
        topApps: [
          {
            id: 1,
            name: 'Advanced Analytics Pro',
            category: 'Analytics',
            developer: 'DataViz Solutions',
            price: 49.99,
            rating: 4.8,
            downloads: 125000,
            revenue: 245000,
            status: 'active',
            featured: true,
            lastUpdate: '2024-01-10'
          },
          {
            id: 2,
            name: 'Customer Support Bot',
            category: 'Support',
            developer: 'AI Innovations',
            price: 29.99,
            rating: 4.6,
            downloads: 89000,
            revenue: 189000,
            status: 'active',
            featured: true,
            lastUpdate: '2024-01-08'
          },
          {
            id: 3,
            name: 'Marketing Automation Suite',
            category: 'Marketing',
            developer: 'MarketFlow Inc',
            price: 79.99,
            rating: 4.7,
            downloads: 67000,
            revenue: 156000,
            status: 'active',
            featured: false,
            lastUpdate: '2024-01-12'
          },
          {
            id: 4,
            name: 'Project Management Plus',
            category: 'Productivity',
            developer: 'TaskMaster LLC',
            price: 39.99,
            rating: 4.5,
            downloads: 78000,
            revenue: 134000,
            status: 'active',
            featured: false,
            lastUpdate: '2024-01-05'
          },
          {
            id: 5,
            name: 'Security Scanner Pro',
            category: 'Security',
            developer: 'SecureCode Systems',
            price: 99.99,
            rating: 4.9,
            downloads: 45000,
            revenue: 123000,
            status: 'review',
            featured: false,
            lastUpdate: '2024-01-14'
          }
        ],
        recentActivity: [
          {
            id: 1,
            type: 'app_published',
            title: 'New App Published',
            description: 'Advanced Analytics Pro v2.1 released with new features',
            timestamp: '2 hours ago',
            app: 'Advanced Analytics Pro',
            severity: 'success'
          },
          {
            id: 2,
            type: 'review_submitted',
            title: 'App Review Submitted',
            description: 'Security Scanner Pro submitted for marketplace review',
            timestamp: '4 hours ago',
            app: 'Security Scanner Pro',
            severity: 'info'
          },
          {
            id: 3,
            type: 'revenue_milestone',
            title: 'Revenue Milestone',
            description: 'Customer Support Bot reached $200K in total revenue',
            timestamp: '6 hours ago',
            app: 'Customer Support Bot',
            severity: 'success'
          },
          {
            id: 4,
            type: 'policy_violation',
            title: 'Policy Violation Detected',
            description: 'App flagged for potential policy violation - under review',
            timestamp: '8 hours ago',
            app: 'Unknown App',
            severity: 'warning'
          }
        ],
        categoryStats: [
          { name: 'Analytics', count: 234, revenue: 567000, avgRating: 4.5 },
          { name: 'Productivity', count: 189, revenue: 445000, avgRating: 4.3 },
          { name: 'Marketing', count: 156, revenue: 389000, avgRating: 4.4 },
          { name: 'Support', count: 134, revenue: 298000, avgRating: 4.6 },
          { name: 'Security', count: 98, revenue: 234000, avgRating: 4.7 },
          { name: 'Integration', count: 87, revenue: 178000, avgRating: 4.2 }
        ],
        developerMetrics: {
          totalDevelopers: 456,
          activeDevelopers: 289,
          newThisMonth: 23,
          averageRevenue: 5400,
          topDeveloper: 'DataViz Solutions'
        },
        qualityMetrics: {
          averageRating: 4.3,
          reviewCount: 12450,
          approvalRate: 87.5,
          averageReviewTime: '3.2 days'
        }
      });
      setLoading(false);
    }, 1500);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'review': return <Clock className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
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
      case 'app_published': return <Package className="w-4 h-4" />;
      case 'review_submitted': return <Eye className="w-4 h-4" />;
      case 'revenue_milestone': return <DollarSign className="w-4 h-4" />;
      case 'policy_violation': return <AlertTriangle className="w-4 h-4" />;
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
                  <span className="text-gray-900 font-medium">Marketplace Management</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Store className="w-8 h-8 text-blue-600 mr-3" />
                  Marketplace Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Platform marketplace oversight and optimization
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add App
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
                  <option value="Analytics">Analytics</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Support">Support</option>
                  <option value="Security">Security</option>
                  <option value="Integration">Integration</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-400" />
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="review">Under Review</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search marketplace apps..."
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
                  <p className="text-sm font-medium text-gray-600">Total Apps</p>
                  <p className="text-2xl font-bold text-gray-900">{marketplaceData.overview.totalApps.toLocaleString()}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +45 this month
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Apps</p>
                  <p className="text-2xl font-bold text-gray-900">{marketplaceData.overview.activeApps}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                {((marketplaceData.overview.activeApps / marketplaceData.overview.totalApps) * 100).toFixed(1)}% active
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${(marketplaceData.overview.totalRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{marketplaceData.overview.monthlyGrowth}% this month
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">{(marketplaceData.overview.totalDownloads / 1000000).toFixed(1)}M</p>
                </div>
                <Download className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +125K this week
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{marketplaceData.overview.averageRating}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Star className="w-4 h-4 mr-1" />
                Good quality
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Developers</p>
                  <p className="text-2xl font-bold text-gray-900">{marketplaceData.developerMetrics.totalDevelopers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Plus className="w-4 h-4 mr-1" />
                +{marketplaceData.developerMetrics.newThisMonth} this month
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Top Performing Apps */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 text-blue-600 mr-2" />
                  Top Performing Apps
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {marketplaceData.topApps.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-medium text-gray-900">{app.name}</h4>
                            {app.featured && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </span>
                            )}
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                              {app.category}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                              {getStatusIcon(app.status)}
                              <span className="ml-1">{app.status}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-gray-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">by {app.developer}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Price:</span> ${app.price}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            <span className="font-medium">{app.rating}</span>
                          </div>
                          <div>
                            <span className="font-medium">Downloads:</span> {app.downloads.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Revenue:</span> ${app.revenue.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>Last updated: {app.lastUpdate}</span>
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
                  {marketplaceData.recentActivity.map((activity) => (
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
                          <span>{activity.app}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category Statistics & Quality Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="w-5 h-5 text-blue-600 mr-2" />
                  Category Performance
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {marketplaceData.categoryStats.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.count} apps</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${(category.revenue / 1000).toFixed(0)}K</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          {category.avgRating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 text-blue-600 mr-2" />
                  Quality Metrics
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{marketplaceData.qualityMetrics.averageRating}</p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{marketplaceData.qualityMetrics.reviewCount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{marketplaceData.qualityMetrics.approvalRate}%</p>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{marketplaceData.qualityMetrics.averageReviewTime}</p>
                    <p className="text-sm text-gray-600">Avg Review Time</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Top Developer</span>
                    <span className="font-medium text-blue-600">{marketplaceData.developerMetrics.topDeveloper}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Metrics */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                Developer Ecosystem
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{marketplaceData.developerMetrics.totalDevelopers}</p>
                  <p className="text-sm text-gray-600">Total Developers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{marketplaceData.developerMetrics.activeDevelopers}</p>
                  <p className="text-sm text-gray-600">Active Developers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                    <Plus className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{marketplaceData.developerMetrics.newThisMonth}</p>
                  <p className="text-sm text-gray-600">New This Month</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${marketplaceData.developerMetrics.averageRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Avg Revenue</p>
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
                  Advanced Marketplace Features
                </h3>
                <p className="text-blue-700 mt-1">
                  Enhanced app discovery, automated quality scoring, developer success programs, and marketplace analytics coming soon.
                </p>
              </div>
              <div className="flex space-x-2">
                <Target className="w-8 h-8 text-blue-600" />
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}