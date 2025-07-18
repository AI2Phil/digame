import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { TestTube, Database, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export default function DataQualityCommandCenter() {
  const [qualityData, setQualityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data quality data
    setTimeout(() => {
      setQualityData({
        overallQualityScore: 91.7,
        dataAccuracy: 94.2,
        dataCompleteness: 89.8,
        dataConsistency: 92.1,
        dataFreshness: 90.5,
        qualityIssues: 8
      });
      setLoading(false);
    }, 1000);
  }, []);

  const dataSources = [
    {
      id: 'user-analytics',
      name: 'User Analytics Database',
      type: 'PostgreSQL',
      status: 'Healthy',
      qualityScore: 95.2,
      recordCount: 2450000,
      lastUpdated: '2 minutes ago',
      issues: 2,
      accuracy: 96.1,
      completeness: 94.8,
      consistency: 94.7,
      freshness: 95.2
    },
    {
      id: 'transaction-data',
      name: 'Transaction Data Warehouse',
      type: 'Snowflake',
      status: 'Warning',
      qualityScore: 87.3,
      recordCount: 8920000,
      lastUpdated: '15 minutes ago',
      issues: 5,
      accuracy: 89.2,
      completeness: 85.1,
      consistency: 88.9,
      freshness: 86.0
    },
    {
      id: 'customer-profiles',
      name: 'Customer Profile Store',
      type: 'MongoDB',
      status: 'Healthy',
      qualityScore: 92.8,
      recordCount: 1230000,
      lastUpdated: '5 minutes ago',
      issues: 1,
      accuracy: 94.5,
      completeness: 91.2,
      consistency: 93.1,
      freshness: 92.4
    },
    {
      id: 'event-stream',
      name: 'Real-time Event Stream',
      type: 'Kafka',
      status: 'Critical',
      qualityScore: 78.9,
      recordCount: 15600000,
      lastUpdated: '1 hour ago',
      issues: 12,
      accuracy: 82.1,
      completeness: 76.8,
      consistency: 79.2,
      freshness: 77.5
    }
  ];

  const qualityIssues = [
    {
      id: 'DQ-2025-001',
      severity: 'High',
      type: 'Data Completeness',
      source: 'Transaction Data Warehouse',
      description: 'Missing customer_id in 15% of recent transactions',
      impact: 'Revenue attribution accuracy affected',
      detectedAt: '2025-01-10 06:30:00',
      status: 'Open',
      assignee: 'Data Engineering Team'
    },
    {
      id: 'DQ-2025-002',
      severity: 'Medium',
      type: 'Data Freshness',
      source: 'Real-time Event Stream',
      description: 'Event processing lag increased to 45 minutes',
      impact: 'Real-time analytics delayed',
      detectedAt: '2025-01-10 05:15:00',
      status: 'In Progress',
      assignee: 'Platform Team'
    },
    {
      id: 'DQ-2025-003',
      severity: 'Low',
      type: 'Data Consistency',
      source: 'Customer Profile Store',
      description: 'Email format inconsistencies in legacy records',
      impact: 'Email campaign targeting affected',
      detectedAt: '2025-01-09 14:20:00',
      status: 'Open',
      assignee: 'Data Quality Team'
    }
  ];

  const qualityRules = [
    {
      id: 'rule-001',
      name: 'Email Format Validation',
      type: 'Accuracy',
      source: 'Customer Profile Store',
      status: 'Active',
      passRate: 98.7,
      violations: 1250,
      lastRun: '2025-01-10 07:00:00'
    },
    {
      id: 'rule-002',
      name: 'Transaction Amount Range Check',
      type: 'Validity',
      source: 'Transaction Data Warehouse',
      status: 'Active',
      passRate: 99.2,
      violations: 890,
      lastRun: '2025-01-10 07:00:00'
    },
    {
      id: 'rule-003',
      name: 'User ID Completeness Check',
      type: 'Completeness',
      source: 'User Analytics Database',
      status: 'Active',
      passRate: 99.8,
      violations: 45,
      lastRun: '2025-01-10 07:00:00'
    },
    {
      id: 'rule-004',
      name: 'Event Timestamp Freshness',
      type: 'Freshness',
      source: 'Real-time Event Stream',
      status: 'Warning',
      passRate: 87.3,
      violations: 12400,
      lastRun: '2025-01-10 07:00:00'
    }
  ];

  const dataLineage = [
    {
      source: 'User Registration API',
      target: 'Customer Profile Store',
      transformations: ['Data Validation', 'PII Encryption', 'Format Standardization'],
      status: 'Healthy',
      lastSync: '2 minutes ago'
    },
    {
      source: 'Payment Gateway',
      target: 'Transaction Data Warehouse',
      transformations: ['Currency Conversion', 'Fraud Detection', 'Data Enrichment'],
      status: 'Warning',
      lastSync: '15 minutes ago'
    },
    {
      source: 'Application Events',
      target: 'Real-time Event Stream',
      transformations: ['Event Filtering', 'Schema Validation', 'Deduplication'],
      status: 'Critical',
      lastSync: '1 hour ago'
    }
  ];

  const qualityTrends = [
    { date: '2025-01-01', score: 89.2 },
    { date: '2025-01-02', score: 90.1 },
    { date: '2025-01-03', score: 89.8 },
    { date: '2025-01-04', score: 91.2 },
    { date: '2025-01-05', score: 90.9 },
    { date: '2025-01-06', score: 91.5 },
    { date: '2025-01-07', score: 92.1 },
    { date: '2025-01-08', score: 91.8 },
    { date: '2025-01-09', score: 92.3 },
    { date: '2025-01-10', score: 91.7 }
  ];

  const remediationActions = [
    {
      action: 'Implement Missing Value Imputation',
      source: 'Transaction Data Warehouse',
      estimatedImpact: '+3.2 quality points',
      effort: 'Medium',
      priority: 'High',
      timeline: '2 weeks'
    },
    {
      action: 'Optimize Event Processing Pipeline',
      source: 'Real-time Event Stream',
      estimatedImpact: '+5.1 quality points',
      effort: 'High',
      priority: 'High',
      timeline: '3 weeks'
    },
    {
      action: 'Standardize Email Format Validation',
      source: 'Customer Profile Store',
      estimatedImpact: '+1.8 quality points',
      effort: 'Low',
      priority: 'Medium',
      timeline: '1 week'
    },
    {
      action: 'Implement Data Deduplication',
      source: 'User Analytics Database',
      estimatedImpact: '+2.5 quality points',
      effort: 'Medium',
      priority: 'Medium',
      timeline: '2 weeks'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Platform Owner</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400">/</span>
                    <span className="ml-4 text-sm font-medium text-gray-900">Data Quality</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <TestTube className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Data Quality Command Center</h1>
                <p className="text-gray-600 mt-1">Platform-wide data quality monitoring, data lineage, quality scores, and anomaly detection</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overall Data Quality Score */}
              <div className="bg-white rounded-lg shadow p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-3xl font-bold text-indigo-600">
                            {qualityData.overallQualityScore}
                          </span>
                        </div>
                      </div>
                      <TestTube className="w-8 h-8 text-indigo-600 absolute -top-2 -right-2" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Data Quality Score</h2>
                  <p className="text-gray-600">Comprehensive assessment across all data sources and dimensions</p>
                  <div className="flex items-center justify-center mt-4 space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium text-green-600">Excellent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Trend</p>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <span className="font-medium text-green-600">Improving</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium text-gray-900">1 minute ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Quality Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Data Accuracy Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Data Accuracy</p>
                      <p className="text-2xl font-bold text-gray-900">{qualityData.dataAccuracy}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Above target threshold</span>
                    </div>
                  </div>
                </div>

                {/* Data Completeness Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Database className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Data Completeness</p>
                      <p className="text-2xl font-bold text-gray-900">{qualityData.dataCompleteness}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <Database className="w-4 h-4 mr-1" />
                      <span>Good coverage</span>
                    </div>
                  </div>
                </div>

                {/* Data Consistency Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Data Consistency</p>
                      <p className="text-2xl font-bold text-gray-900">{qualityData.dataConsistency}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <Activity className="w-4 h-4 mr-1" />
                      <span>High consistency</span>
                    </div>
                  </div>
                </div>

                {/* Data Freshness Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Data Freshness</p>
                      <p className="text-2xl font-bold text-gray-900">{qualityData.dataFreshness}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-orange-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Recent data available</span>
                    </div>
                  </div>
                </div>

                {/* Quality Issues Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Quality Issues</p>
                      <p className="text-2xl font-bold text-gray-900">{qualityData.qualityIssues}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span>Require attention</span>
                    </div>
                  </div>
                </div>

                {/* Quality Trend Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">7-Day Trend</p>
                      <p className="text-2xl font-bold text-gray-900">+2.5</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Quality improving</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Sources Quality Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Data Sources Quality Overview</h2>
                <div className="space-y-4">
                  {dataSources.map((source) => (
                    <div key={source.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Database className="w-6 h-6 text-indigo-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
                            <p className="text-sm text-gray-600">{source.type} • {source.recordCount.toLocaleString()} records</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-bold text-indigo-600">{source.qualityScore}</span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            source.status === 'Healthy' 
                              ? 'bg-green-100 text-green-800' 
                              : source.status === 'Warning'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {source.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Accuracy</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${source.accuracy}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{source.accuracy}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completeness</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${source.completeness}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{source.completeness}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Consistency</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${source.consistency}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{source.consistency}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Freshness</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full"
                                style={{ width: `${source.freshness}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{source.freshness}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Issues</p>
                            <p className="font-medium text-red-600">{source.issues}</p>
                          </div>
                          <button className="px-3 py-1 text-sm bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200">
                            Details
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Last updated: {source.lastUpdated}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Issues */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Active Data Quality Issues</h2>
                <div className="space-y-4">
                  {qualityIssues.map((issue) => (
                    <div key={issue.id} className={`border-l-4 p-4 rounded-lg ${
                      issue.severity === 'High' ? 'border-red-500 bg-red-50' :
                      issue.severity === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <AlertTriangle className={`w-5 h-5 mr-3 mt-0.5 ${
                            issue.severity === 'High' ? 'text-red-600' :
                            issue.severity === 'Medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <div>
                            <h3 className="font-medium text-gray-900">{issue.description}</h3>
                            <p className="text-sm text-gray-600 mt-1">Source: {issue.source}</p>
                            <p className="text-sm text-gray-600 mt-1">Impact: {issue.impact}</p>
                            <p className="text-sm text-gray-700 mt-1">Assigned to: {issue.assignee}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            issue.severity === 'High' ? 'bg-red-100 text-red-800' :
                            issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {issue.severity} • {issue.type}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{issue.detectedAt}</p>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            issue.status === 'Open' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Rules */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Data Quality Rules</h2>
                <div className="space-y-4">
                  {qualityRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <TestTube className="w-6 h-6 text-indigo-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{rule.name}</h3>
                          <p className="text-sm text-gray-600">Source: {rule.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Pass Rate</p>
                          <p className="text-lg font-bold text-green-600">{rule.passRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Violations</p>
                          <p className="text-lg font-bold text-red-600">{rule.violations.toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rule.status === 'Active' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rule.status}
                        </span>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                          Edit Rule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Lineage */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Data Lineage & Flow</h2>
                <div className="space-y-4">
                  {dataLineage.map((lineage, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="text-center">
                            <p className="font-medium text-gray-900">{lineage.source}</p>
                            <p className="text-sm text-gray-600">Source</p>
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="flex items-center">
                              <div className="flex-1 border-t-2 border-gray-300"></div>
                              <div className="mx-2">
                                <div className="flex flex-wrap gap-1">
                                  {lineage.transformations.map((transform, idx) => (
                                    <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                      {transform}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex-1 border-t-2 border-gray-300"></div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900">{lineage.target}</p>
                            <p className="text-sm text-gray-600">Target</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          lineage.status === 'Healthy' ? 'bg-green-100 text-green-800' :
                          lineage.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {lineage.status}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">{lineage.lastSync}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended Remediation Actions</h2>
                <div className="space-y-4">
                  {remediationActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{action.action}</h3>
                          <p className="text-sm text-gray-600">Source: {action.source}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Impact</p>
                          <p className="font-medium text-green-600">{action.estimatedImpact}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Effort</p>
                          <p className="font-medium text-gray-900">{action.effort}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Timeline</p>
                          <p className="font-medium text-gray-900">{action.timeline}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          action.priority === 'High' ? 'bg-red-100 text-red-800' :
                          action.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {action.priority}
                        </span>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                          Implement
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg shadow p-6 border-2 border-dashed border-indigo-200">
                <div className="text-center">
                  <TestTube className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Data Quality Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered data quality prediction, automated remediation, intelligent data profiling, and self-healing data pipelines coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Backend Integration In Progress
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}