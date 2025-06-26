import React, { useState, useEffect } from 'react';

interface SecurityPolicy {
  id: number;
  policy_name: string;
  policy_type: string;
  description: string;
  is_enabled: boolean;
  configuration: Record<string, any>;
  applies_to: string;
  created_at: string;
  updated_at: string;
}

interface PolicyFormData {
  policy_name: string;
  policy_type: 'password' | 'session' | 'access' | 'data';
  description: string;
  is_enabled: boolean;
  configuration: Record<string, any>;
  applies_to: 'all' | 'admin' | 'user' | 'guest';
}

export const SecurityPolicyConfig: React.FC = () => {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SecurityPolicy | null>(null);
  const [formData, setFormData] = useState<PolicyFormData>({
    policy_name: '',
    policy_type: 'password',
    description: '',
    is_enabled: true,
    configuration: {},
    applies_to: 'all',
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/policies');
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data = await response.json();
      setPolicies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch('/api/security/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create policy');

      await fetchPolicies();
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create policy');
    }
  };

  const resetForm = () => {
    setFormData({
      policy_name: '',
      policy_type: 'password',
      description: '',
      is_enabled: true,
      configuration: {},
      applies_to: 'all',
    });
    setEditingPolicy(null);
  };

  const handleEditPolicy = (policy: SecurityPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      policy_name: policy.policy_name,
      policy_type: policy.policy_type as PolicyFormData['policy_type'],
      description: policy.description,
      is_enabled: policy.is_enabled,
      configuration: policy.configuration,
      applies_to: policy.applies_to as PolicyFormData['applies_to'],
    });
    setShowCreateForm(true);
  };

  const getDefaultConfiguration = (policyType: string) => {
    switch (policyType) {
      case 'password':
        return {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_special: true,
          max_age_days: 90,
          history_count: 5,
        };
      case 'session':
        return {
          max_duration_hours: 8,
          idle_timeout_minutes: 30,
          require_mfa_for_sensitive: true,
          concurrent_sessions_limit: 3,
        };
      case 'access':
        return {
          max_failed_attempts: 5,
          lockout_duration_minutes: 15,
          require_mfa_for_admin: true,
          allowed_ip_ranges: [],
        };
      case 'data':
        return {
          encryption_required: true,
          backup_retention_days: 30,
          audit_all_access: true,
          data_classification_required: false,
        };
      default:
        return {};
    }
  };

  const updateConfiguration = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: value,
      },
    }));
  };

  const renderConfigurationForm = () => {
    const config = formData.configuration;

    switch (formData.policy_type) {
      case 'password':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Minimum Length
              </label>
              <input
                type="number"
                value={config.min_length || 8}
                onChange={(e) => updateConfiguration('min_length', parseInt(e.target.value))}
                style={inputStyle}
                min="1"
                max="128"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Max Age (Days)
              </label>
              <input
                type="number"
                value={config.max_age_days || 90}
                onChange={(e) => updateConfiguration('max_age_days', parseInt(e.target.value))}
                style={inputStyle}
                min="1"
                max="365"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {[
                  { key: 'require_uppercase', label: 'Require Uppercase' },
                  { key: 'require_lowercase', label: 'Require Lowercase' },
                  { key: 'require_numbers', label: 'Require Numbers' },
                  { key: 'require_special', label: 'Require Special Characters' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={config[item.key] || false}
                      onChange={(e) => updateConfiguration(item.key, e.target.checked)}
                    />
                    <span style={{ fontSize: '14px' }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'session':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Max Duration (Hours)
              </label>
              <input
                type="number"
                value={config.max_duration_hours || 8}
                onChange={(e) => updateConfiguration('max_duration_hours', parseInt(e.target.value))}
                style={inputStyle}
                min="1"
                max="24"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Idle Timeout (Minutes)
              </label>
              <input
                type="number"
                value={config.idle_timeout_minutes || 30}
                onChange={(e) => updateConfiguration('idle_timeout_minutes', parseInt(e.target.value))}
                style={inputStyle}
                min="5"
                max="120"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Concurrent Sessions Limit
              </label>
              <input
                type="number"
                value={config.concurrent_sessions_limit || 3}
                onChange={(e) => updateConfiguration('concurrent_sessions_limit', parseInt(e.target.value))}
                style={inputStyle}
                min="1"
                max="10"
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.require_mfa_for_sensitive || false}
                  onChange={(e) => updateConfiguration('require_mfa_for_sensitive', e.target.checked)}
                />
                <span style={{ fontSize: '14px' }}>Require MFA for Sensitive Operations</span>
              </label>
            </div>
          </div>
        );

      case 'access':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Max Failed Attempts
              </label>
              <input
                type="number"
                value={config.max_failed_attempts || 5}
                onChange={(e) => updateConfiguration('max_failed_attempts', parseInt(e.target.value))}
                style={inputStyle}
                min="1"
                max="20"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Lockout Duration (Minutes)
              </label>
              <input
                type="number"
                value={config.lockout_duration_minutes || 15}
                onChange={(e) => updateConfiguration('lockout_duration_minutes', parseInt(e.target.value))}
                style={inputStyle}
                min="1"
                max="1440"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.require_mfa_for_admin || false}
                  onChange={(e) => updateConfiguration('require_mfa_for_admin', e.target.checked)}
                />
                <span style={{ fontSize: '14px' }}>Require MFA for Admin Access</span>
              </label>
            </div>
          </div>
        );

      case 'data':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Backup Retention (Days)
              </label>
              <input
                type="number"
                value={config.backup_retention_days || 30}
                onChange={(e) => updateConfiguration('backup_retention_days', parseInt(e.target.value))}
                style={inputStyle}
                min="1"
                max="365"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {[
                  { key: 'encryption_required', label: 'Encryption Required' },
                  { key: 'audit_all_access', label: 'Audit All Data Access' },
                  { key: 'data_classification_required', label: 'Data Classification Required' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={config[item.key] || false}
                      onChange={(e) => updateConfiguration(item.key, e.target.checked)}
                    />
                    <span style={{ fontSize: '14px' }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const cardStyle = {
    padding: '24px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading security policies...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            🔒 Security Policy Configuration
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Configure and manage security policies for your organization
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setFormData(prev => ({
              ...prev,
              configuration: getDefaultConfiguration(prev.policy_type),
            }));
          }}
          style={buttonStyle}
        >
          ➕ Create Policy
        </button>
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

      {showCreateForm && (
        <div style={{ ...cardStyle, marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Policy Name
              </label>
              <input
                type="text"
                value={formData.policy_name}
                onChange={(e) => setFormData(prev => ({ ...prev, policy_name: e.target.value }))}
                style={inputStyle}
                placeholder="Enter policy name"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Policy Type
              </label>
              <select
                value={formData.policy_type}
                onChange={(e) => {
                  const newType = e.target.value as PolicyFormData['policy_type'];
                  setFormData(prev => ({
                    ...prev,
                    policy_type: newType,
                    configuration: getDefaultConfiguration(newType),
                  }));
                }}
                style={inputStyle}
              >
                <option value="password">Password Policy</option>
                <option value="session">Session Policy</option>
                <option value="access">Access Control Policy</option>
                <option value="data">Data Protection Policy</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Enter policy description"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Applies To
              </label>
              <select
                value={formData.applies_to}
                onChange={(e) => setFormData(prev => ({ ...prev, applies_to: e.target.value as PolicyFormData['applies_to'] }))}
                style={inputStyle}
              >
                <option value="all">All Users</option>
                <option value="admin">Administrators</option>
                <option value="user">Regular Users</option>
                <option value="guest">Guest Users</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.is_enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, is_enabled: e.target.checked }))}
              />
              <label style={{ fontSize: '14px', fontWeight: '500' }}>
                Enable Policy
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Policy Configuration
            </h3>
            {renderConfigurationForm()}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              style={{
                ...buttonStyle,
                backgroundColor: '#f9fafb',
                color: '#374151',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePolicy}
              style={buttonStyle}
            >
              {editingPolicy ? 'Update Policy' : 'Create Policy'}
            </button>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
          Existing Policies
        </h2>

        {policies.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
            No security policies configured
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Applies To</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Updated</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                      {policy.policy_name}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {policy.policy_type}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {policy.applies_to}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: policy.is_enabled ? '#dcfce7' : '#fef2f2',
                        color: policy.is_enabled ? '#166534' : '#dc2626',
                      }}>
                        {policy.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {new Date(policy.updated_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleEditPolicy(policy)}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#f9fafb',
                          color: '#374151',
                          fontSize: '12px',
                          padding: '4px 8px',
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};