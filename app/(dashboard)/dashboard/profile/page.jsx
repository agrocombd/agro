"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidBDPhone } from "@/lib/utils";

export default function ProfilePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: "", phone: "", bio: "" });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return;
      setUser(data.user);
      const { data: profile } = await supabase.from("profiles").select("full_name,phone,bio").eq("id", data.user.id).single();
      if (profile) setForm({ full_name: profile.full_name || "", phone: profile.phone || "", bio: profile.bio || "" });
      setLoading(false);
    });
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    if (!form.full_name.trim()) { toast("নাম দিন", "error"); return; }
    if (form.phone && !isValidBDPhone(form.phone)) { toast("সঠিক মোবাইল নম্বর দিন", "error"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ full_name: form.full_name.trim(), phone: form.phone, bio: form.bio }).eq("id", user.id);
      if (error) throw error;
      toast("প্রোফাইল সংরক্ষিত হয়েছে", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pwForm.newPw.length < 8) { toast("পাসওয়ার্ড ন্যূনতম ৮ অক্ষর", "error"); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast("পাসওয়ার্ড মিলছে না", "error"); return; }
    setPwLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
      if (error) throw error;
      toast("পাসওয়ার্ড পরিবর্তন হয়েছে", "success");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setPwLoading(false);
    }
  }

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">প্রোফাইল</h1>

      {/* Profile info */}
      <form onSubmit={saveProfile} className="card rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white">ব্যক্তিগত তথ্য</h2>
        <Input label="পূর্ণ নাম" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
        <Input label="ইমেইল" value={user?.email || ""} disabled hint="ইমেইল পরিবর্তন করা যাবে না" />
        <Input label="মোবাইল নম্বর" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">পরিচিতি (ঐচ্ছিক)</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="নিজের সম্পর্কে লিখুন..." rows={3} className="input-base resize-none w-full" />
        </div>
        <Button type="submit" loading={saving}>সংরক্ষণ করুন</Button>
      </form>

      {/* Change password */}
      <form onSubmit={changePassword} className="card rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white">পাসওয়ার্ড পরিবর্তন</h2>
        <Input label="নতুন পাসওয়ার্ড" type="password" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} placeholder="ন্যূনতম ৮ অক্ষর" />
        <Input label="পাসওয়ার্ড নিশ্চিত করুন" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
        <Button type="submit" variant="secondary" loading={pwLoading}>পাসওয়ার্ড পরিবর্তন করুন</Button>
      </form>
    </div>
  );
}
