import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ForumPostClient from "./ForumPostClient";

export async function generateMetadata({ params }) {
  let supabase;
  try { supabase = createAdminClient(); } catch { supabase = null; }
  const { data } = await supabase.from("forum_posts").select("title").eq("id", params.id).single();
  return { title: data?.title ? `${data.title} — ফোরাম` : "পোস্ট" };
}

export const revalidate = 30;

export default async function ForumPostPage({ params }) {
  let supabase;
  try { supabase = createAdminClient(); } catch { supabase = null; }

  // Increment view count
  await supabase.rpc("increment_post_view", { post_id: params.id }).catch(() => {});

  const { data: post } = await supabase
    .from("forum_posts")
    .select("*, profiles(full_name,avatar_url), forum_categories(name_bn,slug)")
    .eq("id", params.id)
    .eq("is_approved", true)
    .single();

  if (!post) notFound();

  const { data: replies } = await supabase
    .from("forum_replies")
    .select("id,content,created_at,is_solution,profiles(full_name,avatar_url)")
    .eq("post_id", params.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  return <ForumPostClient post={post} initialReplies={replies || []} />;
}
