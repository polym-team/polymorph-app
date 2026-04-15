'use client';

import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useConfirmDialogStore } from '@/shared/stores/confirmDialogStore';

export function GlobalConfirmDialog() {
  const { open, options, close } = useConfirmDialogStore();

  if (!options) return null;

  return (
    <ConfirmDialog
      open={open}
      title={options.title}
      description={options.description}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      onConfirm={() => {
        options.onConfirm();
        close();
      }}
      onCancel={() => {
        options.onCancel?.();
        close();
      }}
    />
  );
}
