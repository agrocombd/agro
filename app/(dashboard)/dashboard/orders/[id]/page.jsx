import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/utils";

const STATUS_BN = { pending: "অপেক্ষারত", confirmed: "নিশ্চিত", processing: "প্রক্রিয়াকরণ", shipped: "পাঠানো হয়েছে", delivered: "ডেলিভার হয়েছে", cancelled: "বাতিল" };
const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500",
};
const PAY_BN = { pending: "অপেক্ষারত", paid: "পরিশোধিত", failed: "ব্যর্থ", refunded: "ফেরত" };
const PAY_METHOD_BN = { cod: "ক্যাশ অন ডেলিভারি", bkash: "bKash", nagad: "Nagad", sslcommerz: "SSLCommerz" };

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id,order_number,status,total_amount,delivery_charge,payment_method,payment_status,created_at,shipping_info,notes,order_items(quantity,unit_price,products(id,name_bn,images,unit))")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const currentStep = STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back */}
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-green-600 transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
        অর্ডার তালিকায় ফিরুন
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">অর্ডার #{order.order_number}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{timeAgo(order.created_at)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-500"}`}>
          {STATUS_BN[order.status] || order.status}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card rounded-2xl p-5">
          <div className="flex items-center justify-between relative">
            {/* Track line */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 mx-8 z-0" />
            <div
              className="absolute left-0 top-1/2 h-1 bg-green-500 -translate-y-1/2 mx-8 z-0 transition-all duration-500"
              style={{ width: currentStep < 0 ? "0%" : `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, i) => {
              const done = i <= currentStep;
              return (
                <div key={step} className="flex flex-col items-center gap-1 z-10">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${done ? "bg-green-500 border-green-500 text-white" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400"}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block text-center leading-tight w-14">
                    {STATUS_BN[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="card rounded-2xl p-5">
        <h2 className="font-bold text-slate-800 dark:text-white mb-3">পণ্য সমূহ</h2>
        <div className="space-y-3">
          {order.order_items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.products?.images?.[0] ? (
                <img src={item.products.images[0]} alt="" className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{item.products?.name_bn}</p>
                <p className="text-sm text-slate-400">{item.quantity} {item.products?.unit} × {formatPrice(item.unit_price)}</p>
              </div>
              <p className="font-bold text-green-600 flex-shrink-0">{formatPrice(item.quantity * item.unit_price)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>পণ্যের মোট</span>
            <span>{formatPrice(order.total_amount - (order.delivery_charge || 0))}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>ডেলিভারি চার্জ</span>
            <span>{order.delivery_charge > 0 ? formatPrice(order.delivery_charge) : <span className="text-green-600 font-semibold">ফ্রি</span>}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-800 dark:text-white text-base">
            <span>সর্বমোট</span>
            <span className="text-green-600">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card rounded-2xl p-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-3">ডেলিভারি ঠিকানা</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {order.shipping_info?.name}<br />
            {order.shipping_info?.phone}<br />
            {order.shipping_info?.address}<br />
            {order.shipping_info?.district}
          </p>
        </div>

        <div className="card rounded-2xl p-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-3">পেমেন্ট তথ্য</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">পদ্ধতি</span>
              <span className="font-semibold">{PAY_METHOD_BN[order.payment_method] || order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">স্ট্যাটাস</span>
              <span className={`font-semibold ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                {PAY_BN[order.payment_status] || order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="card rounded-2xl p-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">বিশেষ নির্দেশনা</h3>
          <p className="text-sm text-slate-500">{order.notes}</p>
        </div>
      )}

      <Link href="/shop" className="btn-primary w-full justify-center">আরো কেনাকাটা করুন</Link>
    </div>
  );
}
