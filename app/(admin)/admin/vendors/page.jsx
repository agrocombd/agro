"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { cn, timeAgo } from "@/lib/utils";

const ROLE_LABELS = { retail_vendor: "খুচরা বিক্রেতা", b2b_vendor: "পাইকারি বিক্রেতা" };

export default function VendorsAdminPage() {
  const toast = useToast();
  const [vendors, setVendors] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchVendors(); }, [filter]);

  async function fetchVendors() {
    setLoading(true);
    const supabase = createClient();
    const query = supabase
      .from("vendor_profiles")
      .select("id,business_name,business_address,trade_license,is_approved,is_verified,created_at,profiles(full_name,email,phone,role)")
      .order("created_at", { ascending: false });

    if (filter === "pending") query.eq("is_approved", false);
    else if (filter === "approved") query.eq("is_approved", true);

    const { data } = await query;
    setVendors(data || []);
    setLoading(false);
  }

  async function approve(id, profileId) {
    const supabase = createClient();
    await supabase.from("vendor_profiles").update({ is_approved: true }).eq("id", id);
    await supabase.from("profiles").update({ is_vendor_approved: true }).eq("id", profileId);
    toast("বিক্রেতা অনুমোদন দেওয়া হয়েছে", "success");
    fetchVendors();
  }

  async function reject(id) {
    const supabase = createClient();
    await supabase.from("vendor_profiles").update({ is_approved: false, rejection_reason: "অনুমোদিত হয়নি" }).eq("id", id);
    toast("প্রত্যাখ্যান করা হয়েছে", "info");
    fetchVendors();
  }

  async function toggleVerified(id, current) {
    const supabase = createClient();
    await supabase.from("vendor_profiles").update({ is_verified: !current }).eq("id", id);
    toast(!current ? "যাচাই করা হয়েছে" : "যাচাই বাতিল করা হয়েছে", "success");
    fetchVendors();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">বিক্রেতা পরিচালনা</h1>

      <div className="flex gap-2">
        {[{ id: "pending", label: "অনুমোদন বাকি" }, { id: "approved", label: "অনুমোদিত" }, { id: "all", label: "সব" }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={cn("rounded-xl px-4 py-2 text-sm font-semibold transition-colors", filter === f.id ? "bg-green-600 text-white" : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>
      ) : vendors.length === 0 ? (
        <div className="card rounded-2xl p-10 text-center text-slate-400">কোনো বিক্রেতা নেই</div>
      ) : (
        <div className="space-y-3">
          {vendors.map(v => (
            <div key={v.id} className="card rounded-2xl p-4">
              <div className="flex flex-wrap gap-3 items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 dark:text-white">{v.business_name || v.profiles?.full_name}</p>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500">{ROLE_LABELS[v.profiles?.role] || "বিক্রেতা"}</span>
                    {v.is_verified && <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">✓ যাচাইকৃত</span>}
                    {v.is_approved && <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs text-green-600 font-semibold">অনুমোদিত</span>}
                    {!v.is_approved && <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs text-amber-600 font-semibold">অপেক্ষারত</span>}
                  </div>
                  <p className="text-xs text-slate-400">{v.profiles?.email} · {v.profiles?.phone}</p>
                  {v.business_address && <p className="text-xs text-slate-400">{v.business_address}</p>}
                  {v.trade_license && <p className="text-xs text-slate-400">ট্রেড লাইসেন্স: {v.trade_license}</p>}
                  <p className="text-xs text-slate-400">{timeAgo(v.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!v.is_approved && (
                    <Button size="sm" onClick={() => approve(v.id, v.profiles?.id)}>অনুমোদন দিন</Button>
                  )}
                  <Button size="sm" variant={v.is_verified ? "secondary" : "outline"} onClick={() => toggleVerified(v.id, v.is_verified)}>
                    {v.is_verified ? "যাচাই বাতিল" : "যাচাই করুন"}
                  </Button>
                  {v.is_approved && (
                    <Button size="sm" variant="danger" onClick={() => reject(v.id)}>প্রত্যাখ্যান</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
