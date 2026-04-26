"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const DIVISIONS = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];

export default function VendorProfilePage() {
  const toast = useToast();
  const [form, setForm] = useState({
    business_name: "", business_type: "retail", trade_license: "",
    nid_number: "", phone: "", address: "", division: "", district: "",
    bank_name: "", bank_account: "", bkash_number: "", description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorId, setVendorId] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setVendorId(data.id);
      setIsApproved(data.is_approved || false);
      setForm({
        business_name: data.business_name || "",
        business_type: data.business_type || "retail",
        trade_license: data.trade_license || "",
        nid_number: data.nid_number || "",
        phone: data.phone || "",
        address: data.address || "",
        division: data.division || "",
        district: data.district || "",
        bank_name: data.bank_name || "",
        bank_account: data.bank_account || "",
        bkash_number: data.bkash_number || "",
        description: data.description || "",
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!form.business_name.trim()) { toast("ব্যবসার নাম দিন", "error"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { ...form, user_id: user.id };
      const { error } = vendorId
        ? await supabase.from("vendor_profiles").update(form).eq("id", vendorId)
        : await supabase.from("vendor_profiles").insert(payload);
      if (error) throw error;
      toast("তথ্য সংরক্ষিত হয়েছে", "success");
      if (!vendorId) fetchProfile();
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  if (loading) return <div className="animate-pulse space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}</div>;

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">ব্যবসার তথ্য</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isApproved ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
          {isApproved ? "✓ অনুমোদিত" : "পর্যালোচনায়"}
        </span>
      </div>

      <div className="card rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">মূল তথ্য</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="ব্যবসার নাম *" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">ব্যবসার ধরন</label>
            <select value={form.business_type} onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))} className="input-base">
              <option value="retail">রিটেইল</option>
              <option value="b2b">B2B (পাইকারি)</option>
              <option value="both">উভয়</option>
            </select>
          </div>
          <Input label="ট্রেড লাইসেন্স নং" value={form.trade_license} onChange={e => setForm(f => ({ ...f, trade_license: e.target.value }))} />
          <Input label="NID নং" value={form.nid_number} onChange={e => setForm(f => ({ ...f, nid_number: e.target.value }))} />
          <Input label="ফোন নং" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">ব্যবসার বিবরণ</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-base resize-none w-full" rows={3} />
        </div>
      </div>

      <div className="card rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">ঠিকানা</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">বিভাগ</label>
            <select value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))} className="input-base">
              <option value="">বিভাগ বাছাই করুন</option>
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <Input label="জেলা" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="যেমন: গাজীপুর" />
        </div>
        <Input label="বিস্তারিত ঠিকানা" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
      </div>

      <div className="card rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-800 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">পেমেন্ট তথ্য</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="ব্যাংকের নাম" value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} />
          <Input label="ব্যাংক অ্যাকাউন্ট নং" value={form.bank_account} onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))} />
          <Input label="bKash নং" type="tel" value={form.bkash_number} onChange={e => setForm(f => ({ ...f, bkash_number: e.target.value }))} />
        </div>
      </div>

      <Button onClick={handleSave} loading={saving} className="w-full">সংরক্ষণ করুন</Button>
    </div>
  );
}
