import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Puzzle as PuzzleIcon,
  Key as KeyIcon,
  Globe as GlobeAltIcon,
  Code as CodeBracketIcon,
  Zap as BoltIcon,
  Database as DatabaseIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Clock as ClockIcon,
  ExternalLink as ArrowTopRightOnSquareIcon,
  Plus as PlusIcon,
  Settings as Cog6ToothIcon,
  BarChart3 as ChartBarIcon,
  FileText as DocumentTextIcon,
  ArrowLeft
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import NavigationHubFooter from '../../src/components/layout/NavigationHubFooter';

export default function IntegrationIndex() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  const fetchIntegrationData = async () => {
    try {
      const response = await fetch('/api/integration-hub', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setIntegrations(result.data.integrations || []);
        setStats(result.data.stats || {});
      } else {
        // Fallback to mock data if backend is unavailable
        setIntegrations(getMockIntegrations());
        setStats(getMockStats());
      }
    } catch (error) {
      console.error('Error fetching integration data:', error);
      // Fallback to mock data
      setIntegrations(getMockIntegrations());
      setStats(getMockStats());
    } finally {
      setLoading(false);
    }
  };

  const getMockIntegrations = () => [
    {
      id: 1,
      name: 'Team Collaboration API',
      description: 'Real-time team communication and task management',
      status: 'active',
      type: 'api',
      lastSync: '2 minutes ago',
      category: 'collaboration'
    },
    {
      id: 2,
      name: 'Analytics Webhook',
      description: 'Automated analytics data processing and alerts',
      status: 'active',
      type: 'webhook',
      lastSync: '15 minutes ago',
      category: 'analytics'
    },
    {
      id: 3,
      name: 'Authentication Service',
      description: 'Single sign-on and user authentication management',
      status: 'pending',
      type: 'sso',
      lastSync: 'Never',
      category: 'security'
    }
  ];

  const getMockStats = () => ({
    totalIntegrations: 4,
    activeIntegrations: 2,
    apiCallsToday: 127,
    webhookEvents: 23,
    guestIntegrations: 1,
    ssoProviders: 0,
    apiEndpoints: 8,
    webhooks: 3,
    dataSources: 2
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    if (activeFilter === 'all') return true;
    return integration.status === activeFilter;
  });

  const integrationCategories = [
    {
      title: "Guest Access",
      description: "Manage guest user access and permissions",
      icon: <GlobeAltIcon className="h-8 w-8 text-blue-600" />,
      href: "/integration/guest",
      count: stats.guestIntegrations || 0,
      status: "active"
    },
    {
      title: "Single Sign-On",
      description: "Configure SSO providers and authentication",
      icon: <KeyIcon className="h-8 w-8 text-green-600" />,
      href: "/integration/sso",
      count: stats.ssoProviders || 0,
      status: "active"
    },
    {
      title: "API Management",
      description: "Manage API keys, endpoints, and documentation",
      icon: <CodeBracketIcon className="h-8 w-8 text-purple-600" />,
      href: "/integration/api",
      count: stats.apiEndpoints || 0,
      status: "active"
    },
    {
      title: "Webhooks",
      description: "Configure webhook endpoints and event handling",
      icon: <BoltIcon className="h-8 w-8 text-orange-600" />,
      href: "/integration/webhooks",
      count: stats.webhooks || 0,
      status: "active"
    },
    {
      title: "Data Integration",
      description: "Connect external data sources and sync",
      icon: <DatabaseIcon className="h-8 w-8 text-indigo-600" />,
      href: "/integration/data",
      count: stats.dataSources || 0,
      status: "active"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Return to Dashboard Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Return to Dashboard</span>
          </Link>
        </div>
      </div>

      <PageHeader
        title="Integration & APIs"
        subtitle="Manage external integrations and API connections"
        icon={<PuzzleIcon className="w-6 h-6 text-blue-600" />}
        badge="INTEGRATION"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PuzzleIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIntegrations || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.activeIntegrations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">API Calls Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.apiCallsToday || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BoltIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Webhook Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.webhookEvents || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Integration Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationCategories.map((category, index) => (
              <Link key={index} href={category.href}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {category.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <ArrowTopRightOnSquareIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{category.count} configured</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(category.status)}`}>
                      {category.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Integrations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Integrations</h2>
              <div className="flex space-x-2">
                {['all', 'active', 'pending', 'error'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      activeFilter === filter
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredIntegrations.length > 0 ? (
              filteredIntegrations.map((integration) => (
                <div key={integration.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(integration.status)}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{integration.lastSync}</p>
                        <p className="text-xs text-gray-500">Last sync</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                        {integration.status}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Cog6ToothIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <PuzzleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No integrations found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeFilter === 'all' 
                    ? 'Get started by adding your first integration.'
                    : `No integrations with status "${activeFilter}" found.`
                  }
                </p>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Integration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">API Documentation</h3>
                <p className="text-sm text-gray-600 mt-1">View comprehensive API docs and examples</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Documentation →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Usage Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">Monitor API usage and performance metrics</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                View Analytics →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Cog6ToothIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Configure global integration preferences</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                Manage Settings →
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Hub Footer */}
        <NavigationHubFooter />
      </div>
    </div>
  );
}