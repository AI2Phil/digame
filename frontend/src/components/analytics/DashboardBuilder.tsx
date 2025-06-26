import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Fab,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Toolbar,
  Typography,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  TableChart as TableIcon,
  Speed as GaugeIcon,
  Assessment as MetricIcon,
  GridOn as HeatmapIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { analyticsApi } from '../../services/api/analytics';
import { DashboardWidget } from './widgets/DashboardWidget';
import { WidgetConfigDialog } from './widgets/WidgetConfigDialog';
import { DashboardFilters } from './DashboardFilters';
import { ExportDialog } from './ExportDialog';
import { ShareDialog } from './ShareDialog';
import { TemplateSelector } from './TemplateSelector';

// Make ResponsiveGridLayout responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget type definitions
const WIDGET_TYPES = [
  { type: 'kpi_card', label: 'KPI Card', icon: MetricIcon, category: 'metrics' },
  { type: 'line_chart', label: 'Line Chart', icon: LineChartIcon, category: 'charts' },
  { type: 'bar_chart', label: 'Bar Chart', icon: BarChartIcon, category: 'charts' },
  { type: 'pie_chart', label: 'Pie Chart', icon: PieChartIcon, category: 'charts' },
  { type: 'table', label: 'Data Table', icon: TableIcon, category: 'data' },
  { type: 'gauge', label: 'Gauge', icon: GaugeIcon, category: 'metrics' },
  { type: 'heatmap', label: 'Heatmap', icon: HeatmapIcon, category: 'charts' },
  { type: 'timeline', label: 'Timeline', icon: TimelineIcon, category: 'data' }
];

// Data source types
const DATA_SOURCE_TYPES = [
  { type: 'performance_metric_single', label: 'Single Performance Metric' },
  { type: 'performance_metric_list', label: 'Performance Metrics List' },
  { type: 'performance_metric_timeseries', label: 'Performance Metrics Time Series' },
  { type: 'prediction_single', label: 'Single Prediction' },
  { type: 'prediction_list', label: 'Predictions List' },
  { type: 'roi_calculation_detail', label: 'ROI Calculation Detail' },
  { type: 'roi_calculation_list', label: 'ROI Calculations List' },
  { type: 'benchmark_comparison_detail', label: 'Benchmark Comparison' },
  { type: 'analytics_model_list', label: 'Analytics Models List' },
  { type: 'workflow_instance_summary', label: 'Workflow Instance Summary' },
  { type: 'workflow_instance_steps', label: 'Workflow Steps' }
];

interface DashboardBuilderProps {
  dashboardId?: number;
  mode?: 'edit' | 'view' | 'create';
  onSave?: (dashboard: any) => void;
  onCancel?: () => void;
}

