import React from 'react';
import { Search, Filter } from 'lucide-react';
import { EVENT_COLORS } from '../../utils/constants';

const SearchFilter = ({ 
  searchQuery, 
  onSearchChange, 
  colorFilter, 
  onColorFilterChange 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6 bg-white p-4 rounded-lg shadow-md">
      {/* Search input */}
      <div className="relative w-full sm:max-w-lg">
        <label htmlFor="search" className="sr-only">Search events</label>
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          id="search"
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-5 py-3 rounded-lg border border-gray-300 bg-gray-50 shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
        />
      </div>

      {/* Color filter dropdown */}
      <div className="flex items-center gap-3">
        <Filter className="text-gray-500" size={18} />
        <label htmlFor="colorFilter" className="text-gray-700 text-sm hidden sm:block">
          Filter by color
        </label>
        <select
          id="colorFilter"
          value={colorFilter}
          onChange={(e) => onColorFilterChange(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
        >
          <option value="all">All Colors</option>
          {EVENT_COLORS.map((color) => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;
