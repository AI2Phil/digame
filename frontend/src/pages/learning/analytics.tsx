import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, Clock, Award, BookOpen, Target, Users, Calendar, Activity, Star, CheckCircle } from 'lucide-react';

export default const LearningAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/learning/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnalyticsData(result.data);
      } else {
        setAnalyticsData(getMockAnalyticsData());
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = () => ({
    overview: {
      totalLearningTime: 156,
      coursesCompleted: 12,
      skillsAcquired: 24,
      certificationsEarned: 5,
      averageScore: 87.5,
      learningStreak: 15,
      monthlyGoalProgress: 78
    },
    performance: {
      learningVelocity: 2.3,
      retentionRate: 92,
      engagementScore: 88,
      consistencyScore: 85,
      weeklyGoals: [
        { week: 'Week 1', target: 10, actual: 8, achieved: false },
        { week: 'Week 2', target: 10, actual: 12, achieved: true },
        { week: 'Week 3', target: 10, actual: 10, achieved: true },
        { week: 'Week 4', target: 12, actual: 14, achieved: true }
      ]
    },
    achievements: [
      {
        id: 1,
        title: 'Course Completion Streak',
        description: 'Completed 5 courses in a row',
        icon: 'streak',
        earnedDate: '2024-01-05T10:30:00Z',
        points: 100
      },
      {
        id: 2,
        title: 'Skill Master',
        description: 'Reached advanced level in React Development',
        icon: 'skill',
        earnedDate: '2024-01-03T14:20:00Z',
        points: 150
      }
    ]
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getAchievementIcon = (iconType) => {
    switch (iconType) {
      case 'streak': return <Calendar className="w-6 h-6 text-orange-600" />;
      case 'skill': return <Target className="w-6 h-6 text-blue-600" />;
      case 'marathon': return <Activity className="w-6 h-6 text-green-600" />;
      case 'perfect': return <Star className="w-6 h-6 text-yellow-600" />;
      default: return <Award className="w-6 h-6 text-purple-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Learning Analytics - Learning - Digame</title>
        <meta name="description" content="Analyze your learning progress and performance metrics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/learning" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Learning Hub</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
                <p className="text-gray-600">Analyze your learning progress and performance metrics</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>

          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Learning Time</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.totalLearningTime}h</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Courses Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.coursesCompleted}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Skills Acquired</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.skillsAcquired}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certifications</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.certificationsEarned}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.averageScore}%</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.learningStreak}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Goal</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.monthlyGoalProgress}%</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                  { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
                  { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" /> }
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
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Performance</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-700">Learning Velocity</span>
                          <span className="text-sm text-blue-600">{analyticsData?.performance?.learningVelocity} courses/week</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-700">Retention Rate</span>
                          <span className="text-sm text-green-600">{analyticsData?.performance?.retentionRate}%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-700">Engagement Score</span>
                          <span className="text-sm text-purple-600">{analyticsData?.performance?.engagementScore}%</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-orange-700">Consistency Score</span>
                          <span className="text-sm text-orange-600">{analyticsData?.performance?.consistencyScore}%</span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goal Achievement</h3>
                    <div className="space-y-3">
                      {analyticsData?.performance?.weeklyGoals?.map((goal, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {goal.achieved ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                            )}
                            <span className="font-medium text-gray-900">{goal.week}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {goal.actual}h / {goal.target}h
                            </div>
                            <div className={`text-xs ${goal.achieved ? 'text-green-600' : 'text-red-600'}`}>
                              {goal.achieved ? 'Goal achieved' : 'Goal missed'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Learning Velocity</h3>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{analyticsData?.performance?.learningVelocity}</p>
                      <p className="text-sm text-blue-700">courses/week</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <Target className="w-6 h-6 text-green-600" />
                        <h3 className="font-semibold text-green-900">Retention Rate</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{analyticsData?.performance?.retentionRate}%</p>
                      <p className="text-sm text-green-700">knowledge retained</p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <Activity className="w-6 h-6 text-purple-600" />
                        <h3 className="font-semibold text-purple-900">Engagement</h3>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{analyticsData?.performance?.engagementScore}%</p>
                      <p className="text-sm text-purple-700">engagement score</p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="w-6 h-6 text-orange-600" />
                        <h3 className="font-semibold text-orange-900">Consistency</h3>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">{analyticsData?.performance?.consistencyScore}%</p>
                      <p className="text-sm text-orange-700">consistency score</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analyticsData?.achievements?.map((achievement) => (
                      <div key={achievement.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-gray-100 rounded-full">
                            {getAchievementIcon(achievement.icon)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">{achievement.title}</h4>
                            <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Earned {formatTimeAgo(achievement.earnedDate)}
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                +{achievement.points} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}