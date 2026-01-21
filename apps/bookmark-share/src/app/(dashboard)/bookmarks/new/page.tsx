'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useOrg } from '@/lib/OrgContext';
import { useBookmarks, useCategories } from '@/hooks';
import { BookmarkForm } from '@/components/bookmark';
import type { BookmarkFormData } from '@/types';

export default function NewBookmarkPage() {
  const router = useRouter();
  const { selectedOrg } = useOrg();
  const { createBookmark } = useBookmarks();
  const { categories, fetchCategories } = useCategories();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedOrg) {
      fetchCategories(selectedOrg.id);
    }
  }, [selectedOrg, fetchCategories]);

  const handleSubmit = useCallback(async (data: BookmarkFormData) => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      await createBookmark(selectedOrg.id, data);
      router.push('/bookmarks');
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, createBookmark, router]);

  const handleCancel = useCallback(() => {
    router.push('/bookmarks');
  }, [router]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Add New Bookmark</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <BookmarkForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
