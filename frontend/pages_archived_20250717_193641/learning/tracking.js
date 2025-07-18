import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Target, TrendingUp, Award, BookOpen, Clock, BarChart3, CheckCircle, Star, Calendar, Activity } from 'lucide-react';

export default function SkillTracking() {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchTrackingData();
  }, [timeRange]);

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(`/api/learning/tracking?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setTrackingData(result.data);
      } else {
        setTrackingData(getMockTrackingData());
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      setTrackingData(getMockTrackingData());
    } finally {
      setLoading(false);
    }
  };

  const getMockTrackingData = () => ({
    overview: {
      totalSkills: 24,
      skillsInProgress: 8,
      completedSkills: 12,
      averageProgress: 67.5,
      learningStreak: 15,
      hoursThisMonth: 42,
      certificationsEarned: 5
    },
    skills: [
      {
        id: 1,
        name: 'React Development',
        category: 'Programming',
        level: 'Advanced',
        progress: 85,
        targetProgress: 90,
        lastActivity: '2024-01-05T10:30:00Z',
        timeSpent: '24 hours',
        milestones: [
          { name: 'Basic Components', completed: true, date: '2024-01-01' },
          { name: 'Hooks & State', completed: true, date: '2024-01-03' },
          { name: 'Performance Optimization', completed: false, date: null },
          { name: 'Testing', completed: false, date: null }
        ],
        relatedCourses: ['Advanced React Development', 'React Testing'],
        skillPath: 'Frontend Development'
      },
      {
        id: 2,
        name: 'Data Analysis',
        category: 'Data Science',
        level: 'Intermediate',
        progress: 60,
        targetProgress: 80,
        lastActivity: '2024-01-04T14:20:00Z',
        timeSpent: '18 hours',
        milestones: [
          { name: 'Python Basics', completed: true, date: '2023-12-15' },
          { name: 'Pandas & NumPy', completed: true, date: '2024-01-02' },
          { name: 'Data Visualization', completed: false, date: null },
          { name: 'Statistical Analysis', completed: false, date: null }
        ],
        relatedCourses: ['Data Science Fundamentals', 'Python for Data Analysis'],
        skillPath: 'Data Science'
      }
    ],
    learningPath: {
      currentPath: 'Frontend Development',
      progress: 72,
      estimatedCompletion: '2024-03-15',
      nextMilestone: 'React Performance Optimization',
      pathSkills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Testing'],
      completedSkills: 3,
      totalSkills: 5
    },
    activity: {
      weeklyHours: [
        { week: 'Week 1', hours: 8 },
        { week: 'Week 2', hours: 12 },
        { week: 'Week 3', hours: 10 },
        { week: 'Week 4', hours: 14 }
      ],
      recentActivities: [
        {
          type: 'course_completed',
          title: 'Completed "Advanced React Hooks"',
          date: '2024-01-05T10:30:00Z',
          points: 50
        },
        {
          type: 'milestone_achieved',
          title: 'Achieved "React State Management" milestone',
          date: '2024-01-04T14:20:00Z',
          points: 25
        }
      ]
    },
    goals: [
      {
        id: 1,
        title: 'Complete Frontend Development Path',
        description: 'Master all skills in the frontend development learning path',
        targetDate: '2024-03-15',
        progress: 72,
        status: 'in_progress'
      },
      {
        id: 2,
        title: 'Earn Data Science Certification',
        description: 'Complete data science fundamentals and earn certification',
        targetDate: '2024-04-30',
        progress: 45,
        status: 'in_progress'
      }
    ]
  });

  const getSkillLevelColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-600',
      'Intermediate': 'bg-yellow-100 text-yellow-600',
      'Advanced': 'bg-red-100 text-red-600'
    };
    return colors[level] || colors.Beginner;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Programming': 'bg-blue-100 text-blue-600',
      'Data Science': 'bg-purple-100 text-purple-600',
      'Design': 'bg-pink-100 text-pink-600',
      'Marketing': 'bg-orange-100 text-orange-600',
      'Business': 'bg-indigo-100 text-indigo-600'
    };
    return colors[category] || colors.Programming;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'course_completed': return <BookOpen className="w-4 h-4 text-green-600" />;
      case 'milestone_achieved': return <Target className="w-4 h-4 text-blue-600" />;
      case 'skill_level_up': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'certification_earned': return <Award className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
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
        <title>Skill Tracking - Learning - Digame</title>
        <meta name="description" content="Track your learning progress and skill development" />
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Skill Tracking</h1>
                <p className="text-gray-600">Track your learning progress and skill development</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Skills</p>
                  <p className="text-2xl font-bold text-gray-900">{trackingData?.overview?.totalSkills}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{trackingData?.overview?.skillsInProgress}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{trackingData?.overview?.completedSkills}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{trackingData?.overview?.averageProgress}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{trackingData?.overview?.learningStreak}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hours This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{trackingData?.overview?.hoursThisMonth}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certifications</p>
                  <p className="text-2xl font-bold text-gray-900">{trackingData?.overview?.certificationsEarned}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Skills Overview', icon: <Target className="w-4 h-4" /> },
                  { id: 'progress', label: 'Learning Path', icon: <TrendingUp className="w-4 h-4" /> },
                  { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
                  { id: 'goals', label: 'Goals', icon: <Star className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
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
              {/* Skills Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {trackingData?.skills?.map((skill) => (
                    <div key={skill.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(skill.category)}`}>
                              {skill.category}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelColor(skill.level)}`}>
                              {skill.level}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            Last activity: {formatTimeAgo(skill.lastActivity)} • Time spent: {skill.timeSpent}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm text-gray-600">{skill.progress}% / {skill.targetProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                            <div 
                              className="bg-green-600 h-3 rounded-full relative" 
                              style={{ width: `${skill.progress}%` }}
                            >
                              <div 
                                className="absolute top-0 right-0 w-1 h-3 bg-blue-600 rounded-r-full"
                                style={{ right: `${100 - skill.targetProgress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Milestones</h4>
                            <div className="space-y-2">
                              {skill.milestones.map((milestone, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  {milestone.completed ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                  )}
                                  <span className={`text-sm ${milestone.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {milestone.name}
                                  </span>
                                  {milestone.completed && milestone.date && (
                                    <span className="text-xs text-gray-500">({milestone.date})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Related Courses</h4>
                          <div className="space-y-2 mb-4">
                            {skill.relatedCourses.map((course, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">{course}</span>
                              </div>
                            ))}
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">Learning Path</div>
                            <div className="text-sm text-gray-600">{skill.skillPath}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Learning Path Tab */}
              {activeTab === 'progress' && (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-900">
                        Current Path: {trackingData?.learningPath?.currentPath}
                      </h3>
                      <span className="text-sm text-blue-700">
                        {trackingData?.learningPath?.completedSkills} of {trackingData?.learningPath?.totalSkills} skills completed
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">Overall Progress</span>
                        <span className="text-sm text-blue-700">{trackingData?.learningPath?.progress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{ width: `${trackingData?.learningPath?.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">Next Milestone</div>
                        <div className="text-sm text-blue-600">{trackingData?.learningPath?.nextMilestone}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-1">Estimated Completion</div>
                        <div className="text-sm text-blue-600">{trackingData?.learningPath?.estimatedCompletion}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Path Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trackingData?.learningPath?.pathSkills?.map((skill, index) => (
                        <div key={index} className={`p-4 rounded-lg border-2 ${
                          index < trackingData?.learningPath?.completedSkills 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-white'
                        }`}>
                          <div className="flex items-center space-x-2">
                            {index < trackingData?.learningPath?.completedSkills ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                            )}
                            <span className={`font-medium ${
                              index < trackingData?.learningPath?.completedSkills 
                                ? 'text-green-900' 
                                : 'text-gray-900'
                            }`}>
                              {skill}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Learning Hours</h3>
                    <div className="space-y-3">
                      {trackingData?.activity?.weeklyHours?.map((week, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{week.week}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(week.hours / 16) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{week.hours}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                    <div className="space-y-3">
                      {trackingData?.activity?.recentActivities?.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{activity.title}</div>
                            <div className="text-sm text-gray-600">{formatTimeAgo(activity.date)}</div>
                          </div>
                          <div className="text-sm font-medium text-blue-600">
                            +{activity.points} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Goals Tab */}
              {activeTab === 'goals' && (
                <div className="space-y-6">
                  {trackingData?.goals?.map((goal) => (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{goal.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                          <div className="text-sm text-gray-500">Target Date: {goal.targetDate}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          goal.status === 'completed' ? 'bg-green-100 text-green-600' :
                          goal.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full" 
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}