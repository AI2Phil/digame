import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Progress } from '../../src/components/ui/Progress';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Filter,
  Search,
  ArrowRight,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const WorkflowOptimization = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [optimizations, setOptimizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOptimizations();
  }, [filter]);

  const fetchOptimizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflow/optimization?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOptimizations(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching optimizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyOptimization = async (optimizationId) => {
    try {
      const response = await fetch(`/api/workflow/optimization/${optimizationId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchOptimizations(); // Refresh suggestions
      }
    } catch (error) {
      console.error('Error applying optimization:', error);
    }
  };

  const mockOptimizations = [
    {
      id: 1,
      workflowId: 1,
      workflowName: 'Daily Report Generation',
      type: 'performance',
      title: 'Parallel Data Processing',
      description: 'Process analytics data in parallel instead of sequentially to reduce execution time by 45%',
      impact: 'high',
      effort: 'medium',
      category: 'performance',
      currentMetric: '180 seconds',
      optimizedMetric: '99 seconds',
      estimatedSavings: '81 seconds per run',
      potentialSavings: '$450/month',
      confidence: 0.89,
      implementation: {
        complexity: 'medium',
        estimatedTime: '4 hours',
        requirements: ['Database optimization', 'Code refactoring'],
        risks: ['Temporary performance impact during deployment']
      },
      benefits: [
        'Faster report generation',
        'Reduced server load',
        'Better user experience',
        'Cost savings on compute resources'
      ]
    },
    {
      id: 2,
      workflowId: 2,
      workflowName: 'User Onboarding',
      type: 'reliability',
      title: 'Enhanced Error Handling',
      description: 'Add comprehensive error handling and retry logic to improve success rate from 94% to 98%',
      impact: 'medium',
      effort: 'low',
      category: 'reliability',
      currentMetric: '94% success rate',
      optimizedMetric: '98% success rate',
      estimatedSavings: '4% fewer failures',
      potentialSavings: '$200/month',
      confidence: 0.92,
      implementation: {
        complexity: 'low',
        estimatedTime: '2 hours',
        requirements: ['Error logging enhancement', 'Retry mechanism'],
        risks: ['Minimal risk']
      },
      benefits: [
        'Higher success rate',
        'Better user experience',
        'Reduced support tickets',
        'Improved reliability'
      ]
    },
    {
      id: 3,
      workflowId: 3,
      workflowName: 'Email Campaign',
      type: 'efficiency',
      title: 'Smart Batching',
      description: 'Implement intelligent batching to group similar operations and reduce API calls by 60%',
      impact: 'high',
      effort: 'high',
      category: 'efficiency',
      currentMetric: '1000 API calls',
      optimizedMetric: '400 API calls',
      estimatedSavings: '600 fewer API calls',
      potentialSavings: '$300/month',
      confidence: 0.85,
      implementation: {
        complexity: 'high',
        estimatedTime: '8 hours',
        requirements: ['API redesign', 'Batch processing logic'],
        risks: ['Complexity increase', 'Testing requirements']
      },
      benefits: [
        'Reduced API costs',
        'Faster execution',
        'Better rate limit management',
        'Improved scalability'
      ]
    },
    {
      id: 4,
      workflowId: 4,
      workflowName: 'Data Backup',
      type: 'cost',
      title: 'Storage Optimization',
      description: 'Implement compression and deduplication to reduce storage costs by 40%',
      impact: 'medium',
      effort: 'medium',
      category: 'cost',
      currentMetric: '$500/month storage',
      optimizedMetric: '$300/month storage',
      estimatedSavings: '$200/month',
      potentialSavings: '$2400/year',
      confidence: 0.91,
      implementation: {
        complexity: 'medium',
        estimatedTime: '6 hours',
        requirements: ['Compression algorithms', 'Deduplication logic'],
        risks: ['Initial migration effort']
      },
      benefits: [
        'Reduced storage costs',
        'Faster backup times',
        'Better space utilization',
        'Environmental impact reduction'
      ]
    }
  ];

  const currentOptimizations = optimizations.length > 0 ? optimizations : mockOptimizations;

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'reliability': return <CheckCircle className="h-4 w-4" />;
      case 'efficiency': return <Target className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const optimizationCategories = [
    { value: 'all', label: 'All Optimizations' },
    { value: 'performance', label: 'Performance' },
    { value: 'reliability', label: 'Reliability' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'cost', label: 'Cost' }
  ];

  const filteredOptimizations = currentOptimizations.filter(opt => 
    filter === 'all' || opt.category === filter
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Workflow Optimization"
        subtitle="AI-powered suggestions to improve workflow performance, reliability, and efficiency"
        icon={<Target className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Workflow', href: '/workflow' },
          { label: 'Optimization', href: '/workflow/optimization' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchOptimizations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'suggestions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lightbulb className="h-4 w-4 inline mr-2" />
          Suggestions
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          History
        </button>
      </div>

      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {optimizationCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Suggestions</p>
                    <p className="text-2xl font-bold">{filteredOptimizations.length}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                    <p className="text-2xl font-bold text-green-600">$950</p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Impact</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredOptimizations.filter(o => o.impact === 'high').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(filteredOptimizations.reduce((acc, o) => acc + o.confidence, 0) / filteredOptimizations.length * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Suggestions */}
          <div className="space-y-4">
            {filteredOptimizations.map((optimization) => (
              <Card key={optimization.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getTypeIcon(optimization.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium">{optimization.title}</h3>
                          <Badge variant={getImpactColor(optimization.impact)}>
                            {optimization.impact} impact
                          </Badge>
                          <Badge variant={getEffortColor(optimization.effort)}>
                            {optimization.effort} effort
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(optimization.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{optimization.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Workflow:</span>
                            <p className="font-medium">{optimization.workflowName}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Current:</span>
                            <p className="font-medium">{optimization.currentMetric}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Optimized:</span>
                            <p className="font-medium text-green-600">{optimization.optimizedMetric}</p>
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Benefits:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {optimization.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Implementation Details */}
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <h4 className="font-medium mb-2">Implementation:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Complexity:</span>
                              <span className="ml-2 font-medium capitalize">{optimization.implementation.complexity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Estimated Time:</span>
                              <span className="ml-2 font-medium">{optimization.implementation.estimatedTime}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <span className="text-gray-500">Requirements:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {optimization.implementation.requirements.map((req, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Savings Highlight */}
                        <div className="bg-green-50 p-3 rounded-lg mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-green-800 font-medium">Estimated Savings:</span>
                              <p className="text-green-700">{optimization.estimatedSavings}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-green-800 font-medium">Potential Value:</span>
                              <p className="text-green-700 font-bold">{optimization.potentialSavings}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyOptimization(optimization.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                      <Button variant="outline" size="sm">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Optimization Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Optimizations Applied</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Savings</p>
                    <p className="text-2xl font-bold text-green-600">$4,200</p>
                    <p className="text-xs text-gray-500">this month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Performance Gain</p>
                    <p className="text-2xl font-bold text-blue-600">+34%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold text-purple-600">127h</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Optimization Impact by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationCategories.slice(1).map((category) => {
                  const categoryData = {
                    performance: { applied: 8, savings: 1200, impact: 45 },
                    reliability: { applied: 6, savings: 800, impact: 25 },
                    efficiency: { applied: 5, savings: 1500, impact: 35 },
                    cost: { applied: 4, savings: 700, impact: 20 }
                  };
                  
                  const data = categoryData[category.value] || { applied: 0, savings: 0, impact: 0 };
                  
                  return (
                    <div key={category.value} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{category.label}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">{data.applied} applied</span>
                          <span className="text-xs text-gray-500 ml-2">${data.savings} saved</span>
                        </div>
                      </div>
                      <Progress value={data.impact} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {data.impact}% performance improvement
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Optimization History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Parallel Data Processing', workflow: 'Daily Reports', applied: '2 hours ago', savings: '$150/month' },
                { title: 'Enhanced Error Handling', workflow: 'User Onboarding', applied: '1 day ago', savings: '4% reliability' },
                { title: 'API Call Batching', workflow: 'Email Campaign', applied: '3 days ago', savings: '$200/month' },
                { title: 'Database Query Optimization', workflow: 'Analytics', applied: '1 week ago', savings: '50% faster' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.workflow} • {item.applied}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Applied</Badge>
                    <p className="text-sm text-green-600 mt-1">{item.savings}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowOptimization;