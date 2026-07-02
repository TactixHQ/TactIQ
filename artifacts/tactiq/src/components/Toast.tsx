import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { CheckCircle, Info, X, AlertCircle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "default";

interface ToastItem {
  id: number;
  message: string;
  description?: string;
  type: ToastType;
}

interface ToastAPI {
  success: (message: string, opts?: { description?: string }) => void;
  error: (message: string, opts?: { description?: string }) => void;
  info: (message: string, opts?: { description?: string }) => void;
  show: (message: string, opts?: { description?: string }) => void;
}

const ToastCtx = createContext<ToastAPI | null>(null);

let _addToast: ((item: Omit<ToastItem, "id">) => void) | null = null;

export const toast: ToastAPI = {
  success: (message, opts) => _addToast?.({ message, type: "success", ...opts }),
  error: (message, opts) => _addToast?.({ message, type: "error", ...opts }),
  info: (message, opts) => _addToast?.({ message, type: "info", ...opts }),
  show: (message, opts) => _addToast?.({ message, type: "default", ...opts }),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev.slice(-3), { id, ...item }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-20 md:bottom-5 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border border-gray-700/80 bg-gray-900 text-gray-100 text-sm max-w-xs animate-slide-up"
            role="status"
          >
            {t.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-snug truncate">{t.message}</p>
              {t.description && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-gray-500 hover:text-gray-300 transition cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx) ?? toast;
}
