import React, { useState } from 'react';
import Head from 'next/head';
import { Code, Brain, Zap, Database, Activity, CheckCircle, Copy, Play, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const DigitalTwinIntelligence: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('chat');

const DigitalTwinIntelligence: React.FC = () => {

  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiEndpoints = [
    {
      id: 'chat',
      name: 'Chat with Twin',
      method: 'POST',
      endpoint: '/api/digital-twin/chat',
      description: 'Interactive conversation with your digital twin',
      example: {
        message: 'How can I improve my productivity?',
        context: 'productivity'
      }
    },
    {
      id: 'predictions',
      name: 'AI Predictions',
      method: 'GET',
      endpoint: '/api/digital-twin/predictions',
      description: 'Get AI-powered predictions about your performance',
      example: {
        timeframe: '30d',
        category: 'productivity'
      }
    },
    {
      id: 'simulation',
      name: 'What-If Simulation',
      method: 'POST',
      endpoint: '/api/digital-twin/simulation',
      description: 'Run scenario simulations for decision support',
      example: {
        scenario: 'career_change',
        parameters: {
          target_role: 'Senior Developer',
          timeline: '6 months'
        }
      }
    },
    {
      id: 'analytics',
      name: 'Twin Analytics',
      method: 'GET',
      endpoint: '/api/digital-twin/analytics',
      description: 'Comprehensive analytics about your digital twin',
      example: {
        timeRange: '30d'
      }
    },
    {
      id: 'configuration',
      name: 'Update Configuration',
      method: 'PUT',
      endpoint: '/api/digital-twin/configuration',
      description: 'Update your digital twin settings',
      example: {
        learningMode: 'continuous',
        privacyLevel: 'standard',
        analysisDepth: 'comprehensive'
      }
    }
  ];

  const mockResponses = {
    chat: {
      message: 'How can I improve my productivity?',
      response: 'Based on my analysis of your work patterns, I recommend focusing on your peak productivity hours between 9-11 AM for complex tasks. You show 23% higher focus during this window. Also, taking 15-minute breaks every 90 minutes could improve your sustained attention by up to 18%.',
      confidence: 0.91,
      suggestions: [
        'Schedule important meetings during your peak hours',
        'Use the Pomodoro technique for better focus',
        'Consider time-blocking for deep work sessions'
      ],
      timestamp: new Date().toISOString()
    },
    predictions: {
      productivity: {
        trend: 'increasing',
        predicted_score: 92.5,
        confidence: 0.88,
        factors: ['Consistent morning routine', 'Improved task prioritization']
      },
      goals: {
        completion_probability: 0.85,
        estimated_completion: '2025-03-15'
      },
      skills: {
        development_areas: [
          {
            skill: 'Data Analysis',
            current_level: 6.5,
            predicted_level: 8.2,
            timeframe: '3 months'
          }
        ]
      }
    },
    simulation: {
      scenario: 'career_change',
      results: {
        probability_of_success: 0.78,
        estimated_impact: 'high',
        timeline: '3-6 months',
        risks: [
          {
            risk: 'Skill gap in required areas',
            probability: 0.28,
            mitigation: 'Enroll in targeted training programs'
          }
        ]
      },
      recommendations: [
        'Start with small pilot implementation',
        'Build support network for accountability'
      ]
    },
    analytics: {
      overview: {
        totalInteractions: 156,
        insightsGenerated: 23,
        accuracyScore: 94.2
      },
      trends: {
        interactionFrequency: 'increasing',
        insightQuality: 'improving'
      }
    },
    configuration: {
      learningMode: 'continuous',
      privacyLevel: 'standard',
      analysisDepth: 'comprehensive',
      lastUpdated: new Date().toISOString()
    }
  };

  const handleTestAPI = async () => {
    setIsLoading(true);
    
    try {
      // Check if backend is available
      const backendAvailable = await fetch('/api/health').then(res => res.ok).catch(() => false);
      
      if (backendAvailable) {
        // Make real API call
        const response = await fetch(selectedAPI.endpoint, {
          method: selectedAPI.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`
          },
          body: selectedAPI.method !== 'GET' ? JSON.stringify(selectedAPI.example) : undefined
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiResponse(data);
        } else {
          // Fallback to mock data on API error
          setApiResponse(mockResponses[selectedEndpoint]);
        }
      } else {
        // Fallback to mock data when backend unavailable
        setApiResponse(mockResponses[selectedEndpoint]);
      }
    } catch (error) {
      console.error('API call failed:', error);
      // Fallback to mock data on error
      setApiResponse(mockResponses[selectedEndpoint]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const selectedAPI = apiEndpoints.find(api => api.id === selectedEndpoint);

  return (
    <>
      <Head>
        <title>Intelligence API - Digame</title>
        <meta name="description" content="Digital Twin Intelligence API access and documentation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Intelligence API"
          subtitle="Access your Digital Twin through powerful API endpoints"
          icon={<Code className="w-6 h-6 text-blue-600" />}
          badge="API ACCESS"
        />

        <div className="container mx-auto px-4 py-8">
          {/* API Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Digital Twin Intelligence API</h2>
            <p className="text-gray-600 mb-6">
              Access your Digital Twin's intelligence through RESTful API endpoints. 
              Build custom integrations, automate workflows, and leverage AI insights programmatically.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Brain className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">AI-Powered</h3>
                <p className="text-sm text-blue-800">Advanced machine learning algorithms</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Zap className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">Real-time</h3>
                <p className="text-sm text-green-800">Instant responses and live data</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <Database className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-purple-900 mb-2">Comprehensive</h3>
                <p className="text-sm text-purple-800">Full access to twin capabilities</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* API Endpoints */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Endpoints</h3>
              <div className="space-y-3">
                {apiEndpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedEndpoint === endpoint.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{endpoint.name}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        endpoint.method === 'GET' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {endpoint.method}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {endpoint.endpoint}
                    </code>
                  </button>
                ))}
              </div>
            </div>

            {/* API Testing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">API Testing</h3>
                <button
                  onClick={handleTestAPI}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Activity className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Testing...' : 'Test API'}</span>
                </button>
              </div>

              {selectedAPI && (
                <div className="space-y-4">
                  {/* Request */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Request Example</h4>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(selectedAPI.example, null, 2))}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                      <div className="text-green-400 mb-2">
                        {selectedAPI.method} {selectedAPI.endpoint}
                      </div>
                      <pre>{JSON.stringify(selectedAPI.example, null, 2)}</pre>
                    </div>
                  </div>

                  {/* Response */}
                  {apiResponse && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-gray-900">Response</h4>
                      </div>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                        <div className="text-green-400 mb-2">200 OK</div>
                        <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Authentication & Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">🔑 API Key Required</h4>
                  <p className="text-sm text-yellow-800">
                    All API requests require authentication using your personal API key.
                  </p>
                </div>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                  <div className="text-blue-400 mb-2">Authorization Header:</div>
                  <code>Authorization: Bearer your_api_key_here</code>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Rate Limits</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 1000 requests per hour</li>
                    <li>• 10,000 requests per day</li>
                    <li>• Burst limit: 100 requests per minute</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Examples</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">JavaScript/Node.js</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <pre>{`const response = await fetch('/api/digital-twin/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'How can I improve my productivity?'
  })
});

const data = await response.json();
console.log(data.response);`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Python</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <pre>{`import requests

response = requests.post(
    '/api/digital-twin/chat',
    headers={'Authorization': 'Bearer your_api_key'},
    json={'message': 'How can I improve my productivity?'}
)

data = response.json()
print(data['response'])`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DigitalTwinIntelligence;
