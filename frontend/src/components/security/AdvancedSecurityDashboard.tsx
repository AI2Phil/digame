import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Shield, Lock, Key, Eye, AlertTriangle, CheckCircle,
  Users, FileText, Clock, TrendingUp, BarChart3,
  Settings, Download, RefreshCw, Filter, Search,
  Globe, Server, Database, Wifi, Smartphone
} from 'lucide-react';

interface SecurityMetrics {
  compliance_score: number;
  policy_violations: number;
  access_reviews_pending: number;
  certificates_expiring: number;
  security_incidents: number;
  data_classification: {
    public: number;
    internal: number;
    confidential: number;
    restricted: number;
  };
  access_patterns: {
    normal: number;
    suspicious: number;
    blocked: number;
  };
}

interface ComplianceFramework {
  id: string;
  name: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  score: number;
  last_audit: string;
  next_audit: string;
  requirements_met: number;
  total_requirements: number;
}

interface SecurityPolicy {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'draft' | 'deprecated';
  compliance_rate: number;
  violations: number;
  last_updated: string;
  next_review: string;
}

interface AccessReview {
  id: string;
  user: string;
  role: string;
  department: string;
  last_access: string;
  permissions: string[];
  risk_level: 'low' | 'medium' | 'high';
  review_due: string;
  status: 'pending' | 'approved' | 'revoked';
}

