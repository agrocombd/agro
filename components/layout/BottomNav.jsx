"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/providers/LanguageProvider";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();
  const [cartCount, setCartCount] = useState(0);
  const [accountHref, setAccountHref] = useState("/login");

  // Determine account link based on auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setAccountHref("/dashboard");
      } else {
        setAccountHref("/login");
      }
    });
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAccountHref(session?.user ? "/dashboard" : "/login");
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("agro-cart") || "[]");
        setCartCount(cart.reduce((s, i) => s + (i.qty || 1), 0));
      } catch {}
    };
    update();
    window.addEventListener("agro-cart-updated", update);
    return () => window.removeEventListener("agro-cart-updated", update);
  }, []);

  const NAV_ITEMS = [
    {
      key: "nav.home", href: "/",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      key: "nav.shop", href: "/shop",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
    },
    {
      key: "nav.ai", href: "/ai-assistant",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/><path d="M8 12s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      ),
      special: true,
    },
    {
      key: "nav.forum", href: "/forum",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      ),
    },
    {
      key: "nav.account", href: accountHref, // dynamic: /login or /dashboard
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe"
      style={{ height: "var(--bottom-nav-h)" }}
    >
      <div className="flex h-full items-center">
        {NAV_ITEMS.map(({ key, href, icon, special }) => {
          const active = isActive(href);

          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors",
                special
                  ? "text-green-600 dark:text-green-400"
                  : active
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              aria-label={t(key)}
            >
              {active && !special && (
                <span className="absolute top-2 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-green-600 dark:bg-green-400" />
              )}

              {special ? (
                <span className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl shadow-md transition-all",
                  active
                    ? "bg-green-600 text-white"
                    : "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                )}>
                  {icon}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {icon}
                </span>
              )}

              <span className={cn(
                "text-[10px] font-medium leading-none",
                special && "sr-only"
              )}>
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
