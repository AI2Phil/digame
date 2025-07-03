import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  BoltIcon, 
  GlobeAltIcon, 
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
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  ShieldCheckIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

export default function WebhooksManagement() {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('webhooks');
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(null);

  useEffect(() => {
    fetchWebhookData();
  }, []);

  const fetchWebhookData = async () => {
    try {
      // Simulate API calls
      const [webhooksRes, eventsRes, statsRes] = await Promise.all([
        fetch('/api/integration/webhooks/list'),
        fetch('/api/integration/webhooks/events'),
        fetch('/api/integration/webhooks/stats')
      ]);
      
      const webhooksData = await webhooksRes.json();
      const eventsData = await eventsRes.json();
      const statsData = await statsRes.json();
      
      setWebhooks(webhooksData.data || []);
      setEvents(eventsData.data || []);
      setStats(statsData.data || {});
    } catch (error) {
      console.error('Error fetching webhook data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'paused':
        return <PauseIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'user.created': 'bg-blue-100 text-blue-800',
      'user.updated': 'bg-green-100 text-green-800',
      'user.deleted': 'bg-red-100 text-red-800',
      'project.created': 'bg-purple-100 text-purple-800',
      'task.completed': 'bg-indigo-100 text-indigo-800',
      'payment.processed': 'bg-emerald-100 text-emerald-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleTestWebhook = async (webhookId) => {
    try {
      const response = await fetch(`/api/integration/webhooks/${webhookId}/test`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Handle success
        fetchWebhookData();
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
    }
  };

  const handleToggleWebhook = async (webhookId, enabled) => {
    try {
      const response = await fetch(`/api/integration/webhooks/${webhookId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      if (response.ok) {
        fetchWebhookData();
      }
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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
                <BoltIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
                  <p className="text-sm text-gray-600">Configure webhook endpoints and event handling</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowWebhookModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Webhook
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Documentation
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
                <BoltIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Webhooks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWebhooks || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeWebhooks || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Events Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.eventsToday || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'webhooks', name: 'Webhooks', icon: BoltIcon },
                { id: 'events', name: 'Event Types', icon: CodeBracketIcon },
                { id: 'logs', name: 'Delivery Logs', icon: DocumentTextIcon },
                { id: 'security', name: 'Security', icon: ShieldCheckIcon }
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
            {activeTab === 'webhooks' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Webhook Endpoints</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="error">Error</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search webhooks..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{webhook.name}</h4>
                            <div className="ml-3 flex items-center">
                              {getStatusIcon(webhook.status)}
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(webhook.status)}`}>
                                {webhook.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center mb-2">
                            <code className="text-sm bg-white px-3 py-1 rounded border font-mono">
                              {webhook.url}
                            </code>
                            <button 
                              onClick={() => copyToClipboard(webhook.url)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">{webhook.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => handleTestWebhook(webhook.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Test
                          </button>
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

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Events</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {webhook.events.slice(0, 3).map((event, index) => (
                              <span key={index} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEventTypeColor(event)}`}>
                                {event}
                              </span>
                            ))}
                            {webhook.events.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{webhook.events.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Deliveries Today</p>
                          <p className="text-lg font-semibold text-gray-900">{webhook.deliveriesToday}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</p>
                          <p className="text-lg font-semibold text-gray-900">{webhook.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Delivery</p>
                          <p className="text-sm text-gray-900">{webhook.lastDelivery}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Secret: {webhook.hasSecret ? '✓ Configured' : '✗ Not set'}</span>
                          <span>Retries: {webhook.maxRetries}</span>
                          <span>Timeout: {webhook.timeout}s</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {webhook.status === 'active' ? (
                            <button 
                              onClick={() => handleToggleWebhook(webhook.id, false)}
                              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center"
                            >
                              <PauseIcon className="h-4 w-4 mr-1" />
                              Pause
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleWebhook(webhook.id, true)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                            >
                              <PlayIcon className="h-4 w-4 mr-1" />
                              Activate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {webhooks.length === 0 && (
                  <div className="text-center py-12">
                    <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No webhooks configured</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first webhook endpoint.</p>
                    <div className="mt-6">
                      <button 
                        onClick={() => setShowWebhookModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Webhook
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Available Event Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      category: 'User Events',
                      events: [
                        { name: 'user.created', description: 'Triggered when a new user is created' },
                        { name: 'user.updated', description: 'Triggered when user information is updated' },
                        { name: 'user.deleted', description: 'Triggered when a user is deleted' },
                        { name: 'user.login', description: 'Triggered when a user logs in' }
                      ]
                    },
                    {
                      category: 'Project Events',
                      events: [
                        { name: 'project.created', description: 'Triggered when a new project is created' },
                        { name: 'project.updated', description: 'Triggered when project details are updated' },
                        { name: 'project.deleted', description: 'Triggered when a project is deleted' },
                        { name: 'project.completed', description: 'Triggered when a project is marked complete' }
                      ]
                    },
                    {
                      category: 'Task Events',
                      events: [
                        { name: 'task.created', description: 'Triggered when a new task is created' },
                        { name: 'task.updated', description: 'Triggered when task details are updated' },
                        { name: 'task.completed', description: 'Triggered when a task is completed' },
                        { name: 'task.assigned', description: 'Triggered when a task is assigned to someone' }
                      ]
                    },
                    {
                      category: 'Payment Events',
                      events: [
                        { name: 'payment.processed', description: 'Triggered when a payment is processed' },
                        { name: 'payment.failed', description: 'Triggered when a payment fails' },
                        { name: 'subscription.created', description: 'Triggered when a subscription is created' },
                        { name: 'subscription.cancelled', description: 'Triggered when a subscription is cancelled' }
                      ]
                    }
                  ].map((category, categoryIndex) => (
                    <div key={categoryIndex} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">{category.category}</h4>
                      <div className="space-y-3">
                        {category.events.map((event, eventIndex) => (
                          <div key={eventIndex} className="bg-white rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono text-blue-600">{event.name}</code>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.name)}`}>
                                Event
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{event.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Delivery Logs</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="retry">Retry</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search logs..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Webhook
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Response
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        {
                          id: 1,
                          timestamp: '2024-01-15 14:30:25',
                          webhook: 'User Management Hook',
                          event: 'user.created',
                          status: 'success',
                          responseCode: 200,
                          responseTime: '245ms'
                        },
                        {
                          id: 2,
                          timestamp: '2024-01-15 14:28:15',
                          webhook: 'Project Notifications',
                          event: 'project.updated',
                          status: 'failed',
                          responseCode: 500,
                          responseTime: '1.2s'
                        }
                      ].map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.timestamp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.webhook}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(log.event)}`}>
                              {log.event}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{log.responseCode}</div>
                            <div className="text-xs text-gray-500">{log.responseTime}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Webhook Security</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Security Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Require HTTPS</h5>
                          <p className="text-sm text-gray-600">Only allow webhook URLs with HTTPS protocol</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Verify SSL Certificates</h5>
                          <p className="text-sm text-gray-600">Validate SSL certificates for webhook endpoints</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">IP Allowlist</h5>
                          <p className="text-sm text-gray-600">Restrict webhook deliveries to specific IP ranges</p>
                        </div>
                        <input type="checkbox" className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Signature Verification</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Signing Secret
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="password"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Enter signing secret..."
                          />
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Generate
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Used to sign webhook payloads for verification
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Signature Algorithm
                        </label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                          <option value="sha256">SHA-256</option>
                          <option value="sha1">SHA-1</option>
                          <option value="md5">MD5</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Rate Limiting</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Deliveries per Minute
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          defaultValue="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Retries
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          defaultValue="3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Webhook</h3>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., User Management Hook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint URL</label>
                  <input
                    type="url"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://your-app.com/webhooks/endpoint"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Brief description of this webhook..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Types</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {['user.created', 'user.updated', 'project.created', 'task.completed'].map((event) => (
                      <label key={event} className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-700">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}