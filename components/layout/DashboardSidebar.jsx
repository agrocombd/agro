"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

function NavItem({ href, icon, label, exact = false }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
      active ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    )}>
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

const CUSTOMER_NAV = [
  { href: "/dashboard", icon: "🏠", label: "ড্যাশবোর্ড", exact: true },
  { href: "/dashboard/orders", icon: "📦", label: "আমার অর্ডার" },
  { href: "/dashboard/profile", icon: "👤", label: "প্রোফাইল" },
  { href: "/dashboard/addresses", icon: "📍", label: "ঠিকানা" },
  { href: "/dashboard/wishlist", icon: "❤️", label: "পছন্দের তালিকা" },
];

const VENDOR_NAV = [
  { href: "/vendor", icon: "🏠", label: "ড্যাশবোর্ড", exact: true },
  { href: "/vendor/products", icon: "📦", label: "পণ্য সমূহ" },
  { href: "/vendor/orders", icon: "🛒", label: "অর্ডার" },
  { href: "/vendor/zones", icon: "🗺", label: "ডেলিভারি জোন" },
  { href: "/vendor/analytics", icon: "📊", label: "বিশ্লেষণ" },
  { href: "/vendor/profile", icon: "⚙️", label: "ব্যবসার তথ্য" },
];

const ADMIN_NAV = [
  { href: "/admin", icon: "🏠", label: "ড্যাশবোর্ড", exact: true },
  { href: "/admin/products", icon: "📦", label: "পণ্য" },
  { href: "/admin/orders", icon: "🛒", label: "অর্ডার" },
  { href: "/admin/users", icon: "👥", label: "ব্যবহারকারী" },
  { href: "/admin/vendors", icon: "🏪", label: "বিক্রেতা" },
  { href: "/admin/categories", icon: "📁", label: "বিভাগ" },
  { href: "/admin/forum", icon: "💬", label: "ফোরাম" },
  { href: "/admin/banners", icon: "🖼", label: "ব্যানার" },
  { href: "/admin/pages", icon: "📄", label: "পেজ CMS" },
  { href: "/admin/ai-stats", icon: "🤖", label: "AI পরিসংখ্যান" },
  { href: "/admin/integrations", icon: "🔗", label: "ইন্টিগ্রেশন" },
  { href: "/admin/settings", icon: "⚙️", label: "সেটিংস" },
];

export default function DashboardSidebar({ profile }) {
  const role = profile?.role;
  const nav = role === "admin" || role === "manager" ? ADMIN_NAV
    : (role === "retail_vendor" || role === "b2b_vendor") ? VENDOR_NAV
    : CUSTOMER_NAV;

  const dashboardHref = role === "admin" || role === "manager" ? "/admin"
    : (role === "retail_vendor" || role === "b2b_vendor") ? "/vendor"
    : "/dashboard";

  return (
    <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 min-h-full">
      {/* User info */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" width={40} height={40} className="rounded-full" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold">
              {profile?.full_name?.[0] || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{profile?.full_name || "ব্যবহারকারী"}</p>
            <p className="text-xs text-slate-400 capitalize">{
              role === "retail_vendor" ? "বিক্রেতা" :
              role === "b2b_vendor" ? "পাইকারি বিক্রেতা" :
              role === "admin" ? "অ্যাডমিন" :
              role === "manager" ? "ম্যানেজার" : "ক্রেতা"
            }</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Bottom links */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
        <NavItem href="/" icon="🛍" label="শপে যান" exact />
        <LogoutButton />
      </div>
    </aside>
  );
}

function LogoutButton() {
  async function logout() {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  return (
    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
      <span>🚪</span><span>লগআউট</span>
    </button>
  );
}
