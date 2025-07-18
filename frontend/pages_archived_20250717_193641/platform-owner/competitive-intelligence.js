import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Radar, TrendingUp, Target, BarChart3, Users, DollarSign } from 'lucide-react';

export default function CompetitiveIntelligenceHub() {
  const [competitiveData, setCompetitiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading competitive intelligence data
    setTimeout(() => {
      setCompetitiveData({
        marketPosition: 'Leader',
        competitorCount: 12,
        marketShare: 23.5,
        featureAdvantage: 85,
        pricingPosition: 'Competitive',
        customerSentiment: 4.2
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
                    <span className="ml-4 text-sm font-medium text-gray-900">Competitive Intelligence</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <Radar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Competitive Intelligence Hub</h1>
                <p className="text-gray-600 mt-1">Market positioning, competitive analysis, feature comparison, and market trends</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Market Position Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Target className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Market Position</p>
                    <p className="text-2xl font-bold text-gray-900">{competitiveData.marketPosition}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>Maintained leadership position</span>
                  </div>
                </div>
              </div>

              {/* Market Share Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Market Share</p>
                    <p className="text-2xl font-bold text-gray-900">{competitiveData.marketShare}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-blue-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>2.3% growth this quarter</span>
                  </div>
                </div>
              </div>

              {/* Competitor Count Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Competitors</p>
                    <p className="text-2xl font-bold text-gray-900">{competitiveData.competitorCount}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-orange-600">
                    <Target className="w-4 h-4 mr-1" />
                    <span>3 new entrants this quarter</span>
                  </div>
                </div>
              </div>

              {/* Feature Advantage Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Feature Advantage</p>
                    <p className="text-2xl font-bold text-gray-900">{competitiveData.featureAdvantage}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-purple-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>Leading in AI capabilities</span>
                  </div>
                </div>
              </div>

              {/* Pricing Position Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pricing Position</p>
                    <p className="text-2xl font-bold text-gray-900">{competitiveData.pricingPosition}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <Target className="w-4 h-4 mr-1" />
                    <span>Optimal value proposition</span>
                  </div>
                </div>
              </div>

              {/* Customer Sentiment Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-indigo-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Customer Sentiment</p>
                    <p className="text-2xl font-bold text-gray-900">{competitiveData.customerSentiment}/5.0</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-indigo-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>Above industry average</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Competitive Analysis Section */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Competitive Analysis Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Key Strengths</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Advanced AI and machine learning capabilities
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Comprehensive platform integration
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Superior user experience design
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Strong enterprise security features
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Market Opportunities</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Expanding into emerging markets
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    SMB market penetration
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Industry-specific solutions
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Mobile-first platform development
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow p-6 border-2 border-dashed border-purple-200">
            <div className="text-center">
              <Radar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Competitive Intelligence</h3>
              <p className="text-sm text-gray-600 mb-4">Real-time competitor monitoring, automated market analysis, pricing intelligence, and strategic recommendations coming soon.</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Backend Integration In Progress
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}