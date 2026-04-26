"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWishlist(); }, []);

  async function fetchWishlist() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("wishlist")
      .select("id,product_id,products(id,name_bn,price,unit,images,is_active)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function removeItem(id, productId) {
    const supabase = createClient();
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (error) { toast(error.message, "error"); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    toast("সরানো হয়েছে", "success");
  }

  function addToCart(product) {
    try {
      const cart = JSON.parse(localStorage.getItem("agro-cart") || "[]");
      const idx = cart.findIndex(i => i.id === product.id);
      if (idx >= 0) cart[idx].qty += 1;
      else cart.push({ id: product.id, name_bn: product.name_bn, price: product.price, unit: product.unit, image: product.images?.[0] || null, qty: 1 });
      localStorage.setItem("agro-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("agro-cart-updated"));
      toast("কার্টে যোগ হয়েছে", "success");
    } catch { toast("কার্টে যোগ করা যায়নি", "error"); }
  }

  if (loading) return <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">পছন্দের তালিকা</h1>

      {!items.length ? (
        <div className="card rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">❤️</p>
          <p className="text-slate-500 mb-4">কোনো পণ্য সংরক্ষিত নেই</p>
          <Link href="/shop" className="btn-primary">শপে যান</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map(item => {
            const p = item.products;
            if (!p) return null;
            return (
              <div key={item.id} className="card rounded-2xl overflow-hidden group">
                <Link href={`/shop/${p.id}`} className="block">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name_bn} className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="h-36 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl">🌿</div>
                  )}
                </Link>
                <div className="p-3">
                  <Link href={`/shop/${p.id}`} className="font-semibold text-sm text-slate-800 dark:text-slate-200 hover:text-green-600 line-clamp-1 block">{p.name_bn}</Link>
                  <p className="text-green-600 font-bold text-sm mt-0.5">{formatPrice(p.price)} / {p.unit}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => addToCart(p)} className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 transition-colors">কার্টে যোগ</button>
                    <button onClick={() => removeItem(item.id, p.id)} className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
