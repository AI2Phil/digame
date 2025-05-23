import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Chart, Skeleton } from '../ui/Chart';
import { dashboardService } from '../../services/dashboardService';

export default function ProductivityChart({ userId = 1 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const metrics = await dashboardService.getProductivityMetrics(userId);
        setData(metrics);
      } catch (error) {
        console.error('Error fetching productivity data:', error);
        setError('Failed to load productivity data');
        // Use mock data as fallback
        const mockData = dashboardService.getMockProductivityData();
        setData(mockData);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Productivity Patterns</h2>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                Learning
              </span>
            </div>
          </div>
          <div className="w-full h-64 flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Productivity Patterns</h2>
          </div>
          <div className="w-full h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-500 mb-2">⚠️</div>
              <p className="text-sm text-gray-600">{error}</p>
              <p className="text-xs text-gray-500 mt-1">Showing sample data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Productivity Patterns</h2>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
              Learning
            </span>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <span className="text-sm">⋯</span>
            </button>
          </div>
        </div>
        
        <div className="w-full h-64 relative">
          <Chart 
            data={data.actualData}
            secondaryData={data.predictedData}
            labels={data.labels}
            lineColor="#3b82f6"
            secondaryLineColor="#10b981"
            height={250}
          />
        </div>
        
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">Actual Productivity</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Predicted Patterns</span>
          </div>
        </div>

        {/* Summary metrics */}
        {data.summary && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(data.summary.avgProductivity)}%
                </div>
                <div className="text-xs text-gray-500">Avg Productivity</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(data.summary.totalFocusTime)}h
                </div>
                <div className="text-xs text-gray-500">Focus Time</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(data.summary.collaborationIndex * 10) / 10}
                </div>
                <div className="text-xs text-gray-500">Collaboration</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}