import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../../components/PageHeader';

const ScheduledReports: React.FC = () => {
  const router = useRouter();
  const [scheduledReports, setScheduledReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchScheduledReports();
  }, []);

  const fetchScheduledReports = async () => {
    try {
      const response = await fetch('/api/reports/scheduled');
      const data = await response.json();
      setScheduledReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockScheduledReports = [
    {
      id: 1,
      name: 'Weekly Performance Summary',
      description: 'Comprehensive performance metrics for all teams',
      schedule: 'Every Monday at 9:00 AM',
      recipients: ['team-leads@company.com', 'management@company.com'],
      format: 'PDF',
      status: 'active',
      lastRun: '2024-01-15T09:00:00Z',
      nextRun: '2024-01-22T09:00:00Z',
      successRate: 98.5,
      totalRuns: 52
    },
    {
      id: 2,
      name: 'Monthly Revenue Report',
      description: 'Detailed revenue analysis and forecasting',
      schedule: 'First day of month at 8:00 AM',
      recipients: ['finance@company.com', 'executives@company.com'],
      format: 'Excel',
      status: 'active',
      lastRun: '2024-01-01T08:00:00Z',
      nextRun: '2024-02-01T08:00:00Z',
      successRate: 100,
      totalRuns: 12
    },
    {
      id: 3,
      name: 'Daily Security Alerts',
      description: 'Security incidents and compliance status',
      schedule: 'Daily at 6:00 AM',
      recipients: ['security@company.com', 'it-admin@company.com'],
      format: 'Email',
      status: 'active',
      lastRun: '2024-01-16T06:00:00Z',
      nextRun: '2024-01-17T06:00:00Z',
      successRate: 99.2,
      totalRuns: 365
    },
    {
      id: 4,
      name: 'Quarterly Analytics Review',
      description: 'Comprehensive analytics and insights review',
      schedule: 'Every quarter on 1st at 10:00 AM',
      recipients: ['analytics@company.com', 'strategy@company.com'],
      format: 'PDF',
      status: 'paused',
      lastRun: '2023-10-01T10:00:00Z',
      nextRun: '2024-04-01T10:00:00Z',
      successRate: 95.8,
      totalRuns: 8
    },
    {
      id: 5,
      name: 'User Engagement Metrics',
      description: 'Weekly user engagement and retention metrics',
      schedule: 'Every Friday at 5:00 PM',
      recipients: ['product@company.com', 'marketing@company.com'],
      format: 'Dashboard Link',
      status: 'active',
      lastRun: '2024-01-12T17:00:00Z',
      nextRun: '2024-01-19T17:00:00Z',
      successRate: 97.3,
      totalRuns: 48
    }
  ];

  const activeReports = mockScheduledReports.filter(report => report.status === 'active');
  const pausedReports = mockScheduledReports.filter(report => report.status === 'paused');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const CreateReportModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create Scheduled Report</h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter report name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Enter report description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Performance Report</option>
                <option>Analytics Dashboard</option>
                <option>Financial Report</option>
                <option>Security Report</option>
                <option>Custom Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
                <option>Email</option>
                <option>Dashboard Link</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter email addresses separated by commas"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Report
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Scheduled Reports"
        subtitle="Automated report generation and delivery management"
        breadcrumbs={[
          { label: 'Reports', href: '/reports' },
          { label: 'Scheduled Reports', href: '/reports/scheduled' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{activeReports.length}</div>
              <div className="text-sm text-gray-500">Active Reports</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">98.7%</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">485</div>
              <div className="text-sm text-gray-500">Total Runs</div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Scheduled Report
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'active', label: `Active (${activeReports.length})` },
              { id: 'paused', label: `Paused (${pausedReports.length})` },
              { id: 'history', label: 'Execution History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Reports Tab */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {activeReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Schedule</div>
                      <div className="text-sm text-gray-900 mt-1">{report.schedule}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Next Run</div>
                      <div className="text-sm text-gray-900 mt-1">{formatDate(report.nextRun)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Success Rate</div>
                      <div className="text-sm text-gray-900 mt-1">{report.successRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Total Runs</div>
                      <div className="text-sm text-gray-900 mt-1">{report.totalRuns}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">Recipients</div>
                    <div className="flex flex-wrap gap-2">
                      {report.recipients.map((recipient, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {recipient}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Last run: {formatDate(report.lastRun)} • Format: {report.format}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Run Now
                      </button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Pause
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paused Reports Tab */}
        {activeTab === 'paused' && (
          <div className="space-y-6">
            {pausedReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow opacity-75">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Schedule</div>
                      <div className="text-sm text-gray-900 mt-1">{report.schedule}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Last Run</div>
                      <div className="text-sm text-gray-900 mt-1">{formatDate(report.lastRun)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Success Rate</div>
                      <div className="text-sm text-gray-900 mt-1">{report.successRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Total Runs</div>
                      <div className="text-sm text-gray-900 mt-1">{report.totalRuns}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Paused since: {formatDate(report.lastRun)}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Resume
                      </button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Execution History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Executions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Execution Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockScheduledReports.slice(0, 10).map((report, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.lastRun)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.floor(Math.random() * 30) + 5}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.recipients.length} recipients
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && <CreateReportModal />}
    </div>
  );
};

export default ScheduledReports;