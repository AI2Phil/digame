import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { BarChart3, TrendingUp, Server, Zap, DollarSign, AlertTriangle } from 'lucide-react';

export default function CapacityPlanningCenter() {
  const [capacityData, setCapacityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading capacity planning data
    setTimeout(() => {
      setCapacityData({
        currentUtilization: 73.5,
        projectedGrowth: 25.8,
        costOptimization: 18.2,
        resourceEfficiency: 87.3,
        scalingRecommendations: 4,
        forecastAccuracy: 94.1
      });
      setLoading(false);
    }, 1000);
  }, []);

  const resourceMetrics = [
    {
      resource: 'CPU Cores',
      current: 240,
      utilized: 176,
      projected: 298,
      recommendation: 'Scale up by 25%',
      cost: '$2,400/month',
      efficiency: 73.3
    },
    {
      resource: 'Memory (GB)',
      current: 1024,
      utilized: 768,
      projected: 1280,
      recommendation: 'Scale up by 20%',
      cost: '$1,800/month',
      efficiency: 75.0
    },
    {
      resource: 'Storage (TB)',
      current: 50,
      utilized: 38,
      projected: 65,
      recommendation: 'Scale up by 30%',
      cost: '$1,200/month',
      efficiency: 76.0
    },
    {
      resource: 'Network (Gbps)',
      current: 100,
      utilized: 72,
      projected: 125,
      recommendation: 'Scale up by 25%',
      cost: '$800/month',
      efficiency: 72.0
    }
  ];

  const growthProjections = [
    {
      timeframe: 'Next 30 Days',
      userGrowth: '8.5%',
      resourceNeed: '12%',
      estimatedCost: '$15,200',
      confidence: 'High'
    },
    {
      timeframe: 'Next 90 Days',
      userGrowth: '22.3%',
      resourceNeed: '28%',
      estimatedCost: '$42,800',
      confidence: 'High'
    },
    {
      timeframe: 'Next 6 Months',
      userGrowth: '45.7%',
      resourceNeed: '55%',
      estimatedCost: '$89,500',
      confidence: 'Medium'
    },
    {
      timeframe: 'Next 12 Months',
      userGrowth: '78.2%',
      resourceNeed: '95%',
      estimatedCost: '$156,000',
      confidence: 'Medium'
    }
  ];

  const optimizationOpportunities = [
    {
      opportunity: 'Auto-scaling Optimization',
      potentialSavings: '$8,400/month',
      implementation: 'Medium',
      impact: 'High',
      description: 'Implement intelligent auto-scaling based on usage patterns'
    },
    {
      opportunity: 'Resource Right-sizing',
      potentialSavings: '$5,200/month',
      implementation: 'Low',
      impact: 'Medium',
      description: 'Optimize instance sizes based on actual usage data'
    },
    {
      opportunity: 'Reserved Instance Planning',
      potentialSavings: '$12,600/month',
      implementation: 'Low',
      impact: 'High',
      description: 'Purchase reserved instances for predictable workloads'
    },
    {
      opportunity: 'Storage Tiering',
      potentialSavings: '$3,800/month',
      implementation: 'Medium',
      impact: 'Medium',
      description: 'Implement automated storage tiering for cost optimization'
    }
  ];

  const alerts = [
    {
      type: 'Warning',
      message: 'CPU utilization approaching 80% threshold',
      action: 'Consider scaling up within 2 weeks',
      priority: 'Medium'
    },
    {
      type: 'Info',
      message: 'Storage growth rate exceeding projections',
      action: 'Review storage optimization strategies',
      priority: 'Low'
    },
    {
      type: 'Critical',
      message: 'Memory utilization spike detected',
      action: 'Immediate scaling recommended',
      priority: 'High'
    }
  ];

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
                    <span className="ml-4 text-sm font-medium text-gray-900">Capacity Planning</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Capacity Planning Center</h1>
                <p className="text-gray-600 mt-1">Resource forecasting, growth projections, capacity management, and cost optimization</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Capacity Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Current Utilization Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Server className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Current Utilization</p>
                      <p className="text-2xl font-bold text-gray-900">{capacityData.currentUtilization}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-blue-600">
                      <Server className="w-4 h-4 mr-1" />
                      <span>Optimal range: 70-85%</span>
                    </div>
                  </div>
                </div>

                {/* Projected Growth Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Projected Growth</p>
                      <p className="text-2xl font-bold text-gray-900">{capacityData.projectedGrowth}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Next 6 months</span>
                    </div>
                  </div>
                </div>

                {/* Cost Optimization Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Cost Optimization</p>
                      <p className="text-2xl font-bold text-gray-900">{capacityData.costOptimization}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-purple-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>Potential savings identified</span>
                    </div>
                  </div>
                </div>

                {/* Resource Efficiency Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Zap className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Resource Efficiency</p>
                      <p className="text-2xl font-bold text-gray-900">{capacityData.resourceEfficiency}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-orange-600">
                      <Zap className="w-4 h-4 mr-1" />
                      <span>Above industry average</span>
                    </div>
                  </div>
                </div>

                {/* Scaling Recommendations Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Recommendations</p>
                      <p className="text-2xl font-bold text-gray-900">{capacityData.scalingRecommendations}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span>Require attention</span>
                    </div>
                  </div>
                </div>

                {/* Forecast Accuracy Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Forecast Accuracy</p>
                      <p className="text-2xl font-bold text-gray-900">{capacityData.forecastAccuracy}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-indigo-600">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      <span>High confidence predictions</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Utilization Analysis */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Resource Utilization Analysis</h2>
                <div className="space-y-4">
                  {resourceMetrics.map((resource, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Server className="w-6 h-6 text-blue-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{resource.resource}</h3>
                            <p className="text-sm text-gray-600">{resource.recommendation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{resource.efficiency}%</p>
                          <p className="text-sm text-gray-600">Efficiency</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Current Capacity</p>
                          <p className="font-medium text-gray-900">{resource.current.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Currently Used</p>
                          <p className="font-medium text-gray-900">{resource.utilized.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Projected Need</p>
                          <p className="font-medium text-gray-900">{resource.projected.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estimated Cost</p>
                          <p className="font-medium text-gray-900">{resource.cost}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Utilization</span>
                          <span>{((resource.utilized / resource.current) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (resource.utilized / resource.current) > 0.8 ? 'bg-red-500' :
                              (resource.utilized / resource.current) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(resource.utilized / resource.current) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Projections */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Growth Projections & Forecasting</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {growthProjections.map((projection, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{projection.timeframe}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          projection.confidence === 'High' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {projection.confidence} Confidence
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">User Growth</p>
                          <p className="text-lg font-bold text-blue-600">{projection.userGrowth}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Resource Need</p>
                          <p className="text-lg font-bold text-orange-600">{projection.resourceNeed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Est. Cost</p>
                          <p className="text-lg font-bold text-green-600">{projection.estimatedCost}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Opportunities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Cost Optimization Opportunities</h2>
                <div className="space-y-4">
                  {optimizationOpportunities.map((opportunity, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{opportunity.opportunity}</h3>
                          <p className="text-sm text-gray-600">{opportunity.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{opportunity.potentialSavings}</p>
                          <p className="text-sm text-gray-600">Potential Savings</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            opportunity.implementation === 'Low' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {opportunity.implementation} Implementation
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            opportunity.impact === 'High' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {opportunity.impact} Impact
                          </span>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Implement
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capacity Alerts */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Capacity Alerts & Recommendations</h2>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`border-l-4 p-4 rounded-lg ${
                      alert.type === 'Critical' ? 'border-red-500 bg-red-50' :
                      alert.type === 'Warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className={`w-5 h-5 mr-3 ${
                            alert.type === 'Critical' ? 'text-red-600' :
                            alert.type === 'Warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{alert.message}</p>
                            <p className="text-sm text-gray-600">{alert.action}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.priority === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : alert.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.priority} Priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border-2 border-dashed border-green-200">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Capacity Intelligence</h3>
                  <p className="text-sm text-gray-600 mb-4">AI-powered capacity prediction, automated scaling recommendations, intelligent cost optimization, and predictive resource allocation coming soon.</p>
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