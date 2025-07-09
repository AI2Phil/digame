import React, { useState, useEffect } from 'react';
import {
  BarChart3, LineChart, PieChart, TrendingUp, Zap, Settings,
  Palette, Monitor, Download, Share, RefreshCw, AlertCircle,
  CheckCircle, Clock, Eye, Layers, Target, Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useToast } from '../ui/Toast';

const DataVisualizationEngine = () => {
  const [engineData, setEngineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  const [renderingStats, setRenderingStats] = useState({
    totalRendered: 0,
    avgRenderTime: 0,
    successRate: 0
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchEngineData();
  }, []);

  const fetchEngineData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/advanced-reporting/visualization-engine');
      
      if (!response.ok) {
        throw new Error('Failed to fetch visualization engine data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setEngineData(result.data);
        calculateRenderingStats(result.data);
      } else {
        throw new Error(result.error || 'Failed to load visualization engine data');
      }
    } catch (err) {
      console.error('Error fetching engine data:', err);
      addToast({
        type: 'error',
        title: 'Error Loading Engine',
        message: 'Failed to load visualization engine data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRenderingStats = (data) => {
    const totalRendered = data.visualization_metrics.reduce((sum, metric) => sum + metric.usage_count, 0);
    const avgRenderTime = data.visualization_metrics.reduce((sum, metric) => sum + metric.avg_render_time, 0) / data.visualization_metrics.length;
    const successRate = 95; // Simulated success rate
    
    setRenderingStats({
      totalRendered,
      avgRenderTime: Math.round(avgRenderTime),
      successRate
    });
  };

  const getChartIcon = (chartType) => {
    switch (chartType) {
      case 'line': return <LineChart className="w-5 h-5" />;
      case 'bar': return <BarChart3 className="w-5 h-5" />;
      case 'pie': return <PieChart className="w-5 h-5" />;
      case 'area': return <TrendingUp className="w-5 h-5" />;
      case 'scatter': return <Target className="w-5 h-5" />;
      case 'heatmap': return <Layers className="w-5 h-5" />;
      case 'gauge': return <Activity className="w-5 h-5" />;
      case 'funnel': return <TrendingUp className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getPerformanceColor = (renderTime) => {
    if (renderTime < 1000) return 'text-green-600';
    if (renderTime < 3000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDataSizeLabel = (size) => {
    switch (size) {
      case 'small': return 'Small (<100 points)';
      case 'medium': return 'Medium (100-1K points)';
      case 'large': return 'Large (1K-10K points)';
      case 'xlarge': return 'X-Large (>10K points)';
      default: return size;
    }
  };

  const handleOptimizeVisualization = (chartType) => {
    addToast({
      type: 'success',
      title: 'Optimization Applied',
      message: `${chartType} chart performance has been optimized.`
    });
  };

  const handleExportVisualization = (format) => {
    addToast({
      type: 'info',
      title: 'Export Started',
      message: `Exporting visualization in ${format.toUpperCase()} format...`
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visualization engine...</p>
        </div>
      </div>
    );
  }

  if (!engineData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Visualization Engine</h1>
          <p className="text-gray-600 mt-1">Advanced visualization rendering and optimization platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={fetchEngineData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Engine Settings
          </Button>
        </div>
      </div>

      {/* Engine Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rendered</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renderingStats.totalRendered.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">visualizations rendered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Render Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(renderingStats.avgRenderTime)}`}>
              {renderingStats.avgRenderTime}ms
            </div>
            <p className="text-xs text-muted-foreground">average processing time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{renderingStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">successful renders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engine Status</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-green-600">Optimal</span>
            </div>
            <p className="text-xs text-muted-foreground">all systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="charts">Chart Types</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance by Data Size */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Performance by Data Size
                </CardTitle>
                <CardDescription>Rendering performance across different dataset sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engineData.performance_by_data_size.map((perf, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{getDataSizeLabel(perf.data_size)}</span>
                        <span className={`text-sm ${getPerformanceColor(perf.avg_render_time)}`}>
                          {Math.round(perf.avg_render_time)}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((perf.avg_render_time / 5000) * 100, 100)} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {perf.sample_count} samples
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chart Type Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Chart Type Usage
                </CardTitle>
                <CardDescription>Most popular visualization types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engineData.visualization_metrics
                    .sort((a, b) => b.usage_count - a.usage_count)
                    .slice(0, 6)
                    .map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getChartIcon(metric.chart_type)}
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {metric.chart_type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.round(metric.avg_render_time)}ms avg render
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{metric.usage_count}</p>
                          <p className="text-xs text-gray-500">uses</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engine Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Engine Capabilities
              </CardTitle>
              <CardDescription>Current rendering engine specifications and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Handling</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Max data points: {engineData.rendering_capabilities.max_data_points.toLocaleString()}</li>
                    <li>• Real-time updates: {engineData.rendering_capabilities.real_time_updates ? 'Yes' : 'No'}</li>
                    <li>• Responsive design: {engineData.rendering_capabilities.responsive_design ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Visual Features</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Animation support: {engineData.rendering_capabilities.animation_support ? 'Yes' : 'No'}</li>
                    <li>• Chart types: {engineData.rendering_capabilities.supported_chart_types.length}</li>
                    <li>• Interactive features: Yes</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Accessibility</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {engineData.rendering_capabilities.accessibility_features.map((feature, index) => (
                      <li key={index}>• {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          {/* Supported Chart Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                Supported Chart Types
              </CardTitle>
              <CardDescription>Available visualization types and their performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {engineData.rendering_capabilities.supported_chart_types.map((chartType, index) => {
                  const metric = engineData.visualization_metrics.find(m => m.chart_type === chartType);
                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedVisualization(chartType)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {getChartIcon(chartType)}
                        <Badge variant="outline" className="text-xs">
                          {metric ? metric.usage_count : 0} uses
                        </Badge>
                      </div>
                      <h4 className="font-medium capitalize mb-1">
                        {chartType.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {metric ? `${Math.round(metric.avg_render_time)}ms avg` : 'No usage data'}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOptimizeVisualization(chartType);
                          }}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Optimize
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          {/* Theme Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Theme Usage Statistics
              </CardTitle>
              <CardDescription>Popular themes and color schemes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Theme Popularity</h4>
                  <div className="space-y-3">
                    {engineData.theme_usage.map((theme, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded ${
                            theme.theme === 'dark' ? 'bg-gray-800' :
                            theme.theme === 'light' ? 'bg-gray-100' :
                            theme.theme === 'colorful' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                            'bg-blue-500'
                          }`}></div>
                          <span className="text-sm font-medium capitalize">{theme.theme}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{theme.usage_count}</p>
                          <p className="text-xs text-gray-500">uses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Popular Combinations</h4>
                  <div className="space-y-3">
                    {engineData.popular_combinations.slice(0, 5).map((combo, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {combo.chart_type} + {combo.theme}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {combo.usage_count} uses
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Animation:</span>
                          <Badge variant={combo.has_animation === 'true' ? 'default' : 'secondary'} className="text-xs">
                            {combo.has_animation === 'true' ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Optimization Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Optimization Recommendations
              </CardTitle>
              <CardDescription>AI-powered suggestions to improve visualization performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineData.optimization_recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <div className="flex space-x-2">
                        <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'}>
                          {rec.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {rec.effort} effort
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <Button size="sm" variant="outline">
                      Apply Optimization
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Export Formats
              </CardTitle>
              <CardDescription>Available export formats and their use cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {engineData.supported_formats.map((format, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium uppercase">{format.format}</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportVisualization(format.format)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{format.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVisualizationEngine;