import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastHelpers } from '../ui/Toaster';
import { apiClient, replaceApiUrl } from '../../lib/api-config';
import {
  Shield, AlertTriangle, TrendingUp, TrendingDown, Eye,
  Target, Zap, Lock, Unlock, Users, Server, Database,
  Globe, Smartphone, Monitor, FileText, Settings,
  RefreshCw, Download, Filter, Search, BarChart3,
  PieChart, Activity, Clock, CheckCircle, XCircle,
  AlertCircle, Info, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

const RiskAssessmentEngine = () => {
  const toast = useToastHelpers();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // State for risk data
  const [riskOverview, setRiskOverview] = useState(null);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [threats, setThreats] = useState([]);
  const [riskMatrix, setRiskMatrix] = useState([]);
  const [mitigationPlans, setMitigationPlans] = useState([]);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);

      const [overviewResponse, vulnResponse, threatsResponse, matrixResponse, mitigationResponse] = await Promise.all([
        fetch('${replaceApiUrl("")}/api/security/risk-assessment/overview', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/security/risk-assessment/vulnerabilities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/security/risk-assessment/threats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/security/risk-assessment/matrix', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('${replaceApiUrl("")}/api/security/risk-assessment/mitigation', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      let hasRealData = false;

      if (overviewResponse.ok) {
        const data = await overviewResponse.json();
        setRiskOverview(data.data || data);
        hasRealData = true;
      }

      if (vulnResponse.ok) {
        const data = await vulnResponse.json();
        setVulnerabilities(data.data || data);
        hasRealData = true;
      }

      if (threatsResponse.ok) {
        const data = await threatsResponse.json();
        setThreats(data.data || data);
        hasRealData = true;
      }

      if (matrixResponse.ok) {
        const data = await matrixResponse.json();
        setRiskMatrix(data.data || data);
        hasRealData = true;
      }

      if (mitigationResponse.ok) {
        const data = await mitigationResponse.json();
        setMitigationPlans(data.data || data);
        hasRealData = true;
      }

      if (!hasRealData) {
        loadFallbackData();
        setUsingFallbackData(true);
        toast.info('Using sample risk assessment data - API endpoints unavailable');
      } else {
        setUsingFallbackData(false);
      }

    } catch (error) {
      console.error('Failed to load risk assessment data:', error);
      loadFallbackData();
      setUsingFallbackData(true);
      toast.error('Failed to load risk data - using sample data');
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Enhanced sample risk overview
    const sampleOverview = {
      overall_risk_score: 7.2,
      risk_trend: 'increasing',
      total_vulnerabilities: 47,
      critical_vulnerabilities: 3,
      high_vulnerabilities: 12,
      medium_vulnerabilities: 18,
      low_vulnerabilities: 14,
      active_threats: 8,
      mitigated_risks: 23,
      pending_mitigations: 15,
      risk_categories: {
        'Infrastructure': { score: 8.1, trend: 'increasing' },
        'Application': { score: 6.8, trend: 'stable' },
        'Data': { score: 7.5, trend: 'decreasing' },
        'Network': { score: 6.2, trend: 'stable' },
        'Human': { score: 8.9, trend: 'increasing' }
      },
      compliance_status: {
        'SOC 2': { score: 85, status: 'compliant' },
        'ISO 27001': { score: 78, status: 'partial' },
        'GDPR': { score: 92, status: 'compliant' },
        'HIPAA': { score: 88, status: 'compliant' },
        'PCI DSS': { score: 82, status: 'partial' }
      }
    };

    // Enhanced sample vulnerabilities
    const sampleVulnerabilities = [
      {
        id: 1,
        title: 'Unpatched SQL Injection Vulnerability',
        severity: 'critical',
        category: 'Application',
        cvss_score: 9.8,
        description: 'Critical SQL injection vulnerability in user authentication module',
        affected_systems: ['Web Application', 'User Database'],
        discovery_date: '2024-03-08T10:30:00Z',
        status: 'open',
        assigned_to: 'Security Team',
        remediation_effort: 'high',
        business_impact: 'critical',
        exploit_probability: 'high',
        mitigation_status: 'in_progress'
      },
      {
        id: 2,
        title: 'Outdated SSL/TLS Configuration',
        severity: 'high',
        category: 'Infrastructure',
        cvss_score: 7.5,
        description: 'Web servers using deprecated TLS 1.0 and weak cipher suites',
        affected_systems: ['Web Servers', 'Load Balancers'],
        discovery_date: '2024-03-07T14:20:00Z',
        status: 'open',
        assigned_to: 'Infrastructure Team',
        remediation_effort: 'medium',
        business_impact: 'high',
        exploit_probability: 'medium',
        mitigation_status: 'planned'
      },
      {
        id: 3,
        title: 'Weak Password Policy Implementation',
        severity: 'medium',
        category: 'Human',
        cvss_score: 5.4,
        description: 'Current password policy allows weak passwords and lacks MFA enforcement',
        affected_systems: ['Authentication System', 'User Accounts'],
        discovery_date: '2024-03-06T09:15:00Z',
        status: 'open',
        assigned_to: 'IT Security',
        remediation_effort: 'low',
        business_impact: 'medium',
        exploit_probability: 'medium',
        mitigation_status: 'not_started'
      }
    ];

    // Enhanced sample threats
    const sampleThreats = [
      {
        id: 1,
        name: 'Advanced Persistent Threat (APT)',
        category: 'External',
        severity: 'critical',
        probability: 'medium',
        impact: 'critical',
        description: 'Sophisticated nation-state actors targeting intellectual property',
        indicators: ['Unusual network traffic', 'Suspicious login patterns', 'Data exfiltration attempts'],
        affected_assets: ['Customer Database', 'Source Code Repository', 'Financial Systems'],
        mitigation_strategies: ['Enhanced monitoring', 'Network segmentation', 'Employee training'],
        last_updated: '2024-03-08T12:00:00Z',
        status: 'active'
      },
      {
        id: 2,
        name: 'Ransomware Attack',
        category: 'Malware',
        severity: 'high',
        probability: 'high',
        impact: 'high',
        description: 'Targeted ransomware campaigns against similar organizations',
        indicators: ['Phishing emails', 'Suspicious file downloads', 'Encryption activities'],
        affected_assets: ['File Servers', 'Backup Systems', 'Workstations'],
        mitigation_strategies: ['Backup verification', 'Email filtering', 'Endpoint protection'],
        last_updated: '2024-03-07T15:30:00Z',
        status: 'monitoring'
      }
    ];

    // Enhanced sample mitigation plans
    const sampleMitigationPlans = [
      {
        id: 1,
        title: 'Critical Vulnerability Remediation',
        priority: 'critical',
        status: 'in_progress',
        progress: 65,
        assigned_to: 'Security Team',
        due_date: '2024-03-15T00:00:00Z',
        estimated_effort: '40 hours',
        budget_allocated: '$15000',
        description: 'Immediate patching of critical SQL injection vulnerabilities',
        tasks: [
          { task: 'Vulnerability assessment', status: 'completed', due: '2024-03-10' },
          { task: 'Patch development', status: 'in_progress', due: '2024-03-12' },
          { task: 'Testing and validation', status: 'pending', due: '2024-03-14' },
          { task: 'Production deployment', status: 'pending', due: '2024-03-15' }
        ],
        risk_reduction: 85
      },
      {
        id: 2,
        title: 'Infrastructure Security Hardening',
        priority: 'high',
        status: 'planned',
        progress: 20,
        assigned_to: 'Infrastructure Team',
        due_date: '2024-03-25T00:00:00Z',
        estimated_effort: '80 hours',
        budget_allocated: '$25000',
        description: 'Comprehensive security hardening of server infrastructure',
        tasks: [
          { task: 'Security baseline assessment', status: 'completed', due: '2024-03-08' },
          { task: 'Configuration updates', status: 'in_progress', due: '2024-03-18' },
          { task: 'Security testing', status: 'pending', due: '2024-03-22' },
          { task: 'Documentation update', status: 'pending', due: '2024-03-25' }
        ],
        risk_reduction: 70
      }
    ];

    setRiskOverview(sampleOverview);
    setVulnerabilities(sampleVulnerabilities);
    setThreats(sampleThreats);
    setMitigationPlans(sampleMitigationPlans);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-200';
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSearch = searchTerm === '' || 
      vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || vuln.severity === filterSeverity;
    const matchesCategory = filterCategory === 'all' || vuln.category === filterCategory;
    
    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Risk Score and Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Risk Score</p>
                <p className="text-2xl font-bold text-red-600">{riskOverview?.overall_risk_score}/10</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <Target className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(riskOverview?.risk_trend)}
              <span className="text-sm text-gray-600 ml-1">{riskOverview?.risk_trend}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Vulnerabilities</p>
                <p className="text-2xl font-bold text-red-600">{riskOverview?.critical_vulnerabilities}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-2xl font-bold text-orange-600">{riskOverview?.active_threats}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mitigated Risks</p>
                <p className="text-2xl font-bold text-green-600">{riskOverview?.mitigated_risks}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Categories and Compliance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Risk by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(riskOverview?.risk_categories || {}).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{category}</span>
                    {getTrendIcon(data.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{data.score}/10</span>
                    <Badge
                      variant={data.score >= 8 ? 'error' : data.score >= 6 ? 'warning' : 'success'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {data.score >= 8 ? 'High' : data.score >= 6 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(riskOverview?.compliance_status || {}).map(([framework, data]) => (
                <div key={framework} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{framework}</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${data.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-medium">{data.score}%</span>
                    <Badge
                      variant={data.status === 'compliant' ? 'success' : 'warning'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {data.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVulnerabilities = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vulnerabilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Application">Application</option>
            <option value="Data">Data</option>
            <option value="Network">Network</option>
            <option value="Human">Human</option>
          </select>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Vulnerabilities List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredVulnerabilities.map((vuln) => (
          <Card key={vuln.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={vuln.severity === 'critical' ? 'error' : vuln.severity === 'high' ? 'error' : vuln.severity === 'medium' ? 'warning' : 'success'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {vuln.severity}
                    </Badge>
                    <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                      {vuln.category}
                    </Badge>
                    <Badge
                      variant={vuln.mitigation_status === 'in_progress' ? 'warning' : vuln.mitigation_status === 'planned' ? 'default' : 'error'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {vuln.mitigation_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{vuln.title}</h3>
                  <p className="text-gray-600">{vuln.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{vuln.cvss_score}</div>
                  <div className="text-sm text-gray-500">CVSS Score</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Affected Systems</h4>
                  <div className="space-y-1">
                    {vuln.affected_systems.map((system, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Server className="h-3 w-3 text-gray-400" />
                        <span>{system}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Assignment & Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Assigned To:</span>
                      <span className="font-medium">{vuln.assigned_to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discovered:</span>
                      <span className="font-medium">{new Date(vuln.discovery_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge
                        variant={vuln.status === 'open' ? 'error' : 'success'}
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {vuln.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderThreats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {threats.map((threat) => (
          <Card key={threat.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={threat.severity === 'critical' ? 'error' : threat.severity === 'high' ? 'error' : 'warning'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {threat.severity}
                    </Badge>
                    <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                      {threat.category}
                    </Badge>
                    <Badge
                      variant={threat.status === 'active' ? 'error' : 'warning'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {threat.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{threat.name}</h3>
                  <p className="text-gray-600">{threat.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">{new Date(threat.last_updated).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Threat Indicators</h4>
                  <div className="space-y-1">
                    {threat.indicators.map((indicator, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        <span>{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mitigation Strategies</h4>
                  <div className="space-y-1">
                    {threat.mitigation_strategies.map((strategy, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Shield className="h-3 w-3 text-green-500" />
                        <span>{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMitigation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {mitigationPlans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={plan.priority === 'critical' ? 'error' : plan.priority === 'high' ? 'warning' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {plan.priority} priority
                    </Badge>
                    <Badge
                      variant={plan.status === 'in_progress' ? 'warning' : plan.status === 'planned' ? 'default' : 'success'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {plan.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{plan.progress}%</div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Assigned To:</span>
                      <span className="font-medium">{plan.assigned_to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span className="font-medium">{new Date(plan.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effort:</span>
                      <span className="font-medium">{plan.estimated_effort}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Budget & Impact</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Budget:</span>
                      <span className="font-medium">{plan.budget_allocated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Reduction:</span>
                      <span className="font-medium">{plan.risk_reduction}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Task Progress</h4>
                  <div className="space-y-2">
                    {plan.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="flex-1">{task.task}</span>
                        <Badge
                          variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}
                          size="sm"
                          icon={null}
                          onRemove={() => {}}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Manage Plan
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Assessment Engine</h1>
          <p className="text-gray-600">Comprehensive risk analysis and vulnerability management</p>
        </div>
        <div className="flex items-center gap-2">
          {usingFallbackData && (
            <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
              Sample Data
            </Badge>
          )}
          <Button onClick={fetchRiskData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Risk Overview', icon: Target },
            { id: 'vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
            { id: 'threats', label: 'Threat Analysis', icon: Zap },
            { id: 'mitigation', label: 'Mitigation Plans', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'vulnerabilities' && renderVulnerabilities()}
        {activeTab === 'threats' && renderThreats()}
        {activeTab === 'mitigation' && renderMitigation()}
      </div>
    </div>
  );
};

export default RiskAssessmentEngine;