import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, Download, Save, Eye, Settings, Filter, 
  Calendar, BarChart3, PieChart, LineChart, Table,
  Database, Users, DollarSign, TrendingUp, Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { useToast } from './ui/Toast';
import DataVisualizationEngine from './DataVisualizationEngine';
import enhancedApiService from '../services/enhancedApiService';

const CustomReportBuilder = ({ onSave, onCancel, existingReport = null }) => {
  const { toast } = useToast();
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    dataSource: 'analytics',
    dateRange: '30d',
    filters: [],
    metrics: [],
    dimensions: [],
    visualizations: [],
    schedule: null,
    recipients: []
  });
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  // Initialize with existing report if provided
  useEffect(() => {
    if (existingReport) {
      setReportConfig(existingReport);
    }
  }, [existingReport]);

  // Available data sources
  const dataSources = [
    { id: 'analytics', name: 'Analytics Data', icon: BarChart3 },
    { id: 'users', name: 'User Data', icon: Users },
    { id: 'revenue', name: 'Revenue Data', icon: DollarSign },
    { id: 'performance', name: 'Performance Data', icon: TrendingUp },
    { id: 'engagement', name: 'Engagement Data', icon: Activity }
  ];

  // Available metrics by data source
  const availableMetrics = {
    analytics: [
      { id: 'pageViews', name: 'Page Views', type: 'number' },
      { id: 'sessions', name: 'Sessions', type: 'number' },
      { id: 'bounceRate', name: 'Bounce Rate', type: 'percentage' },
      { id: 'avgSessionDuration', name: 'Avg Session Duration', type: 'duration' },
      { id: 'conversionRate', name: 'Conversion Rate', type: 'percentage' }
    ],
    users: [
      { id: 'totalUsers', name: 'Total Users', type: 'number' },
      { id: 'newUsers', name: 'New Users', type: 'number' },
      { id: 'activeUsers', name: 'Active Users', type: 'number' },
      { id: 'churnRate', name: 'Churn Rate', type: 'percentage' },
      { id: 'retentionRate', name: 'Retention Rate', type: 'percentage' }
    ],
    revenue: [
      { id: 'totalRevenue', name: 'Total Revenue', type: 'currency' },
      { id: 'mrr', name: 'Monthly Recurring Revenue', type: 'currency' },
      { id: 'arpu', name: 'Average Revenue Per User', type: 'currency' },
      { id: 'ltv', name: 'Lifetime Value', type: 'currency' },
      { id: 'cac', name: 'Customer Acquisition Cost', type: 'currency' }
    ],
    performance: [
      { id: 'responseTime', name: 'Response Time', type: 'duration' },
      { id: 'uptime', name: 'Uptime', type: 'percentage' },
      { id: 'errorRate', name: 'Error Rate', type: 'percentage' },
      { id: 'throughput', name: 'Throughput', type: 'number' },
      { id: 'cpuUsage', name: 'CPU Usage', type: 'percentage' }
    ],
    engagement: [
      { id: 'clickThroughRate', name: 'Click Through Rate', type: 'percentage' },
      { id: 'timeOnPage', name: 'Time on Page', type: 'duration' },
      { id: 'scrollDepth', name: 'Scroll Depth', type: 'percentage' },
      { id: 'interactionRate', name: 'Interaction Rate', type: 'percentage' },
      { id: 'shareRate', name: 'Share Rate', type: 'percentage' }
    ]
  };

  // Available dimensions
  const availableDimensions = [
    { id: 'date', name: 'Date', type: 'date' },
    { id: 'userType', name: 'User Type', type: 'category' },
    { id: 'region', name: 'Region', type: 'category' },
    { id: 'device', name: 'Device Type', type: 'category' },
    { id: 'source', name: 'Traffic Source', type: 'category' },
    { id: 'page', name: 'Page', type: 'category' },
    { id: 'campaign', name: 'Campaign', type: 'category' }
  ];

  // Visualization types
  const visualizationTypes = [
    { id: 'line', name: 'Line Chart', icon: LineChart },
    { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
    { id: 'pie', name: 'Pie Chart', icon: PieChart },
    { id: 'table', name: 'Data Table', icon: Table },
    { id: 'area', name: 'Area Chart', icon: Activity },
    { id: 'composed', name: 'Composed Chart', icon: TrendingUp }
  ];

  const handleConfigChange = useCallback((field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const addMetric = useCallback((metric) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: [...prev.metrics, metric]
    }));
  }, []);

  const removeMetric = useCallback((metricId) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev.metrics.filter(m => m.id !== metricId)
    }));
  }, []);

  const addDimension = useCallback((dimension) => {
    setReportConfig(prev => ({
      ...prev,
      dimensions: [...prev.dimensions, dimension]
    }));
  }, []);

  const removeDimension = useCallback((dimensionId) => {
    setReportConfig(prev => ({
      ...prev,
      dimensions: prev.dimensions.filter(d => d.id !== dimensionId)
    }));
  }, []);

  const addVisualization = useCallback((vizType) => {
    const newViz = {
      id: Date.now(),
      type: vizType,
      title: `${vizType.charAt(0).toUpperCase() + vizType.slice(1)} Chart`,
      metrics: [],
      dimensions: []
    };
    
    setReportConfig(prev => ({
      ...prev,
      visualizations: [...prev.visualizations, newViz]
    }));
  }, []);

  const removeVisualization = useCallback((vizId) => {
    setReportConfig(prev => ({
      ...prev,
      visualizations: prev.visualizations.filter(v => v.id !== vizId)
    }));
  }, []);

  const addFilter = useCallback(() => {
    const newFilter = {
      id: Date.now(),
      field: '',
      operator: 'equals',
      value: ''
    };
    
    setReportConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
  }, []);

  const removeFilter = useCallback((filterId) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId)
    }));
  }, []);

  const updateFilter = useCallback((filterId, field, value) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.map(f => 
        f.id === filterId ? { ...f, [field]: value } : f
      )
    }));
  }, []);

  const generatePreview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await enhancedApiService.generateReportPreview(reportConfig);
      setPreviewData(data || generateMockPreviewData());
      setActiveTab('preview');
      toast.success('Preview generated successfully');
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreviewData(generateMockPreviewData());
      setActiveTab('preview');
      toast.info('Using mock data for preview');
    } finally {
      setLoading(false);
    }
  }, [reportConfig, toast]);

  const saveReport = useCallback(async () => {
    if (!reportConfig.name.trim()) {
      toast.error('Please enter a report name');
      return;
    }

    if (reportConfig.metrics.length === 0) {
      toast.error('Please select at least one metric');
      return;
    }

    setLoading(true);
    try {
      const savedReport = await enhancedApiService.saveCustomReport(reportConfig);
      toast.success('Report saved successfully');
      onSave?.(savedReport);
    } catch (error) {
      console.error('Failed to save report:', error);
      toast.error('Failed to save report');
    } finally {
      setLoading(false);
    }
  }, [reportConfig, onSave, toast]);

  const generateMockPreviewData = () => [
    { name: 'Jan', value1: 4000, value2: 2400, value3: 2400 },
    { name: 'Feb', value1: 3000, value2: 1398, value3: 2210 },
    { name: 'Mar', value1: 2000, value2: 9800, value3: 2290 },
    { name: 'Apr', value1: 2780, value2: 3908, value3: 2000 },
    { name: 'May', value1: 1890, value2: 4800, value3: 2181 },
    { name: 'Jun', value1: 2390, value2: 3800, value3: 2500 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Custom Report Builder</h1>
        <p className="text-gray-600">Create custom reports with advanced analytics and visualizations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="metrics">Metrics & Dimensions</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Basic report settings and data source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Report Name</label>
                  <input
                    type="text"
                    value={reportConfig.name}
                    onChange={(e) => handleConfigChange('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter report name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <select
                    value={reportConfig.dateRange}
                    onChange={(e) => handleConfigChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={reportConfig.description}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Enter report description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data Source</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {dataSources.map(source => (
                    <button
                      key={source.id}
                      onClick={() => handleConfigChange('dataSource', source.id)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        reportConfig.dataSource === source.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <source.icon className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">{source.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">Filters</label>
                  <Button onClick={addFilter} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Filter
                  </Button>
                </div>
                
                {reportConfig.filters.map(filter => (
                  <div key={filter.id} className="flex items-center gap-3 mb-2">
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select field</option>
                      {availableDimensions.map(dim => (
                        <option key={dim.id} value={dim.id}>{dim.name}</option>
                      ))}
                    </select>
                    
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater">Greater than</option>
                      <option value="less">Less than</option>
                    </select>
                    
                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                      className="px-3 py-2 border rounded-lg flex-1"
                      placeholder="Filter value"
                    />
                    
                    <Button
                      onClick={() => removeFilter(filter.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics & Dimensions Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Available Metrics</CardTitle>
                <CardDescription>Select metrics to include in your report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(availableMetrics[reportConfig.dataSource] || []).map(metric => (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-gray-500">{metric.type}</div>
                      </div>
                      <Button
                        onClick={() => addMetric(metric)}
                        size="sm"
                        disabled={reportConfig.metrics.some(m => m.id === metric.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Metrics</CardTitle>
                <CardDescription>Metrics included in your report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportConfig.metrics.map(metric => (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
                    >
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-gray-500">{metric.type}</div>
                      </div>
                      <Button
                        onClick={() => removeMetric(metric.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {reportConfig.metrics.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No metrics selected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dimensions */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensions</CardTitle>
              <CardDescription>Select dimensions to group and filter your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {availableDimensions.map(dimension => (
                  <button
                    key={dimension.id}
                    onClick={() => addDimension(dimension)}
                    disabled={reportConfig.dimensions.some(d => d.id === dimension.id)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      reportConfig.dimensions.some(d => d.id === dimension.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{dimension.name}</div>
                    <div className="text-sm text-gray-500">{dimension.type}</div>
                  </button>
                ))}
              </div>
              
              {reportConfig.dimensions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Dimensions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {reportConfig.dimensions.map(dimension => (
                      <Badge
                        key={dimension.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {dimension.name}
                        <button
                          onClick={() => removeDimension(dimension.id)}
                          className="ml-1 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualizations</CardTitle>
              <CardDescription>Add charts and visualizations to your report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                {visualizationTypes.map(vizType => (
                  <button
                    key={vizType.id}
                    onClick={() => addVisualization(vizType.id)}
                    className="p-3 border rounded-lg text-center hover:border-gray-300 transition-colors"
                  >
                    <vizType.icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">{vizType.name}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {reportConfig.visualizations.map(viz => (
                  <div key={viz.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={viz.title}
                        onChange={(e) => {
                          setReportConfig(prev => ({
                            ...prev,
                            visualizations: prev.visualizations.map(v =>
                              v.id === viz.id ? { ...v, title: e.target.value } : v
                            )
                          }));
                        }}
                        className="font-medium bg-transparent border-none outline-none"
                      />
                      <Button
                        onClick={() => removeVisualization(viz.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Type: {viz.type} | Metrics: {viz.metrics?.length || 0} | Dimensions: {viz.dimensions?.length || 0}
                    </div>
                  </div>
                ))}
                
                {reportConfig.visualizations.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No visualizations added. Click on a chart type above to add one.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Preview your custom report</CardDescription>
            </CardHeader>
            <CardContent>
              {previewData.length > 0 ? (
                <div className="space-y-6">
                  {reportConfig.visualizations.map(viz => (
                    <DataVisualizationEngine
                      key={viz.id}
                      data={previewData}
                      chartType={viz.type}
                      title={viz.title}
                      description={`${viz.type} visualization`}
                      interactive={true}
                      exportable={true}
                    />
                  ))}
                  
                  {reportConfig.visualizations.length === 0 && (
                    <DataVisualizationEngine
                      data={previewData}
                      chartType="line"
                      title="Default Preview"
                      description="Sample data visualization"
                      interactive={true}
                      exportable={true}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Click "Generate Preview" to see your report</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={generatePreview}
            disabled={loading || reportConfig.metrics.length === 0}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            Generate Preview
          </Button>
          
          <Button
            onClick={saveReport}
            disabled={loading || !reportConfig.name.trim() || reportConfig.metrics.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;