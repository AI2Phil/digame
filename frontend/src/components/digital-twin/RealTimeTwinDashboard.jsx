/**
 * Real-Time Digital Twin Dashboard
 * Displays live updates for twin status, learning progress, and analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTwinWebSocket } from '../../hooks/useWebSocket';
import './RealTimeTwinDashboard.css';

const RealTimeTwinDashboard = ({ twinId, userId }) => {
  const [twinStatus, setTwinStatus] = useState({
    isActive: false,
    learningProgress: 0,
    conversationCount: 0,
    insightsGenerated: 0,
    lastActivity: null,
    currentPhase: 'initialization'
  });

  const [analytics, setAnalytics] = useState({
    patterns: [],
    predictions: {},
    sentimentScore: 0.0,
    engagementLevel: 'medium'
  });

  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // WebSocket connection for real-time updates
  const {
    connectionStatus: wsStatus,
    lastMessage,
    sendMessage,
    isConnected
  } = useTwinWebSocket(twinId, {
    onMessage: handleWebSocketMessage,
    onConnect: () => setConnectionStatus('connected'),
    onDisconnect: () => setConnectionStatus('disconnected'),
    onError: (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    }
  });

  function handleWebSocketMessage(message) {
    switch (message.type) {
      case 'twin_update':
        handleTwinUpdate(message.data);
        break;
      case 'analytics_update':
        handleAnalyticsUpdate(message.data);
        break;
      case 'notification':
        handleNotification(message.data);
        break;
      case 'error':
        console.error('WebSocket error message:', message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  const handleTwinUpdate = useCallback((data) => {
    if (data.twin_id === twinId) {
      switch (data.update_type) {
        case 'learning_progress':
          setTwinStatus(prev => ({
            ...prev,
            learningProgress: data.payload.progress_percentage,
            currentPhase: data.payload.current_phase,
            insightsGenerated: data.payload.insights_generated,
            lastActivity: data.payload.last_activity,
            isActive: true
          }));
          break;
        case 'conversation_activity':
          setTwinStatus(prev => ({
            ...prev,
            conversationCount: data.payload.message_count,
            lastActivity: new Date().toISOString()
          }));
          setAnalytics(prev => ({
            ...prev,
            sentimentScore: data.payload.sentiment_score,
            engagementLevel: data.payload.engagement_level
          }));
          break;
        default:
          console.log('Unknown twin update type:', data.update_type);
      }
    }
  }, [twinId]);

  const handleAnalyticsUpdate = useCallback((data) => {
    if (data.twin_id === twinId) {
      switch (data.analytics_type) {
        case 'pattern_recognition':
          setAnalytics(prev => ({
            ...prev,
            patterns: data.insights.patterns
          }));
          break;
        case 'predictions':
          setAnalytics(prev => ({
            ...prev,
            predictions: data.insights
          }));
          break;
        default:
          console.log('Unknown analytics type:', data.analytics_type);
      }
    }
  }, [twinId]);

  const handleNotification = useCallback((data) => {
    const notification = {
      id: Date.now(),
      type: data.notification_type,
      title: data.title,
      message: data.message,
      timestamp: data.timestamp,
      data: data.data
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    
    // Auto-remove notification after 5 seconds for non-critical types
    if (!['error', 'warning'].includes(data.notification_type)) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  }, []);

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#10B981';
      case 'connecting': return '#F59E0B';
      case 'disconnected': return '#6B7280';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEngagementColor = (level) => {
    switch (level) {
      case 'high': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'low': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className="real-time-twin-dashboard">
      {/* Connection Status Header */}
      <div className="dashboard-header">
        <div className="twin-info">
          <h2>Digital Twin Dashboard</h2>
          <span className="twin-id">Twin ID: {twinId}</span>
        </div>
        <div className="connection-status">
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(connectionStatus) }}
          />
          <span className="status-text">
            {connectionStatus === 'connected' ? 'Live' : connectionStatus}
          </span>
        </div>
      </div>

      {/* Real-Time Status Cards */}
      <div className="status-grid">
        <div className="status-card">
          <div className="card-header">
            <h3>Learning Progress</h3>
            <div className="live-indicator" />
          </div>
          <div className="card-content">
            <div className="progress-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  strokeDasharray={`${twinStatus.learningProgress * 2.83} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="progress-text">
                {Math.round(twinStatus.learningProgress)}%
              </div>
            </div>
            <div className="progress-details">
              <p>Phase: {twinStatus.currentPhase}</p>
              <p>Insights: {twinStatus.insightsGenerated}</p>
            </div>
          </div>
        </div>

        <div className="status-card">
          <div className="card-header">
            <h3>Conversation Activity</h3>
            <div className="live-indicator" />
          </div>
          <div className="card-content">
            <div className="metric-large">
              {twinStatus.conversationCount}
            </div>
            <p>Total Messages</p>
            <div className="engagement-meter">
              <div className="engagement-label">Engagement</div>
              <div 
                className="engagement-bar"
                style={{ backgroundColor: getEngagementColor(analytics.engagementLevel) }}
              >
                {analytics.engagementLevel}
              </div>
            </div>
          </div>
        </div>

        <div className="status-card">
          <div className="card-header">
            <h3>Sentiment Analysis</h3>
            <div className="live-indicator" />
          </div>
          <div className="card-content">
            <div className="sentiment-gauge">
              <div className="gauge-background">
                <div 
                  className="gauge-fill"
                  style={{ 
                    width: `${(analytics.sentimentScore + 1) * 50}%`,
                    backgroundColor: analytics.sentimentScore > 0 ? '#10B981' : '#EF4444'
                  }}
                />
              </div>
              <div className="sentiment-value">
                {analytics.sentimentScore.toFixed(2)}
              </div>
            </div>
            <p>{analytics.sentimentScore > 0 ? 'Positive' : 'Negative'} Sentiment</p>
          </div>
        </div>

        <div className="status-card">
          <div className="card-header">
            <h3>Pattern Recognition</h3>
            <div className="live-indicator" />
          </div>
          <div className="card-content">
            <div className="metric-large">
              {analytics.patterns.length}
            </div>
            <p>Patterns Detected</p>
            {analytics.patterns.length > 0 && (
              <div className="pattern-preview">
                <div className="pattern-item">
                  <span className="pattern-name">
                    {analytics.patterns[0].name || 'Latest Pattern'}
                  </span>
                  <span className="pattern-confidence">
                    {Math.round((analytics.patterns[0].confidence || 0) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-panel">
          <h3>Live Notifications</h3>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification notification-${notification.type}`}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <span className="notification-title">{notification.title}</span>
                    <button 
                      className="notification-dismiss"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      ×
                    </button>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictions Panel */}
      {analytics.predictions.future_trends && (
        <div className="predictions-panel">
          <h3>AI Predictions</h3>
          <div className="predictions-grid">
            <div className="prediction-card">
              <h4>Future Trends</h4>
              <ul>
                {analytics.predictions.future_trends.slice(0, 3).map((trend, index) => (
                  <li key={index}>{trend}</li>
                ))}
              </ul>
            </div>
            <div className="prediction-card">
              <h4>Risk Factors</h4>
              <ul>
                {analytics.predictions.risk_factors?.slice(0, 3).map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
            <div className="prediction-card">
              <h4>Opportunities</h4>
              <ul>
                {analytics.predictions.opportunities?.slice(0, 3).map((opportunity, index) => (
                  <li key={index}>{opportunity}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Last Activity Timestamp */}
      {twinStatus.lastActivity && (
        <div className="last-activity">
          Last Activity: {new Date(twinStatus.lastActivity).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default RealTimeTwinDashboard;