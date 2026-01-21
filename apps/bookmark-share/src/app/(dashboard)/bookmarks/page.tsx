'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@package/ui';
import { useOrg } from '@/lib/OrgContext';
import { useBookmarks, useCategories } from '@/hooks';
import { BookmarkList, BookmarkFilters, BookmarkForm } from '@/components/bookmark';
import type { BookmarkWithRelations, BookmarkFilters as Filters, BookmarkFormData } from '@/types';

export default function BookmarksPage() {
  const { selectedOrg } = useOrg();
  const { bookmarks, loading, fetchBookmarks, createBookmark, updateBookmark, deleteBookmark } = useBookmarks();
  const { categories, fetchCategories } = useCategories();
  const [filters, setFilters] = useState<Filters>({});
  const [showForm, setShowForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkWithRelations | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (selectedOrg) {
      fetchBookmarks(selectedOrg.id, filters);
      fetchCategories(selectedOrg.id);
    }
  }, [selectedOrg, filters, fetchBookmarks, fetchCategories]);

  const handleCreateBookmark = useCallback(async (data: BookmarkFormData) => {
    if (!selectedOrg) return;
    setFormLoading(true);
    try {
      await createBookmark(selectedOrg.id, data);
      setShowForm(false);
    } finally {
      setFormLoading(false);
    }
  }, [selectedOrg, createBookmark]);

  const handleUpdateBookmark = useCallback(async (data: BookmarkFormData) => {
    if (!editingBookmark) return;
    setFormLoading(true);
    try {
      await updateBookmark(editingBookmark.id, data);
      setEditingBookmark(null);
    } finally {
      setFormLoading(false);
    }
  }, [editingBookmark, updateBookmark]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      await deleteBookmark(id);
    }
  }, [deleteBookmark]);

  const handleTogglePin = useCallback(async (id: string, isPinned: boolean) => {
    await updateBookmark(id, { isPinned });
  }, [updateBookmark]);

  const handleEdit = useCallback((bookmark: BookmarkWithRelations) => {
    setEditingBookmark(bookmark);
    setShowForm(false);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingBookmark(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <Button onClick={() => { setShowForm(true); setEditingBookmark(null); }}>
          <Plus className="mr-1 h-4 w-4" />
          Add Bookmark
        </Button>
      </div>

      {/* Form Modal/Panel */}
      {(showForm || editingBookmark) && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingBookmark ? 'Edit Bookmark' : 'New Bookmark'}
          </h2>
          <BookmarkForm
            initialData={editingBookmark ? {
              url: editingBookmark.url,
              title: editingBookmark.title,
              description: editingBookmark.description ?? undefined,
              categoryId: editingBookmark.categoryId ?? undefined,
              tags: editingBookmark.tags,
              importance: editingBookmark.importance,
              accessInfo: editingBookmark.accessInfo ?? undefined,
              notes: editingBookmark.notes ?? undefined,
              isPinned: editingBookmark.isPinned,
            } : undefined}
            categories={categories}
            onSubmit={editingBookmark ? handleUpdateBookmark : handleCreateBookmark}
            onCancel={closeForm}
            isLoading={formLoading}
          />
        </div>
      )}

      {/* Filters */}
      <BookmarkFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
      />

      {/* Bookmark List */}
      <BookmarkList
        bookmarks={bookmarks}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}
