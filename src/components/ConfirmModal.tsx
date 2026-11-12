import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDanger
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            aria-label="Đóng"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-bold shadow-md transition ${
              isDanger
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
