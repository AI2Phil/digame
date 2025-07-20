import React, { useState, useEffect } from 'react';
import { apiClient, replaceApiUrl } from '../../lib/api-config';

// Simple toast function for user feedback
const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // Create toast element
  const toastEl = document.createElement('div');

  toastEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ${type === 'success' ? 'background-color: #059669;' : ''}
    ${type === 'error' ? 'background-color: #dc2626;' : ''}
    ${type === 'info' ? 'background-color: #3b82f6;' : ''}
  `;
  toastEl.textContent = message;
  
  document.body.appendChild(toastEl);
  
  // Remove after 4 seconds
  setTimeout(() => {
    if (document.body.contains(toastEl)) {
      document.body.removeChild(toastEl);
    }
  }, 4000);
};

interface IntegrationConnection {
  id: number;
  provider_id: number;
  connection_name: string;
  status: string;
  created_at: string;
  last_sync_at?: string;
  total_syncs: number;
  successful_syncs: number;
  error_count: number;
  provider: {
    id: number;
    name: string;
    display_name: string;
    category: string;
    logo_url: string;
  };
}

interface SyncLog {
  id: number;
  connection_id: number;
  sync_type: string;
  status: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  duration_seconds: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

interface IntegrationAnalytics {
  total_connections: number;
  active_connections: number;
  total_syncs_today: number;
  successful_syncs_today: number;
  failed_syncs_today: number;
  data_transferred_mb: number;
  avg_sync_duration: number;
  top_performing_integrations: Array<{
    provider_name: string;
    success_rate: number;
    total_syncs: number;
  }>;
}

export const IntegrationDashboard: React.FC = () => {
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [analytics, setAnalytics] = useState<IntegrationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch connections
      const connectionsResponse = await fetch('${replaceApiUrl("")}/api/integrations/connections');
      if (!connectionsResponse.ok) {
        if (connectionsResponse.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        throw new Error('Failed to fetch connections');
      }
      const connectionsData = await connectionsResponse.json();
      setConnections(connectionsData);

      // Fetch recent sync logs
      const logsResponse = await fetch('${replaceApiUrl("")}/api/integrations/sync-logs?limit=50');
      if (!logsResponse.ok) throw new Error('Failed to fetch sync logs');
      const logsData = await logsResponse.json();
      setSyncLogs(logsData);

      // Fetch analytics
      const analyticsResponse = await fetch('${replaceApiUrl("")}/api/integrations/analytics');
      if (!analyticsResponse.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      toast('Integration dashboard loaded successfully', 'success');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      toast(`API unavailable: ${errorMessage}. Using demo data.`, 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (connectionId: number) => {
    try {
      const response = await fetch(`${replaceApiUrl("")}/api/integrations/connections/${connectionId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to start sync');
      
      const result = await response.json();
      toast(`Sync initiated successfully for connection ${connectionId}`, 'success');
      
      // Refresh data after sync
      await fetchDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync';
      setError(errorMessage);
      toast(`Sync failed: ${errorMessage}`, 'error');
    }
  };

  const handleTestConnection = async (connectionId: number) => {
    try {
      const response = await fetch(`${replaceApiUrl("")}/api/integrations/connections/${connectionId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Connection test failed');
      
      const result = await response.json();
      toast(`Connection test successful for connection ${connectionId}`, 'success');
      
      await fetchDashboardData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      setError(errorMessage);
      toast(`Connection test failed: ${errorMessage}`, 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'error': return '#dc2626';
      case 'pending': return '#d97706';
      case 'success': return '#059669';
      case 'failed': return '#dc2626';
      case 'in_progress': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getSuccessRate = (connection: IntegrationConnection) => {
    if (connection.total_syncs === 0) return 0;
    return Math.round((connection.successful_syncs / connection.total_syncs) * 100);
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
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  };

  const buttonStyle = {
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    backgroundColor: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading integration dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
            📊 Integration Dashboard
          </h1>
          {error && (
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#fbbf24',
              color: '#92400e',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
            }}>
              Demo Data
            </span>
          )}
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Monitor and manage your integration connections and data synchronization
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          marginBottom: '24px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div style={metricCardStyle}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
              {analytics.total_connections}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Connections</div>
            <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
              {analytics.active_connections} active
            </div>
          </div>

          <div style={metricCardStyle}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>
              {analytics.total_syncs_today}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Syncs Today</div>
            <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
              {Math.round((analytics.successful_syncs_today / analytics.total_syncs_today) * 100) || 0}% success rate
            </div>
          </div>

          <div style={metricCardStyle}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', marginBottom: '4px' }}>
              {analytics.data_transferred_mb.toFixed(1)}MB
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Data Transferred</div>
          </div>

          <div style={metricCardStyle}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
              {analytics.avg_sync_duration.toFixed(1)}s
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Avg Sync Time</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Active Connections */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            🔗 Active Connections ({connections.length})
          </h2>
          
          {connections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              No connections configured
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    backgroundColor: connection.status === 'active' ? '#f0fdf4' : '#fef2f2',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <img
                      src={connection.provider.logo_url}
                      alt={connection.provider.display_name}
                      style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {connection.provider.display_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {connection.connection_name}
                      </div>
                    </div>
                    <div style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      backgroundColor: getStatusColor(connection.status) + '20',
                      color: getStatusColor(connection.status),
                    }}>
                      {connection.status.toUpperCase()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Success Rate: {getSuccessRate(connection)}% ({connection.successful_syncs}/{connection.total_syncs})
                    </div>
                    {connection.last_sync_at && (
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleSync(connection.id)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#059669',
                      }}
                    >
                      🔄 Sync
                    </button>
                    <button
                      onClick={() => handleTestConnection(connection.id)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#3b82f6',
                      }}
                    >
                      🔍 Test
                    </button>
                    <button
                      onClick={() => setSelectedConnection(connection.id)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#6b7280',
                      }}
                    >
                      📋 Logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Integrations */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            🏆 Top Performing Integrations
          </h2>
          
          {analytics?.top_performing_integrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              No performance data available
            </div>
          ) : (
            <div>
              {analytics?.top_performing_integrations.map((integration, index) => (
                <div
                  key={integration.provider_name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7c2f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {integration.provider_name}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                      {integration.success_rate}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {integration.total_syncs} syncs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sync Logs */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
            📋 Recent Sync Activity
          </h2>
          {selectedConnection && (
            <button
              onClick={() => setSelectedConnection(null)}
              style={{
                ...buttonStyle,
                backgroundColor: '#6b7280',
              }}
            >
              Show All
            </button>
          )}
        </div>

        {syncLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            No sync activity recorded
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Connection
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Type
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Records
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Duration
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Started
                  </th>
                </tr>
              </thead>
              <tbody>
                {syncLogs
                  .filter(log => !selectedConnection || log.connection_id === selectedConnection)
                  .slice(0, 20)
                  .map((log) => {
                    const connection = connections.find(c => c.id === log.connection_id);
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px', fontSize: '12px' }}>
                          {connection?.provider.display_name || 'Unknown'}
                        </td>
                        <td style={{ padding: '8px', fontSize: '12px' }}>
                          {log.sync_type}
                        </td>
                        <td style={{ padding: '8px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500',
                            backgroundColor: getStatusColor(log.status) + '20',
                            color: getStatusColor(log.status),
                          }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px', fontSize: '12px' }}>
                          <div>✓ {log.records_created + log.records_updated}</div>
                          {log.records_failed > 0 && (
                            <div style={{ color: '#dc2626' }}>✗ {log.records_failed}</div>
                          )}
                        </td>
                        <td style={{ padding: '8px', fontSize: '12px' }}>
                          {log.duration_seconds.toFixed(1)}s
                        </td>
                        <td style={{ padding: '8px', fontSize: '12px' }}>
                          {new Date(log.started_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationDashboard;