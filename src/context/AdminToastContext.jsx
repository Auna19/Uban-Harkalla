import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const AdminToastContext = createContext(null);

export function AdminToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'success', description = '') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = Date.now();
    setToast({ id, message, type, description });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  // Listen to window custom events so non-React services can also trigger admin toasts
  React.useEffect(() => {
    const handleCustomToast = (e) => {
      if (e.detail?.message) {
        showToast(e.detail.message, e.detail.type || 'success', e.detail.description || '');
      }
    };
    window.addEventListener('ubh-admin-toast', handleCustomToast);
    return () => window.removeEventListener('ubh-admin-toast', handleCustomToast);
  }, [showToast]);

  return (
    <AdminToastContext.Provider value={{ showToast, hideToast, toast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 right-6 z-[99999] max-w-sm sm:max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-top-3 duration-250 pointer-events-auto"
        >
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-4 ring-1 ring-white/10 flex items-start gap-3 relative overflow-hidden">
            
            {/* Status Icon */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
              ) : toast.type === 'error' ? (
                <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Info className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
                {toast.message}
              </h4>
              {toast.description && (
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={hideToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Accent Border at Left */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1 ${
                toast.type === 'success'
                  ? 'bg-emerald-500'
                  : toast.type === 'error'
                  ? 'bg-rose-500'
                  : 'bg-sky-500'
              }`}
            />
          </div>
        </div>
      )}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    // Return fallback no-op so components don't crash if rendered outside provider
    return {
      showToast: (msg) => {
        window.dispatchEvent(new CustomEvent('ubh-admin-toast', { detail: { message: msg } }));
      },
      hideToast: () => {},
      toast: null,
    };
  }
  return ctx;
}
