import React, { useState } from 'react';
import { MFASetup } from './MFASetup';
import { SecurityDashboard } from './SecurityDashboard';
import { SecurityPolicyConfig } from './SecurityPolicyConfig';

type SecurityView = 'dashboard' | 'mfa' | 'policies' | 'audit';

export const Security: React.FC = () => {
  const [activeView, setActiveView] = useState<SecurityView>('dashboard');

  const navigationStyle = {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: 'white',
    padding: '0 24px',
  };

  const navItemStyle = {
    padding: '16px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <SecurityDashboard />;
      case 'mfa':
        return (
          <div style={{ padding: '24px' }}>
            <MFASetup onSetupComplete={() => setActiveView('dashboard')} />
          </div>
        );
      case 'policies':
        return <SecurityPolicyConfig />;
      case 'audit':
        return (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: '40px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                🔍 Security Audit Logs
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Comprehensive audit log viewer and analysis tools coming soon.
              </p>
              <div style={{
                padding: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                marginBottom: '20px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Planned Features:
                </h3>
                <ul style={{ textAlign: 'left', color: '#6b7280', lineHeight: '1.6' }}>
                  <li>Real-time audit log streaming</li>
                  <li>Advanced filtering and search</li>
                  <li>Log export and reporting</li>
                  <li>Compliance reporting templates</li>
                  <li>Anomaly detection in logs</li>
                  <li>Integration with SIEM systems</li>
                </ul>
              </div>
              <button
                onClick={() => setActiveView('dashboard')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return <SecurityDashboard />;
    }
  };

  return (
    <div style={containerStyle}>
      <nav style={navigationStyle}>
        <button
          onClick={() => setActiveView('dashboard')}
          style={activeView === 'dashboard' ? activeNavItemStyle : navItemStyle}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveView('mfa')}
          style={activeView === 'mfa' ? activeNavItemStyle : navItemStyle}
        >
          🛡️ Multi-Factor Auth
        </button>
        <button
          onClick={() => setActiveView('policies')}
          style={activeView === 'policies' ? activeNavItemStyle : navItemStyle}
        >
          🔒 Security Policies
        </button>
        <button
          onClick={() => setActiveView('audit')}
          style={activeView === 'audit' ? activeNavItemStyle : navItemStyle}
        >
          📋 Audit Logs
        </button>
      </nav>

      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Security;