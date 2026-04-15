'use client';

import { Button } from '@package/ui';
import { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {title && <h2 className="text-base font-bold text-gray-900">{title}</h2>}
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
        )}
        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
