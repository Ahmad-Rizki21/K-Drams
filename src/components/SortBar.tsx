"use client";

import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

export interface SortOption {
  label: string;
  value: string;
}

interface SortBarProps {
  options: SortOption[];
  onSortChange: (sortBy: string) => void;
  defaultSort?: string;
  className?: string;
}

export function SortBar({ options, onSortChange, defaultSort, className = "" }: SortBarProps) {
  const [selectedSort, setSelectedSort] = useState(defaultSort || options[0]?.value || "");

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    onSortChange(value);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
      <select
        value={selectedSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="px-3 py-2 bg-background/50 border border-border rounded-lg text-sm 
                   text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 
                   focus:border-primary transition-all duration-200 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
