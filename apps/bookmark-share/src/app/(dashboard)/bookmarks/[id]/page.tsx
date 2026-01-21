'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@package/ui';
import { useOrg } from '@/lib/OrgContext';
import { useCategories } from '@/hooks';
import { BookmarkForm } from '@/components/bookmark';
import type { BookmarkFormData, BookmarkWithRelations } from '@/types';

export default function BookmarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedOrg } = useOrg();
  const { categories, fetchCategories } = useCategories();
  const [bookmark, setBookmark] = useState<BookmarkWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    if (selectedOrg) {
      fetchCategories(selectedOrg.id);
    }
  }, [selectedOrg, fetchCategories]);

  useEffect(() => {
    const fetchBookmark = async () => {
      if (!selectedOrg) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/bookmarks?organizationId=${selectedOrg.id}`);
        if (response.ok) {
          const bookmarks = await response.json();
          const found = bookmarks.find((b: BookmarkWithRelations) => b.id === id);
          setBookmark(found || null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookmark();
  }, [selectedOrg, id]);

  const handleSubmit = useCallback(async (data: BookmarkFormData) => {
    setSaving(true);
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      if (response.ok) {
        router.push('/bookmarks');
      }
    } finally {
      setSaving(false);
    }
  }, [id, router]);

  const handleCancel = useCallback(() => {
    router.push('/bookmarks');
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!bookmark) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bookmark not found</p>
        <Button variant="ghost" onClick={() => router.push('/bookmarks')} className="mt-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to bookmarks
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" onClick={() => router.push('/bookmarks')} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      <h1 className="mb-6 text-2xl font-bold">Edit Bookmark</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <BookmarkForm
          initialData={{
            url: bookmark.url,
            title: bookmark.title,
            description: bookmark.description ?? undefined,
            categoryId: bookmark.categoryId ?? undefined,
            tags: bookmark.tags,
            importance: bookmark.importance,
            accessInfo: bookmark.accessInfo ?? undefined,
            notes: bookmark.notes ?? undefined,
            isPinned: bookmark.isPinned,
          }}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={saving}
        />
      </div>
    </div>
  );
}
