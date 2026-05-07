import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, ChevronLeft, ChevronRight as ChevronRightIcon, AlertCircle } from 'lucide-react';

/**
 * Skeleton Loader Component
 */
export const SkeletonLoader: React.FC<{ count?: number; variant?: 'card' | 'table-row' | 'text' }> = ({ 
  count = 1, 
  variant = 'card' 
}) => {
  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 p-3 bg-white/5 rounded animate-pulse">
            <div className="h-4 bg-white/10 rounded flex-1"></div>
            <div className="h-4 bg-white/10 rounded w-32"></div>
            <div className="h-4 bg-white/10 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-3 bg-white/10 rounded w-full animate-pulse"></div>
      ))}
    </div>
  );
};

/**
 * Breadcrumb Component
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 mb-6 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <a
              href={item.href}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.location.href = item.href!;
                }
              }}
            >
              {item.label}
            </a>
          ) : item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  item.onClick?.();
                }
              }}
            >
              {item.label}
            </button>
          ) : (
            <span className="text-white/60">{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight size={16} className="text-white/40" />}
        </div>
      ))}
    </nav>
  );
};

/**
 * Empty State Component
 */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4 text-white/40">
        {icon || <AlertCircle size={48} />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-white/60 text-sm mb-6 max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200 text-sm font-medium"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              action.onClick();
            }
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Search and Filter Bar
 */
export interface SearchOptions {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchOptions> = ({ 
  placeholder = 'Search...', 
  onSearch, 
  debounceMs = 300 
}) => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
        aria-label="Search"
      />
    </div>
  );
};

/**
 * Pagination Component
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-white/10">
      <div className="text-sm text-white/60">
        {itemsPerPage && totalItems && (
          <>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
          aria-label="Previous page"
          tabIndex={currentPage === 1 ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentPage > 1) {
              onPageChange(currentPage - 1);
            }
          }}
        >
          <ChevronLeft size={18} className="text-white/60" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 rounded-lg transition-all duration-200 text-sm font-medium ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                aria-label={`Go to page ${pageNum}`}
                aria-current={pageNum === currentPage ? 'page' : undefined}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onPageChange(pageNum);
                  }
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
          aria-label="Next page"
          tabIndex={currentPage === totalPages ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentPage < totalPages) {
              onPageChange(currentPage + 1);
            }
          }}
        >
          <ChevronRightIcon size={18} className="text-white/60" />
        </button>
      </div>
    </div>
  );
};

/**
 * Filter Chip Component
 */
export const FilterChip: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-white/10 text-white/70 hover:bg-white/20'
      }`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onClick();
        }
      }}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
};

/**
 * Table with Keyboard Navigation and Focus Management
 */
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export const KeyboardNavigableTable: React.FC<{
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  rowsPerPage?: number;
  onRowClick?: (row: any) => void;
}> = ({
  columns,
  data,
  loading = false,
  rowsPerPage = 10,
  onRowClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  const [focusedCol, setFocusedCol] = useState<number>(0);

  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number) => {
    if (e.key === 'ArrowUp' && rowIndex > 0) {
      setFocusedRow(rowIndex - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowDown' && rowIndex < paginatedData.length - 1) {
      setFocusedRow(rowIndex + 1);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      onRowClick?.(paginatedData[rowIndex]);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && focusedCol > 0) {
      setFocusedCol(focusedCol - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && focusedCol < columns.length - 1) {
      setFocusedCol(focusedCol + 1);
      e.preventDefault();
    }
  };

  if (loading) {
    return <SkeletonLoader count={rowsPerPage} variant="table-row" />;
  }

  if (data.length === 0) {
    return <EmptyState title="No data available" description="Try adjusting your search or filters" />;
  }

  return (
    <>
      <div className="overflow-x-auto border border-white/10 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-white/70 font-semibold" style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => handleKeyDown(e, rowIndex)}
                onMouseEnter={() => setFocusedRow(rowIndex)}
                className={`transition-all duration-200 cursor-pointer ${
                  focusedRow === rowIndex
                    ? 'bg-blue-600/20 outline outline-2 outline-blue-500'
                    : 'hover:bg-white/5'
                }`}
                tabIndex={0}
                role="button"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-white/80 ${
                      focusedRow === rowIndex && focusedCol === colIndex
                        ? 'ring-1 ring-blue-400'
                        : ''
                    }`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={rowsPerPage}
          totalItems={data.length}
        />
      )}
    </>
  );
};
