'use client';

import { useState, useCallback } from 'react';
import type { BookmarkWithRelations, BookmarkFormData, BookmarkFilters } from '@/types';

interface UseBookmarksReturn {
  bookmarks: BookmarkWithRelations[];
  loading: boolean;
  error: string | null;
  fetchBookmarks: (organizationId: string, filters?: BookmarkFilters) => Promise<void>;
  createBookmark: (organizationId: string, data: BookmarkFormData) => Promise<BookmarkWithRelations>;
  updateBookmark: (id: string, data: Partial<BookmarkFormData>) => Promise<BookmarkWithRelations>;
  deleteBookmark: (id: string) => Promise<void>;
}

export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async (organizationId: string, filters?: BookmarkFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ organizationId });

      if (filters?.search) params.set('search', filters.search);
      if (filters?.categoryId) params.set('categoryId', filters.categoryId);
      if (filters?.tags?.length) params.set('tags', filters.tags.join(','));
      if (filters?.importance?.length) params.set('importance', filters.importance.join(','));
      if (filters?.isPinned !== undefined) params.set('isPinned', String(filters.isPinned));

      const response = await fetch(`/api/bookmarks?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      setBookmarks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBookmark = useCallback(async (organizationId: string, data: BookmarkFormData) => {
    const response = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, organizationId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create bookmark error:', errorData);

      // Handle different error formats
      let errorMessage = 'Failed to create bookmark';
      if (typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      } else if (Array.isArray(errorData.error)) {
        // Zod validation errors
        errorMessage = errorData.error.map((e: { message?: string; path?: string[] }) =>
          e.message || JSON.stringify(e)
        ).join(', ');
      }

      throw new Error(errorMessage);
    }

    const newBookmark = await response.json();
    setBookmarks((prev) => [newBookmark, ...prev]);
    return newBookmark;
  }, []);

  const updateBookmark = useCallback(async (id: string, data: Partial<BookmarkFormData>) => {
    const response = await fetch('/api/bookmarks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update bookmark error:', errorData);

      let errorMessage = 'Failed to update bookmark';
      if (typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      } else if (Array.isArray(errorData.error)) {
        errorMessage = errorData.error.map((e: { message?: string }) =>
          e.message || JSON.stringify(e)
        ).join(', ');
      }

      throw new Error(errorMessage);
    }

    const updatedBookmark = await response.json();
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? updatedBookmark : b))
    );
    return updatedBookmark;
  }, []);

  const deleteBookmark = useCallback(async (id: string) => {
    const response = await fetch(`/api/bookmarks?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete bookmark error:', errorData);

      let errorMessage = 'Failed to delete bookmark';
      if (typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      } else if (Array.isArray(errorData.error)) {
        errorMessage = errorData.error.map((e: { message?: string }) =>
          e.message || JSON.stringify(e)
        ).join(', ');
      }

      throw new Error(errorMessage);
    }

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return {
    bookmarks,
    loading,
    error,
    fetchBookmarks,
    createBookmark,
    updateBookmark,
    deleteBookmark,
  };
}
