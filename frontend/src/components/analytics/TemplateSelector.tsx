import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/api/analytics';

interface TemplateSelectorProps {
  open: boolean;
  onSelect: (template: any) => void;
  onClose: () => void;
}

const TEMPLATE_CATEGORIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'performance', label: 'Performance' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'executive', label: 'Executive' },
  { value: 'operational', label: 'Operational' },
  { value: 'custom', label: 'Custom' }
];

// Mock templates for now
const MOCK_TEMPLATES = [
  {
    id: 1,
    name: 'Executive Dashboard',
    description: 'High-level KPIs and metrics for executives',
    category: 'executive',
    preview_image: '/templates/executive-dashboard.png',
    widgets: [
      { type: 'kpi_card', title: 'Revenue', data_source: 'revenue_metrics' },
      { type: 'line_chart', title: 'Growth Trend', data_source: 'growth_metrics' },
      { type: 'pie_chart', title: 'Department Breakdown', data_source: 'department_metrics' }
    ],
    layout: [
      { widget_config_id: 1, x: 0, y: 0, w: 3, h: 2 },
      { widget_config_id: 2, x: 3, y: 0, w: 6, h: 4 },
      { widget_config_id: 3, x: 9, y: 0, w: 3, h: 4 }
    ],
    tags: ['executive', 'kpi', 'overview']
  },
  {
    id: 2,
    name: 'Performance Analytics',
    description: 'Detailed performance metrics and trends',
    category: 'performance',
    preview_image: '/templates/performance-analytics.png',
    widgets: [
      { type: 'gauge', title: 'Performance Score', data_source: 'performance_score' },
      { type: 'bar_chart', title: 'Team Performance', data_source: 'team_performance' },
      { type: 'table', title: 'Top Performers', data_source: 'top_performers' }
    ],
    layout: [
      { widget_config_id: 1, x: 0, y: 0, w: 4, h: 3 },
      { widget_config_id: 2, x: 4, y: 0, w: 8, h: 3 },
      { widget_config_id: 3, x: 0, y: 3, w: 12, h: 4 }
    ],
    tags: ['performance', 'analytics', 'teams']
  },
  {
    id: 3,
    name: 'Operational Overview',
    description: 'Day-to-day operational metrics and monitoring',
    category: 'operational',
    preview_image: '/templates/operational-overview.png',
    widgets: [
      { type: 'kpi_card', title: 'Active Users', data_source: 'active_users' },
      { type: 'kpi_card', title: 'System Health', data_source: 'system_health' },
      { type: 'line_chart', title: 'Activity Timeline', data_source: 'activity_timeline' },
      { type: 'heatmap', title: 'Usage Patterns', data_source: 'usage_patterns' }
    ],
    layout: [
      { widget_config_id: 1, x: 0, y: 0, w: 3, h: 2 },
      { widget_config_id: 2, x: 3, y: 0, w: 3, h: 2 },
      { widget_config_id: 3, x: 6, y: 0, w: 6, h: 3 },
      { widget_config_id: 4, x: 0, y: 2, w: 6, h: 3 }
    ],
    tags: ['operational', 'monitoring', 'real-time']
  }
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onSelect,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Load templates (using mock data for now)
  const { data: templates = MOCK_TEMPLATES, isLoading } = useQuery({
    queryKey: ['dashboard-templates'],
    queryFn: () => Promise.resolve(MOCK_TEMPLATES), // Replace with actual API call
    enabled: open
  });

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      setSelectedTemplate(null);
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive': return <AssessmentIcon />;
      case 'performance': return <BarChartIcon />;
      case 'analytics': return <LineChartIcon />;
      case 'operational': return <PieChartIcon />;
      default: return <DashboardIcon />;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <DashboardIcon />
          Select Dashboard Template
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Search and Filter */}
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {TEMPLATE_CATEGORIES.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Selected Template Info */}
          {selectedTemplate && (
            <Alert severity="info">
              Selected: <strong>{selectedTemplate.name}</strong> - {selectedTemplate.description}
            </Alert>
          )}

          {/* Templates Grid */}
          <Grid container spacing={2}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedTemplate?.id === template.id ? 2 : 1,
                    borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      boxShadow: 3,
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Template Preview */}
                  <CardMedia
                    sx={{
                      height: 120,
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getCategoryIcon(template.category)}
                  </CardMedia>
                  
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" component="h3">
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {template.description}
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                      {template.tags.map((tag: string) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {template.widgets.length} widgets
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* No Results */}
          {filteredTemplates.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No templates found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or category filter
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmSelection}
          disabled={!selectedTemplate}
        >
          Use Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSelector;