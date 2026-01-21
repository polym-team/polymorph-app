'use client';

import { Loader2 } from 'lucide-react';
import { BookmarkCard } from './BookmarkCard';
import type { BookmarkWithRelations } from '@/types';

interface BookmarkListProps {
  bookmarks: BookmarkWithRelations[];
  loading?: boolean;
  onEdit?: (bookmark: BookmarkWithRelations) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
}

export function BookmarkList({
  bookmarks,
  loading = false,
  onEdit,
  onDelete,
  onTogglePin,
}: BookmarkListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500">No bookmarks found</p>
        <p className="mt-1 text-sm text-gray-400">
          Create your first bookmark to get started
        </p>
      </div>
    );
  }

  // Group bookmarks by importance for onboarding view
  const criticalBookmarks = bookmarks.filter((b) => b.importance === 'CRITICAL');
  const highBookmarks = bookmarks.filter((b) => b.importance === 'HIGH');
  const normalBookmarks = bookmarks.filter((b) => b.importance === 'NORMAL');
  const lowBookmarks = bookmarks.filter((b) => b.importance === 'LOW');

  const hasImportantBookmarks = criticalBookmarks.length > 0 || highBookmarks.length > 0;

  return (
    <div className="space-y-6">
      {/* Important Bookmarks Section (for onboarding) */}
      {hasImportantBookmarks && (
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-3 font-semibold text-amber-800">
            Important for Onboarding
          </h3>
          <div className="space-y-3">
            {criticalBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
              />
            ))}
            {highBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Bookmarks */}
      {(normalBookmarks.length > 0 || lowBookmarks.length > 0) && (
        <div className="space-y-3">
          {hasImportantBookmarks && (
            <h3 className="font-medium text-gray-700">Other Resources</h3>
          )}
          {normalBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
            />
          ))}
          {lowBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
