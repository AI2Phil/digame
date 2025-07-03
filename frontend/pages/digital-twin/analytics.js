import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { BarChart3, TrendingUp, Users, Clock, Target, Brain, Activity, Zap } from 'lucide-react';
import PageHeader from '../../src/components/navigation/PageHeader';

export default function TwinAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('performance');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = () => {
      const mockData = {
        overview: {
          twin_accuracy: 94.2,
          prediction_success: 87.5,
          behavioral_insights: 156,
          optimization_opportunities: 23
        },
        performance_trends: [
          { date: '2024-01-01', productivity: 78, focus: 82, energy: 75, satisfaction: 80 },
          { date: '2024-01-08', productivity: 82, focus: 85, energy: 78, satisfaction: 83 },
          { date: '2024-01-15', productivity: 85, focus: 88, energy: 82, satisfaction: 86 },
          { date: '2024-01-22', productivity: 88, focus: 90, energy: 85, satisfaction: 89 },
          { date: '2024-01-29', productivity: 91, focus: 92, energy: 88, satisfaction: 91 }
        ],
        behavioral_patterns: {
          peak_performance_hours: ['9:00-11:00', '14:00-16:00'],
          optimal_break_frequency: '90 minutes',
          preferred_task_types: ['Creative work', 'Problem solving', 'Strategic planning'],
          energy_cycles: {
            morning: 85,
            afternoon: 78,
            evening: 62
          },
          focus_duration: {
            average: 47,
            maximum: 120,
            optimal: 65
          }
        },
        skill_development: {
          current_skills: [
            { name: 'JavaScript', level: 8.5, growth: '+0.8' },
            { name: 'React', level: 8.2, growth: '+0.6' },
            { name: 'Node.js', level: 7.8, growth: '+1.2' },
            { name: 'Python', level: 6.5, growth: '+1.5' },
            { name: 'Machine Learning', level: 5.2, growth: '+2.1' }
          ],
          learning_velocity: 1.3,
          skill_gaps: [
            { skill: 'DevOps', priority: 'high', estimated_time: '3 months' },
            { skill: 'System Design', priority: 'medium', estimated_time: '4 months' },
            { skill: 'Leadership', priority: 'medium', estimated_time: '6 months' }
          ]
        },
        goal_tracking: {
          active_goals: 8,
          completed_goals: 23,
          success_rate: 0.74,
          average_completion_time: '2.3 weeks',
          goals_by_category: [
            { category: 'Career', count: 3, completion_rate: 0.85 },
            { category: 'Skills', count: 2, completion_rate: 0.90 },
            { category: 'Health', count: 2, completion_rate: 0.65 },
            { category: 'Personal', count: 1, completion_rate: 0.80 }
          ]
        },
        optimization_insights: [
          {
            type: 'schedule',
            title: 'Optimize Morning Routine',
            impact: 'high',
            description: 'Starting work 30 minutes earlier could increase daily productivity by 12%',
            confidence: 0.87
          },
          {
            type: 'skills',
            title: 'Focus on Python Development',
            impact: 'medium',
            description: 'Accelerating Python learning could unlock 3 new career opportunities',
            confidence: 0.79
          },
          {
            type: 'health',
            title: 'Improve Break Timing',
            impact: 'medium',
            description: 'Taking breaks every 75 minutes instead of 120 could boost focus by 8%',
            confidence: 0.82
          },
          {
            type: 'workflow',
            title: 'Batch Similar Tasks',
            impact: 'high',
            description: 'Grouping similar tasks could reduce context switching by 35%',
            confidence: 0.91
          }
        ]
      };
      setAnalyticsData(mockData);
    };

    loadAnalytics();
  }, [timeRange]);

  const metricCategories = [
    { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'behavior', label: 'Behavior', icon: <Brain className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Target className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Activity className="w-4 h-4" /> }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillColor = (level) => {
    if (level >= 8) return 'bg-green-500';
    if (level >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Twin Analytics - Digame</title>
        <meta name="description" content="Comprehensive Digital Twin analytics and insights" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Twin Analytics"
          subtitle="Deep insights into your Digital Twin performance"
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
          badge="ANALYTICS"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-2">
                {metricCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedMetric(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedMetric === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon}
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Twin Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.twin_accuracy}%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2.3% from last month
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prediction Success</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.prediction_success}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5.1% from last month
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Behavioral Insights</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.behavioral_insights}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-blue-600">
                  <Zap className="w-4 h-4 mr-1" />
                  12 new this week
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Optimization Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.optimization_opportunities}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-orange-600">
                  <Clock className="w-4 h-4 mr-1" />
                  5 high priority
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Based on Selected Metric */}
          {selectedMetric === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Trends */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                <div className="space-y-4">
                  {analyticsData.performance_trends.slice(-5).map((trend, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                          {new Date(trend.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          Avg: {Math.round((trend.productivity + trend.focus + trend.energy + trend.satisfaction) / 4)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Productivity</div>
                          <div className="font-medium text-blue-600">{trend.productivity}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Focus</div>
                          <div className="font-medium text-green-600">{trend.focus}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Energy</div>
                          <div className="font-medium text-orange-600">{trend.energy}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Satisfaction</div>
                          <div className="font-medium text-purple-600">{trend.satisfaction}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral Patterns */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Patterns</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Peak Performance Hours</h4>
                    <div className="flex space-x-2">
                      {analyticsData.behavioral_patterns.peak_performance_hours.map((hour, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {hour}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Energy Cycles</h4>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.behavioral_patterns.energy_cycles).map(([time, level]) => (
                        <div key={time} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{time}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${level}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{level}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Focus Duration</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {analyticsData.behavioral_patterns.focus_duration.average}m
                        </div>
                        <div className="text-xs text-gray-500">Average</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {analyticsData.behavioral_patterns.focus_duration.maximum}m
                        </div>
                        <div className="text-xs text-gray-500">Maximum</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {analyticsData.behavioral_patterns.focus_duration.optimal}m
                        </div>
                        <div className="text-xs text-gray-500">Optimal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'skills' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Skills */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Skills</h3>
                <div className="space-y-4">
                  {analyticsData.skill_development.current_skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-green-600">{skill.growth}</span>
                            <span className="text-sm font-medium text-gray-900">{skill.level}/10</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getSkillColor(skill.level)}`}
                            style={{ width: `${skill.level * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Learning Velocity: {analyticsData.skill_development.learning_velocity}x average
                    </span>
                  </div>
                </div>
              </div>

              {/* Skill Gaps */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Gaps & Recommendations</h3>
                <div className="space-y-4">
                  {analyticsData.skill_development.skill_gaps.map((gap, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{gap.skill}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          gap.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {gap.priority} priority
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Estimated time: {gap.estimated_time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'goals' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Goal Overview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Overview</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.goal_tracking.active_goals}</div>
                    <div className="text-sm text-gray-600">Active Goals</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analyticsData.goal_tracking.completed_goals}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(analyticsData.goal_tracking.success_rate * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Completion Time</span>
                    <span className="text-sm font-medium text-gray-900">
                      {analyticsData.goal_tracking.average_completion_time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Goals by Category */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals by Category</h3>
                <div className="space-y-4">
                  {analyticsData.goal_tracking.goals_by_category.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{category.category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{category.count} goals</span>
                            <span className="text-sm font-medium text-gray-900">
                              {Math.round(category.completion_rate * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${category.completion_rate * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Optimization Insights */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.optimization_insights.map((insight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Confidence</span>
                      <span className="text-xs font-medium text-gray-900">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}