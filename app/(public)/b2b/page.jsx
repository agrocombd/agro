import { createAdminClient } from "@/lib/supabase-server";
import { Suspense } from "react";
import B2BClient from "./B2BClient";
import { SkeletonCard } from "@/components/ui/Spinner";

export const metadata = {
  title: "B2B পাইকারি — Agro.com.bd",
  description: "বাল্ক ক্রয় ও পাইকারি মূল্যে কৃষি পণ্য। MOQ ভিত্তিক অর্ডার, বিশ্বস্ত সরবরাহকারী।",
};

export const revalidate = 30;

async function getB2BData(searchParams) {
  const supabase = createAdminClient();
  const category = searchParams?.category;
  const q = searchParams?.q;

  let query = supabase
    .from("products")
    .select("id,name_bn,name_en,price,sale_price,images,unit,is_perishable,product_type,moq,category_id,categories(name_bn,slug,icon)")
    .eq("is_active", true)
    .eq("is_approved", true)
    .eq("product_type", "b2b")
    .order("created_at", { ascending: false })
    .limit(48);

  if (q) query = query.ilike("name_bn", `%${q}%`);

  const [productsRes, catsRes] = await Promise.all([
    query,
    supabase.from("categories").select("id,name_bn,slug,icon").eq("is_active", true).order("sort_order"),
  ]);

  return { products: productsRes.data || [], categories: catsRes.data || [] };
}

export default async function B2BPage({ searchParams }) {
  const { products, categories } = await getB2BData(searchParams);
  return (
    <div className="page-enter">
      <Suspense fallback={
        <div className="container-app py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      }>
        <B2BClient initialProducts={products} categories={categories} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
