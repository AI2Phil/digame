import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Scale, Shield, CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';

export default function ComplianceDashboard() {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading compliance data
    setTimeout(() => {
      setComplianceData({
        overallComplianceScore: 94.3,
        gdprCompliance: 96.8,
        soc2Compliance: 92.1,
        hipaaCompliance: 95.4,
        isoCompliance: 91.7,
        activeAudits: 2,
        pendingActions: 5
      });
      setLoading(false);
    }, 1000);
  }, []);

  const complianceFrameworks = [
    {
      id: 'gdpr',
      name: 'GDPR (General Data Protection Regulation)',
      status: 'Compliant',
      score: 96.8,
      lastAudit: '2024-12-15',
      nextAudit: '2025-06-15',
      requirements: 47,
      compliantRequirements: 45,
      pendingActions: 2,
      riskLevel: 'Low'
    },
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      status: 'Compliant',
      score: 92.1,
      lastAudit: '2024-11-20',
      nextAudit: '2025-05-20',
      requirements: 64,
      compliantRequirements: 59,
      pendingActions: 5,
      riskLevel: 'Medium'
    },
    {
      id: 'hipaa',
      name: 'HIPAA (Health Insurance Portability)',
      status: 'Compliant',
      score: 95.4,
      lastAudit: '2024-10-10',
      nextAudit: '2025-04-10',
      requirements: 32,
      compliantRequirements: 31,
      pendingActions: 1,
      riskLevel: 'Low'
    },
    {
      id: 'iso27001',
      name: 'ISO 27001 Information Security',
      status: 'In Progress',
      score: 91.7,
      lastAudit: '2024-09-05',
      nextAudit: '2025-03-05',
      requirements: 114,
      compliantRequirements: 105,
      pendingActions: 9,
      riskLevel: 'Medium'
    }
  ];

  const complianceActions = [
    {
      id: 'CA-2025-001',
      framework: 'SOC 2',
      requirement: 'Access Control Review',
      description: 'Quarterly review of user access permissions and role assignments',
      priority: 'High',
      dueDate: '2025-01-15',
      assignee: 'Security Team',
      status: 'In Progress',
      completionRate: 75
    },
    {
      id: 'CA-2025-002',
      framework: 'GDPR',
      requirement: 'Data Processing Inventory Update',
      description: 'Update data processing activities register with new third-party integrations',
      priority: 'Medium',
      dueDate: '2025-01-20',
      assignee: 'Legal Team',
      status: 'Pending',
      completionRate: 0
    },
    {
      id: 'CA-2025-003',
      framework: 'ISO 27001',
      requirement: 'Risk Assessment Documentation',
      description: 'Complete annual information security risk assessment documentation',
      priority: 'High',
      dueDate: '2025-01-12',
      assignee: 'Compliance Team',
      status: 'Overdue',
      completionRate: 45
    },
    {
      id: 'CA-2025-004',
      framework: 'HIPAA',
      requirement: 'Employee Training Completion',
      description: 'Ensure all employees complete mandatory HIPAA training modules',
      priority: 'Medium',
      dueDate: '2025-01-25',
      assignee: 'HR Team',
      status: 'Pending',
      completionRate: 0
    }
  ];

  const auditHistory = [
    {
      id: 'audit-2024-004',
      framework: 'GDPR',
      type: 'External Audit',
      auditor: 'Compliance Partners LLC',
      startDate: '2024-12-01',
      endDate: '2024-12-15',
      status: 'Completed',
      findings: 3,
      recommendations: 5,
      overallRating: 'Satisfactory'
    },
    {
      id: 'audit-2024-003',
      framework: 'SOC 2',
      type: 'Internal Review',
      auditor: 'Internal Audit Team',
      startDate: '2024-11-15',
      endDate: '2024-11-20',
      status: 'Completed',
      findings: 7,
      recommendations: 8,
      overallRating: 'Needs Improvement'
    },
    {
      id: 'audit-2025-001',
      framework: 'ISO 27001',
      type: 'Certification Audit',
      auditor: 'ISO Certification Body',
      startDate: '2025-01-08',
      endDate: '2025-01-15',
      status: 'In Progress',
      findings: 0,
      recommendations: 0,
      overallRating: 'Pending'
    }
  ];

  const riskAssessments = [
    {
      area: 'Data Processing',
      riskLevel: 'Medium',
      score: 6.2,
      lastAssessed: '2024-12-20',
      mitigationStatus: 'Implemented',
      description: 'Third-party data processing agreements require review'
    },
    {
      area: 'Access Controls',
      riskLevel: 'Low',
      score: 3.1,
      lastAssessed: '2024-12-18',
      mitigationStatus: 'Implemented',
      description: 'Strong access control mechanisms in place'
    },
    {
      area: 'Data Retention',
      riskLevel: 'High',
      score: 7.8,
      lastAssessed: '2024-12-15',
      mitigationStatus: 'In Progress',
      description: 'Automated data retention policies need implementation'
    },
    {
      area: 'Incident Response',
      riskLevel: 'Low',
      score: 2.9,
      lastAssessed: '2024-12-22',
      mitigationStatus: 'Implemented',
      description: 'Comprehensive incident response procedures established'
    }
  ];

  const complianceMetrics = [
    {
      metric: 'Policy Adherence',
      value: 94.2,
      target: 95.0,
      trend: 'up',
      change: '+1.8%'
    },
    {
      metric: 'Training Completion',
      value: 87.5,
      target: 90.0,
      trend: 'up',
      change: '+3.2%'
    },
    {
      metric: 'Audit Findings',
      value: 12,
      target: 10,
      trend: 'down',
      change: '-2 findings'
    },
    {
      metric: 'Response Time',
      value: 2.3,
      target: 2.0,
      trend: 'down',
      change: '-0.5 days',
      unit: 'days'
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
                    <span className="ml-4 text-sm font-medium text-gray-900">Compliance Dashboard</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <Scale className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
                <p className="text-gray-600 mt-1">Regulatory compliance monitoring, GDPR compliance, SOC 2 status, and audit trail management</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overall Compliance Score */}
              <div className="bg-white rounded-lg shadow p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-3xl font-bold text-blue-600">
                            {complianceData.overallComplianceScore}
                          </span>
                        </div>
                      </div>
                      <Scale className="w-8 h-8 text-blue-600 absolute -top-2 -right-2" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Compliance Score</h2>
                  <p className="text-gray-600">Comprehensive assessment across all regulatory frameworks</p>
                  <div className="flex items-center justify-center mt-4 space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium text-green-600">Compliant</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Active Audits</p>
                      <p className="font-medium text-blue-600">{complianceData.activeAudits}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Pending Actions</p>
                      <p className="font-medium text-orange-600">{complianceData.pendingActions}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Framework Compliance Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* GDPR Compliance Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">GDPR Compliance</p>
                      <p className="text-2xl font-bold text-gray-900">{complianceData.gdprCompliance}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Fully compliant</span>
                    </div>
                  </div>
                </div>

                {/* SOC 2 Compliance Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">SOC 2 Compliance</p>
                      <p className="text-2xl font-bold text-gray-900">{complianceData.soc2Compliance}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <FileText className="w-4 h-4 mr-1" />
                      <span>Type II certified</span>
                    </div>
                  </div>
                </div>

                {/* HIPAA Compliance Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">HIPAA Compliance</p>
                      <p className="text-2xl font-bold text-gray-900">{complianceData.hipaaCompliance}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>Healthcare ready</span>
                    </div>
                  </div>
                </div>

                {/* ISO Compliance Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Scale className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">ISO 27001</p>
                      <p className="text-2xl font-bold text-gray-900">{complianceData.isoCompliance}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-orange-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Certification pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Frameworks Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Compliance Frameworks Overview</h2>
                <div className="space-y-4">
                  {complianceFrameworks.map((framework) => (
                    <div key={framework.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Scale className="w-6 h-6 text-blue-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{framework.name}</h3>
                            <p className="text-sm text-gray-600">Score: {framework.score}% • Risk: {framework.riskLevel}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          framework.status === 'Compliant' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {framework.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Requirements</p>
                          <p className="font-medium text-gray-900">{framework.compliantRequirements}/{framework.requirements}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(framework.compliantRequirements / framework.requirements) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pending Actions</p>
                          <p className="font-medium text-orange-600">{framework.pendingActions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Audit</p>
                          <p className="font-medium text-gray-900">{framework.lastAudit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Next Audit</p>
                          <p className="font-medium text-gray-900">{framework.nextAudit}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Compliance Actions</h2>
                <div className="space-y-4">
                  {complianceActions.map((action) => (
                    <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="mr-4">
                            <h3 className="font-medium text-gray-900">{action.requirement}</h3>
                            <p className="text-sm text-gray-600">{action.framework} • {action.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            action.priority === 'High' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {action.priority}
                          </span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            action.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                            action.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {action.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  action.status === 'Overdue' ? 'bg-red-500' :
                                  action.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                                }`}
                                style={{ width: `${action.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{action.completionRate}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Due Date</p>
                          <p className="font-medium text-gray-900">{action.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Assignee</p>
                          <p className="font-medium text-gray-900">{action.assignee}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Compliance Risk Assessment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {riskAssessments.map((risk, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{risk.area}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">{risk.score}/10</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            risk.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                            risk.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {risk.riskLevel} Risk
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Assessed: {risk.lastAssessed}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          risk.mitigationStatus === 'Implemented' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {risk.mitigationStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit History */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Audit History</h2>
                <div className="space-y-4">
                  {auditHistory.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{audit.framework} - {audit.type}</h3>
                          <p className="text-sm text-gray-600">Auditor: {audit.auditor}</p>
                          <p className="text-sm text-gray-600">{audit.startDate} - {audit.endDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          audit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {audit.status}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {audit.findings} findings • {audit.recommendations} recommendations
                        </p>
                        <p className="text-sm font-medium text-gray-900">Rating: {audit.overallRating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Metrics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Key Compliance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {complianceMetrics.map((metric, index) => (
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
                          {metric.value}{metric.unit || '%'}
                        </span>
                        <div className={`flex items-center text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <span>{metric.change}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Target: {metric.target}{metric.unit || '%'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <Scale className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Compliance Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered compliance monitoring, automated audit preparation, intelligent risk assessment, and predictive compliance analytics coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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