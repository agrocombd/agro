export const metadata = {
  title: "রিটার্ন ও রিফান্ড নীতি — agro.com.bd",
  description: "agro.com.bd-এর রিটার্ন ও রিফান্ড নীতিমালা। পণ্য ফেরত ও অর্থ ফেরতের সম্পূর্ণ নির্দেশিকা।",
};

export default function ReturnRefundPage() {
  return (
    <div className="container-app max-w-3xl py-10 lg:py-16">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">রিটার্ন ও রিফান্ড নীতি</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">সর্বশেষ আপডেট: এপ্রিল ২০২৬</p>

      <div className="prose-agro space-y-8 text-slate-700 dark:text-slate-300">

        <section className="card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">১. রিটার্নের সময়সীমা</h2>
          <p className="leading-relaxed">পণ্য ডেলিভারি পাওয়ার <strong>৭ (সাত) দিনের মধ্যে</strong> রিটার্নের আবেদন করতে হবে। পচনশীল পণ্য (তাজা সবজি, ফল, মাছ, মাংস) ডেলিভারির দিনেই সমস্যা জানাতে হবে — পরের দিন রিটার্ন গ্রহণযোগ্য নয়।</p>
        </section>

        <section className="card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">২. কোন পণ্য রিটার্ন করা যাবে</h2>
          <ul className="space-y-2">
            {[
              "ক্ষতিগ্রস্ত বা ভাঙা অবস্থায় পাওয়া পণ্য",
              "ভুল পণ্য ডেলিভারি হলে",
              "মেয়াদোত্তীর্ণ প্যাকেজড পণ্য",
              "বর্ণিত মানের চেয়ে উল্লেখযোগ্যভাবে নিম্নমানের পণ্য",
              "অর্ডার অনুযায়ী পরিমাণ কম থাকলে",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">৩. যেসব ক্ষেত্রে রিটার্ন প্রযোজ্য নয়</h2>
          <ul className="space-y-2">
            {[
              "তাজা পচনশীল পণ্য (৭ দিনের পর)",
              "ব্যবহৃত বা খোলা বীজ/সার প্যাকেট",
              "ক্রেতার অবহেলায় ক্ষতিগ্রস্ত পণ্য",
              "ব্যক্তিগত কারণে মত পরিবর্তন (মন না মিললে)",
              "ডেলিভারির সময় স্বাক্ষর দিয়ে গ্রহণ করা পণ্য যেখানে কোনো ক্ষতির উল্লেখ নেই",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">৪. রিটার্ন প্রক্রিয়া</h2>
          <ol className="space-y-3">
            {[
              { step: "আবেদন করুন", desc: "আপনার ড্যাশবোর্ডের অর্ডার বিবরণ থেকে 'রিটার্ন আবেদন করুন' বোতামে ক্লিক করুন অথবা আমাদের সাথে যোগাযোগ করুন।" },
              { step: "প্রমাণ দিন", desc: "ক্ষতিগ্রস্ত বা সমস্যাযুক্ত পণ্যের ছবি/ভিডিও পাঠান।" },
              { step: "যাচাই", desc: "আমরা ২৪-৪৮ ঘণ্টার মধ্যে আপনার আবেদন যাচাই করব এবং জানাব।" },
              { step: "পিকআপ", desc: "অনুমোদিত হলে বিক্রেতা বা আমাদের কুরিয়ার পার্টনার পণ্য সংগ্রহ করবে।" },
              { step: "রিফান্ড", desc: "পণ্য গৃহীত হওয়ার ৩-৭ কার্যদিবসের মধ্যে অর্থ ফেরত দেওয়া হবে।" },
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.step}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">৫. রিফান্ড পদ্ধতি</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500">📱</span>
              <p><strong>bKash / Nagad:</strong> মূল পেমেন্ট অ্যাকাউন্টে ৩-৫ কার্যদিবসে</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">🏦</span>
              <p><strong>ব্যাংক ট্রান্সফার:</strong> ৫-৭ কার্যদিবসে</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">💵</span>
              <p><strong>ক্যাশ অন ডেলিভারি অর্ডার:</strong> bKash বা ব্যাংক ট্রান্সফারে রিফান্ড (যোগাযোগ করুন)</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">🎁</span>
              <p><strong>স্টোর ক্রেডিট:</strong> বিকল্পভাবে পরবর্তী অর্ডারে ব্যবহারযোগ্য স্টোর ক্রেডিট নিতে পারবেন।</p>
            </div>
          </div>
        </section>

        <section className="card rounded-2xl p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <h2 className="text-lg font-bold text-green-800 dark:text-green-300 mb-3">যোগাযোগ করুন</h2>
          <p className="text-sm text-green-700 dark:text-green-400 mb-3">রিটার্ন বা রিফান্ড সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:</p>
          <div className="space-y-1 text-sm text-green-700 dark:text-green-400">
            <p>📧 support@agro.com.bd</p>
            <p>📞 +880-XXXX-XXXX (সকাল ৯টা – রাত ৯টা)</p>
            <p>💬 <a href="/contact" className="underline">যোগাযোগ ফর্ম</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
