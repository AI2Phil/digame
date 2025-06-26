import React, { useState, useEffect } from 'react';

interface SecurityMetrics {
  total_users_with_mfa: number;
  mfa_adoption_rate: number;
  active_threats: number;
  resolved_threats_today: number;
  open_incidents: number;
  critical_incidents: number;
  failed_login_attempts_today: number;
  security_score: number;
}

interface ThreatDetection {
  id: number;
  detection_type: string;
  threat_level: string;
  source_ip: string;
  description: string;
  detected_at: string;
  status: string;
}

interface SecurityIncident {
  id: number;
  incident_id: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
}

export const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'incidents' | 'audit'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard summary
      const metricsResponse = await fetch('/api/security/dashboard');
      if (!metricsResponse.ok) throw new Error('Failed to fetch metrics');
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Fetch recent threats
      const threatsResponse = await fetch('/api/security/threats?limit=10');
      if (!threatsResponse.ok) throw new Error('Failed to fetch threats');
      const threatsData = await threatsResponse.json();
      setThreats(threatsData);

      // Fetch recent incidents
      const incidentsResponse = await fetch('/api/security/incidents?limit=10');
      if (!incidentsResponse.ok) throw new Error('Failed to fetch incidents');
      const incidentsData = await incidentsResponse.json();
      setIncidents(incidentsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return '#059669'; // Green
    if (score >= 60) return '#d97706'; // Orange
    return '#dc2626'; // Red
  };

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const cardStyle = {
    padding: '20px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  const metricCardStyle = {
    ...cardStyle,
    textAlign: 'center' as const,
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  };

  const tabStyle = {
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: '500',
  };

  const activeTabStyle = {
    ...tabStyle,
    borderBottomColor: '#3b82f6',
    color: '#3b82f6',
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading security dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: '#dc2626', fontSize: '16px' }}>⚠️ {error}</div>
        <button
          onClick={fetchDashboardData}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          🛡️ Security Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Monitor your organization's security posture and respond to threats
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'threats', label: '⚠️ Threats' },
            { key: 'incidents', label: '🚨 Incidents' },
            { key: 'audit', label: '📋 Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={activeTab === tab.key ? activeTabStyle : tabStyle}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && metrics && (
        <div>
          {/* Security Score */}
          <div style={{ ...cardStyle, marginBottom: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Security Score
            </h2>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: getSecurityScoreColor(metrics.security_score),
              marginBottom: '8px',
            }}>
              {metrics.security_score}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Overall security health of your organization
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div style={metricCardStyle}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                {metrics.total_users_with_mfa}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Users with MFA</div>
              <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                {metrics.mfa_adoption_rate}% adoption rate
              </div>
            </div>

            <div style={metricCardStyle}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>
                {metrics.active_threats}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Active Threats</div>
              <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                {metrics.resolved_threats_today} resolved today
              </div>
            </div>

            <div style={metricCardStyle}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c', marginBottom: '4px' }}>
                {metrics.open_incidents}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Open Incidents</div>
              <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                {metrics.critical_incidents} critical
              </div>
            </div>

            <div style={metricCardStyle}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', marginBottom: '4px' }}>
                {metrics.failed_login_attempts_today}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Failed Logins Today</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Recent Threats */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Recent Threats
              </h3>
              {threats.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  No recent threats detected
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {threats.slice(0, 5).map((threat) => (
                    <div
                      key={threat.id}
                      style={{
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                          {threat.detection_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getThreatLevelColor(threat.threat_level) + '20',
                          color: getThreatLevelColor(threat.threat_level),
                        }}>
                          {threat.threat_level.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        {threat.description}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {threat.source_ip} • {new Date(threat.detected_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Incidents */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Recent Incidents
              </h3>
              {incidents.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  No recent incidents
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {incidents.slice(0, 5).map((incident) => (
                    <div
                      key={incident.id}
                      style={{
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                          {incident.incident_id}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getSeverityColor(incident.severity) + '20',
                          color: getSeverityColor(incident.severity),
                        }}>
                          {incident.severity.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        {incident.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        Status: {incident.status} • {new Date(incident.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'threats' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            Threat Detections
          </h2>
          {threats.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
              No threats detected
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Level</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Source IP</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Detected</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {threats.map((threat) => (
                    <tr key={threat.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {threat.detection_type.replace('_', ' ')}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getThreatLevelColor(threat.threat_level) + '20',
                          color: getThreatLevelColor(threat.threat_level),
                        }}>
                          {threat.threat_level}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', fontFamily: 'monospace' }}>
                        {threat.source_ip}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', maxWidth: '300px' }}>
                        {threat.description}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {new Date(threat.detected_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {threat.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'incidents' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            Security Incidents
          </h2>
          {incidents.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
              No security incidents
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Incident ID</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Title</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Severity</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontFamily: 'monospace' }}>
                        {incident.incident_id}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', maxWidth: '300px' }}>
                        {incident.title}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: getSeverityColor(incident.severity) + '20',
                          color: getSeverityColor(incident.severity),
                        }}>
                          {incident.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {incident.status}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {new Date(incident.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            Security Audit Logs
          </h2>
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
            Audit log viewer coming soon...
          </div>
        </div>
      )}
    </div>
  );
};