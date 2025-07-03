import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const OnboardingDashboard = () => {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const fetchOnboardingData = async () => {
    try {
      const response = await fetch('/api/onboarding');
      const data = await response.json();
      setOnboardingData(data);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onboardingSteps = [
    {
      id: 1,
      title: 'Welcome & Account Setup',
      description: 'Complete your profile and basic account information',
      status: 'completed',
      progress: 100,
      estimatedTime: '5 minutes',
      completedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Platform Tour',
      description: 'Explore key features and navigation',
      status: 'completed',
      progress: 100,
      estimatedTime: '10 minutes',
      completedAt: '2024-01-15T10:45:00Z'
    },
    {
      id: 3,
      title: 'Team Setup',
      description: 'Invite team members and configure collaboration',
      status: 'in_progress',
      progress: 60,
      estimatedTime: '15 minutes',
      completedAt: null
    },
    {
      id: 4,
      title: 'Integration Configuration',
      description: 'Connect your existing tools and services',
      status: 'pending',
      progress: 0,
      estimatedTime: '20 minutes',
      completedAt: null
    },
    {
      id: 5,
      title: 'First Project',
      description: 'Create your first project and workflow',
      status: 'pending',
      progress: 0,
      estimatedTime: '25 minutes',
      completedAt: null
    }
  ];

  const quickActions = [
    {
      title: 'Complete Profile',
      description: 'Add your photo and professional details',
      icon: '👤',
      action: () => router.push('/profile'),
      completed: true
    },
    {
      title: 'Invite Team Members',
      description: 'Add colleagues to your workspace',
      icon: '👥',
      action: () => router.push('/team'),
      completed: false
    },
    {
      title: 'Connect Integrations',
      description: 'Link your favorite tools',
      icon: '🔗',
      action: () => router.push('/integration'),
      completed: false
    },
    {
      title: 'Create First Project',
      description: 'Start your first workflow',
      icon: '🚀',
      action: () => router.push('/tasks/projects'),
      completed: false
    }
  ];

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Complete walkthrough of platform features',
      type: 'guide',
      duration: '15 min read',
      url: '/onboarding/getting-started'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      type: 'video',
      duration: '30 min watch',
      url: '/resources/videos'
    },
    {
      title: 'Best Practices',
      description: 'Learn from successful implementations',
      type: 'article',
      duration: '10 min read',
      url: '/resources/best-practices'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users and experts',
      type: 'community',
      duration: 'Ongoing',
      url: '/community'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '⏳';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not completed';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Onboarding Dashboard"
        subtitle="Complete your setup and get started with the platform"
        breadcrumbs={[
          { label: 'Onboarding', href: '/onboarding' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Progress</h2>
            <div className="text-sm text-gray-500">
              2 of 5 steps completed
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: '40%' }}></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">40% Complete</span>
            <span className="text-blue-600 font-medium">Estimated 60 minutes remaining</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'steps', label: 'Onboarding Steps' },
              { id: 'resources', label: 'Resources' },
              { id: 'support', label: 'Get Help' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    onClick={action.action}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      action.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{action.icon}</span>
                      {action.completed && <span className="text-green-600">✅</span>}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Welcome to the Platform! 🎉</h3>
              <p className="mb-4">
                You're making great progress! Complete the remaining steps to unlock the full potential 
                of our platform and start achieving your goals.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/onboarding/wizard')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                >
                  Continue Setup
                </button>
                <button
                  onClick={() => router.push('/onboarding/getting-started')}
                  className="border border-white text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:bg-opacity-10"
                >
                  View Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Steps Tab */}
        {activeTab === 'steps' && (
          <div className="space-y-6">
            {onboardingSteps.map((step) => (
              <div key={step.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl">{getStatusIcon(step.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(step.status)}`}>
                          {step.status.replace('_', ' ').charAt(0).toUpperCase() + step.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      
                      {step.status !== 'pending' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{step.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                step.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${step.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Estimated time: {step.estimatedTime}</span>
                        <span>Completed: {formatDate(step.completedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {step.status === 'pending' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Start
                      </button>
                    )}
                    {step.status === 'in_progress' && (
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Continue
                      </button>
                    )}
                    {step.status === 'completed' && (
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {resource.type}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{resource.duration}</span>
                  <button
                    onClick={() => router.push(resource.url)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <h4 className="font-medium text-gray-900 mb-2">Live Chat</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Get instant help from our support team
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Start Chat
                  </button>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📧</div>
                  <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Send us a detailed message
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Send Email
                  </button>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📞</div>
                  <h4 className="font-medium text-gray-900 mb-2">Schedule Call</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Book a personalized onboarding session
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Book Call
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">How long does onboarding take?</h4>
                  <p className="text-sm text-gray-600">
                    Most users complete the full onboarding process in 60-90 minutes, but you can take breaks and return anytime.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Can I skip steps and come back later?</h4>
                  <p className="text-sm text-gray-600">
                    Yes! You can skip any step and return to complete it later. Your progress is automatically saved.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">What if I need help with integrations?</h4>
                  <p className="text-sm text-gray-600">
                    Our support team can help you set up integrations. You can also schedule a personalized onboarding call.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingDashboard;