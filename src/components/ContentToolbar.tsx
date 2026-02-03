"use client";

import { SearchBar } from "./SearchBar";
import { FilterBar, FilterGroup } from "./FilterBar";
import { SortBar, SortOption } from "./SortBar";

interface ContentToolbarProps {
  // Search
  searchPlaceholder?: string;
  onSearch: (query: string) => void;
  
  // Filter
  filterGroups?: FilterGroup[];
  onFilterChange?: (filters: Record<string, string | string[]>) => void;
  
  // Sort
  sortOptions?: SortOption[];
  onSortChange?: (sortBy: string) => void;
  defaultSort?: string;
  
  className?: string;
}

export function ContentToolbar({
  searchPlaceholder = "Cari...",
  onSearch,
  filterGroups = [],
  onFilterChange,
  sortOptions = [],
  onSortChange,
  defaultSort,
  className = "",
}: ContentToolbarProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Search Bar - Takes full width on mobile, flex-1 on desktop */}
      <div className="flex-1">
        <SearchBar 
          placeholder={searchPlaceholder} 
          onSearch={onSearch}
        />
      </div>

      {/* Filter and Sort - Side by side */}
      <div className="flex gap-3">
        {/* Filter */}
        {filterGroups.length > 0 && onFilterChange && (
          <FilterBar 
            filterGroups={filterGroups}
            onFilterChange={onFilterChange}
          />
        )}

        {/* Sort */}
        {sortOptions.length > 0 && onSortChange && (
          <SortBar 
            options={sortOptions}
            onSortChange={onSortChange}
            defaultSort={defaultSort}
          />
        )}
      </div>
    </div>
  );
}
