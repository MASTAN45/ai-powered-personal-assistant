import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Tag, AlertCircle } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading?: boolean;
  resultCount?: number;
}

export interface SearchFilters {
  classification?: string;
  priority?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  client?: string;
  hasDeadline?: boolean;
  needsReview?: boolean;
  hasDraft?: boolean;
}

export default function AdvancedSearch({ onSearch, isLoading, resultCount }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(searchQuery, filters);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, filters]);

  const clearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sender, subject, or content..."
          className="w-full pl-10 pr-24 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
            showFilters || activeFilterCount > 0
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && <span className="text-xs font-semibold">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Active Filters Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          {filters.classification && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm">
              Classification: {filters.classification}
              <button onClick={() => updateFilter('classification', undefined)} className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm">
              Priority: {filters.priority}
              <button onClick={() => updateFilter('priority', undefined)} className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
              Status: {filters.status}
              <button onClick={() => updateFilter('status', undefined)} className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
              Date Range
              <button onClick={() => { updateFilter('dateFrom', undefined); updateFilter('dateTo', undefined); }} className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Classification Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Classification
              </label>
              <select
                value={filters.classification || ''}
                onChange={(e) => updateFilter('classification', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="">All</option>
                <option value="CLIENT_TO_REPLY">Client to Reply</option>
                <option value="ASSISTANT_TO_REPLY">Assistant to Reply</option>
                <option value="NO_REPLY_NEEDED">No Reply Needed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => updateFilter('priority', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="">All</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilter('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* Boolean Filters */}
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.needsReview || false}
                onChange={(e) => updateFilter('needsReview', e.target.checked || undefined)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Needs Human Review</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasDeadline || false}
                onChange={(e) => updateFilter('hasDeadline', e.target.checked || undefined)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Has Deadline</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasDraft || false}
                onChange={(e) => updateFilter('hasDraft', e.target.checked || undefined)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Has Saved Draft</span>
            </label>
          </div>
        </div>
      )}

      {/* Results Count */}
      {resultCount !== undefined && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? (
            <span>Searching...</span>
          ) : (
            <span>{resultCount} {resultCount === 1 ? 'result' : 'results'} found</span>
          )}
        </div>
      )}
    </div>
  );
}