"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatPrice, timeAgo } from "@/lib/utils";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const STATUS_BN = { pending: "অপেক্ষারত", confirmed: "নিশ্চিত", processing: "প্রক্রিয়াকরণ", shipped: "পাঠানো", delivered: "ডেলিভার", cancelled: "বাতিল" };
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

export default function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  async function fetchOrders() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("orders")
      .select("id,order_number,status,total_amount,payment_method,payment_status,delivery_charge,created_at,shipping_info,profiles:user_id(full_name,phone)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    const { data, error } = await query;
    if (error) toast(error.message, "error");
    setOrders(data || []);
    setLoading(false);
  }

  async function openOrder(order) {
    const supabase = createClient();
    const { data: items } = await supabase
      .from("order_items")
      .select("quantity,unit_price,products(name_bn,images,unit)")
      .eq("order_id", order.id);
    setSelectedOrder({ ...order, items: items || [] });
  }

  async function updateStatus(id, status) {
    setUpdatingStatus(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast(error.message, "error"); setUpdatingStatus(false); return; }
    toast("স্ট্যাটাস আপডেট হয়েছে", "success");
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setSelectedOrder(prev => prev ? { ...prev, status } : null);
    setUpdatingStatus(false);
  }

  async function updatePaymentStatus(id, paymentStatus) {
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ payment_status: paymentStatus }).eq("id", id);
    if (error) { toast(error.message, "error"); return; }
    toast("পেমেন্ট স্ট্যাটাস আপডেট হয়েছে", "success");
    setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: paymentStatus } : o));
    setSelectedOrder(prev => prev ? { ...prev, payment_status: paymentStatus } : null);
  }

  const filtered = orders.filter(o =>
    !search || o.order_number?.toString().includes(search) || o.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">অর্ডার ব্যবস্থাপনা</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1 flex-wrap border-b border-slate-200 dark:border-slate-700 flex-1">
          {[{ id: "all", label: "সব" }, ...STATUSES.map(s => ({ id: s, label: STATUS_BN[s] }))].map(t => (
            <button key={t.id} onClick={() => setFilterStatus(t.id)} className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${filterStatus === t.id ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="অর্ডার নং / নাম..." className="input-base sm:w-48" />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}</div>
      ) : !filtered.length ? (
        <div className="card rounded-2xl p-10 text-center text-slate-400">কোনো অর্ডার নেই</div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">অর্ডার</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">গ্রাহক</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">মোট</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">স্ট্যাটাস</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">পেমেন্ট</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800 dark:text-slate-200">#{order.order_number}</p>
                    <p className="text-xs text-slate-400">{timeAgo(order.created_at)}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                    <p>{order.profiles?.full_name || "—"}</p>
                    <p className="text-xs text-slate-400">{order.profiles?.phone || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600 hidden md:table-cell">{formatPrice(order.total_amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-500"}`}>
                      {STATUS_BN[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${order.payment_status === "paid" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                      {PAY_BN[order.payment_status] || order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openOrder(order)} className="text-xs text-blue-600 hover:underline">বিবরণ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal */}
      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder ? `অর্ডার #${selectedOrder.order_number}` : ""} size="lg">
        {selectedOrder && (
          <div className="space-y-4 text-sm">
            {/* Status + Payment control */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">অর্ডার স্ট্যাটাস</label>
                <select value={selectedOrder.status} onChange={e => updateStatus(selectedOrder.id, e.target.value)} disabled={updatingStatus} className="input-base">
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_BN[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">পেমেন্ট স্ট্যাটাস</label>
                <select value={selectedOrder.payment_status} onChange={e => updatePaymentStatus(selectedOrder.id, e.target.value)} className="input-base">
                  {["pending", "paid", "failed", "refunded"].map(s => <option key={s} value={s}>{PAY_BN[s]}</option>)}
                </select>
              </div>
            </div>

            {/* Customer */}
            <div className="card rounded-xl p-3 grid grid-cols-2 gap-2">
              <div><span className="text-slate-400 text-xs">গ্রাহক</span><p className="font-semibold">{selectedOrder.profiles?.full_name || "—"}</p></div>
              <div><span className="text-slate-400 text-xs">ফোন</span><p className="font-semibold">{selectedOrder.profiles?.phone || selectedOrder.shipping_info?.phone || "—"}</p></div>
              <div className="col-span-2"><span className="text-slate-400 text-xs">ঠিকানা</span><p className="font-semibold">{selectedOrder.shipping_info?.address}, {selectedOrder.shipping_info?.district}</p></div>
            </div>

            {/* Items */}
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">পণ্য সমূহ</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.products?.images?.[0] && <img src={item.products.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="font-medium">{item.products?.name_bn}</p>
                      <p className="text-xs text-slate-400">{item.quantity} {item.products?.unit} × {formatPrice(item.unit_price)}</p>
                    </div>
                    <p className="font-semibold text-green-600">{formatPrice(item.quantity * item.unit_price)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>ডেলিভারি চার্জ</span>
                <span>{selectedOrder.delivery_charge > 0 ? formatPrice(selectedOrder.delivery_charge) : "ফ্রি"}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 dark:text-white">
                <span>মোট</span>
                <span className="text-green-600">{formatPrice(selectedOrder.total_amount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>পেমেন্ট পদ্ধতি</span>
                <span>{PAY_METHOD_BN[selectedOrder.payment_method] || selectedOrder.payment_method}</span>
              </div>
            </div>

            <Button variant="secondary" onClick={() => setSelectedOrder(null)} className="w-full">বন্ধ করুন</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
