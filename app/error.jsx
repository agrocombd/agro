"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-[#0a1a12] dark:via-[#0f0f23] dark:to-[#0a1a12] flex items-center justify-center px-5 relative overflow-hidden">
      <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-red-200/10 dark:bg-red-800/5 blur-3xl" />
      <div className="absolute bottom-20 left-10 h-72 w-72 rounded-full bg-amber-200/10 dark:bg-amber-800/5 blur-3xl" />
      <div className="absolute top-1/4 left-1/4 text-6xl opacity-15 animate-pulse">⚠️</div>
      <div className="absolute bottom-1/3 right-1/4 text-5xl opacity-15 animate-pulse" style={{ animationDelay: "1s" }}>🌧️</div>

      <div className="relative text-center max-w-2xl">
        <div className="relative inline-block mb-8">
          <div className="w-40 h-40 md:w-48 md:h-48 relative mx-auto">
            {/* Storm cloud */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="w-24 h-16 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full shadow-lg" />
                <div className="absolute -left-6 top-4 w-16 h-12 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full" />
                <div className="absolute -right-6 top-4 w-16 h-12 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-4xl animate-pulse">⚡</div>
              </div>
            </div>
            {/* Wilted crops */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-3">
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-10 bg-gradient-to-t from-amber-700 to-amber-500 rounded-full rotate-[-15deg]" />
                <div className="w-6 h-6 bg-amber-400 rounded-full opacity-60 -mt-2 -ml-1" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-12 bg-gradient-to-t from-amber-700 to-amber-500 rounded-full" />
                <div className="w-7 h-7 bg-amber-500 rounded-full opacity-60 -mt-2" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-8 bg-gradient-to-t from-amber-700 to-amber-500 rounded-full rotate-[15deg]" />
                <div className="w-5 h-5 bg-amber-300 rounded-full opacity-60 -mt-2 -mr-1" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          কিছু একটা ঠিক হয়নি
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mb-2">Something Went Wrong</p>
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
          একটি অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন বা হোমে ফিরে যান।
        </p>

        {error?.digest && (
          <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-4 text-left max-w-sm mx-auto">
            <p className="text-xs text-red-500 dark:text-red-400 font-mono">Digest: {error.digest}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-700 hover:to-green-700 hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            আবার চেষ্টা করুন
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 px-8 py-4 text-base font-bold text-emerald-700 dark:text-emerald-400 transition-all duration-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:-translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            হোমে ফিরুন
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-emerald-100 dark:border-emerald-800/50">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">সাহায্য দরকার?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/ai-assistant" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-all hover:bg-emerald-100">
              <span>🤖</span> AI সহকারী
            </Link>
            <a href="mailto:support@agro.com.bd" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-all hover:bg-emerald-100">
              <span>📧</span> সাপোর্ট
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
