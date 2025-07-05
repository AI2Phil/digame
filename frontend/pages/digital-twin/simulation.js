import React, { useState } from 'react';
import Head from 'next/head';
import { Layers, Play, BarChart3, AlertTriangle, CheckCircle, TrendingUp, Clock, Target } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function TwinSimulation() {
  const [selectedScenario, setSelectedScenario] = useState('');
  const [simulationParams, setSimulationParams] = useState({});
  const [simulationResult, setSimulationResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const scenarios = [
    {
      id: 'career_change',
      title: 'Career Change',
      description: 'Simulate transitioning to a new role or industry',
      icon: <Target className="w-6 h-6 text-blue-600" />,
      params: [
        { key: 'target_role', label: 'Target Role', type: 'text', placeholder: 'e.g., Senior Developer' },
        { key: 'timeline', label: 'Timeline', type: 'select', options: ['3 months', '6 months', '1 year', '2 years'] },
        { key: 'industry', label: 'Target Industry', type: 'text', placeholder: 'e.g., FinTech' },
        { key: 'salary_expectation', label: 'Salary Expectation', type: 'text', placeholder: 'e.g., $120,000' }
      ]
    },
    {
      id: 'skill_development',
      title: 'Skill Development',
      description: 'Analyze the impact of learning new skills',
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      params: [
        { key: 'skill_name', label: 'Skill to Develop', type: 'text', placeholder: 'e.g., Machine Learning' },
        { key: 'time_investment', label: 'Weekly Time Investment', type: 'select', options: ['2 hours', '5 hours', '10 hours', '20 hours'] },
        { key: 'learning_method', label: 'Learning Method', type: 'select', options: ['Online courses', 'Bootcamp', 'University', 'Self-study'] },
        { key: 'target_level', label: 'Target Proficiency', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] }
      ]
    },
    {
      id: 'work_schedule',
      title: 'Work Schedule Change',
      description: 'Evaluate different work arrangements',
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      params: [
        { key: 'schedule_type', label: 'Schedule Type', type: 'select', options: ['Remote', 'Hybrid', 'Flexible hours', '4-day week'] },
        { key: 'start_time', label: 'Preferred Start Time', type: 'select', options: ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'] },
        { key: 'break_frequency', label: 'Break Frequency', type: 'select', options: ['Every hour', 'Every 2 hours', 'Every 3 hours'] },
        { key: 'focus_blocks', label: 'Deep Work Blocks', type: 'select', options: ['1 hour', '2 hours', '3 hours', '4 hours'] }
      ]
    },
    {
      id: 'productivity_optimization',
      title: 'Productivity Optimization',
      description: 'Test different productivity strategies',
      icon: <BarChart3 className="w-6 h-6 text-orange-600" />,
      params: [
        { key: 'methodology', label: 'Productivity Method', type: 'select', options: ['Pomodoro', 'Time blocking', 'GTD', 'Kanban'] },
        { key: 'tool_adoption', label: 'New Tools', type: 'text', placeholder: 'e.g., Notion, Todoist' },
        { key: 'meeting_reduction', label: 'Meeting Reduction', type: 'select', options: ['10%', '25%', '50%', '75%'] },
        { key: 'automation_level', label: 'Automation Level', type: 'select', options: ['Low', 'Medium', 'High', 'Maximum'] }
      ]
    }
  ];

  const mockResults = {
    career_change: {
      probability_of_success: 0.78,
      estimated_impact: 'high',
      timeline: '6-9 months',
      confidence: 0.84,
      resource_requirements: [
        'Additional 10 hours/week for skill development',
        'Budget allocation: $2,000-3,000 for courses',
        'Network expansion in target industry',
        'Portfolio development time'
      ],
      risks: [
        {
          risk: 'Skill gap in required technologies',
          probability: 0.35,
          impact: 'medium',
          mitigation: 'Enroll in targeted bootcamp or certification program'
        },
        {
          risk: 'Market competition for target role',
          probability: 0.28,
          impact: 'high',
          mitigation: 'Build strong portfolio and get referrals'
        },
        {
          risk: 'Salary expectations not met',
          probability: 0.22,
          impact: 'medium',
          mitigation: 'Consider gradual transition or contract work'
        }
      ],
      opportunities: [
        'Salary increase potential: 25-40%',
        'Career growth acceleration',
        'Access to emerging technology stack',
        'Expanded professional network'
      ],
      milestones: [
        { month: 1, task: 'Complete skills assessment', status: 'pending' },
        { month: 2, task: 'Enroll in certification program', status: 'pending' },
        { month: 4, task: 'Build portfolio projects', status: 'pending' },
        { month: 6, task: 'Begin job applications', status: 'pending' },
        { month: 8, task: 'Target role acquisition', status: 'pending' }
      ]
    },
    skill_development: {
      probability_of_success: 0.92,
      estimated_impact: 'high',
      timeline: '3-4 months',
      confidence: 0.89,
      skill_progression: {
        current_level: 2,
        target_level: 7,
        predicted_level: 6.8,
        learning_curve: 'steep initial, then gradual'
      },
      career_impact: {
        promotion_probability: 0.65,
        salary_increase: '15-25%',
        new_opportunities: 12
      },
      learning_plan: [
        { week: '1-2', focus: 'Fundamentals and theory', hours: 10 },
        { week: '3-6', focus: 'Hands-on practice', hours: 15 },
        { week: '7-10', focus: 'Real projects', hours: 12 },
        { week: '11-12', focus: 'Portfolio development', hours: 8 }
      ]
    },
    work_schedule: {
      productivity_impact: '+23%',
      work_life_balance: '+35%',
      stress_reduction: '+18%',
      confidence: 0.91,
      adaptation_period: '2-3 weeks',
      potential_challenges: [
        'Initial adjustment to new routine',
        'Coordination with team schedules',
        'Client meeting availability'
      ],
      benefits: [
        'Reduced commute stress',
        'Better focus during peak hours',
        'Improved family time',
        'Higher job satisfaction'
      ],
      metrics: {
        focus_time: '+2.5 hours/day',
        meeting_efficiency: '+40%',
        task_completion: '+28%',
        energy_levels: '+22%'
      }
    },
    productivity_optimization: {
      efficiency_gain: '+31%',
      time_saved: '8.5 hours/week',
      stress_reduction: '+25%',
      confidence: 0.87,
      implementation_difficulty: 'medium',
      roi_timeline: '4-6 weeks',
      key_improvements: [
        'Reduced context switching by 45%',
        'Faster task completion by 28%',
        'Better priority management',
        'Improved focus quality'
      ],
      tool_adoption_curve: {
        week1: '25% adoption',
        week2: '60% adoption',
        week4: '85% adoption',
        week8: '95% adoption'
      }
    }
  };

  const handleParamChange = (key, value) => {
    setSimulationParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const runSimulation = async () => {
    if (!selectedScenario) return;
    
    setIsRunning(true);
    
    // Simulate processing time
    setTimeout(() => {
      setSimulationResult(mockResults[selectedScenario]);
      setIsRunning(false);
    }, 2000);
  };

  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (probability) => {
    if (probability > 0.3) return 'text-red-600 bg-red-100';
    if (probability > 0.15) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <>
      <Head>
        <title>Twin Simulation - Digame</title>
        <meta name="description" content="Run what-if scenarios with your Digital Twin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Twin Simulation"
          subtitle="Run what-if scenarios to make better decisions"
          icon={<Layers className="w-6 h-6 text-purple-600" />}
          badge="SIMULATION"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Scenario Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a Scenario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => {
                    setSelectedScenario(scenario.id);
                    setSimulationResult(null);
                    setSimulationParams({});
                  }}
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    selectedScenario === scenario.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {scenario.icon}
                    <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedScenarioData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Parameters */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Parameters</h3>
                <div className="space-y-4">
                  {selectedScenarioData.params.map((param) => (
                    <div key={param.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {param.label}
                      </label>
                      {param.type === 'select' ? (
                        <select
                          value={simulationParams[param.key] || ''}
                          onChange={(e) => handleParamChange(param.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select {param.label}</option>
                          {param.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={simulationParams[param.key] || ''}
                          onChange={(e) => handleParamChange(param.key, e.target.value)}
                          placeholder={param.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={runSimulation}
                  disabled={isRunning || Object.keys(simulationParams).length === 0}
                  className="w-full mt-6 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Running Simulation...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Run Simulation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Results */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Results</h3>
                
                {!simulationResult ? (
                  <div className="text-center py-12">
                    <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Configure parameters and run simulation to see results</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overview */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                      <h4 className="text-lg font-semibold mb-4">Simulation Overview</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold">
                            {Math.round(simulationResult.probability_of_success * 100)}%
                          </div>
                          <div className="text-sm opacity-90">Success Probability</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {Math.round(simulationResult.confidence * 100)}%
                          </div>
                          <div className="text-sm opacity-90">Confidence Level</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm opacity-90">Timeline</div>
                        <div className="font-semibold">{simulationResult.timeline}</div>
                      </div>
                    </div>

                    {/* Impact Analysis */}
                    {simulationResult.estimated_impact && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Impact Analysis</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Estimated Impact:</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(simulationResult.estimated_impact)}`}>
                            {simulationResult.estimated_impact.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Risks */}
                    {simulationResult.risks && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span>Risk Analysis</span>
                        </h4>
                        <div className="space-y-3">
                          {simulationResult.risks.map((risk, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{risk.risk}</span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(risk.probability)}`}>
                                  {Math.round(risk.probability * 100)}% chance
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Mitigation:</strong> {risk.mitigation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opportunities */}
                    {simulationResult.opportunities && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Opportunities</span>
                        </h4>
                        <ul className="space-y-2">
                          {simulationResult.opportunities.map((opportunity, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{opportunity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Resource Requirements */}
                    {simulationResult.resource_requirements && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Resource Requirements</h4>
                        <ul className="space-y-2">
                          {simulationResult.resource_requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700">{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}