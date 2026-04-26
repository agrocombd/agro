"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidBDPhone } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "নাম দিন";
    if (!form.email.includes("@")) errs.email = "সঠিক ইমেইল দিন";
    if (form.phone && !isValidBDPhone(form.phone)) errs.phone = "সঠিক বাংলাদেশি নম্বর দিন";
    if (form.password.length < 8) errs.password = "পাসওয়ার্ড ন্যূনতম ৮ অক্ষর";
    if (form.password !== form.confirm) errs.confirm = "পাসওয়ার্ড মিলছে না";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.full_name, phone: form.phone, role: "customer" },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      if (err.message.includes("already registered")) {
        toast("এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে", "error");
      } else {
        toast(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">✉</div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">ইমেইল যাচাই করুন</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          <strong>{form.email}</strong> তে একটি যাচাই লিঙ্ক পাঠানো হয়েছে। লিঙ্কে ক্লিক করে অ্যাকাউন্ট সক্রিয় করুন।
        </p>
        <Link href="/login" className="inline-block mt-4 text-sm font-semibold text-green-600 hover:underline">
          লগইন পেজে যান →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">অ্যাকাউন্ট তৈরি করুন</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          বিক্রেতা হতে চান?{" "}
          <Link href="/signup/vendor" className="text-green-600 font-semibold hover:underline">এখানে নিবন্ধন করুন</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="পূর্ণ নাম"
          value={form.full_name}
          onChange={e => update("full_name", e.target.value)}
          placeholder="আপনার নাম"
          error={errors.full_name}
          required
        />
        <Input
          label="ইমেইল"
          type="email"
          value={form.email}
          onChange={e => update("email", e.target.value)}
          placeholder="your@email.com"
          error={errors.email}
          required
        />
        <Input
          label="মোবাইল নম্বর (ঐচ্ছিক)"
          type="tel"
          value={form.phone}
          onChange={e => update("phone", e.target.value)}
          placeholder="01XXXXXXXXX"
          error={errors.phone}
        />
        <Input
          label="পাসওয়ার্ড"
          type="password"
          value={form.password}
          onChange={e => update("password", e.target.value)}
          placeholder="ন্যূনতম ৮ অক্ষর"
          error={errors.password}
          required
        />
        <Input
          label="পাসওয়ার্ড নিশ্চিত করুন"
          type="password"
          value={form.confirm}
          onChange={e => update("confirm", e.target.value)}
          placeholder="পাসওয়ার্ড আবার লিখুন"
          error={errors.confirm}
          required
        />

        <p className="text-xs text-slate-400">
          নিবন্ধন করে আপনি আমাদের{" "}
          <Link href="/terms" className="text-green-600 hover:underline">শর্তাবলী</Link> ও{" "}
          <Link href="/privacy" className="text-green-600 hover:underline">গোপনীয়তা নীতি</Link> মেনে নিচ্ছেন।
        </p>

        <Button type="submit" fullWidth loading={loading}>
          নিবন্ধন করুন
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        ইতোমধ্যে অ্যাকাউন্ট আছে?{" "}
        <Link href="/login" className="font-semibold text-green-600 hover:underline">লগইন করুন</Link>
      </p>
    </div>
  );
}
