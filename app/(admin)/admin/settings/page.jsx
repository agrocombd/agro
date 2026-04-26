"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const SETTING_GROUPS = [
  {
    label: "সাইটের তথ্য",
    settings: [
      { key: "site_name", label: "সাইটের নাম", placeholder: "Agro.com.bd" },
      { key: "site_tagline", label: "ট্যাগলাইন", placeholder: "বাংলাদেশের সেরা কৃষি মার্কেটপ্লেস" },
      { key: "contact_email", label: "যোগাযোগ ইমেইল", placeholder: "info@agro.com.bd", type: "email" },
      { key: "contact_phone", label: "যোগাযোগ ফোন", placeholder: "+880 1XXXXXXXXX" },
    ],
  },
  {
    label: "ডেলিভারি সেটিংস",
    settings: [
      { key: "free_delivery_threshold", label: "বিনামূল্যে ডেলিভারির ন্যূনতম অর্ডার (টাকা)", placeholder: "1000", type: "number" },
      { key: "default_delivery_charge", label: "ডিফল্ট ডেলিভারি চার্জ (টাকা)", placeholder: "60", type: "number" },
    ],
  },
  {
    label: "AI সেটিংস",
    settings: [
      { key: "ai_guest_limit", label: "অতিথির দৈনিক প্রশ্ন সীমা", placeholder: "5", type: "number" },
      { key: "ai_user_daily_limit", label: "সদস্যের দৈনিক প্রশ্ন সীমা", placeholder: "100", type: "number" },
    ],
  },
  {
    label: "সোশ্যাল মিডিয়া",
    settings: [
      { key: "facebook_url", label: "Facebook পেজ URL", placeholder: "https://facebook.com/..." },
      { key: "instagram_url", label: "Instagram URL", placeholder: "https://instagram.com/..." },
      { key: "youtube_url", label: "YouTube URL", placeholder: "https://youtube.com/..." },
    ],
  },
];

export default function SiteSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("site_settings").select("key,value").then(({ data }) => {
      const s = {};
      (data || []).forEach(r => { s[r.key] = r.value; });
      setSettings(s);
      setLoading(false);
    });
  }, []);

  async function saveAll() {
    setSaving(true);
    try {
      const supabase = createClient();
      const entries = Object.entries(settings).map(([key, value]) => ({ key, value: value || "" }));
      if (!entries.length) { toast("কোনো পরিবর্তন নেই", "info"); return; }
      const { error } = await supabase.from("site_settings").upsert(entries, { onConflict: "key" });
      if (error) throw error;
      toast("সব সেটিংস সংরক্ষিত হয়েছে", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800" />)}</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">সাইট সেটিংস</h1>
        <Button onClick={saveAll} loading={saving}>সব সংরক্ষণ করুন</Button>
      </div>

      {SETTING_GROUPS.map(group => (
        <div key={group.label} className="card rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">{group.label}</h2>
          {group.settings.map(s => (
            <Input
              key={s.key}
              label={s.label}
              type={s.type || "text"}
              value={settings[s.key] || ""}
              onChange={e => setSettings(prev => ({ ...prev, [s.key]: e.target.value }))}
              placeholder={s.placeholder}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
