import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Play, Pause, RotateCcw, CheckCircle, XCircle,
  AlertTriangle, Clock, Code, Database, Globe,
  Monitor, Zap, Shield, Users, Settings, Eye,
  Download, Upload, Filter, Search, Calendar,
  BarChart3, TrendingUp, Activity, FileText
} from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'idle' | 'running' | 'passed' | 'failed' | 'skipped';
  test_count: number;
  passed_count: number;
  failed_count: number;
  skipped_count: number;
  duration: number;
  last_run: string;
  coverage_percentage: number;
  environment: 'development' | 'staging' | 'production';
  automated: boolean;
  schedule?: {
    frequency: 'manual' | 'commit' | 'daily' | 'weekly';
    time?: string;
  };
}

interface TestCase {
  id: string;
  suite_id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  error_message?: string;
  stack_trace?: string;
  assertions: {
    total: number;
    passed: number;
    failed: number;
  };
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  last_run: string;
  flaky: boolean;
  retry_count: number;
}

interface TestMetrics {
  total_suites: number;
  total_tests: number;
  overall_pass_rate: number;
  average_duration: number;
  coverage_percentage: number;
  flaky_tests_count: number;
  trend_data: Array<{
    date: string;
    pass_rate: number;
    duration: number;
    coverage: number;
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    pass_rate: number;
  }>;
}

interface TestEnvironment {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  url: string;
  version: string;
  last_deployment: string;
  health_checks: Array<{
    name: string;
    status: 'passing' | 'failing';
    response_time: number;
    last_check: string;
  }>;
  resource_usage: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export const TestingSuite: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [metrics, setMetrics] = useState<TestMetrics | null>(null);
  const [environments, setEnvironments] = useState<TestEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'suites' | 'cases' | 'environments' | 'reports'>('overview');
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTestingData();
  }, []);

  const fetchTestingData = async () => {
    try {
      setLoading(true);
      
      const [suitesRes, casesRes, metricsRes, environmentsRes] = await Promise.all([
        fetch('/api/testing/suites', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/testing/cases', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/testing/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/testing/environments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (suitesRes.ok) {
        const data = await suitesRes.json();
        setTestSuites(data.suites || []);
      }

      if (casesRes.ok) {
        const data = await casesRes.json();
        setTestCases(data.cases || []);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      if (environmentsRes.ok) {
        const data = await environmentsRes.json();
        setEnvironments(data.environments || []);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load testing data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTestSuite = async (suiteId: string) => {
    try {
      setRunningTests(prev => new Set(Array.from(prev).concat(suiteId)));
      
      const response = await fetch(`/api/testing/suites/${suiteId}/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        // Poll for results
        const pollResults = async () => {
          const statusRes = await fetch(`/api/testing/suites/${suiteId}/status`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (statusRes.ok) {
            const status = await statusRes.json();
            if (status.status === 'completed' || status.status === 'failed') {
              setRunningTests(prev => {
                const updated = new Set(prev);
                updated.delete(suiteId);
                return updated;
              });
              await fetchTestingData();
            } else {
              setTimeout(pollResults, 2000);
            }
          }
        };
        
        pollResults();
      }
    } catch (err) {
      console.error('Failed to run test suite:', err);
      setRunningTests(prev => {
        const updated = new Set(prev);
        updated.delete(suiteId);
        return updated;
      });
    }
  };

  const handleRunAllTests = async () => {
    try {
      const response = await fetch('/api/testing/run-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchTestingData();
      }
    } catch (err) {
      console.error('Failed to run all tests:', err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'unit': return Code;
      case 'integration': return Database;
      case 'e2e': return Globe;
      case 'performance': return Zap;
      case 'security': return Shield;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'failed':
      case 'offline': return 'text-red-600 bg-red-100';
      case 'running':
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'skipped':
      case 'idle': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return CheckCircle;
      case 'failed': return XCircle;
      case 'running': return Play;
      case 'skipped': return Clock;
      default: return AlertTriangle;
    }
  };

  const filteredSuites = testSuites.filter(suite => {
    const matchesCategory = filterCategory === 'all' || suite.category === filterCategory;
    const matchesSearch = suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         suite.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Test Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_tests}</p>
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
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.overall_pass_rate}%</p>
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
                  <p className="text-sm font-medium text-gray-600">Coverage</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.coverage_percentage}%</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.average_duration}s</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Category Breakdown */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Test Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.category_breakdown.map((category) => {
                const IconComponent = getCategoryIcon(category.category);
                return (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{category.category}</h4>
                        <p className="text-sm text-gray-600">{category.count} tests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{category.pass_rate}%</p>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${category.pass_rate >= 90 ? 'bg-green-500' : category.pass_rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${category.pass_rate}%` }}
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

      {/* Test Environments Status */}
      <Card>
        <CardHeader>
          <CardTitle>Test Environments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {environments.map((env) => (
              <div key={env.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{env.name}</h4>
                  <Badge 
                    variant={env.status === 'healthy' ? 'success' : env.status === 'degraded' ? 'warning' : 'error'} 
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {env.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Version:</span>
                    <span className="ml-2 font-medium">{env.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">CPU:</span>
                    <span className="ml-2 font-medium">{env.resource_usage.cpu}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Memory:</span>
                    <span className="ml-2 font-medium">{env.resource_usage.memory}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Health Checks:</span>
                    <span className="ml-2 font-medium">
                      {env.health_checks.filter(hc => hc.status === 'passing').length}/{env.health_checks.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleRunAllTests}>
              <Play className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuitesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Test Suites</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search test suites..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="unit">Unit Tests</option>
            <option value="integration">Integration Tests</option>
            <option value="e2e">E2E Tests</option>
            <option value="performance">Performance Tests</option>
            <option value="security">Security Tests</option>
          </select>
          <Button onClick={handleRunAllTests}>
            <Play className="h-4 w-4 mr-2" />
            Run All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSuites.map((suite) => {
          const IconComponent = getCategoryIcon(suite.category);
          const StatusIcon = getStatusIcon(suite.status);
          const isRunning = runningTests.has(suite.id);
          
          return (
            <Card key={suite.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">{suite.name}</h4>
                      <Badge 
                        variant={suite.status === 'passed' ? 'success' : suite.status === 'failed' ? 'error' : 'warning'} 
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {isRunning ? 'Running' : suite.status}
                      </Badge>
                      <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {suite.category}
                      </Badge>
                      {suite.automated && (
                        <Badge variant="info" size="xs" icon={null} onRemove={() => {}}>
                          Automated
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{suite.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="ml-2 font-medium">{suite.test_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Passed:</span>
                        <span className="ml-2 font-medium text-green-600">{suite.passed_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Failed:</span>
                        <span className="ml-2 font-medium text-red-600">{suite.failed_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">{suite.duration}s</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Coverage:</span>
                        <span className="ml-2 font-medium">{suite.coverage_percentage}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(suite.passed_count / suite.test_count) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRunTestSuite(suite.id)}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      <span className="ml-1">{isRunning ? 'Running' : 'Run'}</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedSuite(suite)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderCasesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Test Cases</h3>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="all">All Suites</option>
            {testSuites.map((suite) => (
              <option key={suite.id} value={suite.id}>{suite.name}</option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {testCases.slice(0, 20).map((testCase) => {
          const StatusIcon = getStatusIcon(testCase.status);
          
          return (
            <Card key={testCase.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(testCase.status).split(' ')[0]}`} />
                      <h4 className="font-medium text-gray-900">{testCase.name}</h4>
                      {testCase.flaky && (
                        <Badge variant="warning" size="xs" icon={null} onRemove={() => {}}>
                          Flaky
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{testCase.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">{testCase.duration}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Assertions:</span>
                        <span className="ml-2 font-medium">{testCase.assertions.passed}/{testCase.assertions.total}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Coverage:</span>
                        <span className="ml-2 font-medium">{testCase.coverage.lines}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Retries:</span>
                        <span className="ml-2 font-medium">{testCase.retry_count}</span>
                      </div>
                    </div>

                    {testCase.error_message && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">Error:</p>
                        <p className="text-sm text-red-600 mt-1">{testCase.error_message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Debug
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderEnvironmentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Test Environments</h3>
        <Button>
          <Monitor className="h-4 w-4 mr-2" />
          Add Environment
        </Button>
      </div>

      <div className="space-y-4">
        {environments.map((env) => (
          <Card key={env.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-medium text-gray-900">{env.name}</h4>
                    <Badge 
                      variant={env.status === 'healthy' ? 'success' : env.status === 'degraded' ? 'warning' : 'error'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {env.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">URL:</span>
                      <span className="ml-2 font-medium">{env.url}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">{env.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Deploy:</span>
                      <span className="ml-2 font-medium">{new Date(env.last_deployment).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Health Checks:</span>
                      <span className="ml-2 font-medium">
                        {env.health_checks.filter(hc => hc.status === 'passing').length}/{env.health_checks.length}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">CPU</div>
                      <div className="text-lg font-bold text-gray-900">{env.resource_usage.cpu}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${env.resource_usage.cpu > 80 ? 'bg-red-500' : env.resource_usage.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${env.resource_usage.cpu}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Memory</div>
                      <div className="text-lg font-bold text-gray-900">{env.resource_usage.memory}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${env.resource_usage.memory > 80 ? 'bg-red-500' : env.resource_usage.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${env.resource_usage.memory}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Disk</div>
                      <div className="text-lg font-bold text-gray-900">{env.resource_usage.disk}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${env.resource_usage.disk > 80 ? 'bg-red-500' : env.resource_usage.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${env.resource_usage.disk}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Health Checks</h5>
                    <div className="space-y-2">
                      {env.health_checks.map((check, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{check.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={check.status === 'passing' ? 'success' : 'error'}
                              size="xs"
                              icon={null}
                              onRemove={() => {}}
                            >
                              {check.status}
                            </Badge>
                            <span className="text-gray-600">{check.response_time}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Monitor className="h-3 w-3 mr-1" />
                    Monitor
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Test Reports</h3>
      
      {/* Test Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Test Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Test trends chart</p>
              <p className="text-sm text-gray-500">Pass rate and coverage over time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Report */}
      <Card>
        <CardHeader>
          <CardTitle>Code Coverage Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Components', coverage: 92, lines: 1250, uncovered: 100 },
              { name: 'Utils', coverage: 88, lines: 450, uncovered: 54 },
              { name: 'Services', coverage: 95, lines: 800, uncovered: 40 },
              { name: 'Hooks', coverage: 85, lines: 300, uncovered: 45 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm text-gray-600">{item.coverage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.coverage >= 90 ? 'bg-green-500' : item.coverage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${item.coverage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{item.lines - item.uncovered} covered</span>
                    <span>{item.uncovered} uncovered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading testing data...</p>
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
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tests</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchTestingData}>Try Again</Button>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Testing Suite</h1>
            <p className="text-gray-600">Comprehensive testing dashboard with automated test execution and reporting</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'suites', label: 'Test Suites', icon: FileText },
                { id: 'cases', label: 'Test Cases', icon: Code },
                { id: 'environments', label: 'Environments', icon: Monitor },
                { id: 'reports', label: 'Reports', icon: TrendingUp },
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
          {activeTab === 'suites' && renderSuitesTab()}
          {activeTab === 'cases' && renderCasesTab()}
          {activeTab === 'environments' && renderEnvironmentsTab()}
          {activeTab === 'reports' && renderReportsTab()}
        </div>
      </div>

      {/* Test Suite Details Modal */}
      {selectedSuite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedSuite.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSuite(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Suite Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium capitalize">{selectedSuite.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Environment:</span>
                    <span className="ml-2 font-medium capitalize">{selectedSuite.environment}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Automated:</span>
                    <span className="ml-2 font-medium">{selectedSuite.automated ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Run:</span>
                    <span className="ml-2 font-medium">{new Date(selectedSuite.last_run).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Test Results</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedSuite.passed_count}</div>
                    <div className="text-sm text-green-700">Passed</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{selectedSuite.failed_count}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{selectedSuite.skipped_count}</div>
                    <div className="text-sm text-gray-700">Skipped</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedSuite.coverage_percentage}%</div>
                    <div className="text-sm text-blue-700">Coverage</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedSuite(null)}>
                  Close
                </Button>
                <Button onClick={() => handleRunTestSuite(selectedSuite.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Suite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};