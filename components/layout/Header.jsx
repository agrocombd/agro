"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLang } from "@/components/providers/LanguageProvider";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { key: "nav.shop",   href: "/shop" },
  { key: "nav.b2b",    href: "/b2b" },
  { key: "nav.ai",     href: "/ai-assistant" },
  { key: "nav.forum",  href: "/forum" },
  { key: "nav.blog",   href: "/blog" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Sticky header shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Cart count from localStorage
  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("agro-cart") || "[]");
        setCartCount(cart.reduce((s, i) => s + (i.qty || 1), 0));
      } catch {}
    };
    updateCart();
    window.addEventListener("agro-cart-updated", updateCart);
    return () => window.removeEventListener("agro-cart-updated", updateCart);
  }, []);

  // Search focus
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    setDrawerOpen(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  const isActive = (href) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      {/* ── Main Header ────────────────────────── */}
      <header className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md",
        scrolled ? "shadow-md border-b border-slate-200/80 dark:border-slate-800/80" : "border-b border-transparent"
      )}>
        <div className="container-app flex h-16 items-center gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 mr-2" aria-label="agro.com.bd home">
            <Image src="/logo.png" alt="agro.com.bd" width={140} height={40} className="h-9 w-auto object-contain" priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(({ key, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive(href)
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 ml-auto">

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="hidden sm:flex h-9 items-center gap-1 rounded-xl px-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle language"
            >
              {lang === "bn" ? "EN" : "বাং"}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={`Cart (${cartCount} items)`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User menu / Login */}
            {user ? (
              <Link
                href="/dashboard"
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold flex-shrink-0"
                title="My Dashboard"
              >
                {(user.email?.[0] || "U").toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex btn-primary py-2 px-4 text-xs"
              >
                {t("nav.login")}
              </Link>
            )}

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Search Overlay ──────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="container-app pt-20" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl px-4 py-3">
                <svg className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t("nav.search")}
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-base"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Mobile Drawer ───────────────────────── */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-72 max-w-[90vw] bg-white dark:bg-slate-950 shadow-2xl lg:hidden flex flex-col animate-slide-in">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <Image src="/logo.png" alt="agro.com.bd" width={110} height={32} className="h-8 w-auto" />
              <button onClick={() => setDrawerOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ key, href }) => (
                <Link key={href} href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive(href)
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {t(key)}
                </Link>
              ))}

              <div className="divider my-3" />

              {/* Settings in drawer */}
              <div className="flex items-center gap-3 px-3 py-2">
                <button onClick={toggleLang} className="flex-1 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  🌐 {lang === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
                </button>
              </div>
              <div className="flex items-center gap-3 px-3 py-2">
                <button onClick={toggleTheme} className="flex-1 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>
              </div>
            </nav>

            {/* Auth section */}
            <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    👤 {t("nav.dashboard")}
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    🚪 {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-primary w-full text-center py-3 text-sm">
                    {t("nav.login")}
                  </Link>
                  <Link href="/signup" className="btn-secondary w-full text-center py-3 text-sm">
                    {t("nav.signup")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
