import { create } from 'zustand';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmDialogStore {
  open: boolean;
  options: ConfirmOptions | null;
  show: (options: ConfirmOptions) => void;
  close: () => void;
}

export const useConfirmDialogStore = create<ConfirmDialogStore>(set => ({
  open: false,
  options: null,
  show: options => set({ open: true, options }),
  close: () => set({ open: false, options: null }),
}));
