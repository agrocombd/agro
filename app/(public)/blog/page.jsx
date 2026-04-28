import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase-server";

export const revalidate = 60;

export const metadata = {
  title: "কৃষি ব্লগ — agro.com.bd",
  description: "কৃষি, চাষাবাদ, পশুপালন, সার ব্যবস্থাপনা ও আধুনিক কৃষি প্রযুক্তি নিয়ে বিশেষজ্ঞ পরামর্শ।",
};

async function getPosts() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, category, published_at, author_name")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(20);
    return data || [];
  } catch { return []; }
}

const CATS = ["সব", "চাষাবাদ", "পশুপালন", "সার ও কীটনাশক", "আধুনিক প্রযুক্তি", "বাজার দর", "সরকারি সহায়তা"];

export default async function BlogPage({ searchParams }) {
  const posts = await getPosts();
  const activeCategory = searchParams?.category || "সব";
  const filtered = activeCategory === "সব" ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <div className="container-app py-8 lg:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">কৃষি ব্লগ</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">চাষাবাদ থেকে শুরু করে বাজার দর পর্যন্ত — কৃষি সংক্রান্ত সব তথ্য এক জায়গায়</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
        {CATS.map(cat => (
          <Link
            key={cat}
            href={cat === "সব" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeCategory === cat ? "bg-green-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-slate-700"}`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-slate-500 dark:text-slate-400">এই বিভাগে এখনো কোনো পোস্ট নেই।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="card rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {post.cover_image ? (
                  <Image src={post.cover_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">🌾</div>
                )}
                {post.category && (
                  <span className="absolute top-3 left-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">{post.category}</span>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-bold text-slate-800 dark:text-slate-200 leading-snug mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{post.excerpt}</p>}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400">{post.author_name || "agro.com.bd"}</span>
                  {post.published_at && (
                    <span className="text-xs text-slate-400">
                      {new Date(post.published_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
