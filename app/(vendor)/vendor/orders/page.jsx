"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatPrice, timeAgo } from "@/lib/utils";

const STATUS_BN = { pending: "অপেক্ষারত", confirmed: "নিশ্চিত", processing: "প্রক্রিয়াকরণ", shipped: "পাঠানো", delivered: "ডেলিভার", cancelled: "বাতিল" };
const STATUS_COLORS = { pending: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700", processing: "bg-purple-100 text-purple-700", shipped: "bg-indigo-100 text-indigo-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-500" };
const VENDOR_UPDATABLE = ["processing", "shipped", "delivered"];

export default function VendorOrdersPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("order_items")
      .select("id,quantity,unit_price,order_id,products(name_bn,images,unit),orders(id,order_number,status,payment_method,payment_status,shipping_info,created_at)")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false, foreignTable: "orders" });

    if (error) toast(error.message, "error");
    setItems(data || []);
    setLoading(false);
  }

  async function updateOrderStatus(orderId, status) {
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) { toast(error.message, "error"); setUpdating(false); return; }
    toast("স্ট্যাটাস আপডেট হয়েছে", "success");
    setItems(prev => prev.map(i => i.orders?.id === orderId ? { ...i, orders: { ...i.orders, status } } : i));
    setSelected(prev => prev ? { ...prev, orders: { ...prev.orders, status } } : null);
    setUpdating(false);
  }

  const filtered = filterStatus === "all" ? items : items.filter(i => i.orders?.status === filterStatus);

  const grouped = filtered.reduce((acc, item) => {
    const oid = item.orders?.id;
    if (!oid) return acc;
    if (!acc[oid]) acc[oid] = { order: item.orders, items: [] };
    acc[oid].items.push(item);
    return acc;
  }, {});

  const orders = Object.values(grouped);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">আমার অর্ডার</h1>

      {/* Status filter */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-0 scroll-x-hidden">
        {[{ id: "all", label: "সব" }, ...Object.entries(STATUS_BN).map(([id, label]) => ({ id, label }))].map(t => (
          <button key={t.id} onClick={() => setFilterStatus(t.id)} className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${filterStatus === t.id ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}</div>
      ) : !orders.length ? (
        <div className="card rounded-2xl p-12 text-center">
          <p className="text-5xl mb-3">📦</p>
          <p className="text-slate-500">কোনো অর্ডার নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(({ order, items: orderItems }) => (
            <div key={order.id} className="card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">অর্ডার #{order.order_number}</p>
                  <p className="text-xs text-slate-400">{timeAgo(order.created_at)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold flex-shrink-0 ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-500"}`}>
                  {STATUS_BN[order.status] || order.status}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                {orderItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{item.products?.name_bn}</p>
                      <p className="text-xs text-slate-400">{item.quantity} {item.products?.unit} × {formatPrice(item.unit_price)}</p>
                    </div>
                    <p className="font-bold text-green-600 text-sm flex-shrink-0">{formatPrice(item.quantity * item.unit_price)}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="text-xs text-slate-500">
                  ঠিকানা: {order.shipping_info?.district}
                </div>
                <div className="flex gap-2">
                  {VENDOR_UPDATABLE.includes(order.status) && (
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value)}
                      disabled={updating}
                      className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      {VENDOR_UPDATABLE.map(s => <option key={s} value={s}>{STATUS_BN[s]}</option>)}
                    </select>
                  )}
                  <button onClick={() => setSelected({ order, items: orderItems })} className="text-xs text-blue-600 hover:underline">বিবরণ</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `অর্ডার #${selected.order?.order_number}` : ""} size="md">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="card rounded-xl p-3 space-y-1">
              <p className="font-semibold">{selected.order?.shipping_info?.name}</p>
              <p className="text-slate-400">{selected.order?.shipping_info?.phone}</p>
              <p className="text-slate-400">{selected.order?.shipping_info?.address}, {selected.order?.shipping_info?.district}</p>
            </div>

            <div>
              {selected.items.map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span>{item.products?.name_bn} × {item.quantity} {item.products?.unit}</span>
                  <span className="font-semibold text-green-600">{formatPrice(item.quantity * item.unit_price)}</span>
                </div>
              ))}
            </div>

            {["pending", "confirmed"].includes(selected.order?.status) && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">স্ট্যাটাস আপডেট করুন</label>
                <select
                  value={selected.order?.status}
                  onChange={e => updateOrderStatus(selected.order.id, e.target.value)}
                  disabled={updating}
                  className="input-base"
                >
                  {Object.entries(STATUS_BN).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                </select>
              </div>
            )}

            <Button variant="secondary" onClick={() => setSelected(null)} className="w-full">বন্ধ করুন</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
