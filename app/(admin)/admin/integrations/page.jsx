"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "oauth", label: "OAuth লগইন" },
  { id: "payment", label: "পেমেন্ট গেটওয়ে" },
  { id: "courier", label: "কুরিয়ার সেবা" },
];

const OAUTH_GUIDE = {
  google: {
    name: "Google OAuth",
    icon: "🔵",
    color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    steps: [
      "Google Cloud Console-এ যান: console.cloud.google.com",
      "নতুন প্রজেক্ট তৈরি করুন বা বিদ্যমান প্রজেক্ট বেছে নিন",
      "বাম মেনু থেকে 'APIs & Services' → 'Credentials' এ যান",
      "'CREATE CREDENTIALS' বাটনে ক্লিক করুন → 'OAuth 2.0 Client IDs' বেছে নিন",
      "Application type: 'Web application' বেছে নিন",
      "Authorized redirect URIs-এ যোগ করুন: https://ejdloezkivgvgsfdqpwc.supabase.co/auth/v1/callback",
      "Client ID এবং Client Secret কপি করুন",
      "Supabase Dashboard → Authentication → Providers → Google-এ যান",
      "Client ID ও Client Secret পেস্ট করুন এবং Save করুন",
    ],
    fields: ["google_client_id", "google_client_secret"],
    labels: ["Client ID", "Client Secret"],
  },
  facebook: {
    name: "Facebook OAuth",
    icon: "🔷",
    color: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
    steps: [
      "Facebook Developers-এ যান: developers.facebook.com",
      "'My Apps' → 'Create App' ক্লিক করুন",
      "App Type: 'Consumer' বেছে নিন",
      "App name দিন এবং তৈরি করুন",
      "বাম মেনু থেকে 'Facebook Login' → 'Settings' এ যান",
      "Valid OAuth Redirect URIs-এ যোগ করুন: https://ejdloezkivgvgsfdqpwc.supabase.co/auth/v1/callback",
      "Settings → Basic থেকে App ID ও App Secret কপি করুন",
      "Supabase Dashboard → Authentication → Providers → Facebook-এ যান",
      "App ID ও App Secret পেস্ট করুন এবং Save করুন",
    ],
    fields: ["facebook_app_id", "facebook_app_secret"],
    labels: ["App ID", "App Secret"],
  },
};

const PAYMENT_PROVIDERS = [
  { id: "bkash", name: "বিকাশ", icon: "📱", fields: [{ key: "bkash_app_key", label: "App Key" }, { key: "bkash_app_secret", label: "App Secret" }, { key: "bkash_username", label: "Username" }, { key: "bkash_password", label: "Password" }] },
  { id: "nagad", name: "নগদ", icon: "💚", fields: [{ key: "nagad_merchant_id", label: "Merchant ID" }, { key: "nagad_public_key", label: "Public Key" }, { key: "nagad_private_key", label: "Private Key" }] },
  { id: "sslcommerz", name: "SSLCommerz", icon: "💳", fields: [{ key: "sslcommerz_store_id", label: "Store ID" }, { key: "sslcommerz_store_password", label: "Store Password" }] },
];

const COURIER_PROVIDERS = [
  { id: "pathao", name: "Pathao", icon: "🚀", fields: [{ key: "pathao_client_id", label: "Client ID" }, { key: "pathao_client_secret", label: "Client Secret" }, { key: "pathao_username", label: "Username" }, { key: "pathao_password", label: "Password" }] },
  { id: "steadfast", name: "Steadfast", icon: "📦", fields: [{ key: "steadfast_api_key", label: "API Key" }, { key: "steadfast_secret_key", label: "Secret Key" }] },
  { id: "redx", name: "RedX", icon: "🔴", fields: [{ key: "redx_api_key", label: "API Key" }] },
];

export default function IntegrationsPage() {
  const toast = useToast();
  const [tab, setTab] = useState("oauth");
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState({});
  const [oauthGuide, setOauthGuide] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("site_settings").select("key,value").then(({ data }) => {
      const s = {};
      (data || []).forEach(r => { s[r.key] = r.value; });
      setSettings(s);
    });
  }, []);

  async function saveSetting(key, value) {
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      const supabase = createClient();
      await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
      setSettings(prev => ({ ...prev, [key]: value }));
      toast("সংরক্ষিত হয়েছে", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  }

  async function saveMultiple(keys) {
    const entries = keys.map(k => ({ key: k, value: settings[k] || "" }));
    setSaving(prev => { const s = { ...prev }; keys.forEach(k => s[k] = true); return s; });
    try {
      const supabase = createClient();
      await supabase.from("site_settings").upsert(entries, { onConflict: "key" });
      toast("সংরক্ষিত হয়েছে", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(prev => { const s = { ...prev }; keys.forEach(k => s[k] = false); return s; });
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">ইন্টিগ্রেশন সেটিংস</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setOauthGuide(null); }}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OAuth */}
      {tab === "oauth" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Google ও Facebook দিয়ে লগইন সক্রিয় করুন। নিচের নির্দেশিকা অনুসরণ করুন।
          </p>

          {Object.entries(OAUTH_GUIDE).map(([provider, config]) => (
            <div key={provider} className={`rounded-2xl border p-5 ${config.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{config.name}</h3>
                  <button
                    onClick={() => setOauthGuide(oauthGuide === provider ? null : provider)}
                    className="text-xs text-green-600 hover:underline"
                  >
                    {oauthGuide === provider ? "গাইড লুকান" : "ধাপে ধাপে গাইড দেখুন ▼"}
                  </button>
                </div>
              </div>

              {oauthGuide === provider && (
                <div className="mb-4 rounded-xl bg-white dark:bg-slate-900 p-4">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">সেটআপ নির্দেশিকা</p>
                  <ol className="space-y-2">
                    {config.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="space-y-3">
                {config.fields.map((field, i) => (
                  <Input
                    key={field}
                    label={config.labels[i]}
                    type="password"
                    value={settings[field] || ""}
                    onChange={e => setSettings(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder="এখানে পেস্ট করুন"
                  />
                ))}
                <Button onClick={() => saveMultiple(config.fields)} loading={Object.values(saving).some(Boolean)} size="sm">
                  সংরক্ষণ করুন
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment */}
      {tab === "payment" && (
        <div className="space-y-4">
          {PAYMENT_PROVIDERS.map(provider => (
            <div key={provider.id} className="card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{provider.icon}</span>
                <h3 className="font-bold text-slate-900 dark:text-white">{provider.name}</h3>
              </div>
              <div className="space-y-3">
                {provider.fields.map(field => (
                  <Input key={field.key} label={field.label} type="password" value={settings[field.key] || ""} onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder="API কী এখানে দিন" />
                ))}
                <Button size="sm" onClick={() => saveMultiple(provider.fields.map(f => f.key))} loading={Object.values(saving).some(Boolean)}>
                  {provider.name} সংরক্ষণ
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courier */}
      {tab === "courier" && (
        <div className="space-y-4">
          {COURIER_PROVIDERS.map(provider => (
            <div key={provider.id} className="card rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{provider.icon}</span>
                <h3 className="font-bold text-slate-900 dark:text-white">{provider.name}</h3>
              </div>
              <div className="space-y-3">
                {provider.fields.map(field => (
                  <Input key={field.key} label={field.label} type="password" value={settings[field.key] || ""} onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder="API কী এখানে দিন" />
                ))}
                <Button size="sm" onClick={() => saveMultiple(provider.fields.map(f => f.key))} loading={Object.values(saving).some(Boolean)}>
                  {provider.name} সংরক্ষণ
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
