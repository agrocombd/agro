import { createAdminClient } from "@/lib/supabase-server";
export const metadata = { title: "গোপনীয়তা নীতি — Agro.com.bd" };
export const revalidate = 3600;

export default async function PrivacyPage() {
  let supabase;
  try { supabase = createAdminClient(); } catch { supabase = null; }
  const { data: page } = await supabase.from("pages").select("content_bn").eq("slug", "privacy").single();
  return (
    <div className="container-app py-10 max-w-3xl">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">গোপনীয়তা নীতি</h1>
      <div className="prose-agro text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
        {page?.content_bn || "আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ। সংগৃহীত তথ্য শুধুমাত্র সেবা উন্নয়নে ব্যবহার করা হয়।"}
      </div>
    </div>
  );
}
