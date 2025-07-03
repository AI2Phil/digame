import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  BeakerIcon, 
  PlayIcon, 
  StopIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  BugAntIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  DatabaseIcon,
  GlobeAltIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

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
                <h3 className="text-lg font-medium text-gray-900 mb-6">System Monitoring</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Performance Metrics</h4>
                    <div className="space-y-3">
                      {[
                        { metric: 'CPU Usage', value: '45%', status: 'good', color: 'bg-green-500' },
                        { metric: 'Memory Usage', value: '67%', status: 'warning', color: 'bg-yellow-500' },
                        { metric: 'Disk Usage', value: '23%', status: 'good', color: 'bg-green-500' },
                        { metric: 'Network I/O', value: '12 MB/s', status: 'good', color: 'bg-green-500' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-900">{item.metric}</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className={`h-2 rounded-full ${item.color}`}
                                style={{ width: item.metric.includes('%') ? item.value : '50%' }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Service Health</h4>
                    <div className="space-y-3">
                      {[
                        { service: 'Web Server', status: 'healthy', uptime: '99.9%' },
                        { service: 'Database', status: 'healthy', uptime: '99.8%' },
                        { service: 'Cache', status: 'warning', uptime: '98.5%' },
                        { service: 'Queue', status: 'healthy', uptime: '99.7%' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div className="flex items-center">
                            {getStatusIcon(item.status === 'healthy' ? 'passed' : 'warning')}
                            <span className="ml-2 text-sm font-medium text-gray-900">{item.service}</span>
                          </div>
                          <span className="text-sm text-gray-600">{item.uptime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Recent Alerts</h4>
                  <div className="space-y-3">
                    {[
                      { alert: 'High memory usage detected', time: '5 minutes ago', severity: 'warning' },
                      { alert: 'Database connection pool exhausted', time: '1 hour ago', severity: 'critical' },
                      { alert: 'API response time increased', time: '2 hours ago', severity: 'warning' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border-l-4 border-yellow-400">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.alert}</p>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'debugging' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Debug Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">System Information</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Platform Version:</span>
                          <span className="text-sm font-medium">v2.1.0</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Environment:</span>
                          <span className="text-sm font-medium">Production</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Node.js Version:</span>
                          <span className="text-sm font-medium">v18.17.0</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Database Version:</span>
                          <span className="text-sm font-medium">PostgreSQL 15.3</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Debug Actions</h4>
                    <div className="space-y-3">
                      <button className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Clear Cache</span>
                          <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Clear all application caches</p>
                      </button>
                      <button className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Generate Test Data</span>
                          <DatabaseIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Create sample data for testing</p>
                      </button>
                      <button className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Export Logs</span>
                          <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Download system logs for analysis</p>
                      </button>
                      <button className="w-full bg-white border border-gray-300 rounded-lg p-3 text-left hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">Health Check</span>
                          <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Run comprehensive system health check</p>
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