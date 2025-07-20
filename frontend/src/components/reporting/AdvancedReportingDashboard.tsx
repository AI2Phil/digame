import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiClient, replaceApiUrl } from '../../lib/api-config';
import {
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown,
  Download, Upload, Calendar, Filter, Search, Settings,
  FileText, Image, Database, Globe, Users, Activity,
  Clock, CheckCircle, AlertTriangle, Eye, Share2,
  Plus, Edit, Trash2, Copy, RefreshCw, Play,
  Target, Zap, Shield, Building2, MessageSquare
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'chart' | 'table' | 'export';
  category: string;
  created_by: string;
  created_at: string;
  last_updated: string;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string;
    recipients: string[];
  };
  data_sources: string[];
  filters: Record<string, any>;
  visualizations: Array<{
    type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
    title: string;
    data_field: string;
    config: Record<string, any>;
  }>;
  status: 'active' | 'draft' | 'archived';
  access_level: 'public' | 'private' | 'team';
}

interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'integration';
  connection_status: 'connected' | 'disconnected' | 'error';
  last_sync: string;
  record_count: number;
  fields: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    description: string;
  }>;
}

interface ExportJob {
  id: string;
  report_id: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  file_size?: number;
  download_url?: string;
  error_message?: string;
}

interface AnalyticsMetrics {
  total_reports: number;
  active_reports: number;
  total_exports: number;
  data_points_processed: number;
  popular_categories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  usage_trends: Array<{
    date: string;
    views: number;
    exports: number;
  }>;
}

export const AdvancedReportingDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'data-sources' | 'exports' | 'analytics'>('overview');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReportingData();
  }, []);

  const fetchReportingData = async () => {
    try {
      setLoading(true);
      
      const [reportsRes, sourcesRes, exportsRes, metricsRes] = await Promise.all([
        fetch('${replaceApiUrl("")}/api/advanced-reporting/report-builder', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/advanced-reporting/data-sources', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/advanced-reporting/exports', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/advanced-reporting/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports || []);
      }

      if (sourcesRes.ok) {
        const data = await sourcesRes.json();
        setDataSources(data.sources || []);
      }

      if (exportsRes.ok) {
        const data = await exportsRes.json();
        setExportJobs(data.exports || []);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reporting data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv' | 'json') => {
    try {
      const response = await fetch(`${replaceApiUrl("")}/api/advanced-reporting/reports/${reportId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ format })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Export job created:', result.job_id);
        await fetchReportingData();
      }
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  const handleScheduleReport = async (reportId: string, schedule: any) => {
    try {
      const response = await fetch(`${replaceApiUrl("")}/api/advanced-reporting/reports/${reportId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(schedule)
      });

      if (response.ok) {
        await fetchReportingData();
      }
    } catch (err) {
      console.error('Failed to schedule report:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'completed': return 'text-green-600 bg-green-100';
      case 'draft':
      case 'pending':
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'archived':
      case 'disconnected':
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return Shield;
      case 'analytics': return BarChart3;
      case 'workflows': return Zap;
      case 'platform': return Building2;
      case 'social': return MessageSquare;
      default: return FileText;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_reports}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.active_reports}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Exports</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_exports}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Download className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Points</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.data_points_processed.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Database className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Popular Categories */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Report Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.popular_categories.map((category) => {
                const IconComponent = getCategoryIcon(category.category);
                return (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{category.category}</h4>
                        <p className="text-sm text-gray-600">{category.count} reports</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{category.percentage}%</p>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Report Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{report.name}</h4>
                    <p className="text-sm text-gray-600">Updated {new Date(report.last_updated).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge 
                  variant={report.status === 'active' ? 'success' : report.status === 'draft' ? 'warning' : 'outline'} 
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {report.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Reports</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="security">Security</option>
            <option value="analytics">Analytics</option>
            <option value="workflows">Workflows</option>
            <option value="platform">Platform</option>
            <option value="social">Social</option>
          </select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const IconComponent = getCategoryIcon(report.category);
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      <p className="text-sm text-gray-600 capitalize">{report.category}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={report.status === 'active' ? 'success' : report.status === 'draft' ? 'warning' : 'outline'} 
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{report.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Updated:</span>
                    <span className="ml-2 font-medium">{new Date(report.last_updated).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Data Sources:</span>
                    <span className="ml-2 font-medium">{report.data_sources.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Visualizations:</span>
                    <span className="ml-2 font-medium">{report.visualizations.length}</span>
                  </div>
                </div>

                {report.schedule && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Scheduled</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      {report.schedule.frequency} at {report.schedule.time}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button size="sm" onClick={() => setSelectedReport(report)}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <div className="relative group">
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => handleExportReport(report.id, 'pdf')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                        >
                          Export as PDF
                        </button>
                        <button 
                          onClick={() => handleExportReport(report.id, 'excel')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                        >
                          Export as Excel
                        </button>
                        <button 
                          onClick={() => handleExportReport(report.id, 'csv')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                        >
                          Export as CSV
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderDataSourcesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Data Sources</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Data Source
        </Button>
      </div>

      <div className="space-y-4">
        {dataSources.map((source) => (
          <Card key={source.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{source.name}</h4>
                    <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                      {source.type}
                    </Badge>
                    <Badge 
                      variant={source.connection_status === 'connected' ? 'success' : source.connection_status === 'error' ? 'error' : 'warning'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {source.connection_status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Records:</span>
                      <span className="ml-2 font-medium">{source.record_count.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fields:</span>
                      <span className="ml-2 font-medium">{source.fields.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Sync:</span>
                      <span className="ml-2 font-medium">{new Date(source.last_sync).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium capitalize">{source.type}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Available Fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {source.fields.slice(0, 8).map((field) => (
                        <Badge key={field.name} variant="outline" size="xs" icon={null} onRemove={() => {}}>
                          {field.name} ({field.type})
                        </Badge>
                      ))}
                      {source.fields.length > 8 && (
                        <Badge variant="outline" size="xs" icon={null} onRemove={() => {}}>
                          +{source.fields.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderExportsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Export Jobs</h3>
        <Button onClick={fetchReportingData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {exportJobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {reports.find(r => r.id === job.report_id)?.name || 'Unknown Report'}
                    </h4>
                    <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                      {job.format.toUpperCase()}
                    </Badge>
                    <Badge 
                      variant={job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'warning'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {job.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium capitalize">{job.status}</span>
                    </div>
                    {job.file_size && (
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium">{(job.file_size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                    {job.completed_at && (
                      <div>
                        <span className="text-gray-600">Completed:</span>
                        <span className="ml-2 font-medium">{new Date(job.completed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {job.error_message && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{job.error_message}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {job.status === 'completed' && job.download_url && (
                    <Button size="sm" onClick={() => window.open(job.download_url, '_blank')}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                  {job.status === 'failed' && (
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Reporting Analytics</h3>
      
      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Usage trends chart</p>
              <p className="text-sm text-gray-500">Report views and exports over time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{report.name}</h4>
                    <p className="text-sm text-gray-600">{report.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">1,234 views</p>
                    <p className="text-sm text-gray-600">89 exports</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Source Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataSources.slice(0, 5).map((source) => (
                <div key={source.id} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{source.name}</h4>
                    <p className="text-sm text-gray-600">{source.type}</p>
                  </div>
                  <Badge
                    variant={source.connection_status === 'connected' ? 'success' : source.connection_status === 'error' ? 'error' : 'warning'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {source.connection_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reporting data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchReportingData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Advanced Reporting</h1>
            <p className="text-gray-600">Create, manage, and export comprehensive reports and analytics</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'reports', label: 'Reports', icon: FileText },
                { id: 'data-sources', label: 'Data Sources', icon: Database },
                { id: 'exports', label: 'Exports', icon: Download },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'reports' && renderReportsTab()}
          {activeTab === 'data-sources' && renderDataSourcesTab()}
          {activeTab === 'exports' && renderExportsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedReport.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                >
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Report Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium capitalize">{selectedReport.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium capitalize">{selectedReport.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created By:</span>
                    <span className="ml-2 font-medium">{selectedReport.created_by}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Access Level:</span>
                    <span className="ml-2 font-medium capitalize">{selectedReport.access_level}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Data Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.data_sources.map((source) => (
                    <Badge key={source} variant="outline" size="sm" icon={null} onRemove={() => {}}>
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Visualizations</h4>
                <div className="space-y-2">
                  {selectedReport.visualizations.map((viz, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">{viz.title}</h5>
                        <p className="text-sm text-gray-600">Type: {viz.type} | Field: {viz.data_field}</p>
                      </div>
                      <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {viz.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                <Button>
                  Edit Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};