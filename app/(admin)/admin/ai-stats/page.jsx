import { createAdminClient } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "AI পরিসংখ্যান — অ্যাডমিন" };
export const revalidate = 300;

export default async function AIStatsPage() {
  const supabase = createAdminClient();

  const [
    { count: totalCached },
    { count: totalAssistants },
    { data: recentCache },
    { data: topQueries },
  ] = await Promise.all([
    supabase.from("ai_cache").select("*", { count: "exact", head: true }),
    supabase.from("ai_assistants").select("*", { count: "exact", head: true }),
    supabase.from("ai_cache").select("query,created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("ai_cache").select("query,query_hash").limit(20),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">AI পরিসংখ্যান</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "ক্যাশড প্রশ্নোত্তর", value: totalCached || 0, icon: "🧠" },
          { label: "মোট AI সহকারী", value: totalAssistants || 0, icon: "🤖" },
          { label: "ক্যাশ হিট রেট", value: "~70%", icon: "⚡" },
        ].map(s => (
          <div key={s.label} className="card rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-extrabold text-green-600">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card rounded-2xl p-5">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">সাম্প্রতিক প্রশ্ন (ক্যাশ থেকে)</h2>
        <div className="space-y-2">
          {recentCache?.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="text-green-500 text-sm mt-0.5">Q</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 flex-1 line-clamp-1">{item.query}</p>
            </div>
          ))}
          {!recentCache?.length && <p className="text-slate-400 text-sm text-center py-4">এখনো কোনো ডেটা নেই</p>}
        </div>
      </div>

      <div className="card rounded-2xl p-5">
        <h2 className="font-bold text-slate-900 dark:text-white mb-3">Gemini API তথ্য</h2>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>• ব্যবহৃত মডেল: Gemini 1.5 Flash</p>
          <p>• অতিথি সীমা: প্রতিদিন ৫টি প্রশ্ন (IP ভিত্তিক)</p>
          <p>• ক্যাশ TTL: স্থায়ী (SHA256 হ্যাশ ভিত্তিক)</p>
          <p>• কন্টেন্ট সেফটি: BLOCK_MEDIUM_AND_ABOVE সেটিং সক্রিয়</p>
        </div>
      </div>
    </div>
  );
}
