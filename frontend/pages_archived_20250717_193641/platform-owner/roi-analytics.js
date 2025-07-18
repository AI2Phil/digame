import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { PieChart, TrendingUp, DollarSign, Users, Target, BarChart3 } from 'lucide-react';

export default function PlatformROIAnalytics() {
  const [roiData, setRoiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading ROI analytics data
    setTimeout(() => {
      setRoiData({
        totalROI: 245.7,
        costPerUser: 12.50,
        revenuePerUser: 89.30,
        featureAdoptionRate: 78.5,
        customerLifetimeValue: 2450,
        paybackPeriod: 8.2
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500">Platform Owner</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400">/</span>
                    <span className="ml-4 text-sm font-medium text-gray-900">ROI Analytics</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <PieChart className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform ROI Analytics</h1>
                <p className="text-gray-600 mt-1">Return on investment tracking, cost per user, feature adoption rates, and revenue attribution</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key ROI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total ROI Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Platform ROI</p>
                      <p className="text-2xl font-bold text-gray-900">{roiData.totalROI}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>15% increase from last quarter</span>
                    </div>
                  </div>
                </div>

                {/* Cost Per User Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Cost Per User</p>
                      <p className="text-2xl font-bold text-gray-900">${roiData.costPerUser}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>8% reduction this month</span>
                    </div>
                  </div>
                </div>

                {/* Revenue Per User Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revenue Per User</p>
                      <p className="text-2xl font-bold text-gray-900">${roiData.revenuePerUser}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>12% growth this quarter</span>
                    </div>
                  </div>
                </div>

                {/* Feature Adoption Rate Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Feature Adoption Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{roiData.featureAdoptionRate}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-orange-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>5% improvement this month</span>
                    </div>
                  </div>
                </div>

                {/* Customer Lifetime Value Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Customer LTV</p>
                      <p className="text-2xl font-bold text-gray-900">${roiData.customerLifetimeValue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-indigo-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>18% increase year-over-year</span>
                    </div>
                  </div>
                </div>

                {/* Payback Period Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Payback Period</p>
                      <p className="text-2xl font-bold text-gray-900">{roiData.paybackPeriod} months</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>2 months faster than target</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI Breakdown Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">ROI Breakdown by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">User Acquisition</h3>
                    <p className="text-2xl font-bold text-blue-600">185%</p>
                    <p className="text-sm text-gray-600 mt-1">ROI from new user acquisition</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Feature Development</h3>
                    <p className="text-2xl font-bold text-green-600">220%</p>
                    <p className="text-sm text-gray-600 mt-1">ROI from new feature investments</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Infrastructure</h3>
                    <p className="text-2xl font-bold text-purple-600">165%</p>
                    <p className="text-sm text-gray-600 mt-1">ROI from infrastructure scaling</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Marketing</h3>
                    <p className="text-2xl font-bold text-orange-600">195%</p>
                    <p className="text-sm text-gray-600 mt-1">ROI from marketing campaigns</p>
                  </div>
                </div>
              </div>

              {/* Revenue Attribution Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Attribution by Feature</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                      <span className="font-medium text-gray-900">AI Tools & Automation</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">$2.4M</span>
                      <span className="text-sm text-gray-600 ml-2">(32%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                      <span className="font-medium text-gray-900">Analytics & Intelligence</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">$1.8M</span>
                      <span className="text-sm text-gray-600 ml-2">(24%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                      <span className="font-medium text-gray-900">Digital Twin Platform</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">$1.5M</span>
                      <span className="text-sm text-gray-600 ml-2">(20%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                      <span className="font-medium text-gray-900">Enterprise Features</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">$1.8M</span>
                      <span className="text-sm text-gray-600 ml-2">(24%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border-2 border-dashed border-green-200">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced ROI Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">Predictive ROI modeling, automated cost optimization, real-time revenue tracking, and AI-powered investment recommendations coming soon.</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Backend Integration In Progress
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}