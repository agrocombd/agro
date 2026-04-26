"use client";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Modal({ open, onClose, title, children, size = "md", className }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className={cn(
        "relative w-full rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900",
        "border border-slate-200 dark:border-slate-700 shadow-modal",
        "animate-slide-up max-h-[90vh] overflow-y-auto",
        sizes[size],
        className
      )}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-3xl z-10">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = "নিশ্চিত করুন", confirmVariant = "danger", loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition ${
            confirmVariant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          } disabled:opacity-50`}
        >
          {loading ? "..." : confirmText}
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          বাতিল
        </button>
      </div>
    </Modal>
  );
}
