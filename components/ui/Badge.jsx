import { cn } from "@/lib/utils";

const variants = {
  green:   "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  red:     "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  amber:   "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  blue:    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  purple:  "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  slate:   "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  orange:  "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
};

export default function Badge({ children, variant = "green", className, dot = false }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
      variants[variant],
      className
    )}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />}
      {children}
    </span>
  );
}
