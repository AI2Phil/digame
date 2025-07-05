import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Eye, TrendingUp, Brain, Zap, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchPredictions();
  }, [timeframe]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/predictive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: ['userGrowth', 'engagement', 'churn'],
          timeframe,
          confidence: 0.8
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <>
      <Head>
        <title>Predictive Analytics - Digame</title>
        <meta name="description" content="AI-powered predictive analytics and forecasting" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Predictive Analytics"
          subtitle="AI-powered forecasting and trend prediction"
          badge="AI-POWERED"
        />
        
        <div className="container mx-auto px-4 py-8">
          {/* Controls */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="1y">1 Year</option>
                </select>
                <button
                  onClick={fetchPredictions}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Refresh Predictions
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : predictions ? (
            <>
              {/* Prediction Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getConfidenceColor(predictions.userGrowth.confidence)}`}>
                      {Math.round(predictions.userGrowth.confidence * 100)}% confidence
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${getPredictionColor(predictions.userGrowth.predicted)}`}>
                    {predictions.userGrowth.predicted > 0 ? '+' : ''}{predictions.userGrowth.predicted}%
                  </h3>
                  <p className="text-gray-600 text-sm">Predicted User Growth</p>
                  <div className="mt-3 text-xs text-gray-500">
                    Next {predictions.userGrowth.timeframe}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getConfidenceColor(predictions.engagement.confidence)}`}>
                      {Math.round(predictions.engagement.confidence * 100)}% confidence
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${getPredictionColor(predictions.engagement.predicted)}`}>
                    {predictions.engagement.predicted > 0 ? '+' : ''}{predictions.engagement.predicted}%
                  </h3>
                  <p className="text-gray-600 text-sm">Engagement Change</p>
                  <div className="mt-3 text-xs text-gray-500">
                    Next {predictions.engagement.timeframe}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getConfidenceColor(predictions.churn.confidence)}`}>
                      {Math.round(predictions.churn.confidence * 100)}% confidence
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${getPredictionColor(predictions.churn.predicted)}`}>
                    {predictions.churn.predicted > 0 ? '+' : ''}{predictions.churn.predicted}%
                  </h3>
                  <p className="text-gray-600 text-sm">Churn Rate Change</p>
                  <div className="mt-3 text-xs text-gray-500">
                    Next {predictions.churn.timeframe}
                  </div>
                </div>
              </div>

              {/* Prediction Factors */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Factors</h3>
                  <div className="space-y-3">
                    {predictions.userGrowth.factors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Factors</h3>
                  <div className="space-y-3">
                    {predictions.engagement.factors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Factors</h3>
                  <div className="space-y-3">
                    {predictions.churn.factors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  <Brain className="w-6 h-6 inline mr-2" />
                  AI Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {predictions.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-500' : 
                          rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}>
                          {rec.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="text-xs text-purple-200">
                          {rec.effort.toUpperCase()} EFFORT
                        </span>
                      </div>
                      <h4 className="font-medium mb-2">{rec.action}</h4>
                      <p className="text-sm text-purple-100">{rec.impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prediction Visualization */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Timeline</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Interactive prediction timeline chart will be rendered here</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Failed to load predictions. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}