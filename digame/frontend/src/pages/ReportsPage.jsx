import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import enhancedApiService from '../services/enhancedApiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const ReportsPage = ({ isDemoMode, onLogout }) => {
  const navigate = useNavigate();
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('productivity');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const data = await enhancedApiService.getReports();
        setReportsData(data);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [timeRange]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Mock comprehensive reports data
  const productivityReport = [
    { date: 'Week 1', productivity: 82, focus: 78, collaboration: 85, tasks: 24 },
    { date: 'Week 2', productivity: 85, focus: 82, collaboration: 88, tasks: 28 },
    { date: 'Week 3', productivity: 88, focus: 85, collaboration: 82, tasks: 32 },
    { date: 'Week 4', productivity: 87, focus: 89, collaboration: 84, tasks: 30 }
  ];

  const skillsReport = [
    { skill: 'JavaScript', current: 95, target: 100, growth: 8 },
    { skill: 'React', current: 92, target: 95, growth: 12 },
    { skill: 'Node.js', current: 88, target: 90, growth: 15 },
    { skill: 'Python', current: 85, target: 95, growth: 20 },
    { skill: 'Machine Learning', current: 65, target: 85, growth: 35 }
  ];

  const teamReport = [
    { name: 'Development', completed: 45, inProgress: 12, planned: 8 },
    { name: 'Design', completed: 32, inProgress: 8, planned: 5 },
    { name: 'Testing', completed: 28, inProgress: 6, planned: 4 },
    { name: 'Documentation', completed: 22, inProgress: 4, planned: 3 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Reports & Insights</h1>
              {isDemoMode && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Demo Mode</span>
              )}
            </div>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              {isDemoMode ? 'Exit Demo' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Comprehensive Reports</h2>
              <p className="text-gray-600">Detailed insights and analytics across all platform areas</p>
            </div>
            <div className="flex space-x-2">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'productivity', label: 'Productivity', icon: '📊' },
              { id: 'skills', label: 'Skills Development', icon: '🎯' },
              { id: 'team', label: 'Team Performance', icon: '👥' },
              { id: 'goals', label: 'Goals & Achievements', icon: '🏆' }
            ].map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedReport === report.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{report.icon}</span>
                <span>{report.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Productivity</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData?.weekly?.productivity || 87}%</p>
                <p className="text-sm text-green-600">+5% from last period</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData?.weekly?.tasksCompleted || 23}</p>
                <p className="text-sm text-blue-600">+3 from last week</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Focus Time</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData?.weekly?.focusTime || 42.5}h</p>
                <p className="text-sm text-green-600">+2.5h from last week</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Collaboration Score</p>
                <p className="text-2xl font-bold text-gray-900">{reportsData?.weekly?.collaborationScore || 8.4}</p>
                <p className="text-sm text-green-600">+0.2 from last week</p>
              </div>
              <div className="text-3xl">🤝</div>
            </div>
          </div>
        </div>

        {/* Dynamic Report Content */}
        {selectedReport === 'productivity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productivityReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="productivity" stroke="#3B82F6" strokeWidth={3} name="Productivity" />
                    <Line type="monotone" dataKey="focus" stroke="#10B981" strokeWidth={3} name="Focus" />
                    <Line type="monotone" dataKey="collaboration" stroke="#F59E0B" strokeWidth={3} name="Collaboration" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Rate</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill="#3B82F6" name="Tasks Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Progress</h3>
              <div className="space-y-4">
                {skillsReport.map((skill, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{skill.skill}</h4>
                      <span className="text-sm text-gray-500">{skill.current}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${skill.current}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Target: {skill.target}%</span>
                      <span className="text-green-600">+{skill.growth}% growth</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillsReport}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="current"
                      nameKey="skill"
                    >
                      {skillsReport.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" />
                    <Bar dataKey="inProgress" stackId="a" fill="#F59E0B" name="In Progress" />
                    <Bar dataKey="planned" stackId="a" fill="#6B7280" name="Planned" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Metrics</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">127</div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">89%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">4.2</div>
                  <div className="text-sm text-gray-600">Avg. Task Rating</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'goals' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals & Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(reportsData?.goals || [
                { id: 'goal_001', title: 'Complete React Certification', progress: 75, target: 100, deadline: '2024-12-31', status: 'On Track' },
                { id: 'goal_002', title: 'Improve Code Review Quality', progress: 90, target: 100, deadline: '2024-12-25', status: 'Ahead' }
              ]).map((goal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      goal.status === 'Ahead' ? 'bg-green-100 text-green-700' :
                      goal.status === 'On Track' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span>📊</span>
              <span className="font-medium">Export as PDF</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span>📈</span>
              <span className="font-medium">Export as Excel</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span>📋</span>
              <span className="font-medium">Export as CSV</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;