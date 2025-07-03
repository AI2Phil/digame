const express = require('express');
const router = express.Router();

// Mock data for notifications
const mockNotifications = [
  {
    id: 'notif_001',
    title: 'Welcome to Digame!',
    message: 'Your account has been successfully created. Complete your profile to get started.',
    type: 'info',
    category: 'system',
    priority: 'medium',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    actionUrl: '/profile',
    actionText: 'Complete Profile'
  },
  {
    id: 'notif_002',
    title: 'New Team Member Invitation',
    message: 'John Doe has invited you to join the "Marketing Team" workspace.',
    type: 'info',
    category: 'team',
    priority: 'high',
    read: false,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    actionUrl: '/team/invitations',
    actionText: 'View Invitation'
  },
  {
    id: 'notif_003',
    title: 'Task Assignment',
    message: 'You have been assigned to "Implement user authentication" task.',
    type: 'info',
    category: 'task',
    priority: 'medium',
    read: true,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    actionUrl: '/tasks/task_123',
    actionText: 'View Task'
  },
  {
    id: 'notif_004',
    title: 'Security Alert',
    message: 'New login detected from Chrome on Windows. If this wasn\'t you, please secure your account.',
    type: 'warning',
    category: 'security',
    priority: 'urgent',
    read: false,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    actionUrl: '/security/sessions',
    actionText: 'Review Sessions'
  },
  {
    id: 'notif_005',
    title: 'Weekly Report Available',
    message: 'Your weekly productivity report is ready. You completed 12 tasks this week.',
    type: 'success',
    category: 'system',
    priority: 'low',
    read: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    actionUrl: '/reports/weekly',
    actionText: 'View Report'
  },
  {
    id: 'notif_006',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM UTC.',
    type: 'warning',
    category: 'system',
    priority: 'medium',
    read: false,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    actionUrl: '/system/status',
    actionText: 'View Status'
  },
  {
    id: 'notif_007',
    title: 'Feature Update',
    message: 'New AI-powered task suggestions are now available in your dashboard.',
    type: 'success',
    category: 'update',
    priority: 'low',
    read: true,
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    actionUrl: '/ai-tools',
    actionText: 'Explore Features'
  },
  {
    id: 'notif_008',
    title: 'Payment Successful',
    message: 'Your subscription payment of $29.00 has been processed successfully.',
    type: 'success',
    category: 'billing',
    priority: 'low',
    read: true,
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    actionUrl: '/billing/history',
    actionText: 'View Invoice'
  }
];

const mockSettings = {
  emailNotifications: true,
  pushNotifications: true,
  inAppNotifications: true,
  weeklyDigest: true,
  instantAlerts: false,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  categories: {
    system: true,
    team: true,
    task: true,
    security: true,
    billing: true,
    update: true
  },
  priorities: {
    urgent: true,
    high: true,
    medium: true,
    low: false
  }
};

// Get all notifications
router.get('/', (req, res) => {
  const { category, priority, read, limit = 50, offset = 0 } = req.query;
  
  let filteredNotifications = [...mockNotifications];
  
  // Apply filters
  if (category && category !== 'all') {
    filteredNotifications = filteredNotifications.filter(n => n.category === category);
  }
  
  if (priority && priority !== 'all') {
    filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
  }
  
  if (read !== undefined) {
    const isRead = read === 'true';
    filteredNotifications = filteredNotifications.filter(n => n.read === isRead);
  }
  
  // Sort by timestamp (newest first)
  filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Apply pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
  
  // Calculate stats
  const stats = {
    total: mockNotifications.length,
    unread: mockNotifications.filter(n => !n.read).length,
    urgent: mockNotifications.filter(n => n.priority === 'urgent').length,
    high: mockNotifications.filter(n => n.priority === 'high').length,
    byCategory: {
      system: mockNotifications.filter(n => n.category === 'system').length,
      team: mockNotifications.filter(n => n.category === 'team').length,
      task: mockNotifications.filter(n => n.category === 'task').length,
      security: mockNotifications.filter(n => n.category === 'security').length,
      billing: mockNotifications.filter(n => n.category === 'billing').length,
      update: mockNotifications.filter(n => n.category === 'update').length
    }
  };
  
  res.json({
    notifications: paginatedNotifications,
    stats,
    pagination: {
      total: filteredNotifications.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: endIndex < filteredNotifications.length
    }
  });
});

// Get notification settings
router.get('/settings', (req, res) => {
  res.json({
    settings: mockSettings
  });
});

// Update notification settings
router.put('/settings', (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    return res.status(400).json({ error: 'Settings data is required' });
  }
  
  // In a real implementation, save to database
  Object.assign(mockSettings, settings);
  
  res.json({
    message: 'Notification settings updated successfully',
    settings: mockSettings
  });
});

// Mark notifications as read
router.post('/mark-read', (req, res) => {
  const { notificationIds } = req.body;
  
  if (!notificationIds || !Array.isArray(notificationIds)) {
    return res.status(400).json({ error: 'Notification IDs array is required' });
  }
  
  let updatedCount = 0;
  
  mockNotifications.forEach(notification => {
    if (notificationIds.includes(notification.id) && !notification.read) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      updatedCount++;
    }
  });
  
  res.json({
    message: `${updatedCount} notifications marked as read`,
    updatedCount,
    unreadCount: mockNotifications.filter(n => !n.read).length
  });
});

