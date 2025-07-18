import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
    // Set up real-time updates
    const interval = setInterval(fetchAnomalies, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/anomalies');

      if (response.ok) {
        const data = await response.json();
        setAnomalies(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = severity => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = severity => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = type => {
    switch (type) {
      case 'traffic_spike':
        return <TrendingUp className="w-5 h-5" />;
      case 'performance_drop':
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleString();
  };

  const getDeviationColor = deviation => {
    if (deviation > 150) return 'text-red-600';
    if (deviation > 100) return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <>
      <Head>
        <title>Anomaly Detection - Digame</title>
        <meta name="description" content="Real-time anomaly detection and system monitoring" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Anomaly Detection</h1>
                  <p className="text-gray-600">Real-time anomaly detection and system monitoring</p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Zap className="w-3 h-3 mr-1" />
                    REAL-TIME
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live Monitoring</span>
                </div>
                <button
                  onClick={fetchAnomalies}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : anomalies ? (
            <>
              {/* Anomaly Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {anomalies.summary.total}
                  </h3>
                  <p className="text-gray-600 text-sm">Total Anomalies</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-red-600 mb-1">{anomalies.summary.high}</h3>
                  <p className="text-gray-600 text-sm">High Severity</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-600 mb-1">
                    {anomalies.summary.medium}
                  </h3>
                  <p className="text-gray-600 text-sm">Medium Severity</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-1">
                    {anomalies.summary.resolved}
                  </h3>
                  <p className="text-gray-600 text-sm">Resolved</p>
                </div>
              </div>

              {/* Active Anomalies */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Anomalies</h3>
                {anomalies.detected.length > 0 ? (
                  <div className="space-y-4">
                    {anomalies.detected.map(anomaly => (
                      <div
                        key={anomaly.id}
                        className={`border rounded-lg p-4 ${getSeverityColor(anomaly.severity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                anomaly.severity === 'high'
                                  ? 'bg-red-200'
                                  : anomaly.severity === 'medium'
                                    ? 'bg-yellow-200'
                                    : 'bg-blue-200'
                              }`}
                            >
                              {getTypeIcon(anomaly.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold">{anomaly.description}</h4>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}
                                >
                                  {getSeverityIcon(anomaly.severity)}
                                  <span className="ml-1">{anomaly.severity.toUpperCase()}</span>
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Metric:</span>
                                  <div className="font-medium">{anomaly.metric}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Current Value:</span>
                                  <div className="font-medium">{anomaly.value}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Expected:</span>
                                  <div className="font-medium">{anomaly.expected}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Deviation:</span>
                                  <div
                                    className={`font-medium ${getDeviationColor(anomaly.deviation)}`}
                                  >
                                    +{anomaly.deviation}%
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                Detected: {formatTimestamp(anomaly.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                              Investigate
                            </button>
                            <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
                              Acknowledge
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No active anomalies detected</p>
                    <p className="text-sm text-gray-500">All systems operating normally</p>
                  </div>
                )}
              </div>

              {/* Detection Thresholds */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Detection Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                      Traffic Anomalies
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Warning:</span>
                        <span className="font-medium">
                          {anomalies.thresholds.traffic.warning}% above normal
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Critical:</span>
                        <span className="font-medium text-red-600">
                          {anomalies.thresholds.traffic.critical}% above normal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                      Performance Anomalies
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Warning:</span>
                        <span className="font-medium">
                          {anomalies.thresholds.performance.warning}% slower
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Critical:</span>
                        <span className="font-medium text-red-600">
                          {anomalies.thresholds.performance.critical}% slower
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                      Error Rate Anomalies
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Warning:</span>
                        <span className="font-medium">
                          {anomalies.thresholds.errors.warning}% above baseline
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Critical:</span>
                        <span className="font-medium text-red-600">
                          {anomalies.thresholds.errors.critical}% above baseline
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anomaly Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Anomaly Timeline</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">
                    Real-time anomaly detection timeline will be rendered here
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Failed to load anomaly data. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
