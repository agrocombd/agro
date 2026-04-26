import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

export const metadata = {
  title: "agro.com.bd — বাংলাদেশের সেরা কৃষি মার্কেটপ্লেস",
  description: "তাজা সবজি, ফলমূল, বীজ, সার, কৃষি যন্ত্রপাতি কিনুন। বাংলাদেশের সেরা অনলাইন কৃষি মার্কেটপ্লেস।",
};

async function getData() {
  try {
    const supabase = createAdminClient();
    const [catRes, featRes, statsRes] = await Promise.all([
      supabase.from("categories").select("id,name_bn,name_en,slug,icon").eq("is_active", true).order("sort_order").limit(12),
      supabase.from("products").select("id,name_bn,name_en,price,sale_price,images,unit,category_id,vendor_id,product_type").eq("is_active", true).eq("is_approved", true).eq("is_featured", true).limit(8),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    const productCount = await supabase.from("products").select("id", { count: "exact", head: true });
    const vendorCount = await supabase.from("vendor_profiles").select("id", { count: "exact", head: true }).eq("is_approved", true);
    const orderCount = await supabase.from("orders").select("id", { count: "exact", head: true });
    return {
      categories: catRes.data || [],
      featured: featRes.data || [],
      stats: {
        products: productCount.count || 0,
        vendors: vendorCount.count || 0,
        orders: orderCount.count || 0,
        customers: statsRes.count || 0,
      },
    };
  } catch {
    return { categories: [], featured: [], stats: { products: 0, vendors: 0, orders: 0, customers: 0 } };
  }
}

export default async function HomePage() {
  const { categories, featured, stats } = await getData();

  return (
    <div className="page-enter">
      {/* ── HERO ──────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-slate-900 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        {/* Glow */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-green-400/10 blur-3xl" />

        <div className="container-app relative py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Text */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-300">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                বাংলাদেশের #১ কৃষি মার্কেটপ্লেস
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                তাজা কৃষি পণ্য{" "}
                <span className="text-gradient-green">সরাসরি কৃষক</span>{" "}
                থেকে
              </h1>
              <p className="text-base sm:text-lg text-green-200/80 max-w-lg mx-auto lg:mx-0">
                সবজি, ফল, বীজ, সার, কৃষি যন্ত্রপাতি — সব কিছু এক জায়গায়। নিরাপদ পেমেন্ট, দ্রুত ডেলিভারি।
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link href="/shop" className="btn-primary px-7 py-3.5 text-base font-bold shadow-lg shadow-green-900/50 hover:shadow-green-900/70">
                  এখনই কিনুন →
                </Link>
                <Link href="/signup/vendor" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-7 py-3.5 text-base font-bold text-white transition-all">
                  বিক্রেতা হোন
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                {[
                  { icon: "🔒", label: "নিরাপদ পেমেন্ট" },
                  { icon: "🚚", label: "দ্রুত ডেলিভারি" },
                  { icon: "↩️", label: "সহজ রিটার্ন" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-green-200/70">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative h-80 w-80">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-green-600/20 blur-2xl" />
                <div className="relative flex h-full w-full items-center justify-center text-9xl animate-bounce-soft select-none">
                  🌾
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────── */}
      <section className="bg-green-600">
        <div className="container-app">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-green-500">
            {[
              { value: stats.products.toLocaleString("bn-BD") + "+", label: "পণ্য" },
              { value: stats.vendors.toLocaleString("bn-BD") + "+", label: "বিক্রেতা" },
              { value: stats.orders.toLocaleString("bn-BD") + "+", label: "অর্ডার" },
              { value: stats.customers.toLocaleString("bn-BD") + "+", label: "গ্রাহক" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center py-5 px-4 text-white">
                <p className="text-2xl sm:text-3xl font-extrabold">{value}</p>
                <p className="text-xs sm:text-sm text-green-100 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────── */}
      <section className="section bg-slate-50 dark:bg-slate-950">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">পণ্য বিভাগ</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">আপনার পছন্দের বিভাগ বেছে নিন</p>
            </div>
            <Link href="/shop" className="link-green text-sm hidden sm:flex items-center gap-1">
              সব দেখুন <span>→</span>
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all duration-200"
                >
                  <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-200">
                    {cat.icon}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-center text-slate-700 dark:text-slate-300 leading-tight">
                    {cat.name_bn}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 flex sm:hidden justify-center">
            <Link href="/shop" className="link-green text-sm flex items-center gap-1">সব বিভাগ দেখুন →</Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────── */}
      <section className="section">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">বিশেষ পণ্য</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">সেরা মানের বাছাই করা পণ্য</p>
            </div>
            <Link href="/shop?featured=true" className="link-green text-sm hidden sm:flex items-center gap-1">
              সব দেখুন <span>→</span>
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">শীঘ্রই পণ্য যোগ হবে</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/shop" className="btn-secondary inline-flex">সব পণ্য দেখুন →</Link>
          </div>
        </div>
      </section>

      {/* ── B2B BANNER ────────────────────────── */}
      <section className="section bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-5" />
        <div className="container-app relative">
          <div className="flex flex-col lg:flex-row items-center gap-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 sm:p-12">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block rounded-full bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-amber-400 mb-4">
                পাইকারি মূল্য
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">পাইকারি ক্রয় করুন</h2>
              <p className="text-slate-400 text-sm sm:text-base mb-6 max-w-lg">
                বড় পরিমাণে কৃষি পণ্য কিনুন সাশ্রয়ী মূল্যে। ব্যবসার জন্য সেরা সমাধান।
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link href="/b2b" className="btn-amber inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3 text-sm font-bold text-white transition-all">
                  পাইকারি মার্কেট দেখুন →
                </Link>
                <Link href="/signup/b2b-vendor" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 hover:border-amber-500/50 px-6 py-3 text-sm font-medium text-slate-300 transition-all">
                  পাইকারি বিক্রেতা হোন
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex text-8xl select-none animate-bounce-soft flex-shrink-0">🏭</div>
          </div>
        </div>
      </section>

      {/* ── AI ASSISTANT TEASER ───────────────── */}
      <section className="section bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-slate-950">
        <div className="container-app">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Chat mockup */}
            <div className="order-2 lg:order-1">
              <div className="rounded-3xl border border-green-200 dark:border-green-800/50 bg-white dark:bg-slate-900 shadow-lg overflow-hidden max-w-md mx-auto lg:mx-0">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-green-600 text-white">
                  <Image src="/agro-assistant.png" alt="Agro AI" width={32} height={32} className="rounded-full" />
                  <div>
                    <p className="text-sm font-bold">Agro Assistant 001</p>
                    <p className="text-[10px] text-green-200">সক্রিয় আছে</p>
                  </div>
                </div>
                {/* Messages */}
                <div className="p-4 space-y-3 min-h-[180px]">
                  <div className="chat-bubble-ai">
                    <p className="text-sm">আস্সালামু আলাইকুম! আমি Agro AI। আপনার কৃষি সম্পর্কিত যেকোনো প্রশ্ন করুন। 🌱</p>
                  </div>
                  <div className="chat-bubble-user">
                    <p className="text-sm">টমেটো গাছে পাতা কুঁকড়ে যাচ্ছে, কী করব?</p>
                  </div>
                  <div className="chat-bubble-ai">
                    <p className="text-sm">এটি সাধারণত ভাইরাস বা মাকড়সার কারণে হয়। <strong>নিম তেল স্প্রে</strong> করুন এবং আক্রান্ত পাতা কেটে ফেলুন... 🔬</p>
                  </div>
                </div>
                {/* Input */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3">
                    <input className="flex-1 bg-transparent text-xs text-slate-500 dark:text-slate-400 focus:outline-none" placeholder="প্রশ্ন করুন..." readOnly />
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white text-xs">→</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <span className="inline-block rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-1.5 text-xs font-bold text-green-700 dark:text-green-400 mb-4">
                🤖 AI প্রযুক্তি
              </span>
              <h2 className="section-title mb-3">কৃষি সমস্যার সমাধান পান তাৎক্ষণিকভাবে</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-6">
                রোগ-বালাই, সার প্রয়োগ, সেচ, বাজারদর — সব বিষয়ে আমাদের AI সহায়তাকারী আপনাকে সঠিক পরামর্শ দেবে।
              </p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                {["🌿 ফসল পরামর্শ", "🔬 রোগ নির্ণয়", "💧 সেচ পরিকল্পনা", "📊 বাজার তথ্য"].map(tag => (
                  <span key={tag} className="rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">{tag}</span>
                ))}
              </div>
              <Link href="/ai-assistant" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5">
                AI-এর সাথে কথা বলুন →
              </Link>
              <p className="mt-2 text-xs text-slate-500">বিনামূল্যে ৫টি প্রশ্ন করুন — নিবন্ধন ছাড়াই</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORUM TEASER ──────────────────────── */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-8">
            <h2 className="section-title">কৃষি ফোরাম</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">অভিজ্ঞ কৃষকদের সাথে যোগ দিন, জ্ঞান ভাগ করুন</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { icon: "🌾", title: "ফসল চাষ", count: "১২৪ পোস্ট", desc: "ধান, গম, সবজি চাষের আলোচনা" },
              { icon: "🐟", title: "মৎস্য চাষ", count: "৮৭ পোস্ট", desc: "মাছ চাষের কৌশল ও সমস্যা" },
              { icon: "🐓", title: "হাঁস-মুরগি", count: "৬৩ পোস্ট", desc: "পোল্ট্রি ফার্মিং টিপস" },
            ].map(({ icon, title, count, desc }) => (
              <Link
                key={title}
                href={`/forum`}
                className="card rounded-2xl p-5 hover:border-green-200 dark:hover:border-green-800/50 group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">{count}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/forum" className="btn-secondary inline-flex items-center gap-2">
              ফোরামে যোগ দিন →
            </Link>
          </div>
        </div>
      </section>

      {/* ── VENDOR CTA ────────────────────────── */}
      <section className="section bg-green-600 text-white">
        <div className="container-app text-center">
          <p className="text-green-200 text-sm mb-2">আপনিও কি কৃষি পণ্য বিক্রি করেন?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">বিক্রেতা হিসেবে যোগ দিন</h2>
          <p className="text-green-100 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            লক্ষ লক্ষ ক্রেতার কাছে আপনার পণ্য পৌঁছে দিন। সহজ নিবন্ধন, দ্রুত অনুমোদন।
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup/vendor" className="inline-flex items-center gap-2 rounded-xl bg-white text-green-700 hover:bg-green-50 px-7 py-3.5 text-sm font-bold transition-all shadow-md">
              খুচরা বিক্রেতা হোন
            </Link>
            <Link href="/signup/b2b-vendor" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 hover:border-white/70 hover:bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition-all">
              পাইকারি বিক্রেতা হোন
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Product Card (Server Component) ─────────────────────────
function ProductCard({ product }) {
  const image = product.images?.[0];
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discount = hasDiscount ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  return (
    <Link
      href={`/${product.product_type === "b2b" ? "b2b" : "shop"}/${product.id}`}
      className="product-card group"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        {image ? (
          <Image
            src={image}
            alt={product.name_bn}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🌱</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.product_type === "b2b" && (
          <span className="absolute top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
            পাইকারি
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
          {product.name_bn}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-base font-extrabold text-green-600 dark:text-green-400">
            {formatPrice(product.sale_price || product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">প্রতি {product.unit}</p>
        <button className="mt-2 w-full rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 py-2 text-xs font-semibold text-green-700 dark:text-green-400 transition-colors">
          কার্টে যোগ করুন
        </button>
      </div>
    </Link>
  );
}
