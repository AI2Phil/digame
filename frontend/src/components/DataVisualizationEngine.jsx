import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { 
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, 
  TrendingUp, Activity, Zap, Download, Settings, Filter, 
  Eye, EyeOff, Maximize2, Minimize2, RefreshCw, Share2
} from 'lucide-react';

const DataVisualizationEngine = ({ 
  data, 
  chartType = 'line', 
  title, 
  description,
  interactive = true,
  exportable = true,
  customizable = true,
  realTime = false,
  onDataUpdate,
  className = ''
}) => {
  const [currentChartType, setCurrentChartType] = useState(chartType);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chartConfig, setChartConfig] = useState({
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    animationDuration: 1000,
    strokeWidth: 2,
    fillOpacity: 0.3
  });
  const [visibleSeries, setVisibleSeries] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize visible series
  useEffect(() => {
    if (data && data.length > 0) {
      const keys = Object.keys(data[0]).filter(key => key !== 'name' && key !== 'category');
      const initialVisible = {};
      keys.forEach(key => {
        initialVisible[key] = true;
      });
      setVisibleSeries(initialVisible);
    }
  }, [data]);

  // Real-time data updates
  useEffect(() => {
    if (realTime && onDataUpdate) {
      const interval = setInterval(() => {
        onDataUpdate();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [realTime, onDataUpdate]);

  const chartTypes = [
    { id: 'line', name: 'Line Chart', icon: LineChartIcon },
    { id: 'area', name: 'Area Chart', icon: Activity },
    { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
    { id: 'pie', name: 'Pie Chart', icon: PieChartIcon },
    { id: 'composed', name: 'Composed Chart', icon: TrendingUp },
    { id: 'scatter', name: 'Scatter Plot', icon: Zap },
    { id: 'radar', name: 'Radar Chart', icon: Activity },
    { id: 'treemap', name: 'Treemap', icon: BarChart3 },
    { id: 'funnel', name: 'Funnel Chart', icon: TrendingUp }
  ];

  const toggleSeries = useCallback((seriesKey) => {
    setVisibleSeries(prev => ({
      ...prev,
      [seriesKey]: !prev[seriesKey]
    }));
  }, []);

  const handleExport = useCallback(async (format = 'png') => {
    setLoading(true);
    try {
      // Implementation for chart export
      const chartElement = document.querySelector('.recharts-wrapper');
      if (chartElement) {
        // Use html2canvas or similar library for export
        console.log(`Exporting chart as ${format}`);
        // Actual export implementation would go here
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const renderChart = useMemo(() => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const getVisibleData = () => {
      return data.map(item => {
        const filteredItem = { ...item };
        Object.keys(visibleSeries).forEach(key => {
          if (!visibleSeries[key]) {
            delete filteredItem[key];
          }
        });
        return filteredItem;
      });
    };

    const visibleData = getVisibleData();

    switch (currentChartType) {
      case 'line':
        return (
          <LineChart {...commonProps} data={visibleData}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            {chartConfig.showTooltip && <Tooltip />}
            {chartConfig.showLegend && <Legend />}
            {Object.keys(visibleSeries).filter(key => visibleSeries[key]).map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartConfig.colors[index % chartConfig.colors.length]}
                strokeWidth={chartConfig.strokeWidth}
                animationDuration={chartConfig.animationDuration}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps} data={visibleData}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            {chartConfig.showTooltip && <Tooltip />}
            {chartConfig.showLegend && <Legend />}
            {Object.keys(visibleSeries).filter(key => visibleSeries[key]).map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={chartConfig.colors[index % chartConfig.colors.length]}
                fill={chartConfig.colors[index % chartConfig.colors.length]}
                fillOpacity={chartConfig.fillOpacity}
                animationDuration={chartConfig.animationDuration}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps} data={visibleData}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            {chartConfig.showTooltip && <Tooltip />}
            {chartConfig.showLegend && <Legend />}
            {Object.keys(visibleSeries).filter(key => visibleSeries[key]).map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartConfig.colors[index % chartConfig.colors.length]}
                animationDuration={chartConfig.animationDuration}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        const pieData = data.map((item, index) => ({
          name: item.name,
          value: Object.keys(visibleSeries).filter(key => visibleSeries[key]).reduce((sum, key) => sum + (item[key] || 0), 0),
          fill: chartConfig.colors[index % chartConfig.colors.length]
        }));
        
        return (
          <PieChart {...commonProps}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              animationDuration={chartConfig.animationDuration}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {chartConfig.showTooltip && <Tooltip />}
          </PieChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps} data={visibleData}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            {chartConfig.showTooltip && <Tooltip />}
            {chartConfig.showLegend && <Legend />}
            {Object.keys(visibleSeries).filter(key => visibleSeries[key]).map((key, index) => {
              if (index % 2 === 0) {
                return (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={chartConfig.colors[index % chartConfig.colors.length]}
                    animationDuration={chartConfig.animationDuration}
                  />
                );
              } else {
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={chartConfig.colors[index % chartConfig.colors.length]}
                    strokeWidth={chartConfig.strokeWidth}
                    animationDuration={chartConfig.animationDuration}
                  />
                );
              }
            })}
          </ComposedChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps} data={visibleData}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            {chartConfig.showTooltip && <Tooltip />}
            {chartConfig.showLegend && <Legend />}
            {Object.keys(visibleSeries).filter(key => visibleSeries[key]).map((key, index) => (
              <Scatter
                key={key}
                dataKey={key}
                fill={chartConfig.colors[index % chartConfig.colors.length]}
                animationDuration={chartConfig.animationDuration}
              />
            ))}
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart {...commonProps} data={visibleData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            {chartConfig.showTooltip && <Tooltip />}
            {chartConfig.showLegend && <Legend />}
            {Object.keys(visibleSeries).filter(key => visibleSeries[key]).map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={chartConfig.colors[index % chartConfig.colors.length]}
                fill={chartConfig.colors[index % chartConfig.colors.length]}
                fillOpacity={chartConfig.fillOpacity}
                animationDuration={chartConfig.animationDuration}
              />
            ))}
          </RadarChart>
        );

      case 'treemap':
        const treemapData = data.map((item, index) => ({
          name: item.name,
          size: Object.keys(visibleSeries).filter(key => visibleSeries[key]).reduce((sum, key) => sum + (item[key] || 0), 0),
          fill: chartConfig.colors[index % chartConfig.colors.length]
        }));
        
        return (
          <Treemap
            {...commonProps}
            data={treemapData}
            dataKey="size"
            ratio={4/3}
            stroke="#fff"
            fill="#8884d8"
            animationDuration={chartConfig.animationDuration}
          />
        );

      case 'funnel':
        const funnelData = data.map((item, index) => ({
          name: item.name,
          value: Object.keys(visibleSeries).filter(key => visibleSeries[key]).reduce((sum, key) => sum + (item[key] || 0), 0),
          fill: chartConfig.colors[index % chartConfig.colors.length]
        }));
        
        return (
          <FunnelChart {...commonProps}>
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
              animationDuration={chartConfig.animationDuration}
            >
              <LabelList position="center" fill="#fff" stroke="none" />
            </Funnel>
            {chartConfig.showTooltip && <Tooltip />}
          </FunnelChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  }, [data, currentChartType, visibleSeries, chartConfig]);

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 m-4' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {realTime && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse"></div>
                  Live
                </Badge>
              )}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          
          <div className="flex items-center gap-2">
            {interactive && (
              <Tabs value={currentChartType} onValueChange={setCurrentChartType}>
                <TabsList className="grid grid-cols-3 lg:grid-cols-9">
                  {chartTypes.map(({ id, name, icon: Icon }) => (
                    <TabsTrigger key={id} value={id} className="p-2" title={name}>
                      <Icon className="w-4 h-4" />
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
            
            {customizable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('png')}
                disabled={loading}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Series Toggle Controls */}
        {interactive && Object.keys(visibleSeries).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.keys(visibleSeries).map((key, index) => (
              <Button
                key={key}
                variant={visibleSeries[key] ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSeries(key)}
                className="flex items-center gap-2"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: chartConfig.colors[index % chartConfig.colors.length] }}
                />
                {key}
                {visibleSeries[key] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
            ))}
          </div>
        )}
        
        {/* Settings Panel */}
        {showSettings && customizable && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-3">Chart Settings</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={chartConfig.showGrid}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, showGrid: e.target.checked }))}
                />
                Show Grid
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={chartConfig.showLegend}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, showLegend: e.target.checked }))}
                />
                Show Legend
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={chartConfig.showTooltip}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, showTooltip: e.target.checked }))}
                />
                Show Tooltip
              </label>
              <div className="flex items-center gap-2">
                <label>Stroke Width:</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={chartConfig.strokeWidth}
                  onChange={(e) => setChartConfig(prev => ({ ...prev, strokeWidth: parseInt(e.target.value) }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-64 md:h-80'}`}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataVisualizationEngine;