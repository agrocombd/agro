"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/utils";

const EMPTY = {
  name_bn: "", name_en: "", description_bn: "", category_id: "",
  price: "", unit: "কেজি", min_order: 1, stock_qty: 0,
  product_type: "retail", is_active: true, is_perishable: false, images: [],
};

const UNITS = ["কেজি", "গ্রাম", "লিটার", "পিস", "ডজন", "বস্তা", "মণ", "কার্টন"];

export default function VendorProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imgInput, setImgInput] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => { init(); }, []);

  async function init() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("id,name_bn,price,unit,stock_qty,is_active,is_approved,product_type,category_id,images").eq("vendor_id", user.id).order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name_bn,icon").eq("is_active", true).order("sort_order"),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setLoading(false);
  }

  function openNew() { setForm(EMPTY); setEditId(null); setImgInput(""); setShowModal(true); }
  function openEdit(p) {
    setForm({
      name_bn: p.name_bn || "", name_en: p.name_en || "", description_bn: p.description_bn || "",
      category_id: p.category_id || "", price: p.price || "", unit: p.unit || "কেজি",
      min_order: p.min_order || 1, stock_qty: p.stock_qty || 0,
      product_type: p.product_type || "retail", is_active: p.is_active,
      is_perishable: p.is_perishable || false, images: p.images || [],
    });
    setEditId(p.id);
    setImgInput("");
    setShowModal(true);
  }

  function addImage() {
    const url = imgInput.trim();
    if (!url) return;
    if (!url.startsWith("http")) { toast("সঠিক URL দিন", "error"); return; }
    setForm(f => ({ ...f, images: [...f.images, url] }));
    setImgInput("");
  }

  async function handleSave() {
    if (!form.name_bn.trim()) { toast("পণ্যের নাম দিন", "error"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast("মূল্য সঠিকভাবে দিন", "error"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        ...form,
        price: Number(form.price),
        min_order: Number(form.min_order) || 1,
        stock_qty: Number(form.stock_qty) || 0,
        vendor_id: userId,
        is_approved: false,
      };
      if (editId) {
        delete payload.vendor_id;
        delete payload.is_approved;
        const { error } = await supabase.from("products").update(payload).eq("id", editId);
        if (error) throw error;
        toast("পণ্য আপডেট হয়েছে", "success");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast("পণ্য যোগ হয়েছে — অনুমোদনের অপেক্ষায়", "success");
      }
      setShowModal(false);
      init();
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast("পণ্য মুছে ফেলা হয়েছে", "success");
      setProducts(p => p.filter(x => x.id !== id));
    } catch (err) { toast(err.message, "error"); } finally { setShowDelete(null); }
  }

  async function toggleActive(id, current) {
    const supabase = createClient();
    const { error } = await supabase.from("products").update({ is_active: !current }).eq("id", id);
    if (!error) setProducts(p => p.map(x => x.id === id ? { ...x, is_active: !current } : x));
    else toast(error.message, "error");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">আমার পণ্য</h1>
        <Button onClick={openNew}>+ নতুন পণ্য</Button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}</div>
      ) : !products.length ? (
        <div className="card rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-slate-500 dark:text-slate-400">কোনো পণ্য নেই</p>
          <button onClick={openNew} className="mt-4 text-sm font-semibold text-green-600 hover:underline">প্রথম পণ্য যোগ করুন →</button>
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">পণ্য</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">মূল্য</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">স্টক</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">স্ট্যাটাস</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">📦</div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{p.name_bn}</p>
                        <span className="text-[10px] text-slate-400">{p.product_type === "b2b" ? "B2B" : "রিটেইল"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600 hidden sm:table-cell">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-center text-slate-500 hidden sm:table-cell">{p.stock_qty} {p.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => toggleActive(p.id, p.is_active)}
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${p.is_active ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                      >
                        {p.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </button>
                      {!p.is_approved && <span className="rounded-full bg-amber-100 text-amber-600 px-2 py-0.5 text-[10px] font-semibold">পর্যালোচনায়</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">সম্পাদনা</button>
                      <button onClick={() => setShowDelete(p.id)} className="text-xs text-red-500 hover:underline">মুছুন</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "পণ্য সম্পাদনা" : "নতুন পণ্য"} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="নাম (বাংলা) *" value={form.name_bn} onChange={e => setForm(f => ({ ...f, name_bn: e.target.value }))} required />
            <Input label="নাম (ইংরেজি)" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">বিবরণ</label>
            <textarea value={form.description_bn} onChange={e => setForm(f => ({ ...f, description_bn: e.target.value }))} className="input-base resize-none w-full" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">বিভাগ</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input-base">
                <option value="">বিভাগ বাছাই করুন</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_bn}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">পণ্যের ধরন</label>
              <select value={form.product_type} onChange={e => setForm(f => ({ ...f, product_type: e.target.value }))} className="input-base">
                <option value="retail">রিটেইল</option>
                <option value="b2b">B2B (পাইকারি)</option>
                <option value="both">উভয়</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="মূল্য (৳) *" type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">একক</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input-base">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <Input label="ন্যূনতম অর্ডার" type="number" min="1" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} />
          </div>

          <Input label="স্টক পরিমাণ" type="number" min="0" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))} />

          {/* Image URLs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">ছবির URL</label>
            <div className="flex gap-2">
              <input value={imgInput} onChange={e => setImgInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addImage())} placeholder="https://..." className="input-base flex-1" />
              <button type="button" onClick={addImage} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0">যোগ</button>
            </div>
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700" onError={e => e.target.style.display = "none"} />
                    <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={form.is_perishable} onChange={e => setForm(f => ({ ...f, is_perishable: e.target.checked }))} className="rounded" />
              পচনশীল পণ্য
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
              সক্রিয়
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">বাতিল</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">সংরক্ষণ</Button>
          </div>
        </div>
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
