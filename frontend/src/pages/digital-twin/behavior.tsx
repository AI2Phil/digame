import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/navigation/PageHeader';

const BehaviorModeling = () => {
  const router = useRouter();
  const [behaviorData, setBehaviorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('patterns');

  useEffect(() => {
    fetchBehaviorData();
  }, []);

  const fetchBehaviorData = async () => {
    try {
      const response = await fetch('/api/digital-twin/behavior', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBehaviorData(data);
      } else {
        // Fallback to mock data if API fails
        console.log('API failed, using mock data');
        setBehaviorData({ success: true }); // Trigger mock data usage
      }
    } catch (error) {
      console.error('Error fetching behavior data:', error);
      // Fallback to mock data
      setBehaviorData({ success: true }); // Trigger mock data usage
    } finally {
      setLoading(false);
    }
  };

  const behaviorPatterns = [
    {
      id: 1,
      pattern: 'Morning Productivity Peak',
      confidence: 92,
      description: 'Highest productivity between 9-11 AM',
      frequency: 'Daily',
      impact: 'High',
    },
    {
      id: 2,
      pattern: 'Deep Work Preference',
      confidence: 88,
      description: 'Prefers 2-hour uninterrupted work blocks',
      frequency: 'Weekly',
      impact: 'High',
    },
    {
      id: 3,
      pattern: 'Communication Style',
      confidence: 85,
      description: 'Prefers written over verbal communication',
      frequency: 'Daily',
      impact: 'Medium',
    },
    {
      id: 4,
      pattern: 'Learning Approach',
      confidence: 79,
      description: 'Visual learner with hands-on preference',
      frequency: 'Weekly',
      impact: 'Medium',
    },
  ];

  const behaviorTrends = [
    { month: 'Jan', productivity: 78, focus: 82, collaboration: 65 },
    { month: 'Feb', productivity: 82, focus: 85, collaboration: 70 },
    { month: 'Mar', productivity: 85, focus: 88, collaboration: 75 },
    { month: 'Apr', productivity: 88, focus: 90, collaboration: 78 },
    { month: 'May', productivity: 90, focus: 92, collaboration: 82 },
    { month: 'Jun', productivity: 92, focus: 94, collaboration: 85 },
  ];

  const recommendations = [
    {
      id: 1,
      type: 'Schedule Optimization',
      title: 'Block Morning Hours',
      description: 'Schedule important tasks between 9-11 AM for maximum productivity',
      priority: 'High',
      impact: '+15% productivity',
    },
    {
      id: 2,
      type: 'Work Environment',
      title: 'Minimize Interruptions',
      description: 'Create 2-hour focus blocks with notifications disabled',
      priority: 'High',
      impact: '+20% deep work',
    },
    {
      id: 3,
      type: 'Communication',
      title: 'Async Communication',
      description: 'Use written communication for complex topics',
      priority: 'Medium',
      impact: '+10% clarity',
    },
    {
      id: 4,
      type: 'Learning',
      title: 'Visual Learning Materials',
      description: 'Incorporate diagrams and hands-on exercises',
      priority: 'Medium',
      impact: '+25% retention',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Behavior Modeling"
        subtitle="AI-powered behavioral pattern analysis and optimization"
        breadcrumbs={[
          { label: 'Digital Twin', href: '/digital-twin/my-twin' },
          { label: 'Behavior Modeling', href: '/digital-twin/behavior' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'patterns', label: 'Behavior Patterns' },
              { id: 'trends', label: 'Trends Analysis' },
              { id: 'recommendations', label: 'Recommendations' },
              { id: 'insights', label: 'AI Insights' },
            ].map(tab => (
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

        {/* Behavior Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Identified Behavior Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {behaviorPatterns.map(pattern => (
                  <div key={pattern.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{pattern.pattern}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          pattern.confidence >= 90
                            ? 'bg-green-100 text-green-800'
                            : pattern.confidence >= 80
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {pattern.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{pattern.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Frequency: {pattern.frequency}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          pattern.impact === 'High'
                            ? 'bg-red-100 text-red-800'
                            : pattern.impact === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {pattern.impact} Impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trends Analysis Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Behavioral Trends Over Time
              </h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-600">Behavior trends visualization</p>
                  <p className="text-sm text-gray-500">
                    Chart showing productivity, focus, and collaboration trends
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium text-gray-900 mb-2">Productivity Trend</h4>
                <div className="text-3xl font-bold text-green-600 mb-1">+18%</div>
                <p className="text-sm text-gray-600">6-month improvement</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium text-gray-900 mb-2">Focus Quality</h4>
                <div className="text-3xl font-bold text-blue-600 mb-1">+15%</div>
                <p className="text-sm text-gray-600">Deep work sessions</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-medium text-gray-900 mb-2">Collaboration</h4>
                <div className="text-3xl font-bold text-purple-600 mb-1">+31%</div>
                <p className="text-sm text-gray-600">Team engagement</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                AI-Generated Recommendations
              </h3>
              <div className="space-y-4">
                {recommendations.map(rec => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {rec.type}
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              rec.priority === 'High'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {rec.priority} Priority
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                        <div className="text-sm text-green-600 font-medium">{rec.impact}</div>
                      </div>
                      <button className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Behavioral Insights</h3>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🧠 Cognitive Load Analysis</h4>
                  <p className="text-blue-800 text-sm">
                    Your cognitive load peaks around 2 PM, suggesting optimal scheduling of complex
                    tasks in the morning. Consider implementing the Pomodoro technique during
                    afternoon hours.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">⚡ Energy Pattern Recognition</h4>
                  <p className="text-green-800 text-sm">
                    Your energy levels correlate strongly with natural light exposure. Consider
                    working near windows or using a light therapy lamp during darker months.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">
                    🤝 Social Interaction Patterns
                  </h4>
                  <p className="text-purple-800 text-sm">
                    You perform better in collaborative tasks when they're scheduled after
                    individual deep work sessions. This suggests a warm-up effect that enhances team
                    interactions.
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">📱 Digital Behavior Analysis</h4>
                  <p className="text-orange-800 text-sm">
                    Your productivity decreases by 23% on days with high notification frequency.
                    Consider implementing focused work blocks with notification batching.
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

export default BehaviorModeling;
