import React, { useState, useMemo } from 'react';

// Main Table component
export const Table = ({ 
  children, 
  className = '',
  striped = false,
  bordered = false,
  hover = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const tableClasses = `
    w-full border-collapse
    ${sizeClasses[size]}
    ${striped ? 'table-striped' : ''}
    ${bordered ? 'border border-gray-200' : ''}
    ${hover ? 'table-hover' : ''}
    ${className}
  `;

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        {children}
      </table>
    </div>
  );
};

// Table Header
export const TableHeader = ({ children, className = '' }) => {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
};

// Table Body
export const TableBody = ({ children, className = '' }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
};

// Table Row
export const TableRow = ({ 
  children, 
  className = '',
  onClick,
  selected = false,
  disabled = false
}) => {
  const rowClasses = `
    ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
    ${selected ? 'bg-blue-50' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    transition-colors duration-150
    ${className}
  `;

  return (
    <tr className={rowClasses} onClick={disabled ? undefined : onClick}>
      {children}
    </tr>
  );
};

// Table Header Cell
export const TableHeaderCell = ({ 
  children, 
  className = '',
  sortable = false,
  sortDirection = null,
  onSort,
  align = 'left'
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const handleSort = () => {
    if (sortable && onSort) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(newDirection);
    }
  };

  return (
    <th 
      className={`
        px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider
        ${alignClasses[align]}
        ${sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
        ${className}
      `}
      onClick={handleSort}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <svg 
              className={`w-3 h-3 ${sortDirection === 'asc' ? 'text-gray-900' : 'text-gray-400'}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <svg 
              className={`w-3 h-3 -mt-1 ${sortDirection === 'desc' ? 'text-gray-900' : 'text-gray-400'}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </th>
  );
};

// Table Cell
export const TableCell = ({ 
  children, 
  className = '',
  align = 'left'
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <td className={`px-6 py-4 whitespace-nowrap ${alignClasses[align]} ${className}`}>
      {children}
    </td>
  );
};

// Data Table with built-in sorting and filtering
export const DataTable = ({ 
  data = [],
  columns = [],
  sortable = true,
  filterable = true,
  searchable = true,
  pagination = true,
  pageSize = 10,
  className = '',
  onRowClick,
  rowSelection = false,
  onSelectionChange
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filterConfig, setFilterConfig] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(filterConfig).forEach(([key, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row => {
          const value = row[key];
          return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, columns, sortConfig, filterConfig, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = pagination 
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilter = (key, value) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowSelection = (rowIndex, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowIndex);
    } else {
      newSelected.delete(rowIndex);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIndices = paginatedData.map((_, index) => (currentPage - 1) * pageSize + index);
      setSelectedRows(new Set(allIndices));
      onSelectionChange?.(allIndices);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  return (
    <div className={`bg-white shadow-sm rounded-lg overflow-hidden ${className}`}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="p-4 border-b border-gray-200">
          {searchable && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {filterable && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {columns.filter(col => col.filterable).map(column => (
                <div key={column.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {column.title}
                  </label>
                  <input
                    type="text"
                    placeholder={`Filter ${column.title}`}
                    value={filterConfig[column.key] || ''}
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {rowSelection && (
              <TableHeaderCell>
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </TableHeaderCell>
            )}
            {columns.map(column => (
              <TableHeaderCell
                key={column.key}
                sortable={sortable && column.sortable !== false}
                sortDirection={sortConfig.key === column.key ? sortConfig.direction : null}
                onSort={() => handleSort(column.key)}
                align={column.align}
              >
                {column.title}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {paginatedData.map((row, index) => {
            const globalIndex = (currentPage - 1) * pageSize + index;
            return (
              <TableRow
                key={row.id || index}
                onClick={() => onRowClick?.(row, index)}
                selected={selectedRows.has(globalIndex)}
              >
                {rowSelection && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(globalIndex)}
                      onChange={(e) => handleRowSelection(globalIndex, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </TableCell>
                )}
                {columns.map(column => (
                  <TableCell key={column.key} align={column.align}>
                    {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
          <p className="mt-1 text-sm text-gray-500">No records match your search criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;