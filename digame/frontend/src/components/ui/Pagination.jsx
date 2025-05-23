import React from 'react';

// Main Pagination component
export const Pagination = ({ 
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = '',
  size = 'md', // sm, md, lg
  variant = 'default' // default, outline, minimal
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const variantClasses = {
    default: {
      active: 'bg-blue-600 text-white border-blue-600',
      inactive: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
      disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
    },
    outline: {
      active: 'bg-blue-50 text-blue-600 border-blue-600',
      inactive: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50',
      disabled: 'bg-transparent text-gray-400 border-gray-200 cursor-not-allowed'
    },
    minimal: {
      active: 'bg-blue-600 text-white',
      inactive: 'bg-transparent text-gray-700 hover:bg-gray-100',
      disabled: 'bg-transparent text-gray-400 cursor-not-allowed'
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  const renderButton = (content, page, isActive = false, isDisabled = false) => {
    const baseClasses = `
      inline-flex items-center justify-center border transition-colors duration-200
      ${sizeClasses[size]}
      ${variant === 'minimal' ? 'border-0 rounded-md' : 'border rounded-md'}
    `;
    
    const stateClasses = isDisabled 
      ? variantClasses[variant].disabled
      : isActive 
        ? variantClasses[variant].active
        : variantClasses[variant].inactive;

    return (
      <button
        key={`page-${page}`}
        onClick={() => handlePageChange(page)}
        disabled={isDisabled}
        className={`${baseClasses} ${stateClasses}`}
        aria-label={typeof content === 'string' ? `Go to page ${page}` : content}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </button>
    );
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className={`flex items-center space-x-1 ${className}`} aria-label="Pagination">
      {/* First Page */}
      {showFirstLast && currentPage > 1 && (
        <>
          {renderButton('First', 1)}
          {visiblePages[0] > 2 && (
            <span className="px-2 text-gray-500">...</span>
          )}
        </>
      )}

      {/* Previous Page */}
      {showPrevNext && (
        renderButton(
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>,
          currentPage - 1,
          false,
          currentPage <= 1
        )
      )}

      {/* Page Numbers */}
      {showPageNumbers && visiblePages.map(page => 
        renderButton(page, page, page === currentPage)
      )}

      {/* Next Page */}
      {showPrevNext && (
        renderButton(
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>,
          currentPage + 1,
          false,
          currentPage >= totalPages
        )
      )}

      {/* Last Page */}
      {showFirstLast && currentPage < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-500">...</span>
          )}
          {renderButton('Last', totalPages)}
        </>
      )}
    </nav>
  );
};

// Simple Pagination (Previous/Next only)
export const SimplePagination = ({ 
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showLabels = true,
  className = ''
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1);
    }
  };

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <button
        onClick={handlePrevious}
        disabled={currentPage <= 1}
        className="
          flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700
          bg-white border border-gray-300 rounded-md hover:bg-gray-50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {showLabels && <span>Previous</span>}
      </button>

      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className="
          flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700
          bg-white border border-gray-300 rounded-md hover:bg-gray-50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
      >
        {showLabels && <span>Next</span>}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
};

// Pagination Info
export const PaginationInfo = ({ 
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  className = ''
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`text-sm text-gray-700 ${className}`}>
      Showing {startItem} to {endItem} of {totalItems} results
    </div>
  );
};

// Pagination with Info
export const PaginationWithInfo = ({ 
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <PaginationInfo 
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
      />
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

// Page Size Selector
export const PageSizeSelector = ({ 
  pageSize = 10,
  onPageSizeChange,
  options = [10, 25, 50, 100],
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-700">Show</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
        className="
          px-3 py-1 text-sm border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        "
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-700">per page</span>
    </div>
  );
};

// Complete Pagination (with page size selector and info)
export const CompletePagination = ({ 
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 ${className}`}>
      <div className="flex items-center space-x-4">
        <PaginationInfo 
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
        />
        <PageSizeSelector 
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          options={pageSizeOptions}
        />
      </div>
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

// Hook for pagination logic
export const usePagination = ({ 
  totalItems = 0, 
  pageSize = 10, 
  initialPage = 1 
}) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = React.useState(pageSize);

  const totalPages = Math.ceil(totalItems / currentPageSize);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const getPageData = (data) => {
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return data.slice(startIndex, endIndex);
  };

  return {
    currentPage,
    totalPages,
    pageSize: currentPageSize,
    handlePageChange,
    handlePageSizeChange,
    getPageData
  };
};

export default Pagination;