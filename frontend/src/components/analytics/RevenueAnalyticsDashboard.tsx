import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  AlertTriangle, Target, Calendar, Download,
  RefreshCw, Filter, Eye, BarChart3, PieChart,
  Activity, Zap, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface RevenueMetrics {
  current_mrr: number;
  mrr_growth_rate: number;
  arr: number;
  churn_rate: number;
  ltv: number;
  cac: number;
  ltv_cac_ratio: number;
  revenue_per_user: number;
  total_customers: number;
  active_customers: number;
  new_customers_this_month: number;
  churned_customers_this_month: number;
}

interface RevenuePrediction {
  period: string;
  predicted_revenue: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  factors: Array<{
    name: string;
    impact: number;
    confidence: number;
  }>;
}

interface ChurnAnalysis {
  overall_churn_rate: number;
  churn_by_segment: Array<{
    segment: string;
    churn_rate: number;
    customer_count: number;
  }>;
  churn_reasons: Array<{
    reason: string;
    percentage: number;
  }>;
  at_risk_customers: Array<{
    customer_id: string;
    risk_score: number;
    predicted_churn_date: string;
    factors: string[];
  }>;
}

interface AnomalyDetection {
  anomalies: Array<{
    metric: string;
    value: number;
    expected_value: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
    detected_at: string;
    description: string;
  }>;
  trend_changes: Array<{
    metric: string;
    change_type: 'increase' | 'decrease' | 'volatility';
    magnitude: number;
    detected_at: string;
  }>;
}

