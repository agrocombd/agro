"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidBDPhone } from "@/lib/utils";

const PRODUCT_TYPES = [
  "শাকসবজি", "ফলমূল", "ধান ও চাল", "মাছ ও মাংস", "দুগ্ধজাত পণ্য",
  "বীজ ও সার", "কীটনাশক", "কৃষি যন্ত্রপাতি", "অন্যান্য"
];

export default function B2BVendorSignupPage() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", password: "", confirm: "",
    company_name: "", company_address: "", trade_license: "", tin: "",
    annual_capacity: "", min_order_value: "",
  });

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  }

  function toggleType(t) {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function validateStep0() {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "নাম দিন";
    if (!form.email.includes("@")) errs.email = "সঠিক ইমেইল দিন";
    if (!isValidBDPhone(form.phone)) errs.phone = "সঠিক বাংলাদেশি নম্বর দিন";
    if (form.password.length < 8) errs.password = "পাসওয়ার্ড ন্যূনতম ৮ অক্ষর";
    if (form.password !== form.confirm) errs.confirm = "পাসওয়ার্ড মিলছে না";
    return errs;
  }

  function validateStep1() {
    const errs = {};
    if (!form.company_name.trim()) errs.company_name = "কোম্পানির নাম দিন";
    if (!form.company_address.trim()) errs.company_address = "ঠিকানা দিন";
    if (!form.trade_license.trim()) errs.trade_license = "ট্রেড লাইসেন্স নম্বর আবশ্যক";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            role: "b2b_vendor",
            business_name: form.company_name,
            business_address: form.company_address,
            trade_license: form.trade_license,
            tin: form.tin,
            annual_capacity: form.annual_capacity,
            min_order_value: form.min_order_value,
            product_types: selectedTypes.join(", "),
          },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      toast(err.message.includes("already registered") ? "এই ইমেইল আগেই নিবন্ধিত" : err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">🏭</div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">আবেদন জমা হয়েছে!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          আপনার B2B বিক্রেতা আবেদন আমাদের টিম পর্যালোচনা করবে।
          অনুমোদন পেলে <strong>{form.email}</strong> তে জানানো হবে।
        </p>
        <p className="text-xs text-slate-400">সাধারণত ২-৩ কার্যদিবসের মধ্যে যোগাযোগ করা হয়।</p>
        <Link href="/login" className="inline-block mt-4 text-sm font-semibold text-green-600 hover:underline">
          লগইন পেজে যান →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/signup" className="text-sm text-slate-500 hover:text-green-600 flex items-center gap-1 mb-4">
          ← পিছনে যান
        </Link>
        <div className="inline-block rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3">
          B2B পাইকারি মার্কেটপ্লেস
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">পাইকারি বিক্রেতা নিবন্ধন</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">বড় পরিসরে ব্যবসা শুরু করুন</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {["ব্যক্তিগত", "কোম্পানি"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              i < step ? "bg-green-600 text-white" : i === step ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium ${i === step ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{label}</span>
            {i === 0 && <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Input label="পূর্ণ নাম" value={form.full_name} onChange={e => update("full_name", e.target.value)} error={errors.full_name} placeholder="প্রতিনিধির নাম" required />
          <Input label="ইমেইল" type="email" value={form.email} onChange={e => update("email", e.target.value)} error={errors.email} placeholder="company@email.com" required />
          <Input label="মোবাইল নম্বর" type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} error={errors.phone} placeholder="01XXXXXXXXX" required />
          <Input label="পাসওয়ার্ড" type="password" value={form.password} onChange={e => update("password", e.target.value)} error={errors.password} placeholder="ন্যূনতম ৮ অক্ষর" required />
          <Input label="পাসওয়ার্ড নিশ্চিত করুন" type="password" value={form.confirm} onChange={e => update("confirm", e.target.value)} error={errors.confirm} required />
          <Button fullWidth onClick={() => {
            const errs = validateStep0();
            if (Object.keys(errs).length) { setErrors(errs); return; }
            setStep(1);
          }}>পরবর্তী →</Button>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="কোম্পানির নাম" value={form.company_name} onChange={e => update("company_name", e.target.value)} error={errors.company_name} placeholder="আপনার কোম্পানির নাম" required />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">কোম্পানির ঠিকানা <span className="text-red-500">*</span></label>
            <textarea value={form.company_address} onChange={e => update("company_address", e.target.value)} placeholder="সম্পূর্ণ ঠিকানা" rows={3} className="input-base resize-none" />
            {errors.company_address && <p className="mt-1 text-xs text-red-500">{errors.company_address}</p>}
          </div>
          <Input label="ট্রেড লাইসেন্স নম্বর" value={form.trade_license} onChange={e => update("trade_license", e.target.value)} error={errors.trade_license} placeholder="বাধ্যতামূলক" required />
          <Input label="TIN নম্বর (ঐচ্ছিক)" value={form.tin} onChange={e => update("tin", e.target.value)} placeholder="TIN সার্টিফিকেট নম্বর" />
          <Input label="বার্ষিক সরবরাহ ক্ষমতা (টাকায়, ঐচ্ছিক)" value={form.annual_capacity} onChange={e => update("annual_capacity", e.target.value)} placeholder="যেমন: ৫০,০০,০০০" />
          <Input label="সর্বনিম্ন অর্ডার মূল্য (ঐচ্ছিক)" value={form.min_order_value} onChange={e => update("min_order_value", e.target.value)} placeholder="যেমন: ১০,০০০" />

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">পণ্যের ধরন (একাধিক বেছে নিন)</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    selectedTypes.includes(t)
                      ? "bg-green-600 text-white border-green-600"
                      : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">← পিছনে</Button>
            <Button type="submit" loading={loading} className="flex-1 bg-amber-500 hover:bg-amber-600">আবেদন করুন</Button>
          </div>
        </form>
      )}
    </div>
  );
}
