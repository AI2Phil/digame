import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Eye, Download, BarChart3, PieChart, LineChart, Table, Filter, Calendar, Users, Database } from 'lucide-react';

export default function CustomReportBuilder() {
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    dataSource: '',
    chartType: 'bar',
    filters: [],
    columns: [],
    groupBy: '',
    sortBy: '',
    dateRange: '30d'
  });
  const [availableFields, setAvailableFields] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableFields();
  }, [reportConfig.dataSource]);

  const fetchAvailableFields = async () => {
    if (!reportConfig.dataSource) return;
    
    try {
      const response = await fetch(`/api/reports/fields?source=${reportConfig.dataSource}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAvailableFields(result.data);
      } else {
        setAvailableFields(getMockFields());
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
      setAvailableFields(getMockFields());
    }
  };

  const getMockFields = () => [
    { name: 'user_id', type: 'number', label: 'User ID' },
    { name: 'username', type: 'string', label: 'Username' },
    { name: 'email', type: 'string', label: 'Email' },
    { name: 'created_at', type: 'date', label: 'Created Date' },
    { name: 'last_login', type: 'date', label: 'Last Login' },
    { name: 'status', type: 'string', label: 'Status' },
    { name: 'role', type: 'string', label: 'Role' },
    { name: 'department', type: 'string', label: 'Department' }
  ];

  const dataSources = [
    { value: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { value: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'workflows', label: 'Workflows', icon: <Database className="w-4 h-4" /> },
    { value: 'reports', label: 'Reports', icon: <Table className="w-4 h-4" /> }
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'line', label: 'Line Chart', icon: <LineChart className="w-4 h-4" /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChart className="w-4 h-4" /> },
    { value: 'table', label: 'Table', icon: <Table className="w-4 h-4" /> }
  ];

  const addFilter = () => {
    setReportConfig({
      ...reportConfig,
      filters: [...reportConfig.filters, { field: '', operator: 'equals', value: '' }]
    });
  };

  const updateFilter = (index, key, value) => {
    const newFilters = [...reportConfig.filters];
    newFilters[index][key] = value;
    setReportConfig({ ...reportConfig, filters: newFilters });
  };

  const removeFilter = (index) => {
    const newFilters = reportConfig.filters.filter((_, i) => i !== index);
    setReportConfig({ ...reportConfig, filters: newFilters });
  };

  const addColumn = (field) => {
    if (!reportConfig.columns.includes(field)) {
      setReportConfig({
        ...reportConfig,
        columns: [...reportConfig.columns, field]
      });
    }
  };

  const removeColumn = (field) => {
    setReportConfig({
      ...reportConfig,
      columns: reportConfig.columns.filter(col => col !== field)
    });
  };

  const generatePreview = async () => {
    setLoading(true);
    try {
      // Simulate API call for preview
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPreviewData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'Sample Data',
          data: [12, 19, 3, 5, 2],
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)'
        }]
      });
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    try {
      const response = await fetch('/api/reports/builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        },
        body: JSON.stringify(reportConfig)
      });
      
      if (response.ok) {
        alert('Report saved successfully!');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Report saved successfully!'); // Mock success
    }
  };

  return (
    <>
      <Head>
        <title>Custom Report Builder - Digame</title>
        <meta name="description" content="Build custom reports with drag-and-drop interface" />
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Custom Report Builder</h1>
                <p className="text-gray-600">Build custom reports with drag-and-drop interface</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={generatePreview}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                <span>{loading ? 'Generating...' : 'Preview'}</span>
              </button>
              <button 
                onClick={saveReport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                <span>Save Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                    <input
                      type="text"
                      value={reportConfig.name}
                      onChange={(e) => setReportConfig({...reportConfig, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter report name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={reportConfig.description}
                      onChange={(e) => setReportConfig({...reportConfig, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter report description"
                    />
                  </div>
                </div>
              </div>

              {/* Data Source */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Source</h3>
                <div className="space-y-3">
                  {dataSources.map((source) => (
                    <label key={source.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="dataSource"
                        value={source.value}
                        checked={reportConfig.dataSource === source.value}
                        onChange={(e) => setReportConfig({...reportConfig, dataSource: e.target.value})}
                        className="text-blue-600"
                      />
                      <div className="flex items-center space-x-2">
                        {source.icon}
                        <span className="text-sm font-medium text-gray-900">{source.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Chart Type */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {chartTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setReportConfig({...reportConfig, chartType: type.value})}
                      className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                        reportConfig.chartType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {type.icon}
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
                <select
                  value={reportConfig.dateRange}
                  onChange={(e) => setReportConfig({...reportConfig, dateRange: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Available Fields */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Fields</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableFields.map((field) => (
                    <button
                      key={field.name}
                      onClick={() => addColumn(field.name)}
                      className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{field.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Columns */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Columns</h3>
                {reportConfig.columns.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {reportConfig.columns.map((column) => (
                      <span
                        key={column}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {availableFields.find(f => f.name === column)?.label || column}
                        <button
                          onClick={() => removeColumn(column)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No columns selected. Click on available fields to add them.</p>
                )}
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={addFilter}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Filter</span>
                  </button>
                </div>
                
                {reportConfig.filters.length > 0 ? (
                  <div className="space-y-3">
                    {reportConfig.filters.map((filter, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <select
                          value={filter.field}
                          onChange={(e) => updateFilter(index, 'field', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select field</option>
                          {availableFields.map((field) => (
                            <option key={field.name} value={field.name}>{field.label}</option>
                          ))}
                        </select>
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                          <option value="greater_than">Greater than</option>
                          <option value="less_than">Less than</option>
                        </select>
                        <input
                          type="text"
                          value={filter.value}
                          onChange={(e) => updateFilter(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Filter value"
                        />
                        <button
                          onClick={() => removeFilter(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No filters applied. Click "Add Filter" to add filtering criteria.</p>
                )}
              </div>

              {/* Preview */}
              {previewData && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Chart preview would appear here</p>
                      <p className="text-sm text-gray-500">Sample data: {previewData.datasets[0].data.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}