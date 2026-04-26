"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "নতুন প্রথম" },
  { value: "price_asc", label: "কম দাম" },
  { value: "price_desc", label: "বেশি দাম" },
  { value: "moq_asc", label: "কম MOQ" },
];

export default function B2BClient({ initialProducts, categories, searchParams }) {
  const toast = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState(searchParams?.q || "");
  const [selectedCat, setSelectedCat] = useState(searchParams?.category || "");
  const [sort, setSort] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedCat) params.set("category", selectedCat);
    if (sort) params.set("sort", sort);
    params.set("type", "b2b");

    const res = await fetch(`/api/products?${params}`);
    if (res.ok) {
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    }
  }, [search, selectedCat, sort]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 400);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const sorted = [...products].sort((a, b) => {
    if (sort === "price_asc") return (a.sale_price || a.price) - (b.sale_price || b.price);
    if (sort === "price_desc") return (b.sale_price || b.price) - (a.sale_price || a.price);
    if (sort === "moq_asc") return (a.moq || 0) - (b.moq || 0);
    return 0;
  });

  function requestQuote(product, e) {
    e.preventDefault();
    try {
      const cart = JSON.parse(localStorage.getItem("agro-b2b-cart") || "[]");
      const idx = cart.findIndex(i => i.id === product.id);
      if (idx >= 0) cart[idx].qty = (cart[idx].qty || product.moq || 1) + (product.moq || 1);
      else cart.push({ id: product.id, name_bn: product.name_bn, price: product.sale_price || product.price, images: product.images, unit: product.unit, moq: product.moq || 1, qty: product.moq || 1 });
      localStorage.setItem("agro-b2b-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("agro-cart-updated"));
      toast("কোটেশনে যোগ হয়েছে! ✓", "success");
    } catch {
      toast("যোগ করা যায়নি", "error");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container-app py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">B2B</span>
            <span className="text-slate-400 text-sm">পাইকারি মার্কেটপ্লেস</span>
          </div>
          <h1 className="text-2xl font-extrabold">পাইকারি পণ্য সমূহ</h1>
          <p className="text-sm text-slate-400 mt-1">{sorted.length} টি পণ্য • MOQ ভিত্তিক বাল্ক অর্ডার</p>
        </div>
      </div>

      {/* B2B benefits bar */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20">
        <div className="container-app py-3">
          <div className="flex gap-6 overflow-x-auto text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
            <span>✓ বাল্ক ডিসকাউন্ট</span>
            <span>✓ ক্রেডিট পেমেন্ট সুবিধা</span>
            <span>✓ ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার</span>
            <span>✓ সরাসরি সরবরাহকারীর সাথে যোগাযোগ</span>
            <span>✓ কাস্টম প্যাকেজিং</span>
          </div>
        </div>
      </div>

      <div className="container-app py-6">
        {/* Controls */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="পণ্য খুঁজুন..." className="input-base pl-9" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input-base w-auto min-w-[140px]">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn("flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors lg:hidden",
              filterOpen ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400")}
          >
            ⚡ বিভাগ
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={cn("w-56 flex-shrink-0", filterOpen ? "block w-full" : "hidden lg:block")}>
            <div className="card rounded-2xl p-4 space-y-1 sticky top-20">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">বিভাগ</p>
              <button
                onClick={() => setSelectedCat("")}
                className={cn("w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors",
                  !selectedCat ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800")}
              >
                <span>🏭</span> সব বিভাগ
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCat(cat.slug)}
                  className={cn("w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors",
                    selectedCat === cat.slug ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800")}
                >
                  <span>{cat.icon}</span> {cat.name_bn}
                </button>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-5xl mb-4">🏭</p>
                <p className="text-slate-500 dark:text-slate-400">কোনো পণ্য পাওয়া যায়নি</p>
                <button onClick={() => { setSearch(""); setSelectedCat(""); }} className="mt-4 text-sm text-amber-600 hover:underline">
                  ফিল্টার সরান
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map(product => (
                  <B2BProductCard key={product.id} product={product} onRequestQuote={(e) => requestQuote(product, e)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function B2BProductCard({ product, onRequestQuote }) {
  const image = product.images?.[0];
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discount = hasDiscount ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  return (
    <Link href={`/b2b/${product.id}`} className="card rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700">
      <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {image ? (
          <Image src={image} alt={product.name_bn} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 100vw, 33vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">🌾</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>
        )}
        <span className="absolute top-2 right-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">B2B</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">{product.name_bn}</h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
            {formatPrice(product.sale_price || product.price)}
          </span>
          <span className="text-xs text-slate-400">প্রতি {product.unit}</span>
          {hasDiscount && <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>}
        </div>

        {product.moq && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              সর্বনিম্ন অর্ডার: {product.moq} {product.unit}
            </span>
          </div>
        )}

        <button
          onClick={onRequestQuote}
          className="mt-3 w-full rounded-xl bg-amber-500 hover:bg-amber-600 py-2.5 text-xs font-bold text-white transition-colors"
        >
          কোটেশন চাই
        </button>
      </div>
    </Link>
  );
}
