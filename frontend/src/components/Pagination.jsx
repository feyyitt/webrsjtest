import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage 
}) => {
  const pages = [];
  const maxPagesToShow = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-accent-800 border-t border-accent-200 dark:border-accent-700">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-accent-300 dark:border-accent-600 text-sm font-medium rounded-lg text-accent-700 dark:text-accent-300 bg-white dark:bg-accent-900 hover:bg-accent-50 dark:hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-accent-300 dark:border-accent-600 text-sm font-medium rounded-lg text-accent-700 dark:text-accent-300 bg-white dark:bg-accent-900 hover:bg-accent-50 dark:hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-accent-700 dark:text-accent-300">
            Menampilkan <span className="font-semibold">{startItem}</span> sampai{' '}
            <span className="font-semibold">{endItem}</span> dari{' '}
            <span className="font-semibold">{totalItems}</span> data
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-sm font-medium text-accent-700 dark:text-accent-300 hover:bg-accent-50 dark:hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${
                  page === currentPage
                    ? 'z-10 bg-gradient-to-r from-primary-600 to-primary-700 border-primary-600 text-white shadow-md'
                    : 'bg-white dark:bg-accent-900 border-accent-300 dark:border-accent-600 text-accent-700 dark:text-accent-300 hover:bg-accent-50 dark:hover:bg-accent-700'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-accent-300 dark:border-accent-600 bg-white dark:bg-accent-900 text-sm font-medium text-accent-700 dark:text-accent-300 hover:bg-accent-50 dark:hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
