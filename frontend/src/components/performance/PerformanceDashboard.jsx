import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { 
  Activity, 
  Zap, 
  Eye, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    lcp: { value: 0, rating: 'good', trend: 0 },
    fid: { value: 0, rating: 'good', trend: 0 },
    cls: { value: 0, rating: 'good', trend: 0 },
    fcp: { value: 0, rating: 'good', trend: 0 },
    ttfb: { value: 0, rating: 'good', trend: 0 }
  });

  const [performanceScore, setPerformanceScore] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Simulate loading performance data
    // In a real app, this would fetch from your analytics API
    const loadPerformanceData = () => {
      const mockMetrics = {
        lcp: { 
          value: Math.random() * 4000 + 1000, 
          rating: Math.random() > 0.7 ? 'poor' : Math.random() > 0.4 ? 'needs-improvement' : 'good',
          trend: (Math.random() - 0.5) * 20
        },
        fid: { 
          value: Math.random() * 200 + 50, 
          rating: Math.random() > 0.8 ? 'poor' : Math.random() > 0.5 ? 'needs-improvement' : 'good',
          trend: (Math.random() - 0.5) * 15
        },
        cls: { 
          value: Math.random() * 0.3, 
          rating: Math.random() > 0.7 ? 'poor' : Math.random() > 0.4 ? 'needs-improvement' : 'good',
          trend: (Math.random() - 0.5) * 0.1
        },
        fcp: { 
          value: Math.random() * 3000 + 800, 
          rating: Math.random() > 0.6 ? 'poor' : Math.random() > 0.3 ? 'needs-improvement' : 'good',
          trend: (Math.random() - 0.5) * 25
        },
        ttfb: { 
          value: Math.random() * 1500 + 200, 
          rating: Math.random() > 0.7 ? 'poor' : Math.random() > 0.4 ? 'needs-improvement' : 'good',
          trend: (Math.random() - 0.5) * 30
        }
      };

      setMetrics(mockMetrics);

      // Calculate overall performance score
      const scores = Object.values(mockMetrics).map(metric => {
        switch (metric.rating) {
          case 'good': return 90;
          case 'needs-improvement': return 70;
          case 'poor': return 40;
          default: return 50;
        }
      });
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      setPerformanceScore(avgScore);

      // Generate recommendations
      const newRecommendations = [];
      Object.entries(mockMetrics).forEach(([key, metric]) => {
        if (metric.rating === 'poor') {
          newRecommendations.push(getRecommendation(key, metric.rating));
        }
      });
      setRecommendations(newRecommendations);
    };

    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getRecommendation = (metricName, rating) => {
    const recommendations = {
      lcp: 'Optimize Largest Contentful Paint by compressing images and using a CDN',
      fid: 'Improve First Input Delay by reducing JavaScript execution time',
      cls: 'Fix Cumulative Layout Shift by adding size attributes to images',
      fcp: 'Enhance First Contentful Paint by eliminating render-blocking resources',
      ttfb: 'Reduce Time to First Byte by optimizing server response times'
    };
    return recommendations[metricName] || 'Optimize this metric for better performance';
  };

  const getMetricIcon = (metricName) => {
    const icons = {
      lcp: Eye,
      fid: Zap,
      cls: Activity,
      fcp: BarChart3,
      ttfb: Clock
    };
    return icons[metricName] || Activity;
  };

  const getMetricName = (key) => {
    const names = {
      lcp: 'Largest Contentful Paint',
      fid: 'First Input Delay',
      cls: 'Cumulative Layout Shift',
      fcp: 'First Contentful Paint',
      ttfb: 'Time to First Byte'
    };
    return names[key] || key.toUpperCase();
  };

  const getMetricValue = (key, value) => {
    if (key === 'cls') {
      return value.toFixed(3);
    }
    return Math.round(value) + 'ms';
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Core Web Vitals Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>
                {Math.round(performanceScore)}
              </div>
              <div className="text-sm text-gray-600">Overall Performance Score</div>
            </div>
            <div className="w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={performanceScore >= 90 ? '#10b981' : performanceScore >= 70 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${performanceScore}, 100`}
                />
              </svg>
            </div>
          </div>
          <Progress value={performanceScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Core Web Vitals Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(metrics).map(([key, metric]) => {
          const Icon = getMetricIcon(key);
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <Badge 
                    variant={metric.rating === 'good' ? 'success' : metric.rating === 'needs-improvement' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {metric.rating}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {getMetricValue(key, metric.value)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getMetricName(key)}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {metric.trend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    )}
                    <span className={metric.trend > 0 ? 'text-red-500' : 'text-green-500'}>
                      {Math.abs(metric.trend).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-800">{recommendation}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Performance Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Loading Performance</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use next-gen image formats (WebP, AVIF)</li>
                <li>• Implement lazy loading for images</li>
                <li>• Preload critical resources</li>
                <li>• Use a Content Delivery Network (CDN)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Runtime Performance</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Minimize JavaScript execution time</li>
                <li>• Use code splitting and lazy loading</li>
                <li>• Optimize CSS delivery</li>
                <li>• Avoid layout thrashing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;