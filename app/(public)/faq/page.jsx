"use client";
import { useState } from "react";

const FAQS = [
  {
    category: "অর্ডার ও ডেলিভারি",
    items: [
      { q: "অর্ডার করার পর কতদিনে ডেলিভারি পাবো?", a: "সাধারণত ঢাকার মধ্যে ১-২ কার্যদিবস এবং ঢাকার বাইরে ২-৪ কার্যদিবসের মধ্যে ডেলিভারি দেওয়া হয়। তবে বিক্রেতার ডেলিভারি জোন অনুযায়ী সময় কিছুটা ভিন্ন হতে পারে।" },
      { q: "ডেলিভারি চার্জ কত?", a: "৳১,০০০ বা তার বেশি অর্ডারে বিনামূল্যে ডেলিভারি। এর কম হলে সাধারণত ৳৬০-১২০ ডেলিভারি চার্জ প্রযোজ্য হয়, যা বিক্রেতা ও এলাকাভেদে ভিন্ন হয়।" },
      { q: "অর্ডার ট্র্যাক করবো কীভাবে?", a: "লগইন করে 'আমার অর্ডার' থেকে যেকোনো অর্ডারের বর্তমান অবস্থা দেখতে পারবেন। স্ট্যাটাস পরিবর্তন হলে আপনাকে জানানো হবে।" },
      { q: "অর্ডার বাতিল করা যাবে?", a: "অর্ডার 'অপেক্ষারত' বা 'নিশ্চিত' স্ট্যাটাসে থাকলে প্রোফাইল থেকে বাতিল করা যাবে। একবার পাঠানো হলে বাতিল সম্ভব নয়।" },
    ],
  },
  {
    category: "পেমেন্ট",
    items: [
      { q: "কোন কোন পেমেন্ট পদ্ধতি আছে?", a: "ক্যাশ অন ডেলিভারি (COD), bKash, Nagad এবং SSLCommerz (কার্ড পেমেন্ট) গ্রহণ করা হয়।" },
      { q: "তাজা পণ্যে কি ক্যাশ অন ডেলিভারি পাবো?", a: "না। পচনশীল ও তাজা পণ্যের জন্য শুধুমাত্র অনলাইন পেমেন্ট গ্রহণ করা হয় (bKash/Nagad/কার্ড)। এটি পণ্যের মান নিশ্চিত করতে আমাদের নীতি।" },
      { q: "পেমেন্ট নিরাপদ তো?", a: "হ্যাঁ, সমস্ত অনলাইন পেমেন্ট SSL এনক্রিপ্টেড। আমরা কোনো কার্ড তথ্য সংরক্ষণ করি না।" },
    ],
  },
  {
    category: "পণ্য ও মান",
    items: [
      { q: "পণ্যের মান কি নিশ্চিত?", a: "সব বিক্রেতাকে যাচাই করা হয় এবং পণ্য তালিকা অনুমোদন ছাড়া প্রকাশিত হয় না। তবুও কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।" },
      { q: "ভুল বা ক্ষতিগ্রস্ত পণ্য পেলে কি করবো?", a: "ডেলিভারির ২৪ ঘণ্টার মধ্যে contact@agro.com.bd-এ ছবিসহ জানান। আমরা রিফান্ড বা পুনরায় ডেলিভারির ব্যবস্থা করবো।" },
      { q: "পণ্যের মূল্য কি নির্ধারিত?", a: "প্রতিটি বিক্রেতা তাদের পণ্যের মূল্য নিজে নির্ধারণ করেন। বাজার মূল্যের সাথে তুলনা করে কেনাকাটা করুন।" },
    ],
  },
  {
    category: "বিক্রেতা হওয়া",
    items: [
      { q: "কীভাবে বিক্রেতা হবো?", a: "'বিক্রেতা হিসেবে নিবন্ধন করুন' পেজ থেকে সাইনআপ করুন। ব্যবসার তথ্য দিন এবং আমাদের টিম ১-২ কার্যদিবসে আপনার আবেদন পর্যালোচনা করবে।" },
      { q: "বিক্রেতা হতে কি ট্রেড লাইসেন্স লাগবে?", a: "রিটেইল বিক্রেতার জন্য ট্রেড লাইসেন্স ঐচ্ছিক। তবে B2B (পাইকারি) বিক্রেতার জন্য ট্রেড লাইসেন্স বাধ্যতামূলক।" },
      { q: "বিক্রির কমিশন কত?", a: "আমরা বর্তমানে কোনো কমিশন নিচ্ছি না। ভবিষ্যতে নীতিমালা পরিবর্তন হলে সব বিক্রেতাকে আগে জানানো হবে।" },
    ],
  },
  {
    category: "অ্যাকাউন্ট ও নিরাপত্তা",
    items: [
      { q: "পাসওয়ার্ড ভুলে গেলে কি করবো?", a: "লগইন পেজে 'পাসওয়ার্ড ভুলে গেছি' লিংকে ক্লিক করুন। ইমেইলে রিসেট লিংক পাঠানো হবে।" },
      { q: "অ্যাকাউন্ট ডিলিট করতে চাই, কি করবো?", a: "contact@agro.com.bd-এ ইমেইল করুন। আমরা ৭ কার্যদিবসের মধ্যে আপনার অ্যাকাউন্ট ও সকল তথ্য মুছে দেবো।" },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{q}</span>
        <span className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-45" : ""}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/></svg>
        </span>
      </button>
      {open && (
        <p className="text-sm text-slate-600 dark:text-slate-400 pb-4 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="container-app py-10 sm:py-14">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">সাধারণ জিজ্ঞাসা</h1>
          <p className="text-slate-500 dark:text-slate-400">আপনার প্রশ্নের উত্তর এখানে খুঁজুন। না পেলে <a href="/contact" className="text-green-600 hover:underline font-medium">আমাদের সাথে যোগাযোগ করুন</a>।</p>
        </div>

        <div className="space-y-6">
          {FAQS.map(section => (
            <div key={section.category} className="card rounded-2xl p-5">
              <h2 className="font-extrabold text-slate-900 dark:text-white mb-2">{section.category}</h2>
              <div>
                {section.items.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 card rounded-2xl p-6 text-center bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
          <p className="font-bold text-slate-800 dark:text-white mb-1">এখনো প্রশ্ন আছে?</p>
          <p className="text-sm text-slate-500 mb-4">আমাদের সাপোর্ট টিম সবসময় সাহায্য করতে প্রস্তুত।</p>
          <a href="/contact" className="btn-primary inline-flex">যোগাযোগ করুন</a>
        </div>
      </div>
    </div>
  );
}
