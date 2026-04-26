"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatCard({ icon, label, value, sub, color = "green" }) {
  const colors = {
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };
  return (
    <div className="card rounded-2xl p-5">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function VendorAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get vendor profile
      const { data: vp } = await supabase.from("vendor_profiles").select("id").eq("user_id", user.id).single();
      if (!vp) { setLoading(false); return; }

      // Stats: total products, total orders, total revenue, pending orders
      const [prodRes, orderRes] = await Promise.all([
        supabase.from("products").select("id, name_bn, stock_qty, price, sale_price, is_active, is_approved, images").eq("vendor_id", vp.id),
        supabase.from("order_items").select("quantity, unit_price, orders(status, created_at, payment_method)").eq("vendor_id", vp.id),
      ]);

      const products = prodRes.data || [];
      const orderItems = orderRes.data || [];

      const totalRevenue = orderItems
        .filter(i => i.orders?.status !== "cancelled")
        .reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);

      const pendingCount = orderItems.filter(i => i.orders?.status === "pending").length;
      const deliveredCount = orderItems.filter(i => i.orders?.status === "delivered").length;

      // Top products by order count
      const productOrderCount = {};
      orderItems.forEach(i => {
        // We don't have product_id here directly; use name from products
      });

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.is_active && p.is_approved).length,
        totalOrders: orderItems.length,
        pendingOrders: pendingCount,
        deliveredOrders: deliveredCount,
        totalRevenue,
        lowStock: products.filter(p => p.stock_qty !== null && p.stock_qty < 10).length,
      });

      setTopProducts(products.slice(0, 5));

      // Recent order items (last 10)
      const recent = orderItems
        .filter(i => i.orders)
        .sort((a, b) => new Date(b.orders.created_at) - new Date(a.orders.created_at))
        .slice(0, 10);
      setRecentOrders(recent);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
    </div>
  );

  const statusLabel = { pending: "অপেক্ষায়", processing: "প্রক্রিয়াধীন", shipped: "শিপ হয়েছে", delivered: "ডেলিভারি হয়েছে", cancelled: "বাতিল" };
  const statusColor = { pending: "bg-amber-100 text-amber-700", processing: "bg-blue-100 text-blue-700", shipped: "bg-purple-100 text-purple-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">বিক্রয় বিশ্লেষণ</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">আপনার দোকানের পারফরম্যান্স দেখুন</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📦" label="মোট পণ্য" value={stats?.totalProducts ?? 0} sub={`${stats?.activeProducts ?? 0}টি সক্রিয়`} color="green" />
        <StatCard icon="🛒" label="মোট অর্ডার" value={stats?.totalOrders ?? 0} sub={`${stats?.pendingOrders ?? 0}টি অপেক্ষায়`} color="blue" />
        <StatCard icon="💰" label="মোট আয়" value={formatPrice(stats?.totalRevenue ?? 0)} sub={`${stats?.deliveredOrders ?? 0}টি ডেলিভারি`} color="amber" />
        <StatCard icon="⚠️" label="কম স্টক" value={stats?.lowStock ?? 0} sub="১০-এর নিচে স্টক" color="purple" />
      </div>

      {/* Revenue progress bar */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">অর্ডার অবস্থা সারসংক্ষেপ</h2>
        {stats && stats.totalOrders > 0 ? (
          <div className="space-y-3">
            {[
              { label: "ডেলিভারি হয়েছে", count: stats.deliveredOrders, color: "bg-green-500" },
              { label: "অপেক্ষায়", count: stats.pendingOrders, color: "bg-amber-400" },
              { label: "বাতিল", count: stats.totalOrders - stats.deliveredOrders - stats.pendingOrders, color: "bg-red-400" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.count}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${Math.max(0, (item.count / stats.totalOrders) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-4">এখনো কোনো অর্ডার নেই</p>
        )}
      </div>

      {/* Top products */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">আপনার পণ্যসমূহ</h2>
        {topProducts.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">কোনো পণ্য নেই</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : "🌱"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name_bn}</p>
                  <p className="text-xs text-slate-400">স্টক: {p.stock_qty ?? "অসীমিত"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">{formatPrice(p.sale_price || p.price)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active && p.is_approved ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {p.is_active && p.is_approved ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent order activity */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">সাম্প্রতিক অর্ডার কার্যক্রম</h2>
        {recentOrders.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">কোনো অর্ডার কার্যক্রম নেই</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.quantity}x → {formatPrice(item.unit_price * item.quantity)}</p>
                  <p className="text-xs text-slate-400">{item.orders?.payment_method === "cod" ? "ক্যাশ অন ডেলিভারি" : "অগ্রিম পেমেন্ট"}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor[item.orders?.status] || "bg-slate-100 text-slate-600"}`}>
                  {statusLabel[item.orders?.status] || item.orders?.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