export const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  dashboardId,
  mode = 'edit',
  onSave,
  onCancel
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // State management
  const [dashboard, setDashboard] = useState<any>(null);
  const [layouts, setLayouts] = useState<any>({});
  const [widgets, setWidgets] = useState<any[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<any>(null);
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [widgetPanelOpen, setWidgetPanelOpen] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [timeRange, setTimeRange] = useState<any>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Load dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: () => dashboardId ? analyticsApi.getDashboard(dashboardId) : null,
    enabled: !!dashboardId && mode !== 'create'
  });

  // Initialize dashboard state
  useEffect(() => {
    if (dashboardData) {
      setDashboard(dashboardData);
      setWidgets(dashboardData.widgets || []);
      
      // Convert layout format for react-grid-layout
      const layoutItems = dashboardData.layout?.map((item: any) => ({
        i: item.widget_config_id.toString(),
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        static: item.static || false
      })) || [];
      
      setLayouts({ lg: layoutItems });
    } else if (mode === 'create') {
      // Initialize empty dashboard
      setDashboard({
        name: 'New Dashboard',
        description: '',
        tags: [],
        layout: [],
        widgets: []
      });
      setWidgets([]);
      setLayouts({ lg: [] });
    }
  }, [dashboardData, mode]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && mode === 'view') {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['dashboard', dashboardId] });
        widgets.forEach(widget => {
          queryClient.invalidateQueries({ queryKey: ['widget-data', widget.id] });
        });
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, mode, dashboardId, widgets, queryClient]);

  // Save dashboard mutation
  const saveDashboardMutation = useMutation({
    mutationFn: async (dashboardData: any) => {
      if (dashboardId) {
        return analyticsApi.updateDashboard(dashboardId, dashboardData);
      } else {
        return analyticsApi.createDashboard(dashboardData);
      }
    },
    onSuccess: (data) => {
      enqueueSnackbar('Dashboard saved successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      if (onSave) onSave(data);
    },
    onError: (error: any) => {
      enqueueSnackbar(`Failed to save dashboard: ${error.message}`, { variant: 'error' });
    }
  });

  // Handle layout changes
  const handleLayoutChange = useCallback((layout: any, layouts: any) => {
    setLayouts(layouts);
    
    // Update dashboard layout
    const updatedLayout = layout.map((item: any) => ({
      widget_config_id: parseInt(item.i),
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      static: item.static || false
    }));
    
    setDashboard((prev: any) => ({
      ...prev,
      layout: updatedLayout
    }));
  }, []);

  // Add new widget
  const handleAddWidget = useCallback((widgetType: string) => {
    setSelectedWidget({
      widget_type: widgetType,
      title: `New ${WIDGET_TYPES.find(w => w.type === widgetType)?.label || 'Widget'}`,
      data_source_config: {
        type: DATA_SOURCE_TYPES[0].type,
        params: {}
      },
      display_options: {}
    });
    setIsWidgetDialogOpen(true);
  }, []);

  // Save widget configuration
  const handleSaveWidget = useCallback(async (widgetConfig: any) => {
    try {
      if (selectedWidget?.id) {
        // Update existing widget
        const updatedWidget = await analyticsApi.updateWidget(selectedWidget.id, widgetConfig);
        setWidgets(prev => prev.map(w => w.id === selectedWidget.id ? updatedWidget : w));
      } else {
        // Create new widget
        const newWidget = await analyticsApi.createWidget({
          ...widgetConfig,
          dashboard_id: dashboardId
        });
        
        setWidgets(prev => [...prev, newWidget]);
        
        // Add to layout
        const newLayoutItem = {
          i: newWidget.id.toString(),
          x: 0,
          y: 0,
          w: 4,
          h: 3,
          static: false
        };
        
        setLayouts(prev => ({
          ...prev,
          lg: [...(prev.lg || []), newLayoutItem]
        }));
      }
      
      setIsWidgetDialogOpen(false);
      setSelectedWidget(null);
      enqueueSnackbar('Widget saved successfully', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(`Failed to save widget: ${error.message}`, { variant: 'error' });
    }
  }, [selectedWidget, dashboardId, enqueueSnackbar]);

  // Delete widget
  const handleDeleteWidget = useCallback(async (widgetId: number) => {
    try {
      await analyticsApi.deleteWidget(widgetId);
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
      setLayouts(prev => ({
        ...prev,
        lg: prev.lg?.filter((item: any) => item.i !== widgetId.toString()) || []
      }));
      enqueueSnackbar('Widget deleted successfully', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(`Failed to delete widget: ${error.message}`, { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Save dashboard
  const handleSaveDashboard = useCallback(async () => {
    try {
      const dashboardToSave = {
        ...dashboard,
        widgets: widgets.map(w => ({
          widget_type: w.widget_type,
          title: w.title,
          data_source_config: w.data_source_config,
          display_options: w.display_options
        }))
      };
      
      await saveDashboardMutation.mutateAsync(dashboardToSave);
    } catch (error) {
      // Error handled in mutation
    }
  }, [dashboard, widgets, saveDashboardMutation]);

  // Refresh all widgets
  const handleRefreshAll = useCallback(() => {
    widgets.forEach(widget => {
      queryClient.invalidateQueries({ queryKey: ['widget-data', widget.id] });
    });
    enqueueSnackbar('Dashboard refreshed', { variant: 'info' });
  }, [widgets, queryClient, enqueueSnackbar]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {dashboard?.name || 'Dashboard Builder'}
          </Typography>
          
          {mode !== 'view' && (
            <>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                onClick={handleSaveDashboard}
                disabled={saveDashboardMutation.isPending}
              >
                Save
              </Button>
              
              <Button
                startIcon={<SettingsIcon />}
                onClick={() => setIsSettingsOpen(true)}
              >
                Settings
              </Button>
            </>
          )}
          
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefreshAll}
          >
            Refresh
          </Button>
          
          <FormControlLabel
            control={
              <Switch
                checked={isPreviewMode}
                onChange={(e) => setIsPreviewMode(e.target.checked)}
              />
            }
            label="Preview"
          />
          
          <Button
            startIcon={<ExportIcon />}
            onClick={() => setIsExportDialogOpen(true)}
          >
            Export
          </Button>
          
          <Button
            startIcon={<ShareIcon />}
            onClick={() => setIsShareDialogOpen(true)}
          >
            Share
          </Button>
          
          {onCancel && (
            <Button onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Toolbar>

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Widget Panel */}
          {!isPreviewMode && mode !== 'view' && (
            <Drawer
              variant="persistent"
              anchor="left"
              open={widgetPanelOpen}
              sx={{
                width: 280,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: 280,
                  position: 'relative',
                  borderRight: 1,
                  borderColor: 'divider'
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Widget Library
                </Typography>
                
                {/* Widget Categories */}
                {['metrics', 'charts', 'data'].map(category => (
                  <Accordion key={category} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                        {category}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        {WIDGET_TYPES.filter(w => w.category === category).map(widgetType => {
                          const IconComponent = widgetType.icon;
                          return (
                            <Grid item xs={6} key={widgetType.type}>
                              <Card
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: 'action.hover' },
                                  textAlign: 'center',
                                  p: 1
                                }}
                                onClick={() => handleAddWidget(widgetType.type)}
                              >
                                <IconComponent sx={{ fontSize: 32, mb: 1 }} />
                                <Typography variant="caption" display="block">
                                  {widgetType.label}
                                </Typography>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Drawer>
          )}

          {/* Main Dashboard Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* Dashboard Filters */}
            <DashboardFilters
              filters={filters}
              timeRange={timeRange}
              onFiltersChange={setFilters}
              onTimeRangeChange={setTimeRange}
              sx={{ mb: 2 }}
            />

            {/* Grid Layout */}
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              onLayoutChange={handleLayoutChange}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={60}
              isDraggable={!isPreviewMode && mode !== 'view'}
              isResizable={!isPreviewMode && mode !== 'view'}
              margin={[16, 16]}
              containerPadding={[0, 0]}
            >
              {widgets.map(widget => (
                <div key={widget.id.toString()}>
                  <DashboardWidget
                    widget={widget}
                    filters={filters}
                    timeRange={timeRange}
                    isEditMode={!isPreviewMode && mode !== 'view'}
                    onEdit={() => {
                      setSelectedWidget(widget);
                      setIsWidgetDialogOpen(true);
                    }}
                    onDelete={() => handleDeleteWidget(widget.id)}
                  />
                </div>
              ))}
            </ResponsiveGridLayout>

            {/* Empty State */}
            {widgets.length === 0 && (
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'grey.50',
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No widgets added yet
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Start building your dashboard by adding widgets from the panel
                </Typography>
                {mode !== 'view' && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddWidget('kpi_card')}
                    sx={{ mt: 2 }}
                  >
                    Add Your First Widget
                  </Button>
                )}
              </Paper>
            )}
          </Box>
        </Box>

        {/* Widget Configuration Dialog */}
        <WidgetConfigDialog
          open={isWidgetDialogOpen}
          widget={selectedWidget}
          onSave={handleSaveWidget}
          onOpenChange={(open) => {
            setIsWidgetDialogOpen(open);
            if (!open) {
              setSelectedWidget(null);
            }
          }}
        />

        {/* Export Dialog */}
        <ExportDialog
          open={isExportDialogOpen}
          dashboard={dashboard}
          onClose={() => setIsExportDialogOpen(false)}
        />

        {/* Share Dialog */}
        <ShareDialog
          open={isShareDialogOpen}
          dashboard={dashboard}
          onClose={() => setIsShareDialogOpen(false)}
        />

        {/* Template Selector */}
        <TemplateSelector
          open={isTemplateDialogOpen}
          onSelect={(template) => {
            // Apply template to dashboard
            setDashboard(prev => ({ ...prev, ...template }));
            setWidgets(template.widgets || []);
            setLayouts({ lg: template.layout || [] });
            setIsTemplateDialogOpen(false);
          }}
          onClose={() => setIsTemplateDialogOpen(false)}
        />

        {/* Auto-refresh indicator */}
        {autoRefresh && (
          <Chip
            label={`Auto-refresh: ${refreshInterval / 1000}s`}
            color="primary"
            size="small"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
          />
        )}
      </Box>
    </DndProvider>
  );
};

export default DashboardBuilder;