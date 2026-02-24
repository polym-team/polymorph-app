'use client';

import { Badge } from '@package/ui';

const STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'success' | 'warning' | 'default' }> = {
  PLANNING: { label: '목표수립', variant: 'secondary' },
  ACTIVE: { label: '진행', variant: 'success' },
  REVIEW: { label: '회고', variant: 'warning' },
  ARCHIVED: { label: '아카이빙', variant: 'default' },
};

export function OKRStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
