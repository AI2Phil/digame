import React, { useState } from 'react';
import Head from 'next/head';
import { BarChart3, FileText, Calendar, Download, Plus, Filter, Eye, Share2, Settings, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function ReportsHub() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterPeriod, setFilterPeriod] = useState('30d');

  const reportStats = {
    totalReports: 47,
    scheduledReports: 12,
    sharedReports: 23,
    viewsThisMonth: 1847,
    downloadsThisMonth: 234,
    automatedReports: 8
  };

  const recentReports = [
    {
      id: 1,
      name: 'Monthly User Analytics',
      type: 'analytics',
      status: 'completed',
      created: '2024-01-30T10:00:00Z',
      views: 45,
      downloads: 12,
      size: '2.4 MB',
      format: 'PDF',
      schedule: 'Monthly',
      nextRun: '2024-02-01T09:00:00Z'
    },
    {
      id: 2,
      name: 'Revenue Performance Report',
      type: 'financial',
      status: 'processing',
      created: '2024-01-30T14:30:00Z',
      views: 0,
      downloads: 0,
      size: null,
      format: 'Excel',
      schedule: 'Weekly',
      nextRun: '2024-02-05T08:00:00Z'
    },
    {
      id: 3,
      name: 'Team Productivity Dashboard',
      type: 'productivity',
      status: 'completed',
      created: '2024-01-29T16:15:00Z',
      views: 78,
      downloads: 23,
      size: '1.8 MB',
      format: 'PDF',
      schedule: 'Daily',
      nextRun: '2024-01-31T07:00:00Z'
    },
    {
      id: 4,
      name: 'Security Compliance Audit',
      type: 'security',
      status: 'failed',
      created: '2024-01-29T12:00:00Z',
      views: 15,
      downloads: 3,
      size: '3.2 MB',
      format: 'PDF',
      schedule: 'Monthly',
      nextRun: '2024-02-01T10:00:00Z'
    },
    {
      id: 5,
      name: 'Digital Twin Performance',
      type: 'ai',
      status: 'completed',
      created: '2024-01-28T11:30:00Z',
      views: 92,
      downloads: 18,
      size: '4.1 MB',
      format: 'PDF',
      schedule: 'Weekly',
      nextRun: '2024-02-04T09:30:00Z'
    }
  ];

  const reportTemplates = [
    {
      id: 1,
      name: 'User Analytics Report',
      description: 'Comprehensive user behavior and engagement analytics',
      category: 'Analytics',
      estimatedTime: '5-10 minutes',
      dataPoints: 25,
      visualizations: 8
    },
    {
      id: 2,
      name: 'Financial Performance',
      description: 'Revenue, costs, and profitability analysis',
      category: 'Financial',
      estimatedTime: '3-5 minutes',
      dataPoints: 15,
      visualizations: 6
    },
    {
      id: 3,
      name: 'Team Productivity',
      description: 'Team performance metrics and productivity insights',
      category: 'Productivity',
      estimatedTime: '7-12 minutes',
      dataPoints: 30,
      visualizations: 10
    },
    {
      id: 4,
      name: 'Security & Compliance',
      description: 'Security metrics and compliance status overview',
      category: 'Security',
      estimatedTime: '4-8 minutes',
      dataPoints: 20,
      visualizations: 7
    },
    {
      id: 5,
      name: 'AI & Digital Twin',
      description: 'AI performance and digital twin analytics',
      category: 'AI/ML',
      estimatedTime: '6-10 minutes',
      dataPoints: 35,
      visualizations: 12
    },
    {
      id: 6,
      name: 'Custom Dashboard',
      description: 'Build your own custom report with drag-and-drop',
      category: 'Custom',
      estimatedTime: '10-30 minutes',
      dataPoints: 'Unlimited',
      visualizations: 'Unlimited'
    }
  ];

  const scheduledReports = [
    {
      id: 1,
      name: 'Daily Operations Summary',
      frequency: 'Daily',
      nextRun: '2024-01-31T07:00:00Z',
      recipients: ['admin@company.com', 'ops@company.com'],
      format: 'PDF',
      status: 'active'
    },
    {
      id: 2,
      name: 'Weekly Performance Review',
      frequency: 'Weekly',
      nextRun: '2024-02-05T09:00:00Z',
      recipients: ['management@company.com'],
      format: 'Excel',
      status: 'active'
    },
    {
      id: 3,
      name: 'Monthly Executive Summary',
      frequency: 'Monthly',
      nextRun: '2024-02-01T10:00:00Z',
      recipients: ['executives@company.com', 'board@company.com'],
      format: 'PDF',
      status: 'active'
    },
    {
      id: 4,
      name: 'Quarterly Business Review',
      frequency: 'Quarterly',
      nextRun: '2024-04-01T09:00:00Z',
      recipients: ['stakeholders@company.com'],
      format: 'PowerPoint',
      status: 'paused'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'analytics': return <BarChart3 className="w-4 h-4 text-blue-600" />;
      case 'financial': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'productivity': return <Settings className="w-4 h-4 text-purple-600" />;
      case 'security': return <Settings className="w-4 h-4 text-red-600" />;
      case 'ai': return <Settings className="w-4 h-4 text-indigo-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <>
      <Head>
        <title>Reports & Analytics - Digame</title>
        <meta name="description" content="Comprehensive reporting and analytics dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Reports & Analytics"
          subtitle="Comprehensive reporting and analytics dashboard"
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'create', label: 'Create Report', icon: Plus },
                  { id: 'scheduled', label: 'Scheduled Reports', icon: Calendar },
                  { id: 'analytics', label: 'Report Analytics', icon: TrendingUp }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Total Reports</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{reportStats.totalReports}</div>
                  <div className="text-sm text-gray-600">{reportStats.scheduledReports} scheduled</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Views This Month</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{reportStats.viewsThisMonth.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{reportStats.downloadsThisMonth} downloads</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Share2 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Shared Reports</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{reportStats.sharedReports}</div>
                  <div className="text-sm text-gray-600">{reportStats.automatedReports} automated</div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                    </select>
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    <span>New Report</span>
                  </button>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentReports.map((report) => (
                    <div key={report.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(report.type)}
                          <div>
                            <h4 className="font-medium text-gray-900">{report.name}</h4>
                            <p className="text-sm text-gray-600">
                              Created {new Date(report.created).toLocaleDateString()} • {report.format}
                              {report.size && ` • ${report.size}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Views:</span>
                          <span className="ml-2 font-medium">{report.views}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Downloads:</span>
                          <span className="ml-2 font-medium">{report.downloads}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Schedule:</span>
                          <span className="ml-2 font-medium">{report.schedule}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Next Run:</span>
                          <span className="ml-2 font-medium">{new Date(report.nextRun).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Create Report Tab */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Choose a Report Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{template.category}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div>Estimated time: {template.estimatedTime}</div>
                        <div>Data points: {template.dataPoints}</div>
                        <div>Visualizations: {template.visualizations}</div>
                      </div>
                      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Reports Tab */}
          {activeTab === 'scheduled' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Scheduled Reports</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Schedule New Report
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {scheduledReports.map((report) => (
                    <div key={report.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-600">
                            {report.frequency} • Next run: {new Date(report.nextRun).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Format:</span>
                          <span className="ml-2 font-medium">{report.format}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Recipients:</span>
                          <span className="ml-2 font-medium">{report.recipients.length} recipients</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Frequency:</span>
                          <span className="ml-2 font-medium">{report.frequency}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Report Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Total Views</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">12,847</div>
                  <div className="text-sm text-gray-600">+23% from last month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Download className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Downloads</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">3,456</div>
                  <div className="text-sm text-gray-600">+18% from last month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Share2 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Shares</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">892</div>
                  <div className="text-sm text-gray-600">+12% from last month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-900">Scheduled</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">24</div>
                  <div className="text-sm text-gray-600">Active schedules</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Performance</h3>
                <div className="space-y-4">
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Report analytics visualization would be displayed here</p>
                    <p className="text-sm">Charts showing views, downloads, and engagement over time</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}