// Mark all notifications as read
router.post('/mark-all-read', (req, res) => {
  let updatedCount = 0;
  
  mockNotifications.forEach(notification => {
    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      updatedCount++;
    }
  });
  
  res.json({
    message: `All ${updatedCount} notifications marked as read`,
    updatedCount,
    unreadCount: 0
  });
});

// Delete notifications
router.delete('/delete', (req, res) => {
  const { notificationIds } = req.body;
  
  if (!notificationIds || !Array.isArray(notificationIds)) {
    return res.status(400).json({ error: 'Notification IDs array is required' });
  }
  
  const initialLength = mockNotifications.length;
  
  // Remove notifications (in real implementation, mark as deleted or remove from DB)
  for (let i = mockNotifications.length - 1; i >= 0; i--) {
    if (notificationIds.includes(mockNotifications[i].id)) {
      mockNotifications.splice(i, 1);
    }
  }
  
  const deletedCount = initialLength - mockNotifications.length;
  
  res.json({
    message: `${deletedCount} notifications deleted`,
    deletedCount,
    remainingCount: mockNotifications.length
  });
});

// Create new notification (for system use)
router.post('/create', (req, res) => {
  const { title, message, type = 'info', category = 'system', priority = 'medium', actionUrl, actionText } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }
  
  const newNotification = {
    id: `notif_${Date.now()}`,
    title,
    message,
    type,
    category,
    priority,
    read: false,
    timestamp: new Date().toISOString(),
    actionUrl: actionUrl || null,
    actionText: actionText || null
  };
  
  mockNotifications.unshift(newNotification);
  
  res.status(201).json({
    message: 'Notification created successfully',
    notification: newNotification
  });
});

// Get notification by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const notification = mockNotifications.find(n => n.id === id);
  
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  res.json({ notification });
});

// Update notification
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const notificationIndex = mockNotifications.findIndex(n => n.id === id);
  
  if (notificationIndex === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  // Update notification
  Object.assign(mockNotifications[notificationIndex], updates, {
    updatedAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Notification updated successfully',
    notification: mockNotifications[notificationIndex]
  });
});

// Delete single notification
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const notificationIndex = mockNotifications.findIndex(n => n.id === id);
  
  if (notificationIndex === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  const deletedNotification = mockNotifications.splice(notificationIndex, 1)[0];
  
  res.json({
    message: 'Notification deleted successfully',
    notification: deletedNotification
  });
});

// Get notification statistics
router.get('/stats/summary', (req, res) => {
  const stats = {
    total: mockNotifications.length,
    unread: mockNotifications.filter(n => !n.read).length,
    read: mockNotifications.filter(n => n.read).length,
    byPriority: {
      urgent: mockNotifications.filter(n => n.priority === 'urgent').length,
      high: mockNotifications.filter(n => n.priority === 'high').length,
      medium: mockNotifications.filter(n => n.priority === 'medium').length,
      low: mockNotifications.filter(n => n.priority === 'low').length
    },
    byCategory: {
      system: mockNotifications.filter(n => n.category === 'system').length,
      team: mockNotifications.filter(n => n.category === 'team').length,
      task: mockNotifications.filter(n => n.category === 'task').length,
      security: mockNotifications.filter(n => n.category === 'security').length,
      billing: mockNotifications.filter(n => n.category === 'billing').length,
      update: mockNotifications.filter(n => n.category === 'update').length
    },
    byType: {
      info: mockNotifications.filter(n => n.type === 'info').length,
      success: mockNotifications.filter(n => n.type === 'success').length,
      warning: mockNotifications.filter(n => n.type === 'warning').length,
      error: mockNotifications.filter(n => n.type === 'error').length
    },
    recent: {
      last24h: mockNotifications.filter(n => 
        new Date(n.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      last7d: mockNotifications.filter(n => 
        new Date(n.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      last30d: mockNotifications.filter(n => 
        new Date(n.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    }
  };
  
  res.json({ stats });
});

// Bulk operations
router.post('/bulk', (req, res) => {
  const { action, notificationIds, data } = req.body;
  
  if (!action || !notificationIds || !Array.isArray(notificationIds)) {
    return res.status(400).json({ error: 'Action and notification IDs are required' });
  }
  
  let affectedCount = 0;
  
  switch (action) {
    case 'mark-read':
      mockNotifications.forEach(notification => {
        if (notificationIds.includes(notification.id) && !notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          affectedCount++;
        }
      });
      break;
      
    case 'mark-unread':
      mockNotifications.forEach(notification => {
        if (notificationIds.includes(notification.id) && notification.read) {
          notification.read = false;
          delete notification.readAt;
          affectedCount++;
        }
      });
      break;
      
    case 'delete':
      for (let i = mockNotifications.length - 1; i >= 0; i--) {
        if (notificationIds.includes(mockNotifications[i].id)) {
          mockNotifications.splice(i, 1);
          affectedCount++;
        }
      }
      break;
      
    case 'update-priority':
      if (!data || !data.priority) {
        return res.status(400).json({ error: 'Priority is required for update-priority action' });
      }
      mockNotifications.forEach(notification => {
        if (notificationIds.includes(notification.id)) {
          notification.priority = data.priority;
          notification.updatedAt = new Date().toISOString();
          affectedCount++;
        }
      });
      break;
      
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
  
  res.json({
    message: `Bulk ${action} completed`,
    affectedCount,
    action
  });
});

module.exports = router;