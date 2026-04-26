"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, isValidBDPhone } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const PAYMENT_METHODS = [
  { id: "bkash", label: "বিকাশ", icon: "📱" },
  { id: "nagad", label: "নগদ", icon: "💚" },
  { id: "rocket", label: "রকেট", icon: "🚀" },
  { id: "card", label: "কার্ড", icon: "💳" },
  { id: "cod", label: "ক্যাশ অন ডেলিভারি", icon: "💵" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", address: "", city: "", note: "",
  });
  const [errors, setErrors] = useState({});

  // Check if cart has any perishable items (COD blocked)
  const hasPerishable = cart.some(i => i.is_perishable);
  const availablePayments = hasPerishable
    ? PAYMENT_METHODS.filter(m => m.id !== "cod")
    : PAYMENT_METHODS;

  useEffect(() => {
    setMounted(true);
    try { setCart(JSON.parse(localStorage.getItem("agro-cart") || "[]")); } catch { setCart([]); }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        const meta = data.user.user_metadata || {};
        setForm(f => ({
          ...f,
          full_name: meta.full_name || "",
          phone: meta.phone || "",
          email: data.user.email || "",
        }));
      }
    });
  }, []);

  // Auto-deselect COD if user had it selected and added perishable
  useEffect(() => {
    if (hasPerishable && paymentMethod === "cod") {
      setPaymentMethod("bkash");
    }
  }, [hasPerishable, paymentMethod]);

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = "নাম দিন";
    if (!isValidBDPhone(form.phone)) errs.phone = "সঠিক মোবাইল নম্বর দিন";
    if (!form.address.trim()) errs.address = "ঠিকানা দিন";
    if (!form.city.trim()) errs.city = "শহর/জেলা দিন";
    return errs;
  }

  async function handleOrder(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (cart.length === 0) { toast("কার্ট খালি", "error"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          shipping: form,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "অর্ডার দেওয়া যায়নি");

      localStorage.setItem("agro-cart", "[]");
      window.dispatchEvent(new Event("agro-cart-updated"));
      toast("অর্ডার সফল! ধন্যবাদ 🎉", "success");
      router.push(`/dashboard/orders/${data.order_id}`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-slate-500">কার্ট খালি। আগে পণ্য যোগ করুন।</p>
        <a href="/shop" className="mt-4 inline-block text-green-600 hover:underline">শপে যান →</a>
      </div>
    );
  }

  const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const deliveryCharge = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + deliveryCharge;

  return (
    <div className="container-app py-6 lg:py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">চেকআউট</h1>

      <form onSubmit={handleOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Delivery + Payment */}
          <div className="lg:col-span-2 space-y-5">
            {/* Delivery info */}
            <div className="card rounded-2xl p-5 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white">ডেলিভারি তথ্য</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="পূর্ণ নাম" value={form.full_name} onChange={e => update("full_name", e.target.value)} error={errors.full_name} required />
                <Input label="মোবাইল নম্বর" type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} error={errors.phone} placeholder="01XXXXXXXXX" required />
              </div>
              <Input label="ইমেইল (ঐচ্ছিক)" type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span></label>
                <textarea value={form.address} onChange={e => update("address", e.target.value)} placeholder="বাড়ি নম্বর, রাস্তা, এলাকা" rows={3} className="input-base resize-none" />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
              <Input label="শহর / জেলা" value={form.city} onChange={e => update("city", e.target.value)} error={errors.city} placeholder="যেমন: ঢাকা" required />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">বিশেষ নির্দেশনা (ঐচ্ছিক)</label>
                <textarea value={form.note} onChange={e => update("note", e.target.value)} placeholder="ডেলিভারি সংক্রান্ত কোনো বার্তা..." rows={2} className="input-base resize-none" />
              </div>
            </div>

            {/* Payment method */}
            <div className="card rounded-2xl p-5">
              <h2 className="font-bold text-slate-900 dark:text-white mb-4">পেমেন্ট পদ্ধতি</h2>

              {hasPerishable && (
                <div className="mb-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-4 py-3">
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    ⚡ আপনার কার্টে তাজা পণ্য আছে — ক্যাশ অন ডেলিভারি পাওয়া যাবে না
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availablePayments.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors ${
                      paymentMethod === m.id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span> {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="card rounded-2xl p-5 sticky top-20 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white">অর্ডার সারসংক্ষেপ</h2>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 truncate flex-1 mr-2">{item.name_bn} × {item.qty || 1}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{formatPrice(item.price * (item.qty || 1))}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>সাবটোটাল</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>ডেলিভারি</span>
                  <span className={deliveryCharge === 0 ? "text-green-600 font-semibold" : ""}>
                    {deliveryCharge === 0 ? "বিনামূল্যে" : formatPrice(deliveryCharge)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white text-base pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>সর্বমোট</span>
                  <span className="text-green-600 dark:text-green-400">{formatPrice(total)}</span>
                </div>
              </div>

              <Button type="submit" fullWidth loading={loading} className="py-4">
                অর্ডার নিশ্চিত করুন
              </Button>

              <p className="text-[11px] text-center text-slate-400">
                অর্ডার দিয়ে আপনি আমাদের{" "}
                <a href="/terms" className="text-green-600 hover:underline">শর্তাবলী</a> মেনে নিচ্ছেন
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
