import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("blog_posts").select("title, excerpt, cover_image").eq("slug", slug).single();
  if (!data) return { title: "পোস্ট পাওয়া যায়নি" };
  return {
    title: `${data.title} — agro.com.bd ব্লগ`,
    description: data.excerpt || data.title,
    openGraph: { images: data.cover_image ? [data.cover_image] : [] },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  // Related posts
  const { data: related } = await supabase
    .from("blog_posts")
    .select("id, title, slug, cover_image, published_at, category")
    .eq("is_published", true)
    .eq("category", post.category)
    .neq("id", post.id)
    .limit(3);

  return (
    <div className="container-app max-w-3xl py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-green-600">হোম</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-green-600">ব্লগ</Link>
        <span>/</span>
        <span className="truncate text-slate-700 dark:text-slate-300">{post.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        {post.category && (
          <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="inline-block rounded-full bg-green-50 dark:bg-green-900/20 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-400 mb-4">
            {post.category}
          </Link>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>{post.author_name || "agro.com.bd"}</span>
          <span>·</span>
          {post.published_at && (
            <time>{new Date(post.published_at).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}</time>
          )}
        </div>
      </header>

      {/* Cover image */}
      {post.cover_image && (
        <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-100 dark:bg-slate-800">
          <Image src={post.cover_image} alt={post.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 768px" priority />
        </div>
      )}

      {/* Content */}
      <article className="prose-agro text-slate-700 dark:text-slate-300 leading-relaxed">
        {post.content ? (
          <div className="whitespace-pre-line">{post.content}</div>
        ) : (
          <p className="text-slate-400">কন্টেন্ট লোড হয়নি।</p>
        )}
      </article>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">#{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Related posts */}
      {related && related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">আরও পড়ুন</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map(p => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="card rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                  {p.cover_image ? (
                    <Image src={p.cover_image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">🌾</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-2 group-hover:text-green-600 transition-colors">{p.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 text-center">
        <p className="font-bold text-green-800 dark:text-green-300 mb-2">তাজা কৃষি পণ্য কিনুন</p>
        <p className="text-sm text-green-700 dark:text-green-400 mb-4">সরাসরি কৃষক থেকে — নিরাপদ পেমেন্ট ও দ্রুত ডেলিভারি</p>
        <Link href="/shop" className="inline-flex rounded-xl bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 text-sm font-bold transition-colors">
          শপিং শুরু করুন →
        </Link>
      </div>
    </div>
  );
}
