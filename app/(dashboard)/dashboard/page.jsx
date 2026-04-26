import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/utils";

export const metadata = { title: "আমার ড্যাশবোর্ড — Agro.com.bd" };

const STATUS_COLORS = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  processing: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  shipped: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};
const STATUS_BN = {
  pending: "অপেক্ষারত", confirmed: "নিশ্চিত", processing: "প্রক্রিয়াকরণ",
  shipped: "পাঠানো হয়েছে", delivered: "ডেলিভার হয়েছে", cancelled: "বাতিল",
};

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminSupabase = createAdminClient();

  const [{ data: profile }, { data: orders }] = await Promise.all([
    adminSupabase.from("profiles").select("full_name,avatar_url,created_at").eq("id", user.id).single(),
    adminSupabase.from("orders").select("id,order_number,status,total_amount,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = {
    total: orders?.length || 0,
    delivered: orders?.filter(o => o.status === "delivered").length || 0,
    pending: orders?.filter(o => o.status === "pending").length || 0,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          স্বাগতম, {profile?.full_name?.split(" ")[0] || "বন্ধু"}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">আপনার অ্যাকাউন্টের সারসংক্ষেপ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "মোট অর্ডার", value: stats.total, icon: "📦" },
          { label: "ডেলিভার", value: stats.delivered, icon: "✅" },
          { label: "চলমান", value: stats.pending, icon: "⏳" },
        ].map(s => (
          <div key={s.label} className="card rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 dark:text-white">সাম্প্রতিক অর্ডার</h2>
          <Link href="/dashboard/orders" className="text-sm text-green-600 hover:underline">সব দেখুন</Link>
        </div>

        {!orders?.length ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🛒</p>
            <p className="text-sm text-slate-500">এখনো কোনো অর্ডার নেই</p>
            <Link href="/shop" className="mt-3 inline-block text-sm font-semibold text-green-600 hover:underline">শপিং শুরু করুন →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-green-600">
                    #{order.order_number}
                  </p>
                  <p className="text-xs text-slate-400">{timeAgo(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"}`}>
                    {STATUS_BN[order.status] || order.status}
                  </span>
                  <span className="font-bold text-sm text-green-600">{formatPrice(order.total_amount)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/shop", label: "শপ", icon: "🛍" },
          { href: "/ai-assistant", label: "AI সহকারী", icon: "🤖" },
          { href: "/forum", label: "ফোরাম", icon: "💬" },
          { href: "/dashboard/profile", label: "প্রোফাইল", icon: "👤" },
        ].map(l => (
          <Link key={l.href} href={l.href} className="card rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">{l.icon}</div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{l.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
