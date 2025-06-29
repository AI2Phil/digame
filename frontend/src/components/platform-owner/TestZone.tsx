import React, { useState, useEffect } from 'react';
import {
  Play,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertCircle,
  Code,
  Database,
  Brain,
  TestTube,
  Download,
  Upload
} from 'lucide-react';

interface TestResult {
  success: boolean;
  test_type: string;
  results: any;
  tested_at: string;
  tested_by: string;
  execution_time?: number;
}

interface AvailableTest {
  name: string;
  endpoint: string;
  method: string;
  description: string;
  sample_data_endpoint?: string;
  parameters?: string[];
}

const TestZone: React.FC = () => {
  const [activeTab, setActiveTab] = useState('intelligence');
  const [availableTests, setAvailableTests] = useState<AvailableTest[]>([]);
  const [sampleData, setSampleData] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [customData, setCustomData] = useState('');
  const [selectedTest, setSelectedTest] = useState<string>('');

  const tabs = [
    { id: 'intelligence', label: 'Intelligence APIs', icon: <Brain className="w-4 h-4" /> },
    { id: 'digital-twin', label: 'Digital Twin APIs', icon: <TestTube className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics APIs', icon: <Database className="w-4 h-4" /> },
    { id: 'custom', label: 'Custom Tests', icon: <Code className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (activeTab === 'intelligence') {
      fetchAvailableTests();
      fetchSampleData();
    }
  }, [activeTab]);

  const fetchAvailableTests = async () => {
    try {
      const response = await fetch('/api/v1/platform-owner/test-zone/available-tests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTests(data.available_tests.intelligence_tests || []);
      }
    } catch (error) {
      console.error('Failed to fetch available tests:', error);
    }
  };

  const fetchSampleData = async () => {
    try {
      const response = await fetch('/api/v1/platform-owner/test-zone/intelligence/sample-data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSampleData(data.sample_data);
      }
    } catch (error) {
      console.error('Failed to fetch sample data:', error);
    }
  };

  const runTest = async (testName: string, endpoint: string, testData?: any) => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testData || {})
      });

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      const testResult: TestResult = {
        success: response.ok,
        test_type: testName,
        results: result,
        tested_at: new Date().toISOString(),
        tested_by: 'Platform Owner',
        execution_time: executionTime
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (error) {
      const testResult: TestResult = {
        success: false,
        test_type: testName,
        results: { error: error.message },
        tested_at: new Date().toISOString(),
        tested_by: 'Platform Owner',
        execution_time: Date.now() - startTime
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const getTestData = (testName: string) => {
    if (!sampleData) return null;

    switch (testName.toLowerCase()) {
      case 'pattern analysis':
        return sampleData.pattern_analysis_data;
      case 'productivity prediction':
        return sampleData.productivity_prediction_data;
      case 'comprehensive insights':
        return {
          ...sampleData.pattern_analysis_data,
          ...sampleData.productivity_prediction_data,
          ...sampleData.task_forecasting_data,
          ...sampleData.energy_prediction_data
        };
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Zone</h1>
        <p className="text-gray-600">Test and validate API endpoints with sample data</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Intelligence APIs Tab */}
      {activeTab === 'intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Tests</h3>
            
            {availableTests.map((test, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{test.method}</span>
                      <span className="font-mono">{test.endpoint}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => runTest(test.name, test.endpoint, getTestData(test.name))}
                    disabled={loading}
                    className="ml-4 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span className="ml-1">Test</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Sample Data Section */}
            {sampleData && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Sample Test Data</h4>
                  <button
                    onClick={() => copyToClipboard(formatJson(sampleData))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-auto">
                  <pre className="text-xs text-gray-700">
                    {formatJson(sampleData)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
              <button
                onClick={() => setTestResults([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </button>
            </div>

            {testResults.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No test results yet. Run a test to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{result.test_type}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(result.tested_at).toLocaleString()} • {result.execution_time}ms
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(formatJson(result.results))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-auto">
                      <pre className="text-xs text-gray-700">
                        {formatJson(result.results)}
                      </pre>
                    </div>

                    {result.success && result.results.patterns_found !== undefined && (
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✓ {result.results.patterns_found} patterns found
                        </span>
                        {result.results.high_confidence_patterns !== undefined && (
                          <span className="text-blue-600">
                            {result.results.high_confidence_patterns} high confidence
                          </span>
                        )}
                      </div>
                    )}

                    {result.success && result.results.predictions && (
                      <div className="mt-3 text-sm text-green-600">
                        ✓ {result.results.predictions.length} predictions generated
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Digital Twin APIs Tab */}
      {activeTab === 'digital-twin' && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Twin API Tests</h3>
          <p className="text-gray-600 mb-4">Digital Twin API testing will be available soon.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-blue-900 mb-2">Planned Tests:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Digital Twin Creation</li>
              <li>• Twin Profile Management</li>
              <li>• Behavioral Model Testing</li>
              <li>• Twin Interaction Simulation</li>
            </ul>
          </div>
        </div>
      )}

      {/* Analytics APIs Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics API Tests</h3>
          <p className="text-gray-600 mb-4">Analytics API testing will be available soon.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <h4 className="font-medium text-green-900 mb-2">Planned Tests:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• User Behavior Analytics</li>
              <li>• Performance Metrics</li>
              <li>• Usage Statistics</li>
              <li>• Trend Analysis</li>
            </ul>
          </div>
        </div>
      )}

      {/* Custom Tests Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom API Test</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint URL</label>
                <input
                  type="text"
                  placeholder="/api/v1/your-endpoint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Body (JSON)</label>
                <textarea
                  value={customData}
                  onChange={(e) => setCustomData(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Custom Test Guidelines</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Ensure you have proper authentication tokens</li>
              <li>• Use valid JSON format for request bodies</li>
              <li>• Test endpoints should be accessible from this environment</li>
              <li>• Be cautious when testing endpoints that modify data</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestZone;