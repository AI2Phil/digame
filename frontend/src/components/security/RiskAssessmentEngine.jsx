import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToastHelpers } from '../ui/Toaster';
import {
  AlertTriangle, Shield, TrendingUp, TrendingDown, Eye, 
  Settings, Download, RefreshCw, BarChart3, Target,
  Users, Database, Lock, Globe, Zap, CheckCircle
} from 'lucide-react';

const RiskAssessmentEngine = () => {
  const toast = useToastHelpers();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  // State for risk assessment data
  const [riskOverview, setRiskOverview] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [threatAnalysis, setThreatAnalysis] = useState([]);
  const [riskScenarios, setRiskScenarios] = useState([]);
  const [mitigationPlans, setMitigationPlans] = useState([]);
  const [riskTrends, setRiskTrends] = useState(null);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      
      const [overviewResponse, factorsResponse, vulnerabilitiesResponse, threatsResponse, scenariosResponse, mitigationResponse] = await Promise.all([
        fetch('http://localhost:8001/api/security/risk/overview', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:8001/api/security/risk/factors', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:8001/api/security/risk/vulnerabilities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:8001/api/security/risk/threats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:8001/api/security/risk/scenarios', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:8001/api/security/risk/mitigation', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      let hasRealData = false;

      if (overviewResponse.ok) {
        const data = await overviewResponse.json();
        setRiskOverview(data.data || data);
        hasRealData = true;
      }

      if (factorsResponse.ok) {
        const data = await factorsResponse.json();
        setRiskFactors(data.data || data);
        hasRealData = true;
      }

      if (vulnerabilitiesResponse.ok) {
        const data = await vulnerabilitiesResponse.json();
        setVulnerabilities(data.data || data);
        hasRealData = true;
      }

      if (threatsResponse.ok) {
        const data = await threatsResponse.json();
        setThreatAnalysis(data.data || data);
        hasRealData = true;
      }

      if (scenariosResponse.ok) {
        const data = await scenariosResponse.json();
        setRiskScenarios(data.data || data);
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
      toast.error('Failed to load risk assessment data - using sample data');
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Enhanced sample risk overview
    const sampleOverview = {
      overall_risk_score: 67,
      risk_level: 'medium',
      critical_risks: 8,
      high_risks: 23,
      medium_risks: 45,
      low_risks: 78,
      risk_trend: -5.2,
      last_assessment: new Date().toISOString(),
      next_assessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      total_vulnerabilities: 154,
      patched_vulnerabilities: 89,
      active_threats: 12,
      mitigated_threats: 34
    };

    // Enhanced sample risk factors
    const sampleFactors = [
      {
        id: 1,
        category: 'Technical',
        factor: 'Unpatched Systems',
        risk_score: 85,
        impact: 'high',
        likelihood: 'high',
        description: 'Multiple systems running outdated software with known vulnerabilities',
        affected_assets: 45,
        last_updated: '2024-03-01T00:00:00Z',
        trend: 'increasing'
      },
      {
        id: 2,
        category: 'Human',
        factor: 'Phishing Susceptibility',
        risk_score: 72,
        impact: 'high',
        likelihood: 'medium',
        description: 'Users showing high susceptibility to phishing attacks in recent simulations',
        affected_assets: 234,
        last_updated: '2024-02-28T00:00:00Z',
        trend: 'stable'
      },
      {
        id: 3,
        category: 'Process',
        factor: 'Inadequate Access Controls',
        risk_score: 68,
        impact: 'medium',
        likelihood: 'high',
        description: 'Excessive user privileges and inadequate access review processes',
        affected_assets: 89,
        last_updated: '2024-02-25T00:00:00Z',
        trend: 'decreasing'
      },
      {
        id: 4,
        category: 'Environmental',
        factor: 'Third-Party Dependencies',
        risk_score: 59,
        impact: 'medium',
        likelihood: 'medium',
        description: 'High dependency on third-party services with varying security postures',
        affected_assets: 67,
        last_updated: '2024-02-20T00:00:00Z',
        trend: 'stable'
      },
      {
        id: 5,
        category: 'Technical',
        factor: 'Weak Encryption',
        risk_score: 78,
        impact: 'high',
        likelihood: 'low',
        description: 'Legacy systems using deprecated encryption algorithms',
        affected_assets: 12,
        last_updated: '2024-02-15T00:00:00Z',
        trend: 'decreasing'
      }
    ];

    // Enhanced sample vulnerabilities
    const sampleVulnerabilities = [
      {
        id: 1,
        cve_id: 'CVE-2024-1234',
        title: 'Remote Code Execution in Web Framework',
        severity: 'critical',
        cvss_score: 9.8,
        affected_systems: ['web-server-01', 'web-server-02', 'api-gateway'],
        description: 'Critical vulnerability allowing remote code execution through malformed requests',
        discovery_date: '2024-02-28T00:00:00Z',
        patch_available: true,
        patch_date: '2024-03-01T00:00:00Z',
        status: 'open',
        exploitability: 'high',
        business_impact: 'critical'
      },
      {
        id: 2,
        cve_id: 'CVE-2024-5678',
        title: 'SQL Injection in User Management',
        severity: 'high',
        cvss_score: 8.1,
        affected_systems: ['user-db', 'admin-panel'],
        description: 'SQL injection vulnerability in user authentication module',
        discovery_date: '2024-02-25T00:00:00Z',
        patch_available: true,
        patch_date: '2024-02-26T00:00:00Z',
        status: 'patched',
        exploitability: 'medium',
        business_impact: 'high'
      },
      {
        id: 3,
        cve_id: 'CVE-2024-9012',
        title: 'Cross-Site Scripting in Dashboard',
        severity: 'medium',
        cvss_score: 6.1,
        affected_systems: ['dashboard-app'],
        description: 'Stored XSS vulnerability in dashboard comment system',
        discovery_date: '2024-02-20T00:00:00Z',
        patch_available: false,
        patch_date: null,
        status: 'investigating',
        exploitability: 'low',
        business_impact: 'medium'
      }
    ];

    // Enhanced sample threat analysis
    const sampleThreats = [
      {
        id: 1,
        threat_type: 'Advanced Persistent Threat',
        threat_actor: 'Nation State',
        probability: 'medium',
        impact: 'critical',
        risk_score: 89,
        description: 'Sophisticated long-term attack targeting intellectual property',
        attack_vectors: ['spear_phishing', 'zero_day_exploits', 'supply_chain'],
        target_assets: ['research_data', 'customer_database', 'financial_systems'],
        indicators: ['unusual_network_traffic', 'privilege_escalation_attempts'],
        last_detected: '2024-02-28T00:00:00Z',
        status: 'active'
      },
      {
        id: 2,
        threat_type: 'Ransomware',
        threat_actor: 'Cybercriminal Group',
        probability: 'high',
        impact: 'high',
        risk_score: 82,
        description: 'Ransomware campaign targeting healthcare and financial sectors',
        attack_vectors: ['email_attachments', 'rdp_brute_force', 'software_vulnerabilities'],
        target_assets: ['file_servers', 'databases', 'backup_systems'],
        indicators: ['suspicious_file_encryption', 'lateral_movement'],
        last_detected: '2024-02-26T00:00:00Z',
        status: 'monitoring'
      },
      {
        id: 3,
        threat_type: 'Insider Threat',
        threat_actor: 'Malicious Insider',
        probability: 'low',
        impact: 'high',
        risk_score: 65,
        description: 'Potential data exfiltration by privileged users',
        attack_vectors: ['data_exfiltration', 'privilege_abuse', 'sabotage'],
        target_assets: ['sensitive_documents', 'customer_data', 'trade_secrets'],
        indicators: ['unusual_data_access', 'after_hours_activity'],
        last_detected: '2024-02-24T00:00:00Z',
        status: 'investigating'
      }
    ];

    // Enhanced sample risk scenarios
    const sampleScenarios = [
      {
        id: 1,
        scenario_name: 'Data Breach via Web Application',
        probability: 'medium',
        impact: 'critical',
        risk_score: 85,
        description: 'Exploitation of web application vulnerabilities leading to customer data exposure',
        attack_path: [
          'Initial compromise via SQL injection',
          'Privilege escalation through unpatched system',
          'Lateral movement to database servers',
          'Data exfiltration of customer records'
        ],
        potential_losses: {
          financial: '$2.5M - $5M',
          reputation: 'Severe brand damage',
          regulatory: 'GDPR fines up to $10M',
          operational: '2-4 weeks downtime'
        },
        affected_stakeholders: ['customers', 'shareholders', 'employees', 'regulators'],
        mitigation_status: 'partial'
      },
      {
        id: 2,
        scenario_name: 'Ransomware Attack on Critical Systems',
        probability: 'high',
        impact: 'high',
        risk_score: 78,
        description: 'Ransomware deployment across critical business systems',
        attack_path: [
          'Phishing email with malicious attachment',
          'Initial system compromise',
          'Network reconnaissance and mapping',
          'Ransomware deployment across network'
        ],
        potential_losses: {
          financial: '$1M - $3M',
          reputation: 'Moderate brand impact',
          regulatory: 'Breach notification requirements',
          operational: '1-2 weeks recovery time'
        },
        affected_stakeholders: ['customers', 'employees', 'partners'],
        mitigation_status: 'implemented'
      }
    ];

    // Enhanced sample mitigation plans
    const sampleMitigation = [
      {
        id: 1,
        risk_id: 1,
        risk_name: 'Unpatched Systems',
        mitigation_type: 'preventive',
        priority: 'critical',
        status: 'in_progress',
        description: 'Implement automated patch management system',
        actions: [
          'Deploy patch management solution',
          'Establish patch testing procedures',
          'Create emergency patching process',
          'Implement vulnerability scanning'
        ],
        assigned_to: 'IT Security Team',
        due_date: '2024-03-15T00:00:00Z',
        progress: 65,
        estimated_cost: '$50,000',
        expected_risk_reduction: 70
      },
      {
        id: 2,
        risk_id: 2,
        risk_name: 'Phishing Susceptibility',
        mitigation_type: 'detective',
        priority: 'high',
        status: 'planned',
        description: 'Enhanced security awareness training program',
        actions: [
          'Conduct phishing simulation campaigns',
          'Implement security awareness training',
          'Deploy email security solutions',
          'Establish incident response procedures'
        ],
        assigned_to: 'HR & Security Team',
        due_date: '2024-04-01T00:00:00Z',
        progress: 25,
        estimated_cost: '$25,000',
        expected_risk_reduction: 50
      }
    ];

    // Enhanced sample risk trends
    const sampleTrends = {
      monthly_scores: [
        { month: '2023-10', score: 72 },
        { month: '2023-11', score: 69 },
        { month: '2023-12', score: 71 },
        { month: '2024-01', score: 68 },
        { month: '2024-02', score: 67 },
        { month: '2024-03', score: 67 }
      ],
      category_trends: {
        technical: { current: 68, previous: 72, trend: 'improving' },
        human: { current: 65, previous: 63, trend: 'worsening' },
        process: { current: 70, previous: 68, trend: 'worsening' },
        environmental: { current: 64, previous: 66, trend: 'improving' }
      }
    };

    setRiskOverview(sampleOverview);
    setRiskFactors(sampleFactors);
    setVulnerabilities(sampleVulnerabilities);
    setThreatAnalysis(sampleThreats);
    setRiskScenarios(sampleScenarios);
    setMitigationPlans(sampleMitigation);
    setRiskTrends(sampleTrends);
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
      case 'worsening':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Risk Score Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className={`text-4xl font-bold ${getRiskScoreColor(riskOverview?.overall_risk_score)}`}>
                {riskOverview?.overall_risk_score}
              </div>
              <div className="text-sm text-gray-600 mt-1">Overall Risk Score</div>
            </div>
            <div className="flex items-center justify-center gap-2">
              {getTrendIcon(riskOverview?.risk_trend > 0 ? 'worsening' : 'improving')}
              <span className={`text-sm ${riskOverview?.risk_trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {Math.abs(riskOverview?.risk_trend)}% from last month
              </span>
            </div>
            <Badge 
              variant={riskOverview?.risk_level === 'high' ? 'error' : riskOverview?.risk_level === 'medium' ? 'warning' : 'success'}
              size="sm"
              icon={null}
              onRemove={() => {}}
              className="mt-2"
            >
              {riskOverview?.risk_level} risk
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Risks</p>
                <p className="text-2xl font-bold text-red-600">{riskOverview?.critical_risks}</p>
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
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vulnerabilities</p>
                <p className="text-2xl font-bold text-blue-600">{riskOverview?.total_vulnerabilities}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {riskOverview?.patched_vulnerabilities} patched
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { level: 'Critical', count: riskOverview?.critical_risks, color: 'bg-red-500' },
                { level: 'High', count: riskOverview?.high_risks, color: 'bg-orange-500' },
                { level: 'Medium', count: riskOverview?.medium_risks, color: 'bg-yellow-500' },
                { level: 'Low', count: riskOverview?.low_risks, color: 'bg-green-500' }
              ].map((risk) => (
                <div key={risk.level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                    <span className="font-medium">{risk.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${risk.color}`}
                        style={{
                          width: `${(risk.count / (riskOverview?.critical_risks + riskOverview?.high_risks + riskOverview?.medium_risks + riskOverview?.low_risks)) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{risk.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Risk Trends by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskTrends?.category_trends && Object.entries(riskTrends.category_trends).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{category}</span>
                    {getTrendIcon(data.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{data.previous} → </span>
                    <span className={`text-sm font-medium ${getRiskScoreColor(data.current)}`}>
                      {data.current}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Top Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskFactors.slice(0, 5).map((factor) => (
              <div key={factor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{factor.factor}</h4>
                    <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                      {factor.category}
                    </Badge>
                    {getTrendIcon(factor.trend)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Impact: {factor.impact}</span>
                    <span>Likelihood: {factor.likelihood}</span>
                    <span>Assets: {factor.affected_assets}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getRiskScoreColor(factor.risk_score)}`}>
                    {factor.risk_score}
                  </div>
                  <div className="text-xs text-gray-600">Risk Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVulnerabilities = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Vulnerability Assessment</h2>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Run Scan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {vulnerabilities.map((vuln) => (
          <Card key={vuln.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{vuln.title}</h3>
                    <Badge 
                      variant={vuln.severity === 'critical' ? 'error' : vuln.severity === 'high' ? 'warning' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {vuln.severity}
                    </Badge>
                    <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                      {vuln.cve_id}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{vuln.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>CVSS: {vuln.cvss_score}</span>
                    <span>Discovered: {new Date(vuln.discovery_date).toLocaleDateString()}</span>
                    <span>Systems: {vuln.affected_systems.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={vuln.status === 'patched' ? 'success' : vuln.status === 'open' ? 'error' : 'warning'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {vuln.status}
                  </Badge>
                  {vuln.patch_available && (
                    <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                      Patch Available
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Affected Systems</span>
                  <div className="mt-1">
                    {vuln.affected_systems.map((system, index) => (
                      <Badge key={index} variant="default" size="sm" icon={null} onRemove={() => {}} className="mr-1 mb-1">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Exploitability</span>
                  <p className="text-sm font-medium mt-1 capitalize">{vuln.exploitability}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Business Impact</span>
                  <p className="text-sm font-medium mt-1 capitalize">{vuln.business_impact}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
                {vuln.status === 'open' && vuln.patch_available && (
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Apply Patch
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderThreats = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Threat Analysis</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {threatAnalysis.map((threat) => (
          <Card key={threat.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{threat.threat_type}</h3>
                  <p className="text-sm text-gray-600 mt-1">Actor: {threat.threat_actor}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={threat.status === 'active' ? 'error' : threat.status === 'monitoring' ? 'warning' : 'default'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {threat.status}
                  </Badge>
                  <div className={`text-2xl font-bold ${getRiskScoreColor(threat.risk_score)}`}>
                    {threat.risk_score}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{threat.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Attack Vectors</h4>
                  <div className="space-y-1">
                    {threat.attack_vectors.map((vector, index) => (
                      <Badge key={index} variant="default" size="sm" icon={null} onRemove={() => {}} className="mr-1 mb-1">
                        {vector.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Target Assets</h4>
                  <div className="space-y-1">
                    {threat.target_assets.map((asset, index) => (
                      <Badge key={index} variant="outline" size="sm" icon={null} onRemove={() => {}} className="mr-1 mb-1">
                        {asset.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Probability</span>
                  <p className="text-sm font-medium mt-1 capitalize">{threat.probability}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Impact</span>
                  <p className="text-sm font-medium mt-1 capitalize">{threat.impact}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Last Detected</span>
                  <p className="text-sm font-medium mt-1">{new Date(threat.last_detected).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Indicators of Compromise</h4>
                <div className="flex flex-wrap gap-1">
                  {threat.indicators.map((indicator, index) => (
                    <Badge key={index} variant="warning" size="sm" icon={null} onRemove={() => {}}>
                      {indicator.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-1" />
                  Create Mitigation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderScenarios = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Risk Scenarios</h2>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          New Scenario
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {riskScenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{scenario.scenario_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={scenario.probability === 'high' ? 'error' : scenario.probability === 'medium' ? 'warning' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {scenario.probability} probability
                    </Badge>
                    <Badge
                      variant={scenario.impact === 'critical' ? 'error' : scenario.impact === 'high' ? 'warning' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {scenario.impact} impact
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getRiskScoreColor(scenario.risk_score)}`}>
                    {scenario.risk_score}
                  </div>
                  <div className="text-xs text-gray-600">Risk Score</div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{scenario.description}</p>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Attack Path</h4>
                <div className="space-y-2">
                  {scenario.attack_path.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Potential Losses</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Financial:</span> {scenario.potential_losses.financial}</div>
                    <div><span className="font-medium">Reputation:</span> {scenario.potential_losses.reputation}</div>
                    <div><span className="font-medium">Regulatory:</span> {scenario.potential_losses.regulatory}</div>
                    <div><span className="font-medium">Operational:</span> {scenario.potential_losses.operational}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Affected Stakeholders</h4>
                  <div className="flex flex-wrap gap-1">
                    {scenario.affected_stakeholders.map((stakeholder, index) => (
                      <Badge key={index} variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge
                  variant={scenario.mitigation_status === 'implemented' ? 'success' : scenario.mitigation_status === 'partial' ? 'warning' : 'error'}
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  Mitigation: {scenario.mitigation_status}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Update Mitigation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMitigation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mitigation Plans</h2>
        <Button>
          <CheckCircle className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mitigationPlans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{plan.description}</h3>
                    <Badge
                      variant={plan.priority === 'critical' ? 'error' : plan.priority === 'high' ? 'warning' : 'default'}
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {plan.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Risk: {plan.risk_name}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Type: {plan.mitigation_type}</span>
                    <span>Assigned: {plan.assigned_to}</span>
                    <span>Due: {new Date(plan.due_date).toLocaleDateString()}</span>
                    <span>Cost: {plan.estimated_cost}</span>
                  </div>
                </div>
                <Badge
                  variant={plan.status === 'completed' ? 'success' : plan.status === 'in_progress' ? 'warning' : 'default'}
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {plan.status}
                </Badge>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                <div className="space-y-1">
                  {plan.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 mr-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        plan.progress === 100 ? 'bg-green-500' :
                        plan.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">-{plan.expected_risk_reduction}%</div>
                  <div className="text-xs text-gray-600">Risk Reduction</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Plan
                </Button>
                {plan.status !== 'completed' && (
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
            <Target className="h-6 w-6 text-red-600" />
            Risk Assessment Engine
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive risk analysis and threat assessment platform</p>
          {usingFallbackData && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
              ⚠️ Using sample data - API endpoints unavailable
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRiskData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Run Assessment
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Database },
            { id: 'threats', label: 'Threats', icon: Shield },
            { id: 'scenarios', label: 'Scenarios', icon: Target },
            { id: 'mitigation', label: 'Mitigation', icon: CheckCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
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
        {activeTab === 'vulnerabilities' && renderVulnerabilities()}
        {activeTab === 'threats' && renderThreats()}
        {activeTab === 'scenarios' && renderScenarios()}
        {activeTab === 'mitigation' && renderMitigation()}
      </div>
    </div>
  );
};

export default RiskAssessmentEngine;