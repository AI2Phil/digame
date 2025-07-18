import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { AlertTriangle, Clock, Users, CheckCircle, XCircle, Activity } from 'lucide-react';

export default function IncidentCommandCenter() {
  const [incidentData, setIncidentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading incident management data
    setTimeout(() => {
      setIncidentData({
        activeIncidents: 3,
        resolvedToday: 12,
        averageResolutionTime: 45,
        escalatedIncidents: 1,
        teamResponseTime: 8,
        systemAvailability: 99.95
      });
      setLoading(false);
    }, 1000);
  }, []);

  const activeIncidents = [
    {
      id: 'INC-2025-001',
      title: 'Database Connection Timeout',
      severity: 'High',
      status: 'In Progress',
      assignee: 'Database Team',
      created: '2 hours ago',
      lastUpdate: '15 minutes ago',
      affectedUsers: 1250,
      description: 'Users experiencing slow response times due to database connection issues'
    },
    {
      id: 'INC-2025-002',
      title: 'API Rate Limiting Issues',
      severity: 'Medium',
      status: 'Investigating',
      assignee: 'Backend Team',
      created: '45 minutes ago',
      lastUpdate: '10 minutes ago',
      affectedUsers: 340,
      description: 'Third-party API calls being rate limited causing feature degradation'
    },
    {
      id: 'INC-2025-003',
      title: 'Cache Memory Leak',
      severity: 'Low',
      status: 'Monitoring',
      assignee: 'Infrastructure Team',
      created: '3 hours ago',
      lastUpdate: '1 hour ago',
      affectedUsers: 0,
      description: 'Gradual memory increase in cache layer, monitoring for impact'
    }
  ];

  const recentIncidents = [
    {
      id: 'INC-2025-004',
      title: 'Authentication Service Outage',
      severity: 'Critical',
      status: 'Resolved',
      resolvedTime: '2 hours',
      impact: 'All users affected',
      rootCause: 'SSL certificate expiration'
    },
    {
      id: 'INC-2025-005',
      title: 'File Upload Failures',
      severity: 'Medium',
      status: 'Resolved',
      resolvedTime: '1.5 hours',
      impact: '500 users affected',
      rootCause: 'Storage quota exceeded'
    }
  ];

  const escalationMatrix = [
    { level: 'Level 1', team: 'Support Team', responseTime: '< 15 min', scope: 'Initial triage and basic resolution' },
    { level: 'Level 2', team: 'Engineering Team', responseTime: '< 30 min', scope: 'Technical investigation and fixes' },
    { level: 'Level 3', team: 'Senior Engineers', responseTime: '< 1 hour', scope: 'Complex technical issues' },
    { level: 'Level 4', team: 'Platform Owner', responseTime: '< 2 hours', scope: 'Critical system-wide issues' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Platform Owner</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400">/</span>
                    <span className="ml-4 text-sm font-medium text-gray-900">Incident Management</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Incident Command Center</h1>
                <p className="text-gray-600 mt-1">Centralized incident response, real-time alerts, escalation workflows, and post-mortem analysis</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Incident Overview Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Incidents Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Incidents</p>
                      <p className="text-2xl font-bold text-gray-900">{incidentData.activeIncidents}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span>1 high severity incident</span>
                    </div>
                  </div>
                </div>

                {/* Resolved Today Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                      <p className="text-2xl font-bold text-gray-900">{incidentData.resolvedToday}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>95% within SLA</span>
                    </div>
                  </div>
                </div>

                {/* Average Resolution Time Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                      <p className="text-2xl font-bold text-gray-900">{incidentData.averageResolutionTime}m</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>15% improvement this month</span>
                    </div>
                  </div>
                </div>

                {/* Escalated Incidents Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Escalated Incidents</p>
                      <p className="text-2xl font-bold text-gray-900">{incidentData.escalatedIncidents}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-orange-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Requires senior attention</span>
                    </div>
                  </div>
                </div>

                {/* Team Response Time Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Team Response Time</p>
                      <p className="text-2xl font-bold text-gray-900">{incidentData.teamResponseTime}m</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <Activity className="w-4 h-4 mr-1" />
                      <span>Within target SLA</span>
                    </div>
                  </div>
                </div>

                {/* System Availability Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">System Availability</p>
                      <p className="text-2xl font-bold text-gray-900">{incidentData.systemAvailability}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Above SLA target</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Incidents */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Active Incidents</h2>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Create Incident
                  </button>
                </div>
                <div className="space-y-4">
                  {activeIncidents.map((incident) => (
                    <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className="font-mono text-sm text-gray-600 mr-3">{incident.id}</span>
                          <h3 className="text-lg font-medium text-gray-900">{incident.title}</h3>
                          <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                            incident.severity === 'High' 
                              ? 'bg-red-100 text-red-800' 
                              : incident.severity === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          incident.status === 'In Progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : incident.status === 'Investigating'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Assignee</p>
                          <p className="font-medium text-gray-900">{incident.assignee}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p className="font-medium text-gray-900">{incident.created}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Last Update</p>
                          <p className="font-medium text-gray-900">{incident.lastUpdate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Affected Users</p>
                          <p className="font-medium text-gray-900">{incident.affectedUsers.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-4 space-x-2">
                        <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                          Update
                        </button>
                        <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200">
                          Resolve
                        </button>
                        <button className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200">
                          Escalate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Resolved Incidents */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recently Resolved Incidents</h2>
                <div className="space-y-4">
                  {recentIncidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{incident.title}</h3>
                          <p className="text-sm text-gray-600">{incident.rootCause}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Resolved in {incident.resolvedTime}</p>
                        <p className="text-sm text-gray-600">{incident.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escalation Matrix */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Escalation Matrix</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {escalationMatrix.map((level, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{level.level}</h3>
                        <p className="text-sm font-medium text-blue-600 mb-2">{level.team}</p>
                        <p className="text-sm text-gray-600 mb-3">{level.responseTime}</p>
                        <p className="text-xs text-gray-500">{level.scope}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incident Response Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                    <span className="font-medium text-red-900">Declare Incident</span>
                  </button>
                  <button className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <Users className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Notify Teams</span>
                  </button>
                  <button className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                    <Activity className="w-6 h-6 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">System Status</span>
                  </button>
                  <button className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                    <Clock className="w-6 h-6 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-900">Post-Mortem</span>
                  </button>
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow p-6 border-2 border-dashed border-red-200">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Incident Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered incident prediction, automated root cause analysis, intelligent escalation, and real-time impact assessment coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Backend Integration In Progress
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}