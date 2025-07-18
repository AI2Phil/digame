import React, { useState } from 'react';
import Head from 'next/head';
import { Plus, Trash2, Settings, Eye, Save, Download, BarChart3, PieChart, LineChart, Table, Calendar, Users, DollarSign, Activity } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function CustomReports() {
  const [reportName, setReportName] = useState('');
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const [reportSettings, setReportSettings] = useState({
    format: 'PDF',
    schedule: 'none',
    recipients: [],
    dateRange: '30d'
  });

  const availableWidgets = [
    {
      id: 'user-analytics',
      name: 'User Analytics',
      description: 'User engagement and behavior metrics',
      icon: Users,
      category: 'Analytics',
      dataPoints: ['Active Users', 'New Registrations', 'User Retention', 'Session Duration'],
      visualizations: ['Line Chart', 'Bar Chart', 'Table']
    },
    {
      id: 'revenue-metrics',
      name: 'Revenue Metrics',
      description: 'Financial performance and revenue tracking',
      icon: DollarSign,
      category: 'Financial',
      dataPoints: ['Total Revenue', 'Monthly Recurring Revenue', 'Average Revenue Per User', 'Churn Rate'],
      visualizations: ['Line Chart', 'Bar Chart', 'KPI Cards']
    },
    {
      id: 'system-performance',
      name: 'System Performance',
      description: 'Platform health and performance metrics',
      icon: Activity,
      category: 'Technical',
      dataPoints: ['Response Time', 'Uptime', 'Error Rate', 'API Calls'],
      visualizations: ['Line Chart', 'Gauge Chart', 'Status Grid']
    },
    {
      id: 'team-productivity',
      name: 'Team Productivity',
      description: 'Team collaboration and productivity insights',
      icon: Users,
      category: 'Productivity',
      dataPoints: ['Tasks Completed', 'Project Progress', 'Team Activity', 'Meeting Hours'],
      visualizations: ['Bar Chart', 'Progress Bars', 'Heatmap']
    },
    {
      id: 'ai-insights',
      name: 'AI & Digital Twin',
      description: 'AI performance and digital twin analytics',
      icon: BarChart3,
      category: 'AI/ML',
      dataPoints: ['AI Model Performance', 'Prediction Accuracy', 'Twin Interactions', 'Automation Success'],
      visualizations: ['Line Chart', 'Scatter Plot', 'Performance Matrix']
    },
    {
      id: 'security-metrics',
      name: 'Security Metrics',
      description: 'Security events and compliance tracking',
      icon: Activity,
      category: 'Security',
      dataPoints: ['Security Events', 'Failed Logins', 'Compliance Score', 'Vulnerability Count'],
      visualizations: ['Bar Chart', 'Alert Timeline', 'Risk Matrix']
    }
  ];

  const visualizationTypes = [
    { id: 'line-chart', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
    { id: 'bar-chart', name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
    { id: 'pie-chart', name: 'Pie Chart', icon: PieChart, description: 'Show proportions and percentages' },
    { id: 'table', name: 'Data Table', icon: Table, description: 'Display detailed data in rows and columns' },
    { id: 'kpi-cards', name: 'KPI Cards', icon: Activity, description: 'Highlight key performance indicators' },
    { id: 'gauge', name: 'Gauge Chart', icon: Activity, description: 'Show progress towards goals' }
  ];

  const addWidget = (widget) => {
    const newWidget = {
      ...widget,
      id: `${widget.id}-${Date.now()}`,
      visualization: 'line-chart',
      selectedDataPoints: widget.dataPoints.slice(0, 2),
      position: selectedWidgets.length
    };
    setSelectedWidgets([...selectedWidgets, newWidget]);
  };

  const removeWidget = (widgetId) => {
    setSelectedWidgets(selectedWidgets.filter(w => w.id !== widgetId));
  };

  const updateWidget = (widgetId, updates) => {
    setSelectedWidgets(selectedWidgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  };

  const moveWidget = (widgetId, direction) => {
    const currentIndex = selectedWidgets.findIndex(w => w.id === widgetId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= selectedWidgets.length) return;

    const newWidgets = [...selectedWidgets];
    [newWidgets[currentIndex], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[currentIndex]];
    setSelectedWidgets(newWidgets);
  };

  const generateReport = () => {
    // Simulate report generation
    alert('Report generated successfully! This would normally create and download the report.');
  };

  const saveTemplate = () => {
    // Simulate template saving
    alert('Report template saved successfully!');
  };

  return (
    <>
      <Head>
        <title>Custom Report Builder - Reports - Digame</title>
        <meta name="description" content="Build custom reports with drag-and-drop interface" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Custom Report Builder"
          subtitle="Build custom reports with drag-and-drop interface"
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Widget Library */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Library</h3>
                <div className="space-y-4">
                  {availableWidgets.map((widget) => (
                    <div key={widget.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <widget.icon className="w-5 h-5 text-blue-600" />
                          <h4 className="font-medium text-gray-900">{widget.name}</h4>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{widget.category}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{widget.description}</p>
                      <div className="text-xs text-gray-500 mb-3">
                        <div>Data: {widget.dataPoints.slice(0, 2).join(', ')}...</div>
                        <div>Charts: {widget.visualizations.join(', ')}</div>
                      </div>
                      <button
                        onClick={() => addWidget(widget)}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Add to Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Builder */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Report Configuration</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveTemplate}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      <Save className="w-4 h-4 mr-2 inline" />
                      Save Template
                    </button>
                    <button
                      onClick={generateReport}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2 inline" />
                      Generate Report
                    </button>
                  </div>
                </div>

                {/* Report Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                    <input
                      type="text"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                    <select
                      value={reportSettings.format}
                      onChange={(e) => setReportSettings({...reportSettings, format: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="PDF">PDF</option>
                      <option value="Excel">Excel</option>
                      <option value="PowerPoint">PowerPoint</option>
                      <option value="HTML">HTML</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select
                      value={reportSettings.dateRange}
                      onChange={(e) => setReportSettings({...reportSettings, dateRange: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                      <option value="custom">Custom range</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                    <select
                      value={reportSettings.schedule}
                      onChange={(e) => setReportSettings({...reportSettings, schedule: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="none">One-time</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Report Preview */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
                
                {selectedWidgets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No widgets added yet</p>
                    <p>Add widgets from the library to start building your report</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedWidgets.map((widget, index) => (
                      <div key={widget.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <widget.icon className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium text-gray-900">{widget.name}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{widget.category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveWidget(widget.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveWidget(widget.id, 'down')}
                              disabled={index === selectedWidgets.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removeWidget(widget.id)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Visualization Type</label>
                            <select
                              value={widget.visualization}
                              onChange={(e) => updateWidget(widget.id, { visualization: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {visualizationTypes.map((viz) => (
                                <option key={viz.id} value={viz.id}>{viz.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Points</label>
                            <select
                              multiple
                              value={widget.selectedDataPoints}
                              onChange={(e) => updateWidget(widget.id, { 
                                selectedDataPoints: Array.from(e.target.selectedOptions, option => option.value)
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              size={3}
                            >
                              {widget.dataPoints.map((point) => (
                                <option key={point} value={point}>{point}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Widget Preview */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-center py-8 text-gray-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">
                              {widget.name} - {visualizationTypes.find(v => v.id === widget.visualization)?.name}
                            </p>
                            <p className="text-xs">Preview would show actual data visualization</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}