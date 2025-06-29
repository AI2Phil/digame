import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Clock,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
  BarChart3,
  Lightbulb
} from 'lucide-react';

interface Pattern {
  type: string;
  pattern_category: string;
  data: any;
  confidence: number;
  impact: string;
  frequency_score: number;
  discovered_at: string;
}

interface Prediction {
  date: string;
  predicted_score: number;
  confidence: number;
  day_of_week: string;
  factors: string[];
}

interface IntelligenceData {
  patterns: Pattern[];
  productivity_predictions: {
    predictions: Prediction[];
    trend_analysis: any;
    recommendation: string;
  };
  energy_insights: {
    energy_predictions: any[];
    scheduling_recommendations: string[];
  };
  comprehensive_insights: {
    combined_insights: any;
    actionable_recommendations: any[];
  };
}

const IntelligenceInsights: React.FC = () => {
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'patterns', label: 'Patterns', icon: <Brain className="w-4 h-4" /> },
    { id: 'predictions', label: 'Predictions', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'energy', label: 'Energy', icon: <Zap className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchIntelligenceData();
  }, []);

  const fetchIntelligenceData = async () => {
    try {
      setLoading(true);
      
      // Fetch patterns
      const patternsResponse = await fetch('/api/v1/intelligence/patterns/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(getSampleActivityData())
      });

      // Fetch productivity predictions
      const productivityResponse = await fetch('/api/v1/intelligence/predictions/productivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(getSampleProductivityData())
      });

      // Fetch energy insights
      const energyResponse = await fetch('/api/v1/intelligence/predictions/energy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(getSampleEnergyData())
      });

      // Fetch comprehensive insights
      const comprehensiveResponse = await fetch('/api/v1/intelligence/insights/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(getSampleComprehensiveData())
      });

      if (patternsResponse.ok && productivityResponse.ok && energyResponse.ok && comprehensiveResponse.ok) {
        const patterns = await patternsResponse.json();
        const productivity = await productivityResponse.json();
        const energy = await energyResponse.json();
        const comprehensive = await comprehensiveResponse.json();

        setIntelligenceData({
          patterns: patterns.patterns || [],
          productivity_predictions: productivity,
          energy_insights: energy,
          comprehensive_insights: comprehensive
        });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSampleActivityData = () => ({
    activities: [
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        productivity_score: 0.85,
        type: 'deep_work',
        duration: 120
      },
      {
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        productivity_score: 0.75,
        type: 'meetings',
        duration: 60
      }
    ]
  });

  const getSampleProductivityData = () => ({
    productivity_history: [
      {
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        score: 0.8,
        tasks_completed: 6,
        focus_time: 240,
        interruptions: 3
      },
      {
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        score: 0.75,
        tasks_completed: 5,
        focus_time: 180,
        interruptions: 4
      }
    ]
  });

  const getSampleEnergyData = () => ({
    energy_history: [
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        energy_level: 0.9,
        sleep_quality: 0.8,
        exercise: true,
        caffeine: true
      }
    ]
  });

  const getSampleComprehensiveData = () => ({
    ...getSampleActivityData(),
    ...getSampleProductivityData(),
    ...getSampleEnergyData()
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Analyzing your data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intelligence Insights</h1>
            <p className="text-gray-600">AI-powered insights into your productivity patterns</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchIntelligenceData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && intelligenceData && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <Brain className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Patterns Found</p>
                  <p className="text-2xl font-bold text-gray-900">{intelligenceData.patterns.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Predictions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {intelligenceData.productivity_predictions.predictions?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Energy Insights</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {intelligenceData.energy_insights.energy_predictions?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <Lightbulb className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {intelligenceData.comprehensive_insights.actionable_recommendations?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-4">
              {intelligenceData.comprehensive_insights.combined_insights?.key_insights?.map((insight: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
              
              {intelligenceData.comprehensive_insights.combined_insights?.opportunities?.map((opportunity: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-gray-700">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Patterns Tab */}
      {activeTab === 'patterns' && intelligenceData && (
        <div className="space-y-4">
          {intelligenceData.patterns.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No patterns detected yet. Keep using the platform to build your profile!</p>
            </div>
          ) : (
            intelligenceData.patterns.map((pattern, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {pattern.type.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">{pattern.pattern_category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(pattern.confidence)}`}>
                      {Math.round(pattern.confidence * 100)}% confidence
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(pattern.impact)}`}>
                      {pattern.impact} impact
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(pattern.data, null, 2)}
                  </pre>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Discovered: {new Date(pattern.discovered_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && intelligenceData && (
        <div className="space-y-6">
          {/* Trend Analysis */}
          {intelligenceData.productivity_predictions.trend_analysis && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Trend</h3>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  intelligenceData.productivity_predictions.trend_analysis.trend === 'improving' 
                    ? 'text-green-600 bg-green-100'
                    : intelligenceData.productivity_predictions.trend_analysis.trend === 'declining'
                    ? 'text-red-600 bg-red-100'
                    : 'text-gray-600 bg-gray-100'
                }`}>
                  {intelligenceData.productivity_predictions.trend_analysis.trend}
                </div>
                <span className="text-sm text-gray-600">
                  Confidence: {Math.round(intelligenceData.productivity_predictions.trend_analysis.confidence * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Predictions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Productivity Forecast</h3>
            <div className="space-y-3">
              {intelligenceData.productivity_predictions.predictions?.map((prediction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{prediction.day_of_week}</p>
                      <p className="text-sm text-gray-600">{new Date(prediction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {Math.round(prediction.predicted_score * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(prediction.confidence * 100)}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Energy Tab */}
      {activeTab === 'energy' && intelligenceData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Optimization</h3>
            <div className="space-y-3">
              {intelligenceData.energy_insights.scheduling_recommendations?.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && intelligenceData && (
        <div className="space-y-4">
          {intelligenceData.comprehensive_insights.actionable_recommendations?.map((rec: any, index: number) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">{rec.category?.replace(/_/g, ' ')}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    rec.priority === 'high' ? 'text-red-600 bg-red-100' :
                    rec.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-green-600 bg-green-100'
                  }`}>
                    {rec.priority} priority
                  </span>
                </div>
                <Lightbulb className="w-6 h-6 text-yellow-500" />
              </div>
              
              <p className="text-gray-700 mb-3">{rec.action}</p>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <strong>Expected Impact:</strong> {rec.expected_impact}
                </p>
              </div>
            </div>
          ))}

          {(!intelligenceData.comprehensive_insights.actionable_recommendations || 
            intelligenceData.comprehensive_insights.actionable_recommendations.length === 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No specific recommendations available yet. Keep using the platform to get personalized insights!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntelligenceInsights;