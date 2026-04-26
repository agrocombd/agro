import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase-server";
import ShopClient from "./ShopClient";
import { SkeletonCard } from "@/components/ui/Spinner";

export const metadata = {
  title: "শপ — সকল কৃষি পণ্য",
  description: "বাংলাদেশের সেরা কৃষি পণ্যের কালেকশন। তাজা সবজি, ফল, বীজ, সার, যন্ত্রপাতি।",
};

export const revalidate = 30;

async function getInitialData(searchParams) {
  const supabase = createAdminClient();
  const category = searchParams?.category;
  const featured = searchParams?.featured === "true";
  const q = searchParams?.q;

  let query = supabase
    .from("products")
    .select("id,name_bn,name_en,price,sale_price,images,unit,is_perishable,product_type,moq,category_id,categories(name_bn,slug)")
    .eq("is_active", true)
    .eq("is_approved", true)
    .eq("product_type", "retail")
    .order("created_at", { ascending: false })
    .limit(24);

  if (category) query = query.eq("categories.slug", category);
  if (featured) query = query.eq("is_featured", true);
  if (q) query = query.ilike("name_bn", `%${q}%`);

  const [productsRes, catsRes] = await Promise.all([
    query,
    supabase.from("categories").select("id,name_bn,name_en,slug,icon").eq("is_active", true).order("sort_order"),
  ]);

  return {
    products: productsRes.data || [],
    categories: catsRes.data || [],
  };
}

export default async function ShopPage({ searchParams }) {
  const { products, categories } = await getInitialData(searchParams);

  return (
    <div className="page-enter">
      <Suspense fallback={<ShopSkeleton />}>
        <ShopClient
          initialProducts={products}
          categories={categories}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="container-app py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
