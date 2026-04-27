import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { cart, shipping, payment_method } = await request.json();

  if (!cart?.length) return NextResponse.json({ error: "কার্ট খালি" }, { status: 400 });
  if (!shipping?.phone || !shipping?.address) {
    return NextResponse.json({ error: "ডেলিভারি তথ্য অসম্পূর্ণ" }, { status: 400 });
  }

  // Enforce: perishable products cannot use COD
  const supabase = createAdminClient();
  const productIds = cart.map(i => i.id);
  const { data: products } = await supabase
    .from("products")
    .select("id,is_perishable,price,sale_price,categories(is_perishable)")
    .in("id", productIds);

  const productMap = Object.fromEntries((products || []).map(p => [p.id, p]));
  const hasPerishable = cart.some(item => {
    const p = productMap[item.id];
    return p?.is_perishable || p?.categories?.is_perishable;
  });

  if (hasPerishable && payment_method === "cod") {
    return NextResponse.json({ error: "তাজা পণ্যে ক্যাশ অন ডেলিভারি পাওয়া যায় না" }, { status: 400 });
  }

  // Get authenticated user (optional — guest orders allowed)
  const userSupabase = await createServerSupabaseClient();
  const { data: { user } } = await userSupabase.auth.getUser();

  // Calculate totals
  const subtotal = cart.reduce((s, i) => {
    const p = productMap[i.id];
    const price = p?.sale_price || p?.price || i.price;
    return s + price * (i.qty || 1);
  }, 0);
  const delivery_charge = subtotal >= 1000 ? 0 : 60;
  const total_amount = subtotal + delivery_charge;

  const payment_type = payment_method === "cod" ? "cod" : "prepaid";
  const payment_status = payment_method === "cod" ? "pending" : "pending";

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id || null,
      status: "pending",
      payment_method,
      payment_type,
      payment_status,
      subtotal,
      delivery_charge,
      total_amount,
      shipping_name: shipping.full_name,
      shipping_phone: shipping.phone,
      shipping_email: shipping.email || null,
      shipping_address: shipping.address,
      shipping_city: shipping.city,
      note: shipping.note || null,
    })
    .select("id,order_number")
    .single();

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  // Create order items
  const items = cart.map(item => {
    const p = productMap[item.id];
    return {
      order_id: order.id,
      product_id: item.id,
      quantity: item.qty || 1,
      unit_price: p?.sale_price || p?.price || item.price,
      total_price: (p?.sale_price || p?.price || item.price) * (item.qty || 1),
    };
  });

  await supabase.from("order_items").insert(items);

  return NextResponse.json({ order_id: order.id, order_number: order.order_number }, { status: 201 });
}

export async function GET(request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });

  const { data, error } = await supabase
    .from("orders")
    .select("id,order_number,status,total_amount,payment_method,payment_status,created_at,order_items(quantity,unit_price,products(name_bn,images))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
