import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "অ্যাডমিন ড্যাশবোর্ড — Agro.com.bd" };

export const revalidate = 60;

export default async function AdminDashboard() {
  let supabase;
  try { supabase = createAdminClient(); } catch { supabase = null; }

  const [
    { count: totalOrders },
    { count: totalUsers },
    { count: totalProducts },
    { count: pendingVendors },
    { data: recentOrders },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("vendor_profiles").select("*", { count: "exact", head: true }).eq("is_approved", false),
    supabase.from("orders").select("id,order_number,status,total_amount,created_at,profiles(full_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("total_amount").in("status", ["delivered", "processing", "shipped"]),
  ]);

  const totalRevenue = revenueData?.reduce((s, o) => s + (o.total_amount || 0), 0) || 0;

  const stats = [
    { label: "মোট রাজস্ব", value: formatPrice(totalRevenue), icon: "💰", color: "text-green-600", href: "/admin/orders" },
    { label: "মোট অর্ডার", value: totalOrders || 0, icon: "📦", color: "text-blue-600", href: "/admin/orders" },
    { label: "ব্যবহারকারী", value: totalUsers || 0, icon: "👥", color: "text-purple-600", href: "/admin/users" },
    { label: "পণ্য", value: totalProducts || 0, icon: "🌱", color: "text-emerald-600", href: "/admin/products" },
  ];

  const quickActions = [
    { href: "/admin/products", label: "পণ্য যোগ করুন", icon: "➕" },
    { href: "/admin/vendors", label: `অনুমোদন (${pendingVendors || 0})`, icon: "🏪" },
    { href: "/admin/categories", label: "বিভাগ পরিচালনা", icon: "📁" },
    { href: "/admin/forum", label: "ফোরাম পরিচালনা", icon: "💬" },
    { href: "/admin/pages", label: "পেজ CMS", icon: "📄" },
    { href: "/admin/integrations", label: "ইন্টিগ্রেশন", icon: "🔗" },
    { href: "/admin/ai-stats", label: "AI পরিসংখ্যান", icon: "🤖" },
    { href: "/admin/settings", label: "সাইট সেটিংস", icon: "⚙️" },
  ];

  const STATUS_BN = {
    pending: "অপেক্ষারত", confirmed: "নিশ্চিত", processing: "প্রক্রিয়াকরণ",
    shipped: "পাঠানো", delivered: "ডেলিভার", cancelled: "বাতিল",
  };
  const STATUS_COLORS = {
    pending: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
    processing: "bg-purple-100 text-purple-700", shipped: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">অ্যাডমিন ড্যাশবোর্ড</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">সম্পূর্ণ সাইট পরিচালনা করুন</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="card rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Pending vendors alert */}
      {(pendingVendors || 0) > 0 && (
        <Link href="/admin/vendors" className="flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 hover:bg-amber-100 transition-colors">
          <span className="text-xl">⏳</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">{pendingVendors} জন বিক্রেতার অনুমোদন বাকি</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">ক্লিক করে অনুমোদন দিন</p>
          </div>
          <svg className="ml-auto h-4 w-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="card rounded-2xl p-5">
          <h2 className="font-bold text-slate-900 dark:text-white mb-3">দ্রুত অ্যাকশন</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(a => (
              <Link key={a.href} href={a.href} className="flex items-center gap-2 rounded-xl p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span>{a.icon}</span><span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900 dark:text-white">সাম্প্রতিক অর্ডার</h2>
            <Link href="/admin/orders" className="text-xs text-green-600 hover:underline">সব দেখুন</Link>
          </div>
          <div className="space-y-2">
            {recentOrders?.map(order => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-green-600">#{order.order_number}</p>
                  <p className="text-[11px] text-slate-400">{order.profiles?.full_name || "অতিথি"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-500"}`}>
                    {STATUS_BN[order.status] || order.status}
                  </span>
                  <span className="text-xs font-bold text-green-600">{formatPrice(order.total_amount)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
