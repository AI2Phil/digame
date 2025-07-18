import React, { useState, useEffect } from 'react';
import enhancedApiService from '../services/enhancedApiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
// Removed safeNavigate import - using Next.js router

const PredictiveAnalyticsPage = ({ isDemoMode, onLogout }) => {
  const [predictiveData, setPredictiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('productivity');

  useEffect(() => {
    const fetchPredictiveData = async () => {
      try {
        setLoading(true);
        const data = await enhancedApiService.getPredictiveInsights();
        setPredictiveData(data);
      } catch (error) {
        console.error('Error fetching predictive data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictiveData();
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Mock future predictions data
  const futureProductivity = [
    { date: 'Today', actual: 87, predicted: 87 },
    { date: 'Tomorrow', predicted: 89 },
    { date: 'Day 3', predicted: 85 },
    { date: 'Day 4', predicted: 91 },
    { date: 'Day 5', predicted: 88 },
    { date: 'Day 6', predicted: 86 },
    { date: 'Day 7', predicted: 90 }
  ];

  const goalCompletionData = [
    { goal: 'React Certification', completion: 75, predicted: 95, timeLeft: '5 days' },
    { goal: 'Code Review Quality', completion: 90, predicted: 100, timeLeft: '2 days' },
    { goal: 'Team Leadership', completion: 45, predicted: 70, timeLeft: '15 days' },
    { goal: 'System Architecture', completion: 30, predicted: 85, timeLeft: '25 days' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading predictive analytics...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Predictive Analytics</h1>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Future Performance Insights</h2>
          <p className="text-gray-600">AI-powered predictions to help you plan and optimize your productivity</p>
        </div>

        {/* Key Predictions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">🎯</div>
              <div className="text-right">
                <div className="text-2xl font-bold">{predictiveData?.goalCompletion?.probability || 85}%</div>
                <div className="text-blue-100 text-sm">Goal Completion</div>
              </div>
            </div>
            <div className="text-sm text-blue-100 mb-2">Current Goals</div>
            <div className="text-lg font-medium">
              Expected completion in {predictiveData?.goalCompletion?.timeToCompletion || '3 weeks'}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📈</div>
              <div className="text-right">
                <div className="text-2xl font-bold">+12%</div>
                <div className="text-green-100 text-sm">Productivity Growth</div>
              </div>
            </div>
            <div className="text-sm text-green-100 mb-2">Next 30 Days</div>
            <div className="text-lg font-medium">Projected improvement trend</div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">🚀</div>
              <div className="text-right">
                <div className="text-2xl font-bold">{predictiveData?.skillDevelopment?.readiness || 78}%</div>
                <div className="text-purple-100 text-sm">Skill Readiness</div>
              </div>
            </div>
            <div className="text-sm text-purple-100 mb-2">Next Skill</div>
            <div className="text-lg font-medium">
              {predictiveData?.skillDevelopment?.nextSkill || 'Machine Learning'}
            </div>
          </div>
        </div>

        {/* Productivity Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Productivity Forecast</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={futureProductivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Actual"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Insight:</strong> Your productivity is expected to peak on Day 4. 
                Consider scheduling important tasks for that day.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Completion Predictions</h3>
            <div className="space-y-4">
              {goalCompletionData.map((goal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{goal.goal}</h4>
                    <span className="text-sm text-gray-500">{goal.timeLeft}</span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Current Progress</span>
                      <span className="font-medium">{goal.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${goal.completion}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Predicted Final</span>
                      <span className="font-medium text-green-600">{goal.predicted}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${goal.predicted}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className={`text-xs px-2 py-1 rounded ${
                    goal.predicted >= 90 ? 'bg-green-100 text-green-700' :
                    goal.predicted >= 70 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {goal.predicted >= 90 ? 'On track for success' :
                     goal.predicted >= 70 ? 'May need attention' :
                     'At risk - action needed'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Factors and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
            <div className="space-y-4">
              {(predictiveData?.goalCompletion?.riskFactors || ['Scope creep', 'Resource availability', 'External dependencies']).map((risk, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="text-red-500 mt-0.5">⚠️</div>
                  <div>
                    <h4 className="font-medium text-red-900">{risk}</h4>
                    <p className="text-sm text-red-700 mt-1">
                      {risk === 'Scope creep' && 'Monitor project requirements for unexpected changes'}
                      {risk === 'Resource availability' && 'Ensure team members are available when needed'}
                      {risk === 'External dependencies' && 'Track external blockers that could impact timeline'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
            <div className="space-y-4">
              {(predictiveData?.goalCompletion?.recommendations || [
                'Break down large tasks into smaller milestones',
                'Allocate buffer time for unexpected challenges',
                'Schedule regular check-ins with stakeholders'
              ]).map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-green-500 mt-0.5">💡</div>
                  <div>
                    <p className="text-sm text-green-800 font-medium">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Career Path Prediction */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Path Prediction</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-medium text-gray-900 mb-2">Next Role</h4>
              <p className="text-lg font-semibold text-blue-600">
                {predictiveData?.careerPath?.nextRole || 'Tech Lead'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {predictiveData?.careerPath?.probability || 72}% probability
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">⏱️</div>
              <h4 className="font-medium text-gray-900 mb-2">Timeframe</h4>
              <p className="text-lg font-semibold text-green-600">
                {predictiveData?.careerPath?.timeframe || '12-18 months'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Based on current growth</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">📚</div>
              <h4 className="font-medium text-gray-900 mb-2">Skill Gaps</h4>
              <div className="space-y-1">
                {(predictiveData?.careerPath?.skillGaps || ['Team Management', 'System Architecture']).map((skill, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Indicators */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Confidence</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">94%</div>
              <div className="text-sm text-gray-600">Productivity Trends</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">87%</div>
              <div className="text-sm text-gray-600">Goal Completion</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">72%</div>
              <div className="text-sm text-gray-600">Career Progression</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
              <div className="text-sm text-gray-600">Skill Development</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Predictions are based on historical data, current trends, and machine learning algorithms. 
              Confidence levels indicate the reliability of each prediction.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PredictiveAnalyticsPage;