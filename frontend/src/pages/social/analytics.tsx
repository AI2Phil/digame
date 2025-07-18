import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Users, MessageCircle, Calendar, TrendingUp, Eye, Heart, Share2, Target, Activity, Clock } from 'lucide-react';

export default const SocialAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/social/analytics?range=${timeRange}`, {
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
      totalConnections: 247,
      newConnections: 23,
      profileViews: 1456,
      postEngagement: 89.2,
      eventAttendance: 12,
      forumPosts: 34
    },
    engagement: {
      totalLikes: 892,
      totalComments: 234,
      totalShares: 156,
      averageEngagementRate: 12.4,
      topPosts: [
        {
          id: 1,
          content: 'Excited to share my thoughts on the future of remote work...',
          likes: 67,
          comments: 23,
          shares: 12,
          date: '2024-01-05T10:30:00Z'
        },
        {
          id: 2,
          content: 'Just attended an amazing AI conference. Key takeaways...',
          likes: 45,
          comments: 18,
          shares: 8,
          date: '2024-01-04T14:20:00Z'
        },
        {
          id: 3,
          content: 'Looking for recommendations on project management tools...',
          likes: 34,
          comments: 29,
          shares: 5,
          date: '2024-01-03T09:15:00Z'
        }
      ]
    },
    network: {
      connectionGrowth: [
        { month: 'Aug', connections: 180 },
        { month: 'Sep', connections: 195 },
        { month: 'Oct', connections: 210 },
        { month: 'Nov', connections: 228 },
        { month: 'Dec', connections: 235 },
        { month: 'Jan', connections: 247 }
      ],
      topConnections: [
        { name: 'Sarah Chen', title: 'Product Manager', mutualConnections: 23, industry: 'Technology' },
        { name: 'Marcus Johnson', title: 'Software Engineer', mutualConnections: 18, industry: 'Technology' },
        { name: 'Elena Rodriguez', title: 'UX Designer', mutualConnections: 15, industry: 'Design' },
        { name: 'David Kim', title: 'Data Scientist', mutualConnections: 12, industry: 'Analytics' },
        { name: 'Priya Patel', title: 'Marketing Director', mutualConnections: 10, industry: 'Marketing' }
      ],
      industryBreakdown: [
        { industry: 'Technology', count: 89, percentage: 36 },
        { industry: 'Finance', count: 52, percentage: 21 },
        { industry: 'Healthcare', count: 37, percentage: 15 },
        { industry: 'Education', count: 31, percentage: 13 },
        { industry: 'Marketing', count: 25, percentage: 10 },
        { industry: 'Other', count: 13, percentage: 5 }
      ]
    },
    activity: {
      weeklyActivity: [
        { day: 'Mon', posts: 3, comments: 8, likes: 15 },
        { day: 'Tue', posts: 2, comments: 12, likes: 23 },
        { day: 'Wed', posts: 4, comments: 6, likes: 18 },
        { day: 'Thu', posts: 1, comments: 15, likes: 28 },
        { day: 'Fri', posts: 3, comments: 9, likes: 21 },
        { day: 'Sat', posts: 1, comments: 4, likes: 12 },
        { day: 'Sun', posts: 2, comments: 7, likes: 16 }
      ],
      peakHours: [
        { hour: '9 AM', activity: 45 },
        { hour: '12 PM', activity: 67 },
        { hour: '3 PM', activity: 52 },
        { hour: '6 PM', activity: 38 },
        { hour: '9 PM', activity: 29 }
      ]
    },
    events: {
      totalAttended: 12,
      upcomingRegistered: 5,
      eventsHosted: 2,
      averageRating: 4.6,
      recentEvents: [
        { name: 'Tech Leaders Summit', date: '2024-01-05', attendees: 247, rating: 4.8 },
        { name: 'AI Workshop', date: '2024-01-03', attendees: 89, rating: 4.5 },
        { name: 'Product Meetup', date: '2024-01-01', attendees: 156, rating: 4.7 }
      ]
    }
  });

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercentage = (num) => {
    return num.toFixed(1) + '%';
  };

  const getGrowthColor = (current, previous) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
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
        <title>Social Analytics - Social - Digame</title>
        <meta name="description" content="Track your social engagement and network growth" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/social" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Social Hub</span>
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
                <h1 className="text-3xl font-bold text-gray-900">Social Analytics</h1>
                <p className="text-gray-600">Track your social engagement and network growth</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Connections</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.totalConnections}</p>
                  <p className="text-xs text-green-600">+{analyticsData?.overview?.newConnections} this month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData?.overview?.profileViews)}</p>
                  <p className="text-xs text-blue-600">+12% vs last month</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData?.overview?.postEngagement)}</p>
                  <p className="text-xs text-green-600">+2.3% vs last month</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events Attended</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.eventAttendance}</p>
                  <p className="text-xs text-orange-600">+3 this month</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Forum Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData?.overview?.forumPosts}</p>
                  <p className="text-xs text-purple-600">+8 this month</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <MessageCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analyticsData?.engagement?.totalLikes + analyticsData?.engagement?.totalComments + analyticsData?.engagement?.totalShares)}
                  </p>
                  <p className="text-xs text-green-600">+15% vs last month</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
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
                  { id: 'engagement', label: 'Engagement', icon: <Heart className="w-4 h-4" /> },
                  { id: 'network', label: 'Network', icon: <Users className="w-4 h-4" /> },
                  { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
                  { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> }
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Growth</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Connection growth chart</p>
                        <p className="text-sm text-gray-500">
                          {analyticsData?.network?.connectionGrowth?.map(item => item.connections).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Weekly activity chart</p>
                        <p className="text-sm text-gray-500">
                          Posts, comments, and likes by day
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Engagement Tab */}
              {activeTab === 'engagement' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <Heart className="w-6 h-6 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Total Likes</h3>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{analyticsData?.engagement?.totalLikes}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                        <h3 className="font-semibold text-green-900">Total Comments</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{analyticsData?.engagement?.totalComments}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <Share2 className="w-6 h-6 text-purple-600" />
                        <h3 className="font-semibold text-purple-900">Total Shares</h3>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{analyticsData?.engagement?.totalShares}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
                    <div className="space-y-4">
                      {analyticsData?.engagement?.topPosts?.map((post) => (
                        <div key={post.id} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-900 mb-3">{post.content}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes} likes</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments} comments</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4" />
                              <span>{post.shares} shares</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeAgo(post.date)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Network Tab */}
              {activeTab === 'network' && (
                <div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Connections</h3>
                      <div className="space-y-3">
                        {analyticsData?.network?.topConnections?.map((connection, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{connection.name}</h4>
                              <p className="text-sm text-gray-600">{connection.title}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{connection.mutualConnections}</p>
                              <p className="text-xs text-gray-500">mutual</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Breakdown</h3>
                      <div className="space-y-3">
                        {analyticsData?.network?.industryBreakdown?.map((industry, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{industry.industry}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${industry.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{industry.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Pattern</h3>
                    <div className="space-y-3">
                      {analyticsData?.activity?.weeklyActivity?.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{day.day}</span>
                          <div className="flex space-x-4 text-sm">
                            <span className="text-blue-600">{day.posts} posts</span>
                            <span className="text-green-600">{day.comments} comments</span>
                            <span className="text-purple-600">{day.likes} likes</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity Hours</h3>
                    <div className="space-y-3">
                      {analyticsData?.activity?.peakHours?.map((hour, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{hour.hour}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-600 h-2 rounded-full" 
                                style={{ width: `${(hour.activity / 70) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{hour.activity}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="font-semibold text-blue-900 mb-2">Events Attended</h3>
                      <p className="text-2xl font-bold text-blue-900">{analyticsData?.events?.totalAttended}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="font-semibold text-green-900 mb-2">Upcoming Events</h3>
                      <p className="text-2xl font-bold text-green-900">{analyticsData?.events?.upcomingRegistered}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="font-semibold text-purple-900 mb-2">Events Hosted</h3>
                      <p className="text-2xl font-bold text-purple-900">{analyticsData?.events?.eventsHosted}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="font-semibold text-orange-900 mb-2">Average Rating</h3>
                      <p className="text-2xl font-bold text-orange-900">{analyticsData?.events?.averageRating}/5</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
                    <div className="space-y-4">
                      {analyticsData?.events?.recentEvents?.map((event, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{event.name}</h4>
                            <p className="text-sm text-gray-600">{event.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{event.attendees} attendees</p>
                            <p className="text-sm text-gray-600">★ {event.rating}/5</p>
                          </div>
                        </div>
                      ))}
                    </div>
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