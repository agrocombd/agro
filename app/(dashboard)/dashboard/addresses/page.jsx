"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmModal } from "@/components/ui/Modal";

const DIVISIONS = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];
const LABELS = ["Home", "Office", "Other"];
const EMPTY = { label: "Home", full_name: "", phone: "", division: "ঢাকা", district: "", upazila: "", address: "", postal_code: "", is_default: false };

export default function AddressesPage() {
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => { fetchAddresses(); }, []);

  async function fetchAddresses() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at");
    setAddresses(data || []);
    setLoading(false);
  }

  function openNew() { setForm(EMPTY); setEditId(null); setShowModal(true); }
  function openEdit(addr) {
    setForm({ label: addr.label || "Home", full_name: addr.full_name, phone: addr.phone, division: addr.division || "ঢাকা", district: addr.district || "", upazila: addr.upazila || "", address: addr.address, postal_code: addr.postal_code || "", is_default: addr.is_default });
    setEditId(addr.id);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.full_name.trim() || !form.phone.trim() || !form.address.trim()) { toast("নাম, ফোন ও ঠিকানা দিন", "error"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      if (form.is_default) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
      }
      if (editId) {
        const { error } = await supabase.from("addresses").update(form).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("addresses").insert({ ...form, user_id: userId });
        if (error) throw error;
      }
      toast(editId ? "ঠিকানা আপডেট হয়েছে" : "ঠিকানা যোগ হয়েছে", "success");
      setShowModal(false);
      fetchAddresses();
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    const supabase = createClient();
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) { toast(error.message, "error"); } else {
      toast("ঠিকানা মুছে ফেলা হয়েছে", "success");
      setAddresses(a => a.filter(x => x.id !== id));
    }
    setShowDelete(null);
  }

  async function setDefault(id) {
    const supabase = createClient();
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    if (error) { toast(error.message, "error"); return; }
    setAddresses(a => a.map(x => ({ ...x, is_default: x.id === id })));
    toast("ডিফল্ট ঠিকানা সেট হয়েছে", "success");
  }

  if (loading) return <div className="animate-pulse space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}</div>;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">আমার ঠিকানা</h1>
        <Button onClick={openNew}>+ নতুন ঠিকানা</Button>
      </div>

      {!addresses.length ? (
        <div className="card rounded-2xl p-10 text-center">
          <p className="text-5xl mb-3">📍</p>
          <p className="text-slate-500 mb-4">কোনো ঠিকানা নেই</p>
          <Button onClick={openNew}>ঠিকানা যোগ করুন</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className={`card rounded-2xl p-4 ${addr.is_default ? "border-green-500 dark:border-green-600" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full px-2 py-0.5">{addr.label}</span>
                    {addr.is_default && <span className="text-xs font-bold bg-green-100 text-green-600 rounded-full px-2 py-0.5">ডিফল্ট</span>}
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{addr.full_name}</p>
                  <p className="text-sm text-slate-500">{addr.phone}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{addr.address}{addr.upazila ? `, ${addr.upazila}` : ""}, {addr.district}, {addr.division}</p>
                  {addr.postal_code && <p className="text-xs text-slate-400">পোস্টাল: {addr.postal_code}</p>}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0 items-end">
                  <button onClick={() => openEdit(addr)} className="text-xs text-blue-600 hover:underline">সম্পাদনা</button>
                  <button onClick={() => setShowDelete(addr.id)} className="text-xs text-red-500 hover:underline">মুছুন</button>
                  {!addr.is_default && (
                    <button onClick={() => setDefault(addr.id)} className="text-xs text-green-600 hover:underline">ডিফল্ট করুন</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "ঠিকানা সম্পাদনা" : "নতুন ঠিকানা"} size="md">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">লেবেল</label>
              <select value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="input-base">
                {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">বিভাগ</label>
              <select value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))} className="input-base">
                {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="পূর্ণ নাম *" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            <Input label="ফোন নং *" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="জেলা" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} />
            <Input label="উপজেলা" value={form.upazila} onChange={e => setForm(f => ({ ...f, upazila: e.target.value }))} />
          </div>
          <Input label="বিস্তারিত ঠিকানা *" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <Input label="পোস্টাল কোড" value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} />
            ডিফল্ট ঠিকানা হিসেবে সেট করুন
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
        title="ঠিকানা মুছে ফেলবেন?"
        message="এই ঠিকানাটি স্থায়ীভাবে মুছে যাবে।"
      />
    </div>
  );
}
