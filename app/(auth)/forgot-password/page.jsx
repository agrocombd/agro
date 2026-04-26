"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes("@")) { toast("সঠিক ইমেইল দিন", "error"); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">📬</div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">ইমেইল পাঠানো হয়েছে</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          <strong>{email}</strong> তে পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে। স্প্যাম ফোল্ডারও চেক করুন।
        </p>
        <Link href="/login" className="inline-block mt-4 text-sm font-semibold text-green-600 hover:underline">
          ← লগইন পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/login" className="text-sm text-slate-500 hover:text-green-600 flex items-center gap-1 mb-4">
          ← লগইনে ফিরে যান
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">পাসওয়ার্ড রিসেট</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          আপনার ইমেইল দিন, আমরা রিসেট লিঙ্ক পাঠাব
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="ইমেইল"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoFocus
        />
        <Button type="submit" fullWidth loading={loading}>
          রিসেট লিঙ্ক পাঠান
        </Button>
      </form>
    </div>
  );
}
