import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning'
  itemName = '',
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const isDanger = confirmVariant === 'danger';

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={loading ? undefined : onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200 text-left">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>

          <div className="flex-1 pr-6">
            <h3 id="confirm-modal-title" className="text-lg font-extrabold text-slate-900 tracking-tight">
              {title}
            </h3>
            {itemName && (
              <p className="mt-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg w-fit truncate max-w-full">
                "{itemName}"
              </p>
            )}
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20 active:scale-95'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 active:scale-95'
            }`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
