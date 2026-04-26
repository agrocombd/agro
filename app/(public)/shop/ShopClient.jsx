"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/components/providers/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest",    label: "নতুন প্রথম" },
  { value: "price_asc", label: "কম দাম" },
  { value: "price_desc","label": "বেশি দাম" },
];

export default function ShopClient({ initialProducts, categories, searchParams }) {
  const { t } = useLang();
  const toast = useToast();
  const router = useRouter();
  const sp = useSearchParams();

  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState(searchParams?.q || "");
  const [selectedCat, setSelectedCat] = useState(searchParams?.category || "");
  const [sort, setSort] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);

  // Re-fetch when filters change
  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedCat) params.set("category", selectedCat);
    if (sort) params.set("sort", sort);

    const res = await fetch(`/api/products?${params}&type=retail`);
    if (res.ok) {
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    }
  }, [search, selectedCat, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  function addToCart(product, e) {
    e.preventDefault();
    try {
      const cart = JSON.parse(localStorage.getItem("agro-cart") || "[]");
      const idx = cart.findIndex(i => i.id === product.id);
      if (idx >= 0) cart[idx].qty = (cart[idx].qty || 1) + 1;
      else cart.push({ id: product.id, name_bn: product.name_bn, price: product.sale_price || product.price, images: product.images, unit: product.unit, qty: 1 });
      localStorage.setItem("agro-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("agro-cart-updated"));
      toast("কার্টে যোগ হয়েছে! ✓", "success");
    } catch {
      toast("কার্টে যোগ করা যায়নি", "error");
    }
  }

  const sorted = [...products].sort((a, b) => {
    if (sort === "price_asc") return (a.sale_price || a.price) - (b.sale_price || b.price);
    if (sort === "price_desc") return (b.sale_price || b.price) - (a.sale_price || a.price);
    return 0;
  });

  return (
    <div>
      {/* Page header */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container-app py-6">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">শপ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{sorted.length} টি পণ্য পাওয়া গেছে</p>
        </div>
      </div>

      <div className="container-app py-6">
        {/* Search + controls */}
        <div className="flex gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="পণ্য খুঁজুন..."
              className="input-base pl-9"
            />
          </div>
          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)} className="input-base w-auto min-w-[140px]">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn("flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors lg:hidden",
              filterOpen ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            )}
          >
            ⚡ বিভাগ
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar — desktop always visible, mobile collapsible */}
          <aside className={cn(
            "w-56 flex-shrink-0",
            "lg:block",
            filterOpen ? "block w-full" : "hidden lg:block"
          )}>
            <div className="card rounded-2xl p-4 space-y-1 sticky top-20">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-1">বিভাগ</p>
              <button
                onClick={() => setSelectedCat("")}
                className={cn(
                  "w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors",
                  !selectedCat ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span>🌿</span> সব বিভাগ
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.slug)}
                  className={cn(
                    "w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors",
                    selectedCat === cat.slug ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <span>{cat.icon}</span> {cat.name_bn}
                </button>
              ))}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-slate-500 dark:text-slate-400">কোনো পণ্য পাওয়া যায়নি</p>
                <button onClick={() => { setSearch(""); setSelectedCat(""); }} className="mt-4 link-green text-sm">
                  ফিল্টার সরান
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {sorted.map(product => (
                  <ProductCard key={product.id} product={product} onAddCart={(e) => addToCart(product, e)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onAddCart }) {
  const image = product.images?.[0];
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discount = hasDiscount ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  return (
    <Link href={`/shop/${product.id}`} className="product-card">
      <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {image ? (
          <Image
            src={image} alt={product.name_bn} fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🌱</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>
        )}
        {product.is_perishable && (
          <span className="absolute bottom-2 left-2 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-bold text-white">তাজা</span>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.name_bn}
        </h3>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-base font-extrabold text-green-600 dark:text-green-400">
            {formatPrice(product.sale_price || product.price)}
          </span>
          {hasDiscount && <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>}
        </div>
        <p className="text-[11px] text-slate-400">প্রতি {product.unit}</p>
        <button
          onClick={onAddCart}
          className="mt-2.5 w-full rounded-xl bg-green-600 hover:bg-green-700 py-2 text-xs font-bold text-white transition-colors"
        >
          কার্টে যোগ করুন
        </button>
      </div>
    </Link>
  );
}
