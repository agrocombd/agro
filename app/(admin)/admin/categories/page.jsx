"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

const EMPTY = { name_bn: "", name_en: "", slug: "", icon: "🌿", sort_order: 0, is_active: true, is_perishable: false };

export default function CategoriesPage() {
  const toast = useToast();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCats(); }, []);

  async function fetchCats() {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCats(data || []);
    setLoading(false);
  }

  function openNew() { setForm(EMPTY); setEditId(null); setShowModal(true); }
  function openEdit(cat) { setForm({ name_bn: cat.name_bn, name_en: cat.name_en || "", slug: cat.slug, icon: cat.icon || "🌿", sort_order: cat.sort_order || 0, is_active: cat.is_active, is_perishable: cat.is_perishable || false }); setEditId(cat.id); setShowModal(true); }

  async function handleSave() {
    if (!form.name_bn.trim() || !form.slug.trim()) { toast("নাম ও স্লাগ দিন", "error"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      if (editId) {
        const { error } = await supabase.from("categories").update(form).eq("id", editId);
        if (error) throw error;
        toast("বিভাগ আপডেট হয়েছে", "success");
      } else {
        const { error } = await supabase.from("categories").insert(form);
        if (error) throw error;
        toast("বিভাগ তৈরি হয়েছে", "success");
      }
      setShowModal(false);
      fetchCats();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast("বিভাগ মুছে ফেলা হয়েছে", "success");
      fetchCats();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setShowDelete(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">পণ্য বিভাগ</h1>
        <Button onClick={openNew}>+ নতুন বিভাগ</Button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}</div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">বিভাগ</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">স্লাগ</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">পচনশীল</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">সক্রিয়</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {cats.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    <span className="mr-2">{cat.icon}</span>{cat.name_bn}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", cat.is_perishable ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400")}>
                      {cat.is_perishable ? "হ্যাঁ" : "না"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", cat.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500")}>
                      {cat.is_active ? "হ্যাঁ" : "না"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="text-xs text-blue-600 hover:underline">সম্পাদনা</button>
                      <button onClick={() => setShowDelete(cat.id)} className="text-xs text-red-500 hover:underline">মুছুন</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "বিভাগ সম্পাদনা" : "নতুন বিভাগ"}>
        <div className="space-y-3">
          <Input label="নাম (বাংলা)" value={form.name_bn} onChange={e => setForm(f => ({ ...f, name_bn: e.target.value }))} required />
          <Input label="নাম (ইংরেজি)" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
          <Input label="স্লাগ (slug)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="vegetables" required />
          <Input label="আইকন (emoji)" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🌿" />
          <Input label="ক্রম (sort order)" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={form.is_perishable} onChange={e => setForm(f => ({ ...f, is_perishable: e.target.checked }))} className="rounded" />
              পচনশীল (তাজা পণ্য)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
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
        onConfirm={() => handleDelete(showDelete)}
        title="বিভাগ মুছে ফেলবেন?"
        message="এই বিভাগের সব পণ্য প্রভাবিত হতে পারে।"
      />
    </div>
  );
}
