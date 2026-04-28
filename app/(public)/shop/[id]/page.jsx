import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("name_bn,name_en,description_bn,images")
    .eq("id", id)
    .single();

  if (!product) return { title: "পণ্য পাওয়া যায়নি" };

  return {
    title: `${product.name_bn} — Agro.com.bd`,
    description: product.description_bn?.slice(0, 160) || product.name_bn,
    openGraph: {
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export const revalidate = 60;

export default async function ProductPage({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: product }, { data: reviews }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "*, categories(id,name_bn,slug,is_perishable), vendor_profiles(business_name, is_verified)"
      )
      .eq("id", id)
      .eq("is_active", true)
      .eq("is_approved", true)
      .single(),
    supabase
      .from("reviews")
      .select("id,rating,comment,created_at,profiles(full_name,avatar_url)")
      .eq("product_id", id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (!product) notFound();

  // Related products
  const { data: related } = await supabase
    .from("products")
    .select("id,name_bn,price,sale_price,images,unit")
    .eq("category_id", product.category_id)
    .eq("product_type", "retail")
    .eq("is_active", true)
    .eq("is_approved", true)
    .neq("id", product.id)
    .limit(8);

  return (
    <ProductDetailClient
      product={product}
      reviews={reviews || []}
      related={related || []}
    />
  );
}
