'use client';

import { Loader2, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { Button, Card } from '@package/ui';
import type { CategoryWithCount, MemberRole } from '@/types';

interface CategoryListProps {
  categories: CategoryWithCount[];
  loading?: boolean;
  userRole?: MemberRole;
  onEdit?: (category: CategoryWithCount) => void;
  onDelete?: (id: string) => void;
}

export function CategoryList({
  categories,
  loading = false,
  userRole,
  onEdit,
  onDelete,
}: CategoryListProps) {
  const canManage = userRole === 'OWNER';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="h-12 w-12 text-gray-300" />
        <p className="mt-2 text-gray-500">No categories yet</p>
        {canManage && (
          <p className="mt-1 text-sm text-gray-400">
            Create categories to organize your bookmarks
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {category.icon && (
                <span className="text-2xl">{category.icon}</span>
              )}
              <div>
                <h3
                  className="font-medium"
                  style={category.color ? { color: category.color } : undefined}
                >
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500">/{category.slug}</p>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(category)}
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(category.id)}
                  title="Delete"
                  className="text-red-500 hover:text-red-700"
                  disabled={category._count.bookmarks > 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="mt-3">
            <span className="text-sm text-gray-600">
              {category._count.bookmarks} bookmark{category._count.bookmarks !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
