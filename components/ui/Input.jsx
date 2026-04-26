"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Input({
  label,
  error,
  hint,
  type = "text",
  className,
  containerClassName,
  ...props
}) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={cn("space-y-1", containerClassName)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword && showPwd ? "text" : type}
          className={cn(
            "input-base",
            isPassword && "pr-10",
            error && "border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className, containerClassName, ...props }) {
  return (
    <div className={cn("space-y-1", containerClassName)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          "input-base resize-none",
          error && "border-red-400 focus:border-red-500",
          className
        )}
        rows={4}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className, containerClassName, ...props }) {
  return (
    <div className={cn("space-y-1", containerClassName)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={cn(
          "input-base appearance-none bg-no-repeat",
          error && "border-red-400",
          className
        )}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: "right 12px center", backgroundSize: "16px", paddingRight: "40px" }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default Input;
