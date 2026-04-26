import { createAdminClient } from "@/lib/supabase-server";

export const metadata = {
  title: "আমাদের সম্পর্কে — Agro.com.bd",
  description: "বাংলাদেশের সেরা কৃষি মার্কেটপ্লেস। কৃষক ও ক্রেতার মধ্যে সেতুবন্ধন।",
};

export const revalidate = 3600;

export default async function AboutPage() {
  const supabase = createAdminClient();
  const { data: page } = await supabase.from("pages").select("content_bn,content_en").eq("slug", "about").single();

  return (
    <div className="container-app py-10 max-w-3xl">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">আমাদের সম্পর্কে</h1>
      {page?.content_bn ? (
        <div className="prose-agro text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {page.content_bn}
        </div>
      ) : (
        <div className="prose-agro space-y-4 text-slate-700 dark:text-slate-300">
          <p>Agro.com.bd বাংলাদেশের কৃষিখাতের জন্য একটি সমন্বিত ডিজিটাল প্ল্যাটফর্ম। আমরা কৃষক, বিক্রেতা ও ক্রেতাদের একটি নির্ভরযোগ্য ইকোসিস্টেমে সংযুক্ত করি।</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">আমাদের লক্ষ্য</h2>
          <p>বাংলাদেশের কৃষি ব্যবস্থাকে আধুনিক ও ডিজিটাল করে তোলা এবং কৃষকদের ন্যায্য মূল্য নিশ্চিত করা।</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">আমরা যা অফার করি</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>তাজা কৃষি পণ্যের খুচরা মার্কেটপ্লেস</li>
            <li>পাইকারি B2B বাণিজ্য প্ল্যাটফর্ম</li>
            <li>AI-চালিত কৃষি পরামর্শ সেবা</li>
            <li>কৃষক সম্প্রদায়ের ফোরাম</li>
          </ul>
        </div>
      )}
    </div>
  );
}
