'use client';

import { Search, X } from 'lucide-react';
import { Input, Button } from '@package/ui';
import type { BookmarkFilters as Filters, CategoryWithCount, Importance } from '@/types';

interface BookmarkFiltersProps {
  filters: Filters;
  categories: CategoryWithCount[];
  onChange: (filters: Filters) => void;
}

const importanceOptions: { value: Importance; label: string }[] = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'LOW', label: 'Low' },
];

export function BookmarkFilters({ filters, categories, onChange }: BookmarkFiltersProps) {
  const hasFilters = filters.search || filters.categoryId || filters.importance?.length || filters.isPinned;

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          placeholder="Search bookmarks..."
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <select
        value={filters.categoryId ?? ''}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value || undefined })}
        className="h-10 rounded border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon && `${cat.icon} `}{cat.name} ({cat._count.bookmarks})
          </option>
        ))}
      </select>

      {/* Importance Filter */}
      <select
        value={filters.importance?.[0] ?? ''}
        onChange={(e) => onChange({ ...filters, importance: e.target.value ? [e.target.value as Importance] : undefined })}
        className="h-10 rounded border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Importance</option>
        {importanceOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Pinned Filter */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.isPinned ?? false}
          onChange={(e) => onChange({ ...filters, isPinned: e.target.checked || undefined })}
          className="h-4 w-4 rounded border-gray-300"
        />
        Pinned only
      </label>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
