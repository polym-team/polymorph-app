'use client';

import { useState, useCallback } from 'react';
import type { CategoryWithCount, CategoryFormData } from '@/types';

interface UseCategoriesReturn {
  categories: CategoryWithCount[];
  loading: boolean;
  error: string | null;
  fetchCategories: (organizationId: string) => Promise<void>;
  createCategory: (organizationId: string, data: CategoryFormData) => Promise<CategoryWithCount>;
  updateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<CategoryWithCount>;
  deleteCategory: (id: string) => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (organizationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/categories?organizationId=${organizationId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (organizationId: string, data: CategoryFormData) => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, organizationId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }

    const newCategory = await response.json();
    setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
    return newCategory;
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<CategoryFormData>) => {
    const response = await fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update category');
    }

    const updatedCategory = await response.json();
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? updatedCategory : c))
    );
    return updatedCategory;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const response = await fetch(`/api/categories?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete category');
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
