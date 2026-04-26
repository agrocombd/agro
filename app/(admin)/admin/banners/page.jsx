"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

export const dynamic = "force-dynamic";

const EMPTY_FORM = { title: "", subtitle: "", image_url: "", link_url: "", position: "home_hero", is_active: true, sort_order: 0 };
const POSITIONS = [
  { value: "home_hero", label: "হোম হিরো" },
  { value: "home_mid", label: "হোম মাঝামাঝি" },
  { value: "shop_top", label: "শপ শীর্ষে" },
  { value: "b2b_top", label: "B2B শীর্ষে" },
];

export default function AdminBannersPage() {
  const toast = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(banner) {
    setForm({ title: banner.title || "", subtitle: banner.subtitle || "", image_url: banner.image_url || "", link_url: banner.link_url || "", position: banner.position || "home_hero", is_active: banner.is_active ?? true, sort_order: banner.sort_order || 0 });
    setEditId(banner.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() { setForm(EMPTY_FORM); setEditId(null); setShowForm(false); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.image_url) { toast("ছবির URL দিন", "error"); return; }
    setSaving(true);
    const supabase = createClient();
    let error;
    if (editId) {
      ({ error } = await supabase.from("banners").update(form).eq("id", editId));
    } else {
      ({ error } = await supabase.from("banners").insert(form));
    }
    setSaving(false);
    if (error) { toast("সংরক্ষণ ব্যর্থ হয়েছে", "error"); return; }
    toast(editId ? "ব্যানার আপডেট হয়েছে" : "ব্যানার যোগ হয়েছে", "success");
    resetForm();
    load();
  }

  async function toggleActive(banner) {
    const supabase = createClient();
    await supabase.from("banners").update({ is_active: !banner.is_active }).eq("id", banner.id);
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b));
  }

  async function deleteBanner(id) {
    if (!confirm("এই ব্যানারটি মুছে ফেলবেন?")) return;
    const supabase = createClient();
    await supabase.from("banners").delete().eq("id", id);
    toast("ব্যানার মুছে ফেলা হয়েছে", "success");
    setBanners(prev => prev.filter(b => b.id !== id));
  }

  const posLabel = v => POSITIONS.find(p => p.value === v)?.label || v;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">ব্যানার ম্যানেজমেন্ট</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">হোমপেজ ও শপের ব্যানার নিয়ন্ত্রণ করুন</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 text-sm font-bold transition-colors">
          + নতুন ব্যানার
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-5">{editId ? "ব্যানার সম্পাদনা" : "নতুন ব্যানার যোগ করুন"}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">শিরোনাম</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ব্যানারের শিরোনাম" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">সাব-শিরোনাম</label>
                <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="ছোট বিবরণ" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">ছবির URL *</label>
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="input-field" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">লিংক URL</label>
                <input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="/shop অথবা বাইরের লিংক" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">অবস্থান</label>
                <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className="input-field">
                  {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">ক্রম (sort order)</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="input-field" min="0" />
              </div>
            </div>

            {form.image_url && (
              <div className="rounded-xl overflow-hidden max-h-40 border border-slate-200 dark:border-slate-700">
                <img src={form.image_url} alt="Preview" className="w-full h-40 object-cover" onError={e => { e.target.style.display = "none"; }} />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 accent-green-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">সক্রিয় করুন</span>
            </label>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2.5 text-sm font-bold transition-colors">
                {saving ? "সংরক্ষণ..." : editId ? "আপডেট করুন" : "যোগ করুন"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 dark:border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners list */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" /></div>
      ) : banners.length === 0 ? (
        <div className="card rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="text-slate-500 dark:text-slate-400">কোনো ব্যানার নেই। প্রথম ব্যানারটি যোগ করুন।</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map(banner => (
            <div key={banner.id} className="card rounded-2xl overflow-hidden flex flex-col sm:flex-row gap-0">
              <div className="sm:w-48 h-32 sm:h-auto bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative overflow-hidden">
                {banner.image_url ? (
                  <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-3xl">🖼️</div>
                )}
              </div>
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">{banner.title || "(শিরোনাম নেই)"}</h3>
                      {banner.subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{banner.subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{posLabel(banner.position)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${banner.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {banner.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </div>
                  </div>
                  {banner.link_url && <p className="text-xs text-blue-500 mt-1 truncate">{banner.link_url}</p>}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => startEdit(banner)} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    সম্পাদনা
                  </button>
                  <button onClick={() => toggleActive(banner)} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    {banner.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                  </button>
                  <button onClick={() => deleteBanner(banner.id)} className="rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    মুছুন
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
