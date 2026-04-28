import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ForumPostClient from "./ForumPostClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("forum_posts").select("title").eq("id", id).single();
  return { title: data?.title ? `${data.title} — ফোরাম` : "পোস্ট" };
}

export const revalidate = 30;

export default async function ForumPostPage({ params }) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Increment view count
  await supabase.rpc("increment_post_view", { post_id: id }).catch(() => {});

  const { data: post } = await supabase
    .from("forum_posts")
    .select("*, profiles(full_name,avatar_url), forum_categories(name_bn,slug)")
    .eq("id", id)
    .eq("is_approved", true)
    .single();

  if (!post) notFound();

  const { data: replies } = await supabase
    .from("forum_replies")
    .select("id,content,created_at,is_solution,profiles(full_name,avatar_url)")
    .eq("post_id", id)
    .eq("is_approved", true)
    .order("created_at", { ascending: true });

  return <ForumPostClient post={post} initialReplies={replies || []} />;
}
