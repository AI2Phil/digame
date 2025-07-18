import React, { useState, useEffect } from 'react';
import enhancedApiService from '../services/enhancedApiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
// Removed safeNavigate import - using Next.js router

const BehavioralAnalyticsPage = ({ isDemoMode, onLogout }) => {
  const [behaviorData, setBehaviorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    const fetchBehaviorData = async () => {
      try {
        setLoading(true);
        const data = await enhancedApiService.getBehaviorAnalysis({ timeRange: selectedTimeRange });
        setBehaviorData(data);
      } catch (error) {
        console.error('Error fetching behavior data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBehaviorData();
  }, [selectedTimeRange]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading behavioral analytics...</p>
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
                onClick={() => safeNavigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Behavioral Analytics</h1>
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
        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Behavioral Insights</h2>
              <p className="text-gray-600">Understand your work patterns and behavioral trends</p>
            </div>
            <div className="flex space-x-2">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeRange === range
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

        {/* Behavioral Patterns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {behaviorData?.patterns?.map((pattern, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pattern.pattern}</h3>
                  <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  pattern.impact === 'High' ? 'bg-red-100 text-red-700' :
                  pattern.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {pattern.impact} Impact
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <span className="text-sm font-medium text-gray-900">{pattern.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pattern.confidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium mb-1">💡 Recommendation</p>
                <p className="text-sm text-blue-700">{pattern.recommendation}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Work Patterns Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Peak Hours Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Performance Hours</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { hour: '9-10 AM', productivity: 95, focus: 90 },
                  { hour: '10-11 AM', productivity: 92, focus: 88 },
                  { hour: '2-3 PM', productivity: 85, focus: 82 },
                  { hour: '3-4 PM', productivity: 78, focus: 75 },
                  { hour: '4-5 PM', productivity: 70, focus: 68 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="productivity" fill="#3B82F6" name="Productivity" />
                  <Bar dataKey="focus" fill="#10B981" name="Focus" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Work Style Radar */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Style Profile</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { subject: 'Focus', A: 85, fullMark: 100 },
                  { subject: 'Collaboration', A: 78, fullMark: 100 },
                  { subject: 'Creativity', A: 92, fullMark: 100 },
                  { subject: 'Analysis', A: 88, fullMark: 100 },
                  { subject: 'Communication', A: 82, fullMark: 100 },
                  { subject: 'Planning', A: 75, fullMark: 100 }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Your Profile" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Work Patterns Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Patterns</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peak Hours</span>
                <span className="text-sm font-medium text-gray-900">
                  {behaviorData?.workPatterns?.peakHours?.join(', ') || '9:00-11:00, 14:00-16:00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Preferred Break Length</span>
                <span className="text-sm font-medium text-gray-900">
                  {behaviorData?.workPatterns?.preferredBreaks || 15} minutes
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Focus Block Duration</span>
                <span className="text-sm font-medium text-gray-900">
                  {behaviorData?.workPatterns?.focusBlocks || 90} minutes
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Multitasking Tendency</span>
                <span className={`text-sm font-medium ${
                  (behaviorData?.workPatterns?.multitaskingTendency || 'Low') === 'Low' 
                    ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {behaviorData?.workPatterns?.multitaskingTendency || 'Low'}
                </span>
              </div>
            </div>
          </div>

          {/* Productivity Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Trends</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { day: 'Mon', productivity: 85 },
                  { day: 'Tue', productivity: 92 },
                  { day: 'Wed', productivity: 78 },
                  { day: 'Thu', productivity: 88 },
                  { day: 'Fri', productivity: 82 },
                  { day: 'Sat', productivity: 65 },
                  { day: 'Sun', productivity: 45 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="productivity" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Deep Work', value: 45, color: '#3B82F6' },
                      { name: 'Meetings', value: 25, color: '#10B981' },
                      { name: 'Communication', value: 15, color: '#F59E0B' },
                      { name: 'Planning', value: 10, color: '#EF4444' },
                      { name: 'Learning', value: 5, color: '#8B5CF6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {[
                      { name: 'Deep Work', value: 45, color: '#3B82F6' },
                      { name: 'Meetings', value: 25, color: '#10B981' },
                      { name: 'Communication', value: 15, color: '#F59E0B' },
                      { name: 'Planning', value: 10, color: '#EF4444' },
                      { name: 'Learning', value: 5, color: '#8B5CF6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Actionable Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-medium text-gray-900 mb-1">Optimize Schedule</h4>
              <p className="text-sm text-gray-600">Schedule important tasks during your peak hours (9-11 AM) for maximum productivity.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium text-gray-900 mb-1">Focus Blocks</h4>
              <p className="text-sm text-gray-600">Your ideal focus block is 90 minutes. Use this for deep work sessions.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">🤝</div>
              <h4 className="font-medium text-gray-900 mb-1">Collaboration Style</h4>
              <p className="text-sm text-gray-600">You work best in small groups. Consider limiting meeting sizes for better engagement.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BehavioralAnalyticsPage;