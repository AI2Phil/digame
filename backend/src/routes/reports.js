const express = require('express');
const router = express.Router();

// Mock data for reports and publishing
const mockData = {
  // Reports overview data
  stats: {
    totalReports: 47,
    scheduledReports: 12,
    sharedReports: 23,
    viewsThisMonth: 1847,
    downloadsThisMonth: 234,
    automatedReports: 8
  },

  // Recent reports
  reports: [
    {
      id: 1,
      name: 'Monthly User Analytics',
      type: 'analytics',
      status: 'completed',
      created: '2024-01-30T10:00:00Z',
      views: 45,
      downloads: 12,
      size: '2.4 MB',
      format: 'PDF',
      schedule: 'Monthly',
      nextRun: '2024-02-01T09:00:00Z',
      author: 'System',
      tags: ['analytics', 'users', 'monthly']
    },
    {
      id: 2,
      name: 'Revenue Performance Report',
      type: 'financial',
      status: 'processing',
      created: '2024-01-30T14:30:00Z',
      views: 0,
      downloads: 0,
      size: null,
      format: 'Excel',
      schedule: 'Weekly',
      nextRun: '2024-02-05T08:00:00Z',
      author: 'Finance Team',
      tags: ['revenue', 'financial', 'performance']
    },
    {
      id: 3,
      name: 'Team Productivity Dashboard',
      type: 'productivity',
      status: 'completed',
      created: '2024-01-29T16:15:00Z',
      views: 78,
      downloads: 23,
      size: '1.8 MB',
      format: 'PDF',
      schedule: 'Daily',
      nextRun: '2024-01-31T07:00:00Z',
      author: 'HR Department',
      tags: ['productivity', 'team', 'daily']
    }
  ],

  // Report templates
  templates: [
    {
      id: 1,
      name: 'User Analytics Report',
      description: 'Comprehensive user behavior and engagement analytics',
      category: 'Analytics',
      estimatedTime: '5-10 minutes',
      dataPoints: 25,
      visualizations: 8,
      widgets: ['user-analytics', 'engagement-metrics', 'behavior-patterns']
    },
    {
      id: 2,
      name: 'Financial Performance',
      description: 'Revenue, costs, and profitability analysis',
      category: 'Financial',
      estimatedTime: '3-5 minutes',
      dataPoints: 15,
      visualizations: 6,
      widgets: ['revenue-metrics', 'cost-analysis', 'profit-margins']
    },
    {
      id: 3,
      name: 'Team Productivity',
      description: 'Team performance metrics and productivity insights',
      category: 'Productivity',
      estimatedTime: '7-12 minutes',
      dataPoints: 30,
      visualizations: 10,
      widgets: ['team-performance', 'task-completion', 'collaboration-metrics']
    }
  ],

  // Scheduled reports
  scheduled: [
    {
      id: 1,
      name: 'Daily Operations Summary',
      frequency: 'Daily',
      nextRun: '2024-01-31T07:00:00Z',
      recipients: ['admin@company.com', 'ops@company.com'],
      format: 'PDF',
      status: 'active',
      reportId: 1
    },
    {
      id: 2,
      name: 'Weekly Performance Review',
      frequency: 'Weekly',
      nextRun: '2024-02-05T09:00:00Z',
      recipients: ['management@company.com'],
      format: 'Excel',
      status: 'active',
      reportId: 2
    }
  ],

  // Published reports
  published: [
    {
      id: 1,
      name: 'Q4 2024 Performance Report',
      description: 'Comprehensive quarterly performance analysis',
      visibility: 'public',
      views: 1247,
      downloads: 234,
      shares: 45,
      publishedAt: '2024-01-15T10:00:00Z',
      lastViewed: '2024-01-30T14:30:00Z',
      url: 'https://reports.digame.com/q4-2024-performance',
      allowDownload: true,
      allowComments: true,
      expiresAt: '2024-04-15T00:00:00Z',
      tags: ['quarterly', 'performance', 'analytics'],
      author: 'John Admin',
      size: '4.2 MB',
      format: 'PDF'
    }
  ],

  // Shared links
  sharedLinks: [
    {
      id: 1,
      reportName: 'Revenue Analytics Report',
      url: 'https://reports.digame.com/share/abc123def456',
      createdAt: '2024-01-29T10:00:00Z',
      expiresAt: '2024-02-29T00:00:00Z',
      views: 23,
      maxViews: 100,
      password: true,
      status: 'active'
    }
  ],

  // Distribution channels
  distributionChannels: [
    {
      id: 'email',
      name: 'Email Distribution',
      description: 'Send reports directly to email recipients',
      enabled: true,
      settings: {
        smtpConfigured: true,
        defaultSender: 'reports@digame.com',
        maxRecipients: 100
      }
    },
    {
      id: 'slack',
      name: 'Slack Integration',
      description: 'Share reports in Slack channels',
      enabled: false,
      settings: {
        webhookUrl: '',
        defaultChannel: '#reports'
      }
    }
  ],

  // Analytics data
  analytics: {
    totalViews: 15847,
    totalDownloads: 4234,
    totalShares: 1567,
    totalPublished: 47,
    trends: [
      { date: '2024-01-24', views: 234, downloads: 45, shares: 12 },
      { date: '2024-01-25', views: 267, downloads: 52, shares: 15 },
      { date: '2024-01-26', views: 298, downloads: 48, shares: 18 },
      { date: '2024-01-27', views: 312, downloads: 61, shares: 22 },
      { date: '2024-01-28', views: 289, downloads: 55, shares: 19 },
      { date: '2024-01-29', views: 345, downloads: 67, shares: 25 },
      { date: '2024-01-30', views: 378, downloads: 72, shares: 28 }
    ]
  }
};

// Reports overview endpoints
router.get('/stats', (req, res) => {
  res.json(mockData.stats);
});

router.get('/', (req, res) => {
  const { type, status, period = '30d' } = req.query;
  let reports = [...mockData.reports];

  if (type && type !== 'all') {
    reports = reports.filter(report => report.type === type);
  }

  if (status && status !== 'all') {
    reports = reports.filter(report => report.status === status);
  }

  res.json({
    reports,
    total: reports.length,
    period
  });
});

router.get('/:id', (req, res) => {
  const report = mockData.reports.find(r => r.id === parseInt(req.params.id));
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

// Report templates
router.get('/templates', (req, res) => {
  const { category } = req.query;
  let templates = [...mockData.templates];

  if (category && category !== 'all') {
    templates = templates.filter(template => template.category === category);
  }

  res.json(templates);
});

router.get('/templates/:id', (req, res) => {
  const template = mockData.templates.find(t => t.id === parseInt(req.params.id));
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});

// Create new report
router.post('/', (req, res) => {
  const { name, type, templateId, settings } = req.body;
  
  const newReport = {
    id: mockData.reports.length + 1,
    name,
    type: type || 'custom',
    status: 'processing',
    created: new Date().toISOString(),
    views: 0,
    downloads: 0,
    size: null,
    format: settings?.format || 'PDF',
    schedule: settings?.schedule || 'none',
    nextRun: settings?.schedule !== 'none' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
    author: 'Current User',
    tags: settings?.tags || []
  };

  mockData.reports.push(newReport);
  res.status(201).json(newReport);
});

// Scheduled reports
router.get('/scheduled', (req, res) => {
  res.json(mockData.scheduled);
});

router.post('/scheduled', (req, res) => {
  const { reportId, frequency, recipients, format } = req.body;
  
  const newSchedule = {
    id: mockData.scheduled.length + 1,
    name: `Scheduled Report ${mockData.scheduled.length + 1}`,
    frequency,
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    recipients,
    format,
    status: 'active',
    reportId
  };

  mockData.scheduled.push(newSchedule);
  res.status(201).json(newSchedule);
});

router.put('/scheduled/:id', (req, res) => {
  const scheduleIndex = mockData.scheduled.findIndex(s => s.id === parseInt(req.params.id));
  if (scheduleIndex === -1) {
    return res.status(404).json({ error: 'Scheduled report not found' });
  }

  mockData.scheduled[scheduleIndex] = {
    ...mockData.scheduled[scheduleIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json(mockData.scheduled[scheduleIndex]);
});

router.delete('/scheduled/:id', (req, res) => {
  const scheduleIndex = mockData.scheduled.findIndex(s => s.id === parseInt(req.params.id));
  if (scheduleIndex === -1) {
    return res.status(404).json({ error: 'Scheduled report not found' });
  }

  mockData.scheduled.splice(scheduleIndex, 1);
  res.json({ message: 'Scheduled report deleted successfully' });
});

// Publishing endpoints
router.get('/published', (req, res) => {
  const { visibility } = req.query;
  let published = [...mockData.published];

  if (visibility && visibility !== 'all') {
    published = published.filter(report => report.visibility === visibility);
  }

  res.json(published);
});

router.post('/publish', (req, res) => {
  const { reportId, visibility, settings } = req.body;
  
  const report = mockData.reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const publishedReport = {
    id: mockData.published.length + 1,
    name: report.name,
    description: settings?.description || '',
    visibility: visibility || 'private',
    views: 0,
    downloads: 0,
    shares: 0,
    publishedAt: new Date().toISOString(),
    lastViewed: null,
    url: `https://reports.digame.com/${report.name.toLowerCase().replace(/\s+/g, '-')}`,
    allowDownload: settings?.allowDownload || false,
    allowComments: settings?.allowComments || false,
    expiresAt: settings?.expiresAt || null,
    tags: report.tags || [],
    author: report.author,
    size: report.size,
    format: report.format
  };

  mockData.published.push(publishedReport);
  res.status(201).json(publishedReport);
});

// Shared links
router.get('/shares', (req, res) => {
  res.json(mockData.sharedLinks);
});

router.post('/shares', (req, res) => {
  const { reportId, settings } = req.body;
  
  const report = mockData.reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const shareLink = {
    id: mockData.sharedLinks.length + 1,
    reportName: report.name,
    url: `https://reports.digame.com/share/${Math.random().toString(36).substring(2, 15)}`,
    createdAt: new Date().toISOString(),
    expiresAt: settings?.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    views: 0,
    maxViews: settings?.maxViews || 100,
    password: settings?.password ? true : false,
    status: 'active'
  };

  mockData.sharedLinks.push(shareLink);
  res.status(201).json(shareLink);
});

router.delete('/shares/:id', (req, res) => {
  const linkIndex = mockData.sharedLinks.findIndex(l => l.id === parseInt(req.params.id));
  if (linkIndex === -1) {
    return res.status(404).json({ error: 'Share link not found' });
  }

  mockData.sharedLinks.splice(linkIndex, 1);
  res.json({ message: 'Share link deleted successfully' });
});

// Distribution channels
router.get('/distribution', (req, res) => {
  res.json(mockData.distributionChannels);
});

router.put('/distribution/:id', (req, res) => {
  const channelIndex = mockData.distributionChannels.findIndex(c => c.id === req.params.id);
  if (channelIndex === -1) {
    return res.status(404).json({ error: 'Distribution channel not found' });
  }

  mockData.distributionChannels[channelIndex] = {
    ...mockData.distributionChannels[channelIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json(mockData.distributionChannels[channelIndex]);
});

// Analytics endpoints
router.get('/analytics/overview', (req, res) => {
  res.json({
    totalViews: mockData.analytics.totalViews,
    totalDownloads: mockData.analytics.totalDownloads,
    totalShares: mockData.analytics.totalShares,
    totalPublished: mockData.analytics.totalPublished
  });
});

router.get('/analytics/trends', (req, res) => {
  const { period = '7d' } = req.query;
  res.json({
    trends: mockData.analytics.trends,
    period
  });
});

// Export report
router.post('/:id/export', (req, res) => {
  const { format } = req.body;
  const report = mockData.reports.find(r => r.id === parseInt(req.params.id));
  
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Simulate export process
  const exportId = Math.random().toString(36).substring(2, 15);
  
  res.json({
    exportId,
    status: 'processing',
    format: format || 'PDF',
    estimatedCompletion: new Date(Date.now() + 60000).toISOString(), // 1 minute
    downloadUrl: null
  });
});

module.exports = router;