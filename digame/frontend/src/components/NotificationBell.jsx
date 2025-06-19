import React, { useState, useEffect, useCallback } from 'react';
import { FaBell } from 'react-icons/fa';
import apiService from '../../services/apiService'; // Use the actual apiService

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch only unread notifications for the bell count and initial dropdown view
      // Pass { read: 'false' } as per apiService.getNotifications implementation
      const data = await apiService.getNotifications({ read: 'false' });
      setNotifications(data); // Store them (these are all unread)
      setUnreadCount(data.length); // All fetched are unread
    } catch (err) {
      setError('Failed to fetch notifications.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch for unread count for the badge
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    // Fetch notifications when dropdown is opened, if desired,
    // or rely on initial fetch. For simplicity, initial fetch is used.
    // If fetching on open:
    // if (isOpen) {
    //   fetchNotifications();
    // }
  }, [isOpen, fetchNotifications]);


  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      // Optimistic update: mark as read locally and update count
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      // Recalculate unread count based on the updated notifications list
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      setError('Failed to mark notification as read.');
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      // Optimistic update: mark all local notifications as read
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError('Failed to mark all notifications as read.');
      console.error(err);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full hover:bg-gray-100"
      >
        <FaBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1 translate-x-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>

          {isLoading && <div className="p-4 text-center text-gray-500">Loading notifications...</div>}
          {error && <div className="p-4 text-center text-red-600">{error}</div>}

          {!isLoading && !error && (
            unreadNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No unread notifications.</div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto custom-scrollbar">
                {unreadNotifications.map(notification => (
                  <li key={notification.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleMarkAsRead(notification.id)}
                      role="menuitem"
                  >
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 capitalize pt-1">
                      {notification.type.replace(/_/g, ' ')} - <TimeAgo date={notification.created_at} />
                    </p>
                  </li>
                ))}
              </ul>
            )
          )}

          {!isLoading && !error && unreadNotifications.length > 0 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                role="menuitem"
              >
                Mark all as read
              </button>
            </div>
          )}
           {!isLoading && !error && unreadNotifications.length === 0 && notifications.length > 0 && (
             <div className="p-4 text-center text-gray-500 text-sm">All caught up!</div>
           )}
        </div>
      )}
    </div>
  );
};

// Simple TimeAgo component (can be replaced with a library like date-fns or moment)
const TimeAgo = ({ date }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) { setTimeAgo(interval + ' years ago'); return; }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) { setTimeAgo(interval + ' months ago'); return; }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) { setTimeAgo(interval + ' days ago'); return; }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) { setTimeAgo(interval + ' hours ago'); return; }
    interval = Math.floor(seconds / 60);
    if (interval > 1) { setTimeAgo(interval + ' minutes ago'); return; }
    setTimeAgo(Math.floor(seconds) + ' seconds ago');
  }, [date]);

  return <span className="text-xs text-gray-400">{timeAgo}</span>;
};

export default NotificationBell;

// Basic CSS for custom scrollbar (optional, can be put in a global CSS file)
const style = document.createElement('style');
style.innerHTML = \`
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c5c5c5;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a5a5a5;
  }
\`;
document.head.appendChild(style);
