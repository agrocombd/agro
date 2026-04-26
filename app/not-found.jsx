"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-[#0a1a12] dark:via-[#0f0f23] dark:to-[#0a1a12] flex items-center justify-center px-5 relative overflow-hidden">
      <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-emerald-200/20 dark:bg-emerald-800/10 blur-3xl" />
      <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-green-200/20 dark:bg-green-800/10 blur-3xl" />

      <div className="absolute top-1/4 left-1/4 text-6xl opacity-20 animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }}>🌱</div>
      <div className="absolute top-1/3 right-1/4 text-5xl opacity-20 animate-bounce" style={{ animationDelay: "1s", animationDuration: "3s" }}>🌾</div>
      <div className="absolute bottom-1/3 left-1/3 text-4xl opacity-20 animate-bounce" style={{ animationDelay: "2s", animationDuration: "3s" }}>🌿</div>
      <div className="absolute bottom-1/4 right-1/3 text-5xl opacity-20 animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "3s" }}>🍃</div>

      <div className="relative text-center max-w-2xl">
        <div className="relative inline-block mb-8">
          <div className="text-[160px] md:text-[200px] font-black text-emerald-100 dark:text-emerald-900/30 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-36 md:h-36 relative">
              {/* Pot */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-16 md:w-24 md:h-20 bg-gradient-to-t from-amber-700 to-amber-600 rounded-b-3xl rounded-t-lg shadow-lg">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 md:w-28 h-4 bg-amber-800 rounded-full" />
              </div>
              {/* Wilted plant */}
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2">
                <div className="w-1.5 h-12 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full mx-auto" />
                <div className="absolute -top-2 -left-4 w-8 h-8 bg-emerald-400 rounded-full opacity-60 rotate-[-30deg] origin-bottom" />
                <div className="absolute -top-2 -right-4 w-8 h-8 bg-emerald-500 rounded-full opacity-60 rotate-[30deg] origin-bottom" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl font-bold text-emerald-500 dark:text-emerald-400 animate-pulse">?</div>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mb-2">Page Not Found</p>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
          এই পৃষ্ঠাটি সরানো হয়েছে, মুছে ফেলা হয়েছে বা কখনো তৈরি করা হয়নি।
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-700 hover:to-green-700 hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            হোমে ফিরুন
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 px-8 py-4 text-base font-bold text-emerald-700 dark:text-emerald-400 transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            শপিং করুন
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-emerald-100 dark:border-emerald-800/50">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">জনপ্রিয় পৃষ্ঠাগুলো:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "AI সহকারী", href: "/ai-assistant", icon: "🤖" },
              { name: "ফোরাম", href: "/forum", icon: "💬" },
              { name: "বীজ ও চারা", href: "/shop?category=seeds", icon: "🌱" },
              { name: "সার", href: "/shop?category=fertilizer", icon: "🧪" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-all duration-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
              >
                <span>{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
