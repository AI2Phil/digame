import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Plus, Grid, Layout, BarChart3, PieChart, LineChart,
  Users, Activity, TrendingUp, Settings, Save, Eye,
  Trash2, Copy, Edit, Move, Maximize2, Minimize2,
  RefreshCw, Download, Share, Filter, Search, Layers
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text' | 'image';
  title: string;
  data_source: string;
  config: {
    chart_type?: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
    metrics?: string[];
    filters?: Record<string, any>;
    refresh_interval?: number;
    size: 'small' | 'medium' | 'large';
    position: { x: number; y: number; w: number; h: number };
  };
  created_at: string;
  updated_at: string;
}

interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'freeform';
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

interface WidgetTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  preview_image: string;
  default_config: any;
  category: string;
}

export const CustomDashboardBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'gallery' | 'settings'>('builder');
  const [selectedDashboard, setSelectedDashboard] = useState<CustomDashboard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const [dashboards, setDashboards] = useState<CustomDashboard[]>([
    {
      id: '1',
      name: 'Executive Overview',
      description: 'High-level metrics for leadership team',
      widgets: [
        {
          id: 'w1',
          type: 'metric',
          title: 'Total Revenue',
          data_source: 'analytics.revenue',
          config: {
            metrics: ['total_revenue', 'growth_rate'],
            size: 'medium',
            position: { x: 0, y: 0, w: 6, h: 4 }
          },
          created_at: '2024-02-28T10:00:00Z',
          updated_at: '2024-02-28T10:00:00Z'
        },
        {
          id: 'w2',
          type: 'chart',
          title: 'User Growth',
          data_source: 'analytics.users',
          config: {
            chart_type: 'line',
            metrics: ['active_users', 'new_users'],
            size: 'large',
            position: { x: 6, y: 0, w: 6, h: 8 }
          },
          created_at: '2024-02-28T10:00:00Z',
          updated_at: '2024-02-28T10:00:00Z'
        }
      ],
      layout: 'grid',
      is_public: false,
      created_by: 'admin@company.com',
      created_at: '2024-02-28T10:00:00Z',
      updated_at: '2024-02-28T10:00:00Z',
      tags: ['executive', 'overview', 'metrics']
    },
    {
      id: '2',
      name: 'Sales Performance',
      description: 'Sales team metrics and KPIs',
      widgets: [
        {
          id: 'w3',
          type: 'chart',
          title: 'Sales Pipeline',
          data_source: 'sales.pipeline',
          config: {
            chart_type: 'bar',
            metrics: ['leads', 'opportunities', 'closed_deals'],
            size: 'large',
            position: { x: 0, y: 0, w: 8, h: 6 }
          },
          created_at: '2024-02-28T10:00:00Z',
          updated_at: '2024-02-28T10:00:00Z'
        }
      ],
      layout: 'grid',
      is_public: true,
      created_by: 'sales@company.com',
      created_at: '2024-02-28T10:00:00Z',
      updated_at: '2024-02-28T10:00:00Z',
      tags: ['sales', 'performance', 'pipeline']
    }
  ]);

  const [widgetTemplates, setWidgetTemplates] = useState<WidgetTemplate[]>([
    {
      id: 't1',
      name: 'Revenue Metric Card',
      type: 'metric',
      description: 'Display key revenue metrics with growth indicators',
      preview_image: '/templates/revenue-card.png',
      default_config: {
        metrics: ['total_revenue', 'growth_rate'],
        size: 'medium',
        refresh_interval: 300
      },
      category: 'Financial'
    },
    {
      id: 't2',
      name: 'User Activity Chart',
      type: 'chart',
      description: 'Line chart showing user activity over time',
      preview_image: '/templates/user-chart.png',
      default_config: {
        chart_type: 'line',
        metrics: ['active_users', 'page_views'],
        size: 'large',
        refresh_interval: 60
      },
      category: 'Analytics'
    },
    {
      id: 't3',
      name: 'Performance Table',
      type: 'table',
      description: 'Tabular view of performance metrics',
      preview_image: '/templates/performance-table.png',
      default_config: {
        metrics: ['response_time', 'throughput', 'error_rate'],
        size: 'large',
        refresh_interval: 30
      },
      category: 'Performance'
    },
    {
      id: 't4',
      name: 'Status Indicator',
      type: 'metric',
      description: 'Simple status indicator with color coding',
      preview_image: '/templates/status-indicator.png',
      default_config: {
        metrics: ['system_status'],
        size: 'small',
        refresh_interval: 15
      },
      category: 'Monitoring'
    }
  ]);

  const [availableDataSources] = useState([
    { id: 'analytics.revenue', name: 'Revenue Analytics', category: 'Financial' },
    { id: 'analytics.users', name: 'User Analytics', category: 'Analytics' },
    { id: 'sales.pipeline', name: 'Sales Pipeline', category: 'Sales' },
    { id: 'performance.metrics', name: 'Performance Metrics', category: 'Performance' },
    { id: 'security.alerts', name: 'Security Alerts', category: 'Security' },
    { id: 'system.health', name: 'System Health', category: 'Monitoring' }
  ]);

  const handleCreateDashboard = () => {
    const newDashboard: CustomDashboard = {
      id: Date.now().toString(),
      name: 'New Dashboard',
      description: 'Custom dashboard',
      widgets: [],
      layout: 'grid',
      is_public: false,
      created_by: 'current_user@company.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: []
    };
    setDashboards(prev => [...prev, newDashboard]);
    setSelectedDashboard(newDashboard);
    setIsEditing(true);
  };

  const handleAddWidget = (template: WidgetTemplate) => {
    if (!selectedDashboard) return;

    const newWidget: DashboardWidget = {
      id: Date.now().toString(),
      type: template.type as any,
      title: template.name,
      data_source: availableDataSources[0].id,
      config: {
        ...template.default_config,
        position: { x: 0, y: 0, w: 6, h: 4 }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedDashboard = {
      ...selectedDashboard,
      widgets: [...selectedDashboard.widgets, newWidget],
      updated_at: new Date().toISOString()
    };

    setSelectedDashboard(updatedDashboard);
    setDashboards(prev => prev.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!selectedDashboard) return;

    const updatedDashboard = {
      ...selectedDashboard,
      widgets: selectedDashboard.widgets.filter(w => w.id !== widgetId),
      updated_at: new Date().toISOString()
    };

    setSelectedDashboard(updatedDashboard);
    setDashboards(prev => prev.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
  };

  const handleDuplicateWidget = (widgetId: string) => {
    if (!selectedDashboard) return;

    const widget = selectedDashboard.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const duplicatedWidget: DashboardWidget = {
      ...widget,
      id: Date.now().toString(),
      title: `${widget.title} (Copy)`,
      config: {
        ...widget.config,
        position: { ...widget.config.position, x: widget.config.position.x + 2 }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedDashboard = {
      ...selectedDashboard,
      widgets: [...selectedDashboard.widgets, duplicatedWidget],
      updated_at: new Date().toISOString()
    };

    setSelectedDashboard(updatedDashboard);
    setDashboards(prev => prev.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
  };

  const handleSaveDashboard = () => {
    if (!selectedDashboard) return;
    
    const updatedDashboard = {
      ...selectedDashboard,
      updated_at: new Date().toISOString()
    };

    setDashboards(prev => prev.map(d => d.id === updatedDashboard.id ? updatedDashboard : d));
    setIsEditing(false);
  };

  const renderDashboardBuilder = () => (
    <div className="space-y-6">
      {/* Dashboard Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedDashboard?.id || ''}
            onChange={(e) => {
              const dashboard = dashboards.find(d => d.id === e.target.value);
              setSelectedDashboard(dashboard || null);
              setIsEditing(false);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Dashboard</option>
            {dashboards.map(dashboard => (
              <option key={dashboard.id} value={dashboard.id}>
                {dashboard.name}
              </option>
            ))}
          </select>
          <Button onClick={handleCreateDashboard}>
            <Plus className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
        </div>
        {selectedDashboard && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
            {isEditing && (
              <Button size="sm" onClick={handleSaveDashboard}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </div>

      {selectedDashboard ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Widget Library (when editing) */}
          {isEditing && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Widget Library</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {widgetTemplates.map(template => (
                      <div
                        key={template.id}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50"
                        onClick={() => handleAddWidget(template)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {template.type === 'chart' && <BarChart3 className="h-4 w-4 text-blue-600" />}
                          {template.type === 'metric' && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {template.type === 'table' && <Grid className="h-4 w-4 text-purple-600" />}
                          <span className="font-medium text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{template.description}</p>
                        <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                          {template.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dashboard Canvas */}
          <div className={isEditing ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedDashboard.name}</CardTitle>
                    <p className="text-sm text-gray-600">{selectedDashboard.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                      {selectedDashboard.widgets.length} widgets
                    </Badge>
                    {selectedDashboard.is_public && (
                      <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                        Public
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-4 min-h-96">
                  {selectedDashboard.widgets.map(widget => (
                    <div
                      key={widget.id}
                      className={`col-span-${widget.config.size === 'small' ? '3' : widget.config.size === 'medium' ? '6' : '12'} relative group`}
                    >
                      <Card className={`h-full ${selectedWidget === widget.id ? 'ring-2 ring-blue-500' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{widget.title}</CardTitle>
                            {isEditing && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedWidget(widget.id)}
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDuplicateWidget(widget.id)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteWidget(widget.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {widget.type === 'metric' && (
                            <div className="text-center">
                              <p className="text-3xl font-bold text-blue-600">$124.5K</p>
                              <p className="text-sm text-gray-600">Total Revenue</p>
                              <p className="text-xs text-green-600">+12.3% from last month</p>
                            </div>
                          )}
                          {widget.type === 'chart' && (
                            <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                              <div className="text-center">
                                <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">{widget.config.chart_type} Chart</p>
                              </div>
                            </div>
                          )}
                          {widget.type === 'table' && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600">
                                <span>Metric</span>
                                <span>Value</span>
                                <span>Change</span>
                              </div>
                              {['Response Time', 'Throughput', 'Error Rate'].map((metric, index) => (
                                <div key={metric} className="grid grid-cols-3 gap-2 text-xs">
                                  <span>{metric}</span>
                                  <span className="font-medium">{['245ms', '1.2K/s', '0.12%'][index]}</span>
                                  <span className="text-green-600">+5.2%</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                  {selectedDashboard.widgets.length === 0 && (
                    <div className="col-span-12 text-center py-12">
                      <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Empty Dashboard</h3>
                      <p className="text-gray-600 mb-4">Add widgets from the library to get started</p>
                      {isEditing && (
                        <Button onClick={() => handleAddWidget(widgetTemplates[0])}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Widget
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboard Selected</h3>
          <p className="text-gray-600 mb-4">Select an existing dashboard or create a new one</p>
          <Button onClick={handleCreateDashboard}>
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </div>
      )}
    </div>
  );

  const renderTemplateGallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Widget Templates</h2>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">All Categories</option>
            <option value="Financial">Financial</option>
            <option value="Analytics">Analytics</option>
            <option value="Performance">Performance</option>
            <option value="Monitoring">Monitoring</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgetTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{template.name}</CardTitle>
                <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
                  {template.type === 'chart' && <BarChart3 className="h-8 w-8 text-gray-400" />}
                  {template.type === 'metric' && <TrendingUp className="h-8 w-8 text-gray-400" />}
                  {template.type === 'table' && <Grid className="h-8 w-8 text-gray-400" />}
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handleAddWidget(template)}
                  disabled={!selectedDashboard}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDashboardGallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard Gallery</h2>
        <Button onClick={handleCreateDashboard}>
          <Plus className="h-4 w-4 mr-2" />
          New Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map(dashboard => (
          <Card key={dashboard.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{dashboard.name}</CardTitle>
                <div className="flex items-center gap-1">
                  {dashboard.is_public && (
                    <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                      Public
                    </Badge>
                  )}
                  <Badge variant="default" size="sm" icon={null} onRemove={() => {}}>
                    {dashboard.widgets.length} widgets
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{dashboard.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Created: {new Date(dashboard.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Updated: {new Date(dashboard.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {dashboard.tags.map(tag => (
                    <Badge key={tag} variant="default" size="sm" icon={null} onRemove={() => {}}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => {
                      setSelectedDashboard(dashboard);
                      setActiveTab('builder');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDashboard(dashboard);
                      setIsEditing(true);
                      setActiveTab('builder');
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Dashboard Builder</h1>
          <p className="text-gray-600">Create and customize dashboards with drag-and-drop widgets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'builder', label: 'Dashboard Builder', icon: Layout },
            { id: 'templates', label: 'Widget Templates', icon: Layers },
            { id: 'gallery', label: 'Dashboard Gallery', icon: Grid },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'builder' && renderDashboardBuilder()}
        {activeTab === 'templates' && renderTemplateGallery()}
        {activeTab === 'gallery' && renderDashboardGallery()}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Settings</h3>
            <p className="text-gray-600">Global dashboard configuration and preferences coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDashboardBuilder;