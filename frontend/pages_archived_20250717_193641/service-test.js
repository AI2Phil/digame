import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Info } from 'lucide-react';
import serviceDiscovery from '../utils/serviceDiscovery';
import api from '../utils/api';

export default function ServiceTest() {
  const [serviceInfo, setServiceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState([]);

  const discoverService = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await serviceDiscovery.discoverBackendService();
      setServiceInfo(info);
      
      // Test the connection
      const response = await api.get('/health');
      if (response.ok) {
        const healthData = await response.json();
        setTestResults([
          { test: 'Service Discovery', status: 'success', message: `Found backend on port ${info.port}` },
          { test: 'Health Check', status: 'success', message: `Backend is ${healthData.status}` },
          { test: 'API Connection', status: 'success', message: 'Successfully connected to backend' }
        ]);
      } else {
        setTestResults([
          { test: 'Service Discovery', status: 'success', message: `Found backend on port ${info.port}` },
          { test: 'Health Check', status: 'error', message: 'Backend health check failed' }
        ]);
      }
    } catch (err) {
      setError(err.message);
      setTestResults([
        { test: 'Service Discovery', status: 'error', message: err.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    serviceDiscovery.clearCache();
    setServiceInfo(null);
    setTestResults([]);
    setError(null);
  };

  useEffect(() => {
    discoverService();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dynamic Service Discovery Test</h1>
            <div className="flex space-x-2">
              <button
                onClick={clearCache}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Cache
              </button>
              <button
                onClick={discoverService}
                disabled={loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Discovering...' : 'Rediscover'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {serviceInfo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Discovered Backend Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-blue-700">URL:</span>
                  <p className="text-blue-900">{serviceInfo.url}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Port:</span>
                  <p className="text-blue-900">{serviceInfo.port}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Status:</span>
                  <p className="text-blue-900">{serviceInfo.status}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Discovered At:</span>
                  <p className="text-blue-900">{new Date(serviceInfo.discoveredAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h3>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-3" />
                    )}
                    <div>
                      <span className="font-medium text-gray-900">{result.test}:</span>
                      <span className={`ml-2 ${result.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">How Dynamic Service Discovery Works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Frontend automatically scans common ports (4000, 8001, 8000, 3001, 5000)</li>
                  <li>Checks each port for the backend service using the /service-info endpoint</li>
                  <li>Caches the discovered service information for 30 seconds</li>
                  <li>Falls back to localStorage cache if service is temporarily unavailable</li>
                  <li>Automatically retries connection on API failures</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}