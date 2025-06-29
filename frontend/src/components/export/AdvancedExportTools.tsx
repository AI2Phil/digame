import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Download, Upload, FileText, Database, Globe, Settings,
  Calendar, Filter, RefreshCw, CheckCircle, AlertTriangle,
  Clock, Play, Pause, Square, Eye, Edit, Trash2, Copy,
  FileSpreadsheet, FileImage, Archive, Share, Link,
  Server, Webhook, Mail, MessageSquare, Slack
} from 'lucide-react';

interface ExportJob {
  id: string;
  name: string;
  type: 'manual' | 'scheduled' | 'triggered';
  format: 'csv' | 'xlsx' | 'json' | 'pdf' | 'xml';
  data_source: string;
  filters: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    timezone: string;
  };
  destination: {
    type: 'download' | 'email' | 'ftp' | 'api' | 's3' | 'webhook';
    config: Record<string, any>;
  };
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  last_run?: string;
  next_run?: string;
  file_size?: number;
  record_count?: number;
}

interface IntegrationConnection {
  id: string;
  name: string;
  type: 'api' | 'database' | 'webhook' | 'ftp' | 'email' | 'cloud_storage';
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  config: {
    endpoint?: string;
    authentication?: string;
    credentials?: Record<string, any>;
  };
  last_sync?: string;
  sync_frequency?: string;
  data_flow: 'export' | 'import' | 'bidirectional';
  created_at: string;
}

interface DataMapping {
  id: string;
  name: string;
  source_schema: Record<string, string>;
  target_schema: Record<string, string>;
  transformations: Array<{
    field: string;
    operation: string;
    parameters: any;
  }>;
  validation_rules: Array<{
    field: string;
    rule: string;
    message: string;
  }>;
}

export const AdvancedExportTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exports' | 'integrations' | 'mappings' | 'history' | 'settings'>('exports');
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Daily User Analytics Export',
      type: 'scheduled',
      format: 'csv',
      data_source: 'analytics.users',
      filters: { date_range: 'last_24_hours' },
      schedule: {
        frequency: 'daily',
        time: '06:00',
        timezone: 'UTC'
      },
      destination: {
        type: 'email',
        config: { recipients: ['analytics@company.com'] }
      },
      status: 'completed',
      created_at: '2024-02-20T10:00:00Z',
      last_run: '2024-02-28T06:00:00Z',
      next_run: '2024-03-01T06:00:00Z',
      file_size: 2048576,
      record_count: 15420
    },
    {
      id: '2',
      name: 'Weekly Revenue Report',
      type: 'scheduled',
      format: 'xlsx',
      data_source: 'analytics.revenue',
      filters: { date_range: 'last_7_days' },
      schedule: {
        frequency: 'weekly',
        time: '09:00',
        timezone: 'UTC'
      },
      destination: {
        type: 's3',
        config: { bucket: 'company-reports', path: '/weekly-reports/' }
      },
      status: 'running',
      created_at: '2024-02-15T10:00:00Z',
      last_run: '2024-02-26T09:00:00Z',
      next_run: '2024-03-04T09:00:00Z',
      file_size: 5242880,
      record_count: 8934
    },
    {
      id: '3',
      name: 'Security Alerts Export',
      type: 'triggered',
      format: 'json',
      data_source: 'security.alerts',
      filters: { severity: 'high' },
      destination: {
        type: 'webhook',
        config: { url: 'https://security-system.company.com/alerts' }
      },
      status: 'pending',
      created_at: '2024-02-28T14:30:00Z',
      record_count: 23
    }
  ]);

  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([
    {
      id: '1',
      name: 'Salesforce CRM',
      type: 'api',
      provider: 'Salesforce',
      status: 'connected',
      config: {
        endpoint: 'https://company.salesforce.com/services/data/v58.0/',
        authentication: 'oauth2'
      },
      last_sync: '2024-02-28T10:30:00Z',
      sync_frequency: 'hourly',
      data_flow: 'bidirectional',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Data Warehouse',
      type: 'database',
      provider: 'PostgreSQL',
      status: 'connected',
      config: {
        endpoint: 'warehouse.company.com:5432',
        authentication: 'credentials'
      },
      last_sync: '2024-02-28T11:00:00Z',
      sync_frequency: 'daily',
      data_flow: 'export',
      created_at: '2024-01-20T10:00:00Z'
    },
    {
      id: '3',
      name: 'Slack Notifications',
      type: 'webhook',
      provider: 'Slack',
      status: 'connected',
      config: {
        endpoint: 'https://hooks.slack.com/services/...',
        authentication: 'webhook_url'
      },
      last_sync: '2024-02-28T14:45:00Z',
      sync_frequency: 'real-time',
      data_flow: 'export',
      created_at: '2024-02-01T10:00:00Z'
    },
    {
      id: '4',
      name: 'AWS S3 Storage',
      type: 'cloud_storage',
      provider: 'Amazon S3',
      status: 'error',
      config: {
        endpoint: 's3.amazonaws.com',
        authentication: 'access_key'
      },
      last_sync: '2024-02-27T18:00:00Z',
      sync_frequency: 'daily',
      data_flow: 'export',
      created_at: '2024-01-10T10:00:00Z'
    }
  ]);

  const [dataMappings, setDataMappings] = useState<DataMapping[]>([
    {
      id: '1',
      name: 'User Data to CRM',
      source_schema: {
        user_id: 'string',
        email: 'string',
        first_name: 'string',
        last_name: 'string',
        created_at: 'datetime'
      },
      target_schema: {
        Id: 'string',
        Email: 'string',
        FirstName: 'string',
        LastName: 'string',
        CreatedDate: 'datetime'
      },
      transformations: [
        { field: 'user_id', operation: 'map', parameters: { target: 'Id' } },
        { field: 'created_at', operation: 'format_date', parameters: { format: 'YYYY-MM-DD' } }
      ],
      validation_rules: [
        { field: 'email', rule: 'required', message: 'Email is required' },
        { field: 'email', rule: 'email_format', message: 'Invalid email format' }
      ]
    }
  ]);

  const handleRunExport = async (jobId: string) => {
    setExportJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'running' as const }
          : job
      )
    );

    // Simulate export process
    setTimeout(() => {
      setExportJobs(prev =>
        prev.map(job =>
          job.id === jobId
            ? { 
                ...job, 
                status: 'completed' as const,
                last_run: new Date().toISOString(),
                file_size: Math.floor(Math.random() * 10000000),
                record_count: Math.floor(Math.random() * 50000)
              }
            : job
        )
      );
    }, 3000);
  };

  const handleCancelExport = (jobId: string) => {
    setExportJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'cancelled' as const }
          : job
      )
    );
  };

  const handleTestConnection = async (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'connected' as const, last_sync: new Date().toISOString() }
          : integration
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <Square className="h-4 w-4 text-gray-600" />;
      case 'disconnected':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'json':
      case 'xml':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'salesforce':
        return <Database className="h-4 w-4 text-blue-600" />;
      case 'postgresql':
        return <Database className="h-4 w-4 text-blue-800" />;
      case 'slack':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'amazon s3':
        return <Archive className="h-4 w-4 text-orange-600" />;
      default:
        return <Server className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderExports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Export Jobs</h2>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          New Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {exportJobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{job.name}</h3>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(job.status)}
                      <Badge 
                        variant={job.status === 'completed' ? 'success' : job.status === 'running' ? 'warning' : job.status === 'failed' ? 'error' : 'default'}
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {getFormatIcon(job.format)}
                      <span className="text-sm text-gray-600 uppercase">{job.format}</span>
                    </div>
                    <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                      {job.type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Data Source:</span>
                      <p className="font-medium">{job.data_source}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Destination:</span>
                      <p className="font-medium capitalize">{job.destination.type}</p>
                    </div>
                    {job.record_count && (
                      <div>
                        <span className="text-gray-600">Records:</span>
                        <p className="font-medium">{job.record_count.toLocaleString()}</p>
                      </div>
                    )}
                    {job.file_size && (
                      <div>
                        <span className="text-gray-600">File Size:</span>
                        <p className="font-medium">{formatFileSize(job.file_size)}</p>
                      </div>
                    )}
                  </div>

                  {job.schedule && (
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>Schedule: {job.schedule.frequency} at {job.schedule.time}</span>
                      {job.last_run && <span>Last Run: {new Date(job.last_run).toLocaleString()}</span>}
                      {job.next_run && <span>Next Run: {new Date(job.next_run).toLocaleString()}</span>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {job.status === 'pending' || job.status === 'failed' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunExport(job.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                  ) : job.status === 'running' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelExport(job.id)}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Integration Connections</h2>
        <Button>
          <Link className="h-4 w-4 mr-2" />
          New Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getProviderIcon(integration.provider)}
                  <CardTitle className="text-sm">{integration.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(integration.status)}
                  <Badge 
                    variant={integration.status === 'connected' ? 'success' : integration.status === 'error' ? 'error' : 'warning'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {integration.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <p className="font-medium capitalize">{integration.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Data Flow:</span>
                    <p className="font-medium capitalize">{integration.data_flow}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Sync Frequency:</span>
                    <p className="font-medium">{integration.sync_frequency}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Sync:</span>
                    <p className="font-medium">
                      {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(integration.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMappings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Data Mappings</h2>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          New Mapping
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {dataMappings.map((mapping) => (
          <Card key={mapping.id}>
            <CardHeader>
              <CardTitle className="text-sm">{mapping.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Source Schema</h4>
                    <div className="space-y-1">
                      {Object.entries(mapping.source_schema).map(([field, type]) => (
                        <div key={field} className="flex items-center justify-between text-sm">
                          <span className="font-mono">{field}</span>
                          <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                            {type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Target Schema</h4>
                    <div className="space-y-1">
                      {Object.entries(mapping.target_schema).map(([field, type]) => (
                        <div key={field} className="flex items-center justify-between text-sm">
                          <span className="font-mono">{field}</span>
                          <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                            {type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Transformations</h4>
                  <div className="space-y-1">
                    {mapping.transformations.map((transform, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-mono">{transform.field}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{transform.operation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Export & Integration Tools</h1>
          <p className="text-gray-600">Enhanced data export and external system integration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'exports', label: 'Export Jobs', icon: Download },
            { id: 'integrations', label: 'Integrations', icon: Link },
            { id: 'mappings', label: 'Data Mappings', icon: Settings },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
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

      {/* Tab Content */}
      <div>
        {activeTab === 'exports' && renderExports()}
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'mappings' && renderMappings()}
        {activeTab === 'history' && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Export History</h3>
            <p className="text-gray-600">Detailed export and integration history coming soon</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Export Settings</h3>
            <p className="text-gray-600">Global export and integration configuration coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedExportTools;