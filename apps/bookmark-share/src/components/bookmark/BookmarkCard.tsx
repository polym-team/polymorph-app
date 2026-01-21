'use client';

import Image from 'next/image';
import { ExternalLink, Pin, Trash2, Edit2, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@package/utils';
import { Badge, Button, Card } from '@package/ui';
import type { BookmarkWithRelations, Importance } from '@/types';
import { CategoryBadge } from '../category/CategoryBadge';

interface BookmarkCardProps {
  bookmark: BookmarkWithRelations;
  onEdit?: (bookmark: BookmarkWithRelations) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
}

const importanceConfig: Record<Importance, { label: string; variant: 'danger' | 'warning' | 'secondary' | 'outline'; icon?: typeof AlertTriangle }> = {
  CRITICAL: { label: 'Critical', variant: 'danger', icon: AlertTriangle },
  HIGH: { label: 'High', variant: 'warning', icon: AlertCircle },
  NORMAL: { label: 'Normal', variant: 'secondary' },
  LOW: { label: 'Low', variant: 'outline' },
};

export function BookmarkCard({ bookmark, onEdit, onDelete, onTogglePin }: BookmarkCardProps) {
  const importance = importanceConfig[bookmark.importance];
  const ImportanceIcon = importance.icon;

  return (
    <Card className={cn(
      'p-4 transition-shadow hover:shadow-md',
      bookmark.isPinned && 'border-blue-200 bg-blue-50/50'
    )}>
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="flex-shrink-0">
          {bookmark.faviconUrl ? (
            <Image
              src={bookmark.faviconUrl}
              alt=""
              width={32}
              height={32}
              className="rounded"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate font-medium text-blue-600 hover:underline"
            >
              {bookmark.title}
            </a>
            {bookmark.isPinned && (
              <Pin className="h-4 w-4 flex-shrink-0 text-blue-500" />
            )}
          </div>

          {bookmark.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {bookmark.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Importance Badge */}
            <Badge variant={importance.variant} className="flex items-center gap-1">
              {ImportanceIcon && <ImportanceIcon className="h-3 w-3" />}
              {importance.label}
            </Badge>

            {/* Category Badge */}
            {bookmark.category && (
              <CategoryBadge category={bookmark.category} />
            )}

            {/* Tags */}
            {bookmark.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Access Info */}
          {bookmark.accessInfo && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
              Access: {bookmark.accessInfo}
            </p>
          )}

          {/* Notes */}
          {bookmark.notes && (
            <p className="mt-2 text-xs text-gray-500 italic">
              {bookmark.notes}
            </p>
          )}

          {/* URL */}
          <p className="mt-2 truncate text-xs text-gray-400">
            {bookmark.url}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePin?.(bookmark.id, !bookmark.isPinned)}
            title={bookmark.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={cn('h-4 w-4', bookmark.isPinned && 'fill-current text-blue-500')} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(bookmark)}
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(bookmark.id)}
            title="Delete"
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
