import { createAdminClient } from "@/lib/supabase-server";
import Link from "next/link";
import Image from "next/image";
import { formatDate, timeAgo } from "@/lib/utils";

export const metadata = {
  title: "কৃষি ফোরাম — Agro.com.bd",
  description: "কৃষকদের জন্য আলোচনা মঞ্চ। প্রশ্ন করুন, অভিজ্ঞতা শেয়ার করুন, একসাথে শিখুন।",
};

export const revalidate = 60;

async function getForumData() {
  let supabase;
  try { supabase = createAdminClient(); } catch { supabase = null; }
  const [catsRes, postsRes, noticesRes] = await Promise.all([
    supabase.from("forum_categories").select("id,name_bn,slug,icon,description_bn,post_count").eq("is_active", true).order("sort_order"),
    supabase
      .from("forum_posts")
      .select("id,title,created_at,view_count,reply_count,is_pinned,profiles(full_name,avatar_url),forum_categories(name_bn,slug)")
      .eq("is_approved", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("admin_notices").select("id,title,content,created_at").eq("is_active", true).order("created_at", { ascending: false }).limit(3),
  ]);

  return {
    categories: catsRes.data || [],
    posts: postsRes.data || [],
    notices: noticesRes.data || [],
  };
}

export default async function ForumPage() {
  const { categories, posts, notices } = await getForumData();

  return (
    <div className="container-app py-6 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">কৃষি ফোরাম</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">কৃষকদের আলোচনা মঞ্চ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Admin notices */}
          {notices.length > 0 && (
            <div className="space-y-2">
              {notices.map(notice => (
                <div key={notice.id} className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">📢 নোটিশ</span>
                    <span className="text-xs text-slate-400">{timeAgo(notice.created_at)}</span>
                  </div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{notice.title}</p>
                  {notice.content && <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 line-clamp-2">{notice.content}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Categories grid */}
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">বিভাগ সমূহ</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/forum/category/${cat.slug}`}
                  className="card rounded-2xl p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="text-2xl mb-2">{cat.icon || "💬"}</div>
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-green-600 transition-colors">
                    {cat.name_bn}
                  </h3>
                  {cat.description_bn && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.description_bn}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">{cat.post_count || 0} পোস্ট</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent posts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">সাম্প্রতিক আলোচনা</h2>
              <Link href="/forum/new" className="text-sm font-semibold text-green-600 hover:underline">
                + নতুন পোস্ট
              </Link>
            </div>

            <div className="space-y-2">
              {posts.length === 0 ? (
                <p className="text-slate-400 text-center py-8">এখনো কোনো পোস্ট নেই। প্রথম পোস্ট করুন!</p>
              ) : (
                posts.map(post => (
                  <Link
                    key={post.id}
                    href={`/forum/${post.id}`}
                    className="card rounded-2xl p-4 flex gap-3 hover:shadow-md transition-shadow group block"
                  >
                    <div className="flex-shrink-0">
                      {post.profiles?.avatar_url ? (
                        <Image src={post.profiles.avatar_url} alt="" width={40} height={40} className="rounded-full" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm">
                          {post.profiles?.full_name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.is_pinned && <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">📌 পিন</span>}
                        {post.forum_categories && (
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500">{post.forum_categories.name_bn}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-green-600 transition-colors mt-1 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span>{post.profiles?.full_name || "ব্যবহারকারী"}</span>
                        <span>·</span>
                        <span>{timeAgo(post.created_at)}</span>
                        <span>·</span>
                        <span>👁 {post.view_count || 0}</span>
                        <span>·</span>
                        <span>💬 {post.reply_count || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* New post CTA */}
          <div className="card rounded-2xl p-5 text-center space-y-3">
            <div className="text-4xl">✍️</div>
            <h3 className="font-bold text-slate-900 dark:text-white">প্রশ্ন করুন</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">কৃষি সংক্রান্ত যেকোনো প্রশ্ন করুন, অভিজ্ঞ কৃষকরা উত্তর দেবেন</p>
            <Link href="/forum/new" className="block w-full rounded-xl bg-green-600 hover:bg-green-700 py-2.5 text-sm font-bold text-white transition-colors">
              নতুন পোস্ট লিখুন
            </Link>
          </div>

          {/* Forum stats */}
          <div className="card rounded-2xl p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">ফোরাম পরিসংখ্যান</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>মোট পোস্ট</span><span className="font-semibold">{posts.length}+</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>বিভাগ</span><span className="font-semibold">{categories.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
