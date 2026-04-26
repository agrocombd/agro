"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) { toast("পাসওয়ার্ড ন্যূনতম ৮ অক্ষর", "error"); return; }
    if (password !== confirm) { toast("পাসওয়ার্ড মিলছে না", "error"); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!", "success");
      router.push("/dashboard");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">নতুন পাসওয়ার্ড সেট করুন</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          নিরাপদ নতুন পাসওয়ার্ড দিন
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="নতুন পাসওয়ার্ড"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="ন্যূনতম ৮ অক্ষর"
          required
          autoFocus
        />
        <Input
          label="পাসওয়ার্ড নিশ্চিত করুন"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="পাসওয়ার্ড আবার লিখুন"
          required
        />
        <Button type="submit" fullWidth loading={loading}>
          পাসওয়ার্ড পরিবর্তন করুন
        </Button>
      </form>
    </div>
  );
}
