import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const MarketIntelligence = () => {
  const router = useRouter();
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/enterprise/market-intel');
      const data = await response.json();
      setMarketData(data.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockMarketData = {
    overview: {
      marketShare: 12.5,
      competitorCount: 8,
      growthRate: 23.7,
      marketSize: 15600000000
    },
    competitors: [
      {
        name: 'CompetitorA',
        marketShare: 28.3,
        revenue: 4400000000,
        growth: 15.2,
        strengths: ['Brand Recognition', 'Enterprise Sales', 'Global Presence'],
        weaknesses: ['Innovation Speed', 'User Experience', 'Pricing Flexibility']
      },
      {
        name: 'CompetitorB',
        marketShare: 22.1,
        revenue: 3400000000,
        growth: 18.7,
        strengths: ['Technology Stack', 'Pricing', 'Developer Tools'],
        weaknesses: ['Customer Support', 'Market Presence', 'Enterprise Features']
      },
      {
        name: 'CompetitorC',
        marketShare: 15.8,
        revenue: 2500000000,
        growth: 12.3,
        strengths: ['Specialization', 'Customer Loyalty', 'Industry Focus'],
        weaknesses: ['Scalability', 'Feature Set', 'Innovation']
      },
      {
        name: 'Our Platform',
        marketShare: 12.5,
        revenue: 1950000000,
        growth: 23.7,
        strengths: ['Innovation', 'User Experience', 'AI Integration'],
        weaknesses: ['Market Presence', 'Enterprise Sales', 'Brand Recognition']
      }
    ],
    trends: [
      {
        trend: 'AI Integration',
        impact: 'High',
        adoption: 67,
        timeframe: '6-12 months',
        description: 'Increasing demand for AI-powered features across all business functions',
        ourPosition: 'Leading'
      },
      {
        trend: 'Remote Work Tools',
        impact: 'Medium',
        adoption: 89,
        timeframe: '3-6 months',
        description: 'Continued focus on remote collaboration and productivity tools',
        ourPosition: 'Competitive'
      },
      {
        trend: 'Security Compliance',
        impact: 'High',
        adoption: 78,
        timeframe: '12-18 months',
        description: 'Stricter compliance requirements and security standards',
        ourPosition: 'Strong'
      },
      {
        trend: 'No-Code/Low-Code',
        impact: 'Medium',
        adoption: 54,
        timeframe: '9-15 months',
        description: 'Growing demand for citizen developer tools',
        ourPosition: 'Developing'
      },
      {
        trend: 'API-First Architecture',
        impact: 'High',
        adoption: 72,
        timeframe: '6-12 months',
        description: 'Emphasis on integration and ecosystem connectivity',
        ourPosition: 'Leading'
      }
    ],
    opportunities: [
      {
        opportunity: 'SMB Market Expansion',
        potential: 'High',
        investment: 'Medium',
        timeline: '9-12 months',
        expectedReturn: '25-35%',
        description: 'Untapped small and medium business segment with simplified offerings'
      },
      {
        opportunity: 'International Markets',
        potential: 'Medium',
        investment: 'High',
        timeline: '18-24 months',
        expectedReturn: '15-25%',
        description: 'Expansion into European and Asian markets'
      },
      {
        opportunity: 'Industry Verticals',
        potential: 'High',
        investment: 'Medium',
        timeline: '12-18 months',
        expectedReturn: '20-30%',
        description: 'Specialized solutions for healthcare, finance, and manufacturing'
      },
      {
        opportunity: 'AI Services Platform',
        potential: 'Very High',
        investment: 'High',
        timeline: '15-24 months',
        expectedReturn: '35-50%',
        description: 'Comprehensive AI-as-a-Service platform for enterprises'
      }
    ]
  };

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'very high':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionColor = (position) => {
    switch (position.toLowerCase()) {
      case 'leading':
        return 'bg-green-100 text-green-800';
      case 'strong':
        return 'bg-blue-100 text-blue-800';
      case 'competitive':
        return 'bg-yellow-100 text-yellow-800';
      case 'developing':
        return 'bg-orange-100 text-orange-800';
      case 'weak':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Market Intelligence"
        subtitle="Comprehensive market analysis and competitive insights"
        breadcrumbs={[
          { label: 'Enterprise', href: '/enterprise' },
          { label: 'Market Intelligence', href: '/enterprise/market-intel' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Market Share</h3>
            <div className="text-3xl font-bold text-blue-600 mt-2">{mockMarketData.overview.marketShare}%</div>
            <div className="text-sm text-gray-600 mt-1">Rank #4 in market</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Growth Rate</h3>
            <div className="text-3xl font-bold text-green-600 mt-2">{mockMarketData.overview.growthRate}%</div>
            <div className="text-sm text-gray-600 mt-1">Above market average</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Market Size</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${(mockMarketData.overview.marketSize / 1000000000).toFixed(1)}B
            </div>
            <div className="text-sm text-gray-600 mt-1">Total addressable market</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Competitors</h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">{mockMarketData.overview.competitorCount}</div>
            <div className="text-sm text-gray-600 mt-1">Major competitors tracked</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Market Overview' },
              { id: 'competitors', label: 'Competitive Analysis' },
              { id: 'trends', label: 'Market Trends' },
              { id: 'opportunities', label: 'Opportunities' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Market Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Market Share Distribution</h3>
                <div className="space-y-4">
                  {mockMarketData.competitors.map((competitor, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={competitor.name === 'Our Platform' ? 'font-medium text-blue-600' : 'text-gray-600'}>
                          {competitor.name}
                        </span>
                        <span className="font-medium">{competitor.marketShare}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            competitor.name === 'Our Platform' ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${competitor.marketShare}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Comparison</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-600">Revenue comparison chart</p>
                    <p className="text-sm text-gray-500">Competitor revenue analysis</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Market Dynamics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <h4 className="font-medium text-gray-900">Growing Market</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Market expected to grow 18% annually over next 5 years
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <h4 className="font-medium text-gray-900">Competitive Landscape</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Fragmented market with opportunities for consolidation
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🚀</div>
                  <h4 className="font-medium text-gray-900">Innovation Driver</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    AI and automation driving rapid product evolution
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Competitive Analysis Tab */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            {mockMarketData.competitors.map((competitor, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${
                    competitor.name === 'Our Platform' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {competitor.name}
                    {competitor.name === 'Our Platform' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Our Platform</span>
                    )}
                  </h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Market Share</div>
                    <div className="text-xl font-bold">{competitor.marketShare}%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <div>Revenue: ${(competitor.revenue / 1000000000).toFixed(1)}B</div>
                      <div>Growth: {competitor.growth}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                    <div className="space-y-1">
                      {competitor.strengths.map((strength, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded mr-1 mb-1">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Weaknesses</h4>
                    <div className="space-y-1">
                      {competitor.weaknesses.map((weakness, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded mr-1 mb-1">
                          {weakness}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Market Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Key Market Trends</h3>
              <div className="space-y-4">
                {mockMarketData.trends.map((trend, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{trend.trend}</h4>
                        <p className="text-sm text-gray-600 mt-1">{trend.description}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(trend.impact)}`}>
                          {trend.impact} Impact
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPositionColor(trend.ourPosition)}`}>
                          {trend.ourPosition}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Adoption Rate:</span>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${trend.adoption}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{trend.adoption}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Timeframe:</span>
                        <div className="mt-1">{trend.timeframe}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Our Position:</span>
                        <div className="mt-1">{trend.ourPosition}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Strategic Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockMarketData.opportunities.map((opportunity, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{opportunity.opportunity}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(opportunity.potential)}`}>
                        {opportunity.potential} Potential
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{opportunity.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Investment Required:</span>
                        <span className="font-medium">{opportunity.investment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Timeline:</span>
                        <span className="font-medium">{opportunity.timeline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expected Return:</span>
                        <span className="font-medium text-green-600">{opportunity.expectedReturn}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Analyze Opportunity
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketIntelligence;