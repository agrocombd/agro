"use client";
import { cn } from "@/lib/utils";

const variants = {
  primary:   "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm hover:shadow disabled:bg-green-300",
  secondary: "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
  ghost:     "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400",
  danger:    "bg-red-600 hover:bg-red-700 text-white shadow-sm",
  outline:   "border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20",
  amber:     "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
};

const sizes = {
  sm:   "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md:   "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg:   "px-6 py-3.5 text-base rounded-xl gap-2",
  icon: "p-2.5 rounded-xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  type = "button",
  fullWidth = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  );
}

export default Button;
