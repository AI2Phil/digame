import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Typography,
  Grid,
  Button,
  IconButton,
  Collapse
} from '@mui/material';
import {
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface DashboardFiltersProps {
  filters: any;
  timeRange: any;
  onFiltersChange: (filters: any) => void;
  onTimeRangeChange: (timeRange: any) => void;
  sx?: any;
}

const TIME_RANGE_PRESETS = [
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Custom', value: 'custom' }
];

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  timeRange,
  onFiltersChange,
  onTimeRangeChange,
  sx
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleTimeRangeChange = (preset: string) => {
    if (preset === 'custom') {
      onTimeRangeChange({ ...timeRange, preset, custom: true });
    } else {
      const now = new Date();
      let startDate = new Date();
      
      switch (preset) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }
      
      onTimeRangeChange({
        preset,
        startDate,
        endDate: now,
        custom: false
      });
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    onTimeRangeChange({});
  };

  const activeFiltersCount = Object.keys(filters).length + (timeRange.preset ? 1 : 0);

  return (
    <Card sx={sx}>
      <CardContent sx={{ pb: expanded ? 2 : 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <FilterIcon />
            <Typography variant="subtitle1">
              Filters
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
              />
            )}
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {activeFiltersCount > 0 && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
              >
                Clear All
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Time Range Filter */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange.preset || ''}
                    label="Time Range"
                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                  >
                    {TIME_RANGE_PRESETS.map((preset) => (
                      <MenuItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Custom Date Range */}
              {timeRange.custom && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="Start Date"
                      value={timeRange.startDate}
                      onChange={(date) => onTimeRangeChange({
                        ...timeRange,
                        startDate: date
                      })}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="End Date"
                      value={timeRange.endDate}
                      onChange={(date) => onTimeRangeChange({
                        ...timeRange,
                        endDate: date
                      })}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true }
                      }}
                    />
                  </Grid>
                </LocalizationProvider>
              )}

              {/* Department Filter */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department || ''}
                    label="Department"
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    <MenuItem value="engineering">Engineering</MenuItem>
                    <MenuItem value="sales">Sales</MenuItem>
                    <MenuItem value="marketing">Marketing</MenuItem>
                    <MenuItem value="hr">Human Resources</MenuItem>
                    <MenuItem value="finance">Finance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Team Filter */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Team</InputLabel>
                  <Select
                    value={filters.team || ''}
                    label="Team"
                    onChange={(e) => handleFilterChange('team', e.target.value)}
                  >
                    <MenuItem value="">All Teams</MenuItem>
                    <MenuItem value="frontend">Frontend</MenuItem>
                    <MenuItem value="backend">Backend</MenuItem>
                    <MenuItem value="devops">DevOps</MenuItem>
                    <MenuItem value="qa">Quality Assurance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Search Filter */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name, email, or ID..."
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;