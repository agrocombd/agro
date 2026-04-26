"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/utils";

const STATUS_MAP = {
  all: null,
  pending: false,
  approved: true,
};

export default function AdminProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [showDelete, setShowDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { fetchProducts(); }, [filter]);

  async function fetchProducts() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("id,name_bn,price,unit,stock_qty,is_active,is_approved,product_type,vendor_id,images,created_at,categories(name_bn),profiles:vendor_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (STATUS_MAP[filter] !== null) {
      query = query.eq("is_approved", STATUS_MAP[filter]);
    }
    const { data, error } = await query;
    if (error) toast(error.message, "error");
    setProducts(data || []);
    setLoading(false);
  }

  async function approve(id, approved) {
    const supabase = createClient();
    const { error } = await supabase.from("products").update({ is_approved: approved }).eq("id", id);
    if (error) { toast(error.message, "error"); return; }
    toast(approved ? "পণ্য অনুমোদিত হয়েছে" : "পণ্য বাতিল হয়েছে", "success");
    setProducts(p => p.map(x => x.id === id ? { ...x, is_approved: approved } : x));
  }

  async function handleDelete(id) {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast(error.message, "error"); } else {
      toast("পণ্য মুছে ফেলা হয়েছে", "success");
      setProducts(p => p.filter(x => x.id !== id));
    }
    setShowDelete(null);
  }

  const filtered = products.filter(p =>
    !search || p.name_bn?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">পণ্য ব্যবস্থাপনা</h1>

      {/* Filter tabs */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 flex-1">
          {[
            { id: "pending", label: "অনুমোদন বাকি" },
            { id: "approved", label: "অনুমোদিত" },
            { id: "all", label: "সব" },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${filter === t.id ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="পণ্য খুঁজুন..." className="input-base sm:w-56" />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}</div>
      ) : !filtered.length ? (
        <div className="card rounded-2xl p-10 text-center text-slate-400">কোনো পণ্য নেই</div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">পণ্য</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">বিক্রেতা</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">মূল্য</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">স্ট্যাটাস</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">📦</div>
                      )}
                      <div>
                        <button onClick={() => setSelectedProduct(p)} className="font-medium text-slate-800 dark:text-slate-200 hover:text-green-600 text-left line-clamp-1">{p.name_bn}</button>
                        <p className="text-[10px] text-slate-400">{p.categories?.name_bn || "—"} · {p.product_type === "b2b" ? "B2B" : "রিটেইল"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{p.profiles?.full_name || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600 hidden sm:table-cell">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.is_approved ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                      {p.is_approved ? "অনুমোদিত" : "অপেক্ষারত"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2 flex-wrap">
                      {!p.is_approved && (
                        <button onClick={() => approve(p.id, true)} className="text-xs text-green-600 hover:underline font-semibold">অনুমোদন</button>
                      )}
                      {p.is_approved && (
                        <button onClick={() => approve(p.id, false)} className="text-xs text-amber-600 hover:underline">বাতিল</button>
                      )}
                      <button onClick={() => setShowDelete(p.id)} className="text-xs text-red-500 hover:underline">মুছুন</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product detail preview modal */}
      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="পণ্যের বিবরণ" size="md">
        {selectedProduct && (
          <div className="space-y-3 text-sm">
            {selectedProduct.images?.[0] && (
              <img src={selectedProduct.images[0]} alt="" className="w-full h-48 object-cover rounded-xl" />
            )}
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-slate-400">নাম</span><p className="font-semibold">{selectedProduct.name_bn}</p></div>
              <div><span className="text-slate-400">মূল্য</span><p className="font-semibold text-green-600">{formatPrice(selectedProduct.price)} / {selectedProduct.unit}</p></div>
              <div><span className="text-slate-400">বিক্রেতা</span><p className="font-semibold">{selectedProduct.profiles?.full_name || "—"}</p></div>
              <div><span className="text-slate-400">স্টক</span><p className="font-semibold">{selectedProduct.stock_qty} {selectedProduct.unit}</p></div>
              <div><span className="text-slate-400">বিভাগ</span><p className="font-semibold">{selectedProduct.categories?.name_bn || "—"}</p></div>
              <div><span className="text-slate-400">ধরন</span><p className="font-semibold">{selectedProduct.product_type === "b2b" ? "B2B" : "রিটেইল"}</p></div>
            </div>
            <div className="flex gap-3 pt-2">
              {!selectedProduct.is_approved && (
                <Button onClick={() => { approve(selectedProduct.id, true); setSelectedProduct(null); }} className="flex-1">অনুমোদন দিন</Button>
              )}
              <Button variant="secondary" onClick={() => setSelectedProduct(null)} className="flex-1">বন্ধ করুন</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!showDelete}
        onClose={() => setShowDelete(null)}
        onConfirm={() => showDelete && handleDelete(showDelete)}
        title="পণ্য মুছে ফেলবেন?"
        message="এই পণ্যটি স্থায়ীভাবে মুছে যাবে।"
      />
    </div>
  );
}
