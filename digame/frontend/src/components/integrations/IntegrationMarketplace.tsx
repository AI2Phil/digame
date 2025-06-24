import React, { useState, useEffect } from 'react';

interface IntegrationProvider {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  logo_url: string;
  auth_type: string;
  supported_operations: string[];
  rate_limits: Record<string, number>;
  is_active: boolean;
}

interface IntegrationConnection {
  id: number;
  provider_id: number;
  connection_name: string;
  status: string;
  created_at: string;
  last_sync_at?: string;
  provider: IntegrationProvider;
}

type CategoryFilter = 'all' | 'communication' | 'crm' | 'project_management' | 'time_tracking' | 'learning' | 'development' | 'productivity';

export const IntegrationMarketplace: React.FC = () => {
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConnected, setShowConnected] = useState(false);

  useEffect(() => {
    fetchProviders();
    fetchConnections();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/integrations/providers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      const data = await response.json();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/integrations/connections');
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setConnections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: IntegrationProvider) => {
    try {
      // This would typically redirect to OAuth flow
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_id: provider.id,
          connection_name: `${provider.display_name} Connection`,
        }),
      });

      if (!response.ok) throw new Error('Failed to initiate connection');
      
      // Refresh connections after successful connection
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const handleDisconnect = async (connectionId: number) => {
    try {
      const response = await fetch(`/api/integrations/connections/${connectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to disconnect');
      
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  const handleSync = async (connectionId: number) => {
    try {
      const response = await fetch(`/api/integrations/connections/${connectionId}/sync`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to sync');
      
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync');
    }
  };

  const getConnectionForProvider = (providerId: number) => {
    return connections.find(conn => conn.provider_id === providerId);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    const matchesSearch = provider.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConnectionFilter = !showConnected || getConnectionForProvider(provider.id);
    
    return matchesCategory && matchesSearch && matchesConnectionFilter;
  });

  const categories = [
    { key: 'all', label: '🔗 All Integrations', count: providers.length },
    { key: 'communication', label: '💬 Communication', count: providers.filter(p => p.category === 'communication').length },
    { key: 'crm', label: '👥 CRM', count: providers.filter(p => p.category === 'crm').length },
    { key: 'project_management', label: '📋 Project Management', count: providers.filter(p => p.category === 'project_management').length },
    { key: 'time_tracking', label: '⏱️ Time Tracking', count: providers.filter(p => p.category === 'time_tracking').length },
    { key: 'learning', label: '📚 Learning', count: providers.filter(p => p.category === 'learning').length },
    { key: 'development', label: '💻 Development', count: providers.filter(p => p.category === 'development').length },
    { key: 'productivity', label: '⚡ Productivity', count: providers.filter(p => p.category === 'productivity').length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'error': return '#dc2626';
      case 'pending': return '#d97706';
      default: return '#6b7280';
    }
  };

  const cardStyle = {
    padding: '20px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s',
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading integrations...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          🔗 Integration Marketplace
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Connect your favorite tools and services to streamline your workflow
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

      {/* Search and Filters */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '300px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={showConnected}
              onChange={(e) => setShowConnected(e.target.checked)}
            />
            <span style={{ fontSize: '14px' }}>Show only connected</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as CategoryFilter)}
              style={{
                ...buttonStyle,
                backgroundColor: selectedCategory === category.key ? '#3b82f6' : '#f9fafb',
                color: selectedCategory === category.key ? 'white' : '#374151',
                fontSize: '12px',
                padding: '6px 12px',
              }}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Connected Integrations Summary */}
      {connections.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: '24px', backgroundColor: '#f0fdf4' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#166534' }}>
            🟢 Connected Integrations ({connections.length})
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {connections.map((connection) => (
              <div
                key={connection.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  border: '1px solid #dcfce7',
                }}
              >
                <img
                  src={connection.provider.logo_url}
                  alt={connection.provider.display_name}
                  style={{ width: '16px', height: '16px', borderRadius: '2px' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span>{connection.provider.display_name}</span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(connection.status),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
      }}>
        {filteredProviders.map((provider) => {
          const connection = getConnectionForProvider(provider.id);
          const isConnected = !!connection;

          return (
            <div
              key={provider.id}
              style={{
                ...cardStyle,
                borderColor: isConnected ? '#059669' : '#e2e8f0',
                backgroundColor: isConnected ? '#f0fdf4' : 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img
                  src={provider.logo_url}
                  alt={provider.display_name}
                  style={{ width: '40px', height: '40px', borderRadius: '6px' }}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNiIgZmlsbD0iIzZiNzI4MCIvPgo8dGV4dCB4PSIyMCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+Cjwvc3ZnPg==';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {provider.display_name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#6b7280',
                    }}>
                      {provider.category.replace('_', ' ').toUpperCase()}
                    </span>
                    {isConnected && (
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                      }}>
                        ✓ Connected
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.4' }}>
                {provider.description}
              </p>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Supported Operations:
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {provider.supported_operations.map((op) => (
                    <span
                      key={op}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '3px',
                        fontSize: '10px',
                        color: '#374151',
                      }}
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </div>

              {connection && (
                <div style={{ marginBottom: '16px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    Connection Status:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(connection.status),
                      }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: '500' }}>
                      {connection.status.toUpperCase()}
                    </span>
                    {connection.last_sync_at && (
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        • Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleSync(connection!.id)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#059669',
                        flex: 1,
                      }}
                    >
                      🔄 Sync Now
                    </button>
                    <button
                      onClick={() => handleDisconnect(connection!.id)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#dc2626',
                      }}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(provider)}
                    style={{
                      ...buttonStyle,
                      width: '100%',
                    }}
                  >
                    🔗 Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProviders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>No integrations found</div>
          <div style={{ fontSize: '14px' }}>
            Try adjusting your search terms or category filters
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationMarketplace;