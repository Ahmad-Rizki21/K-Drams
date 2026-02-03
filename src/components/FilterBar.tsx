"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  type: "single" | "multiple";
}

interface FilterBarProps {
  filterGroups: FilterGroup[];
  onFilterChange: (filters: Record<string, string | string[]>) => void;
  className?: string;
}

export function FilterBar({ filterGroups, onFilterChange, className = "" }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string | string[]>>({});

  const handleFilterChange = (groupId: string, value: string, type: "single" | "multiple") => {
    let newFilters = { ...selectedFilters };

    if (type === "single") {
      if (newFilters[groupId] === value) {
        delete newFilters[groupId];
      } else {
        newFilters[groupId] = value;
      }
    } else {
      const currentValues = (newFilters[groupId] as string[]) || [];
      if (currentValues.includes(value)) {
        const filtered = currentValues.filter(v => v !== value);
        if (filtered.length === 0) {
          delete newFilters[groupId];
        } else {
          newFilters[groupId] = filtered;
        }
      } else {
        newFilters[groupId] = [...currentValues, value];
      }
    }

    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(selectedFilters).length;

  return (
    <div className={`relative ${className}`}>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-background/50 border border-border 
                   rounded-lg text-sm font-medium text-foreground hover:bg-background/80 
                   transition-all duration-200"
      >
        <Filter className="w-4 h-4" />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-background border border-border 
                          rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Filter</h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Groups */}
            <div className="max-h-96 overflow-y-auto">
              {filterGroups.map((group) => (
                <div key={group.id} className="px-4 py-3 border-b border-border last:border-b-0">
                  <h4 className="text-sm font-medium text-foreground mb-2">{group.label}</h4>
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = group.type === "single"
                        ? selectedFilters[group.id] === option.value
                        : ((selectedFilters[group.id] as string[]) || []).includes(option.value);

                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type={group.type === "single" ? "radio" : "checkbox"}
                            name={group.id}
                            checked={isSelected}
                            onChange={() => handleFilterChange(group.id, option.value, group.type)}
                            className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary/50"
                          />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
