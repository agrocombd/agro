"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-[#0a1a12] dark:via-[#0f0f23] dark:to-[#0a1a12] flex items-center justify-center p-5 relative overflow-hidden">
        <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-emerald-200/20 dark:bg-emerald-800/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-green-200/20 dark:bg-green-800/10 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 text-6xl opacity-15 animate-bounce" style={{ animationDuration: "4s" }}>🌾</div>
        <div className="absolute bottom-1/3 right-1/4 text-5xl opacity-15 animate-bounce" style={{ animationDelay: "2s", animationDuration: "4s" }}>🌱</div>

        <div className="relative text-center max-w-2xl">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 relative mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 shadow-lg">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-amber-300 dark:bg-amber-600 rotate-45" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-0.5 bg-amber-300 dark:bg-amber-600 -rotate-45" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-0.5 bg-amber-300 dark:bg-amber-600 rotate-90" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-2 h-14 bg-gradient-to-t from-amber-700 to-amber-500 rounded-full rotate-12" />
                <div className="absolute -top-2 -left-3 w-8 h-6 bg-amber-400 rounded-full opacity-70" />
                <div className="absolute -top-2 -right-3 w-8 h-6 bg-amber-500 rounded-full opacity-70" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-4xl">😟</div>
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            গুরুতর সমস্যা হয়েছে
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mb-2">Critical Error</p>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            অ্যাপ্লিকেশনে একটি গুরুতর সমস্যা হয়েছে। পেজটি রিফ্রেশ করুন।
          </p>

          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-700 hover:to-green-700 hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            পেজ রিফ্রেশ করুন
          </button>

          <div className="mt-10 pt-8 border-t border-emerald-100 dark:border-emerald-800/50">
            <div className="flex items-center justify-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">agro.com.bd</span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">বাংলাদেশের বিশ্বস্ত কৃষি মার্কেটপ্লেস</p>
          </div>
        </div>
      </body>
    </html>
  );
}
