/**
 * WebSocket Hook for Digital Twin Platform
 * Provides real-time communication with the backend
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

const WEBSOCKET_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

export const useWebSocket = (endpoint, options = {}) => {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [error, setError] = useState(null);

  const ws = useRef(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken');
      const wsUrl = `${WEBSOCKET_BASE_URL}${endpoint}${token ? `?token=${token}` : ''}`;
      
      ws.current = new WebSocket(wsUrl);
      setConnectionStatus('connecting');

      ws.current.onopen = () => {
        setConnectionStatus('connected');
        setError(null);
        reconnectCount.current = 0;
        onConnect?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
          setMessageHistory(prev => [...prev.slice(-99), message]); // Keep last 100 messages
          onMessage?.(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onclose = (event) => {
        setConnectionStatus('disconnected');
        onDisconnect?.(event);

        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++;
          reconnectTimer.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        setError(error);
        setConnectionStatus('error');
        onError?.(error);
      };

    } catch (err) {
      setError(err);
      setConnectionStatus('error');
    }
  }, [endpoint, reconnectAttempts, reconnectInterval, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connectionStatus,
    lastMessage,
    messageHistory,
    error,
    connect,
    disconnect,
    sendMessage,
    isConnected: connectionStatus === 'connected'
  };
};

// Specialized hooks for different WebSocket endpoints

export const useTwinWebSocket = (twinId, options = {}) => {
  return useWebSocket(`/twin/${twinId}`, {
    ...options,
    onMessage: (message) => {
      // Handle twin-specific message types
      switch (message.type) {
        case 'twin_update':
          console.log('Twin update received:', message.data);
          break;
        case 'analytics_update':
          console.log('Analytics update received:', message.data);
          break;
        case 'notification':
          console.log('Notification received:', message.data);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
      options.onMessage?.(message);
    }
  });
};

export const useTeamWebSocket = (teamId, options = {}) => {
  return useWebSocket(`/team/${teamId}`, {
    ...options,
    onMessage: (message) => {
      // Handle team-specific message types
      switch (message.type) {
        case 'team_coordination_update':
          console.log('Team coordination update:', message.data);
          break;
        case 'team_member_status':
          console.log('Team member status update:', message.data);
          break;
        case 'collaboration_update':
          console.log('Collaboration update:', message.data);
          break;
        default:
          console.log('Unknown team message type:', message.type);
      }
      options.onMessage?.(message);
    }
  });
};

export const usePlatformWebSocket = (options = {}) => {
  return useWebSocket('/platform', {
    ...options,
    onMessage: (message) => {
      // Handle platform-wide message types
      switch (message.type) {
        case 'system_alert':
          console.log('System alert:', message.data);
          break;
        case 'platform_notification':
          console.log('Platform notification:', message.data);
          break;
        case 'maintenance_update':
          console.log('Maintenance update:', message.data);
          break;
        default:
          console.log('Unknown platform message type:', message.type);
      }
      options.onMessage?.(message);
    }
  });
};

// WebSocket context for global state management
export const WebSocketContext = React.createContext({
  twinConnections: {},
  teamConnections: {},
  platformConnection: null,
  connectToTwin: () => {},
  disconnectFromTwin: () => {},
  connectToTeam: () => {},
  disconnectFromTeam: () => {},
  connectToPlatform: () => {},
  disconnectFromPlatform: () => {}
});

export const WebSocketProvider = ({ children }) => {
  const [twinConnections, setTwinConnections] = useState({});
  const [teamConnections, setTeamConnections] = useState({});
  const [platformConnection, setPlatformConnection] = useState(null);

  const connectToTwin = useCallback((twinId, options = {}) => {
    if (!twinConnections[twinId]) {
      const connection = useTwinWebSocket(twinId, options);
      setTwinConnections(prev => ({
        ...prev,
        [twinId]: connection
      }));
      return connection;
    }
    return twinConnections[twinId];
  }, [twinConnections]);

  const disconnectFromTwin = useCallback((twinId) => {
    if (twinConnections[twinId]) {
      twinConnections[twinId].disconnect();
      setTwinConnections(prev => {
        const newConnections = { ...prev };
        delete newConnections[twinId];
        return newConnections;
      });
    }
  }, [twinConnections]);

  const connectToTeam = useCallback((teamId, options = {}) => {
    if (!teamConnections[teamId]) {
      const connection = useTeamWebSocket(teamId, options);
      setTeamConnections(prev => ({
        ...prev,
        [teamId]: connection
      }));
      return connection;
    }
    return teamConnections[teamId];
  }, [teamConnections]);

  const disconnectFromTeam = useCallback((teamId) => {
    if (teamConnections[teamId]) {
      teamConnections[teamId].disconnect();
      setTeamConnections(prev => {
        const newConnections = { ...prev };
        delete newConnections[teamId];
        return newConnections;
      });
    }
  }, [teamConnections]);

  const connectToPlatform = useCallback((options = {}) => {
    if (!platformConnection) {
      const connection = usePlatformWebSocket(options);
      setPlatformConnection(connection);
      return connection;
    }
    return platformConnection;
  }, [platformConnection]);

  const disconnectFromPlatform = useCallback(() => {
    if (platformConnection) {
      platformConnection.disconnect();
      setPlatformConnection(null);
    }
  }, [platformConnection]);

  const value = {
    twinConnections,
    teamConnections,
    platformConnection,
    connectToTwin,
    disconnectFromTwin,
    connectToTeam,
    disconnectFromTeam,
    connectToPlatform,
    disconnectFromPlatform
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default useWebSocket;