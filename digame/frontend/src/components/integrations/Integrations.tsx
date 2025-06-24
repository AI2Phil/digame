import React, { useState } from 'react';
import IntegrationMarketplace from './IntegrationMarketplace';
import IntegrationDashboard from './IntegrationDashboard';

type IntegrationView = 'marketplace' | 'dashboard' | 'settings';

export const Integrations: React.FC = () => {
  const [activeView, setActiveView] = useState<IntegrationView>('marketplace');

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
      case 'marketplace':
        return <IntegrationMarketplace />;
      case 'dashboard':
        return <IntegrationDashboard />;
      case 'settings':
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
                ⚙️ Integration Settings
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Advanced integration configuration and management tools coming soon.
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
                  <li>Global integration settings and preferences</li>
                  <li>API rate limit monitoring and configuration</li>
                  <li>Data mapping and transformation rules</li>
                  <li>Webhook endpoint management</li>
                  <li>Integration health monitoring and alerts</li>
                  <li>Bulk connection management tools</li>
                  <li>Integration usage analytics and reporting</li>
                  <li>Custom integration development tools</li>
                </ul>
              </div>
              <button
                onClick={() => setActiveView('marketplace')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Back to Marketplace
              </button>
            </div>
          </div>
        );
      default:
        return <IntegrationMarketplace />;
    }
  };

  return (
    <div style={containerStyle}>
      <nav style={navigationStyle}>
        <button
          onClick={() => setActiveView('marketplace')}
          style={activeView === 'marketplace' ? activeNavItemStyle : navItemStyle}
        >
          🏪 Marketplace
        </button>
        <button
          onClick={() => setActiveView('dashboard')}
          style={activeView === 'dashboard' ? activeNavItemStyle : navItemStyle}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveView('settings')}
          style={activeView === 'settings' ? activeNavItemStyle : navItemStyle}
        >
          ⚙️ Settings
        </button>
      </nav>

      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Integrations;