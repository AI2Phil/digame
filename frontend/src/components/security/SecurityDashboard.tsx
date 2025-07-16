/**
 * Security Dashboard Component with Error Handling
 * Handles backend connection issues and provides fallback UI
 */

import React, { useState, useEffect } from 'react';
import { securityApi, checkBackendHealth } from '../../lib/api';

interface SecurityMetrics {
  total_users: number;
  active_sessions: number;
  failed_logins_24h: number;
  mfa_enabled_users: number;
  security_alerts: string[];
}

interface SecurityDashboardData {
  status: string;
  timestamp: string;
  security_metrics: SecurityMetrics;
  message?: string;
}

export const SecurityDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkBackendStatus = async () => {
    try {
      const isHealthy = await checkBackendHealth();
      setBackendHealthy(isHealthy);
      return isHealthy;
    } catch (error) {
      setBackendHealthy(false);
      return false;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First check if backend is available
      const isBackendHealthy = await checkBackendStatus();
      if (!isBackendHealthy) {
        throw new Error('Backend service unavailable');
      }

      const response = await securityApi.getDashboard();
      
      if (response.error) {
        throw new Error(response.error);
      }

      setDashboardData(response.data as SecurityDashboardData);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Failed to load security dashboard:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRetry = () => {
    fetchDashboardData();
  };

  const renderTroubleshootingInfo = () => (
    <details className="mt-4 p-4 bg-gray-50 rounded-lg">
      <summary className="cursor-pointer font-medium text-gray-700">
        🔧 Troubleshooting Information
      </summary>
      <div className="mt-2 space-y-2 text-sm text-gray-600">
        <div>
          <strong>Backend Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            backendHealthy === true ? 'bg-green-100 text-green-800' :
            backendHealthy === false ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {backendHealthy === true ? 'Healthy' : 
             backendHealthy === false ? 'Unhealthy' : 'Checking...'}
          </span>
        </div>
        <div><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</div>
        <div><strong>Retry Count:</strong> {retryCount}</div>
        <div><strong>Error:</strong> {error}</div>
        
        <div className="mt-3">
          <strong>Common Solutions:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Ensure backend is running on port 8000</li>
            <li>Check CORS settings in backend configuration</li>
            <li>Verify API URL in environment variables</li>
            <li>Check network connectivity</li>
            <li>Review browser console for additional errors</li>
          </ul>
        </div>
        
        <div className="mt-3">
          <strong>Quick Checks:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL}/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Test backend health endpoint
              </a>
            </li>
            <li>
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View API documentation
              </a>
            </li>
          </ul>
        </div>
      </div>
    </details>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading security dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Security Dashboard Unavailable
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Error: {error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleRetry}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🔄 Retry Connection
              </button>
            </div>
            {renderTroubleshootingInfo()}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">No dashboard data available</p>
        <button
          onClick={handleRetry}
          className="mt-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  // Safely extract security_metrics with fallback
  const security_metrics = dashboardData?.security_metrics || {
    total_users: 0,
    active_sessions: 0,
    failed_logins_24h: 0,
    mfa_enabled_users: 0,
    security_alerts: []
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Security Dashboard</h2>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {dashboardData?.status || 'unknown'}
            </span>
            <button
              onClick={handleRetry}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh data"
            >
              🔄
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600" data-testid="total-users">
              {security_metrics.total_users}
            </div>
            <div className="text-sm text-blue-600">Total Users</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600" data-testid="active-sessions">
              {security_metrics.active_sessions}
            </div>
            <div className="text-sm text-green-600">Active Sessions</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600" data-testid="failed-logins">
              {security_metrics.failed_logins_24h}
            </div>
            <div className="text-sm text-yellow-600">Failed Logins (24h)</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600" data-testid="mfa-enabled">
              {security_metrics.mfa_enabled_users}
            </div>
            <div className="text-sm text-purple-600">MFA Enabled</div>
          </div>
        </div>

        {/* Security Score Display for E2E Tests */}
        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-lg font-medium text-gray-900" data-testid="security-score">
              Security Score: {Math.round((security_metrics.mfa_enabled_users / Math.max(1, security_metrics.total_users)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Based on MFA adoption rate</div>
          </div>
        </div>

        {security_metrics.security_alerts && security_metrics.security_alerts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">Security Alerts</h3>
            <div className="space-y-2">
              {security_metrics.security_alerts.map((alert, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">{alert}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          Last updated: {dashboardData?.timestamp ? new Date(dashboardData.timestamp).toLocaleString() : 'Unknown'}
          {dashboardData?.message && (
            <span className="ml-2">• {dashboardData.message}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;