import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/utils";

export const metadata = { title: "আমার অর্ডার" };

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
const PAY_BN = { pending: "অপেক্ষারত", paid: "পরিশোধিত", failed: "ব্যর্থ", refunded: "ফেরত" };

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminSupabase = createAdminClient();

  const { data: orders } = await adminSupabase
    .from("orders")
    .select("id,order_number,status,total_amount,payment_method,payment_status,created_at,order_items(quantity,products(name_bn,images))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">আমার অর্ডার</h1>

      {!orders?.length ? (
        <div className="card rounded-2xl p-10 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-slate-500">এখনো কোনো অর্ডার নেই</p>
          <Link href="/shop" className="mt-4 inline-block text-sm font-semibold text-green-600 hover:underline">শপিং শুরু করুন →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const firstProduct = order.order_items?.[0]?.products;
            return (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="card rounded-2xl p-4 flex gap-4 items-center hover:shadow-md transition-shadow group block">
                {firstProduct?.images?.[0] && (
                  <img src={firstProduct.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-green-600">#{order.order_number}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-500"}`}>
                      {STATUS_BN[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(order.created_at)} · {order.order_items?.length || 0} পণ্য</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="font-bold text-green-600">{formatPrice(order.total_amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.payment_status === "paid" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                      {PAY_BN[order.payment_status] || order.payment_status}
                    </span>
                  </div>
                </div>
                <svg className="h-4 w-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
