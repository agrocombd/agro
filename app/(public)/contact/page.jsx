"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast("সব তথ্য দিন", "error"); return; }
    setLoading(true);
    try {
      // Store in Supabase or send email — here we save to a contact_messages table
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("পাঠানো যায়নি");
      setSent(true);
      toast("বার্তা পাঠানো হয়েছে!", "success");
    } catch {
      toast("পাঠানো যায়নি। পরে চেষ্টা করুন।", "error");
    } finally {
      setLoading(false);
    }
  }

  if (sent) return (
    <div className="container-app py-20 text-center">
      <div className="text-6xl mb-4">📬</div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">বার্তা পাঠানো হয়েছে!</h2>
      <p className="text-slate-500">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
    </div>
  );

  return (
    <div className="container-app py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">যোগাযোগ করুন</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">যেকোনো প্রশ্ন বা সমস্যার জন্য আমাদের সাথে যোগাযোগ করুন।</p>
          <div className="space-y-4">
            {[
              { icon: "📧", label: "ইমেইল", value: "info@agro.com.bd" },
              { icon: "📱", label: "ফোন", value: "+880 1XXXXXXXXX" },
              { icon: "📍", label: "ঠিকানা", value: "ঢাকা, বাংলাদেশ" },
              { icon: "⏰", label: "সময়", value: "সোম–শুক্র: সকাল ৯টা – সন্ধ্যা ৬টা" },
            ].map(info => (
              <div key={info.label} className="flex items-start gap-3">
                <span className="text-xl">{info.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{info.label}</p>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card rounded-2xl p-6 space-y-4">
          <Input label="আপনার নাম" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="ইমেইল" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="বিষয়" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">বার্তা <span className="text-red-500">*</span></label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="আপনার বার্তা লিখুন..." rows={5} className="input-base resize-none w-full" required />
          </div>
          <Button type="submit" fullWidth loading={loading}>বার্তা পাঠান</Button>
        </form>
      </div>
    </div>
  );
}
