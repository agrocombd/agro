"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, cn, timeAgo } from "@/lib/utils";

function StarRating({ value, max = 5 }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={cn("h-4 w-4", i < Math.round(value) ? "text-amber-400" : "text-slate-300 dark:text-slate-600")} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductDetailClient({ product, reviews, related }) {
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState("description");

  const images = product.images || [];
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discount = hasDiscount ? Math.round((1 - product.sale_price / product.price) * 100) : 0;
  const effectivePrice = product.sale_price || product.price;
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const isPerishable = product.is_perishable || product.categories?.is_perishable;

  function addToCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("agro-cart") || "[]");
      const idx = cart.findIndex(i => i.id === product.id);
      if (idx >= 0) cart[idx].qty = (cart[idx].qty || 1) + qty;
      else cart.push({ id: product.id, name_bn: product.name_bn, price: effectivePrice, images: product.images, unit: product.unit, qty });
      localStorage.setItem("agro-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("agro-cart-updated"));
      toast(`${qty}টি কার্টে যোগ হয়েছে! ✓`, "success");
    } catch {
      toast("কার্টে যোগ করা যায়নি", "error");
    }
  }

  return (
    <div className="container-app py-6 lg:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-green-600">হোম</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-green-600">শপ</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.categories.slug}`} className="hover:text-green-600">
              {product.categories.name_bn}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{product.name_bn}</span>
      </nav>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            {images[activeImg] ? (
              <Image
                src={images[activeImg]}
                alt={product.name_bn}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl">🌱</div>
            )}
            {hasDiscount && (
              <span className="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">-{discount}%</span>
            )}
            {isPerishable && (
              <span className="absolute top-3 right-3 rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white">তাজা</span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors",
                    i === activeImg ? "border-green-500" : "border-transparent"
                  )}
                >
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {/* Category + vendor */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.categories && (
              <span className="rounded-full bg-green-50 dark:bg-green-900/20 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                {product.categories.name_bn}
              </span>
            )}
            {product.vendor_profiles?.is_verified && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                ✓ যাচাইকৃত বিক্রেতা
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
            {product.name_bn}
          </h1>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={avgRating} />
              <span className="text-sm text-slate-500 dark:text-slate-400">({reviews.length} রিভিউ)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">
              {formatPrice(effectivePrice)}
            </span>
            <span className="text-sm text-slate-500">প্রতি {product.unit}</span>
            {hasDiscount && (
              <span className="text-lg text-slate-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Perishable warning */}
          {isPerishable && (
            <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-4 py-3">
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">⚡ তাজা পণ্য — শুধুমাত্র অগ্রিম পেমেন্ট</p>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">এই পণ্যটি দ্রুত পচনশীল। ক্যাশ অন ডেলিভারি পাওয়া যাবে না।</p>
            </div>
          )}

          {/* Stock */}
          {product.stock_qty !== null && (
            <p className={cn("text-sm font-medium", product.stock_qty > 0 ? "text-green-600" : "text-red-500")}>
              {product.stock_qty > 0 ? `✓ স্টকে আছে (${product.stock_qty} ${product.unit})` : "✗ স্টক নেই"}
            </p>
          )}

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold"
              >
                −
              </button>
              <span className="px-4 py-3 font-semibold text-slate-900 dark:text-white min-w-[3rem] text-center">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold"
              >
                +
              </button>
            </div>
            <button
              onClick={addToCart}
              disabled={product.stock_qty === 0}
              className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed py-3.5 text-sm font-bold text-white transition-colors"
            >
              কার্টে যোগ করুন
            </button>
          </div>

          <Link
            href="/checkout"
            onClick={addToCart}
            className="block w-full rounded-xl border-2 border-green-600 py-3.5 text-center text-sm font-bold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            এখনই কিনুন
          </Link>

          {/* Delivery info */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>🚚</span>
              <span>সারা বাংলাদেশে ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>🔄</span>
              <span>৭ দিনের মধ্যে রিটার্ন নীতি</span>
            </div>
            {!isPerishable && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>💵</span>
                <span>ক্যাশ অন ডেলিভারি সুবিধা</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex border-b border-slate-200 dark:border-slate-700 gap-1">
          {[
            { id: "description", label: "বিবরণ" },
            { id: "reviews", label: `রিভিউ (${reviews.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-5 py-3 text-sm font-semibold border-b-2 transition-colors",
                tab === t.id
                  ? "border-green-600 text-green-600 dark:text-green-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === "description" && (
            <div className="prose-agro max-w-none">
              {product.description_bn ? (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {product.description_bn}
                </p>
              ) : (
                <p className="text-slate-400">কোনো বিবরণ নেই।</p>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-slate-400 text-center py-8">এখনো কোনো রিভিউ নেই।</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="card rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {review.profiles?.avatar_url ? (
                          <Image src={review.profiles.avatar_url} alt="" width={36} height={36} className="rounded-full" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm">
                            {review.profiles?.full_name?.[0] || "?"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {review.profiles?.full_name || "ক্রেতা"}
                          </p>
                          <StarRating value={review.rating} />
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{timeAgo(review.created_at)}</span>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">সম্পর্কিত পণ্য</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {related.map(p => {
              const hasDis = p.sale_price && p.sale_price < p.price;
              return (
                <Link key={p.id} href={`/shop/${p.id}`} className="product-card">
                  <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name_bn} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="20vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🌱</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">{p.name_bn}</p>
                    <p className="text-base font-extrabold text-green-600 dark:text-green-400 mt-1">
                      {formatPrice(p.sale_price || p.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
