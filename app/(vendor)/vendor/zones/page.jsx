"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/utils";

const DIVISIONS = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];
const EMPTY = { division: "ঢাকা", district: "", delivery_charge: 60, min_days: 1, max_days: 3, is_active: true };

export default function VendorZonesPage() {
  const toast = useToast();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => { init(); }, []);

  async function init() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from("vendor_delivery_zones").select("*").eq("vendor_id", user.id).order("division");
    setZones(data || []);
    setLoading(false);
  }

  function openNew() { setForm(EMPTY); setEditId(null); setShowModal(true); }
  function openEdit(z) {
    setForm({ division: z.division, district: z.district || "", delivery_charge: z.delivery_charge, min_days: z.min_days || 1, max_days: z.max_days || 3, is_active: z.is_active });
    setEditId(z.id);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.division) { toast("বিভাগ বাছাই করুন", "error"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = { ...form, delivery_charge: Number(form.delivery_charge) || 0, min_days: Number(form.min_days) || 1, max_days: Number(form.max_days) || 3 };
      if (editId) {
        const { error } = await supabase.from("vendor_delivery_zones").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vendor_delivery_zones").insert({ ...payload, vendor_id: userId });
        if (error) throw error;
      }
      toast(editId ? "আপডেট হয়েছে" : "জোন যোগ হয়েছে", "success");
      setShowModal(false);
      init();
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    const supabase = createClient();
    const { error } = await supabase.from("vendor_delivery_zones").delete().eq("id", id);
    if (error) { toast(error.message, "error"); } else {
      toast("জোন মুছে ফেলা হয়েছে", "success");
      setZones(z => z.filter(x => x.id !== id));
    }
    setShowDelete(null);
  }

  async function toggleActive(id, current) {
    const supabase = createClient();
    const { error } = await supabase.from("vendor_delivery_zones").update({ is_active: !current }).eq("id", id);
    if (!error) setZones(z => z.map(x => x.id === id ? { ...x, is_active: !current } : x));
    else toast(error.message, "error");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">ডেলিভারি জোন</h1>
          <p className="text-sm text-slate-400 mt-0.5">আপনি কোন কোন এলাকায় ডেলিভারি দেন সেটি নির্ধারণ করুন</p>
        </div>
        <Button onClick={openNew}>+ জোন যোগ</Button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}</div>
      ) : !zones.length ? (
        <div className="card rounded-2xl p-12 text-center">
          <p className="text-5xl mb-3">🗺</p>
          <p className="text-slate-500 dark:text-slate-400 mb-4">কোনো ডেলিভারি জোন নেই</p>
          <Button onClick={openNew}>প্রথম জোন যোগ করুন</Button>
        </div>
      ) : (
        <div className="card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">এলাকা</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">চার্জ</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">সময়</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">সক্রিয়</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {zones.map(zone => (
                <tr key={zone.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {zone.division}{zone.district ? ` — ${zone.district}` : " (পুরো বিভাগ)"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">{formatPrice(zone.delivery_charge)}</td>
                  <td className="px-4 py-3 text-center text-slate-500 text-xs hidden sm:table-cell">{zone.min_days}–{zone.max_days} দিন</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(zone.id, zone.is_active)} className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${zone.is_active ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                      {zone.is_active ? "হ্যাঁ" : "না"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(zone)} className="text-xs text-blue-600 hover:underline">সম্পাদনা</button>
                      <button onClick={() => setShowDelete(zone.id)} className="text-xs text-red-500 hover:underline">মুছুন</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "জোন সম্পাদনা" : "নতুন ডেলিভারি জোন"} size="sm">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">বিভাগ</label>
            <select value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))} className="input-base">
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <Input label="জেলা (ঐচ্ছিক)" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="খালি রাখলে পুরো বিভাগ" />
          <Input label="ডেলিভারি চার্জ (৳)" type="number" min="0" value={form.delivery_charge} onChange={e => setForm(f => ({ ...f, delivery_charge: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="সর্বনিম্ন দিন" type="number" min="1" value={form.min_days} onChange={e => setForm(f => ({ ...f, min_days: e.target.value }))} />
            <Input label="সর্বোচ্চ দিন" type="number" min="1" value={form.max_days} onChange={e => setForm(f => ({ ...f, max_days: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
            সক্রিয়
          </label>
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
        title="জোন মুছে ফেলবেন?"
        message="এই ডেলিভারি জোনটি মুছে যাবে।"
      />
    </div>
  );
}
