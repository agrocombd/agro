import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/utils";

export const metadata = { title: "বিক্রেতা ড্যাশবোর্ড — Agro.com.bd" };

const STATUS_BN = { pending: "অপেক্ষারত", confirmed: "নিশ্চিত", processing: "প্রক্রিয়াকরণ", shipped: "পাঠানো", delivered: "ডেলিভার", cancelled: "বাতিল" };
const STATUS_COLORS = { pending: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-500" };

export default async function VendorDashboard() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminSupabase = createAdminClient();

  const [{ data: vendorProfile }, { data: products }, { data: recentOrders }] = await Promise.all([
    adminSupabase.from("vendor_profiles").select("business_name,is_approved,is_verified").eq("user_id", user.id).single(),
    adminSupabase.from("products").select("id,name_bn,is_active,is_approved,price,stock_qty").eq("vendor_id", user.id).order("created_at", { ascending: false }).limit(5),
    adminSupabase.from("order_items").select("quantity,unit_price,orders(id,order_number,status,created_at)").eq("vendor_id", user.id).order("created_at", { ascending: false, foreignTable: "orders" }).limit(5),
  ]);

  if (!vendorProfile?.is_approved) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">অনুমোদনের অপেক্ষায়</h1>
        <p className="text-slate-500 dark:text-slate-400">আপনার বিক্রেতা অ্যাকাউন্ট পর্যালোচনা করা হচ্ছে। সাধারণত ১-২ কার্যদিবসে অনুমোদন দেওয়া হয়।</p>
      </div>
    );
  }

  const totalRevenue = (recentOrders || []).reduce((s, i) => s + (i.unit_price * i.quantity), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{vendorProfile?.business_name || "বিক্রেতা ড্যাশবোর্ড"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-600">✓ অনুমোদিত</span>
            {vendorProfile?.is_verified && <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-semibold text-blue-600">✓ যাচাইকৃত</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "পণ্য সমূহ", value: products?.length || 0, icon: "📦", href: "/vendor/products" },
          { label: "সাম্প্রতিক রাজস্ব", value: formatPrice(totalRevenue), icon: "💰", href: "/vendor/orders" },
          { label: "সাম্প্রতিক অর্ডার", value: recentOrders?.length || 0, icon: "🛒", href: "/vendor/orders" },
        ].map(s => (
          <Link key={s.label} href={s.href} className="card rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-extrabold text-green-600">{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent products */}
        <div className="card rounded-2xl p-5">
          <div className="flex justify-between mb-3">
            <h2 className="font-bold text-slate-900 dark:text-white">আমার পণ্য</h2>
            <Link href="/vendor/products" className="text-xs text-green-600 hover:underline">সব দেখুন</Link>
          </div>
          <div className="space-y-2">
            {!products?.length ? (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm">কোনো পণ্য নেই</p>
                <Link href="/vendor/products" className="mt-2 inline-block text-sm font-semibold text-green-600 hover:underline">পণ্য যোগ করুন →</Link>
              </div>
            ) : products.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{p.name_bn}</p>
                  <p className="text-xs text-slate-400">{formatPrice(p.price)}</p>
                </div>
                <div className="flex gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.is_active ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>{p.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                  {!p.is_approved && <span className="rounded-full bg-amber-100 text-amber-600 px-2 py-0.5 text-[10px] font-semibold">পর্যালোচনায়</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="card rounded-2xl p-5">
          <h2 className="font-bold text-slate-900 dark:text-white mb-3">দ্রুত অ্যাকশন</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/vendor/products", label: "পণ্য যোগ করুন", icon: "➕" },
              { href: "/vendor/orders", label: "অর্ডার দেখুন", icon: "📦" },
              { href: "/vendor/zones", label: "ডেলিভারি জোন", icon: "🗺" },
              { href: "/vendor/profile", label: "ব্যবসার তথ্য", icon: "⚙️" },
            ].map(a => (
              <Link key={a.href} href={a.href} className="flex items-center gap-2 rounded-xl p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span>{a.icon}</span><span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