export const RevenueAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [predictions, setPredictions] = useState<RevenuePrediction[]>([]);
  const [churnAnalysis, setChurnAnalysis] = useState<ChurnAnalysis | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('3m');
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'churn' | 'anomalies'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [metricsRes, predictionsRes, churnRes, anomaliesRes] = await Promise.all([
        fetch(`/api/analytics/revenue/metrics?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/analytics/revenue/predictions?periods=12`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/analytics/churn/analysis`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/analytics/anomalies?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (predictionsRes.ok) {
        const predictionsData = await predictionsRes.json();
        setPredictions(predictionsData.predictions || []);
      }

      if (churnRes.ok) {
        const churnData = await churnRes.json();
        setChurnAnalysis(churnData);
      }

      if (anomaliesRes.ok) {
        const anomaliesData = await anomaliesRes.json();
        setAnomalies(anomaliesData);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getMetricTrend = (value: number) => {
    if (value > 0) return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' };
    if (value < 0) return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' };
    return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const revenuePredictionChart = {
    labels: predictions.map(p => p.period),
    datasets: [
      {
        label: 'Predicted Revenue',
        data: predictions.map(p => p.predicted_revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Upper Confidence',
        data: predictions.map(p => p.confidence_interval.upper),
        borderColor: 'rgba(59, 130, 246, 0.3)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        pointRadius: 0,
      },
      {
        label: 'Lower Confidence',
        data: predictions.map(p => p.confidence_interval.lower),
        borderColor: 'rgba(59, 130, 246, 0.3)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        pointRadius: 0,
      }
    ]
  };

  const churnBySegmentChart = {
    labels: churnAnalysis?.churn_by_segment.map(s => s.segment) || [],
    datasets: [
      {
        data: churnAnalysis?.churn_by_segment.map(s => s.churn_rate * 100) || [],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
        }
      },
      y: {
        display: true,
        title: {
          display: true,
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Revenue Analytics
          </h1>
          <p className="text-gray-600 mt-1">Advanced revenue insights and predictions</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'predictions', label: 'Predictions', icon: Target },
            { key: 'churn', label: 'Churn Analysis', icon: Users },
            { key: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Monthly Recurring Revenue',
                value: formatCurrency(metrics.current_mrr),
                change: metrics.mrr_growth_rate,
                icon: DollarSign,
              },
              {
                title: 'Annual Recurring Revenue',
                value: formatCurrency(metrics.arr),
                change: metrics.mrr_growth_rate * 12,
                icon: TrendingUp,
              },
              {
                title: 'Customer LTV',
                value: formatCurrency(metrics.ltv),
                change: 0,
                icon: Users,
              },
              {
                title: 'LTV/CAC Ratio',
                value: `${metrics.ltv_cac_ratio.toFixed(1)}:1`,
                change: 0,
                icon: Target,
              },
            ].map((metric, index) => {
              const trend = getMetricTrend(metric.change);
              const TrendIcon = trend.icon;
              
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        {metric.change !== 0 && (
                          <div className="flex items-center mt-1">
                            <TrendIcon className={`h-4 w-4 mr-1 ${trend.color}`} />
                            <span className={`text-sm ${trend.color}`}>
                              {formatPercentage(Math.abs(metric.change))}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`p-3 rounded-full ${trend.bg}`}>
                        <metric.icon className={`h-6 w-6 ${trend.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Customers</span>
                  <span className="font-medium">{metrics.total_customers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Customers</span>
                  <span className="font-medium">{metrics.active_customers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">New This Month</span>
                  <span className="font-medium text-green-600">+{metrics.new_customers_this_month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Churned This Month</span>
                  <span className="font-medium text-red-600">-{metrics.churned_customers_this_month}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue per User</span>
                  <span className="font-medium">{formatCurrency(metrics.revenue_per_user)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer LTV</span>
                  <span className="font-medium">{formatCurrency(metrics.ltv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer CAC</span>
                  <span className="font-medium">{formatCurrency(metrics.cac)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Churn Rate</span>
                  <span className="font-medium text-red-600">{formatPercentage(metrics.churn_rate)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round((metrics.ltv_cac_ratio / 3) * 100)}
                  </div>
                  <p className="text-sm text-gray-600">Overall Health</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min((metrics.ltv_cac_ratio / 3) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={revenuePredictionChart} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions[0]?.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              factor.impact > 0 ? 'bg-green-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.abs(factor.impact) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          factor.impact > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.slice(0, 6).map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{prediction.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(prediction.predicted_revenue)}
                        </span>
                        <Badge 
                          variant={
                            (prediction.confidence_interval.upper - prediction.confidence_interval.lower) / prediction.predicted_revenue < 0.2 
                              ? 'success' 
                              : 'warning'
                          }
                          size="sm"
                          icon={null}
                          onRemove={() => {}}
                        >
                          {(((prediction.predicted_revenue - prediction.confidence_interval.lower) / prediction.predicted_revenue) * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Churn Analysis Tab */}
      {activeTab === 'churn' && churnAnalysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Churn Rate by Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Doughnut data={churnBySegmentChart} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {churnAnalysis.churn_reasons.map((reason, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{reason.reason}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${reason.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {reason.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>At-Risk Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Customer</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Risk Score</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Predicted Churn</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Risk Factors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {churnAnalysis.at_risk_customers.slice(0, 10).map((customer, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 text-sm font-medium text-gray-900">
                          {customer.customer_id}
                        </td>
                        <td className="py-3">
                          <Badge 
                            variant={customer.risk_score > 0.7 ? 'error' : customer.risk_score > 0.4 ? 'warning' : 'success'}
                            size="sm"
                            icon={null}
                            onRemove={() => {}}
                          >
                            {(customer.risk_score * 100).toFixed(0)}%
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(customer.predicted_churn_date).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {customer.factors.slice(0, 3).map((factor, i) => (
                              <Badge 
                                key={i} 
                                variant="outline" 
                                size="xs"
                                icon={null}
                                onRemove={() => {}}
                              >
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && anomalies && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detected Anomalies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {anomalies.anomalies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No anomalies detected</p>
                    </div>
                  ) : (
                    anomalies.anomalies.map((anomaly, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{anomaly.metric}</h4>
                          <Badge 
                            variant={anomaly.severity === 'high' ? 'error' : anomaly.severity === 'medium' ? 'warning' : 'info'}
                            size="sm"
                            icon={null}
                            onRemove={() => {}}
                          >
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{anomaly.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Actual: {anomaly.value.toFixed(2)} | Expected: {anomaly.expected_value.toFixed(2)}
                          </span>
                          <span>{new Date(anomaly.detected_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {anomalies.trend_changes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No trend changes detected</p>
                    </div>
                  ) : (
                    anomalies.trend_changes.map((change, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{change.metric}</h4>
                          <div className="flex items-center gap-1">
                            {change.change_type === 'increase' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : change.change_type === 'decrease' ? (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            ) : (
                              <Activity className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className="text-sm font-medium">
                              {change.magnitude.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(change.detected_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RevenueAnalyticsDashboard;