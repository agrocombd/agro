import { createAdminClient } from "@/lib/supabase-server";
export const metadata = { title: "শর্তাবলী — Agro.com.bd" };
export const revalidate = 3600;

export default async function TermsPage() {
  let supabase;
  try { supabase = createAdminClient(); } catch { supabase = null; }
  const { data: page } = await supabase.from("pages").select("content_bn").eq("slug", "terms").single();
  return (
    <div className="container-app py-10 max-w-3xl">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">শর্তাবলী ও নিয়মাবলী</h1>
      <div className="prose-agro text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
        {page?.content_bn || "আমাদের প্ল্যাটফর্ম ব্যবহার করে আপনি এই শর্তাবলী মেনে নিচ্ছেন। আমাদের সেবা শুধুমাত্র আইনগত উদ্দেশ্যে ব্যবহার করুন।"}
      </div>
    </div>
  );
}
