import React, { useState } from 'react';
import Head from 'next/head';
import { Share2, Globe, Lock, Users, Mail, Link, Download, Eye, Calendar, Settings, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function PublishingCenter() {
  const [activeTab, setActiveTab] = useState('published');
  const [selectedReport, setSelectedReport] = useState(null);
  const [shareSettings, setShareSettings] = useState({
    visibility: 'private',
    allowDownload: true,
    allowComments: false,
    expiresAt: '',
    password: '',
    recipients: []
  });

  const publishedReports = [
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
    },
    {
      id: 2,
      name: 'Monthly Security Audit',
      description: 'Security compliance and audit findings',
      visibility: 'restricted',
      views: 89,
      downloads: 23,
      shares: 5,
      publishedAt: '2024-01-30T09:00:00Z',
      lastViewed: '2024-01-30T15:45:00Z',
      url: 'https://reports.digame.com/security-audit-jan-2024',
      allowDownload: false,
      allowComments: false,
      expiresAt: '2024-02-29T00:00:00Z',
      tags: ['security', 'audit', 'compliance'],
      author: 'Security Team',
      size: '2.8 MB',
      format: 'PDF'
    },
    {
      id: 3,
      name: 'Team Productivity Dashboard',
      description: 'Real-time team performance metrics',
      visibility: 'internal',
      views: 456,
      downloads: 67,
      shares: 12,
      publishedAt: '2024-01-28T08:00:00Z',
      lastViewed: '2024-01-30T16:20:00Z',
      url: 'https://reports.digame.com/team-productivity-live',
      allowDownload: true,
      allowComments: true,
      expiresAt: null,
      tags: ['productivity', 'team', 'dashboard'],
      author: 'HR Department',
      size: '1.5 MB',
      format: 'HTML'
    }
  ];

  const sharedLinks = [
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
    },
    {
      id: 2,
      reportName: 'User Engagement Analysis',
      url: 'https://reports.digame.com/share/xyz789uvw012',
      createdAt: '2024-01-25T14:30:00Z',
      expiresAt: '2024-02-15T00:00:00Z',
      views: 67,
      maxViews: 50,
      password: false,
      status: 'expired'
    },
    {
      id: 3,
      reportName: 'System Health Report',
      url: 'https://reports.digame.com/share/mno345pqr678',
      createdAt: '2024-01-30T16:00:00Z',
      expiresAt: '2024-03-01T00:00:00Z',
      views: 5,
      maxViews: 25,
      password: true,
      status: 'active'
    }
  ];

  const distributionChannels = [
    {
      id: 'email',
      name: 'Email Distribution',
      description: 'Send reports directly to email recipients',
      icon: Mail,
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
      icon: Share2,
      enabled: false,
      settings: {
        webhookUrl: '',
        defaultChannel: '#reports'
      }
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Post reports to Teams channels',
      icon: Share2,
      enabled: false,
      settings: {
        webhookUrl: '',
        defaultTeam: 'General'
      }
    },
    {
      id: 'webhook',
      name: 'Custom Webhook',
      description: 'Send to custom webhook endpoints',
      icon: Link,
      enabled: true,
      settings: {
        endpoints: ['https://api.company.com/reports'],
        authentication: 'bearer'
      }
    }
  ];

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4 text-green-600" />;
      case 'internal': return <Users className="w-4 h-4 text-blue-600" />;
      case 'restricted': return <Lock className="w-4 h-4 text-orange-600" />;
      case 'private': return <Lock className="w-4 h-4 text-red-600" />;
      default: return <Lock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const createShareLink = (reportId) => {
    // Simulate creating a share link
    const newLink = {
      id: Date.now(),
      reportName: publishedReports.find(r => r.id === reportId)?.name || 'Unknown Report',
      url: `https://reports.digame.com/share/${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      views: 0,
      maxViews: 100,
      password: shareSettings.password !== '',
      status: 'active'
    };
    
    alert(`Share link created: ${newLink.url}`);
  };

  return (
    <>
      <Head>
        <title>Publishing Center - Reports - Digame</title>
        <meta name="description" content="Publish and share reports with advanced distribution options" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Publishing Center"
          subtitle="Publish and share reports with advanced distribution options"
          icon={<Share2 className="w-6 h-6 text-purple-600" />}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'published', label: 'Published Reports', icon: Globe },
                  { id: 'shares', label: 'Shared Links', icon: Link },
                  { id: 'distribution', label: 'Distribution Channels', icon: Mail },
                  { id: 'analytics', label: 'Publishing Analytics', icon: Eye }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Published Reports Tab */}
          {activeTab === 'published' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Published Reports</h3>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Publish New Report
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {publishedReports.map((report) => (
                    <div key={report.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          {getVisibilityIcon(report.visibility)}
                          <div>
                            <h4 className="font-medium text-gray-900">{report.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>By {report.author}</span>
                              <span>Published {new Date(report.publishedAt).toLocaleDateString()}</span>
                              <span>{report.format} • {report.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => createShareLink(report.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Share
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{report.views.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{report.downloads.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">Downloads</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">{report.shares}</div>
                          <div className="text-xs text-gray-600">Shares</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {report.visibility.charAt(0).toUpperCase() + report.visibility.slice(1)}
                          </div>
                          <div className="text-xs text-gray-600">Visibility</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(report.url)}
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Link className="w-3 h-3" />
                            <span>Copy Link</span>
                          </button>
                          {report.allowDownload && (
                            <span className="text-xs text-green-600">• Download Enabled</span>
                          )}
                          {report.allowComments && (
                            <span className="text-xs text-blue-600">• Comments Enabled</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {report.expiresAt && `Expires ${new Date(report.expiresAt).toLocaleDateString()}`}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {report.tags.map((tag) => (
                            <span key={tag} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Shared Links Tab */}
          {activeTab === 'shares' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Shared Links</h3>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Create Share Link
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {sharedLinks.map((link) => (
                    <div key={link.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{link.reportName}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{link.url}</code>
                            <button
                              onClick={() => copyToClipboard(link.url)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Link className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(link.status)}`}>
                            {link.status}
                          </span>
                          <button className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Views:</span>
                          <span className="ml-2 font-medium">{link.views} / {link.maxViews}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <span className="ml-2 font-medium">{new Date(link.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Expires:</span>
                          <span className="ml-2 font-medium">{new Date(link.expiresAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Protected:</span>
                          <span className="ml-2 font-medium">{link.password ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Distribution Channels Tab */}
          {activeTab === 'distribution' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {distributionChannels.map((channel) => (
                  <div key={channel.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <channel.icon className="w-6 h-6 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{channel.name}</h4>
                          <p className="text-sm text-gray-600">{channel.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={channel.enabled}
                          onChange={() => {}}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    {channel.enabled && (
                      <div className="space-y-2 text-sm">
                        {Object.entries(channel.settings).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-medium">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      Configure
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publishing Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Total Views</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">15,847</div>
                  <div className="text-sm text-gray-600">+23% from last month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Download className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Downloads</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">4,234</div>
                  <div className="text-sm text-gray-600">+18% from last month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Share2 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Shares</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">1,567</div>
                  <div className="text-sm text-gray-600">+31% from last month</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Globe className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-900">Published</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">47</div>
                  <div className="text-sm text-gray-600">Active reports</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Publishing Performance</h3>
                <div className="text-center py-12 text-gray-500">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Publishing analytics visualization would be displayed here</p>
                  <p className="text-sm">Charts showing views, downloads, and engagement over time</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}