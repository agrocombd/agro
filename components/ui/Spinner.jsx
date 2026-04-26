import { cn } from "@/lib/utils";

export default function Spinner({ size = "md", className }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return (
    <svg
      className={cn("animate-spin text-green-600", sizes[size], className)}
      fill="none" viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 dark:text-slate-400">লোড হচ্ছে...</p>
      </div>
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden", className)}>
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-5 w-1/3 mt-2" />
      </div>
    </div>
  );
}
