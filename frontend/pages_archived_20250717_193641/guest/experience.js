import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const GuestExperience = () => {
  const router = useRouter();
  const [experienceData, setExperienceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('optimization');

  useEffect(() => {
    fetchExperienceData();
  }, []);

  const fetchExperienceData = async () => {
    try {
      const response = await fetch('/api/guest/experience');
      const data = await response.json();
      setExperienceData(data);
    } catch (error) {
      console.error('Error fetching experience data:', error);
    } finally {
      setLoading(false);
    }
  };

  const conversionOptimizations = [
    {
      id: 1,
      title: 'Landing Page Hero Section',
      description: 'Optimize headline and call-to-action placement',
      currentConversion: 2.8,
      targetConversion: 4.2,
      status: 'active',
      impact: 'high',
      testResults: {
        variant: 'B',
        improvement: '+15%',
        confidence: 95
      }
    },
    {
      id: 2,
      title: 'Pricing Page Layout',
      description: 'Simplify pricing tiers and highlight popular plan',
      currentConversion: 8.5,
      targetConversion: 12.0,
      status: 'testing',
      impact: 'medium',
      testResults: {
        variant: 'A',
        improvement: '+8%',
        confidence: 78
      }
    },
    {
      id: 3,
      title: 'Demo Request Form',
      description: 'Reduce form fields and add social proof',
      currentConversion: 12.3,
      targetConversion: 18.0,
      status: 'planned',
      impact: 'high',
      testResults: null
    },
    {
      id: 4,
      title: 'Feature Showcase',
      description: 'Interactive product tour with video demos',
      currentConversion: 5.7,
      targetConversion: 9.2,
      status: 'active',
      impact: 'medium',
      testResults: {
        variant: 'C',
        improvement: '+22%',
        confidence: 89
      }
    }
  ];

  const userJourneyStages = [
    {
      stage: 'Awareness',
      touchpoints: ['Search Results', 'Social Media', 'Referrals'],
      metrics: {
        visitors: 15432,
        engagement: 34,
        dropOff: 66
      },
      optimizations: ['SEO Improvements', 'Social Media Content', 'Referral Program']
    },
    {
      stage: 'Interest',
      touchpoints: ['Landing Page', 'Feature Pages', 'Blog Content'],
      metrics: {
        visitors: 8934,
        engagement: 58,
        dropOff: 42
      },
      optimizations: ['Content Personalization', 'Interactive Demos', 'Case Studies']
    },
    {
      stage: 'Consideration',
      touchpoints: ['Pricing Page', 'Comparison Charts', 'Reviews'],
      metrics: {
        visitors: 4567,
        engagement: 72,
        dropOff: 28
      },
      optimizations: ['Pricing Clarity', 'Feature Comparison', 'Customer Testimonials']
    },
    {
      stage: 'Intent',
      touchpoints: ['Demo Request', 'Free Trial', 'Contact Form'],
      metrics: {
        visitors: 1234,
        engagement: 85,
        dropOff: 15
      },
      optimizations: ['Form Optimization', 'Instant Access', 'Live Chat Support']
    },
    {
      stage: 'Conversion',
      touchpoints: ['Sign Up', 'Payment', 'Onboarding'],
      metrics: {
        visitors: 432,
        engagement: 95,
        dropOff: 5
      },
      optimizations: ['Streamlined Signup', 'Payment Options', 'Quick Onboarding']
    }
  ];

  const personalizations = [
    {
      segment: 'First-time Visitors',
      population: 67,
      strategy: 'Welcome message with product overview',
      conversion: 2.1,
      improvement: '+12%'
    },
    {
      segment: 'Returning Visitors',
      population: 23,
      strategy: 'Personalized content based on previous pages',
      conversion: 4.8,
      improvement: '+28%'
    },
    {
      segment: 'High-Intent Users',
      population: 8,
      strategy: 'Direct demo access and priority support',
      conversion: 15.7,
      improvement: '+45%'
    },
    {
      segment: 'Mobile Users',
      population: 42,
      strategy: 'Mobile-optimized experience and quick actions',
      conversion: 1.9,
      improvement: '+8%'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Guest Experience"
        subtitle="Conversion optimization and user journey enhancement"
        breadcrumbs={[
          { label: 'Guest Features', href: '/guest' },
          { label: 'Experience', href: '/guest/experience' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'optimization', label: 'Conversion Optimization' },
              { id: 'journey', label: 'User Journey' },
              { id: 'personalization', label: 'Personalization' },
              { id: 'testing', label: 'A/B Testing' }
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

        {/* Conversion Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Overall Conversion Rate</h3>
                <div className="text-3xl font-bold text-gray-900 mt-2">2.8%</div>
                <div className="text-sm text-green-600 mt-1">+0.4% improvement</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Active Tests</h3>
                <div className="text-3xl font-bold text-gray-900 mt-2">4</div>
                <div className="text-sm text-gray-600 mt-1">2 showing positive results</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Revenue Impact</h3>
                <div className="text-3xl font-bold text-gray-900 mt-2">+$45K</div>
                <div className="text-sm text-green-600 mt-1">Monthly increase</div>
              </div>
            </div>

            <div className="space-y-4">
              {conversionOptimizations.map((optimization) => (
                <div key={optimization.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{optimization.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{optimization.description}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(optimization.status)}`}>
                        {optimization.status.charAt(0).toUpperCase() + optimization.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(optimization.impact)}`}>
                        {optimization.impact.charAt(0).toUpperCase() + optimization.impact.slice(1)} Impact
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Current Conversion</div>
                      <div className="text-2xl font-bold text-gray-900">{optimization.currentConversion}%</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Target Conversion</div>
                      <div className="text-2xl font-bold text-blue-600">{optimization.targetConversion}%</div>
                    </div>
                    <div>
                      {optimization.testResults && (
                        <>
                          <div className="text-sm font-medium text-gray-500">Test Results</div>
                          <div className="text-2xl font-bold text-green-600">{optimization.testResults.improvement}</div>
                          <div className="text-xs text-gray-500">{optimization.testResults.confidence}% confidence</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Journey Tab */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">User Journey Stages</h3>
              <div className="space-y-6">
                {userJourneyStages.map((stage, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{stage.stage}</h4>
                      <div className="text-sm text-gray-500">
                        {stage.metrics.visitors.toLocaleString()} visitors
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Touchpoints</div>
                        <div className="mt-1">
                          {stage.touchpoints.map((touchpoint, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-1 mb-1">
                              {touchpoint}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Engagement Rate</div>
                        <div className="text-xl font-bold text-green-600 mt-1">{stage.metrics.engagement}%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Drop-off Rate</div>
                        <div className="text-xl font-bold text-red-600 mt-1">{stage.metrics.dropOff}%</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Optimization Opportunities</div>
                      <div className="flex flex-wrap gap-2">
                        {stage.optimizations.map((optimization, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            {optimization}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Personalization Tab */}
        {activeTab === 'personalization' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Personalization Strategies</h3>
              <div className="space-y-4">
                {personalizations.map((segment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{segment.segment}</h4>
                      <div className="text-sm text-gray-500">{segment.population}% of visitors</div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{segment.strategy}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Conversion Rate</div>
                        <div className="text-xl font-bold text-gray-900">{segment.conversion}%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Improvement</div>
                        <div className="text-xl font-bold text-green-600">{segment.improvement}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* A/B Testing Tab */}
        {activeTab === 'testing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">A/B Testing Dashboard</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🧪</div>
                  <p className="text-gray-600">A/B Testing Results</p>
                  <p className="text-sm text-gray-500">Statistical analysis and test performance</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium text-gray-900 mb-4">Test Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Tests</span>
                    <span className="text-sm font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Winning Tests</span>
                    <span className="text-sm font-medium text-green-600">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Lift</span>
                    <span className="text-sm font-medium">+18.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Statistical Significance</span>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium text-gray-900 mb-4">Best Practices</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Run tests for at least 2 weeks for statistical significance</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Test one element at a time for clear results</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Ensure sufficient sample size before concluding</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Document learnings for future optimization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestExperience;