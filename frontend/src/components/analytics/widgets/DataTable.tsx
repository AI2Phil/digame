import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  MoreVert as MoreIcon,
  TrendingUp,
  TrendingDown,
  TableChart as TableIcon
} from '@mui/icons-material';

interface Column {
  id: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  sortable?: boolean;
  filterable?: boolean;
  format?: (value: any) => string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
}

interface DataTableProps {
  data: any;
  options?: {
    title?: string;
    subtitle?: string;
    columns?: Column[];
    show_pagination?: boolean;
    show_search?: boolean;
    show_filters?: boolean;
    show_export?: boolean;
    page_size?: number;
    sortable?: boolean;
    selectable?: boolean;
    dense?: boolean;
    striped?: boolean;
    hover?: boolean;
    height?: number;
    responsive?: boolean;
  };
  title?: string;
  isLoading?: boolean;
}

type Order = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({
  data,
  options = {},
  title,
  isLoading = false
}) => {
  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(options.page_size || 10);
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<Order>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Process and enhance data
  const processedData = useMemo(() => {
    if (!data) {
      // Enhanced sample data with realistic business patterns
      const sampleData = {
        columns: [
          { id: 'id', label: 'ID', type: 'number', sortable: true },
          { id: 'name', label: 'Customer Name', type: 'string', sortable: true },
          { id: 'email', label: 'Email', type: 'string', sortable: true },
          { id: 'revenue', label: 'Revenue', type: 'currency', sortable: true, align: 'right' },
          { id: 'growth', label: 'Growth', type: 'percentage', sortable: true, align: 'right' },
          { id: 'status', label: 'Status', type: 'string', sortable: true },
          { id: 'lastActivity', label: 'Last Activity', type: 'date', sortable: true }
        ],
        rows: [
          { id: 1, name: 'Acme Corp', email: 'contact@acme.com', revenue: 125000, growth: 15.2, status: 'active', lastActivity: '2024-01-05' },
          { id: 2, name: 'TechStart Inc', email: 'hello@techstart.com', revenue: 89000, growth: -2.1, status: 'inactive', lastActivity: '2024-01-03' },
          { id: 3, name: 'Global Solutions', email: 'info@global.com', revenue: 234000, growth: 8.7, status: 'active', lastActivity: '2024-01-06' },
          { id: 4, name: 'Innovation Labs', email: 'team@innovation.com', revenue: 156000, growth: 22.3, status: 'active', lastActivity: '2024-01-04' },
          { id: 5, name: 'Digital Dynamics', email: 'support@digital.com', revenue: 67000, growth: -5.4, status: 'pending', lastActivity: '2024-01-02' }
        ]
      };
      return sampleData;
    }

    // Handle different data formats
    if (Array.isArray(data)) {
      // Simple array format - auto-detect columns
      if (data.length > 0) {
        const firstRow = data[0];
        const autoColumns = Object.keys(firstRow).map(key => ({
          id: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          type: typeof firstRow[key] === 'number' ? 'number' : 'string',
          sortable: true
        }));
        
        return {
          columns: autoColumns,
          rows: data
        };
      }
      return { columns: [], rows: [] };
    }

    // Enhanced object format
    if (data.columns && data.rows) {
      return {
        columns: data.columns.map((col: any) => ({
          id: col.id || col.key || col.field,
          label: col.label || col.title || col.header,
          type: col.type || 'string',
          sortable: col.sortable !== false,
          filterable: col.filterable !== false,
          format: col.format,
          align: col.align || 'left',
          width: col.width
        })),
        rows: data.rows || []
      };
    }

    return { columns: [], rows: [] };
  }, [data]);

  // Use provided columns or auto-detected ones
  const columns = options.columns || processedData.columns;

  // Format cell value based on column type
  const formatCellValue = (value: any, column: Column) => {
    if (value === null || value === undefined) return '-';
    
    if (column.format) {
      return column.format(value);
    }

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${Number(value).toFixed(1)}%`;
      case 'number':
        return Number(value).toLocaleString();
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  };

  // Get status color for status-type columns
  const getStatusColor = (value: string) => {
    switch (value.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'success':
        return 'success';
      case 'inactive':
      case 'failed':
      case 'error':
        return 'error';
      case 'pending':
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Render cell content with appropriate formatting
  const renderCellContent = (value: any, column: Column) => {
    if (column.id === 'status' || column.label.toLowerCase().includes('status')) {
      return (
        <Chip
          label={formatCellValue(value, column)}
          color={getStatusColor(value) as any}
          size="small"
          variant="outlined"
        />
      );
    }

    if (column.type === 'percentage') {
      const numValue = Number(value);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {numValue > 0 ? (
            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
          ) : numValue < 0 ? (
            <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
          ) : null}
          <Typography
            variant="body2"
            sx={{
              color: numValue > 0 ? 'success.main' : numValue < 0 ? 'error.main' : 'text.primary',
              fontWeight: 600
            }}
          >
            {formatCellValue(value, column)}
          </Typography>
        </Box>
      );
    }

    return formatCellValue(value, column);
  };

  // Sorting logic
  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData.rows;

    // Apply search filter
    if (searchTerm && options.show_search !== false) {
      filtered = filtered.filter((row: any) =>
        columns.some(column =>
          String(row[column.id] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (orderBy && options.sortable !== false) {
      filtered = [...filtered].sort((a: any, b: any) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return order === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (order === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [processedData.rows, searchTerm, orderBy, order, columns, options]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (options.show_pagination === false) return filteredAndSortedData;
    
    const startIndex = page * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage, options.show_pagination]);

  // Calculate summary statistics
  const statistics = useMemo(() => {
    const totalRows = processedData.rows.length;
    const filteredRows = filteredAndSortedData.length;
    const numericColumns = columns.filter(col => col.type === 'number' || col.type === 'currency');
    
    const summaries = numericColumns.map(column => {
      const values = processedData.rows
        .map((row: any) => Number(row[column.id]))
        .filter((val: number) => !isNaN(val));
      
      if (values.length === 0) return null;
      
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      return {
        column: column.id,
        label: column.label,
        sum,
        avg,
        max,
        min,
        type: column.type
      };
    }).filter(Boolean);
    
    return {
      totalRows,
      filteredRows,
      summaries
    };
  }, [processedData.rows, filteredAndSortedData, columns]);

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableIcon className="w-5 h-5 text-blue-600" />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {options.title || title || 'Data Table'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${statistics.filteredRows} rows`}
              size="small"
              variant="outlined"
              color="primary"
            />
            
            {options.show_export !== false && (
              <Tooltip title="Export data">
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Subtitle */}
        {options.subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {options.subtitle}
          </Typography>
        )}

        {/* Search and Filters */}
        {(options.show_search !== false || options.show_filters !== false) && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {options.show_search !== false && (
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 200 }}
              />
            )}
            
            {options.show_filters !== false && (
              <Button
                startIcon={<FilterIcon />}
                variant="outlined"
                size="small"
                disabled
              >
                Filters
              </Button>
            )}
          </Box>
        )}

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            flex: 1,
            maxHeight: options.height || 400,
            border: 1,
            borderColor: 'divider'
          }}
        >
          <Table
            size={options.dense ? 'small' : 'medium'}
            stickyHeader
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'grey.50',
                      width: column.width
                    }}
                  >
                    {column.sortable !== false && options.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row: any, index: number) => (
                <TableRow
                  key={row.id || index}
                  hover={options.hover !== false}
                  sx={{
                    bgcolor: options.striped && index % 2 === 1 ? 'grey.25' : 'transparent'
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                    >
                      {renderCellContent(row[column.id], column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {options.show_pagination !== false && (
          <TablePagination
            component="div"
            count={filteredAndSortedData.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}

        {/* Summary Statistics */}
        {statistics.summaries.length > 0 && (
          <Box sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 2
          }}>
            {statistics.summaries.slice(0, 4).map((summary: any) => (
              <Box key={summary.column} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {summary.label} (Avg)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {summary.type === 'currency'
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary.avg)
                    : summary.avg.toLocaleString(undefined, { maximumFractionDigits: 1 })
                  }
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Export Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ExportIcon sx={{ mr: 1 }} />
            Export as CSV
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ExportIcon sx={{ mr: 1 }} />
            Export as Excel
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default DataTable;