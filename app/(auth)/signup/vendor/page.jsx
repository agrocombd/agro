"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidBDPhone } from "@/lib/utils";

const STEPS = ["ব্যক্তিগত তথ্য", "ব্যবসার তথ্য"];

export default function VendorSignupPage() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", password: "", confirm: "",
    business_name: "", business_address: "", nid: "", trade_license: "",
  });

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
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
    if (!form.business_name.trim()) errs.business_name = "ব্যবসার নাম দিন";
    if (!form.business_address.trim()) errs.business_address = "ঠিকানা দিন";
    return errs;
  }

  function nextStep() {
    const errs = validateStep0();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(1);
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
            role: "retail_vendor",
            business_name: form.business_name,
            business_address: form.business_address,
            nid: form.nid,
            trade_license: form.trade_license,
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
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">আবেদন সফল!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          <strong>{form.email}</strong> তে একটি যাচাই লিঙ্ক পাঠানো হয়েছে।
          অ্যাডমিন অনুমোদন পেলে আপনার বিক্রেতা অ্যাকাউন্ট সক্রিয় হবে।
        </p>
        <p className="text-xs text-slate-400">সাধারণত ১-২ কার্যদিবসের মধ্যে অনুমোদন দেওয়া হয়।</p>
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
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">বিক্রেতা নিবন্ধন</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">খুচরা মার্কেটপ্লেসে পণ্য বিক্রি শুরু করুন</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              i < step ? "bg-green-600 text-white" : i === step ? "bg-green-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-medium ${i === step ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Input label="পূর্ণ নাম" value={form.full_name} onChange={e => update("full_name", e.target.value)} placeholder="আপনার নাম" error={errors.full_name} required />
          <Input label="ইমেইল" type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" error={errors.email} required />
          <Input label="মোবাইল নম্বর" type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="01XXXXXXXXX" error={errors.phone} required />
          <Input label="পাসওয়ার্ড" type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="ন্যূনতম ৮ অক্ষর" error={errors.password} required />
          <Input label="পাসওয়ার্ড নিশ্চিত করুন" type="password" value={form.confirm} onChange={e => update("confirm", e.target.value)} placeholder="পাসওয়ার্ড আবার লিখুন" error={errors.confirm} required />
          <Button fullWidth onClick={nextStep}>পরবর্তী →</Button>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="ব্যবসার নাম" value={form.business_name} onChange={e => update("business_name", e.target.value)} placeholder="আপনার দোকান/ব্যবসার নাম" error={errors.business_name} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">ব্যবসার ঠিকানা <span className="text-red-500">*</span></label>
            <textarea
              value={form.business_address}
              onChange={e => update("business_address", e.target.value)}
              placeholder="সম্পূর্ণ ঠিকানা লিখুন"
              rows={3}
              className="input-base resize-none"
            />
            {errors.business_address && <p className="mt-1 text-xs text-red-500">{errors.business_address}</p>}
          </div>
          <Input label="জাতীয় পরিচয়পত্র নম্বর (ঐচ্ছিক)" value={form.nid} onChange={e => update("nid", e.target.value)} placeholder="NID নম্বর" />
          <Input label="ট্রেড লাইসেন্স নম্বর (ঐচ্ছিক)" value={form.trade_license} onChange={e => update("trade_license", e.target.value)} placeholder="ট্রেড লাইসেন্স নম্বর" />

          <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
            আপনার আবেদন পর্যালোচনার পর অ্যাডমিন অনুমোদন দেবেন। অনুমোদিত হলে ইমেইলে জানানো হবে।
          </p>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">← পিছনে</Button>
            <Button type="submit" loading={loading} className="flex-1">আবেদন করুন</Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        পাইকারি বিক্রেতা?{" "}
        <Link href="/signup/b2b-vendor" className="font-semibold text-green-600 hover:underline">B2B নিবন্ধন</Link>
      </p>
    </div>
  );
}
