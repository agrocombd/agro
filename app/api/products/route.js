import { createAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "newest";
  const type = searchParams.get("type") || "retail";
  const featured = searchParams.get("featured") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") || "48"), 100);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = supabase
    .from("products")
    .select(
      "id,name_bn,name_en,price,sale_price,images,unit,is_perishable,product_type,moq,category_id,categories(id,name_bn,slug,icon)"
    )
    .eq("is_active", true)
    .eq("is_approved", true)
    .eq("product_type", type)
    .range(offset, offset + limit - 1);

  if (q) query = query.ilike("name_bn", `%${q}%`);
  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (featured) query = query.eq("is_featured", true);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || [], {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