export const AdvancedSecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'policies' | 'access' | 'incidents' | 'reports'>('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    compliance_score: 94,
    policy_violations: 12,
    access_reviews_pending: 8,
    certificates_expiring: 3,
    security_incidents: 2,
    data_classification: {
      public: 1250,
      internal: 3400,
      confidential: 890,
      restricted: 156
    },
    access_patterns: {
      normal: 15420,
      suspicious: 23,
      blocked: 7
    }
  });

  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([
    {
      id: '1',
      name: 'SOC 2 Type II',
      status: 'compliant',
      score: 98,
      last_audit: '2024-01-15',
      next_audit: '2024-07-15',
      requirements_met: 147,
      total_requirements: 150
    },
    {
      id: '2',
      name: 'ISO 27001',
      status: 'compliant',
      score: 96,
      last_audit: '2024-02-01',
      next_audit: '2025-02-01',
      requirements_met: 112,
      total_requirements: 114
    },
    {
      id: '3',
      name: 'GDPR',
      status: 'partial',
      score: 87,
      last_audit: '2024-01-30',
      next_audit: '2024-06-30',
      requirements_met: 78,
      total_requirements: 89
    },
    {
      id: '4',
      name: 'HIPAA',
      status: 'compliant',
      score: 99,
      last_audit: '2024-02-10',
      next_audit: '2024-08-10',
      requirements_met: 164,
      total_requirements: 165
    }
  ]);

  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([
    {
      id: '1',
      name: 'Password Policy',
      category: 'Authentication',
      status: 'active',
      compliance_rate: 96,
      violations: 8,
      last_updated: '2024-01-15',
      next_review: '2024-07-15'
    },
    {
      id: '2',
      name: 'Data Classification Policy',
      category: 'Data Protection',
      status: 'active',
      compliance_rate: 89,
      violations: 15,
      last_updated: '2024-02-01',
      next_review: '2024-08-01'
    },
    {
      id: '3',
      name: 'Access Control Policy',
      category: 'Access Management',
      status: 'active',
      compliance_rate: 94,
      violations: 7,
      last_updated: '2024-01-20',
      next_review: '2024-07-20'
    },
    {
      id: '4',
      name: 'Incident Response Policy',
      category: 'Security Operations',
      status: 'active',
      compliance_rate: 98,
      violations: 2,
      last_updated: '2024-02-05',
      next_review: '2024-08-05'
    }
  ]);

  const [accessReviews, setAccessReviews] = useState<AccessReview[]>([
    {
      id: '1',
      user: 'john.doe@company.com',
      role: 'Senior Developer',
      department: 'Engineering',
      last_access: '2024-02-28',
      permissions: ['admin', 'deploy', 'read_sensitive'],
      risk_level: 'medium',
      review_due: '2024-03-15',
      status: 'pending'
    },
    {
      id: '2',
      user: 'jane.smith@company.com',
      role: 'Data Analyst',
      department: 'Analytics',
      last_access: '2024-02-27',
      permissions: ['read_data', 'export_reports'],
      risk_level: 'low',
      review_due: '2024-03-10',
      status: 'pending'
    },
    {
      id: '3',
      user: 'mike.wilson@company.com',
      role: 'DevOps Engineer',
      department: 'Infrastructure',
      last_access: '2024-02-25',
      permissions: ['admin', 'deploy', 'infrastructure'],
      risk_level: 'high',
      review_due: '2024-03-05',
      status: 'pending'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setMetrics(prev => ({
        ...prev,
        security_incidents: prev.security_incidents + Math.floor(Math.random() * 2),
        access_patterns: {
          ...prev.access_patterns,
          normal: prev.access_patterns.normal + Math.floor(Math.random() * 10),
          suspicious: prev.access_patterns.suspicious + Math.floor(Math.random() * 2)
        }
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleApproveAccess = (reviewId: string) => {
    setAccessReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, status: 'approved' as const }
          : review
      )
    );
  };

  const handleRevokeAccess = (reviewId: string) => {
    setAccessReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, status: 'revoked' as const }
          : review
      )
    );
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'non_compliant': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (level: string) => {
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
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">{metrics.compliance_score}%</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Policy Violations</p>
                <p className="text-2xl font-bold text-red-600">{metrics.policy_violations}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.access_reviews_pending}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Incidents</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.security_incidents}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Data Classification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.data_classification).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      level === 'public' ? 'bg-green-500' :
                      level === 'internal' ? 'bg-blue-500' :
                      level === 'confidential' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="capitalize font-medium">{level}</span>
                  </div>
                  <span className="text-lg font-semibold">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Access Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.access_patterns).map(([pattern, count]) => (
                <div key={pattern} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      pattern === 'normal' ? 'bg-green-500' :
                      pattern === 'suspicious' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="capitalize font-medium">{pattern}</span>
                  </div>
                  <span className="text-lg font-semibold">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceFrameworks.map((framework) => (
          <Card key={framework.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{framework.name}</h3>
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
                    <span>Score</span>
                    <span className="font-medium">{framework.score}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Requirements</span>
                    <span className="font-medium">{framework.requirements_met}/{framework.total_requirements}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Audit</span>
                    <span className="font-medium">{new Date(framework.next_audit).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Authentication">Authentication</option>
            <option value="Data Protection">Data Protection</option>
            <option value="Access Management">Access Management</option>
            <option value="Security Operations">Security Operations</option>
          </select>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          New Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {securityPolicies
          .filter(policy => 
            (filterCategory === 'all' || policy.category === filterCategory) &&
            policy.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((policy) => (
            <Card key={policy.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{policy.name}</h3>
                      <Badge 
                        variant={policy.status === 'active' ? 'success' : policy.status === 'draft' ? 'warning' : 'default'}
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {policy.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{policy.category}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>Compliance: {policy.compliance_rate}%</span>
                      <span>Violations: {policy.violations}</span>
                      <span>Next Review: {new Date(policy.next_review).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  const renderAccessReviews = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {accessReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{review.user}</h3>
                    <Badge 
                      variant={review.status === 'approved' ? 'success' : review.status === 'revoked' ? 'error' : 'warning'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {review.status}
                    </Badge>
                    <Badge 
                      variant={review.risk_level === 'low' ? 'success' : review.risk_level === 'medium' ? 'warning' : 'error'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {review.risk_level} risk
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>{review.role} - {review.department}</span>
                    <span>Last Access: {new Date(review.last_access).toLocaleDateString()}</span>
                    <span>Due: {new Date(review.review_due).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Permissions:</span>
                    {review.permissions.map((permission, index) => (
                      <Badge key={index} variant="default" size="sm" icon={null} onRemove={() => {}}>
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
                {review.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleApproveAccess(review.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRevokeAccess(review.id)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Security & Compliance</h1>
          <p className="text-gray-600">Comprehensive security management and compliance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'compliance', label: 'Compliance', icon: Shield },
            { id: 'policies', label: 'Policies', icon: FileText },
            { id: 'access', label: 'Access Reviews', icon: Users },
            { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
            { id: 'reports', label: 'Reports', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'compliance' && renderCompliance()}
        {activeTab === 'policies' && renderPolicies()}
        {activeTab === 'access' && renderAccessReviews()}
        {activeTab === 'incidents' && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Security Incidents</h3>
            <p className="text-gray-600">Incident management interface coming soon</p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Security Reports</h3>
            <p className="text-gray-600">Advanced reporting interface coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSecurityDashboard;