import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { ShieldCheck, AlertTriangle, TrendingUp, Target, Activity, Users } from 'lucide-react';

export default function RiskManagementCenter() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading risk management data
    setTimeout(() => {
      setRiskData({
        overallRiskScore: 3.2,
        highRisks: 4,
        mediumRisks: 12,
        lowRisks: 23,
        mitigatedRisks: 18,
        riskTrend: 'decreasing'
      });
      setLoading(false);
    }, 1000);
  }, []);

  const riskCategories = [
    {
      id: 'operational',
      name: 'Operational Risk',
      score: 4.2,
      level: 'Medium',
      trend: 'stable',
      risks: 8,
      description: 'Risks related to day-to-day operations and processes'
    },
    {
      id: 'security',
      name: 'Security Risk',
      score: 2.8,
      level: 'Low',
      trend: 'decreasing',
      risks: 5,
      description: 'Cybersecurity and data protection risks'
    },
    {
      id: 'compliance',
      name: 'Compliance Risk',
      score: 3.5,
      level: 'Medium',
      trend: 'stable',
      risks: 6,
      description: 'Regulatory and legal compliance risks'
    },
    {
      id: 'financial',
      name: 'Financial Risk',
      score: 2.1,
      level: 'Low',
      trend: 'decreasing',
      risks: 3,
      description: 'Financial and market-related risks'
    },
    {
      id: 'strategic',
      name: 'Strategic Risk',
      score: 5.8,
      level: 'High',
      trend: 'increasing',
      risks: 7,
      description: 'Strategic business and competitive risks'
    },
    {
      id: 'technology',
      name: 'Technology Risk',
      score: 3.9,
      level: 'Medium',
      trend: 'stable',
      risks: 10,
      description: 'Technology infrastructure and system risks'
    }
  ];

  const activeRisks = [
    {
      id: 'RISK-2025-001',
      title: 'Third-Party Data Breach',
      category: 'Security',
      severity: 'High',
      probability: 0.3,
      impact: 8.5,
      riskScore: 7.2,
      status: 'Active',
      owner: 'Security Team',
      identifiedDate: '2025-01-05',
      lastReviewed: '2025-01-09',
      mitigation: 'Enhanced vendor security assessments',
      mitigationStatus: 'In Progress'
    },
    {
      id: 'RISK-2025-002',
      title: 'Key Personnel Departure',
      category: 'Operational',
      severity: 'Medium',
      probability: 0.4,
      impact: 6.0,
      riskScore: 5.8,
      status: 'Active',
      owner: 'HR Team',
      identifiedDate: '2025-01-03',
      lastReviewed: '2025-01-08',
      mitigation: 'Knowledge transfer and succession planning',
      mitigationStatus: 'Planned'
    },
    {
      id: 'RISK-2025-003',
      title: 'Regulatory Changes Impact',
      category: 'Compliance',
      severity: 'Medium',
      probability: 0.6,
      impact: 5.5,
      riskScore: 6.1,
      status: 'Active',
      owner: 'Legal Team',
      identifiedDate: '2024-12-28',
      lastReviewed: '2025-01-07',
      mitigation: 'Regulatory monitoring and compliance updates',
      mitigationStatus: 'Implemented'
    }
  ];

  const riskMetrics = [
    {
      metric: 'Risk Identification Rate',
      value: 15,
      target: 12,
      trend: 'up',
      change: '+3 risks',
      unit: ' risks/month'
    },
    {
      metric: 'Mitigation Completion',
      value: 78.5,
      target: 80.0,
      trend: 'up',
      change: '+5.2%',
      unit: '%'
    },
    {
      metric: 'Average Response Time',
      value: 2.8,
      target: 3.0,
      trend: 'down',
      change: '-0.5 days',
      unit: ' days'
    },
    {
      metric: 'Risk Assessment Coverage',
      value: 94.2,
      target: 95.0,
      trend: 'up',
      change: '+2.1%',
      unit: '%'
    }
  ];

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
                    <span className="ml-4 text-sm font-medium text-gray-900">Risk Management</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <ShieldCheck className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Risk Management Center</h1>
                <p className="text-gray-600 mt-1">Enterprise risk assessment, risk scoring, threat modeling, and mitigation tracking</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overall Risk Score */}
              <div className="bg-white rounded-lg shadow p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-3xl font-bold text-yellow-600">
                            {riskData.overallRiskScore}
                          </span>
                        </div>
                      </div>
                      <ShieldCheck className="w-8 h-8 text-red-600 absolute -top-2 -right-2" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Risk Score</h2>
                  <p className="text-gray-600">Comprehensive risk assessment across all categories (1-10 scale)</p>
                  <div className="flex items-center justify-center mt-4 space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Risk Level</p>
                      <p className="font-medium text-yellow-600">Medium</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Trend</p>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1 transform rotate-180" />
                        <span className="font-medium text-green-600">Decreasing</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium text-gray-900">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* High Risks Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">High Risks</p>
                      <p className="text-2xl font-bold text-gray-900">{riskData.highRisks}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span>Require immediate attention</span>
                    </div>
                  </div>
                </div>

                {/* Medium Risks Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Medium Risks</p>
                      <p className="text-2xl font-bold text-gray-900">{riskData.mediumRisks}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-yellow-600">
                      <Target className="w-4 h-4 mr-1" />
                      <span>Monitor and plan mitigation</span>
                    </div>
                  </div>
                </div>

                {/* Low Risks Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Low Risks</p>
                      <p className="text-2xl font-bold text-gray-900">{riskData.lowRisks}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <Activity className="w-4 h-4 mr-1" />
                      <span>Acceptable risk level</span>
                    </div>
                  </div>
                </div>

                {/* Mitigated Risks Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Mitigated Risks</p>
                      <p className="text-2xl font-bold text-gray-900">{riskData.mitigatedRisks}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      <span>Successfully addressed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Categories */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Risk Categories Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {riskCategories.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(category.level)}`}>
                          {category.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-gray-900">{category.score}</span>
                        <div className={`flex items-center text-sm ${
                          category.trend === 'decreasing' ? 'text-green-600' :
                          category.trend === 'increasing' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <TrendingUp className={`w-4 h-4 mr-1 ${
                            category.trend === 'decreasing' ? 'transform rotate-180' : ''
                          }`} />
                          <span className="capitalize">{category.trend}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      <p className="text-sm text-gray-900 font-medium">{category.risks} active risks</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Risks */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Active Risk Register</h2>
                <div className="space-y-4">
                  {activeRisks.map((risk) => (
                    <div key={risk.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <AlertTriangle className={`w-6 h-6 mr-3 ${
                            risk.severity === 'High' ? 'text-red-600' :
                            risk.severity === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{risk.title}</h3>
                            <p className="text-sm text-gray-600">{risk.category} • Risk Score: {risk.riskScore}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            risk.severity === 'High' ? 'bg-red-100 text-red-800' :
                            risk.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {risk.severity}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            risk.mitigationStatus === 'Implemented' ? 'bg-green-100 text-green-800' :
                            risk.mitigationStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {risk.mitigationStatus}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Probability</p>
                          <p className="font-medium text-gray-900">{(risk.probability * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Impact</p>
                          <p className="font-medium text-gray-900">{risk.impact}/10</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Owner</p>
                          <p className="font-medium text-gray-900">{risk.owner}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Identified</p>
                          <p className="font-medium text-gray-900">{risk.identifiedDate}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700"><strong>Mitigation:</strong> {risk.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Key Risk Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {riskMetrics.map((metric, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">{metric.metric}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          metric.value >= metric.target ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {metric.value >= metric.target ? 'On Target' : 'Below Target'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.value}{metric.unit}
                        </span>
                        <div className={`flex items-center text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span>{metric.change}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Target: {metric.target}{metric.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow p-6 border-2 border-dashed border-red-200">
                <div className="text-center">
                  <ShieldCheck className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Risk Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered risk prediction, automated threat modeling, intelligent mitigation recommendations, and predictive risk analytics coming soon.</p>
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