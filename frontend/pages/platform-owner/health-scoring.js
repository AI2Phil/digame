import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Activity, Heart, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function PlatformHealthScoring() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading platform health data
    setTimeout(() => {
      setHealthData({
        overallHealthScore: 87.3,
        systemAvailability: 99.97,
        performanceScore: 92.1,
        securityScore: 89.5,
        userSatisfactionScore: 85.7,
        dataQualityScore: 91.2
      });
      setLoading(false);
    }, 1000);
  }, []);

  const healthMetrics = [
    {
      category: 'System Performance',
      score: 92.1,
      trend: 'up',
      status: 'Excellent',
      components: [
        { name: 'Response Time', score: 94, status: 'Good' },
        { name: 'Throughput', score: 91, status: 'Good' },
        { name: 'Error Rate', score: 89, status: 'Good' },
        { name: 'Resource Utilization', score: 94, status: 'Good' }
      ]
    },
    {
      category: 'Security & Compliance',
      score: 89.5,
      trend: 'up',
      status: 'Good',
      components: [
        { name: 'Vulnerability Score', score: 92, status: 'Good' },
        { name: 'Access Control', score: 88, status: 'Good' },
        { name: 'Data Protection', score: 90, status: 'Good' },
        { name: 'Compliance Status', score: 88, status: 'Good' }
      ]
    },
    {
      category: 'User Experience',
      score: 85.7,
      trend: 'stable',
      status: 'Good',
      components: [
        { name: 'Page Load Speed', score: 87, status: 'Good' },
        { name: 'User Satisfaction', score: 85, status: 'Good' },
        { name: 'Feature Adoption', score: 84, status: 'Fair' },
        { name: 'Support Tickets', score: 87, status: 'Good' }
      ]
    },
    {
      category: 'Data Quality',
      score: 91.2,
      trend: 'up',
      status: 'Excellent',
      components: [
        { name: 'Data Accuracy', score: 93, status: 'Excellent' },
        { name: 'Data Completeness', score: 90, status: 'Good' },
        { name: 'Data Consistency', score: 92, status: 'Good' },
        { name: 'Data Freshness', score: 90, status: 'Good' }
      ]
    }
  ];

  const healthTrends = [
    { date: '2025-01-01', score: 84.2 },
    { date: '2025-01-02', score: 85.1 },
    { date: '2025-01-03', score: 86.3 },
    { date: '2025-01-04', score: 85.8 },
    { date: '2025-01-05', score: 87.1 },
    { date: '2025-01-06', score: 86.9 },
    { date: '2025-01-07', score: 88.2 },
    { date: '2025-01-08', score: 87.8 },
    { date: '2025-01-09', score: 88.5 },
    { date: '2025-01-10', score: 87.3 }
  ];

  const alerts = [
    {
      severity: 'Medium',
      category: 'Performance',
      message: 'Database query response time increased by 15%',
      timestamp: '2 hours ago',
      impact: 'User experience may be affected',
      recommendation: 'Review database optimization strategies'
    },
    {
      severity: 'Low',
      category: 'Security',
      message: 'SSL certificate expires in 30 days',
      timestamp: '1 day ago',
      impact: 'Service interruption risk',
      recommendation: 'Schedule certificate renewal'
    },
    {
      severity: 'High',
      category: 'Data Quality',
      message: 'Data sync failure detected in analytics pipeline',
      timestamp: '30 minutes ago',
      impact: 'Reporting accuracy compromised',
      recommendation: 'Investigate pipeline connectivity'
    }
  ];

  const predictiveInsights = [
    {
      insight: 'Performance Degradation Risk',
      probability: 23,
      timeframe: 'Next 7 days',
      factors: ['Increasing user load', 'Memory utilization trend'],
      recommendation: 'Consider scaling resources proactively'
    },
    {
      insight: 'Security Vulnerability Window',
      probability: 12,
      timeframe: 'Next 14 days',
      factors: ['Pending security updates', 'Access pattern changes'],
      recommendation: 'Schedule security patch deployment'
    },
    {
      insight: 'User Satisfaction Decline',
      probability: 18,
      timeframe: 'Next 30 days',
      factors: ['Feature adoption slowdown', 'Support ticket increase'],
      recommendation: 'Review user feedback and feature usability'
    }
  ];

  const healthActions = [
    {
      action: 'Optimize Database Queries',
      priority: 'High',
      estimatedImpact: '+3.2 points',
      effort: 'Medium',
      category: 'Performance'
    },
    {
      action: 'Update Security Certificates',
      priority: 'Medium',
      estimatedImpact: '+1.8 points',
      effort: 'Low',
      category: 'Security'
    },
    {
      action: 'Implement Caching Strategy',
      priority: 'Medium',
      estimatedImpact: '+2.5 points',
      effort: 'High',
      category: 'Performance'
    },
    {
      action: 'User Experience Audit',
      priority: 'Low',
      estimatedImpact: '+1.5 points',
      effort: 'Medium',
      category: 'User Experience'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

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
                    <span className="ml-4 text-sm font-medium text-gray-900">Health Scoring</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform Health Scoring</h1>
                <p className="text-gray-600 mt-1">Comprehensive platform health assessment, health scores, trend analysis, and predictive alerts</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overall Health Score */}
              <div className="bg-white rounded-lg shadow p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                        <div className={`w-24 h-24 rounded-full ${getScoreBgColor(healthData.overallHealthScore)} flex items-center justify-center`}>
                          <span className={`text-3xl font-bold ${getScoreColor(healthData.overallHealthScore)}`}>
                            {healthData.overallHealthScore}
                          </span>
                        </div>
                      </div>
                      <Heart className="w-8 h-8 text-red-600 absolute -top-2 -right-2" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Platform Health Score</h2>
                  <p className="text-gray-600">Comprehensive assessment across all platform dimensions</p>
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
                      <p className="font-medium text-gray-900">2 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Health Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* System Availability Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">System Availability</p>
                      <p className="text-2xl font-bold text-gray-900">{healthData.systemAvailability}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Exceeding SLA targets</span>
                    </div>
                  </div>
                </div>

                {/* Performance Score Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Zap className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Performance Score</p>
                      <p className="text-2xl font-bold text-gray-900">{healthData.performanceScore}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Above baseline</span>
                    </div>
                  </div>
                </div>

                {/* Security Score Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Security Score</p>
                      <p className="text-2xl font-bold text-gray-900">{healthData.securityScore}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Strong security posture</span>
                    </div>
                  </div>
                </div>

                {/* User Satisfaction Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Heart className="w-8 h-8 text-pink-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">User Satisfaction</p>
                      <p className="text-2xl font-bold text-gray-900">{healthData.userSatisfactionScore}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-pink-600">
                      <Heart className="w-4 h-4 mr-1" />
                      <span>Good user experience</span>
                    </div>
                  </div>
                </div>

                {/* Data Quality Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Data Quality Score</p>
                      <p className="text-2xl font-bold text-gray-900">{healthData.dataQualityScore}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-indigo-600">
                      <Activity className="w-4 h-4 mr-1" />
                      <span>High data integrity</span>
                    </div>
                  </div>
                </div>

                {/* Health Trend Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">7-Day Trend</p>
                      <p className="text-2xl font-bold text-gray-900">+3.1</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Consistent improvement</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Health Metrics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Detailed Health Assessment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {healthMetrics.map((metric, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{metric.category}</h3>
                        <div className="flex items-center">
                          <span className={`text-2xl font-bold mr-2 ${getScoreColor(metric.score)}`}>
                            {metric.score}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            metric.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                            metric.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {metric.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {metric.components.map((component, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{component.name}</span>
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 mr-2">{component.score}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                component.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                                component.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {component.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Alerts */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Health Alerts & Recommendations</h2>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`border-l-4 p-4 rounded-lg ${
                      alert.severity === 'High' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <AlertTriangle className={`w-5 h-5 mr-3 mt-0.5 ${
                            alert.severity === 'High' ? 'text-red-600' :
                            alert.severity === 'Medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <div>
                            <h3 className="font-medium text-gray-900">{alert.message}</h3>
                            <p className="text-sm text-gray-600 mt-1">Impact: {alert.impact}</p>
                            <p className="text-sm text-gray-700 mt-1 font-medium">Recommendation: {alert.recommendation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            alert.severity === 'High' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{alert.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predictive Insights */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Predictive Health Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {predictiveInsights.map((insight, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{insight.insight}</h3>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Risk Probability</span>
                          <span className="font-medium">{insight.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              insight.probability > 20 ? 'bg-red-500' :
                              insight.probability > 10 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${insight.probability}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Timeframe: {insight.timeframe}</p>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Key Factors:</p>
                        <ul className="text-xs text-gray-500">
                          {insight.factors.map((factor, idx) => (
                            <li key={idx}>• {factor}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">{insight.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended Health Improvement Actions</h2>
                <div className="space-y-4">
                  {healthActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <h3 className="font-medium text-gray-900">{action.action}</h3>
                          <p className="text-sm text-gray-600">Category: {action.category}</p>
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          action.priority === 'High' ? 'bg-red-100 text-red-800' :
                          action.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {action.priority}
                        </span>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Implement
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg shadow p-6 border-2 border-dashed border-red-200">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Health Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered health prediction, automated remediation, intelligent alerting, and self-healing platform capabilities coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
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