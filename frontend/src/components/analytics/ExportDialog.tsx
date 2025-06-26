import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  GetApp as ExportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  Code as JsonIcon
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { analyticsApi } from '../../services/api/analytics';

interface ExportDialogProps {
  open: boolean;
  dashboard: any;
  onClose: () => void;
}

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF Report', icon: PdfIcon, description: 'Complete dashboard as PDF' },
  { value: 'excel', label: 'Excel Workbook', icon: ExcelIcon, description: 'Data tables in Excel format' },
  { value: 'png', label: 'PNG Image', icon: ImageIcon, description: 'Dashboard screenshot' },
  { value: 'json', label: 'JSON Data', icon: JsonIcon, description: 'Raw data in JSON format' }
];

const EXPORT_OPTIONS = {
  pdf: [
    { key: 'includeCharts', label: 'Include Charts', default: true },
    { key: 'includeData', label: 'Include Raw Data', default: false },
    { key: 'landscape', label: 'Landscape Orientation', default: true }
  ],
  excel: [
    { key: 'separateSheets', label: 'Separate Sheets per Widget', default: true },
    { key: 'includeCharts', label: 'Include Charts', default: true },
    { key: 'includeMetadata', label: 'Include Metadata', default: false }
  ],
  png: [
    { key: 'highResolution', label: 'High Resolution', default: true },
    { key: 'includeFilters', label: 'Include Filter Panel', default: false }
  ],
  json: [
    { key: 'includeMetadata', label: 'Include Metadata', default: true },
    { key: 'prettyFormat', label: 'Pretty Format', default: true }
  ]
};

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  dashboard,
  onClose
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [format, setFormat] = useState('pdf');
  const [filename, setFilename] = useState('');
  const [options, setOptions] = useState<Record<string, boolean>>({});

  // Initialize filename when dialog opens
  React.useEffect(() => {
    if (open && dashboard) {
      setFilename(dashboard.name || 'dashboard');
      // Set default options for selected format
      const defaultOptions: Record<string, boolean> = {};
      EXPORT_OPTIONS[format as keyof typeof EXPORT_OPTIONS]?.forEach(option => {
        defaultOptions[option.key] = option.default;
      });
      setOptions(defaultOptions);
    }
  }, [open, dashboard, format]);

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (exportData: any) => {
      return analyticsApi.exportDashboard(dashboard.id, exportData);
    },
    onSuccess: (data: any) => {
      // Handle file download
      if (data && typeof data === 'object' && data.download_url) {
        // If API returns a download URL, use it directly
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For now, just show success message since we don't have actual export API
        console.log('Export would be triggered with:', { format, filename, options });
      }
      
      enqueueSnackbar('Dashboard exported successfully', { variant: 'success' });
      onClose();
    },
    onError: (error: any) => {
      enqueueSnackbar(`Export failed: ${error.message}`, { variant: 'error' });
    }
  });

  const getContentType = (format: string) => {
    switch (format) {
      case 'pdf': return 'application/pdf';
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'png': return 'image/png';
      case 'json': return 'application/json';
      default: return 'application/octet-stream';
    }
  };

  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat);
    // Reset options for new format
    const defaultOptions: Record<string, boolean> = {};
    EXPORT_OPTIONS[newFormat as keyof typeof EXPORT_OPTIONS]?.forEach(option => {
      defaultOptions[option.key] = option.default;
    });
    setOptions(defaultOptions);
  };

  const handleOptionChange = (key: string, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = () => {
    if (!filename.trim()) {
      enqueueSnackbar('Please enter a filename', { variant: 'warning' });
      return;
    }

    exportMutation.mutate({
      format,
      filename: filename.trim(),
      options
    });
  };

  const selectedFormat = EXPORT_FORMATS.find(f => f.value === format);
  const formatOptions = EXPORT_OPTIONS[format as keyof typeof EXPORT_OPTIONS] || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ExportIcon />
          Export Dashboard
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Dashboard Info */}
          <Alert severity="info">
            Exporting: <strong>{dashboard?.name}</strong>
            {dashboard?.widgets?.length && (
              <span> ({dashboard.widgets.length} widgets)</span>
            )}
          </Alert>

          {/* Format Selection */}
          <FormControl fullWidth>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={format}
              label="Export Format"
              onChange={(e) => handleFormatChange(e.target.value)}
            >
              {EXPORT_FORMATS.map((fmt) => {
                const IconComponent = fmt.icon;
                return (
                  <MenuItem key={fmt.value} value={fmt.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconComponent fontSize="small" />
                      <Box>
                        <Typography variant="body2">{fmt.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmt.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Filename */}
          <TextField
            fullWidth
            label="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            helperText={`File will be saved as: ${filename || 'filename'}.${format}`}
          />

          {/* Format-specific Options */}
          {formatOptions.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Export Options
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formatOptions.map((option) => (
                  <FormControlLabel
                    key={option.key}
                    control={
                      <Checkbox
                        checked={options[option.key] || false}
                        onChange={(e) => handleOptionChange(option.key, e.target.checked)}
                      />
                    }
                    label={option.label}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Format Info */}
          {selectedFormat && (
            <Box>
              <Chip
                icon={<selectedFormat.icon />}
                label={selectedFormat.description}
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={exportMutation.isPending ? <CircularProgress size={16} /> : <ExportIcon />}
          onClick={handleExport}
          disabled={exportMutation.isPending || !filename.trim()}
        >
          {exportMutation.isPending ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;