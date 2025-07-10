import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Target, Calendar, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

export default function StrategicPlanningDashboard() {
  const [planningData, setPlanningData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading strategic planning data
    setTimeout(() => {
      setPlanningData({
        activeInitiatives: 12,
        completedMilestones: 28,
        upcomingDeadlines: 5,
        resourceUtilization: 87.5,
        budgetUtilization: 73.2,
        teamProductivity: 92.8
      });
      setLoading(false);
    }, 1000);
  }, []);

  const initiatives = [
    {
      id: 1,
      title: "AI Platform Enhancement",
      status: "In Progress",
      progress: 75,
      deadline: "2025-03-15",
      priority: "High",
      team: "AI Development Team"
    },
    {
      id: 2,
      title: "Mobile App Redesign",
      status: "Planning",
      progress: 25,
      deadline: "2025-04-30",
      priority: "Medium",
      team: "UX/UI Team"
    },
    {
      id: 3,
      title: "Enterprise Security Upgrade",
      status: "In Progress",
      progress: 60,
      deadline: "2025-02-28",
      priority: "High",
      team: "Security Team"
    }
  ];

  const milestones = [
    {
      id: 1,
      title: "Q1 Platform Performance Goals",
      date: "2025-01-31",
      status: "Completed",
      description: "Achieved 99.9% uptime and 200ms response time targets"
    },
    {
      id: 2,
      title: "User Base Expansion Milestone",
      date: "2025-02-15",
      status: "On Track",
      description: "Target: 50,000 active users by end of Q1"
    },
    {
      id: 3,
      title: "Feature Release Milestone",
      date: "2025-03-01",
      status: "Upcoming",
      description: "Launch of advanced analytics dashboard"
    }
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
                    <span className="ml-4 text-sm font-medium text-gray-900">Strategic Planning</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <Target className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Strategic Planning Dashboard</h1>
                <p className="text-gray-600 mt-1">Long-term platform strategy, feature roadmap, resource allocation, and milestone tracking</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Strategic Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Initiatives Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Initiatives</p>
                      <p className="text-2xl font-bold text-gray-900">{planningData.activeInitiatives}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>3 new initiatives this quarter</span>
                    </div>
                  </div>
                </div>

                {/* Completed Milestones Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Milestones</p>
                      <p className="text-2xl font-bold text-gray-900">{planningData.completedMilestones}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>95% on-time completion rate</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Deadlines Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                      <p className="text-2xl font-bold text-gray-900">{planningData.upcomingDeadlines}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-orange-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Next 30 days</span>
                    </div>
                  </div>
                </div>

                {/* Resource Utilization Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Resource Utilization</p>
                      <p className="text-2xl font-bold text-gray-900">{planningData.resourceUtilization}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Optimal utilization range</span>
                    </div>
                  </div>
                </div>

                {/* Budget Utilization Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                      <p className="text-2xl font-bold text-gray-900">{planningData.budgetUtilization}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Under budget by 27%</span>
                    </div>
                  </div>
                </div>

                {/* Team Productivity Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Team Productivity</p>
                      <p className="text-2xl font-bold text-gray-900">{planningData.teamProductivity}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-indigo-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Above target performance</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Initiatives Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Active Strategic Initiatives</h2>
                <div className="space-y-4">
                  {initiatives.map((initiative) => (
                    <div key={initiative.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{initiative.title}</h3>
                          <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                            initiative.priority === 'High' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {initiative.priority} Priority
                          </span>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          initiative.status === 'In Progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {initiative.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Team</p>
                          <p className="font-medium text-gray-900">{initiative.team}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Deadline</p>
                          <p className="font-medium text-gray-900">{initiative.deadline}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${initiative.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{initiative.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones Timeline Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Strategic Milestones</h2>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          milestone.status === 'Completed' 
                            ? 'bg-green-100' 
                            : milestone.status === 'On Track' 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100'
                        }`}>
                          {milestone.status === 'Completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : milestone.status === 'On Track' ? (
                            <Clock className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Calendar className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        {index < milestones.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200 ml-4 mt-2"></div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{milestone.title}</h3>
                          <span className="text-sm text-gray-600">{milestone.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                          milestone.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : milestone.status === 'On Track' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow p-6 border-2 border-dashed border-indigo-200">
                <div className="text-center">
                  <Target className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Strategic Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered strategic recommendations, automated resource optimization, predictive milestone tracking, and intelligent roadmap planning coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
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