"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

function Avatar({ profile, size = 40 }) {
  if (profile?.avatar_url) return <Image src={profile.avatar_url} alt="" width={size} height={size} className="rounded-full" />;
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm flex-shrink-0">
      {profile?.full_name?.[0] || "?"}
    </div>
  );
}

export default function ForumPostClient({ post, initialReplies }) {
  const toast = useToast();
  const [replies, setReplies] = useState(initialReplies);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast("উত্তর দিতে লগইন করুন", "error"); return; }

      const { data, error } = await supabase
        .from("forum_replies")
        .insert({ post_id: post.id, user_id: user.id, content: replyText.trim() })
        .select("id,content,created_at,profiles(full_name,avatar_url)")
        .single();

      if (error) throw error;
      setReplies(prev => [...prev, { ...data, is_solution: false }]);
      setReplyText("");
      toast("উত্তর পোস্ট করা হয়েছে", "success");
    } catch (err) {
      toast(err.message || "পোস্ট করা যায়নি", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-app py-6 lg:py-10 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/forum" className="hover:text-green-600">ফোরাম</Link>
        {post.forum_categories && (
          <><span>/</span><Link href={`/forum/category/${post.forum_categories.slug}`} className="hover:text-green-600">{post.forum_categories.name_bn}</Link></>
        )}
        <span>/</span><span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Post */}
      <div className="card rounded-2xl p-5 mb-6">
        <div className="flex gap-3 items-start mb-4">
          <Avatar profile={post.profiles} />
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{post.profiles?.full_name || "ব্যবহারকারী"}</p>
            <p className="text-xs text-slate-400">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">{post.title}</h1>
        <div className="prose-agro text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
          <span>👁 {post.view_count || 0} বার দেখা</span>
          <span>·</span>
          <span>💬 {replies.length} উত্তর</span>
          {post.forum_categories && <span className="rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-green-700 dark:text-green-400 font-medium">{post.forum_categories.name_bn}</span>}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-3 mb-6">
          <h2 className="font-bold text-slate-900 dark:text-white">{replies.length}টি উত্তর</h2>
          {replies.map((reply, i) => (
            <div key={reply.id} className={`card rounded-2xl p-4 ${reply.is_solution ? "border-2 border-green-500" : ""}`}>
              {reply.is_solution && (
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 mb-2">✓ সমাধান</div>
              )}
              <div className="flex gap-3 items-start">
                <Avatar profile={reply.profiles} size={36} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{reply.profiles?.full_name || "ব্যবহারকারী"}</p>
                    <span className="text-xs text-slate-400">{timeAgo(reply.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      <div className="card rounded-2xl p-5">
        <h2 className="font-bold text-slate-900 dark:text-white mb-3">উত্তর দিন</h2>
        <form onSubmit={submitReply} className="space-y-3">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="আপনার উত্তর বা মন্তব্য লিখুন..."
            rows={4}
            className="input-base resize-none w-full"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">উত্তর দিতে লগইন প্রয়োজন</p>
            <Button type="submit" loading={loading}>উত্তর পোস্ট করুন</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
