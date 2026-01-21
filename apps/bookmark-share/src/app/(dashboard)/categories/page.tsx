'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@package/ui';
import { useOrg } from '@/lib/OrgContext';
import { useCategories } from '@/hooks';
import { CategoryList, CategoryForm } from '@/components/category';
import type { CategoryWithCount, CategoryFormData } from '@/types';

export default function CategoriesPage() {
  const { selectedOrg } = useOrg();
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const isOwner = selectedOrg?.role === 'OWNER';

  useEffect(() => {
    if (selectedOrg) {
      fetchCategories(selectedOrg.id);
    }
  }, [selectedOrg, fetchCategories]);

  const handleCreateCategory = useCallback(async (data: CategoryFormData) => {
    if (!selectedOrg) return;
    setFormLoading(true);
    try {
      await createCategory(selectedOrg.id, data);
      setShowForm(false);
    } finally {
      setFormLoading(false);
    }
  }, [selectedOrg, createCategory]);

  const handleUpdateCategory = useCallback(async (data: CategoryFormData) => {
    if (!editingCategory) return;
    setFormLoading(true);
    try {
      await updateCategory(editingCategory.id, data);
      setEditingCategory(null);
    } finally {
      setFormLoading(false);
    }
  }, [editingCategory, updateCategory]);

  const handleDelete = useCallback(async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category && category._count.bookmarks > 0) {
      alert('Cannot delete a category that has bookmarks. Please move or delete the bookmarks first.');
      return;
    }
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
    }
  }, [categories, deleteCategory]);

  const handleEdit = useCallback((category: CategoryWithCount) => {
    setEditingCategory(category);
    setShowForm(false);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingCategory(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        {isOwner && (
          <Button onClick={() => { setShowForm(true); setEditingCategory(null); }}>
            <Plus className="mr-1 h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {!isOwner && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          Only organization owners can manage categories.
        </div>
      )}

      {/* Form Modal/Panel */}
      {(showForm || editingCategory) && isOwner && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {editingCategory ? 'Edit Category' : 'New Category'}
          </h2>
          <CategoryForm
            initialData={editingCategory ? {
              name: editingCategory.name,
              slug: editingCategory.slug,
              icon: editingCategory.icon ?? undefined,
              color: editingCategory.color ?? undefined,
            } : undefined}
            onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
            onCancel={closeForm}
            isLoading={formLoading}
          />
        </div>
      )}

      {/* Category List */}
      <CategoryList
        categories={categories}
        loading={loading}
        userRole={selectedOrg?.role}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
