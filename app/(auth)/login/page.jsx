"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast("সফলভাবে লগইন হয়েছে!", "success");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast(err.message === "Invalid login credentials" ? "ইমেইল বা পাসওয়ার্ড ভুল" : err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    if (!email) { toast("ইমেইল দিন", "error"); return; }
    setMagicLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
      toast("ম্যাজিক লিঙ্ক পাঠানো হয়েছে! আপনার ইমেইল চেক করুন।", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setMagicLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">স্বাগতম!</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="ইমেইল"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
        />
        <Input
          label="পাসওয়ার্ড"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-green-600 dark:text-green-400 hover:underline">
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          লগইন করুন
        </Button>
      </form>

      <div className="mt-4 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-400 bg-white dark:bg-slate-950 px-2">
          অথবা
        </div>
      </div>

      <Button
        variant="secondary"
        fullWidth
        onClick={handleMagicLink}
        loading={magicLoading}
        className="mt-4"
      >
        ✉ ম্যাজিক লিঙ্ক দিয়ে লগইন
      </Button>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        অ্যাকাউন্ট নেই?{" "}
        <Link href="/signup" className="font-semibold text-green-600 dark:text-green-400 hover:underline">
          নিবন্ধন করুন
        </Link>
      </p>

      <div className="mt-3 flex justify-center gap-4 text-xs text-slate-400">
        <Link href="/signup/vendor" className="hover:text-green-600">বিক্রেতা হিসেবে যোগ দিন</Link>
        <span>·</span>
        <Link href="/signup/b2b-vendor" className="hover:text-green-600">পাইকারি বিক্রেতা</Link>
      </div>
    </div>
  );
}
