import { createAdminClient } from "@/lib/supabase-server";

export default async function sitemap() {
  const baseUrl = "https://agro.com.bd";

  const supabase = createAdminClient();
  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase.from("products").select("id,updated_at").eq("is_active", true).eq("is_approved", true).limit(500),
    supabase.from("forum_posts").select("id,updated_at").eq("is_approved", true).limit(200),
  ]);

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/b2b`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/ai-assistant`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/forum`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const productPages = (products || []).map(p => ({
    url: `${baseUrl}/shop/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const forumPages = (posts || []).map(p => ({
    url: `${baseUrl}/forum/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...forumPages];
}
