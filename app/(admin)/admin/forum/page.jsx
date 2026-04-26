"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmModal } from "@/components/ui/Modal";

const EMPTY_CAT = { name_bn: "", name_en: "", slug: "", icon: "💬", description_bn: "", sort_order: 0, is_active: true };
const EMPTY_NOTICE = { title: "", content: "", is_active: true };

export default function ForumAdminPage() {
  const toast = useToast();
  const [tab, setTab] = useState("categories");
  const [cats, setCats] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [noticeForm, setNoticeForm] = useState(EMPTY_NOTICE);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const supabase = createClient();
    const [catsRes, noticesRes] = await Promise.all([
      supabase.from("forum_categories").select("*").order("sort_order"),
      supabase.from("admin_notices").select("*").order("created_at", { ascending: false }),
    ]);
    setCats(catsRes.data || []);
    setNotices(noticesRes.data || []);
    setLoading(false);
  }

  // Category handlers
  async function saveCat() {
    if (!catForm.name_bn.trim() || !catForm.slug.trim()) { toast("নাম ও স্লাগ দিন", "error"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      if (editId) {
        const { error } = await supabase.from("forum_categories").update(catForm).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("forum_categories").insert(catForm);
        if (error) throw error;
      }
      toast(editId ? "আপডেট হয়েছে" : "তৈরি হয়েছে", "success");
      setShowCatModal(false);
      fetchAll();
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  // Notice handlers
  async function saveNotice() {
    if (!noticeForm.title.trim()) { toast("শিরোনাম দিন", "error"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      if (editId) {
        const { error } = await supabase.from("admin_notices").update(noticeForm).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("admin_notices").insert(noticeForm);
        if (error) throw error;
      }
      toast(editId ? "আপডেট হয়েছে" : "নোটিশ তৈরি হয়েছে", "success");
      setShowNoticeModal(false);
      fetchAll();
    } catch (err) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  async function deleteItem(table, id) {
    try {
      const supabase = createClient();
      await supabase.from(table).delete().eq("id", id);
      toast("মুছে ফেলা হয়েছে", "success");
      fetchAll();
    } catch (err) { toast(err.message, "error"); } finally { setShowDelete(null); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">ফোরাম পরিচালনা</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {[{ id: "categories", label: "বিভাগ" }, { id: "notices", label: "নোটিশ" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "categories" && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => { setCatForm(EMPTY_CAT); setEditId(null); setShowCatModal(true); }}>+ নতুন বিভাগ</Button>
          </div>
          <div className="card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">বিভাগ</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">স্লাগ</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">সক্রিয়</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cats.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200"><span className="mr-2">{cat.icon}</span>{cat.name_bn}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">{cat.slug}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cat.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>{cat.is_active ? "হ্যাঁ" : "না"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setCatForm({ name_bn: cat.name_bn, name_en: cat.name_en || "", slug: cat.slug, icon: cat.icon || "💬", description_bn: cat.description_bn || "", sort_order: cat.sort_order || 0, is_active: cat.is_active }); setEditId(cat.id); setShowCatModal(true); }} className="text-xs text-blue-600 hover:underline">সম্পাদনা</button>
                        <button onClick={() => setShowDelete({ table: "forum_categories", id: cat.id })} className="text-xs text-red-500 hover:underline">মুছুন</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "notices" && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => { setNoticeForm(EMPTY_NOTICE); setEditId(null); setShowNoticeModal(true); }}>+ নতুন নোটিশ</Button>
          </div>
          <div className="space-y-3">
            {notices.map(notice => (
              <div key={notice.id} className="card rounded-2xl p-4 flex gap-3 items-start">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{notice.title}</p>
                  {notice.content && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{notice.content}</p>}
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${notice.is_active ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>{notice.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setNoticeForm({ title: notice.title, content: notice.content || "", is_active: notice.is_active }); setEditId(notice.id); setShowNoticeModal(true); }} className="text-xs text-blue-600 hover:underline">সম্পাদনা</button>
                  <button onClick={() => setShowDelete({ table: "admin_notices", id: notice.id })} className="text-xs text-red-500 hover:underline">মুছুন</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Category Modal */}
      <Modal open={showCatModal} onClose={() => setShowCatModal(false)} title={editId ? "বিভাগ সম্পাদনা" : "নতুন ফোরাম বিভাগ"}>
        <div className="space-y-3">
          <Input label="নাম (বাংলা)" value={catForm.name_bn} onChange={e => setCatForm(f => ({ ...f, name_bn: e.target.value }))} required />
          <Input label="নাম (ইংরেজি)" value={catForm.name_en} onChange={e => setCatForm(f => ({ ...f, name_en: e.target.value }))} />
          <Input label="স্লাগ" value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} required />
          <Input label="আইকন" value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">বিবরণ</label>
            <textarea value={catForm.description_bn} onChange={e => setCatForm(f => ({ ...f, description_bn: e.target.value }))} className="input-base resize-none w-full" rows={3} />
          </div>
          <Input label="ক্রম" type="number" value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={catForm.is_active} onChange={e => setCatForm(f => ({ ...f, is_active: e.target.checked }))} />
            সক্রিয়
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCatModal(false)} className="flex-1">বাতিল</Button>
            <Button onClick={saveCat} loading={saving} className="flex-1">সংরক্ষণ</Button>
          </div>
        </div>
      </Modal>

      {/* Notice Modal */}
      <Modal open={showNoticeModal} onClose={() => setShowNoticeModal(false)} title={editId ? "নোটিশ সম্পাদনা" : "নতুন নোটিশ"}>
        <div className="space-y-3">
          <Input label="শিরোনাম" value={noticeForm.title} onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">বিবরণ</label>
            <textarea value={noticeForm.content} onChange={e => setNoticeForm(f => ({ ...f, content: e.target.value }))} className="input-base resize-none w-full" rows={4} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={noticeForm.is_active} onChange={e => setNoticeForm(f => ({ ...f, is_active: e.target.checked }))} />
            সক্রিয়
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowNoticeModal(false)} className="flex-1">বাতিল</Button>
            <Button onClick={saveNotice} loading={saving} className="flex-1">সংরক্ষণ</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!showDelete}
        onClose={() => setShowDelete(null)}
        onConfirm={() => showDelete && deleteItem(showDelete.table, showDelete.id)}
        title="মুছে ফেলবেন?"
        message="এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।"
      />
    </div>
  );
}
