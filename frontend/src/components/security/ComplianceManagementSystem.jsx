import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastHelpers } from '../ui/Toaster';
import { apiClient, replaceApiUrl } from '../../lib/api-config';

  Shield, CheckCircle, AlertTriangle, Clock, FileText, 
  Download, Upload, Settings, Eye, TrendingUp, BarChart3,
  Calendar, Users, Database, Lock, Globe, Zap
} from 'lucide-react';

const ComplianceManagementSystem = () => {
  const toast = useToastHelpers();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // State for compliance data
  const [complianceOverview, setComplianceOverview] = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [auditReports, setAuditReports] = useState([]);
  const [remediationTasks, setRemediationTasks] = useState([]);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      
      const [overviewResponse, frameworksResponse, assessmentsResponse, policiesResponse, reportsResponse] = await Promise.all([
        fetch('${replaceApiUrl("")}/api/security/compliance/overview', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/security/compliance/frameworks', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/security/compliance/assessments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/security/compliance/policies', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/security/compliance/audit-reports', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      let hasRealData = false;

      if (overviewResponse.ok) {
        const data = await overviewResponse.json();
        setComplianceOverview(data.data || data);
        hasRealData = true;
      }

      if (frameworksResponse.ok) {
        const data = await frameworksResponse.json();
        setFrameworks(data.data || data);
        hasRealData = true;
      }

      if (assessmentsResponse.ok) {
        const data = await assessmentsResponse.json();
        setAssessments(data.data || data);
        hasRealData = true;
      }

      if (policiesResponse.ok) {
        const data = await policiesResponse.json();
        setPolicies(data.data || data);
        hasRealData = true;
      }

      if (reportsResponse.ok) {
        const data = await reportsResponse.json();
        setAuditReports(data.data || data);
        hasRealData = true;
      }

      if (!hasRealData) {
        loadFallbackData();
        setUsingFallbackData(true);
        toast.info('Using sample compliance data - API endpoints unavailable');
      } else {
        setUsingFallbackData(false);
      }

    } catch (error) {
      console.error('Failed to load compliance data:', error);
      loadFallbackData();
      setUsingFallbackData(true);
      toast.error('Failed to load compliance data - using sample data');
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Enhanced sample compliance overview
    const sampleOverview = {
      overall_compliance_score: 87,
      frameworks_monitored: 6,
      active_assessments: 3,
      overdue_tasks: 12,
      upcoming_audits: 2,
      policy_violations: 8,
      compliance_trend: 5.2,
      last_updated: new Date().toISOString()
    };

    // Enhanced sample compliance frameworks
    const sampleFrameworks = [
      {
        id: 1,
        name: 'SOC 2 Type II',
        description: 'Service Organization Control 2 Type II compliance framework',
        status: 'compliant',
        compliance_score: 94,
        last_assessment: '2024-01-15T00:00:00Z',
        next_assessment: '2024-07-15T00:00:00Z',
        requirements_total: 150,
        requirements_met: 141,
        requirements_pending: 6,
        requirements_failed: 3,
        risk_level: 'low',
        auditor: 'Ernst & Young',
        certification_expires: '2025-01-15T00:00:00Z'
      },
      {
        id: 2,
        name: 'ISO 27001',
        description: 'Information Security Management System standard',
        status: 'compliant',
        compliance_score: 91,
        last_assessment: '2024-02-01T00:00:00Z',
        next_assessment: '2025-02-01T00:00:00Z',
        requirements_total: 114,
        requirements_met: 104,
        requirements_pending: 7,
        requirements_failed: 3,
        risk_level: 'low',
        auditor: 'KPMG',
        certification_expires: '2027-02-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'GDPR',
        description: 'General Data Protection Regulation compliance',
        status: 'partial',
        compliance_score: 78,
        last_assessment: '2024-01-30T00:00:00Z',
        next_assessment: '2024-06-30T00:00:00Z',
        requirements_total: 89,
        requirements_met: 69,
        requirements_pending: 15,
        requirements_failed: 5,
        risk_level: 'medium',
        auditor: 'Internal Team',
        certification_expires: null
      },
      {
        id: 4,
        name: 'HIPAA',
        description: 'Health Insurance Portability and Accountability Act',
        status: 'compliant',
        compliance_score: 96,
        last_assessment: '2024-02-10T00:00:00Z',
        next_assessment: '2024-08-10T00:00:00Z',
        requirements_total: 165,
        requirements_met: 158,
        requirements_pending: 5,
        requirements_failed: 2,
        risk_level: 'low',
        auditor: 'Deloitte',
        certification_expires: '2025-08-10T00:00:00Z'
      },
      {
        id: 5,
        name: 'PCI DSS',
        description: 'Payment Card Industry Data Security Standard',
        status: 'non_compliant',
        compliance_score: 65,
        last_assessment: '2024-01-20T00:00:00Z',
        next_assessment: '2024-04-20T00:00:00Z',
        requirements_total: 78,
        requirements_met: 51,
        requirements_pending: 18,
        requirements_failed: 9,
        risk_level: 'high',
        auditor: 'PwC',
        certification_expires: '2024-06-20T00:00:00Z'
      },
      {
        id: 6,
        name: 'SOX',
        description: 'Sarbanes-Oxley Act compliance for financial reporting',
        status: 'compliant',
        compliance_score: 89,
        last_assessment: '2024-01-05T00:00:00Z',
        next_assessment: '2024-07-05T00:00:00Z',
        requirements_total: 92,
        requirements_met: 82,
        requirements_pending: 7,
        requirements_failed: 3,
        risk_level: 'medium',
        auditor: 'BDO',
        certification_expires: '2025-01-05T00:00:00Z'
      }
    ];

    // Enhanced sample assessments
    const sampleAssessments = [
      {
        id: 1,
        framework_id: 3,
        framework_name: 'GDPR',
        assessment_type: 'quarterly_review',
        status: 'in_progress',
        progress: 65,
        started_date: '2024-02-01T00:00:00Z',
        due_date: '2024-03-15T00:00:00Z',
        assigned_to: 'Sarah Johnson',
        findings_count: 8,
        critical_findings: 2,
        high_findings: 3,
        medium_findings: 3,
        estimated_completion: '2024-03-10T00:00:00Z'
      },
      {
        id: 2,
        framework_id: 5,
        framework_name: 'PCI DSS',
        assessment_type: 'remediation_validation',
        status: 'pending',
        progress: 0,
        started_date: null,
        due_date: '2024-04-01T00:00:00Z',
        assigned_to: 'Michael Chen',
        findings_count: 0,
        critical_findings: 0,
        high_findings: 0,
        medium_findings: 0,
        estimated_completion: '2024-04-15T00:00:00Z'
      },
      {
        id: 3,
        framework_id: 1,
        framework_name: 'SOC 2 Type II',
        assessment_type: 'annual_audit',
        status: 'completed',
        progress: 100,
        started_date: '2024-01-01T00:00:00Z',
        due_date: '2024-01-31T00:00:00Z',
        assigned_to: 'David Wilson',
        findings_count: 12,
        critical_findings: 0,
        high_findings: 2,
        medium_findings: 10,
        estimated_completion: '2024-01-28T00:00:00Z'
      }
    ];

    // Enhanced sample remediation tasks
    const sampleRemediationTasks = [
      {
        id: 1,
        framework_name: 'GDPR',
        title: 'Implement Data Subject Access Request Portal',
        description: 'Create automated portal for data subject access requests',
        priority: 'high',
        status: 'in_progress',
        assigned_to: 'Development Team',
        due_date: '2024-03-20T00:00:00Z',
        progress: 75,
        estimated_effort: '40 hours',
        business_impact: 'medium'
      },
      {
        id: 2,
        framework_name: 'PCI DSS',
        title: 'Upgrade Payment Processing Encryption',
        description: 'Implement latest encryption standards for payment data',
        priority: 'critical',
        status: 'pending',
        assigned_to: 'Security Team',
        due_date: '2024-03-15T00:00:00Z',
        progress: 0,
        estimated_effort: '80 hours',
        business_impact: 'high'
      },
      {
        id: 3,
        framework_name: 'ISO 27001',
        title: 'Update Incident Response Procedures',
        description: 'Revise incident response procedures per new requirements',
        priority: 'medium',
        status: 'completed',
        assigned_to: 'Compliance Team',
        due_date: '2024-02-28T00:00:00Z',
        progress: 100,
        estimated_effort: '16 hours',
        business_impact: 'low'
      },
      {
        id: 4,
        framework_name: 'SOX',
        title: 'Enhance Financial Controls Documentation',
        description: 'Document additional financial controls and procedures',
        priority: 'medium',
        status: 'in_progress',
        assigned_to: 'Finance Team',
        due_date: '2024-04-01T00:00:00Z',
        progress: 45,
        estimated_effort: '32 hours',
        business_impact: 'medium'
      }
    ];

    // Enhanced sample audit reports
    const sampleAuditReports = [
      {
        id: 1,
        framework_name: 'SOC 2 Type II',
        report_type: 'annual_audit',
        status: 'completed',
        generated_date: '2024-01-31T00:00:00Z',
        auditor: 'Ernst & Young',
        findings_summary: {
          total: 12,
          critical: 0,
          high: 2,
          medium: 10,
          low: 0
        },
        overall_rating: 'satisfactory',
        next_audit_date: '2024-07-31T00:00:00Z'
      },
      {
        id: 2,
        framework_name: 'GDPR',
        report_type: 'compliance_assessment',
        status: 'draft',
        generated_date: '2024-02-15T00:00:00Z',
        auditor: 'Internal Team',
        findings_summary: {
          total: 18,
          critical: 3,
          high: 5,
          medium: 8,
          low: 2
        },
        overall_rating: 'needs_improvement',
        next_audit_date: '2024-06-15T00:00:00Z'
      }
    ];

    setComplianceOverview(sampleOverview);
    setFrameworks(sampleFrameworks);
    setAssessments(sampleAssessments);
    setRemediationTasks(sampleRemediationTasks);
    setAuditReports(sampleAuditReports);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'non_compliant': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
                <p className="text-2xl font-bold text-blue-600">{complianceOverview?.overall_compliance_score}%</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{complianceOverview?.compliance_trend}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Frameworks</p>
                <p className="text-2xl font-bold text-green-600">{complianceOverview?.frameworks_monitored}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">{complianceOverview?.overdue_tasks}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Audits</p>
                <p className="text-2xl font-bold text-yellow-600">{complianceOverview?.upcoming_audits}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Framework Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Compliance Framework Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frameworks.slice(0, 6).map((framework) => (
              <div key={framework.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{framework.name}</h4>
                  <Badge 
                    variant={framework.status === 'compliant' ? 'success' : framework.status === 'partial' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {framework.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score:</span>
                    <span className="font-medium">{framework.compliance_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        framework.compliance_score >= 90 ? 'bg-green-500' :
                        framework.compliance_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${framework.compliance_score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Next Audit: {new Date(framework.next_assessment).toLocaleDateString()}</span>
                    <Badge 
                      variant={framework.risk_level === 'low' ? 'success' : framework.risk_level === 'medium' ? 'warning' : 'error'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {framework.risk_level} risk
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFrameworks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Compliance Frameworks</h2>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Add Framework
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {frameworks.map((framework) => (
          <Card key={framework.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
                  <p className="text-gray-600 mt-1">{framework.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={framework.status === 'compliant' ? 'success' : framework.status === 'partial' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {framework.status}
                  </Badge>
                  <Badge 
                    variant={framework.risk_level === 'low' ? 'success' : framework.risk_level === 'medium' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {framework.risk_level} risk
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Compliance Score</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          framework.compliance_score >= 90 ? 'bg-green-500' :
                          framework.compliance_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${framework.compliance_score}%` }}
                      />
                    </div>
                    <span className="text-lg font-semibold">{framework.compliance_score}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Requirements Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Met:</span>
                      <span>{framework.requirements_met}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">Pending:</span>
                      <span>{framework.requirements_pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Failed:</span>
                      <span>{framework.requirements_failed}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Audit Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Auditor:</span>
                      <span>{framework.auditor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Audit:</span>
                      <span>{new Date(framework.last_assessment).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Audit:</span>
                      <span>{new Date(framework.next_assessment).toLocaleDateString()}</span>
                    </div>
                    {framework.certification_expires && (
                      <div className="flex justify-between">
                        <span>Cert Expires:</span>
                        <span>{new Date(framework.certification_expires).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAssessments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Compliance Assessments</h2>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{assessment.framework_name}</h3>
                  <p className="text-sm text-gray-600">{assessment.assessment_type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <Badge 
                  variant={assessment.status === 'completed' ? 'success' : assessment.status === 'in_progress' ? 'warning' : 'default'}
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {assessment.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Progress</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${assessment.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{assessment.progress}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Assigned To</span>
                  <p className="text-sm font-medium mt-1">{assessment.assigned_to}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Due Date</span>
                  <p className="text-sm font-medium mt-1">{new Date(assessment.due_date).toLocaleDateString()}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Findings</span>
                  <div className="flex items-center gap-2 mt-1">
                    {assessment.critical_findings > 0 && (
                      <Badge variant="error" size="sm" icon={null} onRemove={() => {}}>
                        {assessment.critical_findings} Critical
                      </Badge>
                    )}
                    {assessment.high_findings > 0 && (
                      <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                        {assessment.high_findings} High
                      </Badge>
                    )}
                    {assessment.medium_findings > 0 && (
                      <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                        {assessment.medium_findings} Medium
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Assessment
                </Button>
                {assessment.status === 'in_progress' && (
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Update Progress
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRemediationTasks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Remediation Tasks</h2>
        <Button>
          <CheckCircle className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {remediationTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <Badge
                      variant={task.priority === 'critical' ? 'error' : task.priority === 'high' ? 'warning' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Framework: {task.framework_name}</span>
                    <span>Assigned: {task.assigned_to}</span>
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    <span>Effort: {task.estimated_effort}</span>
                  </div>
                </div>
                <Badge
                  variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {task.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        task.progress === 100 ? 'bg-green-500' :
                        task.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {task.status !== 'completed' && (
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Audit Reports</h2>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {auditReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{report.framework_name}</h3>
                  <p className="text-sm text-gray-600">{report.report_type.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-1">Generated: {new Date(report.generated_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={report.status === 'completed' ? 'success' : 'warning'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {report.status}
                  </Badge>
                  <Badge
                    variant={report.overall_rating === 'satisfactory' ? 'success' : 'warning'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {report.overall_rating}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{report.findings_summary.total}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">{report.findings_summary.critical}</div>
                  <div className="text-xs text-gray-600">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">{report.findings_summary.high}</div>
                  <div className="text-xs text-gray-600">High</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">{report.findings_summary.medium}</div>
                  <div className="text-xs text-gray-600">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{report.findings_summary.low}</div>
                  <div className="text-xs text-gray-600">Low</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Auditor: {report.auditor}</span>
                <span>Next Audit: {new Date(report.next_audit_date).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Report
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Compliance Management System
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage regulatory compliance across frameworks</p>
          {usingFallbackData && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
              ⚠️ Using sample data - API endpoints unavailable
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchComplianceData}>
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'frameworks', label: 'Frameworks', icon: Shield },
            { id: 'assessments', label: 'Assessments', icon: CheckCircle },
            { id: 'tasks', label: 'Remediation', icon: AlertTriangle },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'frameworks' && renderFrameworks()}
        {activeTab === 'assessments' && renderAssessments()}
        {activeTab === 'tasks' && renderRemediationTasks()}
        {activeTab === 'reports' && renderReports()}
      </div>
    </div>
  );
};

export default ComplianceManagementSystem;