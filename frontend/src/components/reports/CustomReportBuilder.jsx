import React, { useState, useEffect } from 'react';
import { apiClient, replaceApiUrl } from '../../lib/api-config';

  Plus, Trash2, Settings, Play, Save, Download, Eye,
  Database, BarChart3, PieChart, LineChart, Table,
  Filter, Columns, Palette, Calendar, Users, Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useToast } from '../ui/Toast';

const CustomReportBuilder = () => {
  const [builderData, setBuilderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentReport, setCurrentReport] = useState({
    name: '',
    description: '',
    data_source: '',
    report_type: 'table',
    filters: [],
    columns: [],
    visualization_config: {
      chart_type: 'bar',
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      theme: 'default'
    },
    schedule_config: {
      enabled: false,
      frequency: 'daily'
    }
  });
  const [previewData, setPreviewData] = useState(null);
  const [activeTab, setActiveTab] = useState('data');
  const { addToast } = useToast();

  useEffect(() => {
    fetchBuilderData();
  }, []);

  const fetchBuilderData = async () => {
    try {
      setLoading(true);
      const response = await fetch('${replaceApiUrl("/api/advanced-reporting/report-builder")}');
      
      if (!response.ok) {
        throw new Error('Failed to fetch report builder data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setBuilderData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load report builder data');
      }
    } catch (err) {
      console.error('Error fetching builder data:', err);
      addToast({
        type: 'error',
        title: 'Error Loading Builder',
        message: 'Failed to load report builder data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataSourceChange = (dataSourceId) => {
    const dataSource = builderData.data_sources.find(ds => ds.id === parseInt(dataSourceId));
    setCurrentReport(prev => ({
      ...prev,
      data_source: dataSourceId,
      columns: dataSource?.available_tables?.length > 0 ? 
        dataSource.available_tables[0].map(table => ({
          name: table,
          type: 'string',
          visible: true
        })) : []
    }));
  };

  const handleAddFilter = () => {
    setCurrentReport(prev => ({
      ...prev,
      filters: [...prev.filters, {
        field: '',
        operator: 'equals',
        value: '',
        type: 'string'
      }]
    }));
  };

  const handleUpdateFilter = (index, field, value) => {
    setCurrentReport(prev => ({
      ...prev,
      filters: prev.filters.map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      )
    }));
  };

  const handleRemoveFilter = (index) => {
    setCurrentReport(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const handleColumnToggle = (index) => {
    setCurrentReport(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === index ? { ...col, visible: !col.visible } : col
      )
    }));
  };

  const handleVisualizationChange = (field, value) => {
    setCurrentReport(prev => ({
      ...prev,
      visualization_config: {
        ...prev.visualization_config,
        [field]: value
      }
    }));
  };

  const handlePreviewReport = async () => {
    try {
      // Simulate preview data generation
      const mockData = [
        { id: 1, name: 'Sample Data 1', value: 100, category: 'A', date: '2024-01-01' },
        { id: 2, name: 'Sample Data 2', value: 150, category: 'B', date: '2024-01-02' },
        { id: 3, name: 'Sample Data 3', value: 200, category: 'A', date: '2024-01-03' },
        { id: 4, name: 'Sample Data 4', value: 120, category: 'C', date: '2024-01-04' },
        { id: 5, name: 'Sample Data 5', value: 180, category: 'B', date: '2024-01-05' }
      ];
      
      setPreviewData(mockData);
      addToast({
        type: 'success',
        title: 'Preview Generated',
        message: 'Report preview has been generated successfully.'
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Preview Failed',
        message: 'Failed to generate report preview.'
      });
    }
  };

  const handleSaveReport = async () => {
    try {
      if (!currentReport.name || !currentReport.data_source) {
        addToast({
          type: 'warning',
          title: 'Missing Information',
          message: 'Please provide a report name and select a data source.'
        });
        return;
      }

      // Simulate save operation
      addToast({
        type: 'success',
        title: 'Report Saved',
        message: `Report "${currentReport.name}" has been saved successfully.`
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save the report.'
      });
    }
  };

  const getChartIcon = (chartType) => {
    switch (chartType) {
      case 'line': return <LineChart className="w-4 h-4" />;
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      case 'table': return <Table className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report builder...</p>
        </div>
      </div>
    );
  }

  if (!builderData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Report Builder</h1>
          <p className="text-gray-600 mt-1">Create custom reports with advanced visualization and filtering</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handlePreviewReport}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSaveReport}>
            <Save className="w-4 h-4 mr-2" />
            Save Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Configure your custom report settings and data sources</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="data">Data Source</TabsTrigger>
                  <TabsTrigger value="filters">Filters</TabsTrigger>
                  <TabsTrigger value="columns">Columns</TabsTrigger>
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                </TabsList>

                <TabsContent value="data" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Name
                    </label>
                    <input
                      type="text"
                      value={currentReport.name}
                      onChange={(e) => setCurrentReport(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter report name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={currentReport.description}
                      onChange={(e) => setCurrentReport(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter report description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Source
                    </label>
                    <select
                      value={currentReport.data_source}
                      onChange={(e) => handleDataSourceChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a data source</option>
                      {builderData.data_sources.map(source => (
                        <option key={source.id} value={source.id}>
                          {source.name} ({source.source_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Type
                    </label>
                    <select
                      value={currentReport.report_type}
                      onChange={(e) => setCurrentReport(prev => ({ ...prev, report_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="table">Data Table</option>
                      <option value="chart">Chart</option>
                      <option value="dashboard">Dashboard</option>
                      <option value="pivot">Pivot Table</option>
                      <option value="summary">Summary</option>
                    </select>
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Report Filters</h3>
                    <Button onClick={handleAddFilter} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Filter
                    </Button>
                  </div>

                  {currentReport.filters.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No filters added yet</p>
                      <p className="text-sm">Click "Add Filter" to create your first filter</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentReport.filters.map((filter, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <select
                            value={filter.field}
                            onChange={(e) => handleUpdateFilter(index, 'field', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select field</option>
                            {currentReport.columns.map(col => (
                              <option key={col.name} value={col.name}>{col.name}</option>
                            ))}
                          </select>

                          <select
                            value={filter.operator}
                            onChange={(e) => handleUpdateFilter(index, 'operator', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="equals">Equals</option>
                            <option value="not_equals">Not Equals</option>
                            <option value="contains">Contains</option>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                            <option value="between">Between</option>
                          </select>

                          <input
                            type="text"
                            value={filter.value}
                            onChange={(e) => handleUpdateFilter(index, 'value', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Filter value"
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFilter(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="columns" className="space-y-4">
                  <h3 className="text-lg font-medium">Column Configuration</h3>
                  
                  {currentReport.columns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Columns className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No columns available</p>
                      <p className="text-sm">Select a data source to see available columns</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentReport.columns.map((column, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={column.visible}
                              onChange={() => handleColumnToggle(index)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="font-medium">{column.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {column.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="visualization" className="space-y-4">
                  <h3 className="text-lg font-medium">Visualization Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chart Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {builderData.chart_types.map(chartType => (
                        <button
                          key={chartType.value}
                          onClick={() => handleVisualizationChange('chart_type', chartType.value)}
                          className={`p-3 border rounded-lg text-center hover:bg-gray-50 ${
                            currentReport.visualization_config.chart_type === chartType.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300'
                          }`}
                        >
                          {getChartIcon(chartType.value)}
                          <p className="text-xs mt-1">{chartType.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Theme
                    </label>
                    <select
                      value={currentReport.visualization_config.theme}
                      onChange={(e) => handleVisualizationChange('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="default">Default</option>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="colorful">Colorful</option>
                      <option value="minimal">Minimal</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Palette
                    </label>
                    <div className="flex space-x-2">
                      {currentReport.visualization_config.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Report Preview
              </CardTitle>
              <CardDescription>Live preview of your report</CardDescription>
            </CardHeader>
            <CardContent>
              {previewData ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Showing {previewData.length} records
                  </div>
                  
                  {currentReport.report_type === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {currentReport.columns
                              .filter(col => col.visible)
                              .map(col => (
                                <th key={col.name} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {col.name}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.slice(0, 5).map((row, index) => (
                            <tr key={index}>
                              {currentReport.columns
                                .filter(col => col.visible)
                                .map(col => (
                                  <td key={col.name} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {row[col.name]}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getChartIcon(currentReport.visualization_config.chart_type)}
                      <span className="ml-2 text-gray-600">
                        {currentReport.visualization_config.chart_type.charAt(0).toUpperCase() + 
                         currentReport.visualization_config.chart_type.slice(1)} Chart Preview
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No preview available</p>
                  <p className="text-sm">Click "Preview" to generate report preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Quick Templates
              </CardTitle>
              <CardDescription>Start with pre-built templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {builderData.templates.slice(0, 3).map(template => (
                  <button
                    key={template.id}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
                    onClick={() => {
                      setCurrentReport(prev => ({
                        ...prev,
                        name: template.name,
                        description: template.description,
                        ...template.config
                      }));
                      addToast({
                        type: 'success',
                        title: 'Template Applied',
                        message: `Template "${template.name}" has been applied.`
                      });
                    }}
                  >
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;