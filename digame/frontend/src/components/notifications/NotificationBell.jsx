import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import NotificationCenter from './NotificationCenter';
import notificationService from '../../services/notificationService';
import websocketService from '../../services/websocketService';

const NotificationBell = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize notification service
    initializeNotifications();

    // Subscribe to notification events
    const unsubscribers = [
      notificationService.on('notificationAdded', handleNewNotification),
      notificationService.on('notificationRead', updateUnreadCount),
      notificationService.on('notificationsCleared', updateUnreadCount),
      websocketService.on('connected', handleWebSocketConnected),
      websocketService.on('disconnected', handleWebSocketDisconnected)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
      updateUnreadCount();
      
      // Connect WebSocket if user is authenticated
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        websocketService.connect(token, userId);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setHasNewNotification(true);
    updateUnreadCount();
    
    // Auto-hide the "new notification" indicator after 3 seconds
    setTimeout(() => {
      setHasNewNotification(false);
    }, 3000);
  };

  const updateUnreadCount = () => {
    const stats = notificationService.getStats();
    setUnreadCount(stats.unread);
  };

  const handleWebSocketConnected = () => {
    setIsConnected(true);
  };

  const handleWebSocketDisconnected = () => {
    setIsConnected(false);
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    setHasNewNotification(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBellClick}
          className={`relative p-2 ${hasNewNotification ? 'animate-pulse' : ''}`}
        >
          {hasNewNotification ? (
            <BellRing className="w-5 h-5 text-blue-600" />
          ) : (
            <Bell className="w-5 h-5 text-gray-600" />
          )}
          
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {/* Connection status indicator */}
          <div
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
        </Button>
      </div>

      {/* Notification Center */}
      <NotificationCenter isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default NotificationBell;