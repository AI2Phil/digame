import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, BarChart3, LineChart, PieChart, TrendingUp, Download, Share2, Settings, Maximize2, RefreshCw, Filter } from 'lucide-react';

export default function DataVisualizationEngine() {
  const [visualizations, setVisualizations] = useState([]);
  const [selectedViz, setSelectedViz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: '30d',
    category: 'all',
    type: 'all'
  });

  useEffect(() => {
    fetchVisualizations();
  }, [filters]);

  const fetchVisualizations = async () => {
    try {
      const response = await fetch('/api/reports/visualizations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setVisualizations(result.data);
      } else {
        setVisualizations(getMockVisualizations());
      }
    } catch (error) {
      console.error('Error fetching visualizations:', error);
      setVisualizations(getMockVisualizations());
    } finally {
      setLoading(false);
    }
  };

  const getMockVisualizations = () => [
    {
      id: 1,
      title: 'User Growth Trend',
      description: 'Monthly user registration and activity trends',
      type: 'line',
      category: 'users',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'New Users',
          data: [120, 190, 300, 500, 200, 300],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }, {
          label: 'Active Users',
          data: [800, 950, 1200, 1400, 1100, 1300],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }]
      },
      lastUpdated: '2024-01-05T10:30:00Z',
      views: 1247
    },
    {
      id: 2,
      title: 'Revenue Distribution',
      description: 'Revenue breakdown by product categories',
      type: 'pie',
      category: 'finance',
      data: {
        labels: ['Subscriptions', 'One-time Purchases', 'Add-ons', 'Enterprise'],
        datasets: [{
          data: [45, 25, 15, 15],
          backgroundColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)'
          ]
        }]
      },
      lastUpdated: '2024-01-05T09:15:00Z',
      views: 892
    },
    {
      id: 3,
      title: 'Performance Metrics',
      description: 'System performance and response time metrics',
      type: 'bar',
      category: 'performance',
      data: {
        labels: ['API Response', 'Database Query', 'Page Load', 'File Upload', 'Search'],
        datasets: [{
          label: 'Average Time (ms)',
          data: [120, 45, 890, 2300, 156],
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 1
        }]
      },
      lastUpdated: '2024-01-05T08:45:00Z',
      views: 634
    },
    {
      id: 4,
      title: 'Workflow Completion Rates',
      description: 'Success rates across different workflow types',
      type: 'bar',
      category: 'workflows',
      data: {
        labels: ['Lead Generation', 'Customer Onboarding', 'Support Tickets', 'Content Publishing', 'Data Processing'],
        datasets: [{
          label: 'Success Rate (%)',
          data: [94, 87, 96, 89, 92],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        }]
      },
      lastUpdated: '2024-01-05T07:20:00Z',
      views: 445
    },
    {
      id: 5,
      title: 'Feature Usage Analytics',
      description: 'Most and least used platform features',
      type: 'horizontal-bar',
      category: 'analytics',
      data: {
        labels: ['Dashboard', 'Reports', 'Workflows', 'AI Tools', 'Integrations', 'Settings'],
        datasets: [{
          label: 'Usage Count',
          data: [2340, 1890, 1456, 1123, 890, 567],
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgb(245, 158, 11)',
          borderWidth: 1
        }]
      },
      lastUpdated: '2024-01-04T16:30:00Z',
      views: 723
    }
  ];

  const getChartIcon = (type) => {
    switch (type) {
      case 'line': return <LineChart className="w-5 h-5" />;
      case 'pie': return <PieChart className="w-5 h-5" />;
      case 'bar':
      case 'horizontal-bar': return <BarChart3 className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'users': 'bg-blue-100 text-blue-600',
      'finance': 'bg-green-100 text-green-600',
      'performance': 'bg-purple-100 text-purple-600',
      'workflows': 'bg-orange-100 text-orange-600',
      'analytics': 'bg-red-100 text-red-600'
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const exportVisualization = (viz, format) => {
    // Simulate export functionality
    console.log(`Exporting ${viz.title} as ${format}`);
    alert(`Exporting "${viz.title}" as ${format.toUpperCase()}`);
  };

  const shareVisualization = (viz) => {
    // Simulate share functionality
    const shareUrl = `${window.location.origin}/reports/visualization/${viz.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Data Visualization Engine - Digame</title>
        <meta name="description" content="Interactive data visualization and analytics dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <Link href="/reports" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Reports</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Data Visualization Engine</h1>
                <p className="text-gray-600">Interactive data visualization and analytics dashboard</p>
              </div>
            </div>
            <button 
              onClick={fetchVisualizations}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select 
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              <select 
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Categories</option>
                <option value="users">Users</option>
                <option value="finance">Finance</option>
                <option value="performance">Performance</option>
                <option value="workflows">Workflows</option>
                <option value="analytics">Analytics</option>
              </select>

              <select 
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="line">Line Charts</option>
                <option value="bar">Bar Charts</option>
                <option value="pie">Pie Charts</option>
              </select>
            </div>
          </div>

          {/* Visualization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {visualizations.map((viz) => (
              <div key={viz.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Chart Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getChartIcon(viz.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{viz.title}</h3>
                        <p className="text-sm text-gray-600">{viz.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => shareVisualization(viz)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setSelectedViz(viz)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(viz.category)}`}>
                      {viz.category}
                    </span>
                    <div className="text-xs text-gray-500">
                      {viz.views.toLocaleString()} views • {formatTimeAgo(viz.lastUpdated)}
                    </div>
                  </div>
                </div>

                {/* Chart Preview */}
                <div className="p-6">
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      {getChartIcon(viz.type)}
                      <p className="text-sm text-gray-600 mt-2">Chart Preview</p>
                      <p className="text-xs text-gray-500">
                        {viz.type === 'pie' ? 
                          `${viz.data.datasets[0].data.length} segments` :
                          `${viz.data.labels.length} data points`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => exportVisualization(viz, 'png')}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>PNG</span>
                    </button>
                    <button 
                      onClick={() => exportVisualization(viz, 'pdf')}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => exportVisualization(viz, 'csv')}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Visualizations</p>
                  <p className="text-2xl font-bold text-gray-900">{visualizations.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {visualizations.reduce((sum, viz) => sum + viz.views, 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Most Popular</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {visualizations.reduce((max, viz) => viz.views > max.views ? viz : max, visualizations[0])?.title?.split(' ')[0] || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <LineChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(visualizations.map(viz => viz.category)).size}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <PieChart className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}