import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Eye, TrendingUp, Target, Brain, Calendar, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function DigitalTwinPredictions() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const timeframes = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '3 Months' },
    { id: '1y', label: '1 Year' }
  ];

  const categories = [
    { id: 'all', label: 'All Predictions' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'goals', label: 'Goals' },
    { id: 'skills', label: 'Skills' },
    { id: 'career', label: 'Career' }
  ];

  const mockPredictions = {
    productivity: {
      trend: 'increasing',
      current_score: 87.3,
      predicted_score: 92.5,
      confidence: 0.88,
      change: '+5.2 points',
      factors: [
        'Consistent morning routine established',
        'Improved task prioritization skills',
        'Better work-life balance maintained',
        'Reduced context switching'
      ],
      recommendations: [
        'Continue leveraging 9-11 AM peak productivity window',
        'Implement time-blocking for deep work sessions',
        'Consider using focus apps during high-concentration tasks'
      ],
      timeline: 'Expected improvement within 2-3 weeks'
    },
    goals: {
      total_goals: 10,
      on_track: 8,
      at_risk: 2,
      completion_probability: 0.85,
      estimated_completion: '2025-03-15',
      at_risk_goals: [
        {
          goal: 'Complete Data Science Certification',
          risk_level: 'medium',
          current_progress: 45,
          predicted_completion: '2025-04-20',
          recommendation: 'Allocate 3 hours weekly for study sessions',
          confidence: 0.72
        },
        {
          goal: 'Launch Side Project',
          risk_level: 'high',
          current_progress: 25,
          predicted_completion: '2025-05-15',
          recommendation: 'Break down into smaller milestones and set weekly targets',
          confidence: 0.65
        }
      ],
      accelerated_goals: [
        {
          goal: 'Improve Team Leadership Skills',
          current_progress: 78,
          predicted_completion: '2025-02-28',
          ahead_by: '2 weeks',
          confidence: 0.91
        }
      ]
    },
    skills: {
      development_areas: [
        {
          skill: 'Data Analysis',
          current_level: 6.5,
          predicted_level: 8.2,
          growth_rate: '+1.7 levels',
          timeframe: '3 months',
          confidence: 0.82,
          learning_path: [
            'Complete advanced SQL course',
            'Practice with real datasets',
            'Build portfolio projects'
          ]
        },
        {
          skill: 'Project Management',
          current_level: 7.8,
          predicted_level: 8.9,
          growth_rate: '+1.1 levels',
          timeframe: '2 months',
          confidence: 0.76,
          learning_path: [
            'Obtain PMP certification',
            'Lead cross-functional projects',
            'Implement agile methodologies'
          ]
        },
        {
          skill: 'Public Speaking',
          current_level: 5.2,
          predicted_level: 7.1,
          growth_rate: '+1.9 levels',
          timeframe: '4 months',
          confidence: 0.69,
          learning_path: [
            'Join Toastmasters club',
            'Practice weekly presentations',
            'Record and review sessions'
          ]
        }
      ],
      skill_gaps: [
        {
          skill: 'Machine Learning',
          importance: 'high',
          current_level: 3.2,
          target_level: 7.0,
          estimated_time: '6 months',
          priority: 1
        }
      ]
    },
    career: {
      growth_trajectory: 'positive',
      next_milestone: 'Senior role transition',
      estimated_timeline: '8-12 months',
      probability: 0.78,
      preparation_areas: [
        'Leadership and team management skills',
        'Strategic thinking and planning',
        'Cross-functional collaboration',
        'Technical mentoring abilities'
      ],
      opportunities: [
        {
          type: 'Internal Promotion',
          probability: 0.72,
          timeline: '6-9 months',
          requirements: ['Complete leadership training', 'Lead major project']
        },
        {
          type: 'External Opportunity',
          probability: 0.65,
          timeline: '3-6 months',
          requirements: ['Update portfolio', 'Network expansion']
        }
      ],
      salary_projection: {
        current: '$85,000',
        predicted: '$105,000 - $120,000',
        increase: '23-41%',
        timeframe: '12-18 months'
      }
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Fetch predictions data from API
  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if backend is available
        const backendAvailable = await fetch('/api/health').then(res => res.ok).catch(() => false);
        
        if (backendAvailable) {
          // Make real API call
          const response = await fetch(`/api/digital-twin/predictions?timeframe=${selectedTimeframe}&category=${selectedCategory}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setPredictions(data);
          } else {
            // Fallback to mock data on API error
            setPredictions(mockPredictions);
          }
        } else {
          // Fallback to mock data when backend unavailable
          setPredictions(mockPredictions);
        }
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
        setError('Failed to load predictions data');
        // Fallback to mock data on error
        setPredictions(mockPredictions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [selectedTimeframe, selectedCategory]);

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Head>
          <title>AI Predictions - Digame</title>
          <meta name="description" content="AI-powered predictions for your professional development" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        </Head>

        <div className="min-h-screen bg-gray-50">
          <PageHeader
            title="AI Predictions"
            subtitle="Data-driven insights about your future performance and growth"
            icon={<Eye className="w-6 h-6 text-purple-600" />}
            badge="PREDICTIONS"
          />

          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading AI predictions...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Use fetched predictions or fallback to mock data
  const currentPredictions = predictions || mockPredictions;

  return (
    <>
      <Head>
        <title>AI Predictions - Digame</title>
        <meta name="description" content="AI-powered predictions for your professional development" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="AI Predictions"
          subtitle="Data-driven insights about your future performance and growth"
          icon={<Eye className="w-6 h-6 text-purple-600" />}
          badge="PREDICTIONS"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Prediction Timeframe</h3>
                <div className="flex space-x-2">
                  {timeframes.map((timeframe) => (
                    <button
                      key={timeframe.id}
                      onClick={() => setSelectedTimeframe(timeframe.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedTimeframe === timeframe.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {timeframe.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Productivity Predictions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Productivity Forecast</h2>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(currentPredictions.productivity.confidence)}`}>
                {Math.round(currentPredictions.productivity.confidence * 100)}% confidence
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-4">
                  <h3 className="text-lg font-semibold mb-2">Score Prediction</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentPredictions.productivity.current_score}</div>
                      <div className="text-sm opacity-90">Current</div>
                    </div>
                    <div className="text-2xl">→</div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentPredictions.productivity.predicted_score}</div>
                      <div className="text-sm opacity-90">Predicted</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    Expected improvement: <span className="font-semibold">{currentPredictions.productivity.change}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Key Success Factors</h4>
                  <ul className="space-y-2">
                    {currentPredictions.productivity.factors.map((factor, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                <div className="space-y-3">
                  {currentPredictions.productivity.recommendations.map((rec, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">{rec}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">Timeline</span>
                  </div>
                  <p className="text-sm text-green-800">{currentPredictions.productivity.timeline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Predictions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Goals Progress Forecast</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{currentPredictions.goals.on_track}</div>
                <div className="text-sm text-green-800">Goals On Track</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{currentPredictions.goals.at_risk}</div>
                <div className="text-sm text-yellow-800">Goals At Risk</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(currentPredictions.goals.completion_probability * 100)}%
                </div>
                <div className="text-sm text-blue-800">Completion Probability</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span>Goals Requiring Attention</span>
                </h4>
                <div className="space-y-4">
                  {currentPredictions.goals.at_risk_goals.map((goal, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{goal.goal}</h5>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(goal.risk_level)}`}>
                          {goal.risk_level} risk
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{goal.current_progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${goal.current_progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{goal.recommendation}</p>
                      <div className="text-xs text-gray-500">
                        Predicted completion: {goal.predicted_completion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Accelerated Goals</span>
                </h4>
                <div className="space-y-4">
                  {currentPredictions.goals.accelerated_goals.map((goal, index) => (
                    <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">{goal.goal}</h5>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{goal.current_progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${goal.current_progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm text-green-800">
                        🎉 Ahead by {goal.ahead_by}! Expected completion: {goal.predicted_completion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Development Predictions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Skills Development Forecast</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentPredictions.skills.development_areas.map((skill, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(skill.confidence)}`}>
                      {Math.round(skill.confidence * 100)}%
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Current Level</span>
                      <span>{skill.current_level}/10</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Predicted Level</span>
                      <span>{skill.predicted_level}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(skill.predicted_level / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-purple-600 font-medium">
                      Growth: {skill.growth_rate} in {skill.timeframe}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Learning Path</h4>
                    <ul className="space-y-1">
                      {skill.learning_path.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start space-x-2 text-sm">
                          <Star className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}