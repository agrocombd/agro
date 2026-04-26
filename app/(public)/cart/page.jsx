"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const toast = useToast();
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadCart();
    window.addEventListener("agro-cart-updated", loadCart);
    return () => window.removeEventListener("agro-cart-updated", loadCart);
  }, []);

  function loadCart() {
    try {
      setCart(JSON.parse(localStorage.getItem("agro-cart") || "[]"));
    } catch { setCart([]); }
  }

  function saveCart(updated) {
    localStorage.setItem("agro-cart", JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event("agro-cart-updated"));
  }

  function updateQty(id, qty) {
    if (qty < 1) { removeItem(id); return; }
    saveCart(cart.map(i => i.id === id ? { ...i, qty } : i));
  }

  function removeItem(id) {
    saveCart(cart.filter(i => i.id !== id));
    toast("পণ্য সরানো হয়েছে", "info");
  }

  function clearCart() {
    saveCart([]);
    toast("কার্ট খালি করা হয়েছে", "info");
  }

  if (!mounted) return null;

  const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const deliveryCharge = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  if (cart.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-7xl mb-6">🛒</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">আপনার কার্ট খালি</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">পছন্দের পণ্য কার্টে যোগ করুন</p>
        <Link href="/shop" className="inline-block rounded-xl bg-green-600 hover:bg-green-700 px-8 py-3 font-bold text-white transition-colors">
          শপিং শুরু করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          কার্ট <span className="text-slate-400 font-normal text-lg">({cart.length} পণ্য)</span>
        </h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">সব সরান</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="card rounded-2xl p-4 flex gap-4 items-start">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                {item.images?.[0] ? (
                  <Image src={item.images[0]} alt={item.name_bn} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🌱</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.id}`} className="font-semibold text-slate-800 dark:text-slate-200 hover:text-green-600 line-clamp-2 text-sm">
                  {item.name_bn}
                </Link>
                <p className="text-xs text-slate-400 mt-0.5">প্রতি {item.unit}</p>
                <p className="font-bold text-green-600 dark:text-green-400 mt-1">{formatPrice(item.price)}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button onClick={() => updateQty(item.id, (item.qty || 1) - 1)} className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">−</button>
                  <span className="px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white">{item.qty || 1}</span>
                  <button onClick={() => updateQty(item.id, (item.qty || 1) + 1)} className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">+</button>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(item.price * (item.qty || 1))}</p>
                <button onClick={() => removeItem(item.id)} className="text-xs text-red-400 hover:text-red-600">সরান</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card rounded-2xl p-5 sticky top-20 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">অর্ডার সারসংক্ষেপ</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>পণ্যের মূল্য</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>ডেলিভারি চার্জ</span>
                <span className={deliveryCharge === 0 ? "text-green-600 font-semibold" : ""}>
                  {deliveryCharge === 0 ? "বিনামূল্যে" : formatPrice(deliveryCharge)}
                </span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-xs text-slate-400">
                  ১,০০০ টাকার বেশি কিনলে ফ্রি ডেলিভারি
                </p>
              )}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-slate-900 dark:text-white text-base">
                <span>মোট</span>
                <span className="text-green-600 dark:text-green-400">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full rounded-xl bg-green-600 hover:bg-green-700 py-3.5 text-center font-bold text-white transition-colors"
            >
              চেকআউট করুন →
            </Link>

            <Link href="/shop" className="block w-full text-center text-sm text-green-600 dark:text-green-400 hover:underline">
              ← শপিং চালিয়ে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
