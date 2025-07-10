import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { LineChart, Users, TrendingUp, Target, Eye, MousePointer } from 'lucide-react';

export default function UserJourneyIntelligence() {
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user journey analytics data
    setTimeout(() => {
      setJourneyData({
        totalUsers: 45230,
        conversionRate: 23.8,
        averageSessionTime: 12.5,
        bounceRate: 34.2,
        topDropOffPoint: 'Feature Selection',
        engagementScore: 78.5
      });
      setLoading(false);
    }, 1000);
  }, []);

  const conversionFunnel = [
    { stage: 'Landing Page', users: 45230, percentage: 100, dropOff: 0 },
    { stage: 'Sign Up', users: 32450, percentage: 71.7, dropOff: 28.3 },
    { stage: 'Email Verification', users: 28890, percentage: 63.9, dropOff: 7.8 },
    { stage: 'Profile Setup', users: 24120, percentage: 53.3, dropOff: 10.6 },
    { stage: 'Feature Selection', users: 18750, percentage: 41.4, dropOff: 11.9 },
    { stage: 'First Action', users: 15680, percentage: 34.7, dropOff: 6.7 },
    { stage: 'Conversion', users: 10760, percentage: 23.8, dropOff: 10.9 }
  ];

  const userSegments = [
    {
      segment: 'Power Users',
      percentage: 15,
      avgSessionTime: 28.5,
      conversionRate: 85.2,
      characteristics: 'High engagement, multiple features used daily'
    },
    {
      segment: 'Regular Users',
      percentage: 45,
      avgSessionTime: 12.3,
      conversionRate: 45.8,
      characteristics: 'Consistent usage, moderate feature adoption'
    },
    {
      segment: 'Casual Users',
      percentage: 30,
      avgSessionTime: 6.2,
      conversionRate: 18.5,
      characteristics: 'Infrequent usage, basic feature set'
    },
    {
      segment: 'Trial Users',
      percentage: 10,
      avgSessionTime: 4.1,
      conversionRate: 8.2,
      characteristics: 'Exploring platform, low commitment'
    }
  ];

  const engagementPatterns = [
    {
      pattern: 'Morning Peak',
      time: '9:00 AM - 11:00 AM',
      activity: 'High',
      primaryActions: 'Dashboard viewing, report generation',
      conversionLikelihood: 'High'
    },
    {
      pattern: 'Lunch Dip',
      time: '12:00 PM - 1:00 PM',
      activity: 'Low',
      primaryActions: 'Quick check-ins, notifications',
      conversionLikelihood: 'Low'
    },
    {
      pattern: 'Afternoon Focus',
      time: '2:00 PM - 4:00 PM',
      activity: 'Medium',
      primaryActions: 'Feature exploration, configuration',
      conversionLikelihood: 'Medium'
    },
    {
      pattern: 'Evening Wind-down',
      time: '5:00 PM - 7:00 PM',
      activity: 'Medium',
      primaryActions: 'Review activities, planning',
      conversionLikelihood: 'Medium'
    }
  ];

  const dropOffAnalysis = [
    {
      point: 'Feature Selection Page',
      dropOffRate: 11.9,
      reason: 'Too many options, decision paralysis',
      recommendation: 'Implement guided onboarding flow'
    },
    {
      point: 'Sign Up Form',
      dropOffRate: 28.3,
      reason: 'Form too long, privacy concerns',
      recommendation: 'Simplify form, add social login options'
    },
    {
      point: 'Profile Setup',
      dropOffRate: 10.6,
      reason: 'Optional fields perceived as required',
      recommendation: 'Clearer field labeling, progressive disclosure'
    },
    {
      point: 'First Action',
      dropOffRate: 6.7,
      reason: 'Unclear next steps after setup',
      recommendation: 'Add contextual help and tutorials'
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
                    <span className="ml-4 text-sm font-medium text-gray-900">User Journey Analytics</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <LineChart className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Journey Intelligence</h1>
                <p className="text-gray-600 mt-1">Deep user behavior analysis, conversion funnels, drop-off analysis, and engagement patterns</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Journey Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Users Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{journeyData.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>12% growth this month</span>
                    </div>
                  </div>
                </div>

                {/* Conversion Rate Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{journeyData.conversionRate}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>3.2% improvement this quarter</span>
                    </div>
                  </div>
                </div>

                {/* Average Session Time Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Eye className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Session Time</p>
                      <p className="text-2xl font-bold text-gray-900">{journeyData.averageSessionTime}m</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>8% increase from last month</span>
                    </div>
                  </div>
                </div>

                {/* Bounce Rate Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <MousePointer className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{journeyData.bounceRate}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>5% reduction this month</span>
                    </div>
                  </div>
                </div>

                {/* Top Drop-off Point Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Top Drop-off Point</p>
                      <p className="text-lg font-bold text-gray-900">{journeyData.topDropOffPoint}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-red-600">
                      <Target className="w-4 h-4 mr-1" />
                      <span>Needs optimization</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Score Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <LineChart className="w-8 h-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                      <p className="text-2xl font-bold text-gray-900">{journeyData.engagementScore}/100</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-indigo-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Above industry average</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Conversion Funnel Analysis</h2>
                <div className="space-y-4">
                  {conversionFunnel.map((stage, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{stage.stage}</h3>
                            <p className="text-sm text-gray-600">{stage.users.toLocaleString()} users</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{stage.percentage.toFixed(1)}%</p>
                          {stage.dropOff > 0 && (
                            <p className="text-sm text-red-600">-{stage.dropOff.toFixed(1)}% drop-off</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stage.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Segments */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">User Segment Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userSegments.map((segment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{segment.segment}</h3>
                        <span className="text-2xl font-bold text-indigo-600">{segment.percentage}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Avg Session</p>
                          <p className="font-medium text-gray-900">{segment.avgSessionTime}m</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Conversion</p>
                          <p className="font-medium text-gray-900">{segment.conversionRate}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{segment.characteristics}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Patterns */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Engagement Patterns</h2>
                <div className="space-y-4">
                  {engagementPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-4 ${
                          pattern.activity === 'High' ? 'bg-green-500' :
                          pattern.activity === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900">{pattern.pattern}</h3>
                          <p className="text-sm text-gray-600">{pattern.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{pattern.primaryActions}</p>
                        <p className="text-sm text-gray-600">Conversion: {pattern.conversionLikelihood}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop-off Analysis */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Drop-off Point Analysis</h2>
                <div className="space-y-4">
                  {dropOffAnalysis.map((analysis, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{analysis.point}</h3>
                        <span className="text-lg font-bold text-red-600">{analysis.dropOffRate}% drop-off</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Primary Reason</p>
                          <p className="text-sm text-gray-900">{analysis.reason}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Recommendation</p>
                          <p className="text-sm text-green-700 font-medium">{analysis.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow p-6 border-2 border-dashed border-indigo-200">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Journey Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered journey optimization, predictive drop-off prevention, personalized user flows, and real-time journey adaptation coming soon.</p>
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