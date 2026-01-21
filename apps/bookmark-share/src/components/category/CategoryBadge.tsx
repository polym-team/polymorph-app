'use client';

import { Badge } from '@package/ui';
import type { Category } from '@/types';

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1"
      style={category.color ? { backgroundColor: `${category.color}20`, color: category.color } : undefined}
    >
      {category.icon && <span>{category.icon}</span>}
      {category.name}
    </Badge>
  );
}
