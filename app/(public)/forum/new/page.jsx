"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", category_id: "" });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { router.push("/login?next=/forum/new"); return; }
      setUser(data.user);
    });
    supabase.from("forum_categories").select("id,name_bn,icon").eq("is_active", true).order("sort_order").then(({ data }) => setCategories(data || []));
  }, []);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast("শিরোনাম ও বিষয়বস্তু দিন", "error"); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({ user_id: user.id, title: form.title.trim(), content: form.content.trim(), category_id: form.category_id || null })
        .select("id")
        .single();
      if (error) throw error;
      toast("পোস্ট সফলভাবে তৈরি হয়েছে!", "success");
      router.push(`/forum/${data.id}`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-app py-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/forum" className="text-sm text-slate-500 hover:text-green-600 mb-4 flex items-center gap-1">← ফোরামে ফিরে যান</Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">নতুন পোস্ট লিখুন</h1>
      </div>

      <form onSubmit={handleSubmit} className="card rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">বিভাগ</label>
          <select value={form.category_id} onChange={e => update("category_id", e.target.value)} className="input-base">
            <option value="">বিভাগ বেছে নিন (ঐচ্ছিক)</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_bn}</option>)}
          </select>
        </div>
        <Input
          label="শিরোনাম"
          value={form.title}
          onChange={e => update("title", e.target.value)}
          placeholder="আপনার প্রশ্ন বা বিষয়ের সংক্ষিপ্ত শিরোনাম"
          required
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">বিস্তারিত বিবরণ <span className="text-red-500">*</span></label>
          <textarea
            value={form.content}
            onChange={e => update("content", e.target.value)}
            placeholder="আপনার প্রশ্ন বা বিষয় বিস্তারিত লিখুন..."
            rows={8}
            className="input-base resize-none w-full"
            required
          />
        </div>
        <Button type="submit" fullWidth loading={loading}>পোস্ট প্রকাশ করুন</Button>
      </form>
    </div>
  );
}
