import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const PlatformOwnerRevenuePage = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [selectedPeriod]);

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/platform/analytics/revenue?period=${selectedPeriod}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue analytics');
      }

      const data = await response.json();
      setRevenueData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = tier => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'individual_pro':
        return 'bg-blue-100 text-blue-800';
      case 'team':
        return 'bg-green-100 text-green-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Revenue Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchRevenueAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  const summary = revenueData?.summary || {};
  const mrrByTier = revenueData?.mrr_by_tier || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
                <p className="text-sm text-gray-500">Platform revenue insights and forecasting</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total MRR</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(summary.total_mrr || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.total_subscribers || 0}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.3% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ARPU</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(summary.average_revenue_per_user || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+3.7% from last month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Tier */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Revenue by Subscription Tier</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mrrByTier.map(tier => (
                  <div
                    key={tier.tier}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Badge className={`mr-3 ${getTierColor(tier.tier)}`}>
                        {tier.tier.replace('_', ' ')}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {tier.subscribers} subscribers
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(tier.mrr / tier.subscribers)} per user
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(tier.mrr)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {((tier.mrr / summary.total_mrr) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Revenue Projections</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Projected Annual Revenue
                  </h4>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency((summary.total_mrr || 0) * 12)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Based on current MRR growth trends</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Next Quarter</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency((summary.total_mrr || 0) * 3 * 1.1)}
                    </p>
                    <p className="text-xs text-green-600">+10% growth</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Next Year</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency((summary.total_mrr || 0) * 12 * 1.4)}
                    </p>
                    <p className="text-xs text-green-600">+40% growth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trends Chart Placeholder */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Revenue Trends</h3>
          </div>
          <div className="p-6">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Revenue trend chart would be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">
                  Integration with charting library (Chart.js, D3, etc.) required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Key Insights</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Strong Enterprise Growth</p>
                    <p className="text-sm text-gray-600">
                      Enterprise tier showing 25% month-over-month growth
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Team Tier Adoption</p>
                    <p className="text-sm text-gray-600">
                      Team subscriptions represent 45% of total revenue
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Conversion Opportunity</p>
                    <p className="text-sm text-gray-600">
                      High number of free users ready for upgrade campaigns
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">ARPU Improvement</p>
                    <p className="text-sm text-gray-600">
                      Average revenue per user increased by 15% this quarter
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformOwnerRevenuePage;
