import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Flag, ToggleLeft, ToggleRight, Users, Target, TrendingUp } from 'lucide-react';

export default function FeatureFlagManagement() {
  const [flagData, setFlagData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading feature flag data
    setTimeout(() => {
      setFlagData({
        totalFlags: 47,
        activeFlags: 32,
        experimentsRunning: 8,
        rolloutSuccess: 94.2,
        userSegments: 12,
        emergencyShutoffs: 2
      });
      setLoading(false);
    }, 1000);
  }, []);

  const featureFlags = [
    {
      id: 'ai-enhanced-search',
      name: 'AI Enhanced Search',
      description: 'Advanced AI-powered search functionality with semantic understanding',
      status: 'Active',
      rolloutPercentage: 75,
      targetAudience: 'Premium Users',
      createdDate: '2025-01-05',
      lastModified: '2025-01-08',
      owner: 'AI Team',
      environment: 'Production'
    },
    {
      id: 'new-dashboard-ui',
      name: 'New Dashboard UI',
      description: 'Redesigned dashboard interface with improved user experience',
      status: 'Gradual Rollout',
      rolloutPercentage: 25,
      targetAudience: 'Beta Users',
      createdDate: '2025-01-03',
      lastModified: '2025-01-09',
      owner: 'Frontend Team',
      environment: 'Production'
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Enhanced analytics dashboard with real-time insights',
      status: 'A/B Testing',
      rolloutPercentage: 50,
      targetAudience: 'Enterprise Users',
      createdDate: '2025-01-01',
      lastModified: '2025-01-10',
      owner: 'Analytics Team',
      environment: 'Production'
    },
    {
      id: 'mobile-app-v2',
      name: 'Mobile App V2',
      description: 'Next generation mobile application with native performance',
      status: 'Disabled',
      rolloutPercentage: 0,
      targetAudience: 'Internal Testing',
      createdDate: '2024-12-28',
      lastModified: '2025-01-07',
      owner: 'Mobile Team',
      environment: 'Staging'
    }
  ];

  const experiments = [
    {
      id: 'checkout-optimization',
      name: 'Checkout Flow Optimization',
      hypothesis: 'Simplified checkout will increase conversion by 15%',
      status: 'Running',
      progress: 68,
      participants: 2450,
      conversionRate: 23.8,
      statisticalSignificance: 87.5,
      estimatedCompletion: '2025-01-20'
    },
    {
      id: 'onboarding-redesign',
      name: 'User Onboarding Redesign',
      hypothesis: 'Interactive onboarding will reduce drop-off by 25%',
      status: 'Running',
      progress: 45,
      participants: 1890,
      conversionRate: 67.2,
      statisticalSignificance: 72.3,
      estimatedCompletion: '2025-01-25'
    },
    {
      id: 'pricing-display',
      name: 'Pricing Display Test',
      hypothesis: 'Transparent pricing will increase sign-ups by 20%',
      status: 'Completed',
      progress: 100,
      participants: 3200,
      conversionRate: 31.5,
      statisticalSignificance: 95.2,
      estimatedCompletion: '2025-01-08'
    }
  ];

  const userSegments = [
    { name: 'Premium Users', count: 12450, percentage: 28.5 },
    { name: 'Enterprise Users', count: 8920, percentage: 20.4 },
    { name: 'Beta Users', count: 5670, percentage: 13.0 },
    { name: 'Free Tier Users', count: 16780, percentage: 38.1 }
  ];

  const emergencyActions = [
    {
      action: 'Emergency Disable',
      feature: 'AI Enhanced Search',
      timestamp: '2025-01-09 14:23:00',
      reason: 'Performance degradation detected',
      triggeredBy: 'Auto-monitoring',
      status: 'Resolved'
    },
    {
      action: 'Rollback',
      feature: 'New Dashboard UI',
      timestamp: '2025-01-07 09:15:00',
      reason: 'Critical bug in user preferences',
      triggeredBy: 'Manual Override',
      status: 'Resolved'
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
                    <span className="ml-4 text-sm font-medium text-gray-900">Feature Flags</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <Flag className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Feature Flag Management</h1>
                <p className="text-gray-600 mt-1">Global feature rollout, A/B testing, gradual rollouts, and emergency shutoffs</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Feature Flag Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Flags Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Flag className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Feature Flags</p>
                      <p className="text-2xl font-bold text-gray-900">{flagData.totalFlags}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <Flag className="w-4 h-4 mr-1" />
                      <span>Across all environments</span>
                    </div>
                  </div>
                </div>

                {/* Active Flags Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <ToggleRight className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Flags</p>
                      <p className="text-2xl font-bold text-gray-900">{flagData.activeFlags}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <ToggleRight className="w-4 h-4 mr-1" />
                      <span>Currently enabled</span>
                    </div>
                  </div>
                </div>

                {/* Running Experiments Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Running Experiments</p>
                      <p className="text-2xl font-bold text-gray-900">{flagData.experimentsRunning}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <Target className="w-4 h-4 mr-1" />
                      <span>A/B tests in progress</span>
                    </div>
                  </div>
                </div>

                {/* Rollout Success Rate Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rollout Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{flagData.rolloutSuccess}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Above target threshold</span>
                    </div>
                  </div>
                </div>

                {/* User Segments Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">User Segments</p>
                      <p className="text-2xl font-bold text-gray-900">{flagData.userSegments}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-orange-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Targeting groups</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Shutoffs Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <ToggleLeft className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Emergency Shutoffs</p>
                      <p className="text-2xl font-bold text-gray-900">{flagData.emergencyShutoffs}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-red-600">
                      <ToggleLeft className="w-4 h-4 mr-1" />
                      <span>Last 30 days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Flags Management */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Active Feature Flags</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Create New Flag
                  </button>
                </div>
                <div className="space-y-4">
                  {featureFlags.map((flag) => (
                    <div key={flag.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Flag className="w-6 h-6 text-blue-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{flag.name}</h3>
                            <p className="text-sm text-gray-600">{flag.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            flag.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : flag.status === 'Gradual Rollout'
                              ? 'bg-blue-100 text-blue-800'
                              : flag.status === 'A/B Testing'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {flag.status}
                          </span>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            {flag.status === 'Disabled' ? (
                              <ToggleLeft className="w-6 h-6" />
                            ) : (
                              <ToggleRight className="w-6 h-6 text-green-600" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Rollout</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${flag.rolloutPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{flag.rolloutPercentage}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Target Audience</p>
                          <p className="font-medium text-gray-900">{flag.targetAudience}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Owner</p>
                          <p className="font-medium text-gray-900">{flag.owner}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Environment</p>
                          <p className="font-medium text-gray-900">{flag.environment}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Modified</p>
                          <p className="font-medium text-gray-900">{flag.lastModified}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200">
                          A/B Test
                        </button>
                        <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">
                          Emergency Stop
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* A/B Testing Experiments */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">A/B Testing Experiments</h2>
                <div className="space-y-4">
                  {experiments.map((experiment) => (
                    <div key={experiment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{experiment.name}</h3>
                          <p className="text-sm text-gray-600">{experiment.hypothesis}</p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          experiment.status === 'Running' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {experiment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${experiment.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{experiment.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Participants</p>
                          <p className="font-medium text-gray-900">{experiment.participants.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Conversion Rate</p>
                          <p className="font-medium text-gray-900">{experiment.conversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Statistical Significance</p>
                          <p className="font-medium text-gray-900">{experiment.statisticalSignificance}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Est. Completion</p>
                          <p className="font-medium text-gray-900">{experiment.estimatedCompletion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Segments */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">User Segments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userSegments.map((segment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{segment.name}</h3>
                      <p className="text-2xl font-bold text-blue-600 mb-1">{segment.count.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{segment.percentage}% of total users</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Actions Log */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Emergency Actions</h2>
                <div className="space-y-4">
                  {emergencyActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <ToggleLeft className="w-6 h-6 text-red-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{action.action}: {action.feature}</h3>
                          <p className="text-sm text-gray-600">{action.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{action.timestamp}</p>
                        <p className="text-sm font-medium text-gray-900">By: {action.triggeredBy}</p>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {action.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6 border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <Flag className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Feature Flag Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered rollout optimization, predictive A/B testing, automated canary deployments, and intelligent feature targeting coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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