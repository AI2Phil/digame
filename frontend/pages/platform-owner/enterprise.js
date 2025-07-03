import React, { useState } from 'react';
import Head from 'next/head';
import { Building2, TrendingUp, Globe, Users, DollarSign, BarChart3, Target, Zap, Crown, Shield, Settings, Plus } from 'lucide-react';
import PageHeader from '../../src/components/navigation/PageHeader';

export default function EnterpriseFeatures() {
  const [activeTab, setActiveTab] = useState('console');
  const [selectedTenant, setSelectedTenant] = useState('all');

  const enterpriseStats = {
    totalTenants: 156,
    enterpriseClients: 23,
    totalRevenue: 2847392,
    marketShare: 12.4,
    growthRate: 34.2,
    churnRate: 2.1
  };

  const tenantOverview = [
    {
      id: 1,
      name: 'Acme Corporation',
      tier: 'Enterprise',
      users: 2847,
      revenue: 89400,
      growth: 23.5,
      health: 'excellent',
      lastActivity: '2024-01-30T15:30:00Z',
      features: ['SSO', 'Custom Branding', 'API Access', 'Priority Support']
    },
    {
      id: 2,
      name: 'TechStart Inc',
      tier: 'Professional',
      users: 456,
      revenue: 12800,
      growth: 45.2,
      health: 'good',
      lastActivity: '2024-01-30T14:15:00Z',
      features: ['API Access', 'Advanced Analytics']
    },
    {
      id: 3,
      name: 'Global Solutions Ltd',
      tier: 'Enterprise',
      users: 5234,
      revenue: 156700,
      growth: 12.8,
      health: 'excellent',
      lastActivity: '2024-01-30T16:45:00Z',
      features: ['SSO', 'Custom Branding', 'API Access', 'Priority Support', 'White Label']
    },
    {
      id: 4,
      name: 'Innovation Hub',
      tier: 'Professional',
      users: 234,
      revenue: 8900,
      growth: -5.2,
      health: 'at-risk',
      lastActivity: '2024-01-28T10:30:00Z',
      features: ['API Access']
    }
  ];

  const marketIntelligence = {
    competitors: [
      {
        name: 'CompetitorA',
        marketShare: 28.5,
        pricing: '$49/user',
        features: 85,
        customerSat: 4.2,
        trend: 'up'
      },
      {
        name: 'CompetitorB',
        marketShare: 22.1,
        pricing: '$39/user',
        features: 72,
        customerSat: 3.9,
        trend: 'down'
      },
      {
        name: 'CompetitorC',
        marketShare: 15.8,
        pricing: '$59/user',
        features: 94,
        customerSat: 4.5,
        trend: 'up'
      }
    ],
    industryTrends: [
      {
        trend: 'AI Integration',
        adoption: 78,
        impact: 'high',
        timeframe: 'Q2 2024'
      },
      {
        trend: 'Mobile-First Design',
        adoption: 92,
        impact: 'medium',
        timeframe: 'Current'
      },
      {
        trend: 'Zero-Trust Security',
        adoption: 45,
        impact: 'high',
        timeframe: 'Q3 2024'
      },
      {
        trend: 'Low-Code Platforms',
        adoption: 34,
        impact: 'medium',
        timeframe: 'Q4 2024'
      }
    ],
    opportunities: [
      {
        id: 1,
        title: 'Enterprise AI Features',
        potential: 'High',
        revenue: '$450K',
        effort: 'Medium',
        timeline: '6 months'
      },
      {
        id: 2,
        title: 'Mobile App Platform',
        potential: 'Medium',
        revenue: '$280K',
        effort: 'High',
        timeline: '9 months'
      },
      {
        id: 3,
        title: 'Advanced Security Suite',
        potential: 'High',
        revenue: '$380K',
        effort: 'Medium',
        timeline: '4 months'
      }
    ]
  };

  const enterpriseFeatures = [
    {
      id: 1,
      name: 'White Label Solution',
      description: 'Complete branding customization for enterprise clients',
      status: 'active',
      usage: 89,
      clients: 12
    },
    {
      id: 2,
      name: 'Advanced SSO',
      description: 'Enterprise-grade single sign-on with SAML/OIDC',
      status: 'active',
      usage: 95,
      clients: 18
    },
    {
      id: 3,
      name: 'Custom Integrations',
      description: 'Bespoke API integrations for enterprise workflows',
      status: 'active',
      usage: 67,
      clients: 8
    },
    {
      id: 4,
      name: 'Dedicated Support',
      description: '24/7 priority support with dedicated account managers',
      status: 'active',
      usage: 100,
      clients: 23
    },
    {
      id: 5,
      name: 'Advanced Analytics',
      description: 'Deep business intelligence and custom reporting',
      status: 'beta',
      usage: 45,
      clients: 5
    },
    {
      id: 6,
      name: 'Multi-Region Deployment',
      description: 'Geographic data residency and compliance',
      status: 'development',
      usage: 0,
      clients: 0
    }
  ];

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'beta': return 'text-blue-600 bg-blue-100';
      case 'development': return 'text-yellow-600 bg-yellow-100';
      case 'deprecated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPotentialColor = (potential) => {
    switch (potential.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→';
  };

  return (
    <>
      <Head>
        <title>Enterprise Features - Platform Owner - Digame</title>
        <meta name="description" content="Enterprise features and market intelligence for platform owners" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Enterprise Features"
          subtitle="Enterprise features and market intelligence for platform owners"
          icon={<Crown className="w-6 h-6 text-yellow-600" />}
          badge="PLATFORM OWNER"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'console', label: 'Multi-Tenant Console', icon: Building2 },
                  { id: 'features', label: 'Enterprise Features', icon: Crown },
                  { id: 'intelligence', label: 'Market Intelligence', icon: TrendingUp },
                  { id: 'opportunities', label: 'Growth Opportunities', icon: Target }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Multi-Tenant Console Tab */}
          {activeTab === 'console' && (
            <div className="space-y-8">
              {/* Enterprise Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Total Tenants</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{enterpriseStats.totalTenants}</div>
                  <div className="text-sm text-gray-600">{enterpriseStats.enterpriseClients} enterprise</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Total Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">${enterpriseStats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Monthly recurring</div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Growth Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{enterpriseStats.growthRate}%</div>
                  <div className="text-sm text-gray-600">Year over year</div>
                </div>
              </div>

              {/* Tenant Filter */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Filter by tier:</span>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="all">All Tenants</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Professional">Professional</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>
              </div>

              {/* Tenant Overview */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Tenant Overview</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {tenantOverview
                    .filter(tenant => selectedTenant === 'all' || tenant.tier === selectedTenant)
                    .map((tenant) => (
                    <div key={tenant.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{tenant.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-600">{tenant.tier}</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(tenant.health)}`}>
                                {tenant.health}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Users</span>
                          <div className="text-lg font-semibold text-gray-900">{tenant.users.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Monthly Revenue</span>
                          <div className="text-lg font-semibold text-green-600">${tenant.revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Growth</span>
                          <div className={`text-lg font-semibold ${tenant.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tenant.growth >= 0 ? '+' : ''}{tenant.growth}%
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Last Activity</span>
                          <div className="text-sm text-gray-900">{new Date(tenant.lastActivity).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-gray-600">Features:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {tenant.features.map((feature) => (
                            <span key={feature} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enterprise Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Enterprise Features</h3>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                    Add Feature
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {enterpriseFeatures.map((feature) => (
                    <div key={feature.id} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{feature.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                          {feature.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Usage Rate</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full" 
                                style={{ width: `${feature.usage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{feature.usage}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Active Clients</span>
                          <div className="text-lg font-semibold text-gray-900">{feature.clients}</div>
                        </div>
                        <div className="flex items-end">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Market Intelligence Tab */}
          {activeTab === 'intelligence' && (
            <div className="space-y-8">
              {/* Competitor Analysis */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Competitor Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {marketIntelligence.competitors.map((competitor, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                        <span className="text-lg">{getTrendIcon(competitor.trend)}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Market Share</span>
                          <span className="font-medium">{competitor.marketShare}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pricing</span>
                          <span className="font-medium">{competitor.pricing}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Features</span>
                          <span className="font-medium">{competitor.features}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer Sat.</span>
                          <span className="font-medium">{competitor.customerSat}/5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industry Trends */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Industry Trends</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {marketIntelligence.industryTrends.map((trend, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{trend.trend}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          trend.impact === 'high' ? 'text-red-600 bg-red-100' : 'text-yellow-600 bg-yellow-100'
                        }`}>
                          {trend.impact} impact
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Adoption Rate</span>
                          <span className="font-medium">{trend.adoption}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${trend.adoption}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">Timeline: {trend.timeframe}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Growth Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Growth Opportunities</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {marketIntelligence.opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">Estimated timeline: {opportunity.timeline}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPotentialColor(opportunity.potential)}`}>
                          {opportunity.potential} Potential
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Revenue Potential</span>
                          <div className="text-lg font-semibold text-green-600">{opportunity.revenue}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Development Effort</span>
                          <div className="text-lg font-semibold text-gray-900">{opportunity.effort}</div>
                        </div>
                        <div className="flex items-end">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                            Create Project
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}