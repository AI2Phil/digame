import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';

interface WidgetConfig {
  id?: string;
  title: string;
  type: string;
  dataSource: string;
  config: Record<string, any>;
}

interface WidgetConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget?: WidgetConfig;
  onSave: (widget: WidgetConfig) => void;
}

const WIDGET_TYPES = [
  { value: 'kpi_card', label: 'KPI Card' },
  { value: 'line_chart', label: 'Line Chart' },
  { value: 'bar_chart', label: 'Bar Chart' },
  { value: 'pie_chart', label: 'Pie Chart' },
  { value: 'table', label: 'Data Table' },
  { value: 'gauge', label: 'Gauge' },
  { value: 'heatmap', label: 'Heatmap' },
  { value: 'timeline', label: 'Timeline' },
];

const DATA_SOURCES = [
  { value: 'performance_metric_single', label: 'Single Performance Metric' },
  { value: 'performance_metric_list', label: 'Performance Metrics List' },
  { value: 'performance_metric_timeseries', label: 'Performance Metrics Time Series' },
  { value: 'prediction_single', label: 'Single Prediction' },
  { value: 'prediction_list', label: 'Predictions List' },
  { value: 'roi_calculation_detail', label: 'ROI Calculation Detail' },
  { value: 'roi_calculation_list', label: 'ROI Calculations List' },
  { value: 'benchmark_comparison_detail', label: 'Benchmark Comparison' },
  { value: 'analytics_model_list', label: 'Analytics Models List' },
  { value: 'workflow_instance_summary', label: 'Workflow Instance Summary' },
  { value: 'workflow_instance_steps', label: 'Workflow Steps' },
];

export function WidgetConfigDialog({
  open,
  onOpenChange,
  widget,
  onSave,
}: WidgetConfigDialogProps) {
  const [config, setConfig] = useState<WidgetConfig>({
    title: widget?.title || '',
    type: widget?.type || '',
    dataSource: widget?.dataSource || '',
    config: widget?.config || {},
  });

  const handleSave = () => {
    onSave({
      ...config,
      id: widget?.id,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {widget ? 'Edit Widget' : 'Create New Widget'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField
            fullWidth
            label="Widget Title"
            value={config.title}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
            placeholder="Enter widget title"
          />
          
          <FormControl fullWidth>
            <InputLabel>Widget Type</InputLabel>
            <Select
              value={config.type}
              label="Widget Type"
              onChange={(e) => setConfig({ ...config, type: e.target.value })}
            >
              {WIDGET_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Data Source</InputLabel>
            <Select
              value={config.dataSource}
              label="Data Source"
              onChange={(e) => setConfig({ ...config, dataSource: e.target.value })}
            >
              {DATA_SOURCES.map((source) => (
                <MenuItem key={source.value} value={source.value}>
                  {source.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!config.title || !config.type || !config.dataSource}
        >
          {widget ? 'Update' : 'Create'} Widget
        </Button>
      </DialogActions>
    </Dialog>
  );
}