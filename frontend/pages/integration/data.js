import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  DatabaseIcon, 
  CloudIcon, 
  ServerIcon, 
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PlusIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  LinkIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export default function DataIntegration() {
  const router = useRouter();
  const [dataSources, setDataSources] = useState([]);
  const [syncJobs, setSyncJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sources');
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    fetchDataIntegrationData();
  }, []);

  const fetchDataIntegrationData = async () => {
    try {
      // Simulate API calls
      const [sourcesRes, jobsRes, statsRes] = await Promise.all([
        fetch('/api/integration/data/sources'),
        fetch('/api/integration/data/sync-jobs'),
        fetch('/api/integration/data/stats')
      ]);
      
      const sourcesData = await sourcesRes.json();
      const jobsData = await jobsRes.json();
      const statsData = await statsRes.json();
      
      setDataSources(sourcesData.data || []);
      setSyncJobs(jobsData.data || []);
      setStats(statsData.data || {});
    } catch (error) {
      console.error('Error fetching data integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'syncing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'syncing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceTypeIcon = (type) => {
    const iconClass = "h-8 w-8";
    switch (type) {
      case 'database':
        return <DatabaseIcon className={`${iconClass} text-blue-600`} />;
      case 'cloud':
        return <CloudIcon className={`${iconClass} text-green-600`} />;
      case 'api':
        return <ServerIcon className={`${iconClass} text-purple-600`} />;
      case 'file':
        return <DocumentIcon className={`${iconClass} text-orange-600`} />;
      default:
        return <DatabaseIcon className={`${iconClass} text-gray-600`} />;
    }
  };

  const handleTestConnection = async (sourceId) => {
    try {
      const response = await fetch(`/api/integration/data/sources/${sourceId}/test`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchDataIntegrationData();
      }
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  };

  const handleSyncNow = async (sourceId) => {
    try {
      const response = await fetch(`/api/integration/data/sources/${sourceId}/sync`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchDataIntegrationData();
      }
    } catch (error) {
      console.error('Error starting sync:', error);
    }
  };

  const handleToggleSource = async (sourceId, enabled) => {
    try {
      const response = await fetch(`/api/integration/data/sources/${sourceId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      if (response.ok) {
        fetchDataIntegrationData();
      }
    } catch (error) {
      console.error('Error toggling source:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DatabaseIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Data Integration</h1>
                  <p className="text-sm text-gray-600">Connect and sync external data sources</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowSourceModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Source
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center">
                  <Cog6ToothIcon className="h-4 w-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DatabaseIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Data Sources</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSources || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.connectedSources || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowPathIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Records Synced</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recordsSynced || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Sync</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lastSync || 'Never'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'sources', name: 'Data Sources', icon: DatabaseIcon },
                { id: 'sync-jobs', name: 'Sync Jobs', icon: ArrowPathIcon },
                { id: 'mapping', name: 'Field Mapping', icon: LinkIcon },
                { id: 'monitoring', name: 'Monitoring', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'sources' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Data Sources</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Types</option>
                      <option value="database">Database</option>
                      <option value="cloud">Cloud Storage</option>
                      <option value="api">API</option>
                      <option value="file">File</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search sources..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dataSources.map((source) => (
                    <div key={source.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {getSourceTypeIcon(source.type)}
                          <div className="ml-3">
                            <h4 className="text-lg font-medium text-gray-900">{source.name}</h4>
                            <p className="text-sm text-gray-600">{source.type.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(source.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(source.status)}`}>
                            {source.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{source.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Records:</span>
                          <span className="font-medium">{source.recordCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Sync:</span>
                          <span className="font-medium">{source.lastSync}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sync Frequency:</span>
                          <span className="font-medium">{source.syncFrequency}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleTestConnection(source.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Test
                          </button>
                          <button 
                            onClick={() => handleSyncNow(source.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Sync Now
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-600">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {dataSources.length === 0 && (
                  <div className="text-center py-12">
                    <DatabaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No data sources configured</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by connecting your first data source.</p>
                    <div className="mt-6">
                      <button 
                        onClick={() => setShowSourceModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Data Source
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sync-jobs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Sync Jobs</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Status</option>
                      <option value="running">Running</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                      Run All
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Records
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Started
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {syncJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getSourceTypeIcon(job.sourceType)}
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{job.sourceName}</div>
                                <div className="text-sm text-gray-500">{job.sourceType}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {job.jobType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(job.status)}
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                {job.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{job.recordsProcessed} / {job.totalRecords}</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${(job.recordsProcessed / job.totalRecords) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {job.duration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {job.startedAt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              {job.status === 'running' ? (
                                <button className="text-red-600 hover:text-red-900">
                                  <PauseIcon className="h-4 w-4" />
                                </button>
                              ) : (
                                <button className="text-green-600 hover:text-green-900">
                                  <PlayIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'mapping' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Field Mapping</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Source to Target Mapping</h4>
                    <div className="space-y-3">
                      {[
                        { source: 'customer_id', target: 'user_id', type: 'string', required: true },
                        { source: 'first_name', target: 'firstName', type: 'string', required: true },
                        { source: 'last_name', target: 'lastName', type: 'string', required: true },
                        { source: 'email_address', target: 'email', type: 'email', required: true },
                        { source: 'phone_number', target: 'phone', type: 'string', required: false }
                      ].map((mapping, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 border">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <code className="text-sm font-mono text-blue-600">{mapping.source}</code>
                              <p className="text-xs text-gray-500">Source Field</p>
                            </div>
                            <ArrowPathIcon className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              <code className="text-sm font-mono text-green-600">{mapping.target}</code>
                              <p className="text-xs text-gray-500">Target Field</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{mapping.type}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              mapping.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {mapping.required ? 'Required' : 'Optional'}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Transformation Rules</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 border">
                        <h5 className="font-medium text-gray-900 mb-2">Date Format Conversion</h5>
                        <p className="text-sm text-gray-600 mb-2">Convert MM/DD/YYYY to YYYY-MM-DD format</p>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">12/25/2023</code>
                          <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">2023-12-25</code>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <h5 className="font-medium text-gray-900 mb-2">Text Normalization</h5>
                        <p className="text-sm text-gray-600 mb-2">Convert to lowercase and trim whitespace</p>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">" John Doe "</code>
                          <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">john doe</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Data Integration Monitoring</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Sync Performance</h4>
                    <div className="space-y-3">
                      {[
                        { source: 'Customer Database', records: 15420, time: '2.3 min', status: 'success' },
                        { source: 'Product Catalog', records: 8950, time: '1.8 min', status: 'success' },
                        { source: 'Order History', records: 25670, time: '4.1 min', status: 'warning' },
                        { source: 'User Analytics', records: 12340, time: '1.2 min', status: 'success' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.source}</p>
                            <p className="text-xs text-gray-500">{item.records} records in {item.time}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === 'success' ? 'bg-green-100 text-green-800' : 
                            item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Error Summary</h4>
                    <div className="space-y-3">
                      {[
                        { error: 'Connection timeout', count: 3, source: 'External API' },
                        { error: 'Invalid data format', count: 12, source: 'CSV Import' },
                        { error: 'Duplicate key violation', count: 5, source: 'Database Sync' },
                        { error: 'Rate limit exceeded', count: 8, source: 'Third-party API' }
                      ].map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900">{item.error}</p>
                            <span className="text-sm font-bold text-red-600">{item.count}</span>
                          </div>
                          <p className="text-xs text-gray-500">{item.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Data Quality Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border text-center">
                      <p className="text-2xl font-bold text-green-600">98.5%</p>
                      <p className="text-sm text-gray-600">Data Accuracy</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border text-center">
                      <p className="text-2xl font-bold text-blue-600">99.2%</p>
                      <p className="text-sm text-gray-600">Completeness</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border text-center">
                      <p className="text-2xl font-bold text-purple-600">97.8%</p>
                      <p className="text-sm text-gray-600">Consistency</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border text-center">
                      <p className="text-2xl font-bold text-orange-600">96.3%</p>
                      <p className="text-sm text-gray-600">Timeliness</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Data Source Modal */}
      {showSourceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Data Source</h3>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="">Select source type</option>
                    <option value="database">Database</option>
                    <option value="cloud">Cloud Storage</option>
                    <option value="api">REST API</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Customer Database"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Connection String</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Connection details or URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sync Frequency</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="manual">Manual</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Brief description of this data source..."
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSourceModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSourceModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}