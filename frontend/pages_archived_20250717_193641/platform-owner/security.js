import React, { useState } from 'react';
import Head from 'next/head';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Users, FileText, Settings, Eye, Download, Filter } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function SecurityCompliance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [auditFilter, setAuditFilter] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState('all');

  const securityOverview = {
    score: 94,
    lastAssessment: '2024-01-28T10:00:00Z',
    vulnerabilities: {
      critical: 0,
      high: 2,
      medium: 5,
      low: 12
    },
    compliance: {
      gdpr: 'compliant',
      hipaa: 'compliant',
      sox: 'compliant',
      iso27001: 'in-progress'
    },
    mfa: {
      enabled: true,
      coverage: 98.5,
      methods: ['authenticator', 'sms', 'email']
    },
    encryption: {
      dataAtRest: 'AES-256',
      dataInTransit: 'TLS 1.3',
      keyRotation: 'automated'
    }
  };

  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-01-30T15:45:00Z',
      user: 'admin@platform.com',
      action: 'User Role Modified',
      resource: 'User Management',
      details: 'Changed user role from Basic to Premium for user@example.com',
      ip: '192.168.1.100',
      severity: 'medium',
      category: 'user_management'
    },
    {
      id: 2,
      timestamp: '2024-01-30T14:30:00Z',
      user: 'security@platform.com',
      action: 'Security Policy Updated',
      resource: 'Security Settings',
      details: 'Updated password policy requirements',
      ip: '192.168.1.101',
      severity: 'high',
      category: 'security'
    },
    {
      id: 3,
      timestamp: '2024-01-30T13:15:00Z',
      user: 'admin@platform.com',
      action: 'Data Export Initiated',
      resource: 'Data Management',
      details: 'Exported user data for tenant: acme-corp',
      ip: '192.168.1.100',
      severity: 'high',
      category: 'data_access'
    },
    {
      id: 4,
      timestamp: '2024-01-30T12:00:00Z',
      user: 'system',
      action: 'Failed Login Attempt',
      resource: 'Authentication',
      details: 'Multiple failed login attempts from IP: 203.0.113.1',
      ip: '203.0.113.1',
      severity: 'critical',
      category: 'authentication'
    },
    {
      id: 5,
      timestamp: '2024-01-30T11:30:00Z',
      user: 'admin@platform.com',
      action: 'API Key Generated',
      resource: 'API Management',
      details: 'Generated new API key for integration service',
      ip: '192.168.1.100',
      severity: 'medium',
      category: 'api_access'
    }
  ];

  const complianceReports = [
    {
      id: 1,
      framework: 'GDPR',
      status: 'compliant',
      lastAudit: '2024-01-15T00:00:00Z',
      nextAudit: '2024-07-15T00:00:00Z',
      score: 98,
      findings: 2,
      actions: 0
    },
    {
      id: 2,
      framework: 'HIPAA',
      status: 'compliant',
      lastAudit: '2024-01-10T00:00:00Z',
      nextAudit: '2024-07-10T00:00:00Z',
      score: 96,
      findings: 3,
      actions: 1
    },
    {
      id: 3,
      framework: 'SOX',
      status: 'compliant',
      lastAudit: '2023-12-20T00:00:00Z',
      nextAudit: '2024-06-20T00:00:00Z',
      score: 94,
      findings: 4,
      actions: 2
    },
    {
      id: 4,
      framework: 'ISO 27001',
      status: 'in-progress',
      lastAudit: '2024-01-05T00:00:00Z',
      nextAudit: '2024-04-05T00:00:00Z',
      score: 87,
      findings: 8,
      actions: 5
    }
  ];

  const securityPolicies = [
    {
      id: 1,
      name: 'Password Policy',
      description: 'Minimum requirements for user passwords',
      lastUpdated: '2024-01-25T00:00:00Z',
      status: 'active',
      enforcement: 'strict'
    },
    {
      id: 2,
      name: 'Data Retention Policy',
      description: 'Guidelines for data storage and deletion',
      lastUpdated: '2024-01-20T00:00:00Z',
      status: 'active',
      enforcement: 'automated'
    },
    {
      id: 3,
      name: 'Access Control Policy',
      description: 'Role-based access control guidelines',
      lastUpdated: '2024-01-18T00:00:00Z',
      status: 'active',
      enforcement: 'strict'
    },
    {
      id: 4,
      name: 'Incident Response Policy',
      description: 'Procedures for security incident handling',
      lastUpdated: '2024-01-15T00:00:00Z',
      status: 'under-review',
      enforcement: 'manual'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': case 'active': return 'text-green-600 bg-green-100';
      case 'in-progress': case 'under-review': return 'text-yellow-600 bg-yellow-100';
      case 'non-compliant': case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAuditLogs = auditFilter === 'all' 
    ? auditLogs 
    : auditLogs.filter(log => log.category === auditFilter);

  const filteredComplianceReports = complianceFilter === 'all'
    ? complianceReports
    : complianceReports.filter(report => report.status === complianceFilter);

  return (
    <>
      <Head>
        <title>Security & Compliance - Platform Owner - Digame</title>
        <meta name="description" content="Security monitoring and compliance management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Security & Compliance"
          subtitle="Security monitoring and compliance management"
          icon={<Shield className="w-6 h-6 text-blue-600" />}
          badge="PLATFORM OWNER"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Security Overview', icon: Shield },
                  { id: 'audit', label: 'Audit Logs', icon: Eye },
                  { id: 'compliance', label: 'Compliance', icon: FileText },
                  { id: 'policies', label: 'Security Policies', icon: Lock }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Security Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Security Score */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
                  <span className="text-sm text-gray-600">
                    Last assessment: {new Date(securityOverview.lastAssessment).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray={`${securityOverview.score}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">{securityOverview.score}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-4">Vulnerability Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{securityOverview.vulnerabilities.critical}</div>
                        <div className="text-sm text-gray-600">Critical</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{securityOverview.vulnerabilities.high}</div>
                        <div className="text-sm text-gray-600">High</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{securityOverview.vulnerabilities.medium}</div>
                        <div className="text-sm text-gray-600">Medium</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{securityOverview.vulnerabilities.low}</div>
                        <div className="text-sm text-gray-600">Low</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* MFA Status */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Key className="w-6 h-6 text-green-600" />
                    <h4 className="font-medium text-gray-900">Multi-Factor Authentication</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('active')}`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Enabled
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Coverage</span>
                      <span className="text-sm font-medium">{securityOverview.mfa.coverage}%</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Methods: {securityOverview.mfa.methods.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Encryption */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lock className="w-6 h-6 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Encryption</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data at Rest</span>
                      <span className="text-sm font-medium">{securityOverview.encryption.dataAtRest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data in Transit</span>
                      <span className="text-sm font-medium">{securityOverview.encryption.dataInTransit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Key Rotation</span>
                      <span className="text-sm font-medium capitalize">{securityOverview.encryption.keyRotation}</span>
                    </div>
                  </div>
                </div>

                {/* Compliance Status */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <h4 className="font-medium text-gray-900">Compliance Status</h4>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(securityOverview.compliance).map(([framework, status]) => (
                      <div key={framework} className="flex justify-between">
                        <span className="text-sm text-gray-600">{framework.toUpperCase()}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status === 'compliant' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {status.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      <option value="authentication">Authentication</option>
                      <option value="user_management">User Management</option>
                      <option value="security">Security</option>
                      <option value="data_access">Data Access</option>
                      <option value="api_access">API Access</option>
                    </select>
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Download className="w-4 h-4" />
                    <span>Export Logs</span>
                  </button>
                </div>
              </div>

              {/* Audit Log Entries */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Audit Log Entries</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredAuditLogs.map((log) => (
                    <div key={log.id} className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                            {log.severity.toUpperCase()}
                          </span>
                          <span className="font-medium text-gray-900">{log.action}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>User: {log.user}</span>
                        <span>Resource: {log.resource}</span>
                        <span>IP: {log.ip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-4">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={complianceFilter}
                    onChange={(e) => setComplianceFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Frameworks</option>
                    <option value="compliant">Compliant</option>
                    <option value="in-progress">In Progress</option>
                    <option value="non-compliant">Non-Compliant</option>
                  </select>
                </div>
              </div>

              {/* Compliance Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredComplianceReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{report.framework}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status === 'compliant' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                        {report.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Compliance Score</span>
                        <span className="text-sm font-medium">{report.score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Findings</span>
                        <span className="text-sm font-medium">{report.findings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Action Items</span>
                        <span className="text-sm font-medium">{report.actions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Audit</span>
                        <span className="text-sm font-medium">{new Date(report.lastAudit).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Audit</span>
                        <span className="text-sm font-medium">{new Date(report.nextAudit).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                      View Full Report
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Security Policies</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Policy
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {securityPolicies.map((policy) => (
                    <div key={policy.id} className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{policy.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                            {policy.status.replace('-', ' ')}
                          </span>
                          <button className="text-blue-600 hover:text-blue-700">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                        <span>Enforcement: {policy.enforcement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}