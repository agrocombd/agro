"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

const icons = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};
const styles = {
  success: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300",
  error:   "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300",
  warning: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300",
  info:    "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg",
              "animate-slide-up",
              styles[t.type]
            )}
          >
            <span className="flex-shrink-0 text-base font-bold leading-tight mt-0.5">{icons[t.type]}</span>
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity text-sm">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx.toast;
};
