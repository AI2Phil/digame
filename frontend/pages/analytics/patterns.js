import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Target, TrendingUp, Users, Clock, Zap, ArrowRight, Activity } from 'lucide-react';

export default function PatternRecognition() {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/patterns');
      
      if (response.ok) {
        const data = await response.json();
        setPatterns(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthColor = (growth) => {
    const value = parseFloat(growth.replace('%', '').replace('+', ''));
    if (value > 20) return 'text-green-600';
    if (value > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  return (
    <>
      <Head>
        <title>Pattern Recognition - Digame</title>
        <meta name="description" content="AI-powered pattern recognition and user behavior analysis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Pattern Recognition</h1>
                  <p className="text-gray-600">AI-powered pattern discovery and behavior analysis</p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <Zap className="w-3 h-3 mr-1" />
                    AI-POWERED
                  </span>
                </div>
              </div>
              
              <button
                onClick={fetchPatterns}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Refresh Analysis
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : patterns ? (
            <>
              {/* User Journey Patterns */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Common User Journey Patterns</h3>
                <div className="space-y-4">
                  {patterns.userJourney.commonPaths.map((path, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-medium text-sm">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          {path.path.split(' → ').map((step, stepIndex) => (
                            <React.Fragment key={stepIndex}>
                              <span className="px-2 py-1 bg-white rounded border">{step}</span>
                              {stepIndex < path.path.split(' → ').length - 1 && (
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{path.frequency}%</div>
                        <div className="text-xs text-gray-500">of users</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dropoff Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dropoff Points Analysis</h3>
                  <div className="space-y-4">
                    {patterns.userJourney.dropoffPoints.map((dropoff, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium text-red-900">{dropoff.step}</div>
                          <div className="text-sm text-red-700">High abandonment rate</div>
                        </div>
                        <div className="text-red-900 font-bold">{dropoff.rate}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Temporal Patterns</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Peak Hours</h4>
                      <div className="flex flex-wrap gap-2">
                        {patterns.temporalPatterns.peakHours.map((hour) => (
                          <span key={hour} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {hour}:00
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Peak Days</h4>
                      <div className="flex flex-wrap gap-2">
                        {patterns.temporalPatterns.peakDays.map((day) => (
                          <span key={day} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Seasonality Insights</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>📅 {patterns.temporalPatterns.seasonality.monthly}</div>
                        <div>📊 {patterns.temporalPatterns.seasonality.weekly}</div>
                        <div>🕐 {patterns.temporalPatterns.seasonality.daily}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Usage Patterns */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Feature Usage Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-700 mb-4 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Trending Features
                    </h4>
                    <div className="space-y-3">
                      {patterns.featureUsage.trending.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium text-green-900">{feature.feature}</div>
                            <div className="text-sm text-green-700">{feature.adoption}% adoption</div>
                          </div>
                          <div className={`font-bold ${getGrowthColor(feature.growth)}`}>
                            {feature.growth}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-700 mb-4 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Declining Features
                    </h4>
                    <div className="space-y-3">
                      {patterns.featureUsage.declining.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <div className="font-medium text-red-900">{feature.feature}</div>
                            <div className="text-sm text-red-700">{feature.usage}% usage</div>
                          </div>
                          <div className="text-red-600 font-bold">{feature.decline}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pattern Insights */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 text-white mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  <Target className="w-6 h-6 inline mr-2" />
                  Key Pattern Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <h4 className="font-medium mb-2">🎯 User Flow Optimization</h4>
                    <p className="text-sm text-emerald-100">
                      Most successful users follow the Login → Dashboard → Tasks → Profile pattern. 
                      Consider promoting this flow in onboarding.
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <h4 className="font-medium mb-2">⏰ Timing Optimization</h4>
                    <p className="text-sm text-emerald-100">
                      Peak engagement occurs Tuesday-Thursday, 9-11 AM. 
                      Schedule important features and notifications during these windows.
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <h4 className="font-medium mb-2">🚀 Feature Adoption</h4>
                    <p className="text-sm text-emerald-100">
                      AI Tools show highest growth (+45%). 
                      Consider expanding AI features and improving discoverability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pattern Visualization */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pattern Visualization</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Interactive pattern visualization and heatmaps will be rendered here</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Failed to load pattern analysis. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}