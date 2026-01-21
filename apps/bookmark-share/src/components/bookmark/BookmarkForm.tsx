'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Label } from '@package/ui';
import type { BookmarkFormData, CategoryWithCount, Importance } from '@/types';

interface BookmarkFormProps {
  initialData?: Partial<BookmarkFormData>;
  categories: CategoryWithCount[];
  onSubmit: (data: BookmarkFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const importanceOptions: { value: Importance; label: string }[] = [
  { value: 'CRITICAL', label: 'Critical - Must know immediately' },
  { value: 'HIGH', label: 'High - Important for onboarding' },
  { value: 'NORMAL', label: 'Normal - Good to know' },
  { value: 'LOW', label: 'Low - Nice to have' },
];

export function BookmarkForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: BookmarkFormProps) {
  const [formData, setFormData] = useState<BookmarkFormData>({
    url: initialData?.url ?? '',
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    categoryId: initialData?.categoryId ?? '',
    tags: initialData?.tags ?? [],
    importance: initialData?.importance ?? 'NORMAL',
    accessInfo: initialData?.accessInfo ?? '',
    notes: initialData?.notes ?? '',
    isPinned: initialData?.isPinned ?? false,
  });
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse tags from input
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setFormData((prev) => ({ ...prev, tags }));
  }, [tagsInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.url || !formData.title) {
      setError('URL and title are required');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bookmark');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="url">URL *</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
          placeholder="https://example.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Bookmark title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of this resource..."
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.categoryId}
            onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value || undefined }))}
            className="h-10 w-full rounded border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon && `${cat.icon} `}{cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="importance">Importance</Label>
          <select
            id="importance"
            value={formData.importance}
            onChange={(e) => setFormData((prev) => ({ ...prev, importance: e.target.value as Importance }))}
            className="h-10 w-full rounded border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {importanceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="onboarding, dev-tools, documentation"
        />
      </div>

      <div>
        <Label htmlFor="accessInfo">Access Information</Label>
        <Input
          id="accessInfo"
          value={formData.accessInfo}
          onChange={(e) => setFormData((prev) => ({ ...prev, accessInfo: e.target.value }))}
          placeholder="How to get access (e.g., 'Request access from admin')"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes..."
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPinned"
          checked={formData.isPinned}
          onChange={(e) => setFormData((prev) => ({ ...prev, isPinned: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isPinned" className="mb-0 cursor-pointer">
          Pin this bookmark
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Bookmark'}
        </Button>
      </div>
    </form>
  );
}
