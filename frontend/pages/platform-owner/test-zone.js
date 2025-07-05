import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  TestTube as BeakerIcon,
  Play as PlayIcon,
  Stop as StopIcon,
  RotateCcw as ArrowPathIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Clock as ClockIcon,
  Code as CodeBracketIcon,
  FileText as DocumentTextIcon,
  BarChart3 as ChartBarIcon,
  Settings as CogIcon,
  Bug as BugAntIcon,
  Rocket as RocketLaunchIcon,
  ShieldCheck as ShieldCheckIcon,
  Database as DatabaseIcon,
  Globe as GlobeAltIcon,
  Users as UserGroupIcon
} from 'lucide-react';

export default function TestZone() {
  const router = useRouter();
  const [testSuites, setTestSuites] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('suites');
  const [runningTests, setRunningTests] = useState(new Set());

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      // Simulate API calls
      const [suitesRes, resultsRes, statusRes] = await Promise.all([
        fetch('/api/platform-owner/test-suites'),
        fetch('/api/platform-owner/test-results'),
        fetch('/api/platform-owner/system-status')
      ]);
      
      const suitesData = await suitesRes.json();
      const resultsData = await resultsRes.json();
      const statusData = await statusRes.json();
      
      setTestSuites(suitesData.data || []);
      setTestResults(resultsData.data || []);
      setSystemStatus(statusData.data || {});
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'running':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuiteIcon = (type) => {
    const iconClass = "h-6 w-6";
    switch (type) {
      case 'api':
        return <CodeBracketIcon className={`${iconClass} text-blue-600`} />;
      case 'security':
        return <ShieldCheckIcon className={`${iconClass} text-red-600`} />;
      case 'database':
        return <DatabaseIcon className={`${iconClass} text-green-600`} />;
      case 'integration':
        return <GlobeAltIcon className={`${iconClass} text-purple-600`} />;
      case 'performance':
        return <ChartBarIcon className={`${iconClass} text-orange-600`} />;
      case 'ui':
        return <UserGroupIcon className={`${iconClass} text-indigo-600`} />;
      default:
        return <BeakerIcon className={`${iconClass} text-gray-600`} />;
    }
  };

  const handleRunTest = async (suiteId) => {
    try {
      setRunningTests(prev => new Set([...prev, suiteId]));
      
      const response = await fetch(`/api/platform-owner/test-suites/${suiteId}/run`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Simulate test execution
        setTimeout(() => {
          setRunningTests(prev => {
            const newSet = new Set(prev);
            newSet.delete(suiteId);
            return newSet;
          });
          fetchTestData();
        }, 3000);
      }
    } catch (error) {
      console.error('Error running test:', error);
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(suiteId);
        return newSet;
      });
    }
  };

  const handleRunAllTests = async () => {
    try {
      const response = await fetch('/api/platform-owner/test-suites/run-all', {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchTestData();
      }
    } catch (error) {
      console.error('Error running all tests:', error);
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
                <BeakerIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Test Zone</h1>
                  <p className="text-sm text-gray-600">Run system tests and monitor platform health</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleRunAllTests}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <RocketLaunchIcon className="h-4 w-4 mr-2" />
                  Run All Tests
                </button>
                <button 
                  onClick={fetchTestData}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tests Passed</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.testsPassed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tests Failed</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.testsFailed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Coverage</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.coverage || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Run</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.lastRun || 'Never'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'suites', name: 'Test Suites', icon: BeakerIcon },
                { id: 'results', name: 'Test Results', icon: DocumentTextIcon },
                { id: 'monitoring', name: 'System Monitoring', icon: ChartBarIcon },
                { id: 'intelligent-cache', name: 'Intelligent Cache', icon: CogIcon },
                { id: 'debugging', name: 'Debug Tools', icon: BugAntIcon }
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
            {activeTab === 'suites' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Test Suites</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Types</option>
                      <option value="api">API Tests</option>
                      <option value="security">Security Tests</option>
                      <option value="performance">Performance Tests</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testSuites.map((suite) => (
                    <div key={suite.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          {getSuiteIcon(suite.type)}
                          <div className="ml-3">
                            <h4 className="text-lg font-medium text-gray-900">{suite.name}</h4>
                            <p className="text-sm text-gray-600">{suite.type.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(runningTests.has(suite.id) ? 'running' : suite.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(suite.status)}`}>
                            {runningTests.has(suite.id) ? 'Running' : suite.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{suite.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tests:</span>
                          <span className="font-medium">{suite.testCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Run:</span>
                          <span className="font-medium">{suite.lastRun}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{suite.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="font-medium">{suite.successRate}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {suite.passedTests}/{suite.testCount} passed
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleRunTest(suite.id)}
                            disabled={runningTests.has(suite.id)}
                            className={`text-sm font-medium flex items-center ${
                              runningTests.has(suite.id) 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-blue-600 hover:text-blue-800'
                            }`}
                          >
                            {runningTests.has(suite.id) ? (
                              <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <PlayIcon className="h-4 w-4 mr-1" />
                            )}
                            {runningTests.has(suite.id) ? 'Running' : 'Run'}
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="all">All Results</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="warning">Warnings</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search tests..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Suite
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Run Time
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {testResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{result.testName}</div>
                            <div className="text-sm text-gray-500">{result.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getSuiteIcon(result.suiteType)}
                              <span className="ml-2 text-sm text-gray-900">{result.suiteName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(result.status)}
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                                {result.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.duration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.runTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                View Log
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <PlayIcon className="h-4 w-4" />
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

            {activeTab === 'monitoring' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">System Monitoring & Health Checks</h3>
                
                {/* Live Health Endpoints */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Enhanced Health Monitoring</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        name: 'System Health',
                        endpoint: '/health',
                        description: 'Complete system health with all services',
                        color: 'bg-blue-500',
                        icon: CheckCircleIcon
                      },
                      {
                        name: 'Database Health',
                        endpoint: '/health/database',
                        description: 'Database adapter, schema, and migration status',
                        color: 'bg-green-500',
                        icon: DatabaseIcon
                      },
                      {
                        name: 'Performance Metrics',
                        endpoint: '/health/performance',
                        description: 'Real-time performance and cache analytics',
                        color: 'bg-purple-500',
                        icon: ChartBarIcon
                      },
                      {
                        name: 'Cache Management',
                        endpoint: '/health/cache',
                        description: 'Multi-layer cache statistics and health',
                        color: 'bg-orange-500',
                        icon: CogIcon
                      },
                      {
                        name: 'Redis Status',
                        endpoint: '/health/redis',
                        description: 'Redis connection and cache health status',
                        color: 'bg-red-500',
                        icon: DatabaseIcon
                      },
                      {
                        name: 'Migration Tools',
                        endpoint: '/health/migration',
                        description: 'Database migration status and tools',
                        color: 'bg-indigo-500',
                        icon: ArrowPathIcon
                      },
                      {
                        name: 'System Information',
                        endpoint: '/health/system',
                        description: 'System resources and environment details',
                        color: 'bg-gray-500',
                        icon: CogIcon
                      },
                      {
                        name: 'Feature Status',
                        endpoint: '/health/features',
                        description: 'Platform feature availability and status',
                        color: 'bg-teal-500',
                        icon: CheckCircleIcon
                      },
                      {
                        name: 'Export Metrics',
                        endpoint: '/health/export/metrics',
                        description: 'Download comprehensive performance metrics',
                        color: 'bg-yellow-500',
                        icon: DocumentTextIcon
                      }
                    ].map((endpoint, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg ${endpoint.color}`}>
                            <endpoint.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <h5 className="text-sm font-medium text-gray-900">{endpoint.name}</h5>
                            <p className="text-xs text-gray-500">{endpoint.endpoint}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{endpoint.description}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(endpoint.endpoint, '_blank')}
                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-xs font-medium hover:bg-gray-200"
                          >
                            {endpoint.name.includes('Export') ? 'Download' : 'Test Live'}
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(window.location.origin + endpoint.endpoint)}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700"
                            title="Copy URL"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cache Management Actions */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Cache Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 rounded-lg bg-blue-500">
                          <ChartBarIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Cache Statistics</h5>
                          <p className="text-xs text-gray-500">View cache performance</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open('/health/cache', '_blank')}
                        className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded text-xs font-medium hover:bg-blue-200"
                      >
                        View Stats
                      </button>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 rounded-lg bg-red-500">
                          <ArrowPathIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Clear All Caches</h5>
                          <p className="text-xs text-gray-500">Reset cache layers</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to clear all caches?')) {
                            try {
                              const response = await fetch('/health/cache/clear', { method: 'POST' });
                              const result = await response.json();
                              alert(result.message || 'Caches cleared successfully');
                            } catch (error) {
                              alert('Failed to clear caches: ' + error.message);
                            }
                          }
                        }}
                        className="w-full bg-red-100 text-red-700 px-3 py-2 rounded text-xs font-medium hover:bg-red-200"
                      >
                        Clear Caches
                      </button>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 rounded-lg bg-green-500">
                          <DatabaseIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Migration Test</h5>
                          <p className="text-xs text-gray-500">Test database migration</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/health/migration/test', { method: 'POST' });
                            const result = await response.json();
                            alert(`Migration test: ${result.status}\n${result.message}`);
                          } catch (error) {
                            alert('Migration test failed: ' + error.message);
                          }
                        }}
                        className="w-full bg-green-100 text-green-700 px-3 py-2 rounded text-xs font-medium hover:bg-green-200"
                      >
                        Test Migration
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Testing Endpoints */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">API Testing Endpoints</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        name: 'Authentication',
                        endpoints: [
                          { method: 'POST', path: '/auth/login', desc: 'User login' },
                          { method: 'POST', path: '/auth/register', desc: 'User registration' },
                          { method: 'GET', path: '/auth/profile', desc: 'Get user profile' },
                          { method: 'POST', path: '/auth/demo', desc: 'Demo login' }
                        ],
                        color: 'bg-blue-500'
                      },
                      {
                        name: 'Analytics',
                        endpoints: [
                          { method: 'GET', path: '/analytics/web', desc: 'Web analytics' },
                          { method: 'GET', path: '/analytics/mobile', desc: 'Mobile analytics' },
                          { method: 'GET', path: '/analytics/performance', desc: 'Performance data' },
                          { method: 'GET', path: '/analytics/platform', desc: 'Platform analytics' }
                        ],
                        color: 'bg-green-500'
                      },
                      {
                        name: 'AI Tools',
                        endpoints: [
                          { method: 'GET', path: '/ai-tools', desc: 'AI tools list' },
                          { method: 'POST', path: '/ai-tools/writing', desc: 'Writing assistance' },
                          { method: 'POST', path: '/ai-tools/voice', desc: 'Voice processing' },
                          { method: 'POST', path: '/ai-tools/documents', desc: 'Document analysis' }
                        ],
                        color: 'bg-purple-500'
                      },
                      {
                        name: 'Team Management',
                        endpoints: [
                          { method: 'GET', path: '/team/dashboard', desc: 'Team dashboard' },
                          { method: 'GET', path: '/team/social', desc: 'Social features' },
                          { method: 'GET', path: '/team/mentorship', desc: 'Mentorship program' },
                          { method: 'GET', path: '/team/skills', desc: 'Skills management' }
                        ],
                        color: 'bg-indigo-500'
                      },
                      {
                        name: 'Platform Owner',
                        endpoints: [
                          { method: 'GET', path: '/platform-owner/console', desc: 'Platform console' },
                          { method: 'GET', path: '/platform-owner/tenants', desc: 'Tenant management' },
                          { method: 'GET', path: '/platform-owner/users', desc: 'User management' },
                          { method: 'GET', path: '/platform-owner/revenue', desc: 'Revenue analytics' }
                        ],
                        color: 'bg-red-500'
                      },
                      {
                        name: 'Data Management',
                        endpoints: [
                          { method: 'GET', path: '/api/data-management/overview', desc: 'Data overview & statistics' },
                          { method: 'GET', path: '/api/data-management/statistics', desc: 'Detailed data statistics' },
                          { method: 'POST', path: '/api/data-management/seed', desc: 'Generate mock data' },
                          { method: 'POST', path: '/api/data-management/cleanup', desc: 'Clean up mock data' },
                          { method: 'POST', path: '/api/data-management/reset', desc: 'Complete data reset' },
                          { method: 'GET', path: '/api/data-management/operations', desc: 'Operation history' },
                          { method: 'POST', path: '/api/data-management/export', desc: 'Export data' },
                          { method: 'GET', path: '/api/data-management/health', desc: 'Data health metrics' }
                        ],
                        color: 'bg-teal-500'
                      },
                      {
                        name: 'Advanced Data Management',
                        endpoints: [
                          { method: 'GET', path: '/api/data-management/health/comprehensive', desc: 'Comprehensive health check' },
                          { method: 'GET', path: '/api/data-management/health/trends?days=7', desc: 'Health trends over time' },
                          { method: 'GET', path: '/api/data-management/performance/metrics', desc: 'Performance metrics' },
                          { method: 'POST', path: '/api/data-management/performance/optimize', desc: 'Optimize database performance' },
                          { method: 'POST', path: '/api/data-management/performance/cache/clear', desc: 'Clear performance cache' },
                          { method: 'GET', path: '/api/data-management/backup/schedule', desc: 'Backup schedule config' },
                          { method: 'POST', path: '/api/data-management/backup/create', desc: 'Create comprehensive backup' },
                          { method: 'POST', path: '/api/data-management/backup/schedule', desc: 'Configure backup schedule' }
                        ],
                        color: 'bg-emerald-500'
                      },
                      {
                        name: 'Performance Operations',
                        endpoints: [
                          { method: 'GET', path: '/api/data-management/query/paginated?table=users&page=1&pageSize=10', desc: 'Paginated query test' },
                          { method: 'POST', path: '/api/data-management/batch/insert', desc: 'Batch insert operation' },
                          { method: 'POST', path: '/api/data-management/backup/restore', desc: 'Restore from backup' }
                        ],
                        color: 'bg-violet-500'
                      },
                      {
                        name: 'Enhanced Team APIs',
                        endpoints: [
                          { method: 'GET', path: '/team/dashboard', desc: 'Real team dashboard data' },
                          { method: 'GET', path: '/team/members', desc: 'Team members list' },
                          { method: 'GET', path: '/team/projects', desc: 'Team projects' }
                        ],
                        color: 'bg-cyan-500'
                      },
                      {
                        name: 'Digital Twin Hub',
                        endpoints: [
                          { method: 'GET', path: '/api/digital-twin/profile', desc: 'Digital twin profile data' },
                          { method: 'GET', path: '/api/digital-twin/insights', desc: 'AI-powered behavioral insights' },
                          { method: 'POST', path: '/api/digital-twin/chat', desc: 'Interactive AI chat' },
                          { method: 'GET', path: '/api/digital-twin/analytics', desc: 'Digital twin analytics data' },
                          { method: 'GET', path: '/api/digital-twin/behavior', desc: 'Behavioral analysis data' },
                          { method: 'GET', path: '/api/digital-twin/intelligence', desc: 'Intelligence testing and analysis' },
                          { method: 'GET', path: '/api/digital-twin/predictions', desc: 'Predictive analytics data' },
                          { method: 'POST', path: '/api/digital-twin/simulation', desc: 'Run digital twin simulations' },
                          { method: 'POST', path: '/api/digital-twin/onboarding', desc: 'Save onboarding configuration' }
                        ],
                        color: 'bg-pink-500'
                      },
                      {
                        name: 'Integration Hub',
                        endpoints: [
                          { method: 'GET', path: '/api/integration-hub/status', desc: 'Integration status overview' },
                          { method: 'GET', path: '/api/integration-hub/connections', desc: 'Active connections list' },
                          { method: 'GET', path: '/api/integration-hub/webhooks', desc: 'Webhook configurations' },
                          { method: 'POST', path: '/api/integration-hub/test', desc: 'Test integration connection' },
                          { method: 'GET', path: '/api/integration/api/keys', desc: 'API key management' },
                          { method: 'GET', path: '/api/integration/api/endpoints', desc: 'API endpoint management' },
                          { method: 'GET', path: '/api/integration/api/stats', desc: 'API usage statistics' },
                          { method: 'GET', path: '/api/integration/data/sources', desc: 'Data source management' },
                          { method: 'GET', path: '/api/integration/data/sync-jobs', desc: 'Data sync job monitoring' },
                          { method: 'GET', path: '/api/integration/sso/providers', desc: 'SSO provider management' },
                          { method: 'GET', path: '/api/integration/webhooks/list', desc: 'Webhook management' },
                          { method: 'GET', path: '/api/integration/guest/users', desc: 'Guest access management' }
                        ],
                        color: 'bg-amber-500'
                      },
                      {
                        name: 'Workflow Automation',
                        endpoints: [
                          { method: 'GET', path: '/api/workflow-automation/workflows', desc: 'Active workflows list' },
                          { method: 'GET', path: '/api/workflow-automation/templates', desc: 'Workflow templates' },
                          { method: 'POST', path: '/api/workflow-automation/execute', desc: 'Execute workflow' },
                          { method: 'GET', path: '/api/workflow/automation', desc: 'Automation rules and triggers' },
                          { method: 'GET', path: '/api/workflow/advanced', desc: 'Advanced workflow configurations' },
                          { method: 'GET', path: '/api/workflow/optimization', desc: 'Workflow optimization analytics' },
                          { method: 'POST', path: '/api/workflow/automation/create', desc: 'Create new automation rule' },
                          { method: 'POST', path: '/api/workflow/advanced/configure', desc: 'Configure advanced workflow' },
                          { method: 'GET', path: '/api/workflow/optimization/suggestions', desc: 'Get optimization suggestions' }
                        ],
                        color: 'bg-lime-500'
                      },
                      {
                        name: 'Security',
                        endpoints: [
                          { method: 'GET', path: '/security/mfa', desc: 'MFA management' },
                          { method: 'GET', path: '/security/access', desc: 'Access control' },
                          { method: 'GET', path: '/security/audit', desc: 'Audit logs' },
                          { method: 'GET', path: '/security/compliance', desc: 'Compliance center' }
                        ],
                        color: 'bg-yellow-500'
                      }
                    ].map((category, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
                          <h5 className="text-sm font-medium text-gray-900">{category.name}</h5>
                        </div>
                        <div className="space-y-2">
                          {category.endpoints.map((endpoint, endpointIndex) => (
                            <div key={endpointIndex} className="flex items-center justify-between text-xs">
                              <div className="flex items-center">
                                <span className={`px-2 py-1 rounded text-xs font-mono ${
                                  endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {endpoint.method}
                                </span>
                                <span className="ml-2 text-gray-600 font-mono">{endpoint.path}</span>
                              </div>
                              <button 
                                onClick={() => window.open(endpoint.path, '_blank')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <PlayIcon className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Live Performance Metrics</h4>
                    <div className="space-y-3">
                      {[
                        { metric: 'Response Time', value: '< 100ms', status: 'good', color: 'bg-green-500' },
                        { metric: 'Memory Usage', value: '10.58 MB', status: 'good', color: 'bg-green-500' },
                        { metric: 'Error Rate', value: '0%', status: 'good', color: 'bg-green-500' },
                        { metric: 'Requests/Min', value: '0', status: 'good', color: 'bg-green-500' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-900">{item.metric}</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div className={`h-2 rounded-full ${item.color} w-full`}></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Enhanced Service Status</h4>
                    <div className="space-y-3">
                      {[
                        { service: 'Backend Server', status: 'healthy', info: 'Port 3001' },
                        { service: 'Database Adapter', status: 'healthy', info: 'SQLite + PostgreSQL Ready' },
                        { service: 'Extended Schema', status: 'healthy', info: '15+ Tables Active' },
                        { service: 'Multi-Layer Cache', status: 'healthy', info: 'Memory + Redis' },
                        { service: 'Performance Monitor', status: 'healthy', info: 'Real-time Metrics' },
                        { service: 'Migration Tools', status: 'healthy', info: 'Export/Import Ready' },
                        { service: 'Redis Cache', status: 'disabled', info: 'Docker Environment Only' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div className="flex items-center">
                            {getStatusIcon(item.status === 'healthy' ? 'passed' : item.status === 'disabled' ? 'warning' : 'failed')}
                            <span className="ml-2 text-sm font-medium text-gray-900">{item.service}</span>
                          </div>
                          <span className="text-xs text-gray-600">{item.info}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Database Schema Status */}
                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Extended Database Schema (18 Tables)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { name: 'users', category: 'Core', records: '6+' },
                      { name: 'notifications', category: 'Core', records: '4+' },
                      { name: 'notification_settings', category: 'Core', records: '6+' },
                      { name: 'tasks', category: 'Productivity', records: '4+' },
                      { name: 'projects', category: 'Productivity', records: '2+' },
                      { name: 'teams', category: 'Collaboration', records: '2+' },
                      { name: 'team_members', category: 'Collaboration', records: '5+' },
                      { name: 'skills', category: 'Collaboration', records: '8+' },
                      { name: 'user_skills', category: 'Collaboration', records: '8+' },
                      { name: 'mentorship_relationships', category: 'Collaboration', records: '2+' },
                      { name: 'workflows', category: 'Automation', records: '3+' },
                      { name: 'analytics_events', category: 'Analytics', records: '100+' },
                      { name: 'audit_logs', category: 'Security', records: '0' },
                      { name: 'api_keys', category: 'Security', records: '0' },
                      { name: 'webhooks', category: 'Integration', records: '0' },
                      { name: 'reports', category: 'Reporting', records: '0' },
                      { name: 'platform_metrics', category: 'Platform', records: '0' },
                      { name: 'tenants', category: 'Platform', records: '0' }
                    ].map((table, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900">{table.name}</span>
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-600">{table.category}</span>
                          <span className="text-xs text-gray-500">{table.records}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => window.open('/health/database', '_blank')}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded text-sm font-medium hover:bg-blue-200"
                    >
                      View Detailed Database Health
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intelligent-cache' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Intelligent Cache Management & Analytics</h3>
                
                {/* Intelligent Cache Health */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Intelligent Cache Health</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        name: 'Cache Analytics',
                        endpoint: '/api/intelligent-cache/analytics',
                        description: 'Comprehensive cache performance metrics and usage patterns',
                        color: 'bg-blue-500',
                        icon: ChartBarIcon
                      },
                      {
                        name: 'Health Status',
                        endpoint: '/api/intelligent-cache/health',
                        description: 'Intelligent cache system health and component status',
                        color: 'bg-green-500',
                        icon: CheckCircleIcon
                      },
                      {
                        name: 'Usage Patterns',
                        endpoint: '/api/intelligent-cache/patterns',
                        description: 'Access patterns and predictive analytics data',
                        color: 'bg-purple-500',
                        icon: DatabaseIcon
                      },
                      {
                        name: 'Performance Metrics',
                        endpoint: '/api/intelligent-cache/performance',
                        description: 'Real-time performance metrics and optimization data',
                        color: 'bg-orange-500',
                        icon: RocketLaunchIcon
                      },
                      {
                        name: 'Warming Strategies',
                        endpoint: '/api/intelligent-cache/strategies',
                        description: 'Cache warming strategies and execution status',
                        color: 'bg-red-500',
                        icon: ArrowPathIcon
                      },
                      {
                        name: 'Cache Management',
                        endpoint: '/api/intelligent-cache/clear',
                        description: 'Clear caches and reset intelligent features',
                        color: 'bg-gray-500',
                        icon: XCircleIcon
                      }
                    ].map((endpoint, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg ${endpoint.color}`}>
                            <endpoint.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <h5 className="text-sm font-medium text-gray-900">{endpoint.name}</h5>
                            <p className="text-xs text-gray-500">{endpoint.endpoint}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{endpoint.description}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(endpoint.endpoint, '_blank')}
                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-xs font-medium hover:bg-gray-200"
                          >
                            {endpoint.name.includes('Clear') ? 'Manage' : 'View Live'}
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(window.location.origin + endpoint.endpoint)}
                            className="px-3 py-2 text-gray-500 hover:text-gray-700"
                            title="Copy URL"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cache Warming Actions */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Cache Warming Strategies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        name: 'Critical Data',
                        strategy: 'critical-data',
                        description: 'Warm critical system data and active user sessions',
                        priority: 1,
                        frequency: '5 minutes',
                        color: 'bg-red-500'
                      },
                      {
                        name: 'User Behavior',
                        strategy: 'user-behavior',
                        description: 'Warm data based on predicted user behavior patterns',
                        priority: 2,
                        frequency: '10 minutes',
                        color: 'bg-blue-500'
                      },
                      {
                        name: 'Analytics Reports',
                        strategy: 'analytics-reports',
                        description: 'Warm frequently accessed analytics and reports',
                        priority: 3,
                        frequency: '15 minutes',
                        color: 'bg-green-500'
                      },
                      {
                        name: 'API Endpoints',
                        strategy: 'api-endpoints',
                        description: 'Warm popular API endpoint responses',
                        priority: 4,
                        frequency: '20 minutes',
                        color: 'bg-purple-500'
                      },
                      {
                        name: 'Predictive Content',
                        strategy: 'predictive-content',
                        description: 'Warm content based on ML predictions and trends',
                        priority: 5,
                        frequency: '30 minutes',
                        color: 'bg-orange-500'
                      },
                      {
                        name: 'Peak Hours',
                        strategy: 'peak-hours',
                        description: 'Prepare cache for peak usage hours',
                        priority: 6,
                        frequency: '1 hour',
                        color: 'bg-indigo-500'
                      }
                    ].map((strategy, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${strategy.color} mr-2`}></div>
                            <h5 className="text-sm font-medium text-gray-900">{strategy.name}</h5>
                          </div>
                          <span className="text-xs text-gray-500">P{strategy.priority}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{strategy.description}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-gray-500">Frequency: {strategy.frequency}</span>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/intelligent-cache/warm', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ strategy: strategy.strategy })
                              });
                              const result = await response.json();
                              alert(`Strategy executed: ${result.status}\nWarmed ${result.data?.warmedCount || 0} items`);
                            } catch (error) {
                              alert('Strategy execution failed: ' + error.message);
                            }
                          }}
                          className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-xs font-medium hover:bg-gray-200"
                        >
                          Execute Strategy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Intelligent Cache Actions */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Intelligent Cache Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 rounded-lg bg-blue-500">
                          <RocketLaunchIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Predictive Warming</h5>
                          <p className="text-xs text-gray-500">AI-powered cache warming</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/intelligent-cache/predictive-warm', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ maxItems: 50, minFrequency: 5 })
                            });
                            const result = await response.json();
                            alert(`Predictive warming: ${result.status}\nWarmed ${result.data?.warmedCount || 0} items`);
                          } catch (error) {
                            alert('Predictive warming failed: ' + error.message);
                          }
                        }}
                        className="w-full bg-blue-100 text-blue-700 px-3 py-2 rounded text-xs font-medium hover:bg-blue-200"
                      >
                        Execute Warming
                      </button>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 rounded-lg bg-green-500">
                          <CogIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Auto-Optimization</h5>
                          <p className="text-xs text-gray-500">Optimize cache performance</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/intelligent-cache/optimize', {
                              method: 'POST'
                            });
                            const result = await response.json();
                            alert(`Auto-optimization: ${result.status}\nApplied ${result.data?.count || 0} optimizations`);
                          } catch (error) {
                            alert('Auto-optimization failed: ' + error.message);
                          }
                        }}
                        className="w-full bg-green-100 text-green-700 px-3 py-2 rounded text-xs font-medium hover:bg-green-200"
                      >
                        Optimize Now
                      </button>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 rounded-lg bg-purple-500">
                          <ChartBarIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Usage Analytics</h5>
                          <p className="text-xs text-gray-500">View access patterns</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open('/api/intelligent-cache/patterns?limit=100&sortBy=frequency', '_blank')}
                        className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded text-xs font-medium hover:bg-purple-200"
                      >
                        View Patterns
                      </button>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 rounded-lg bg-red-500">
                          <XCircleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">Clear All</h5>
                          <p className="text-xs text-gray-500">Reset intelligent cache</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('Clear all intelligent cache data including patterns and metrics?')) {
                            try {
                              const response = await fetch('/api/intelligent-cache/clear', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ clearPatterns: true, clearMetrics: true })
                              });
                              const result = await response.json();
                              alert(`Cache cleared: ${result.status}\n${JSON.stringify(result.data.results, null, 2)}`);
                            } catch (error) {
                              alert('Cache clear failed: ' + error.message);
                            }
                          }
                        }}
                        className="w-full bg-red-100 text-red-700 px-3 py-2 rounded text-xs font-medium hover:bg-red-200"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Intelligent Cache Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Intelligent Features</h4>
                    <div className="space-y-3">
                      {[
                        { feature: 'Predictive Caching', status: 'active', description: 'AI-powered cache predictions' },
                        { feature: 'Usage Pattern Learning', status: 'active', description: 'Automatic pattern recognition' },
                        { feature: 'Smart Invalidation', status: 'active', description: 'Cascade invalidation with related data' },
                        { feature: 'Auto-Optimization', status: 'active', description: 'Performance-based auto-tuning' },
                        { feature: 'Warming Strategies', status: 'active', description: '6 intelligent warming strategies' },
                        { feature: 'Performance Analytics', status: 'active', description: 'Real-time cache analytics' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">{item.feature}</span>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </div>
                          <span className="text-xs text-green-600 font-medium">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Cache Manager Types</h4>
                    <div className="space-y-3">
                      {[
                        { type: 'General Cache', description: 'Multi-layer memory + Redis caching', status: 'healthy' },
                        { type: 'User Cache', description: 'User data and session management', status: 'healthy' },
                        { type: 'Analytics Cache', description: 'Analytics data and reports', status: 'healthy' },
                        { type: 'API Cache', description: 'API response caching', status: 'healthy' },
                        { type: 'Intelligent Manager', description: 'AI-powered cache orchestration', status: 'healthy' },
                        { type: 'Warming Strategies', description: 'Automated cache warming', status: 'healthy' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">{item.type}</span>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </div>
                          <span className="text-xs text-green-600 font-medium">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Test Actions */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Quick Test Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: 'Test Analytics',
                        action: () => window.open('/api/intelligent-cache/analytics', '_blank'),
                        description: 'View comprehensive cache analytics'
                      },
                      {
                        name: 'Test Health',
                        action: () => window.open('/api/intelligent-cache/health', '_blank'),
                        description: 'Check intelligent cache health'
                      },
                      {
                        name: 'Test Patterns',
                        action: () => window.open('/api/intelligent-cache/patterns', '_blank'),
                        description: 'View usage patterns and predictions'
                      },
                      {
                        name: 'Test Performance',
                        action: () => window.open('/api/intelligent-cache/performance', '_blank'),
                        description: 'View real-time performance metrics'
                      }
                    ].map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h5 className="text-sm font-medium text-gray-900 mb-2">{action.name}</h5>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'debugging' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Debug Tools & System Information</h3>
                
                {/* Quick Test Actions */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Quick Test Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        name: 'Health Check',
                        action: () => window.open('/health', '_blank'),
                        icon: CheckCircleIcon,
                        color: 'bg-green-500',
                        description: 'Test system health endpoint'
                      },
                      {
                        name: 'Performance Test',
                        action: () => window.open('/health/performance', '_blank'),
                        icon: ChartBarIcon,
                        color: 'bg-blue-500',
                        description: 'Check performance metrics'
                      },
                      {
                        name: 'Redis Status',
                        action: () => window.open('/health/redis', '_blank'),
                        icon: DatabaseIcon,
                        color: 'bg-red-500',
                        description: 'Test Redis connection'
                      },
                      {
                        name: 'Demo Login',
                        action: () => window.open('/auth/demo', '_blank'),
                        icon: UserGroupIcon,
                        color: 'bg-purple-500',
                        description: 'Test demo authentication'
                      }
                    ].map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            <action.icon className="h-5 w-5 text-white" />
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">{action.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">System Information</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Platform Version:</span>
                          <span className="text-sm font-medium">v2.0.0</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Environment:</span>
                          <span className="text-sm font-medium">Development</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Backend Port:</span>
                          <span className="text-sm font-medium">3001</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Database:</span>
                          <span className="text-sm font-medium">SQLite (Extended Schema)</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Redis:</span>
                          <span className="text-sm font-medium">Disabled (Docker Only)</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Performance Monitor:</span>
                          <span className="text-sm font-medium text-green-600">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Debug Actions</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.open('/health', '_blank')}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">System Health Check</span>
                          <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Test complete system health endpoint</p>
                      </button>
                      <button
                        onClick={() => window.open('/health/performance', '_blank')}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Performance Metrics</span>
                          <ChartBarIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">View real-time performance data</p>
                      </button>
                      <button
                        onClick={() => window.open('/health/redis', '_blank')}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Redis Status</span>
                          <DatabaseIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Check Redis connection and health</p>
                      </button>
                      <button
                        onClick={() => window.open('/auth/demo', '_blank')}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Demo Authentication</span>
                          <UserGroupIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Test demo user authentication</p>
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify({
                          health: window.location.origin + '/health',
                          performance: window.location.origin + '/health/performance',
                          redis: window.location.origin + '/health/redis',
                          demo: window.location.origin + '/auth/demo'
                        }, null, 2))}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Copy Test URLs</span>
                          <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Copy all test endpoints to clipboard</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}