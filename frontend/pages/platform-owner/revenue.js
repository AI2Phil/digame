import React, { useState } from 'react';
import Head from 'next/head';
import { TrendingUp, DollarSign, CreditCard, Users, Building, Calendar, Download, Filter } from 'lucide-react';
import PageHeader from '../../src/components/navigation/PageHeader';

export default function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const revenueData = {
    overview: {
      totalRevenue: 847000,
      monthlyGrowth: 18.7,
      arr: 10164000, // Annual Recurring Revenue
      mrr: 847000, // Monthly Recurring Revenue
      churnRate: 2.3,
      ltv: 45600, // Lifetime Value
      cac: 1200, // Customer Acquisition Cost
      ltvCacRatio: 38
    },
    monthlyTrends: [
      { month: 'Jul 2023', revenue: 456000, customers: 89, arr: 5472000 },
      { month: 'Aug 2023', revenue: 523000, customers: 102, arr: 6276000 },
      { month: 'Sep 2023', revenue: 587000, customers: 115, arr: 7044000 },
      { month: 'Oct 2023', revenue: 634000, customers: 125, arr: 7608000 },
      { month: 'Nov 2023', revenue: 689000, customers: 134, arr: 8268000 },
      { month: 'Dec 2023', revenue: 723000, customers: 141, arr: 8676000 },
      { month: 'Jan 2024', revenue: 847000, customers: 147, arr: 10164000 }
    ],
    revenueByTier: [
      { tier: 'Enterprise', revenue: 456000, customers: 23, percentage: 53.8, avgRevenue: 19826 },
      { tier: 'Team', revenue: 234000, customers: 67, percentage: 27.6, avgRevenue: 3493 },
      { tier: 'Professional', revenue: 123000, customers: 45, percentage: 14.5, avgRevenue: 2733 },
      { tier: 'Free', revenue: 34000, customers: 12, percentage: 4.0, avgRevenue: 2833 }
    ],
    topTenants: [
      { name: 'Acme Corporation', revenue: 125000, tier: 'Enterprise', growth: 23.5, users: 245 },
      { name: 'Global Solutions Ltd', revenue: 89000, tier: 'Enterprise', growth: 15.2, users: 189 },
      { name: 'TechStart Inc', revenue: 24000, tier: 'Team', growth: 45.8, users: 45 },
      { name: 'DataFlow Systems', revenue: 32000, tier: 'Team', growth: 12.3, users: 67 },
      { name: 'Innovation Labs', revenue: 18000, tier: 'Professional', growth: 67.2, users: 12 }
    ],
    paymentMethods: [
      { method: 'Credit Card', percentage: 67.3, amount: 569790 },
      { method: 'Bank Transfer', percentage: 23.1, amount: 195657 },
      { method: 'PayPal', percentage: 6.8, amount: 57596 },
      { method: 'Other', percentage: 2.8, amount: 23957 }
    ],
    churnAnalysis: {
      monthlyChurn: 2.3,
      revenueChurn: 1.8,
      churnReasons: [
        { reason: 'Price sensitivity', percentage: 34.2 },
        { reason: 'Feature limitations', percentage: 28.7 },
        { reason: 'Poor onboarding', percentage: 18.5 },
        { reason: 'Competitor switch', percentage: 12.1 },
        { reason: 'Other', percentage: 6.5 }
      ]
    },
    forecasting: {
      nextMonth: 945000,
      nextQuarter: 2834000,
      confidence: 87.3,
      factors: [
        'Seasonal growth patterns',
        'Pipeline conversion rates',
        'Churn rate trends',
        'New customer acquisition'
      ]
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <>
      <Head>
        <title>Revenue Analytics - Platform Owner - Digame</title>
        <meta name="description" content="Comprehensive revenue analytics and business intelligence" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Revenue Analytics"
          subtitle="Comprehensive revenue analytics and business intelligence"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          badge="PLATFORM OWNER"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.overview.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {formatPercentage(revenueData.overview.monthlyGrowth)} from last month
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annual Recurring Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.overview.arr)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-blue-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Strong growth trajectory
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">LTV:CAC Ratio</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueData.overview.ltvCacRatio}:1</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-purple-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Excellent unit economics
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueData.overview.churnRate}%</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Below industry average
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            <div className="space-y-4">
              {revenueData.monthlyTrends.slice(-6).map((month, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{month.month}</div>
                    <div className="text-sm text-gray-600">{month.customers} customers</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatCurrency(month.revenue)}</div>
                    <div className="text-sm text-gray-600">ARR: {formatCurrency(month.arr)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue by Tier */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Subscription Tier</h3>
              <div className="space-y-4">
                {revenueData.revenueByTier.map((tier, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{tier.tier}</span>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(tier.revenue)}</div>
                        <div className="text-sm text-gray-600">{tier.customers} customers</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${tier.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{tier.percentage}% of total</span>
                      <span>Avg: {formatCurrency(tier.avgRevenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Tenants */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Revenue Tenants</h3>
              <div className="space-y-4">
                {revenueData.topTenants.map((tenant, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-600">{tenant.tier} • {tenant.users} users</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{formatCurrency(tenant.revenue)}</div>
                      <div className="text-sm text-green-600">{formatPercentage(tenant.growth)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
              <div className="space-y-4">
                {revenueData.paymentMethods.map((method, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(method.amount)}</div>
                        <div className="text-sm text-gray-600">{method.percentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${method.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Churn Analysis */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Churn Analysis</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">{revenueData.churnAnalysis.monthlyChurn}%</div>
                    <div className="text-sm text-red-700">Monthly Churn</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{revenueData.churnAnalysis.revenueChurn}%</div>
                    <div className="text-sm text-orange-700">Revenue Churn</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Churn Reasons</h4>
                  <div className="space-y-2">
                    {revenueData.churnAnalysis.churnReasons.map((reason, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{reason.reason}</span>
                        <span className="text-sm font-medium text-gray-900">{reason.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Forecasting */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">📈 Revenue Forecasting</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Next Month Projection</h4>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.forecasting.nextMonth)}</div>
                <p className="text-green-100 text-sm">Based on current trends and pipeline</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Next Quarter Projection</h4>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.forecasting.nextQuarter)}</div>
                <p className="text-green-100 text-sm">Confidence: {revenueData.forecasting.confidence}%</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Key Factors</h4>
                <ul className="text-green-100 text-sm space-y-1">
                  {revenueData.forecasting.factors.map((factor, index) => (
                    <li key={index}>• {factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}